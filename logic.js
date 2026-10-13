const MONTH_NAMES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

const LEVELS = [
  { max: 29, level: 1 },
  { max: 59, level: 2 },
  { max: 119, level: 3 },
  { max: Infinity, level: 4 }
];

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateText, amount) {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(year, month - 1, day + amount, 12);
  return localDate(date);
}

function isValidDate(text) {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(5, 7));
  const day = Number(text.slice(8, 10));
  const date = new Date(year, month - 1, day, 12);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isFutureDate(dateText, today) {
  return dateText > today;
}

function mondayOfWeek(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  const offset = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return addDays(localDate(date), -offset);
}

function sundayOfWeek(dateText) {
  return addDays(mondayOfWeek(dateText), 6);
}

function sumMinutesByDay(sessions, today) {
  const totalByDay = new Map();
  for (const session of sessions || []) {
    if (!session || !isValidDate(session.fecha)) continue;
    if (isFutureDate(session.fecha, today)) continue;
    const minutes = Number(session.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    const current = totalByDay.get(session.fecha) || 0;
    totalByDay.set(session.fecha, current + minutes);
  }
  return totalByDay;
}

function sumMinutesInWeek(sessions, today) {
  const startOfWeek = mondayOfWeek(today);
  const endOfWeek = sundayOfWeek(today);
  let total = 0;
  for (const session of sessions || []) {
    if (!session || !isValidDate(session.fecha)) continue;
    if (session.fecha < startOfWeek || session.fecha > endOfWeek) continue;
    if (isFutureDate(session.fecha, today)) continue;
    const minutes = Number(session.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    total += minutes;
  }
  return total;
}

function groupTopicsByDay(sessions, today) {
  const topicsByDay = new Map();
  for (const session of sessions || []) {
    if (!session || !isValidDate(session.fecha)) continue;
    if (isFutureDate(session.fecha, today)) continue;
    if (typeof session.tema !== "string") continue;
    if (!topicsByDay.has(session.fecha)) topicsByDay.set(session.fecha, []);
    topicsByDay.get(session.fecha).push(session.tema);
  }
  return topicsByDay;
}

function intensityLevel(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return 0;
  for (const { max, level } of LEVELS) {
    if (value <= max) return level;
  }
  return 4;
}

function mapRange(sessions, today) {
  let earliest = null;
  for (const session of sessions || []) {
    if (!session || !isValidDate(session.fecha)) continue;
    if (isFutureDate(session.fecha, today)) continue;
    if (earliest === null || session.fecha < earliest) earliest = session.fecha;
  }
  if (earliest === null) return null;
  return { start: mondayOfWeek(earliest), end: sundayOfWeek(today) };
}

function monthLabels(columns) {
  const labels = [];
  const seen = new Set();
  let previousKey = null;
  for (let i = 0; i < columns.length; i++) {
    const weekDays = columns[i].map((cell) => cell.date);
    let key = null;
    for (const dateText of weekDays) {
      if (dateText.slice(8, 10) === "01") {
        key = dateText.slice(0, 7);
        break;
      }
    }
    if (key === null && i === 0) {
      key = weekDays[0].slice(0, 7);
    }
    if (key === null || key === previousKey) continue;
    previousKey = key;
    const monthName = MONTH_NAMES[Number(key.slice(5, 7)) - 1];
    const alreadySeen = seen.has(monthName);
    seen.add(monthName);
    const showYear = labels.length === 0 || key.slice(5, 7) === "01" || alreadySeen;
    const text = showYear ? `${monthName} ${key.slice(0, 4)}` : monthName;
    labels.push({ columnIndex: i, text });
  }
  return labels;
}

function buildHeatmap(sessions, today) {
  const minutesByDay = sumMinutesByDay(sessions, today);
  const topicsByDay = groupTopicsByDay(sessions, today);
  const range = mapRange(sessions, today);
  if (range === null) {
    return { empty: true, columns: [], monthLabels: [] };
  }

  const columns = [];
  let week = [];
  let day = range.start;
  let weekdayIndex = 0;

  while (true) {
    const future = isFutureDate(day, today);
    const minutes = minutesByDay.get(day) || 0;
    let level;
    if (future) {
      level = "noData";
    } else if (minutes > 0) {
      level = intensityLevel(minutes);
    } else {
      level = 0;
    }
    week.push({ date: day, future, level, minutes, topics: topicsByDay.get(day) || [] });

    if (day === range.end) break;
    day = addDays(day, 1);
    weekdayIndex = (weekdayIndex + 1) % 7;
    if (weekdayIndex === 0) {
      columns.push(week);
      week = [];
    }
  }
  columns.push(week);

  return { empty: false, columns, monthLabels: monthLabels(columns) };
}

function isValidWeeklyGoal(value) {
  return Number.isInteger(value) && value > 0;
}

function parseWeeklyGoal(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string" && raw.trim() === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return isValidWeeklyGoal(value) ? value : null;
}

function weeklyGoalProgress(goal, minutesInWeek) {
  const normalizedMinutes = Number(minutesInWeek);
  const minutes = Number.isFinite(normalizedMinutes) && normalizedMinutes > 0
    ? normalizedMinutes
    : 0;
  const hasGoal = isValidWeeklyGoal(goal);
  const goalMinutes = hasGoal ? goal : null;

  let percent = 0;
  let remaining = 0;
  let status;
  let statusText;
  let showCongrats = false;
  let showAbove = false;

  if (!hasGoal) {
    status = "sin-objetivo";
    statusText = "Sin objetivo";
  } else {
    percent = Math.min(100, (minutes / goal) * 100);
    remaining = Math.max(0, goal - minutes);
    if (minutes < goal) {
      status = "en-curso";
      statusText = "En curso";
    } else if (minutes === goal) {
      status = "conseguido";
      statusText = "Conseguido";
      showCongrats = true;
    } else {
      status = "por-encima";
      statusText = "Conseguido";
      showCongrats = true;
      showAbove = true;
    }
  }

  return {
    hasGoal,
    goalMinutes,
    minutes,
    percent,
    remaining,
    status,
    statusText,
    showCongrats,
    showAbove
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    localDate,
    addDays,
    isValidDate,
    isFutureDate,
    mondayOfWeek,
    sundayOfWeek,
    sumMinutesByDay,
    sumMinutesInWeek,
    isValidWeeklyGoal,
    parseWeeklyGoal,
    weeklyGoalProgress,
    groupTopicsByDay,
    intensityLevel,
    mapRange,
    buildHeatmap,
    monthLabels,
    LEVELS
  };
}