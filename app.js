(() => {
  "use strict";

  const STORAGE_KEY = "campushub-state-v1";
  const roles = {
    student: { label: "Student", name: "Maya Chen" },
    professor: { label: "Professor", name: "Dr. Alex Morgan" },
    officer: { label: "Class Officer", name: "Jordan Lee" },
    admin: { label: "Administrator", name: "Campus Administrator" }
  };
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "grid" },
    { id: "subjects", label: "My subjects", icon: "book", professorOnly: true },
    { id: "announcements", label: "Announcements", icon: "bell" },
    { id: "timetable", label: "Class schedule", icon: "calendar" },
    { id: "exams", label: "Exam timetable", icon: "exam" },
    { id: "calendar", label: "Academic calendar", icon: "clock" },
    { id: "management", label: "User management", icon: "users", adminOnly: true },
    { id: "settings", label: "Account settings", icon: "settings" }
  ];
  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/>',
    exam: '<path d="M8 3h8l4 4v14H4V3h4Z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4L7.7 15a8 8 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9l.3-1.8H14l.3 1.8a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.8Z"/>'
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const datePlus = (days, hour = 9) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  const initialState = () => ({
    activeRole: "student",
    activeTab: "dashboard",
    announcementFilter: "All",
    currentUserId: null,
    studentCount: 0,
    membership: null,
    sectionMemberships: [],
    sections: [],
    offerings: [],
    assignments: [],
    offeringProfessors: [],
    sectionOfficers: [],
    enrollments: [],
    studentCounts: {},
    activeOfferingId: null,
    scheduleViewSectionId: null,
    examViewSectionId: null,
    calendarViewSectionId: null,
    showProfessorAnnouncementForm: false,
    roleKeys: [],
    users: [],
    announcements: [
      { id: "ann-1", title: "Midterm examination rooms confirmed", content: "The midterm for Data Structures will take place in Engineering Hall, rooms 204 and 205. Please arrive 15 minutes early and bring your student ID.", subject: "Data Structures", category: "Exam Notice", author: "Dr. Alex Morgan", authorRole: "professor", createdAt: datePlus(-1, 10), urgent: true, archived: false, acknowledgments: [] },
      { id: "ann-2", title: "Project proposal due this Friday", content: "Submit your group proposal through the course portal by 5:00 PM on Friday. Include each member's name and a short description of your approach.", subject: "Software Engineering", category: "Deadline", author: "Jordan Lee", authorRole: "officer", createdAt: datePlus(-2, 14), urgent: false, archived: false, acknowledgments: [] },
      { id: "ann-3", title: "Guest lecture in the main auditorium", content: "A reminder that our guest speaker joins us tomorrow. Regular class will meet in the main auditorium instead of Room 312.", subject: "Computer Science", category: "General", author: "Dr. Alex Morgan", authorRole: "professor", createdAt: datePlus(-3, 9), urgent: false, archived: false, acknowledgments: [] },
      { id: "ann-4", title: "Friday lab session cancelled", content: "The computer lab will be unavailable this Friday. A make-up session time will be shared as soon as it is confirmed.", subject: "Programming Lab", category: "Class Cancellation", author: "Jordan Lee", authorRole: "officer", createdAt: datePlus(-4, 11), urgent: true, archived: false, acknowledgments: [] }
    ],
    schedules: [
      { id: "sch-1", day: "Monday", start: "09:00", end: "10:30", subject: "Data Structures", instructor: "Dr. Alex Morgan", room: "Engineering 204" },
      { id: "sch-2", day: "Monday", start: "13:00", end: "14:30", subject: "Software Engineering", instructor: "Prof. Elena Ruiz", room: "Science 312" },
      { id: "sch-3", day: "Tuesday", start: "10:00", end: "11:30", subject: "Database Systems", instructor: "Dr. Kim Park", room: "Technology 108" },
      { id: "sch-4", day: "Wednesday", start: "09:00", end: "10:30", subject: "Data Structures", instructor: "Dr. Alex Morgan", room: "Engineering 204" },
      { id: "sch-5", day: "Wednesday", start: "14:00", end: "15:30", subject: "Programming Lab", instructor: "Prof. Elena Ruiz", room: "Computer Lab 2" },
      { id: "sch-6", day: "Thursday", start: "10:00", end: "11:30", subject: "Database Systems", instructor: "Dr. Kim Park", room: "Technology 108" },
      { id: "sch-7", day: "Friday", start: "09:00", end: "10:30", subject: "Software Engineering", instructor: "Prof. Elena Ruiz", room: "Science 312" }
    ],
    scheduleHistory: [
      { id: "hist-1", text: "Database Systems moved to Technology 108", actor: "Campus Administrator", at: datePlus(-2, 15) },
      { id: "hist-2", text: "Programming Lab room updated to Computer Lab 2", actor: "Jordan Lee", at: datePlus(-6, 12) }
    ],
    events: [
      { id: "evt-1", title: "Data Structures midterm", type: "Examination", subject: "Data Structures", date: datePlus(2, 10), location: "Engineering Hall 204", details: "Bring your student ID and arrive 15 minutes early." },
      { id: "evt-2", title: "Project proposal submission", type: "Project Deadline", subject: "Software Engineering", date: datePlus(4, 17), location: "Course portal", details: "Submit one proposal per group." },
      { id: "evt-3", title: "Database Systems quiz", type: "Quiz", subject: "Database Systems", date: datePlus(6, 9), location: "Technology 108", details: "Covers normalization and relational algebra." },
      { id: "evt-4", title: "Professor Morgan consultation hours", type: "Consultation", subject: "Data Structures", date: datePlus(8, 13), location: "Faculty Office 4B", details: "Drop in or book a 15-minute slot." },
      { id: "evt-5", title: "Programming Lab make-up session", type: "Special Class", subject: "Programming Lab", date: datePlus(10, 14), location: "Computer Lab 2", details: "Make-up session for the cancelled Friday lab." }
    ]
  });

  let state;
  let toastTimer;
  let syncQueue = Promise.resolve();
  let dataReady = false;
  let realtimeChannel = null;
  let bootstrappingUserId = null;
  const bootstrapWaiters = new Map();
  const content = document.getElementById("app-content");
  const nav = document.getElementById("primary-nav");
  const landingPage = document.getElementById("landing-page");
  const authenticatedApp = document.getElementById("authenticated-app");
  const authModal = document.getElementById("auth-modal");
  const accessModal = document.getElementById("access-modal");
  const sectionModal = document.getElementById("section-modal");
  const userEditModal = document.getElementById("user-edit-modal");
  const userEditModalContent = document.getElementById("user-edit-modal-content");
  const importModal = document.getElementById("import-modal");
  const authMessage = document.getElementById("auth-message");
  const accessMessage = document.getElementById("access-message");
  let pendingImport = null;

  function saveState({ reportErrors = true } = {}) {
    if (!dataReady || !currentUser()) return Promise.resolve();
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ activeTab: state.activeTab, announcementFilter: state.announcementFilter }));
    } catch (error) {
      console.error("CampusHub could not save browser preferences.", error);
    }
    const pendingSave = syncQueue.then(() => window.CampusHubStore.save(state));
    syncQueue = pendingSave.catch(error => {
      console.error("CampusHub could not save shared data.", error);
      if (reportErrors) showToast(error.message || "Your changes could not be saved to the shared database.", "error");
    });
    return pendingSave;
  }

  async function deleteSharedRecord(collection, id, afterDelete) {
    const pendingDelete = syncQueue.then(() => window.CampusHubStore.deleteRecord(collection, id));
    syncQueue = pendingDelete.catch(() => {});
    try {
      await pendingDelete;
      state[collection] = state[collection].filter(item => item.id !== id);
      if (afterDelete) afterDelete();
      render();
      void saveState();
      return true;
    } catch (error) {
      console.error(`CampusHub could not delete ${collection} record.`, error);
      showToast(error.message || "The record could not be deleted.", "error");
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function canManageAnnouncements() {
    return ["professor", "admin"].includes(state.activeRole) ||
      (state.activeRole === "officer" && announcementTargetOfferings().length > 0);
  }

  function canManageSchedules() {
    return ["professor", "admin"].includes(state.activeRole) ||
      (state.activeRole === "officer" && officerHasOffering(state.activeOfferingId));
  }

  function officerHasOffering(offeringId) {
    return state.activeRole === "officer" && state.assignments.some(assignment =>
      assignment.profile_id === state.currentUserId &&
      assignment.staff_role === "officer" &&
      assignment.offering_id === offeringId
    );
  }

  function canManageEvents() {
    return ["professor", "admin"].includes(state.activeRole);
  }

  function canManageAcrossOfferings() {
    return ["professor", "admin"].includes(state.activeRole);
  }

  function currentOffering() {
    return state.offerings.find(item => item.id === state.activeOfferingId && item.active &&
      state.sections.some(section => section.id === item.section_id && section.active)) || null;
  }

  function sectionsForViewing() {
    const accessibleSectionIds = new Set(availableOfferings().map(offering => offering.section_id));
    const sections = state.activeRole === "admin"
      ? state.sections.filter(section => section.active)
      : state.sections.filter(section => accessibleSectionIds.has(section.id) && section.active);
    return sections.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  function selectedViewSection(tab) {
    const sectionId = tab === "exams"
      ? state.examViewSectionId
      : tab === "calendar" ? state.calendarViewSectionId : state.scheduleViewSectionId;
    if (tab === "calendar" && sectionId === "all") return null;
    const sections = sectionsForViewing();
    return sections.find(section => section.id === sectionId) ||
      sections.find(section => section.id === currentOffering()?.section_id) ||
      sections[0] ||
      null;
  }

  function viewSectionSelector(tab, disabled = false) {
    if (!["admin", "professor"].includes(state.activeRole)) return "";
    const selectedSection = selectedViewSection(tab);
    const sections = sectionsForViewing();
    const selectedValue = tab === "calendar" && state.calendarViewSectionId === "all"
      ? "all"
      : selectedSection?.id || "";
    const allOption = tab === "calendar"
      ? `<option value="all" ${selectedValue === "all" ? "selected" : ""}>All</option>`
      : "";
    return `<label class="min-w-48 text-left text-xs font-semibold text-slate-600">View section<select class="form-control mt-1 w-full py-2 text-xs" data-view-section="${tab}" aria-label="Choose section to view" ${sections.length && !disabled ? "" : "disabled"}>${allOption}${sections.length ? sections.map(section => `<option value="${escapeHtml(section.id)}" ${section.id === selectedValue ? "selected" : ""}>${escapeHtml(section.name)}</option>`).join("") : '<option value="">No assigned sections</option>'}</select></label>`;
  }

  function sectionScoped(items, section) {
    if (!section) return [];
    return items.filter(item => item.sectionId === section.id ||
      (!item.sectionId && state.offerings.some(offering => offering.id === item.offeringId && offering.section_id === section.id)));
  }

  function studentSectionOfferings(section) {
    if (state.activeRole !== "student" || !section) return [];
    const enrolledOfferingIds = new Set(state.enrollments
      .filter(enrollment => enrollment.profile_id === state.currentUserId)
      .map(enrollment => enrollment.offering_id));
    return availableOfferings().filter(offering =>
      offering.section_id === section.id && enrolledOfferingIds.has(offering.id)
    );
  }

  function sectionRecordsForCurrentRole(items, section) {
    const records = sectionScoped(items, section);
    if (["admin", "professor"].includes(state.activeRole)) return records;
    if (state.activeRole === "student") {
      const enrolledOfferingIds = new Set(studentSectionOfferings(section).map(offering => offering.id));
      return records.filter(item => enrolledOfferingIds.has(item.offeringId));
    }
    return offeringScoped(records);
  }

  function offeringSelectionFields(selectedOfferingId, fixedSectionId = null) {
    const offerings = availableOfferings().filter(item => !fixedSectionId || item.section_id === fixedSectionId).sort((a, b) => {
      const sectionA = state.sections.find(section => section.id === a.section_id)?.name || "";
      const sectionB = state.sections.find(section => section.id === b.section_id)?.name || "";
      return sectionA.localeCompare(sectionB, undefined, { sensitivity: "base" }) ||
        a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" });
    });
    const selectedOffering = offerings.find(item => item.id === selectedOfferingId) || offerings[0];
    const sections = [...new Set(offerings.map(item => item.section_id))]
      .map(id => state.sections.find(section => section.id === id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    const sectionId = selectedOffering?.section_id || "";
    const fixedSection = Boolean(fixedSectionId);
    return `${fixedSection ? `<input type="hidden" name="sectionId" value="${escapeHtml(fixedSectionId)}">` : `<label class="block text-xs font-semibold text-slate-600">Section<select class="form-control mt-1.5" name="sectionId" data-offering-section-select required aria-label="Choose section" ${sections.length ? "" : "disabled"}><option value="">Select a section</option>${sections.map(section => `<option value="${escapeHtml(section.id)}" ${section.id === sectionId ? "selected" : ""}>${escapeHtml(section.name)}</option>`).join("")}</select></label>`}
      <label class="block text-xs font-semibold text-slate-600">Subject<select class="form-control mt-1.5" name="offeringId" data-offering-select required aria-label="Choose subject" ${selectedOffering ? "" : "disabled"}><option value="">${selectedOffering ? "Choose a subject" : "No subjects available"}</option>${offerings.filter(item => item.section_id === sectionId).map(offering => `<option value="${escapeHtml(offering.id)}" ${offering.id === selectedOffering?.id ? "selected" : ""}>${escapeHtml(offering.subject)}${offering.course_code ? ` (${escapeHtml(offering.course_code)})` : ""}</option>`).join("")}</select></label>`;
  }

  function availableOfferings() {
    return state.offerings.filter(offering => offering.active &&
      state.sections.some(section => section.id === offering.section_id && section.active));
  }

  function professorAssignedOfferings() {
    const assignedIds = new Set(state.assignments
      .filter(assignment => assignment.profile_id === state.currentUserId && assignment.staff_role === "professor")
      .map(assignment => assignment.offering_id));
    return availableOfferings().filter(offering => assignedIds.has(offering.id));
  }

  function professorAssignedSections() {
    const sectionIds = new Set(professorAssignedOfferings().map(offering => offering.section_id));
    return state.sections.filter(section => section.active && sectionIds.has(section.id))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  function offeringScoped(items) {
    return items.filter(item => item.offeringId === state.activeOfferingId);
  }

  function currentSection() {
    return state.sections.find(item => item.id === state.membership?.section_id) || null;
  }

  function persistActiveOffering() {
    if (!state.activeOfferingId) return;
    if (!state.currentUserId) return;
    try { localStorage.setItem(`campushub-active-offering:${state.currentUserId}`, state.activeOfferingId); }
    catch (error) { console.error("CampusHub could not save the selected class preference.", error); }
  }

  function assignedProfessorNames(offeringId) {
    return state.offeringProfessors
      .filter(item => item.offering_id === offeringId)
      .map(item => item.full_name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  function readActiveOfferingPreference(userId) {
    try {
      const saved = localStorage.getItem(`campushub-active-offering:${userId}`);
      if (saved) return saved;
      const legacy = sessionStorage.getItem("campushub-active-offering");
      if (legacy) localStorage.setItem(`campushub-active-offering:${userId}`, legacy);
      return legacy;
    } catch (error) {
      console.error("CampusHub could not read the selected class preference.", error);
      return null;
    }
  }

  function renderOfferingContext() {
    const select = document.getElementById("active-offering-select");
    const wrapper = document.getElementById("active-offering-wrapper");
    const joinButton = document.getElementById("join-section-button");
    const account = currentUser();
    const offerings = availableOfferings();
    wrapper.hidden = !account || offerings.length === 0;
    select.replaceChildren();
    select.value = "";
    offerings.forEach(offering => {
      const section = state.sections.find(item => item.id === offering.section_id);
      const option = document.createElement("option");
      option.value = offering.id;
      option.textContent = `${offering.subject}${offering.course_code ? ` (${offering.course_code})` : ""} — ${section?.name || "Section"}`;
      option.selected = offering.id === state.activeOfferingId;
      select.append(option);
    });
    if (state.activeOfferingId && offerings.some(offering => offering.id === state.activeOfferingId)) {
      select.value = state.activeOfferingId;
    }
    joinButton.hidden = !account || state.activeRole !== "student" || Boolean(state.membership);
  }

  function visibleCollections() {
    if (state.activeRole === "student") {
      return {
        announcements: announcementScopeForCurrentRole(),
        schedules: sectionRecordsForCurrentRole(state.schedules, section),
        events: sectionRecordsForCurrentRole(state.events, section),
        scheduleHistory: sectionRecordsForCurrentRole(state.scheduleHistory, section)
      };
    }
    return {
      announcements: announcementScopeForCurrentRole(),
      schedules: offeringScoped(state.schedules),
      events: offeringScoped(state.events),
      scheduleHistory: offeringScoped(state.scheduleHistory)
    };
  }

  function announcementScopeForCurrentRole() {
    if (state.activeRole === "admin") return state.announcements;
    if (state.activeRole === "student") {
      const section = currentSection();
      if (!section) return [];
      const enrolledOfferingIds = new Set(studentSectionOfferings(section).map(offering => offering.id));
      return state.announcements.filter(item =>
        enrolledOfferingIds.has(item.offeringId) ||
        (!item.offeringId && item.sectionId === section.id)
      );
    }
    const manageableOfferingIds = new Set(announcementTargetOfferings().map(offering => offering.id));
    return state.announcements.filter(item => manageableOfferingIds.has(item.offeringId));
  }

  function announcementCategory(item) {
    return item.category === item.subject ? "Subject" : item.category;
  }

  function groupAnnouncements(items) {
    const groups = new Map();
    items.forEach(item => {
      const key = JSON.stringify([
        item.title, item.content, item.author, item.authorRole, item.createdAt,
        item.urgent, item.archived, announcementCategory(item)
      ]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.values()].map(group => group.sort((a, b) =>
      announcementTargetLabel(a).localeCompare(announcementTargetLabel(b), undefined, { sensitivity: "base" })
    ));
  }

  function announcementTargetLabel(item) {
    const section = state.sections.find(entry => entry.id === item.sectionId) ||
      state.sections.find(entry => state.offerings.some(offering =>
        offering.id === item.offeringId && offering.section_id === entry.id
      ));
    return [section?.name, item.subject].filter(Boolean).join(" · ") || "Campus";
  }

  function canManageAnnouncementItem(item) {
    return (state.activeRole === "admin" ||
      (item.authorRole === state.activeRole &&
        announcementTargetOfferings().some(offering => offering.id === item.offeringId))) &&
      (state.activeRole !== "officer" || officerHasOffering(item.offeringId));
  }

  function activeUserId() {
    return state.currentUserId;
  }

  function currentUser() {
    return state.users.find(user => user.id === state.currentUserId && user.active) || null;
  }

  function updateRoleFromSession() {
    const user = currentUser();
    if (user) state.activeRole = user.role;
    return user;
  }

  function formatDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
    return new Intl.DateTimeFormat("en", options).format(new Date(value));
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  }

  function relativeDate(value) {
    const days = Math.round((new Date(value).setHours(0, 0, 0, 0) - today.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days > 1 && days < 7) return `In ${days} days`;
    if (days === -1) return "Yesterday";
    return formatDate(value, { month: "short", day: "numeric" });
  }

  function categoryClass(category) {
    return ({
      "General": "badge-general", "Exam Notice": "badge-exam", "Class Cancellation": "badge-cancellation",
      "Deadline": "badge-deadline", "Tertiary": "badge-tertiary", "Senior High": "badge-senior-high",
      "Quiz": "badge-quiz", "Project Deadline": "badge-project",
      "Consultation": "badge-consultation", "Special Class": "badge-class", "Examination": "badge-examination"
    })[category] || "badge-general";
  }

  function badge(category) {
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClass(category)}">${escapeHtml(category)}</span>`;
  }

  function button(label, action, extra = "", classes = "btn-secondary") {
    return `<button type="button" data-action="${action}" ${extra} class="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition hover:brightness-95 ${classes}">${label}</button>`;
  }

  function navIcon(name) {
    return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  }

  function renderNav() {
    nav.innerHTML = navItems.filter(item =>
      (!item.adminOnly || state.activeRole === "admin") &&
      (!item.professorOnly || state.activeRole === "professor")
    ).map(item => {
      return `<button type="button" class="nav-link ${state.activeTab === item.id ? "is-active" : ""}" data-tab="${item.id}">
        ${navIcon(item.icon)}<span>${item.label}</span>
      </button>`;
    }).join("");
  }

  function pageTitle() {
    const item = navItems.find(navItem => navItem.id === state.activeTab);
    return item ? item.label : "Dashboard";
  }

  function render() {
    const account = updateRoleFromSession();
    if (!account) {
      landingPage.hidden = false;
      authenticatedApp.hidden = true;
      return;
    }
    landingPage.hidden = true;
    authenticatedApp.hidden = false;
    if ((state.activeTab === "management" && state.activeRole !== "admin") ||
      (state.activeTab === "subjects" && state.activeRole !== "professor")) state.activeTab = "dashboard";
    document.getElementById("account-name").textContent = account.name;
    document.getElementById("account-role").textContent = `${roles[state.activeRole].label} · ${account.email}`;
    renderOfferingContext();
    document.getElementById("page-heading").textContent = pageTitle();
    renderNav();
    if (!availableOfferings().length && state.activeTab !== "settings" && !(state.activeTab === "management" && state.activeRole === "admin")) {
      const joinAction = state.activeRole === "student" && !state.membership
        ? button("Join a section", "open-section-join", "", "btn-primary")
        : "";
      content.innerHTML = `<section class="surface-card mx-auto max-w-2xl p-6 text-center sm:p-8"><p class="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">${state.activeRole === "admin" ? "Class setup" : "Class access"}</p><h2 class="mt-2 text-2xl font-bold">${state.activeRole === "student" && !state.membership ? "Join your section to get started" : "No subjects are available yet"}</h2><p class="mt-2 text-sm leading-6 text-slate-500">${state.activeRole === "student" && !state.membership ? "Enter the permanent section key provided by your school. Your section's subjects, schedules, exams, and announcements will then appear here." : "Ask an administrator to create subjects and assign you to them."}</p>${joinAction || (state.activeRole === "admin" ? button("Set up sections", "navigate", 'data-target="management"', "btn-primary") : "")}</section>`;
      return;
    }
    const pages = {
      dashboard: renderDashboard,
      subjects: renderProfessorSubjects,
      announcements: renderAnnouncements,
      timetable: renderTimetable,
      exams: renderExamTimetable,
      calendar: renderCalendar,
      management: renderManagement,
      settings: renderSettings
    };
    const section = state.sections.find(item => item.id === currentOffering()?.section_id);
    const context = state.activeTab !== "dashboard" && currentOffering() ? `<div class="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3"><div><p class="text-xs font-bold text-indigo-900">${escapeHtml(currentOffering().subject)}${currentOffering().course_code ? ` · ${escapeHtml(currentOffering().course_code)}` : ""}</p><p class="text-xs text-indigo-700">${escapeHtml(section?.name || "Section")}</p></div><p class="text-xs text-indigo-700">${state.activeRole === "student" ? "Section information" : "Managing assigned offering"}</p></div>` : "";
    content.innerHTML = context + (pages[state.activeTab] || renderDashboard)();
    renderUserEditModal();
  }

  function pageIntro(eyebrow, title, description, action = "") {
    return `<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>
      <p class="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">${eyebrow}</p>
      <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">${title}</h2>
      <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-500">${description}</p>
      </div>${action}</div>`;
  }

  function bulkScheduleActions() {
    if (!["professor", "admin"].includes(state.activeRole)) return "";
    return `<div class="flex flex-wrap gap-2">
      ${button("Import CSV / TXT", "open-import", "", "btn-primary")}
      ${button("Export schedules & exams", "export-schedules")}
    </div>`;
  }

  function canImportSchedules() {
    return ["professor", "admin"].includes(state.activeRole);
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadText(filename, text, mimeType = "text/csv;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportScheduleData() {
    if (!requireRole(["professor", "admin"])) return;
    const offering = currentOffering();
    if (!offering) return showToast("Select an assigned class before exporting.", "error");
    const scoped = visibleCollections();
    const header = ["Type", "Subject", "Professor", "Classroom", "DayOfWeek", "Time", "EndTime", "Date", "Title", "Details", "ImportedBy", "ImportedAt"];
    const rows = scoped.schedules.map(item => [
      "Class", item.subject, assignedProfessorNames(item.offeringId).join("; "), item.room, item.day, item.start, item.end, item.date || "", "", "",
      item.importedByName || item.importedBy || "", item.importedAt || ""
    ]);
    scoped.events.filter(item => ["Examination", "Quiz"].includes(item.type)).forEach(item => {
      const date = new Date(item.date);
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      rows.push([item.type, item.subject, item.instructor || "", item.location, "", time, "", localDate, item.title, item.details || "", item.importedByName || item.importedBy || "", item.importedAt || ""]);
    });
    downloadText("campushub-schedules-and-exams.csv", [header, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n"));
    showToast(`Exported ${scoped.schedules.length} classes and ${rows.length - scoped.schedules.length} exams/quizzes.`);
  }

  function openImportDialog() {
    if (!requireRole(["professor", "admin"])) return;
    pendingImport = null;
    document.getElementById("import-file").value = "";
    document.getElementById("import-preview").replaceChildren();
    document.getElementById("import-preview").classList.add("hidden");
    document.getElementById("import-message").classList.add("hidden");
    const commitButton = document.getElementById("commit-import");
    commitButton.disabled = true;
    commitButton.textContent = "Validate a file to continue";
    importModal.hidden = false;
    document.getElementById("import-file").focus();
  }

  function renderImportPreview(result) {
    const preview = document.getElementById("import-preview");
    const commitButton = document.getElementById("commit-import");
    preview.replaceChildren();
    preview.classList.remove("hidden");
    const summary = document.createElement("p");
    summary.className = "mb-2 font-semibold text-slate-800";
    const classes = result.records.filter(record => record.kind === "class").length;
    const exams = result.records.length - classes;
    summary.textContent = `${result.records.length} valid row(s): ${classes} class schedule(s), ${exams} exam/quiz record(s).${result.errors.length ? ` ${result.errors.length} row error(s).` : ""}`;
    preview.append(summary);
    if (result.errors.length) {
      const list = document.createElement("ul");
      list.className = "space-y-1 text-rose-700";
      result.errors.forEach(message => {
        const item = document.createElement("li");
        item.textContent = message;
        list.append(item);
      });
      preview.append(list);
    } else if (result.records.length) {
      const success = document.createElement("p");
      success.className = "text-emerald-700";
      success.textContent = "All rows passed validation.";
      preview.append(success);
    } else {
      const empty = document.createElement("p");
      empty.className = "text-amber-700";
      empty.textContent = "No data rows were found. Add at least one class, exam, or quiz row to the file.";
      preview.append(empty);
    }
    commitButton.disabled = result.records.length === 0;
    commitButton.textContent = result.records.length
      ? `Import ${result.records.length} valid row(s)`
      : "No valid rows to import";
  }

  async function applyBulkImport(result) {
    if (!requireRole(["professor", "admin"])) return;
    if (!result.records.length) {
      showToast("There are no valid rows to import.", "error");
      return;
    }
    const account = currentUser();
    const offering = currentOffering();
    if (!account || !offering) return showToast("Select an assigned class before importing.", "error");
    const commitButton = document.getElementById("commit-import");
    const previousSchedules = state.schedules;
    const previousEvents = state.events;
    const previousHistory = state.scheduleHistory;
    state.schedules = [...previousSchedules];
    state.events = [...previousEvents];
    state.scheduleHistory = [...previousHistory];
    commitButton.disabled = true;
    commitButton.textContent = "Importing…";
    const importedAt = new Date().toISOString();
    let classCount = 0;
    let examCount = 0;

    result.records.forEach(record => {
      if (record.kind === "class") {
        state.schedules.push({
          id: generateId("sch"),
          day: record.day,
          start: record.start,
          end: record.end,
          subject: record.subject,
          room: record.room,
          offeringId: offering.id,
          sectionId: offering.section_id,
          ...(record.date ? { date: record.date } : {}),
          importedBy: account.id,
          importedByName: account.name,
          importedAt
        });
        classCount += 1;
      } else {
        const localDateTime = new Date(`${record.date}T${record.time}:00`);
        state.events.push({
          id: generateId("evt"),
          title: record.title,
          type: record.type,
          subject: record.subject,
          date: localDateTime.toISOString(),
          location: record.room,
          details: record.details,
          instructor: record.instructor,
          offeringId: offering.id,
          sectionId: offering.section_id,
          importedBy: account.id,
          importedByName: account.name,
          importedAt
        });
        examCount += 1;
      }
    });

    if (classCount) recordScheduleChange(`${classCount} class schedule(s) imported from file`);
    try {
      await saveState({ reportErrors: false });
    } catch (error) {
      state.schedules = previousSchedules;
      state.events = previousEvents;
      state.scheduleHistory = previousHistory;
      commitButton.disabled = false;
      commitButton.textContent = `Import ${result.records.length} valid row(s)`;
      render();
      console.error("CampusHub could not save imported records.", error);
      showToast(error.message || "The imported records could not be saved.", "error");
      return;
    }
    pendingImport = null;
    importModal.hidden = true;
    render();
    const message = `Successfully imported ${classCount} class schedule(s) and ${examCount} exam/quiz record(s).`;
    showToast(result.errors.length ? `${message} ${result.errors.length} invalid row(s) were skipped.` : message);
  }

  document.getElementById("download-import-template").addEventListener("click", event => {
    event.preventDefault();
    downloadText("campushub-schedule-exam-template.csv", window.CampusHubImport.template());
  });

  document.querySelector("[data-close-import]").addEventListener("click", () => {
    importModal.hidden = true;
    pendingImport = null;
  });

  importModal.addEventListener("click", event => {
    if (event.target === importModal) {
      importModal.hidden = true;
      pendingImport = null;
    }
  });

  document.getElementById("import-file").addEventListener("change", async event => {
    if (!canImportSchedules()) return;
    const file = event.target.files?.[0];
    pendingImport = null;
    const preview = document.getElementById("import-preview");
    const commitButton = document.getElementById("commit-import");
    const message = document.getElementById("import-message");
    message.classList.add("hidden");
    commitButton.disabled = true;
    commitButton.textContent = "Validating file…";
    if (!file) {
      preview.classList.add("hidden");
      commitButton.textContent = "Validate a file to continue";
      return;
    }
    if (!/\.(csv|txt)$/i.test(file.name)) {
      renderImportPreview({ records: [], errors: ["Choose a .csv or .txt file."] });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      renderImportPreview({ records: [], errors: ["File exceeds the 2 MB import limit."] });
      return;
    }
    try {
      const result = window.CampusHubImport.parse(await file.text());
      const offering = currentOffering();
      if (!offering) {
        renderImportPreview({ records: [], errors: ["Select an assigned class before importing."] });
        return;
      }
      result.records = result.records.filter((record, index) => {
        let valid = true;
        if (record.subject.trim().toLocaleLowerCase() !== offering.subject.trim().toLocaleLowerCase()) {
          result.errors.push(`Imported record ${record.line || index + 1}: subject "${record.subject}" does not match selected subject "${offering.subject}".`);
          valid = false;
        }
        return valid;
      });
      if (result.records.length > 10000) {
        renderImportPreview({ records: [], errors: ["Files may contain no more than 10,000 valid rows."] });
        return;
      }
      pendingImport = result;
      renderImportPreview(result);
    } catch (error) {
      renderImportPreview({ records: [], errors: [error.message || "The file could not be parsed."] });
    }
  });

  document.getElementById("import-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!pendingImport?.records.length) return;
    applyBulkImport(pendingImport);
  });

  function renderDashboard() {
    const scoped = visibleCollections();
    const nextEvents = scoped.events.filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const activeAnnouncementGroups = groupAnnouncements(scoped.announcements.filter(item => !item.archived));
    const latestAnnouncements = activeAnnouncementGroups
      .sort((a, b) => new Date(b[0].createdAt) - new Date(a[0].createdAt))
      .slice(0, 3);
    const studentCount = state.studentCounts[state.activeOfferingId] || 0;
    const unread = activeAnnouncementGroups.filter(group =>
      group.some(item => !item.acknowledgments.includes(activeUserId()))
    ).length;
    const dashboardSection = state.sections.find(item => item.id === (state.membership?.section_id || currentOffering()?.section_id));
    return `${pageIntro("Your campus, at a glance", `Welcome back, ${escapeHtml((currentUser()?.name || roles[state.activeRole].name).split(" ")[0])}`, "Your classes, key dates, and the updates that matter — organized in one place.", bulkScheduleActions())}
      ${dashboardSection ? `<p class="mb-5 -mt-4 text-sm font-semibold text-indigo-700">${escapeHtml(dashboardSection.name)}</p>` : ""}
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        ${metricCard("Upcoming academic dates", nextEvents.length, "Across exams, quizzes & deadlines", "text-indigo-600", "calendar")}
        ${metricCard("Active announcements", activeAnnouncementGroups.length, "Updates for your classes", "text-violet-600", "bell")}
        ${metricCard("Unread updates", unread, "Not yet acknowledged by you", "text-amber-600", "clock")}
        ${metricCard("Students in this section", studentCount, "Enrolled in this section", "text-emerald-600", "users")}
      </div>
      <section class="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:p-6">
        <p class="text-xs font-bold uppercase tracking-[.14em] text-indigo-700">A more connected campus</p>
        <h3 class="mt-1 text-lg font-bold text-slate-900">No more searching across scattered channels.</h3>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Class changes buried in chats and exam dates spread across calendars make it easy to miss what matters. CampusHub brings schedules, deadlines, and official announcements together — with read acknowledgments so staff can see when important notices reach students.</p>
      </section>
      <div class="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <section class="surface-card p-5 sm:p-6">
          <div class="flex items-start justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-[.14em] text-indigo-600">Coming up</p><h3 class="mt-1 text-lg font-bold">Exams & deadlines</h3></div>${button("View calendar", "navigate", 'data-target="calendar"', "btn-secondary")}</div>
          <div class="mt-5 divide-y divide-slate-100">${nextEvents.length ? nextEvents.slice(0, 4).map(event => eventRow(event)).join("") : emptyState("You're all caught up", "No upcoming academic dates are scheduled.")}</div>
        </section>
        <section class="surface-card flex flex-col p-5 sm:p-6">
          <div class="flex items-start justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-[.14em] text-rose-600">Campus updates</p><h3 class="mt-1 text-lg font-bold">Latest announcements</h3></div>${button("All announcements", "navigate", 'data-target="announcements"', "btn-secondary")}</div>
          <div class="mt-5 flex flex-1 flex-col gap-3">${latestAnnouncements.length ? latestAnnouncements.map(group => {
            const item = group[0];
            const targets = [...new Set(group.map(announcementTargetLabel))];
            return `<article class="h-auto min-h-0 flex-1 rounded-xl border ${item.urgent ? "border-rose-100 bg-rose-50/60" : "border-slate-100 bg-slate-50/60"} p-4">
            <div class="flex items-center justify-between gap-2">${badge(announcementCategory(item))}<span class="text-xs text-slate-500">${relativeDate(item.createdAt)}</span></div>
            <h4 class="mt-3 text-sm font-bold text-slate-900">${escapeHtml(item.title)}</h4>
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">${escapeHtml(item.content)}</p>
            <p class="mt-2 text-[11px] text-slate-500">${escapeHtml(targets.join(", "))}</p>
          </article>`;
          }).join("") : emptyState("No announcements yet", "The latest campus updates will appear here.")}</div>
        </section>
      </div>
      <section class="surface-card mt-6 p-5 sm:p-6"><div class="flex items-start justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-[.14em] text-emerald-600">This week</p><h3 class="mt-1 text-lg font-bold">Your class schedule</h3></div>${button("Open timetable", "navigate", 'data-target="timetable"', "btn-secondary")}</div>
        <div class="mt-4 flex flex-wrap gap-2">${scoped.schedules.filter(item => item.day === new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date())).sort((a, b) => a.start.localeCompare(b.start)).map(item => `<div class="rounded-xl bg-slate-50 px-3 py-2.5"><p class="text-xs font-semibold text-indigo-700">${escapeHtml(item.start)} – ${escapeHtml(item.end)}</p><p class="mt-1 text-sm font-semibold">${escapeHtml(item.subject)}</p><p class="text-xs text-slate-500">${escapeHtml(item.room)}</p></div>`).join("") || '<p class="text-sm text-slate-500">No classes scheduled for today. Check the full timetable for the week.</p>'}</div>
      </section>`;
  }

  function metricCard(title, value, subtitle, color, iconName) {
    return `<article class="surface-card p-4 sm:p-5"><div class="flex items-start justify-between"><p class="text-sm font-medium text-slate-500">${title}</p><span class="${color}">${navIcon(iconName)}</span></div><p class="mt-4 text-3xl font-bold tracking-tight">${value}</p><p class="mt-1 text-xs text-slate-500">${subtitle}</p></article>`;
  }

  function eventRow(event, showSection = false) {
    const sectionName = state.sections.find(section => section.id === event.sectionId ||
      (!event.sectionId && state.offerings.some(offering => offering.id === event.offeringId && offering.section_id === section.id)))?.name;
    return `<div class="flex items-center gap-3 py-3.5"><div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><span class="text-[10px] font-bold uppercase">${escapeHtml(new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(event.date)))}</span><span class="text-lg font-bold leading-5">${new Date(event.date).getDate()}</span></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2">${badge(event.type)}<span class="text-xs text-slate-500">${escapeHtml(event.subject)}</span>${showSection && sectionName ? `<span class="text-xs font-medium text-indigo-600">${escapeHtml(sectionName)}</span>` : ""}</div><p class="mt-1 truncate text-sm font-semibold">${escapeHtml(event.title)}</p><p class="text-xs text-slate-500">${formatTime(event.date)} · ${escapeHtml(event.location)}</p></div><span class="hidden text-xs font-medium text-slate-500 sm:inline">${relativeDate(event.date)}</span></div>`;
  }

  function emptyState(title, description) {
    return `<div class="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center"><p class="text-sm font-semibold text-slate-700">${title}</p><p class="mt-1 text-xs text-slate-500">${description}</p></div>`;
  }

  function renderAnnouncements() {
    const scopedAnnouncements = announcementScopeForCurrentRole();
    const baseCategories = ["General", "Exam Notice", "Class Cancellation", "Deadline", "Tertiary", "Senior High"];
    const categories = ["All", ...new Set([
      ...baseCategories,
      "Subject",
      ...scopedAnnouncements.map(item => item.category).filter(Boolean)
    ])];
    const selectedFilter = categories.includes(state.announcementFilter) ? state.announcementFilter : "All";
    if (selectedFilter !== state.announcementFilter) state.announcementFilter = selectedFilter;
    const visibleAnnouncements = scopedAnnouncements.filter(item => !item.archived &&
      (selectedFilter === "All" ||
        (selectedFilter === "Subject" && announcementCategory(item) === "Subject") ||
        item.category === selectedFilter));
    const groups = groupAnnouncements(visibleAnnouncements)
      .sort((a, b) => new Date(b[0].createdAt) - new Date(a[0].createdAt));
    const archivedGroups = state.activeRole === "admin"
      ? groupAnnouncements(scopedAnnouncements.filter(item => item.archived))
        .sort((a, b) => new Date(b[0].createdAt) - new Date(a[0].createdAt))
      : [];
    const canCreate = canManageAnnouncements();
    return `${pageIntro("Stay in the loop", "Campus announcements", "Official updates, class changes, and important deadlines from your professors and class officers.", canCreate ? button("＋ Create announcement", "toggle-announcement-form", "", "btn-primary") : "")}
      <section class="surface-card p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 class="font-bold">Latest updates</h3><p class="mt-1 text-xs text-slate-500">${groups.length} ${groups.length === 1 ? "announcement" : "announcements"} for your accessible sections and subjects</p></div>
          <label class="flex items-center gap-2 text-xs font-medium text-slate-500">Filter <select id="announcement-filter" class="form-control w-auto py-2">${categories.map(category => `<option ${selectedFilter === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select></label>
        </div>
        ${state.showAnnouncementForm ? announcementForm(scopedAnnouncements.find(item => item.id === state.editingAnnouncement)) : ""}
        <div class="mt-4 space-y-4">${groups.length ? groups.map(announcementGroupCard).join("") : emptyState("No announcements here", "Try another filter or check back later.")}</div>
        ${state.activeRole === "admin" ? `<details class="mt-6 border-t border-slate-100 pt-4"><summary class="cursor-pointer text-sm font-semibold text-slate-600">Archived announcements (${archivedGroups.length})</summary><div class="mt-3 space-y-3">${archivedGroups.map(announcementGroup => `<div class="rounded-xl bg-slate-50 p-3"><p class="text-sm font-medium">${escapeHtml(announcementGroup[0].title)}</p><div class="mt-2 space-y-2">${announcementGroup.map(item => `<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><span>${escapeHtml(announcementTargetLabel(item))}</span>${button("Restore", "restore-announcement", `data-id="${item.id}"`)}</div>`).join("")}</div></div>`).join("") || '<p class="text-xs text-slate-500">No archived announcements.</p>'}</div></details>` : ""}
      </section>`;
  }

  function announcementForm(item = null) {
    const editing = Boolean(item);
    if (!editing) {
      const offerings = announcementTargetOfferings();
      return `<form id="announcement-form" class="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <div class="mb-4 flex items-center justify-between"><h4 class="font-bold">New announcement</h4>${button("Cancel", "cancel-announcement-form")}</div>
        <div class="grid gap-3 sm:grid-cols-2">
          ${field("Title", "title", "", "text", true)}
          <label class="block text-xs font-semibold text-slate-600">Category<select name="category" class="form-control mt-1.5" data-announcement-category required>${["General", "Exam Notice", "Class Cancellation", "Deadline", "Tertiary", "Senior High", "Subject"].map(value => `<option>${value}</option>`).join("")}</select></label>
          <p class="text-xs leading-5 text-slate-500 sm:col-span-2">Choose the target sections. Select Subject as the category to choose a subject subcategory.</p>
          ${announcementTargetFields(offerings)}
          ${announcementSubjectCategoryField(offerings)}
          <label class="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" name="urgent" class="h-4 w-4 rounded border-slate-300 text-indigo-600"> Mark as urgent</label>
          <label class="block text-xs font-semibold text-slate-600 sm:col-span-2">Announcement details<textarea name="content" class="form-control mt-1.5" rows="4" required></textarea></label>
        </div>
        <div class="mt-3 flex justify-end"><button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Publish announcement</button></div>
      </form>`;
    }
    const sectionName = state.sections.find(section => section.id === item.sectionId)?.name || "";
    const editingSubjectCategory = item.category === item.subject;
    const editOfferings = announcementTargetOfferings()
      .filter(offering => offering.section_id === item.sectionId)
      .sort((a, b) => a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" }));
    return `<form id="announcement-form" class="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div class="mb-4 flex items-center justify-between"><h4 class="font-bold">${editing ? "Edit announcement" : "New announcement"}</h4>${button("Cancel", "cancel-announcement-form")}</div>
      <input type="hidden" name="id" value="${editing ? escapeHtml(item.id) : ""}">
      <div class="grid gap-3 sm:grid-cols-2">
        ${field("Title", "title", item?.title, "text", true)}
        <p class="self-center text-xs font-medium text-slate-500">${escapeHtml(sectionName)}${item?.subject || currentOffering()?.subject ? ` · ${escapeHtml(item?.subject || currentOffering()?.subject)}` : ""}</p>
        <label class="block text-xs font-semibold text-slate-600">Category<select name="category" class="form-control mt-1.5" data-announcement-category required>${[...new Set(["General", "Exam Notice", "Class Cancellation", "Deadline", "Tertiary", "Senior High", "Subject", item.category])].map(value => `<option ${((value === "Subject" && editingSubjectCategory) || (value === item.category && !editingSubjectCategory)) ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
        <label class="block text-xs font-semibold text-slate-600 sm:col-span-2 ${editingSubjectCategory ? "" : "hidden"}" data-edit-subject-container>Subject subcategory<select name="subjectOfferingId" class="form-control mt-1.5" data-edit-subject-select ${editingSubjectCategory ? "required" : ""}>${editOfferings.map(offering => `<option value="${escapeHtml(offering.id)}" ${offering.id === item.offeringId ? "selected" : ""}>${escapeHtml(offering.subject)}${offering.course_code ? ` (${escapeHtml(offering.course_code)})` : ""}</option>`).join("")}</select></label>
        <label class="flex items-center gap-2 self-end pb-3 text-sm font-medium text-slate-700"><input type="checkbox" name="urgent" class="h-4 w-4 rounded border-slate-300 text-indigo-600" ${item?.urgent ? "checked" : ""}> Mark as urgent</label>
        <label class="block text-xs font-semibold text-slate-600 sm:col-span-2">Announcement details<textarea name="content" class="form-control mt-1.5" rows="4" required>${editing ? escapeHtml(item.content) : ""}</textarea></label>
      </div>
      <div class="mt-3 flex justify-end"><button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">${editing ? "Save changes" : "Publish announcement"}</button></div>
    </form>`;
  }

  function announcementTargetOfferings() {
    if (state.activeRole === "admin") return availableOfferings();
    if (state.activeRole === "professor") return professorAssignedOfferings();
    if (state.activeRole === "officer") return availableOfferings().filter(offering => officerHasOffering(offering.id));
    return [];
  }

  function announcementTargetFields(offerings) {
    const allSectionsLabel = state.activeRole === "admin" ? "All available sections" : "All assigned sections";
    const sections = [...new Set(offerings.map(offering => offering.section_id))]
      .map(sectionId => state.sections.find(section => section.id === sectionId))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    return `<div class="text-xs font-semibold text-slate-600 sm:col-span-2"><p>Target sections</p>
      <details class="group relative mt-1.5">
        <summary class="form-control flex cursor-pointer list-none items-center justify-between gap-2 py-2.5 font-normal">
          <span data-announcement-section-summary>Select sections</span><span aria-hidden="true" class="text-slate-400 group-open:rotate-180">⌄</span>
        </summary>
        <div class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <label class="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-medium text-indigo-700"><input type="checkbox" name="allSections" value="all" data-announcement-all-sections class="h-4 w-4 rounded border-slate-300 text-indigo-600"> ${allSectionsLabel}</label>
          <div class="mt-2 space-y-2">${sections.map(section => `<label class="flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-slate-700">
            <input type="checkbox" name="sectionIds" value="${escapeHtml(section.id)}" data-announcement-section class="h-4 w-4 rounded border-slate-300 text-indigo-600"> ${escapeHtml(section.name)}
          </label>`).join("") || '<p class="py-2 text-xs font-normal text-slate-500">No sections are available for your role.</p>'}</div>
        </div>
      </details>
    </div>`;
  }

  function announcementSubjectCategoryField(offerings) {
    return `<label class="hidden block text-xs font-semibold text-slate-600 sm:col-span-2" data-subject-category-container>
      Subject subcategory<select name="subjectCategory" class="form-control mt-1.5" data-subject-category-select disabled>
        <option value="">Select sections first</option>${[...new Set(offerings.map(offering => offering.subject))]
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
          .map(subject => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join("")}
      </select>
    </label>`;
  }

  function updateAnnouncementTargetUI(form, offerings = announcementTargetOfferings()) {
    const allSections = form.elements.allSections;
    const sectionChecks = [...form.querySelectorAll("[data-announcement-section]")];
    const selectedSectionIds = allSections?.checked
      ? [...new Set(offerings.map(offering => offering.section_id))]
      : sectionChecks.filter(check => check.checked).map(check => check.value);
    sectionChecks.forEach(check => {
      check.disabled = Boolean(allSections?.checked);
    });

    const summary = form.querySelector("[data-announcement-section-summary]");
    if (summary) {
      const names = selectedSectionIds
        .map(id => state.sections.find(section => section.id === id)?.name)
        .filter(Boolean);
      summary.textContent = allSections?.checked
        ? `All sections (${names.length})`
        : names.length > 1 ? `${names.length} sections selected` : names[0] || "Select sections";
    }

    const category = form.elements.category?.value;
    const subjectContainer = form.querySelector("[data-subject-category-container]");
    const subjectSelect = form.querySelector("[data-subject-category-select]");
    if (!subjectContainer || !subjectSelect) return;

    const showingSubject = category === "Subject";
    subjectContainer.classList.toggle("hidden", !showingSubject);
    subjectSelect.disabled = !showingSubject;
    subjectSelect.required = showingSubject;
    if (!showingSubject) return;

    const availableSubjects = selectedSectionIds.length && selectedSectionIds.every(sectionId =>
      offerings.some(offering => offering.section_id === sectionId)
    )
      ? [...new Set(offerings
        .filter(offering => selectedSectionIds.every(sectionId =>
          offerings.some(candidate => candidate.section_id === sectionId && candidate.subject === offering.subject)
        ))
        .map(offering => offering.subject))]
      : [];
    const previousValue = subjectSelect.value;
    subjectSelect.replaceChildren(new Option(
      availableSubjects.length ? "Choose a subject" : "Choose sections with a shared subject",
      ""
    ));
    availableSubjects
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .forEach(subject => subjectSelect.add(new Option(subject, subject)));
    subjectSelect.value = availableSubjects.includes(previousValue) ? previousValue : "";
  }

  function announcementTargetsFromForm(form, offerings) {
    const allSections = form.elements.allSections.checked;
    const sectionIds = allSections
      ? [...new Set(offerings.map(offering => offering.section_id))]
      : [...form.querySelectorAll("[data-announcement-section]:checked")].map(input => input.value);
    if (!sectionIds.length) {
      showToast("Choose at least one section or select all sections available to your role.", "error");
      return null;
    }
    const subject = form.elements.category.value === "Subject" ? form.elements.subjectCategory.value : null;
    if (form.elements.category.value === "Subject" && !subject) {
      showToast("Choose a subject subcategory for this announcement.", "error");
      return null;
    }
    const targets = sectionIds.map(sectionId => offerings
      .filter(offering => offering.section_id === sectionId && (!subject || offering.subject === subject))
      .sort((a, b) => a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" }))[0]);
    if (targets.some(target => !target)) {
      showToast("The selected subject is not available in every selected section. Choose fewer sections or another subject.", "error");
      return null;
    }
    return targets;
  }

  function publishAnnouncements({ targets, title, category, content: announcementContent, urgent, authorRole }) {
    const createdAt = new Date().toISOString();
    targets.forEach(targetOffering => {
      state.announcements.unshift({
        id: generateId("ann"),
        title,
        subject: targetOffering.subject,
        category: category === "Subject" ? targetOffering.subject : category,
        content: announcementContent,
        urgent,
        author: currentUser()?.name || roles[authorRole].name,
        authorRole,
        createdAt,
        archived: false,
        acknowledgments: [],
        offeringId: targetOffering.id,
        sectionId: targetOffering.section_id
      });
    });
    saveState();
    render();
    showToast(`Announcement published to ${targets.length} ${targets.length === 1 ? "section" : "sections"}.`);
  }

  function professorAnnouncementForm() {
    const offerings = professorAssignedOfferings();
    return `<form id="professor-announcement-form" class="surface-card mb-5 border-indigo-100 bg-indigo-50/30 p-4">
      <div class="mb-4 flex items-center justify-between"><div><h3 class="font-bold">New announcement</h3><p class="mt-1 text-xs text-slate-500">Choose target sections. Select Subject as the category to choose a subject subcategory.</p></div>${button("Cancel", "cancel-professor-announcement-form")}</div>
      <div class="grid gap-3 sm:grid-cols-2">
        ${field("Title", "title", "", "text", true)}
        <label class="block text-xs font-semibold text-slate-600">Category<select name="category" class="form-control mt-1.5" data-announcement-category required>${["General", "Exam Notice", "Class Cancellation", "Deadline", "Tertiary", "Senior High", "Subject"].map(value => `<option>${value}</option>`).join("")}</select></label>
        ${announcementTargetFields(offerings)}
        ${announcementSubjectCategoryField(offerings)}
        <label class="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" name="urgent" class="h-4 w-4 rounded border-slate-300 text-indigo-600"> Mark as urgent</label>
        <label class="block text-xs font-semibold text-slate-600 sm:col-span-2">Announcement details<textarea name="content" class="form-control mt-1.5" rows="4" required></textarea></label>
      </div>
      <div class="mt-3 flex justify-end"><button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Publish announcement</button></div>
    </form>`;
  }

  function renderProfessorSubjects() {
    const offerings = professorAssignedOfferings().sort((a, b) => {
      const sectionA = state.sections.find(section => section.id === a.section_id)?.name || "";
      const sectionB = state.sections.find(section => section.id === b.section_id)?.name || "";
      return sectionA.localeCompare(sectionB, undefined, { sensitivity: "base" }) ||
        a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" });
    });
    const groups = professorAssignedSections().map(section => ({
      section,
      offerings: offerings.filter(offering => offering.section_id === section.id)
    }));
    return `${pageIntro("Teaching", "My subjects", "Review every subject assigned to you and manage announcements for one or more of your sections.", button("＋ Create announcement", "toggle-professor-announcement-form", "", "btn-primary"))}
      ${state.showProfessorAnnouncementForm ? professorAnnouncementForm() : ""}
      <section class="grid gap-4 md:grid-cols-2">${groups.map(({ section, offerings: sectionOfferings }) => `<article class="surface-card p-5">
        <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-[.14em] text-indigo-600">Section</p><h3 class="mt-1 text-lg font-bold">${escapeHtml(section.name)}</h3></div><div class="flex gap-2">${button("Schedule", "open-professor-section", `data-section-id="${escapeHtml(section.id)}" data-view="timetable"`)}${button("Calendar", "open-professor-section", `data-section-id="${escapeHtml(section.id)}" data-view="calendar"`)}</div></div>
        <ul class="mt-4 divide-y divide-slate-100">${sectionOfferings.map(offering => `<li class="flex items-center justify-between gap-3 py-3"><div><p class="text-sm font-semibold text-slate-800">${escapeHtml(offering.subject)}</p>${offering.course_code ? `<p class="mt-0.5 text-xs text-slate-500">${escapeHtml(offering.course_code)}</p>` : ""}</div>${button("Announce", "announce-for-offering", `data-offering-id="${escapeHtml(offering.id)}"`, "btn-secondary")}</li>`).join("")}</ul>
      </article>`).join("") || `<section class="surface-card p-5 md:col-span-2">${emptyState("No subjects assigned", "Ask an administrator to assign you to a subject.")}</section>`}</section>`;
  }

  function announcementGroupCard(group) {
    const item = group[0];
    const category = announcementCategory(item);
    const acknowledged = group.every(entry => entry.acknowledgments.includes(activeUserId()));
    const targets = [...new Set(group.map(announcementTargetLabel))];
    const targetDetails = group.map(entry => {
      const totalStudents = state.studentCounts[entry.offeringId] || 0;
      const canEdit = canManageAnnouncementItem(entry);
      return `<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
        <div><p class="text-xs font-semibold text-slate-700">${escapeHtml(announcementTargetLabel(entry))}</p><p class="text-[11px] text-slate-500">${entry.acknowledgments.length}/${totalStudents} students acknowledged</p></div>
        ${canEdit ? `<div class="flex gap-1">${button("Edit", "edit-announcement", `data-id="${entry.id}"`)}${button("Archive", "archive-announcement", `data-id="${entry.id}"`)}${button("Delete", "delete-announcement", `data-id="${entry.id}"`, "btn-danger")}</div>` : ""}
      </div>`;
    }).join("");
    return `<article class="rounded-xl border ${item.urgent ? "border-rose-200" : "border-slate-200"} p-4 sm:p-5">
      <div class="flex flex-wrap items-center gap-2">${badge(category)}${item.urgent ? '<span class="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Urgent</span>' : ""}<span class="ml-auto text-xs text-slate-500">${relativeDate(item.createdAt)} · ${escapeHtml(formatTime(item.createdAt))}</span></div>
      <h3 class="mt-3 text-lg font-bold tracking-tight">${escapeHtml(item.title)}</h3><p class="mt-1 text-xs font-medium text-slate-500">Posted by ${escapeHtml(item.author)}</p>
      <p class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">${escapeHtml(item.content)}</p>
      <div class="mt-3 flex flex-wrap gap-1.5">${targets.map(target => `<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">${escapeHtml(target)}</span>`).join("")}</div>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span class="text-xs font-medium text-slate-500">${group.length === 1 ? `${item.acknowledgments.length}/${state.studentCounts[item.offeringId] || 0} students acknowledged` : `${group.length} target copies · acknowledgment counts shown per target`}</span>
        <div class="flex flex-wrap gap-2">
          ${state.activeRole === "student" ? button(acknowledged ? "✓ Acknowledged" : "Mark as read", "acknowledge-announcement-group", `data-ids="${group.map(entry => escapeHtml(entry.id)).join(",")}" ${acknowledged ? "disabled" : ""}`, acknowledged ? "btn-done" : "btn-primary") : ""}
        </div>
      </div>
      ${group.length > 1 && state.activeRole !== "student" ? `<details class="mt-3"><summary class="cursor-pointer text-xs font-semibold text-indigo-700">Manage target copies (${group.length})</summary><div class="mt-2 space-y-2">${targetDetails}</div></details>` : ""}
      ${group.length === 1 && state.activeRole !== "student" && canManageAnnouncementItem(item) ? `<div class="mt-3 flex justify-end gap-2">${button("Edit", "edit-announcement", `data-id="${item.id}"`)}${button("Archive", "archive-announcement", `data-id="${item.id}"`)}${button("Delete", "delete-announcement", `data-id="${item.id}"`, "btn-danger")}</div>` : ""}
    </article>`;
  }

  function renderTimetable() {
    const section = selectedViewSection("timetable");
    const schedules = sectionRecordsForCurrentRole(state.schedules, section);
    const history = sectionRecordsForCurrentRole(state.scheduleHistory, section);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const canEdit = canManageSchedules();
    const times = [...new Set(schedules.map(item => item.start))].sort();
    const actions = `<div class="flex flex-wrap items-end gap-2">${viewSectionSelector("timetable", Boolean(state.editingSchedule))}${canEdit ? button("＋ Add class", "toggle-schedule-form", "", "btn-primary") : ""}${bulkScheduleActions()}</div>`;
    const preferredOfferingId = state.offerings.find(offering => offering.section_id === section?.id && offering.active)?.id || state.activeOfferingId;
    return `    ${pageIntro("Plan your week", "Class schedule", "A clear view of your weekly subjects, assigned professors, classrooms, and recent changes.", actions)}
      ${state.showScheduleForm ? scheduleForm(schedules.find(item => item.id === state.editingSchedule), preferredOfferingId, section?.id) : ""}
      ${times.length ? `<section class="surface-card overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-[960px] border-collapse text-left"><thead><tr class="bg-slate-50"><th class="w-28 border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>${days.map(day => `<th class="min-w-40 border-b border-slate-200 px-4 py-3 text-xs font-bold text-slate-500">${day}</th>`).join("")}</tr></thead><tbody>${times.map(time => `<tr class="border-b border-slate-100 last:border-0"><th class="whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-700">${escapeHtml(time)}</th>${days.map(day => {
        const matches = schedules.filter(item => item.day === day && item.start === time);
        return `<td class="min-w-44 px-2 py-2 align-top">${matches.map(item => {
          const assignedProfessors = assignedProfessorNames(item.offeringId);
          const professorNames = assignedProfessors.length
            ? assignedProfessors.join(", ")
            : item.offeringId ? "No professor assigned" : item.instructor || "No professor assigned";
          return `<div class="rounded-lg border border-indigo-100 bg-indigo-50/70 p-3"><p class="text-xs font-bold text-indigo-800">${escapeHtml(item.subject)}</p><p class="mt-1 text-[11px] text-slate-600">${escapeHtml(item.start)}–${escapeHtml(item.end)}</p><p class="mt-2 text-[11px] text-slate-600">Professor: ${escapeHtml(professorNames)}</p><p class="text-[11px] text-slate-500">${escapeHtml(item.room)}</p>${canEdit ? `<div class="mt-2 flex gap-1">${button("Edit", "edit-schedule", `data-id="${item.id}"`)}${button("Delete", "delete-schedule", `data-id="${item.id}"`, "btn-danger")}</div>` : ""}</div>`;
        }).join("")}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table></div></section>` : `<section class="surface-card p-5">${emptyState("No classes scheduled", section ? `There are no class entries for ${escapeHtml(section.name)} yet.` : "Select an accessible section to view its class schedule.")}</section>`}
      <section class="surface-card mt-6 p-5 sm:p-6"><div class="flex items-center justify-between"><div><p class="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Audit trail</p><h3 class="mt-1 text-lg font-bold">Schedule change history</h3></div><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">${history.length} updates</span></div>
        <div class="mt-4 divide-y divide-slate-100">${history.length ? history.slice(0, 8).map(item => `<div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><p class="text-sm font-medium text-slate-700">${escapeHtml(item.text)}</p><p class="text-xs text-slate-500">${escapeHtml(item.actor)} · ${formatDate(item.at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p></div>`).join("") : emptyState("No changes yet", "Schedule updates will be recorded here.")}</div>
      </section>`;
  }

  function renderExamTimetable() {
    const section = selectedViewSection("exams");
    const scopedEvents = sectionRecordsForCurrentRole(state.events, section);
    const exams = scopedEvents.filter(event => ["Examination", "Quiz"].includes(event.type)).sort((a, b) => new Date(a.date) - new Date(b.date));
    const canEdit = canManageEvents();
    const actions = `<div class="flex flex-wrap items-end gap-2">${viewSectionSelector("exams", Boolean(state.editingExam))}${canEdit ? button("＋ Add exam", "toggle-exam-form", "", "btn-primary") : ""}${bulkScheduleActions()}</div>`;
    const preferredOfferingId = state.offerings.find(offering => offering.section_id === section?.id && offering.active)?.id || state.activeOfferingId;
    return `${pageIntro("Assessment planning", "Exam timetable", "Check the date, start time, subject, and room for each exam or quiz. Unlike the weekly class schedule, every assessment shows its full calendar date.", actions)}
      ${state.showExamForm ? eventForm(scopedEvents.find(item => item.id === state.editingExam), true, preferredOfferingId, section?.id) : ""}
      <section class="surface-card overflow-hidden">
        <div class="border-b border-slate-100 p-4 sm:px-5"><h3 class="font-bold">Exams & quizzes</h3><p class="mt-1 text-xs text-slate-500">${exams.length} scheduled assessments · sorted by date</p></div>
        ${exams.length ? `<div class="divide-y divide-slate-100">${exams.map(exam => {
          const date = new Date(exam.date);
          return `<article class="grid gap-4 p-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:px-5">
            <div class="rounded-xl bg-indigo-50 px-3 py-2.5 text-center sm:text-left"><p class="text-xs font-bold uppercase tracking-wide text-indigo-700">${escapeHtml(new Intl.DateTimeFormat("en", { weekday: "short" }).format(date))}</p><p class="mt-0.5 text-sm font-bold text-slate-900">${escapeHtml(formatDate(exam.date, { month: "short", day: "numeric", year: "numeric" }))}</p><p class="mt-0.5 text-xs font-semibold text-indigo-700">${escapeHtml(formatTime(exam.date))}</p></div>
            <div class="min-w-0"><div class="flex flex-wrap items-center gap-2">${badge(exam.type)}<span class="text-xs text-slate-500">${escapeHtml(exam.subject)}</span></div><p class="mt-1.5 text-sm text-slate-500">${escapeHtml(exam.location)}</p>${exam.details ? `<p class="mt-1 text-xs leading-5 text-slate-500">${escapeHtml(exam.details)}</p>` : ""}</div>
            ${canEdit ? `<div class="flex gap-2 sm:justify-end">${button("Edit", "edit-exam", `data-id="${exam.id}"`)}${button("Remove", "delete-exam", `data-id="${exam.id}"`, "btn-danger")}</div>` : ""}
          </article>`;
        }).join("")}</div>` : `<div class="p-5">${emptyState("No exams scheduled", canEdit ? "Add an exam or quiz to publish a dated entry here." : "Exam and quiz dates will appear here when they are published.")}</div>`}
      </section>`;
  }

  function scheduleForm(item = null, selectedOfferingId = null, sectionId = null) {
    return `<form id="schedule-form" class="surface-card mb-5 border-indigo-100 bg-indigo-50/30 p-4"><div class="mb-4 flex items-center justify-between"><h3 class="font-bold">${item ? "Edit class" : "Add a class"}</h3>${button("Cancel", "cancel-schedule-form")}</div>
      <input type="hidden" name="id" value="${item ? escapeHtml(item.id) : ""}"><div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      ${offeringSelectionFields(item?.offeringId || selectedOfferingId || state.activeOfferingId, sectionId)}
      <label class="block text-xs font-semibold text-slate-600">Classroom<input class="form-control mt-1.5" name="room" required value="${item ? escapeHtml(item.room) : ""}"></label>
      <label class="block text-xs font-semibold text-slate-600">Day<select name="day" class="form-control mt-1.5">${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => `<option ${item?.day === day ? "selected" : ""}>${day}</option>`).join("")}</select></label>
      <label class="block text-xs font-semibold text-slate-600">Start time<input class="form-control mt-1.5" type="time" name="start" required value="${item ? escapeHtml(item.start) : "09:00"}"></label>
      <label class="block text-xs font-semibold text-slate-600">End time<input class="form-control mt-1.5" type="time" name="end" required value="${item ? escapeHtml(item.end) : "10:30"}"></label></div>
      <div class="mt-4 flex justify-end"><button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">${item ? "Save class" : "Add class"}</button></div></form>`;
  }

  function renderCalendar() {
    const allSections = state.calendarViewSectionId === "all" && ["admin", "professor"].includes(state.activeRole);
    const section = selectedViewSection("calendar");
    const scopedEvents = allSections
      ? state.events.filter(event => sectionsForViewing().some(viewableSection =>
        (event.sectionId || state.offerings.find(offering => offering.id === event.offeringId)?.section_id) === viewableSection.id))
      : sectionRecordsForCurrentRole(state.events, section);
    const canEdit = canManageEvents();
    const events = [...scopedEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    const actions = `<div class="flex flex-wrap items-end gap-2">${viewSectionSelector("calendar")}${canEdit ? button("＋ Add calendar item", "toggle-event-form", "", "btn-primary") : ""}</div>`;
    const selectedOffering = state.offerings.find(offering => offering.section_id === section?.id && offering.active)?.id || state.activeOfferingId;
    return `${pageIntro("Never miss a date", "Academic calendar", "Examinations, quizzes, project deadlines, consultations, and special class sessions in one chronological view.", actions)}
      ${state.showEventForm ? eventForm(scopedEvents.find(item => item.id === state.editingEvent), false, selectedOffering, allSections ? null : section?.id) : ""}
      <section class="surface-card p-4 sm:p-6"><div class="mb-4 flex items-center justify-between"><div><h3 class="font-bold">Upcoming academic dates</h3><p class="mt-1 text-xs text-slate-500">${events.length} scheduled items</p></div></div>
        <div class="divide-y divide-slate-100">${events.length ? events.map(event => `<div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">${eventRow(event, allSections)}${canEdit ? `<div class="flex shrink-0 gap-2 sm:ml-2">${button("Edit", "edit-event", `data-id="${event.id}"`)}${button("Delete", "delete-event", `data-id="${event.id}"`, "btn-danger")}</div>` : ""}</div>`).join("") : emptyState("Nothing scheduled", "New academic events will appear here.")}</div>
      </section>`;
  }

  function eventForm(item = null, examOnly = false, selectedOfferingId = null, sectionId = null) {
    const eventTypes = examOnly ? ["Examination", "Quiz"] : ["Quiz", "Examination", "Project Deadline", "Consultation", "Special Class"];
    const formId = examOnly ? "exam-event-form" : "event-form";
    const formTitle = examOnly ? "exam" : "calendar item";
    return `<form id="${formId}" class="surface-card mb-5 border-indigo-100 bg-indigo-50/30 p-4"><div class="mb-4 flex items-center justify-between"><h3 class="font-bold">${item ? `Edit ${formTitle}` : `Add ${formTitle}`}</h3>${button("Cancel", examOnly ? "cancel-exam-form" : "cancel-event-form")}</div>
      <input type="hidden" name="id" value="${item ? escapeHtml(item.id) : ""}"><div class="grid gap-3 sm:grid-cols-2">
      ${!examOnly ? `<label class="block text-xs font-semibold text-slate-600">Title<input class="form-control mt-1.5" name="title" required value="${item ? escapeHtml(item.title) : ""}"></label>` : ""}
      ${offeringSelectionFields(item?.offeringId || selectedOfferingId || state.activeOfferingId, sectionId)}
      <label class="block text-xs font-semibold text-slate-600">Type<select name="type" class="form-control mt-1.5">${eventTypes.map(type => `<option ${item?.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
      <label class="block text-xs font-semibold text-slate-600">Date and time<input class="form-control mt-1.5" type="datetime-local" name="date" required value="${item ? escapeHtml(new Date(new Date(item.date).getTime() - new Date(item.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16)) : ""}"></label>
      <label class="block text-xs font-semibold text-slate-600">Location<input class="form-control mt-1.5" name="location" required value="${item ? escapeHtml(item.location) : ""}"></label>
      <label class="block text-xs font-semibold text-slate-600 sm:col-span-2">Details<textarea class="form-control mt-1.5" rows="3" name="details">${item ? escapeHtml(item.details) : ""}</textarea></label>
      </div><div class="mt-4 flex justify-end"><button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">${item ? "Save changes" : "Add to calendar"}</button></div></form>`;
  }

  function renderManagement() {
    const roleOrder = ["admin", "professor", "officer", "student"];
    const users = [...state.users].sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    const counts = [
      ["student", "Students (including officers)", users.filter(user => ["student", "officer"].includes(user.role) && user.active).length],
      ...["professor", "officer", "admin"].map(role => [role, roles[role].label, users.filter(user => user.role === role && user.active).length])
    ];
    const groupedUsers = roleOrder.map(role => ({
      role,
      users: users.filter(user => user.role === role)
    })).filter(group => group.users.length);
    return `${pageIntro("Administration", "User management", "Manage accounts, class assignments, access, and status. Account lists are grouped by role and alphabetized.")}
      <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">${counts.map(([, label, count]) => `<div class="surface-card p-4"><p class="text-xs font-semibold uppercase tracking-wider text-slate-500">${label}</p><p class="mt-2 text-2xl font-bold">${count}</p><p class="text-xs text-slate-500">active accounts</p></div>`).join("")}</div>
      ${renderSectionsManagement()}
      <section class="surface-card mb-5 p-4 sm:p-5"><h3 class="font-bold">Issue a one-time role key</h3><p class="mt-1 text-xs text-slate-500">The key is shown only once. Share it securely with the intended account holder.</p><div class="mt-3 flex flex-wrap gap-2">${["professor", "officer", "admin"].map(role => button(`Generate ${roles[role].label} key`, "issue-role-key", `data-role="${role}"`)).join("")}</div><div id="issued-key-container" class="mt-3 hidden"><label class="block text-xs font-semibold text-slate-600">Copy this one-time key now<input id="issued-role-key" class="form-control mt-1.5 font-mono" readonly></label></div></section>
      <section class="surface-card overflow-hidden"><div class="border-b border-slate-100 p-4 sm:px-5"><h3 class="font-bold">Campus accounts</h3><p class="mt-1 text-xs text-slate-500">${users.length} accounts · ${users.filter(user => user.active).length} active</p></div>
      ${groupedUsers.map(group => `<details class="border-b border-slate-100 last:border-0" open><summary class="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">${roles[group.role].label}s (${group.users.length})</summary><div class="overflow-x-auto"><table class="w-full min-w-[720px] text-left"><thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th class="px-5 py-3 font-semibold">User</th><th class="px-5 py-3 font-semibold">Role</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody class="divide-y divide-slate-100">${group.users.map(user => `<tr class="${user.active ? "" : "opacity-55"}"><td class="px-5 py-4"><p class="text-sm font-semibold">${escapeHtml(user.name)}</p><p class="mt-0.5 text-xs text-slate-500">${escapeHtml(user.email)}</p></td><td class="px-5 py-4"><select class="form-control w-auto min-w-36 py-2 text-xs" data-user-role="${escapeHtml(user.id)}" aria-label="Role for ${escapeHtml(user.name)}">${Object.entries(roles).map(([role, info]) => `<option value="${role}" ${user.role === role ? "selected" : ""}>${info.label}</option>`).join("")}</select></td><td class="px-5 py-4"><span class="inline-flex items-center gap-1.5 text-xs font-medium ${user.active ? "text-emerald-700" : "text-slate-500"}"><span class="h-1.5 w-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-slate-400"}"></span>${user.active ? "Active" : "Deactivated"}</span></td><td class="px-5 py-4"><div class="flex justify-end gap-2">${button("Edit", "edit-user", `data-id="${user.id}"`)}${button(user.active ? "Deactivate" : "Reactivate", "toggle-user-active", `data-id="${user.id}"`, user.active ? "btn-danger" : "btn-secondary")}</div></td></tr>`).join("")}</tbody></table></div></details>`).join("")}</section>`;
  }

  function renderSectionsManagement() {
    const activeUsers = state.users.filter(user => user.active);
    const sections = [...state.sections].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    return `<section class="surface-card mb-5 p-4 sm:p-5">
      <div><p class="text-xs font-bold uppercase tracking-wider text-indigo-600">Class structure</p><h3 class="mt-1 text-lg font-bold">Sections & subjects</h3><p class="mt-1 text-xs leading-5 text-slate-500">Assign one class officer to each section. Professors are assigned per subject; students can be enrolled only in the subjects they take.</p></div>
      <form id="section-form" class="mt-4 flex flex-wrap items-end gap-3"><label class="block min-w-56 flex-1 text-xs font-semibold text-slate-600">New section name<input class="form-control mt-1.5" name="name" maxlength="80" placeholder="BSIT 2A" required></label><button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Create section & key</button></form>
      <div class="mt-4 space-y-3">${sections.length ? sections.map(section => {
        const offerings = state.offerings.filter(item => item.section_id === section.id)
          .sort((a, b) => a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" }));
        const sectionOfficer = state.sectionOfficers.find(item => item.section_id === section.id);
        const officer = state.users.find(user => user.id === sectionOfficer?.profile_id);
        const sectionStudents = state.sectionMemberships
          .filter(item => item.section_id === section.id)
          .map(item => activeUsers.find(user => user.id === item.profile_id && ["student", "officer"].includes(user.role)))
          .filter(Boolean);
        const activeOfficer = activeUsers.find(user => user.id === sectionOfficer?.profile_id && user.role === "officer");
        const sectionStudentCount = new Set([...sectionStudents.map(user => user.id), ...(activeOfficer ? [activeOfficer.id] : [])]).size;
        const officerOptions = activeUsers.filter(user => user.role === "officer");
        return `<details class="rounded-xl border border-slate-200 p-4"><summary class="cursor-pointer font-bold">${escapeHtml(section.name)}<span class="ml-2 text-xs font-normal text-slate-500">${offerings.length} subject(s) · ${sectionStudentCount} active student(s), including officer · ${section.active ? "Active" : "Archived"}</span></summary><div class="mt-3"><div class="mb-3 flex flex-wrap justify-end gap-2">${button("Duplicate section", "duplicate-section", `data-id="${section.id}"`)}${section.active ? button("Rotate join key", "rotate-section-key", `data-id="${section.id}"`) : ""}${button(section.active ? "Archive section" : "Restore section", "toggle-section-active", `data-id="${section.id}"`, section.active ? "btn-danger" : "btn-secondary")}${button("Delete permanently", "delete-section", `data-id="${section.id}"`, "btn-danger")}</div>
          <form id="section-edit-form-${section.id}" data-section-id="${section.id}" class="mt-3 flex flex-wrap items-end gap-2"><label class="min-w-48 flex-1 text-xs font-semibold text-slate-600">Edit section name<input class="form-control mt-1 py-2 text-sm" name="name" maxlength="80" required value="${escapeHtml(section.name)}"></label><button class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Save name</button></form>
          <form id="section-officer-form-${section.id}" data-section-id="${section.id}" class="mt-4 flex flex-wrap items-center gap-2"><label class="min-w-48 flex-1 text-xs font-semibold text-slate-600">Class officer<select class="form-control mt-1 py-2 text-xs" name="profileId" required><option value="">Select one class officer</option>${officerOptions.map(person => `<option value="${person.id}" ${person.id === officer?.id ? "selected" : ""}>${escapeHtml(person.name)} (${escapeHtml(person.email)})</option>`).join("")}</select></label><button class="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Assign / replace officer</button>${officer ? `${button("Remove officer", "clear-section-officer", `data-id="${section.id}"`, "btn-danger")}<span class="text-xs text-slate-500">${officer.active ? "" : "Assigned account is inactive"}</span>` : ""}</form>
          <form id="offering-form-${section.id}" data-section-id="${section.id}" class="mt-4 grid gap-2 sm:grid-cols-[1fr_12rem_auto]"><label class="block text-xs font-semibold text-slate-600">Subject<input class="form-control mt-1.5" name="subject" maxlength="120" placeholder="Data Structures" required></label><label class="block text-xs font-semibold text-slate-600">Course code (optional)<input class="form-control mt-1.5" name="courseCode" maxlength="32" placeholder="CS201"></label><button class="self-end rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" ${section.active ? "" : "disabled"}>Add subject</button></form>
          <div class="mt-3 space-y-2">${offerings.map(offering => {
            const assigned = state.assignments.filter(item => item.offering_id === offering.id && item.staff_role === "professor");
            const enrolledIds = new Set(state.enrollments.filter(item => item.offering_id === offering.id).map(item => item.profile_id));
            const candidates = sectionStudents.filter(person => !enrolledIds.has(person.id));
            const enrolled = sectionStudents.filter(person => enrolledIds.has(person.id));
            return `<details class="rounded-lg bg-slate-50 p-3"><summary class="cursor-pointer text-sm font-semibold text-slate-700">${escapeHtml(offering.subject)}${offering.course_code ? ` · ${escapeHtml(offering.course_code)}` : ""}<span class="ml-2 text-xs font-normal text-slate-500">${offering.active ? "Active" : "Archived"}</span></summary><div class="mt-2"><div class="flex flex-wrap justify-end gap-2">${button(offering.active ? "Archive subject" : "Restore subject", "toggle-offering-active", `data-id="${offering.id}"`, offering.active ? "btn-danger" : "btn-secondary")}${button("Delete permanently", "delete-offering", `data-id="${offering.id}"`, "btn-danger")}</div>
              <form id="offering-edit-form-${offering.id}" data-offering-id="${offering.id}" class="mt-2 grid gap-2 sm:grid-cols-[1fr_12rem_auto]"><label class="block text-xs font-semibold text-slate-600">Subject<input class="form-control mt-1 py-2 text-sm" name="subject" maxlength="120" required value="${escapeHtml(offering.subject)}"></label><label class="block text-xs font-semibold text-slate-600">Course code<input class="form-control mt-1 py-2 text-sm" name="courseCode" maxlength="32" value="${escapeHtml(offering.course_code || "")}"></label><button class="self-end rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Save subject</button></form>
              <form id="staff-assignment-form-${offering.id}-professor" data-offering-id="${offering.id}" data-staff-role="professor" class="mt-2 flex flex-wrap items-center gap-2"><span class="w-24 text-xs font-medium text-slate-600">Professor</span><select class="form-control min-w-48 flex-1 py-2 text-xs" name="profileId" required><option value="">Assign professor</option>${activeUsers.filter(person => person.role === "professor").map(person => `<option value="${person.id}">${escapeHtml(person.name)} (${escapeHtml(person.email)})</option>`).join("")}</select><button class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Assign</button>${assigned.map(item => { const person = activeUsers.find(user => user.id === item.profile_id); return person ? `<span class="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-600">${escapeHtml(person.name)}${button("×", "remove-offering-staff", `data-offering-id="${offering.id}" data-profile-id="${person.id}" data-role="professor"`, "btn-danger")}</span>` : ""; }).join("")}</form>
              <div class="mt-3 border-t border-slate-200 pt-3"><p class="text-xs font-semibold text-slate-700">Enrolled students (${enrolled.length})</p><form id="enrollment-form-${offering.id}" data-offering-id="${offering.id}" class="mt-2 flex flex-wrap items-center gap-2"><select class="form-control min-w-48 flex-1 py-2 text-xs" name="profileId" ${candidates.length && offering.active ? "required" : "disabled"}><option value="">${offering.active ? (candidates.length ? "Add a student taking this subject" : "All section students are enrolled") : "Restore this class to edit enrollments"}</option>${candidates.map(person => `<option value="${person.id}">${escapeHtml(person.name)} (${escapeHtml(person.email)})</option>`).join("")}</select><button class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700" ${candidates.length && offering.active ? "" : "disabled"}>Enroll student</button></form><div class="mt-2 flex flex-wrap gap-2">${enrolled.map(person => `<span class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-xs text-slate-600">${escapeHtml(person.name)}${button("×", "remove-offering-student", `data-offering-id="${offering.id}" data-profile-id="${person.id}" ${offering.active ? "" : "disabled"}`, "btn-danger")}</span>`).join("") || '<span class="text-xs text-slate-500">No students enrolled in this subject.</span>'}</div></div></div></details>`;
          }).join("") || '<p class="mt-3 text-xs text-slate-500">No offerings created for this section yet.</p>'}</div>
        </div></details>`;
      }).join("") : emptyState("No sections created", "Create a section, then add its subjects and assign staff.")}</div>
      <div id="section-key-container" class="mt-4 hidden rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p class="text-xs font-semibold text-emerald-800">Share this reusable section key with students in this section</p><input id="section-key-output" class="form-control mt-2 font-mono" readonly></div>
    </section>`;
  }

  function renderSettings() {
    const account = currentUser();
    return `${pageIntro("Your profile", "Account settings", "Update your password through your secure CampusHub account.")}
      <div class="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <section class="surface-card p-5 sm:p-6"><p class="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Signed in as</p><h3 class="mt-2 text-lg font-bold">${escapeHtml(account?.name || "")}</h3><p class="mt-1 text-sm text-slate-500">${escapeHtml(account?.email || "")}</p><span class="mt-4 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">${escapeHtml(roles[state.activeRole].label)}</span><p class="mt-4 text-xs leading-5 text-slate-500">Your access level can be granted by an administrator or through a one-time role key.</p></section>
        <section class="surface-card p-5 sm:p-6"><h3 class="text-lg font-bold">Change password</h3><p class="mt-1 text-sm text-slate-500">Confirm your current password and choose a new one.</p>
          <form id="password-form" class="mt-5 space-y-4">
            <label class="block text-xs font-semibold text-slate-600">Current password<input class="form-control mt-1.5" type="password" name="currentPassword" autocomplete="current-password" required></label>
            <label class="block text-xs font-semibold text-slate-600">New password <span class="font-normal text-slate-400">(at least 8 characters)</span><input class="form-control mt-1.5" type="password" name="newPassword" autocomplete="new-password" minlength="8" required></label>
            <label class="block text-xs font-semibold text-slate-600">Confirm new password<input class="form-control mt-1.5" type="password" name="confirmPassword" autocomplete="new-password" minlength="8" required></label>
            <p id="password-message" class="hidden rounded-lg px-3 py-2 text-sm" role="status"></p>
            <div class="flex justify-end"><button class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Update password</button></div>
          </form>
        </section>
      </div>`;
  }

  async function setUserRole(user, role) {
    if (!user || !roles[role] || !requireRole(["admin"])) return false;
    try {
      await window.CampusHubStore.updateProfile({ ...user, role });
      user.role = role;
      if (user.id === state.currentUserId) state.activeRole = role;
      persistActiveOffering();
      dataReady = false;
      await bootstrapSession({ id: state.currentUserId });
      showToast(`${user.name}'s role is now ${roles[role].label}.`);
      return true;
    } catch (error) {
      console.error("CampusHub could not update the account role.", error);
      showToast(error.message || "The account role could not be updated.", "error");
      render();
      return false;
    }
  }

  function userForm(user = null) {
    const membership = state.sectionMemberships.find(item => item.profile_id === user.id);
    const selectedOfferingIds = state.enrollments.filter(item => item.profile_id === user.id).map(item => item.offering_id);
    const assignedOfferingIds = state.assignments.filter(item => item.profile_id === user.id &&
      item.staff_role === (user.role === "officer" ? "officer" : "professor")).map(item => item.offering_id);
    const officerSectionIds = new Set(state.sectionOfficers
      .filter(item => item.profile_id === user.id)
      .map(item => item.section_id));
    const activeSections = [...state.sections]
      .filter(item => item.active || item.id === membership?.section_id)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    const activeOfferings = [...state.offerings].filter(offering => offering.active &&
      (user.role !== "officer" || officerSectionIds.has(offering.section_id)) &&
      state.sections.some(section => section.id === offering.section_id && section.active))
      .sort((a, b) => {
        const sectionA = state.sections.find(section => section.id === a.section_id)?.name || "";
        const sectionB = state.sections.find(section => section.id === b.section_id)?.name || "";
        return sectionA.localeCompare(sectionB, undefined, { sensitivity: "base" }) || a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" });
      });
    return `<form id="user-form"><h2 id="user-edit-heading" class="mb-1 text-xl font-bold">Edit account</h2><p class="mb-4 text-sm text-slate-500">Update account details and class assignments.</p>
      <input type="hidden" name="id" value="${escapeHtml(user.id)}"><label class="block text-xs font-semibold text-slate-600">Full name<input class="form-control mt-1.5" name="name" maxlength="100" required value="${escapeHtml(user.name)}"></label>
      <p class="mt-3 text-xs text-slate-500">Email and password are managed by Supabase Authentication.</p>
      ${["student", "officer"].includes(user.role) ? `<div class="mt-4"><label class="block text-xs font-semibold text-slate-600">${user.role === "officer" ? "Enrolled section" : "Section"}<select class="form-control mt-1.5 max-w-xl" name="sectionId" data-student-section-select="${escapeHtml(user.id)}"><option value="">Not assigned to a section</option>${activeSections.map(section => `<option value="${section.id}" ${membership?.section_id === section.id ? "selected" : ""}>${escapeHtml(section.name)}${section.active ? "" : " (Archived)"}</option>`).join("")}</select></label><div id="student-offering-choices" class="mt-3 grid gap-2 sm:grid-cols-2">${renderStudentOfferingChoices(user, membership?.section_id || "", selectedOfferingIds)}</div></div>` : ""}
      ${["professor", "officer"].includes(user.role) ? `<fieldset class="mt-4"><legend class="text-xs font-semibold text-slate-600">${user.role === "officer" ? "Class officer subjects" : "Assigned subjects"}</legend>${user.role === "officer" ? '<p class="mt-1 text-xs text-slate-500">Choose which subjects this officer can manage in their assigned section.</p>' : ""}<div class="mt-2 space-y-2">${[...new Set(activeOfferings.map(offering => offering.section_id))].map(sectionId => {
        const sectionOfferings = activeOfferings.filter(offering => offering.section_id === sectionId);
        const sectionName = state.sections.find(item => item.id === sectionId)?.name || "Section";
        const selectedCount = sectionOfferings.filter(offering => assignedOfferingIds.includes(offering.id)).length;
        return `<details class="rounded-lg border border-slate-200 bg-white p-3"><summary class="cursor-pointer text-xs font-semibold text-slate-700">${escapeHtml(sectionName)} <span class="font-normal text-slate-500">(${selectedCount}/${sectionOfferings.length} assigned)</span></summary><div class="mt-2 grid gap-2 sm:grid-cols-2">${sectionOfferings.map(offering => {
        return `<label class="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-xs"><input class="mt-0.5" type="checkbox" name="offeringIds" value="${offering.id}" ${assignedOfferingIds.includes(offering.id) ? "checked" : ""}><span class="font-semibold text-slate-700">${escapeHtml(offering.subject)}${offering.course_code ? ` (${escapeHtml(offering.course_code)})` : ""}</span></label>`;
      }).join("")}</div></details>`;
      }).join("") || '<p class="text-xs text-slate-500">No active subjects are available to assign.</p>'}</div></fieldset>` : ""}
      <div class="mt-5 flex justify-end gap-2">${button("Cancel", "cancel-user-form")}<button class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Save account</button></div></form>`;
  }

  function renderUserEditModal() {
    if (!state.showUserForm || state.activeRole !== "admin") {
      userEditModal.hidden = true;
      userEditModalContent.replaceChildren();
      return;
    }
    const user = state.users.find(item => item.id === state.editingUser);
    if (!user) {
      state.showUserForm = false;
      state.editingUser = null;
      userEditModal.hidden = true;
      userEditModalContent.replaceChildren();
      return;
    }
    userEditModalContent.innerHTML = userForm(user);
    userEditModal.hidden = false;
  }

  function renderStudentOfferingChoices(user, sectionId, selectedOfferingIds) {
    const offerings = state.offerings.filter(item => item.section_id === sectionId && item.active)
      .sort((a, b) => a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" }));
    if (!sectionId) return '<p class="text-xs text-slate-500">Select a section to manage this account’s subjects.</p>';
    if (!offerings.length) return '<p class="text-xs text-slate-500">This section has no active subjects yet.</p>';
    const membership = state.sectionMemberships.some(item => item.profile_id === user.id && item.section_id === sectionId);
    const checkedIds = membership ? selectedOfferingIds : offerings.map(item => item.id);
    const selectedCount = offerings.filter(offering => checkedIds.includes(offering.id)).length;
    return `<details class="rounded-lg border border-slate-200 bg-white p-3 sm:col-span-2" open><summary class="cursor-pointer text-xs font-semibold text-slate-700">Enrolled subjects <span class="font-normal text-slate-500">(${selectedCount}/${offerings.length} selected)</span></summary><div class="mt-2 grid gap-2 sm:grid-cols-2">${offerings.map(offering => `<label class="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-xs text-slate-700"><input type="checkbox" name="studentOfferingIds" value="${offering.id}" ${checkedIds.includes(offering.id) ? "checked" : ""}><span>${escapeHtml(offering.subject)}${offering.course_code ? ` (${escapeHtml(offering.course_code)})` : ""}</span></label>`).join("")}</div></details>`;
  }

  function field(label, name, value = "", type = "text", required = false) {
    return `<label class="block text-xs font-semibold text-slate-600">${label}<input class="form-control mt-1.5" name="${name}" type="${type}" ${required ? "required" : ""} value="${value ? escapeHtml(value) : ""}"></label>`;
  }

  function showToast(message, type = "success") {
    document.getElementById("toast")?.remove();
    const element = document.createElement("div");
    element.id = "toast";
    element.className = `toast-message fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${type === "error" ? "bg-rose-600" : "bg-slate-900"}`;
    element.setAttribute("role", "status");
    element.textContent = message;
    document.body.append(element);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.remove(), 3200);
  }

  function setFormMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.remove("hidden", "auth-message-success", "auth-message-error");
    element.classList.add(isError ? "auth-message-error" : "auth-message-success");
  }

  function clearFormMessage(element) {
    element.textContent = "";
    element.classList.add("hidden");
    element.classList.remove("auth-message-success", "auth-message-error");
  }

  function setAuthMode(mode) {
    const isRegister = mode === "register";
    document.getElementById("login-form").classList.toggle("hidden", isRegister);
    document.getElementById("register-form").classList.toggle("hidden", !isRegister);
    document.querySelectorAll("[data-auth-tab]").forEach(tab => tab.classList.toggle("is-selected", tab.dataset.authTab === mode));
    document.getElementById("auth-heading").textContent = isRegister ? "Create your account" : "Sign in to your campus";
    document.getElementById("auth-description").textContent = isRegister ? "Create a student account to get started." : "Log in to continue to your CampusHub.";
    clearFormMessage(authMessage);
  }

  function openAuthModal(mode = "login") {
    if (currentUser()) return;
    accessModal.hidden = true;
    authModal.hidden = false;
    setAuthMode(mode);
    const form = document.getElementById(`${mode}-form`);
    form.querySelector("input")?.focus();
  }

  function closeModals() {
    authModal.hidden = true;
    accessModal.hidden = true;
    sectionModal.hidden = true;
    userEditModal.hidden = true;
    state.showUserForm = false;
    state.editingUser = null;
  }

  async function bootstrapSession(authUser) {
    if (!authUser) {
      dataReady = false;
      state.currentUserId = null;
      state.users = [];
      state.activeRole = "student";
      if (realtimeChannel) {
        window.CampusHubStore.client.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      render();
      return;
    }
    if (dataReady && state.currentUserId === authUser.id) return;
    if (bootstrappingUserId === authUser.id) {
      await new Promise(resolve => {
        const waiters = bootstrapWaiters.get(authUser.id) || [];
        waiters.push(resolve);
        bootstrapWaiters.set(authUser.id, waiters);
      });
      return;
    }
    bootstrappingUserId = authUser.id;
    try {
      const data = await window.CampusHubStore.load(authUser.id, state.activeRole === "admin");
      state.currentUserId = data.user.id;
      state.activeRole = data.user.role;
      state.users = [...data.users.filter(user => user.id !== data.user.id), data.user];
      state.announcements = data.announcements;
      state.schedules = data.schedules;
      state.events = data.events;
      state.scheduleHistory = data.scheduleHistory;
      state.membership = data.membership;
      state.sectionMemberships = data.sectionMemberships;
      state.sections = data.sections;
      state.offerings = data.offerings;
      state.assignments = data.assignments;
      state.offeringProfessors = data.offeringProfessors;
      state.sectionOfficers = data.sectionOfficers;
      state.enrollments = data.enrollments;
      state.studentCounts = data.studentCounts;
      const preferenceOffering = readActiveOfferingPreference(data.user.id);
      const activeOfferings = data.offerings.filter(offering => offering.active &&
        data.sections.some(section => section.id === offering.section_id && section.active));
      state.activeOfferingId = activeOfferings.some(item => item.id === state.activeOfferingId)
        ? state.activeOfferingId
        : (activeOfferings.find(item => item.id === preferenceOffering)?.id || activeOfferings[0]?.id || null);
      if (state.activeOfferingId) {
        persistActiveOffering();
      }
      dataReady = true;
      render();
      if (!realtimeChannel) {
        let refreshTimer;
        realtimeChannel = window.CampusHubStore.watch(() => {
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(async () => {
            if (!currentUser()) return;
            try {
              const latest = await window.CampusHubStore.load(authUser.id, state.activeRole === "admin");
              state.announcements = latest.announcements;
              state.schedules = latest.schedules;
              state.events = latest.events;
              state.scheduleHistory = latest.scheduleHistory;
              state.membership = latest.membership;
              state.sectionMemberships = latest.sectionMemberships;
              state.sections = latest.sections;
              state.offerings = latest.offerings;
              state.assignments = latest.assignments;
              state.offeringProfessors = latest.offeringProfessors;
              state.sectionOfficers = latest.sectionOfficers;
              state.enrollments = latest.enrollments;
              state.studentCounts = latest.studentCounts;
              const activeOfferings = latest.offerings.filter(offering => offering.active &&
                latest.sections.some(section => section.id === offering.section_id && section.active));
              if (!activeOfferings.some(item => item.id === state.activeOfferingId)) {
                const preferredOffering = readActiveOfferingPreference(authUser.id);
                state.activeOfferingId = activeOfferings.find(item => item.id === preferredOffering)?.id || activeOfferings[0]?.id || null;
              }
              persistActiveOffering();
              if (state.activeRole === "admin") {
                state.users = [...latest.users.filter(user => user.id !== latest.user.id), latest.user];
              }
              render();
            } catch (error) {
              console.error("CampusHub could not refresh shared data.", error);
              showToast(error.message || "Shared data could not be refreshed.", "error");
            }
          }, 150);
        });
      }
    } catch (error) {
      dataReady = false;
      state.currentUserId = null;
      render();
      console.error("CampusHub could not load the shared campus data.", error);
      showToast(error.message || "CampusHub could not load the shared data.", "error");
    } finally {
      bootstrappingUserId = null;
      (bootstrapWaiters.get(authUser.id) || []).forEach(resolve => resolve());
      bootstrapWaiters.delete(authUser.id);
    }
  }

  document.querySelectorAll("[data-open-auth]").forEach(button => {
    button.addEventListener("click", () => openAuthModal(button.dataset.openAuth));
  });

  document.querySelectorAll("[data-auth-tab]").forEach(button => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authTab));
  });

  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => {
      closeModals();
      render();
    });
  });
  document.getElementById("join-section-button").addEventListener("click", () => {
    clearFormMessage(document.getElementById("section-message"));
    sectionModal.hidden = false;
    document.querySelector('#section-join-form [name="key"]').focus();
  });

  document.getElementById("active-offering-select").addEventListener("change", event => {
    state.activeOfferingId = event.target.value;
    persistActiveOffering();
    render();
  });

  sectionModal.addEventListener("submit", async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "section-join-form") return;
    event.preventDefault();
    if (!requireRole(["student"])) return;
    const submitButton = form.querySelector("button");
    submitButton.disabled = true;
    try {
      const joined = await window.CampusHubStore.joinSection(new FormData(form).get("key"));
      state.membership = { section_id: joined.id };
      state.activeOfferingId = null;
      dataReady = false;
      await bootstrapSession({ id: state.currentUserId });
      form.reset();
      closeModals();
      showToast(`You joined ${joined.name}.`);
    } catch (error) {
      setFormMessage(document.getElementById("section-message"), error.message || "Could not join that section.", true);
    } finally {
      submitButton.disabled = false;
    }
  });

  [authModal, accessModal].forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModals();
    });
  });
  sectionModal.addEventListener("click", event => {
    if (event.target === sectionModal) closeModals();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModals();
  });

  authModal.addEventListener("submit", async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !["login-form", "register-form"].includes(form.id)) return;
    event.preventDefault();
    const values = formValues(form);
    const email = values.email.trim().toLowerCase();
    const submitButton = form.querySelector('button[type="submit"], button:not([type])');
    if (submitButton) submitButton.disabled = true;
    try {
      if (!window.CampusHubStore.ready) throw new Error("Supabase is not configured yet. Add your project URL and anon key to supabase-config.js.");
      if (form.id === "register-form") {
        const name = values.name.trim();
        if (name.length < 2) throw new Error("Enter your full name.");
        if (values.password.length < 8) throw new Error("Choose a password with at least 8 characters.");
        const { data, error } = await window.CampusHubStore.client.auth.signUp({
          email,
          password: values.password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.href.split("#")[0]
          }
        });
        if (error) throw error;
        form.reset();
        if (data.session) {
          await bootstrapSession(data.user);
          closeModals();
        } else {
          setAuthMode("login");
          document.querySelector('#login-form [name="email"]').value = email;
          setFormMessage(authMessage, "Account created. Check your email to confirm your account, then log in.");
        }
      } else {
        const { data, error } = await window.CampusHubStore.client.auth.signInWithPassword({ email, password: values.password });
        if (error) throw error;
        await bootstrapSession(data.user);
        if (!currentUser()) throw new Error("This account is inactive or could not be loaded.");
        form.reset();
        closeModals();
      }
    } catch (error) {
      setFormMessage(authMessage, error.message || "Authentication could not be completed.", true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    try {
      const { error } = await window.CampusHubStore.client.auth.signOut();
      if (error) throw error;
      state.currentUserId = null;
      state.activeRole = "student";
      state.activeTab = "dashboard";
      dataReady = false;
      closeModals();
      render();
      showToast("You have been logged out.");
    } catch (error) {
      console.error("CampusHub could not sign out.", error);
      showToast(error.message || "You could not be signed out.", "error");
    }
  });

  document.getElementById("redeem-key-button").addEventListener("click", () => {
    if (!currentUser()) return;
    clearFormMessage(accessMessage);
    accessModal.hidden = false;
    document.querySelector('#access-form [name="key"]').focus();
  });

  accessModal.addEventListener("submit", async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "access-form") return;
    event.preventDefault();
    const account = currentUser();
    if (!account) return;
    if (account.role !== "student") {
      setFormMessage(accessMessage, "Your account already has elevated access.", true);
      return;
    }
    const submitButton = form.querySelector("button");
    submitButton.disabled = true;
    try {
      const role = await window.CampusHubStore.redeemRoleKey(new FormData(form).get("key"));
      if (!roles[role] || role === "student") throw new Error("The key did not grant a supported role.");
      account.role = role;
      state.activeRole = role;
      state.activeTab = "dashboard";
      form.reset();
      closeModals();
      dataReady = false;
      await bootstrapSession({ id: account.id });
      showToast(`Access activated: ${roles[role].label}.`);
    } catch (error) {
      setFormMessage(accessMessage, error.message || "Access key could not be verified.", true);
    } finally {
      submitButton.disabled = false;
    }
  });

  function requireRole(allowed) {
    if (!allowed.includes(state.activeRole)) {
      showToast("You do not have permission to perform that action.", "error");
      return false;
    }
    return true;
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function formValues(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function offeringFromForm(values) {
    const offering = availableOfferings().find(item => item.id === values.offeringId);
    return offering?.section_id === values.sectionId ? offering : null;
  }

  function recordScheduleChange(description, offering = currentOffering()) {
    state.scheduleHistory.unshift({
      id: generateId("hist"),
      text: description,
      actor: currentUser()?.name || roles[state.activeRole].name,
      at: new Date().toISOString(),
      offeringId: offering?.id,
      sectionId: offering?.section_id
    });
  }

  async function setUserActive(user, active) {
    if (!user || !requireRole(["admin"])) return;
    try {
      await window.CampusHubStore.updateProfile({ ...user, active });
      user.active = active;
      if (!active && user.id === state.currentUserId) {
        await window.CampusHubStore.client.auth.signOut();
        dataReady = false;
        state.currentUserId = null;
        state.activeRole = "student";
        render();
      } else {
        persistActiveOffering();
        dataReady = false;
        await bootstrapSession({ id: state.currentUserId });
      }
      showToast(`Account ${active ? "reactivated" : "deactivated"}.`);
    } catch (error) {
      console.error("CampusHub could not update account status.", error);
      showToast(error.message || "Account status could not be updated.", "error");
      render();
    }
  }

  async function acknowledgeAnnouncement(announcement) {
    if (!requireRole(["student"]) || !announcement || announcement.acknowledgments.includes(activeUserId())) return;
    try {
      await window.CampusHubStore.acknowledge(announcement.id);
      announcement.acknowledgments.push(activeUserId());
      render();
      showToast("Your acknowledgment has been recorded.");
    } catch (error) {
      console.error("CampusHub could not record the acknowledgment.", error);
      showToast(error.message || "Your acknowledgment could not be saved.", "error");
    }
  }

  async function acknowledgeAnnouncementGroup(announcements) {
    if (!requireRole(["student"])) return;
    const pending = announcements.filter(item => !item.archived && !item.acknowledgments.includes(activeUserId()));
    if (!pending.length) return;
    let acknowledged = 0;
    let failure = null;
    for (const item of pending) {
      try {
        await window.CampusHubStore.acknowledge(item.id);
        item.acknowledgments.push(activeUserId());
        acknowledged++;
      } catch (error) {
        console.error(`CampusHub could not record acknowledgment for announcement ${item.id}.`, error);
        failure = error;
        break;
      }
    }
    render();
    if (failure) {
      showToast(
        acknowledged
          ? `${acknowledged} acknowledgment(s) were saved; another target could not be acknowledged. ${failure.message || ""}`.trim()
          : failure.message || "Your acknowledgment could not be saved.",
        "error"
      );
    } else {
      showToast("Your acknowledgment has been recorded for all your selected subjects.");
    }
  }

  async function generateRoleKey(role) {
    if (!requireRole(["admin"])) return;
    try {
      const key = await window.CampusHubStore.issueRoleKey(role);
      const container = document.getElementById("issued-key-container");
      const input = document.getElementById("issued-role-key");
      input.value = key;
      container.classList.remove("hidden");
      input.focus();
      input.select();
      showToast(`${roles[role].label} access key generated. Copy it now; it is shown only once.`);
    } catch (error) {
      console.error("CampusHub could not issue a role key.", error);
      showToast(error.message || "A role key could not be issued.", "error");
    }
  }

  async function refreshSharedData() {
    const userId = state.currentUserId;
    if (!userId) return;
    persistActiveOffering();
    dataReady = false;
    await bootstrapSession({ id: userId });
  }

  function showSectionKey(key) {
    const container = document.getElementById("section-key-container");
    const input = document.getElementById("section-key-output");
    if (!container || !input) return;
    input.value = key;
    container.classList.remove("hidden");
    input.focus();
    input.select();
  }

  nav.addEventListener("click", event => {
    const target = event.target.closest("[data-tab]");
    if (!target) return;
    const tab = target.dataset.tab;
    if ((tab === "management" && state.activeRole !== "admin") ||
      (tab === "subjects" && state.activeRole !== "professor")) {
      showToast(tab === "management" ? "User management is available to administrators only." : "My subjects is available to professors only.", "error");
      return;
    }
    state.activeTab = tab;
    render();
  });

  content.addEventListener("change", event => {
    const announcementCategory = event.target.closest("[data-announcement-category]");
    if (announcementCategory) {
      updateAnnouncementTargetUI(announcementCategory.form);
      const editSubjectContainer = announcementCategory.form.querySelector("[data-edit-subject-container]");
      const editSubjectSelect = announcementCategory.form.querySelector("[data-edit-subject-select]");
      if (editSubjectContainer) editSubjectContainer.classList.toggle("hidden", announcementCategory.value !== "Subject");
      if (editSubjectSelect) {
        editSubjectSelect.required = announcementCategory.value === "Subject";
        if (announcementCategory.value === "Subject" && !editSubjectSelect.value) {
          editSubjectSelect.value = state.announcements.find(item => item.id === announcementCategory.form.elements.id.value)?.offeringId || "";
        }
      }
      return;
    }
    if (event.target.id === "announcement-filter") {
      state.announcementFilter = event.target.value;
      render();
      return;
    }
    const viewSectionSelect = event.target.closest("[data-view-section]");
    if (viewSectionSelect) {
      if (viewSectionSelect.dataset.viewSection === "calendar" && viewSectionSelect.value === "all") {
        state.calendarViewSectionId = "all";
        render();
        return;
      }
      const section = sectionsForViewing().find(item => item.id === viewSectionSelect.value);
      if (!section) return;
      if (viewSectionSelect.dataset.viewSection === "exams") state.examViewSectionId = section.id;
      else if (viewSectionSelect.dataset.viewSection === "calendar") state.calendarViewSectionId = section.id;
      else state.scheduleViewSectionId = section.id;
      render();
      return;
    }
    const allAnnouncementSections = event.target.closest("[data-announcement-all-sections]");
    if (allAnnouncementSections) {
      if (allAnnouncementSections.checked) {
        allAnnouncementSections.form.querySelectorAll("[data-announcement-section]").forEach(check => {
          check.checked = false;
        });
      }
      updateAnnouncementTargetUI(allAnnouncementSections.form);
      return;
    }
    const announcementSection = event.target.closest("[data-announcement-section]");
    if (announcementSection) {
      updateAnnouncementTargetUI(announcementSection.form);
      return;
    }
    const sectionOfferingSelect = event.target.closest("[data-offering-section-select]");
    if (sectionOfferingSelect) {
      const form = sectionOfferingSelect.form;
      const subjectSelect = form?.querySelector("[data-offering-select]");
      if (!subjectSelect) return;
      const offerings = availableOfferings()
        .filter(item => item.section_id === sectionOfferingSelect.value)
        .sort((a, b) => a.subject.localeCompare(b.subject, undefined, { sensitivity: "base" }));
      subjectSelect.replaceChildren(new Option("Select a subject", ""));
      offerings.forEach(offering => {
        const option = new Option(
          `${offering.subject}${offering.course_code ? ` (${offering.course_code})` : ""}`,
          offering.id
        );
        subjectSelect.add(option);
      });
      subjectSelect.disabled = offerings.length === 0;
      if (offerings.length === 1) subjectSelect.value = offerings[0].id;
      return;
    }
    const roleSelect = event.target.closest("[data-user-role]");
    if (roleSelect) {
      const user = state.users.find(item => item.id === roleSelect.dataset.userRole);
      if (user) setUserRole(user, roleSelect.value);
    }
    const sectionSelect = event.target.closest("[data-student-section-select]");
    if (sectionSelect) {
      const user = state.users.find(item => item.id === sectionSelect.dataset.studentSectionSelect);
      const choiceContainer = document.getElementById("student-offering-choices");
      if (user && choiceContainer) choiceContainer.innerHTML = renderStudentOfferingChoices(user, sectionSelect.value, []);
    }
  });

  content.addEventListener("click", async event => {
    const control = event.target.closest("[data-action]");
    if (!control) return;
    const { action, id, target } = control.dataset;
    const announcement = state.announcements.find(item => item.id === id);
    const schedule = state.schedules.find(item => item.id === id);
    const calendarEvent = state.events.find(item => item.id === id);
    const user = state.users.find(item => item.id === id);
    switch (action) {
      case "navigate":
        if (target === "management" && state.activeRole !== "admin") return;
        if (target === "subjects" && state.activeRole !== "professor") return;
        state.activeTab = target;
        render();
        break;
      case "open-professor-section": {
        if (!requireRole(["professor"])) return;
        const sectionId = control.dataset.sectionId;
        const offering = professorAssignedOfferings().find(item => item.section_id === sectionId);
        if (!offering) return showToast("That section is not assigned to you.", "error");
        state.activeOfferingId = offering.id;
        persistActiveOffering();
        if (control.dataset.view === "calendar") state.calendarViewSectionId = sectionId;
        else state.scheduleViewSectionId = sectionId;
        state.activeTab = control.dataset.view === "calendar" ? "calendar" : "timetable";
        render();
        break;
      }
      case "announce-for-offering": {
        if (!requireRole(["professor"])) return;
        const offering = professorAssignedOfferings().find(item => item.id === control.dataset.offeringId);
        if (!offering) return showToast("That subject is not assigned to you.", "error");
        state.activeOfferingId = offering.id;
        persistActiveOffering();
        state.activeTab = "announcements";
        state.showAnnouncementForm = true;
        state.editingAnnouncement = null;
        render();
        break;
      }
      case "open-import":
        openImportDialog();
        break;
      case "open-section-join":
        if (!requireRole(["student"])) return;
        clearFormMessage(document.getElementById("section-message"));
        sectionModal.hidden = false;
        document.querySelector('#section-join-form [name="key"]').focus();
        break;
      case "export-schedules":
        exportScheduleData();
        break;
      case "issue-role-key":
        generateRoleKey(control.dataset.role);
        break;
      case "rotate-section-key":
        if (!requireRole(["admin"])) return;
        try {
          const key = await window.CampusHubStore.rotateSectionKey(id);
          showSectionKey(key);
          showToast("Section key rotated. The previous key is no longer valid; copy this key now.");
        } catch (error) {
          console.error("CampusHub could not rotate the section key.", error);
          showToast(error.message || "The section key could not be rotated.", "error");
        }
        break;
      case "toggle-section-active": {
        if (!requireRole(["admin"])) return;
        const section = state.sections.find(item => item.id === id);
        if (!section) return;
        try {
          await window.CampusHubStore.setSectionActive(id, !section.active);
          await refreshSharedData();
          showToast(`Section ${section.active ? "archived" : "restored"}.`);
        } catch (error) {
          console.error("CampusHub could not update section status.", error);
          showToast(error.message || "Section status could not be updated.", "error");
        }
        break;
      }
      case "delete-section": {
        if (!requireRole(["admin"])) return;
        const section = state.sections.find(item => item.id === id);
        if (!section || !confirm(`Permanently delete section "${section.name}"?\n\nThis also deletes its class offerings, section memberships, schedules, exams, announcements, acknowledgments, and schedule history. Student and staff accounts will not be deleted. This cannot be undone.`)) return;
        try {
          await window.CampusHubStore.deleteSection(id);
          await refreshSharedData();
          showToast("Section and its linked academic data were permanently deleted.");
        } catch (error) {
          console.error("CampusHub could not permanently delete the section.", error);
          showToast(error.message || "The section could not be deleted.", "error");
        }
        break;
      }
      case "duplicate-section": {
        if (!requireRole(["admin"])) return;
        const section = state.sections.find(item => item.id === id);
        if (!section) return;
        const name = prompt("Name for the duplicated section:", `${section.name} (Copy)`);
        if (name === null) return;
        if (name.trim().length < 2 || name.trim().length > 80) {
          return showToast("Section name must be between 2 and 80 characters.", "error");
        }
        try {
          const duplicate = await window.CampusHubStore.duplicateSection(id, name.trim());
          await refreshSharedData();
          showSectionKey(duplicate.join_key);
          showToast(`${duplicate.name} was created with its subjects, professor assignments, schedules, and exams. Copy its new join key now.`);
        } catch (error) {
          console.error("CampusHub could not duplicate the section.", error);
          showToast(error.message || "The section could not be duplicated.", "error");
        }
        break;
      }
      case "toggle-offering-active": {
        if (!requireRole(["admin"])) return;
        const offering = state.offerings.find(item => item.id === id);
        if (!offering) return;
        try {
          await window.CampusHubStore.setOfferingActive(id, !offering.active);
          await refreshSharedData();
          showToast(`Subject ${offering.active ? "archived" : "restored"}.`);
        } catch (error) {
          console.error("CampusHub could not update class offering status.", error);
          showToast(error.message || "Subject status could not be updated.", "error");
        }
        break;
      }
      case "delete-offering": {
        if (!requireRole(["admin"])) return;
        const offering = state.offerings.find(item => item.id === id);
        if (!offering || !confirm(`Permanently delete "${offering.subject}"${offering.course_code ? ` (${offering.course_code})` : ""}?\n\nThis also deletes its staff assignments, student enrollments, schedules, exams, announcements, acknowledgments, and schedule history. Accounts and the parent section will not be deleted. This cannot be undone.`)) return;
        try {
          await window.CampusHubStore.deleteOffering(id);
          await refreshSharedData();
          showToast("Subject and its linked academic data were permanently deleted.");
        } catch (error) {
          console.error("CampusHub could not permanently delete the class offering.", error);
          showToast(error.message || "The class offering could not be deleted.", "error");
        }
        break;
      }
      case "remove-offering-staff":
        if (!requireRole(["admin"])) return;
        try {
          await window.CampusHubStore.assignStaff(control.dataset.offeringId, control.dataset.profileId, control.dataset.role, false);
          await refreshSharedData();
          showToast("Staff assignment removed.");
        } catch (error) {
          console.error("CampusHub could not remove the staff assignment.", error);
          showToast(error.message || "Staff assignment could not be removed.", "error");
        }
        break;
      case "clear-section-officer":
        if (!requireRole(["admin"])) return;
        try {
          await window.CampusHubStore.assignSectionOfficer(id, null);
          await refreshSharedData();
          showToast("The section officer assignment was removed.");
        } catch (error) {
          console.error("CampusHub could not remove the section officer.", error);
          showToast(error.message || "The section officer could not be removed.", "error");
        }
        break;
      case "remove-offering-student":
        if (!requireRole(["admin"])) return;
        try {
          await window.CampusHubStore.setOfferingEnrollment(control.dataset.offeringId, control.dataset.profileId, false);
          await refreshSharedData();
          showToast("The student was removed from this subject.");
        } catch (error) {
          console.error("CampusHub could not remove the student from the subject.", error);
          showToast(error.message || "The student could not be removed from the subject.", "error");
        }
        break;
      case "toggle-announcement-form":
        if (!requireRole(["professor", "officer", "admin"]) || !canManageAnnouncements()) return;
        state.showAnnouncementForm = !state.showAnnouncementForm;
        render();
        break;
      case "toggle-professor-announcement-form":
        if (!requireRole(["professor"])) return;
        state.showProfessorAnnouncementForm = !state.showProfessorAnnouncementForm;
        render();
        break;
      case "cancel-professor-announcement-form":
        state.showProfessorAnnouncementForm = false;
        render();
        break;
      case "cancel-announcement-form":
        state.editingAnnouncement = null; state.showAnnouncementForm = false; render();
        break;
      case "edit-announcement":
        if (!requireRole(["professor", "officer", "admin"])) return;
        if (!announcement || !(state.activeRole === "admin" || announcement.authorRole === state.activeRole)) return showToast("You can only edit announcements posted by your role.", "error");
        if (!announcementTargetOfferings().some(offering => offering.id === announcement.offeringId)) return showToast("You cannot manage announcements for this subject.", "error");
        if (state.activeRole === "officer" && !officerHasOffering(announcement.offeringId)) return showToast("You are not assigned to manage this subject.", "error");
        state.editingAnnouncement = id; state.showAnnouncementForm = true; render();
        break;
      case "archive-announcement":
        if (!requireRole(["professor", "officer", "admin"])) return;
        if (!announcement || !(state.activeRole === "admin" || announcement.authorRole === state.activeRole)) return showToast("You can only archive announcements posted by your role.", "error");
        if (!announcementTargetOfferings().some(offering => offering.id === announcement.offeringId)) return showToast("You cannot manage announcements for this subject.", "error");
        if (state.activeRole === "officer" && !officerHasOffering(announcement.offeringId)) return showToast("You are not assigned to manage this subject.", "error");
        announcement.archived = true; saveState(); render(); showToast("Announcement archived.");
        break;
      case "restore-announcement":
        if (!requireRole(["admin"])) return;
        if (!announcement) return;
        announcement.archived = false; saveState(); render(); showToast("Announcement restored.");
        break;
      case "delete-announcement":
        if (!requireRole(["professor", "officer", "admin"])) return;
        if (!announcement || !(state.activeRole === "admin" || announcement.authorRole === state.activeRole)) return showToast("You can only delete announcements posted by your role.", "error");
        if (!announcementTargetOfferings().some(offering => offering.id === announcement.offeringId)) return showToast("You cannot manage announcements for this subject.", "error");
        if (state.activeRole === "officer" && !officerHasOffering(announcement.offeringId)) return showToast("You are not assigned to manage this subject.", "error");
        if (confirm("Delete this announcement permanently?")) {
          if (await deleteSharedRecord("announcements", id)) showToast("Announcement deleted.");
        }
        break;
      case "acknowledge":
        acknowledgeAnnouncement(announcement);
        break;
      case "acknowledge-announcement-group": {
        const announcements = control.dataset.ids.split(",")
          .map(announcementId => state.announcements.find(item => item.id === announcementId))
          .filter(Boolean);
        acknowledgeAnnouncementGroup(announcements);
        break;
      }
      case "toggle-schedule-form":
        if (!requireRole(["professor", "officer", "admin"]) || !canManageSchedules()) return;
        state.showScheduleForm = !state.showScheduleForm; render();
        break;
      case "cancel-schedule-form":
        state.editingSchedule = null; state.showScheduleForm = false; render();
        break;
      case "edit-schedule":
        if (!requireRole(["professor", "officer", "admin"])) return;
        if (schedule && state.activeRole === "officer" && !officerHasOffering(schedule.offeringId)) return showToast("You are not assigned to manage this subject.", "error");
        if (schedule && (canManageAcrossOfferings() || schedule.offeringId === state.activeOfferingId)) { state.editingSchedule = id; state.showScheduleForm = true; render(); }
        else if (schedule) showToast("Select the class offering that contains this schedule.", "error");
        break;
      case "delete-schedule":
        if (!requireRole(["professor", "officer", "admin"])) return;
        if (schedule && state.activeRole === "officer" && !officerHasOffering(schedule.offeringId)) return showToast("You are not assigned to manage this subject.", "error");
        if (schedule && !canManageAcrossOfferings() && schedule.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this schedule.", "error");
        if (schedule && confirm(`Remove ${schedule.subject} from the timetable?`)) {
          const offering = state.offerings.find(item => item.id === schedule.offeringId) || null;
          if (await deleteSharedRecord("schedules", id, () => {
            recordScheduleChange(`${schedule.subject} removed from ${schedule.day} timetable`, offering);
          })) showToast("Class removed from timetable.");
        }
        break;
      case "toggle-event-form":
        if (!requireRole(["professor", "admin"])) return;
        state.showEventForm = !state.showEventForm; render();
        break;
      case "toggle-exam-form":
        if (!requireRole(["professor", "admin"])) return;
        state.showExamForm = !state.showExamForm; render();
        break;
      case "cancel-exam-form":
        state.editingExam = null; state.showExamForm = false; render();
        break;
      case "edit-exam":
        if (!requireRole(["professor", "admin"])) return;
        if (calendarEvent && !canManageAcrossOfferings() && calendarEvent.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this assessment.", "error");
        if (calendarEvent && ["Examination", "Quiz"].includes(calendarEvent.type)) {
          state.editingExam = id; state.showExamForm = true; render();
        }
        break;
      case "delete-exam":
        if (!requireRole(["professor", "admin"])) return;
        if (calendarEvent && !canManageAcrossOfferings() && calendarEvent.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this assessment.", "error");
        if (calendarEvent && ["Examination", "Quiz"].includes(calendarEvent.type) && confirm(`Remove "${calendarEvent.title}" from the exam timetable?`)) {
          if (await deleteSharedRecord("events", id)) showToast("Assessment removed from the exam timetable.");
        }
        break;
      case "cancel-event-form":
        state.editingEvent = null; state.showEventForm = false; render();
        break;
      case "edit-event":
        if (!requireRole(["professor", "admin"])) return;
        if (calendarEvent && !canManageAcrossOfferings() && calendarEvent.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this calendar item.", "error");
        if (calendarEvent) { state.editingEvent = id; state.showEventForm = true; render(); }
        break;
      case "delete-event":
        if (!requireRole(["professor", "admin"])) return;
        if (calendarEvent && !canManageAcrossOfferings() && calendarEvent.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this calendar item.", "error");
        if (calendarEvent && confirm(`Delete "${calendarEvent.title}" from the calendar?`)) {
          if (await deleteSharedRecord("events", id)) showToast("Calendar item deleted.");
        }
        break;
      case "cancel-user-form":
        state.editingUser = null; state.showUserForm = false; render();
        break;
      case "edit-user":
        if (!requireRole(["admin"])) return;
        if (user) { state.editingUser = id; state.showUserForm = true; render(); }
        break;
      case "toggle-user-active":
        if (!requireRole(["admin"])) return;
        if (user) setUserActive(user, !user.active);
        break;
    }
  });

  async function handleFormSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const formId = form.getAttribute("id");
    if (formId === "password-form") {
      event.preventDefault();
      const account = currentUser();
      const values = formValues(form);
      const message = document.getElementById("password-message");
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        if (!account) throw new Error("Please log in again to change your password.");
        if (values.newPassword.length < 8) throw new Error("Your new password must contain at least 8 characters.");
        if (values.newPassword !== values.confirmPassword) throw new Error("The new passwords do not match.");
        await window.CampusHubStore.changePassword(values.currentPassword, values.newPassword);
        form.reset();
        setFormMessage(message, "Your password has been updated.");
      } catch (error) {
        setFormMessage(message, error.message || "Password could not be updated.", true);
      } finally {
        button.disabled = false;
      }
      return;
    }
    const offeringForm = formId?.startsWith("offering-form-");
    const sectionEditForm = formId?.startsWith("section-edit-form-");
    const offeringEditForm = formId?.startsWith("offering-edit-form-");
    const staffForm = formId?.startsWith("staff-assignment-form-");
    const officerForm = formId?.startsWith("section-officer-form-");
    const enrollmentForm = formId?.startsWith("enrollment-form-");
    if (!["announcement-form", "professor-announcement-form", "schedule-form", "event-form", "exam-event-form", "user-form", "section-form"].includes(formId) && !offeringForm && !sectionEditForm && !offeringEditForm && !staffForm && !officerForm && !enrollmentForm) return;
    event.preventDefault();
    const values = formValues(form);
    if (formId === "section-form") {
      if (!requireRole(["admin"])) return;
      try {
        const section = await window.CampusHubStore.createSection(values.name.trim());
        await refreshSharedData();
        showSectionKey(section.join_key);
        showToast(`${section.name} was created. Copy its reusable join key now.`);
      } catch (error) {
        console.error("CampusHub could not create the section.", error);
        showToast(error.message || "Section could not be created.", "error");
      }
    } else if (offeringForm) {
      if (!requireRole(["admin"])) return;
      try {
        await window.CampusHubStore.createOffering(form.dataset.sectionId, values.subject.trim(), values.courseCode.trim());
        await refreshSharedData();
        showToast(`${values.subject.trim()} was added to the section.`);
      } catch (error) {
        console.error("CampusHub could not create the class offering.", error);
        showToast(error.message || "Subject could not be created.", "error");
      }
    } else if (sectionEditForm) {
      if (!requireRole(["admin"])) return;
      try {
        await window.CampusHubStore.updateSection(form.dataset.sectionId, values.name.trim());
        await refreshSharedData();
        showToast("Section name updated.");
      } catch (error) {
        console.error("CampusHub could not update the section name.", error);
        showToast(error.message || "Section name could not be updated.", "error");
      }
    } else if (offeringEditForm) {
      if (!requireRole(["admin"])) return;
      try {
        await window.CampusHubStore.updateOffering(form.dataset.offeringId, values.subject.trim(), values.courseCode.trim());
        await refreshSharedData();
        showToast("Subject updated.");
      } catch (error) {
        console.error("CampusHub could not update the class offering.", error);
        showToast(error.message || "Subject could not be updated. Check for another subject with the same course code.", "error");
      }
    } else if (staffForm) {
      if (!requireRole(["admin"])) return;
      try {
        await window.CampusHubStore.assignStaff(form.dataset.offeringId, values.profileId, form.dataset.staffRole, true);
        await refreshSharedData();
        showToast(`${roles[form.dataset.staffRole].label} assigned to the subject.`);
      } catch (error) {
        console.error("CampusHub could not assign staff to the subject.", error);
        showToast(error.message || "Staff assignment could not be completed.", "error");
      }
    } else if (officerForm) {
      if (!requireRole(["admin"])) return;
      try {
        await window.CampusHubStore.assignSectionOfficer(form.dataset.sectionId, values.profileId);
        await refreshSharedData();
        showToast("The section class officer was assigned.");
      } catch (error) {
        console.error("CampusHub could not assign the section officer.", error);
        showToast(error.message || "The section officer could not be assigned.", "error");
      }
    } else if (enrollmentForm) {
      if (!requireRole(["admin"])) return;
      try {
        await window.CampusHubStore.setOfferingEnrollment(form.dataset.offeringId, values.profileId, true);
        await refreshSharedData();
        showToast("The student was enrolled in this subject.");
      } catch (error) {
        console.error("CampusHub could not enroll the student in the subject.", error);
        showToast(error.message || "The student could not be enrolled in the subject.", "error");
      }
    } else if (formId === "professor-announcement-form") {
      if (!requireRole(["professor"])) return;
      const assignedOfferings = professorAssignedOfferings();
      const targets = announcementTargetsFromForm(form, assignedOfferings);
      if (!targets) return;
      state.showProfessorAnnouncementForm = false;
      publishAnnouncements({
        targets,
        title: values.title.trim(),
        category: values.category,
        content: values.content.trim(),
        urgent: form.elements.urgent.checked,
        authorRole: "professor"
      });
    } else if (formId === "announcement-form") {
      if (!requireRole(["professor", "officer", "admin"])) return;
      const itemToEdit = values.id ? state.announcements.find(entry => entry.id === values.id) : null;
      if (!itemToEdit) {
        const targets = announcementTargetsFromForm(form, announcementTargetOfferings());
        if (!targets) return;
        state.showAnnouncementForm = false;
        publishAnnouncements({
          targets,
          title: values.title.trim(),
          category: values.category,
          content: values.content.trim(),
          urgent: form.elements.urgent.checked,
          authorRole: state.activeRole
        });
        return;
      }
      const editOfferingId = values.category === "Subject"
        ? values.subjectOfferingId
        : itemToEdit?.offeringId || state.activeOfferingId;
      const targetOffering = state.offerings.find(offering => offering.id === editOfferingId);
      if (!targetOffering || !announcementTargetOfferings().some(offering => offering.id === targetOffering.id)) return showToast("Choose an active subject from a section you can manage.", "error");
      if (state.activeRole === "officer" && !officerHasOffering(targetOffering.id)) return showToast("You are not assigned to manage this subject.", "error");
      if (values.id) {
        const item = itemToEdit;
        if (!item || !(state.activeRole === "admin" || item.authorRole === state.activeRole)) return showToast("You cannot edit this announcement.", "error");
        if (!announcementTargetOfferings().some(offering => offering.id === item.offeringId)) return showToast("You cannot manage announcements for this subject.", "error");
        Object.assign(item, { title: values.title.trim(), subject: targetOffering.subject, category: values.category === "Subject" ? targetOffering.subject : values.category, content: values.content.trim(), urgent: form.elements.urgent.checked, offeringId: targetOffering.id, sectionId: targetOffering.section_id });
        showToast("Announcement updated.");
      } else {
        state.announcements.unshift({ id: generateId("ann"), title: values.title.trim(), subject: targetOffering.subject, category: values.category, content: values.content.trim(), urgent: form.elements.urgent.checked, author: currentUser()?.name || roles[state.activeRole].name, authorRole: state.activeRole, createdAt: new Date().toISOString(), archived: false, acknowledgments: [], offeringId: targetOffering.id, sectionId: targetOffering.section_id });
        showToast("Announcement published.");
      }
      state.activeOfferingId = targetOffering.id;
      persistActiveOffering();
      state.showAnnouncementForm = false; state.editingAnnouncement = null; saveState(); render();
    } else if (formId === "schedule-form") {
      if (!requireRole(["professor", "officer", "admin"])) return;
      if (values.start >= values.end) return showToast("End time must be later than start time.", "error");
      const targetOffering = offeringFromForm(values);
      if (!targetOffering) return showToast("Choose an active subject in a section you can manage.", "error");
      if (state.activeRole === "officer" && !officerHasOffering(targetOffering.id)) return showToast("You are not assigned to manage this subject.", "error");
      const previous = values.id ? state.schedules.find(item => item.id === values.id) : null;
      if (previous) {
        if (!canManageAcrossOfferings() && previous.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this schedule.", "error");
        Object.assign(previous, { day: values.day, start: values.start, end: values.end, subject: targetOffering.subject, room: values.room.trim(), offeringId: targetOffering.id, sectionId: targetOffering.section_id });
        recordScheduleChange(`${previous.subject} updated: ${previous.day}, ${previous.start}–${previous.end}, ${previous.room}`, targetOffering);
        showToast("Timetable updated.");
      } else {
        const created = { id: generateId("sch"), day: values.day, start: values.start, end: values.end, subject: targetOffering.subject, room: values.room.trim(), offeringId: targetOffering.id, sectionId: targetOffering.section_id };
        state.schedules.push(created); recordScheduleChange(`${created.subject} added to ${created.day}, ${created.start}–${created.end}`, targetOffering);
        showToast("Class added to timetable.");
      }
      state.activeOfferingId = targetOffering.id;
      state.scheduleViewSectionId = targetOffering.section_id;
      persistActiveOffering();
      state.showScheduleForm = false; state.editingSchedule = null; saveState(); render();
    } else if (formId === "event-form" || formId === "exam-event-form") {
      if (!requireRole(["professor", "admin"])) return;
      if (formId === "exam-event-form" && !["Examination", "Quiz"].includes(values.type)) return showToast("Choose an exam or quiz type.", "error");
      const targetOffering = offeringFromForm(values);
      if (!targetOffering) return showToast("Choose an active subject in a section you can manage.", "error");
      const date = new Date(values.date);
      if (Number.isNaN(date.getTime())) return showToast("Enter a valid date and time.", "error");
      const existing = values.id ? state.events.find(item => item.id === values.id) : null;
      const update = {
        title: formId === "exam-event-form"
          ? existing?.title || `${values.type} — ${targetOffering.subject}`
          : values.title.trim(),
        type: values.type,
        subject: targetOffering.subject,
        date: date.toISOString(),
        location: values.location.trim(),
        details: values.details.trim(),
        offeringId: targetOffering.id,
        sectionId: targetOffering.section_id
      };
      if (existing) {
        if (!canManageAcrossOfferings() && existing.offeringId !== state.activeOfferingId) return showToast("Select the class offering that contains this calendar item.", "error");
        Object.assign(existing, update); showToast("Calendar item updated.");
      }
      else {
        state.events.push({ id: generateId("evt"), ...update });
        showToast("Calendar item added.");
      }
      state.activeOfferingId = targetOffering.id;
      persistActiveOffering();
      if (formId === "exam-event-form") {
        state.examViewSectionId = targetOffering.section_id;
        state.showExamForm = false;
        state.editingExam = null;
      } else {
        if (state.calendarViewSectionId !== "all") state.calendarViewSectionId = targetOffering.section_id;
        state.showEventForm = false;
        state.editingEvent = null;
      }
      saveState(); render();
    } else if (formId === "user-form") {
      if (!requireRole(["admin"])) return;
      const submitButton = form.querySelector("button[type='submit'], button:not([type])");
      if (submitButton) submitButton.disabled = true;
      const existing = state.users.find(entry => entry.id === values.id);
      if (!existing) {
        if (submitButton) submitButton.disabled = false;
        return showToast("Account not found.", "error");
      }
      try {
        const offeringIds = [...form.querySelectorAll('input[name="offeringIds"]:checked')].map(input => input.value);
        const studentOfferingIds = [...form.querySelectorAll('input[name="studentOfferingIds"]:checked')].map(input => input.value);
        if (existing.role === "student") {
          await window.CampusHubStore.setStudentClassAssignments(existing.id, values.sectionId, studentOfferingIds);
        } else if (existing.role === "professor") {
          await window.CampusHubStore.setProfessorOfferings(existing.id, offeringIds);
        } else if (existing.role === "officer") {
          await window.CampusHubStore.setStudentClassAssignments(existing.id, values.sectionId, studentOfferingIds);
          await window.CampusHubStore.setOfficerOfferings(existing.id, offeringIds);
        }
        await window.CampusHubStore.updateProfile({ ...existing, name: values.name.trim() });
        persistActiveOffering();
        state.showUserForm = false;
        state.editingUser = null;
        dataReady = false;
        await bootstrapSession({ id: state.currentUserId });
        showToast(`${values.name.trim()}'s account and class assignments were updated.`);
      } catch (error) {
        console.error("CampusHub could not update the account or class assignments.", error);
        showToast(error.message || "The account or class assignments could not be updated.", "error");
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    }
  }

  content.addEventListener("submit", handleFormSubmit);
  userEditModal.addEventListener("submit", handleFormSubmit);
  userEditModal.addEventListener("click", event => {
    const action = event.target.closest("[data-action]");
    if (action?.dataset.action === "cancel-user-form") {
      state.showUserForm = false;
      state.editingUser = null;
      render();
      return;
    }
    if (event.target === userEditModal) {
      closeModals();
      render();
    }
  });

  state = initialState();
  try {
    const preferences = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    if (navItems.some(item => item.id === preferences.activeTab)) state.activeTab = preferences.activeTab;
    if (typeof preferences.announcementFilter === "string") state.announcementFilter = preferences.announcementFilter;
  } catch (error) {
    console.error("CampusHub could not load browser preferences.", error);
  }
  if (!window.CampusHubStore.ready) {
    render();
    showToast("Add your Supabase URL and anon key to supabase-config.js to connect shared storage.", "error");
  } else {
    window.CampusHubStore.client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") setTimeout(() => bootstrapSession(null), 0);
      else if (event === "SIGNED_IN") setTimeout(() => bootstrapSession(session?.user), 0);
    });
    window.CampusHubStore.client.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        return bootstrapSession(data.session?.user || null);
      })
      .catch(error => {
        console.error("CampusHub could not restore the authentication session.", error);
        render();
        showToast(error.message || "The sign-in session could not be restored.", "error");
      });
  }
})();
