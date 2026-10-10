(() => {
  "use strict";

  const config = window.CAMPUSHUB_SUPABASE_CONFIG;
  const sdk = window.supabase;
  const ready = Boolean(
    config &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url) &&
    config.anonKey &&
    !config.anonKey.includes("YOUR_") &&
    sdk?.createClient
  );
  const client = ready ? sdk.createClient(config.url, config.anonKey) : null;
  const tables = {
    announcements: "campus_announcements",
    schedules: "class_schedules",
    events: "academic_events",
    scheduleHistory: "schedule_history"
  };
  let lastSynced = null;

  function assertReady() {
    if (!client) throw new Error("Set your Supabase project URL and anon key in supabase-config.js, then run the SQL setup script.");
  }

  function unwrap(result) {
    if (result.error) throw result.error;
    return result.data;
  }

  function withoutAcknowledgments(item) {
    const { acknowledgments, ...payload } = item;
    return payload;
  }

  async function fetchRows(table) {
    return unwrap(await client.from(table).select("*"));
  }

  async function load(userId, isAdmin) {
    assertReady();
    const profileResult = await client.from("campus_profiles").select("*").eq("id", userId).maybeSingle();
    if (profileResult.error) throw profileResult.error;
    const ownProfile = profileResult.data;
    if (!ownProfile) {
      throw new Error("Your sign-in exists, but its CampusHub profile is missing. Run the profile repair SQL in README.md, then sign out and back in.");
    }
    if (!ownProfile.active) throw new Error("Your CampusHub account has been deactivated. Contact an administrator.");
    const [announcements, schedules, events, scheduleHistory, acknowledgments, profiles, memberships, sections] = await Promise.all([
      fetchRows(tables.announcements),
      fetchRows(tables.schedules),
      fetchRows(tables.events),
      fetchRows(tables.scheduleHistory),
      unwrap(await client.from("announcement_acknowledgments").select("announcement_id,user_id")),
      isAdmin || ownProfile.role === "admin" ? fetchRows("campus_profiles") : Promise.resolve([]),
      unwrap(await client.from("section_memberships").select("profile_id,section_id")),
      fetchRows("campus_sections")
    ]);
    const offerings = unwrap(await client.from("class_offerings").select("id,section_id,subject,course_code,active"));
    const offeringIds = offerings.map(offering => offering.id);
    const assignments = offeringIds.length
      ? unwrap(await client.from("offering_staff").select("offering_id,profile_id,staff_role").in("offering_id", offeringIds))
      : [];
    const [sectionOfficers, enrollments] = await Promise.all([
      unwrap(await client.from("section_officers").select("section_id,profile_id")),
      unwrap(await client.from("offering_enrollments").select("offering_id,profile_id"))
    ]);
    const offeringProfessors = (await Promise.all(offerings.map(async offering => {
      const professors = unwrap(await client.rpc("list_offering_professors", {
        p_offering_id: offering.id
      }));
      return professors.map(professor => ({ ...professor, offering_id: offering.id }));
    }))).flat();
    const studentCounts = await Promise.all(offerings.map(async offering => [
      offering.id,
      unwrap(await client.rpc("active_offering_student_count", { p_offering_id: offering.id }))
    ]));
    const acknowledgmentIds = new Map();
    acknowledgments.forEach(item => {
      if (!acknowledgmentIds.has(item.announcement_id)) acknowledgmentIds.set(item.announcement_id, []);
      acknowledgmentIds.get(item.announcement_id).push(item.user_id);
    });
    const values = {
      user: {
        id: ownProfile.id,
        name: ownProfile.full_name,
        email: ownProfile.email,
        role: ownProfile.role,
        active: ownProfile.active
      },
      users: (isAdmin || ownProfile.role === "admin") ? profiles.map(profile => ({
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role,
        active: profile.active
      })) : [],
      announcements: announcements.map(row => ({ ...row.payload, offeringId: row.offering_id, sectionId: row.section_id, archived: row.archived, acknowledgments: acknowledgmentIds.get(row.id) || [] })),
      schedules: schedules.map(row => ({ ...row.payload, offeringId: row.offering_id, sectionId: row.section_id })),
      events: events.map(row => ({ ...row.payload, offeringId: row.offering_id, sectionId: row.section_id })),
      scheduleHistory: scheduleHistory.map(row => ({ ...row.payload, offeringId: row.offering_id, sectionId: row.section_id })),
      membership: memberships.find(item => item.profile_id === userId) || null,
      sectionMemberships: memberships,
      sections,
      offerings,
      assignments,
      offeringProfessors,
      sectionOfficers,
      enrollments,
      studentCounts: Object.fromEntries(studentCounts)
    };
    lastSynced = structuredClone({
      announcements: announcements.map(({ id, section_id, offering_id, author_role, archived, payload }) => ({ id, section_id, offering_id, payload, author_role, archived })),
      schedules: schedules.map(({ id, section_id, offering_id, payload }) => ({ id, section_id, offering_id, payload })),
      events: events.map(({ id, section_id, offering_id, payload }) => ({ id, section_id, offering_id, payload })),
      scheduleHistory: scheduleHistory.map(({ id, section_id, offering_id, payload }) => ({ id, section_id, offering_id, payload }))
    });
    return values;
  }

  function rowsFor(tableName, items) {
    return items.map(item => {
      const payload = tableName === tables.announcements ? withoutAcknowledgments(item) : item;
      const row = { id: item.id, section_id: item.sectionId, offering_id: item.offeringId, payload };
      if (tableName === tables.announcements) {
        row.author_role = item.authorRole;
        row.archived = Boolean(item.archived);
      }
      return row;
    });
  }

  async function upsertChangedRows(table, rows, previousRows) {
    const previous = new Map(previousRows.map(row => [row.id, JSON.stringify(row)]));
    const changed = rows.filter(row => previous.get(row.id) !== JSON.stringify(row));
    for (let index = 0; index < changed.length; index += 100) {
      unwrap(await client.from(table).upsert(changed.slice(index, index + 100), { onConflict: "id" }));
    }
  }

  async function save(state) {
    assertReady();
    if (!client.auth.getUser) throw new Error("Supabase authentication is unavailable.");
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("Sign in again before saving changes.");
    const snapshot = {
      announcements: rowsFor(tables.announcements, state.announcements),
      schedules: rowsFor(tables.schedules, state.schedules),
      events: rowsFor(tables.events, state.events),
      scheduleHistory: rowsFor(tables.scheduleHistory, state.scheduleHistory)
    };
    const previous = lastSynced || Object.fromEntries(Object.keys(snapshot).map(key => [key, []]));
    for (const [key, table] of Object.entries(tables)) {
      await upsertChangedRows(table, snapshot[key], previous[key]);
    }
    lastSynced = structuredClone(snapshot);
  }

  async function deleteRecord(collection, id) {
    assertReady();
    if (!client.auth.getUser) throw new Error("Supabase authentication is unavailable.");
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("Sign in again before deleting records.");
    if (!Object.prototype.hasOwnProperty.call(tables, collection)) throw new Error("Unsupported academic record type.");
    const table = tables[collection];
    if (typeof id !== "string" || !id.trim()) throw new Error("A record ID is required.");

    const deleted = unwrap(await client.from(table).delete().eq("id", id).select("id"));
    if (!deleted.length) {
      const visible = unwrap(await client.from(table).select("id").eq("id", id).maybeSingle());
      if (visible) {
        throw new Error("The record still exists, but your account is not allowed to delete it. Check your role and subject assignment.");
      }
      throw new Error("The record no longer exists or is not visible to your account. Refresh the page and try again.");
    }
    if (lastSynced) {
      lastSynced[collection] = lastSynced[collection].filter(row => row.id !== id);
    }
  }

  async function redeemRoleKey(key) {
    assertReady();
    return unwrap(await client.rpc("redeem_campus_role_key", { p_key: key }));
  }

  async function acknowledge(announcementId) {
    assertReady();
    return unwrap(await client.rpc("acknowledge_campus_announcement", { p_announcement_id: announcementId }));
  }

  async function updateProfile(profile) {
    assertReady();
    return unwrap(await client.rpc("admin_update_campus_profile", {
      p_user_id: profile.id,
      p_full_name: profile.name,
      p_role: profile.role,
      p_active: profile.active
    }));
  }

  async function issueRoleKey(role) {
    assertReady();
    return unwrap(await client.rpc("issue_campus_role_key", { p_role: role }));
  }

  async function createSection(name) {
    assertReady();
    return unwrap(await client.rpc("create_campus_section", { p_name: name }));
  }

  async function duplicateSection(sectionId, name) {
    assertReady();
    return unwrap(await client.rpc("duplicate_campus_section", {
      p_section_id: sectionId,
      p_name: name
    }));
  }

  async function rotateSectionKey(sectionId) {
    assertReady();
    return unwrap(await client.rpc("rotate_campus_section_key", { p_section_id: sectionId }));
  }

  async function joinSection(key) {
    assertReady();
    return unwrap(await client.rpc("join_campus_section", { p_key: key }));
  }

  async function createOffering(sectionId, subject, courseCode) {
    assertReady();
    return unwrap(await client.rpc("create_class_offering", {
      p_section_id: sectionId,
      p_subject: subject,
      p_course_code: courseCode || ""
    }));
  }

  async function assignStaff(offeringId, profileId, role, assigned) {
    assertReady();
    return unwrap(await client.rpc("assign_offering_staff", {
      p_offering_id: offeringId,
      p_profile_id: profileId,
      p_staff_role: role,
      p_assigned: assigned
    }));
  }

  async function setSectionActive(sectionId, active) {
    assertReady();
    return unwrap(await client.rpc("set_campus_section_active", {
      p_section_id: sectionId,
      p_active: active
    }));
  }

  async function deleteSection(sectionId) {
    assertReady();
    return unwrap(await client.rpc("delete_campus_section", {
      p_section_id: sectionId
    }));
  }

  async function updateSection(sectionId, name) {
    assertReady();
    return unwrap(await client.rpc("update_campus_section", {
      p_section_id: sectionId,
      p_name: name
    }));
  }

  async function updateOffering(offeringId, subject, courseCode) {
    assertReady();
    return unwrap(await client.rpc("update_class_offering", {
      p_offering_id: offeringId,
      p_subject: subject,
      p_course_code: courseCode || ""
    }));
  }

  async function setOfferingActive(offeringId, active) {
    assertReady();
    return unwrap(await client.rpc("set_class_offering_active", {
      p_offering_id: offeringId,
      p_active: active
    }));
  }

  async function deleteOffering(offeringId) {
    assertReady();
    return unwrap(await client.rpc("delete_class_offering", {
      p_offering_id: offeringId
    }));
  }

  async function assignSectionOfficer(sectionId, profileId) {
    assertReady();
    return unwrap(await client.rpc("assign_section_officer", {
      p_section_id: sectionId,
      p_profile_id: profileId || null
    }));
  }

  async function setOfferingEnrollment(offeringId, profileId, enrolled) {
    assertReady();
    return unwrap(await client.rpc("set_offering_enrollment", {
      p_offering_id: offeringId,
      p_profile_id: profileId,
      p_enrolled: enrolled
    }));
  }

  async function setStudentClassAssignments(profileId, sectionId, offeringIds) {
    assertReady();
    return unwrap(await client.rpc("set_student_class_assignments", {
      p_profile_id: profileId,
      p_section_id: sectionId || null,
      p_offering_ids: offeringIds
    }));
  }

  async function setProfessorOfferings(profileId, offeringIds) {
    assertReady();
    return unwrap(await client.rpc("set_professor_offerings", {
      p_profile_id: profileId,
      p_offering_ids: offeringIds
    }));
  }

  async function setOfficerOfferings(profileId, offeringIds) {
    assertReady();
    return unwrap(await client.rpc("set_officer_offerings", {
      p_profile_id: profileId,
      p_offering_ids: offeringIds
    }));
  }

  async function changePassword(currentPassword, newPassword) {
    assertReady();
    const { data: userData, error: signInError } = await client.auth.getUser();
    if (signInError) throw signInError;
    if (!userData.user?.email) throw new Error("Please log in again to change your password.");
    const { error: verifyError } = await client.auth.signInWithPassword({ email: userData.user.email, password: currentPassword });
    if (verifyError) throw new Error("Your current password is incorrect.");
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  function watch(onChange) {
    assertReady();
    return client.channel("campushub-live-updates")
      .on("postgres_changes", { event: "*", schema: "public" }, onChange)
      .subscribe();
  }

  window.CampusHubStore = Object.freeze({
    ready,
    client,
    load,
    save,
    deleteRecord,
    redeemRoleKey,
    acknowledge,
    updateProfile,
    issueRoleKey,
    createSection,
    duplicateSection,
    rotateSectionKey,
    joinSection,
    createOffering,
    assignStaff,
    setSectionActive,
    deleteSection,
    updateSection,
    updateOffering,
    setOfferingActive,
    deleteOffering,
    assignSectionOfficer,
    setOfferingEnrollment,
    setStudentClassAssignments,
    setProfessorOfferings,
    setOfficerOfferings,
    changePassword,
    watch
  });
})();
