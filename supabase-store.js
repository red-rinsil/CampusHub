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
    const [announcements, schedules, events, scheduleHistory, acknowledgments, profiles, studentCount] = await Promise.all([
      fetchRows(tables.announcements),
      fetchRows(tables.schedules),
      fetchRows(tables.events),
      fetchRows(tables.scheduleHistory),
      unwrap(await client.from("announcement_acknowledgments").select("announcement_id,user_id")),
      isAdmin || ownProfile.role === "admin" ? fetchRows("campus_profiles") : Promise.resolve([]),
      unwrap(await client.rpc("active_campus_student_count"))
    ]);
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
      announcements: announcements.map(row => ({ ...row.payload, archived: row.archived, acknowledgments: acknowledgmentIds.get(row.id) || [] })),
      schedules: schedules.map(row => row.payload),
      events: events.map(row => row.payload),
      scheduleHistory: scheduleHistory.map(row => row.payload),
      studentCount
    };
    lastSynced = structuredClone({
      announcements: announcements.map(({ id, author_role, archived, payload }) => ({ id, payload, author_role, archived })),
      schedules: schedules.map(({ id, payload }) => ({ id, payload })),
      events: events.map(({ id, payload }) => ({ id, payload })),
      scheduleHistory: scheduleHistory.map(({ id, payload }) => ({ id, payload }))
    });
    return values;
  }

  function rowsFor(tableName, items) {
    return items.map(item => {
      const payload = tableName === tables.announcements ? withoutAcknowledgments(item) : item;
      const row = { id: item.id, payload };
      if (tableName === tables.announcements) {
        row.author_role = item.authorRole;
        row.archived = Boolean(item.archived);
      }
      return row;
    });
  }

  async function syncTable(table, rows, previousRows) {
    const previous = new Map(previousRows.map(row => [row.id, JSON.stringify(row)]));
    const changed = rows.filter(row => previous.get(row.id) !== JSON.stringify(row));
    for (let index = 0; index < changed.length; index += 100) {
      unwrap(await client.from(table).upsert(changed.slice(index, index + 100), { onConflict: "id" }));
    }
    const currentIds = new Set(rows.map(row => row.id));
    const removed = previousRows.filter(row => !currentIds.has(row.id)).map(row => row.id);
    for (let index = 0; index < removed.length; index += 100) {
      unwrap(await client.from(table).delete().in("id", removed.slice(index, index + 100)));
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
      await syncTable(table, snapshot[key], previous[key]);
    }
    lastSynced = structuredClone(snapshot);
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

  async function inviteUser(name, email) {
    assertReady();
    return unwrap(await client.functions.invoke("admin-create-user", {
      body: {
        name,
        email,
        redirectTo: window.location.href.split("#")[0]
      }
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
    redeemRoleKey,
    acknowledge,
    updateProfile,
    issueRoleKey,
    inviteUser,
    changePassword,
    watch
  });
})();
