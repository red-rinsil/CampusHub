(() => {
  "use strict";

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const HEADERS = ["Type", "Subject", "Professor", "Classroom", "DayOfWeek", "Time", "EndTime", "Date", "Title", "Details"];
  const TYPE_ALIASES = {
    class: "class",
    exam: "Examination",
    examination: "Examination",
    quiz: "Quiz"
  };

  function readCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    let afterQuote = false;
    let line = 1;
    let rowLine = 1;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (quoted) {
        if (char === '"' && text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
          afterQuote = true;
        } else {
          cell += char;
          if (char === "\n") line += 1;
        }
        continue;
      }

      if (afterQuote && char !== "," && char !== "\r" && char !== "\n" && !/\s/.test(char)) {
        throw new Error(`Unexpected character after closing quote near line ${line}.`);
      }
      if (char === '"') {
        if (cell.trim()) throw new Error(`Unexpected quote in an unquoted value near line ${line}.`);
        cell = "";
        quoted = true;
        afterQuote = false;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
        afterQuote = false;
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && text[index + 1] === "\n") index += 1;
        row.push(cell.trim());
        if (row.some(value => value !== "")) rows.push({ line: rowLine, values: row });
        row = [];
        cell = "";
        afterQuote = false;
        line += 1;
        rowLine = line;
      } else {
        cell += char;
      }
    }

    if (quoted) throw new Error(`Unclosed quoted value starting before line ${line}.`);
    row.push(cell.trim());
    if (row.some(value => value !== "")) rows.push({ line: rowLine, values: row });
    return rows;
  }

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  function parse(text) {
    const records = [];
    const errors = [];
    const rows = readCsv(String(text).replace(/^\uFEFF/, ""));
    if (!rows.length) return { records, errors: ["The file is empty."] };

    const headerNames = rows[0].values.map(value => value.toLowerCase().replace(/[\s_-]/g, ""));
    const headerIndexes = new Map();
    headerNames.forEach((value, index) => {
      if (value) headerIndexes.set(value, index);
    });
    for (const required of ["type", "subject", "time"]) {
      if (!headerIndexes.has(required)) errors.push(`Header row is missing the required "${required}" column.`);
    }
    if (!headerIndexes.has("classroom") && !headerIndexes.has("location")) {
      errors.push('Header row needs a "Classroom" or "Location" column.');
    }
    if (errors.length) return { records, errors };

    const get = (values, ...names) => {
      for (const name of names) {
        const index = headerIndexes.get(name);
        if (index !== undefined) return (values[index] || "").trim();
      }
      return "";
    };

    for (const row of rows.slice(1)) {
      const [line, values] = [row.line, row.values];
      const rowErrors = [];
      if (values.length !== rows[0].values.length) {
        rowErrors.push(`expected ${rows[0].values.length} columns, found ${values.length}`);
      }

      const typeInput = get(values, "type").toLowerCase();
      const type = TYPE_ALIASES[typeInput];
      const subject = get(values, "subject");
      const instructor = get(values, "professor", "instructor");
      const room = get(values, "classroom", "location");
      const dayInput = get(values, "dayofweek", "day");
      const time = get(values, "time", "starttime");
      const endTime = get(values, "endtime");
      const date = get(values, "date");
      const title = get(values, "title");
      const details = get(values, "details", "description");

      if (!type) rowErrors.push('Type must be "Class", "Exam", "Examination", or "Quiz".');
      if (!subject) rowErrors.push("Subject is required.");
      if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) rowErrors.push('Time must use 24-hour HH:MM format (for example, "09:30").');
      if (!room) rowErrors.push("Classroom/Location is required.");

      if (type === "class") {
        const day = DAYS.find(value => value.toLowerCase() === dayInput.toLowerCase());
        if (!day) rowErrors.push("DayOfWeek must be a full weekday name (Monday–Sunday).");
        if (!instructor) rowErrors.push("Professor is required for class schedules.");
        if (!endTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) rowErrors.push('EndTime must use 24-hour HH:MM format.');
        else if (time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && endTime <= time) rowErrors.push("EndTime must be later than Time.");
        if (date && !validDate(date)) rowErrors.push('Date must use a real calendar date in YYYY-MM-DD format.');
        if (date && validDate(date) && day && (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7 !== DAYS.indexOf(day)) {
          rowErrors.push("Date does not match DayOfWeek.");
        }
        if (!rowErrors.length) records.push({
          kind: "class",
          line,
          subject,
          instructor,
          room,
          day,
          start: time,
          end: endTime,
          date: date || null
        });
      } else if (type === "Examination" || type === "Quiz") {
        if (!date || !validDate(date)) rowErrors.push('Exam Date is required and must use YYYY-MM-DD format.');
        if (!rowErrors.length) records.push({
          kind: "exam",
          line,
          type,
          subject,
          title: title || `${subject} ${type === "Quiz" ? "quiz" : "examination"}`,
          instructor,
          room,
          date,
          time,
          details
        });
      }

      if (rowErrors.length) errors.push(`Row ${line}: ${rowErrors.join(" ")}`);
    }

    return { records, errors };
  }

  function template() {
    return `${HEADERS.join(",")}\r\nClass,Data Structures,Replace with assigned professor,Engineering 204,Monday,09:00,10:30,,,\r\nExam,Data Structures,,Engineering Hall 204,,10:00,,2026-11-12,Midterm examination,Bring your student ID\r\nQuiz,Database Systems,,Technology 108,,13:30,,2026-11-18,Database quiz,Chapters 1-4`;
  }

  window.CampusHubImport = Object.freeze({ parse, template });
})();
