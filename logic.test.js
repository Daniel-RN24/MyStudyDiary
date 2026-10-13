const test = require("node:test");
const assert = require("node:assert/strict");

const {
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
} = require("./logic.js");

test("localDate devuelve texto AAAA-MM-DD con ceros", () => {
  assert.equal(localDate(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(localDate(new Date(2026, 10, 3)), "2026-11-03");
});

test("localDate usa componentes locales, no UTC", () => {
  assert.equal(localDate(new Date(2026, 0, 5, 0, 30)), "2026-01-05");
  assert.equal(localDate(new Date(2026, 0, 5, 23, 30)), "2026-01-05");
});

test("addDays cruza el mes correctamente", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("addDays cruza el año correctamente", () => {
  assert.equal(addDays("2025-12-31", 1), "2026-01-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
});

test("addDays respeta los años bisiestos", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2024-02-29", 1), "2024-03-01");
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
});

test("addDays suma varias cantidades", () => {
  assert.equal(addDays("2026-01-01", 7), "2026-01-08");
  assert.equal(addDays("2026-12-25", 10), "2027-01-04");
});

test("isValidDate acepta fechas reales y rechaza imposibles", () => {
  assert.equal(isValidDate("2026-10-05"), true);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("2026-13-40"), false);
  assert.equal(isValidDate("2026-2-5"), false);
  assert.equal(isValidDate("05/10/2026"), false);
  assert.equal(isValidDate(null), false);
});

test("isFutureDate compara contra hoy", () => {
  assert.equal(isFutureDate("2026-10-05", "2026-10-07"), false);
  assert.equal(isFutureDate("2026-10-07", "2026-10-07"), false);
  assert.equal(isFutureDate("2026-10-10", "2026-10-07"), true);
});

test("mondayOfWeek y sundayOfWeek devuelven la misma semana para los 7 días", () => {
  for (let day = 5; day <= 11; day++) {
    const dateText = `2026-10-${String(day).padStart(2, "0")}`;
    assert.equal(mondayOfWeek(dateText), "2026-10-05");
    assert.equal(sundayOfWeek(dateText), "2026-10-11");
  }
});

test("mondayOfWeek y sundayOfWeek cruzan el año", () => {
  assert.equal(mondayOfWeek("2026-01-01"), "2025-12-29");
  assert.equal(sundayOfWeek("2026-01-01"), "2026-01-04");
});

test("sumMinutesByDay suma sesiones del mismo día y excluye futuras", () => {
  const sessions = [
    { fecha: "2026-10-05", tema: "a", minutos: 20 },
    { fecha: "2026-10-05", tema: "b", minutos: 15 },
    { fecha: "2026-10-06", tema: "c", minutos: 30 },
    { fecha: "2026-10-08", tema: "d", minutos: 40 }
  ];
  const result = sumMinutesByDay(sessions, "2026-10-07");
  assert.equal(result.get("2026-10-05"), 35);
  assert.equal(result.get("2026-10-06"), 30);
  assert.equal(result.has("2026-10-08"), false);
});

test("sumMinutesByDay ignora minutos inválidos y fechas inválidas", () => {
  const sessions = [
    { fecha: "2026-10-05", minutos: 0 },
    { fecha: "2026-10-05", minutos: -5 },
    { fecha: "2026-10-05", minutos: "texto" },
    { fecha: "2026-10-05", minutos: undefined },
    { fecha: "2026-13-40", minutos: 10 },
    { fecha: "2026-10-06", minutos: "30" }
  ];
  const result = sumMinutesByDay(sessions, "2026-10-07");
  assert.equal(result.size, 1);
  assert.equal(result.get("2026-10-06"), 30);
});

test("sumMinutesByDay tolera datos vacíos o nulos", () => {
  assert.equal(sumMinutesByDay(null, "2026-10-07").size, 0);
  assert.equal(sumMinutesByDay([], "2026-10-07").size, 0);
});

test("groupTopicsByDay agrupa temas por día y excluye futuros", () => {
  const sessions = [
    { fecha: "2026-10-05", tema: "mates" },
    { fecha: "2026-10-05", tema: "física" },
    { fecha: "2026-10-08", tema: "futuro" }
  ];
  const result = groupTopicsByDay(sessions, "2026-10-07");
  assert.deepEqual(result.get("2026-10-05"), ["mates", "física"]);
  assert.equal(result.has("2026-10-08"), false);
});

test("groupTopicsByDay ignora temas no textuales", () => {
  const sessions = [{ fecha: "2026-10-05", tema: 42 }];
  const result = groupTopicsByDay(sessions, "2026-10-07");
  assert.equal(result.has("2026-10-05"), false);
});

test("intensityLevel respeta los umbrales y los límites", () => {
  assert.equal(intensityLevel(0), 0);
  assert.equal(intensityLevel(-1), 0);
  assert.equal(intensityLevel(1), 1);
  assert.equal(intensityLevel(29), 1);
  assert.equal(intensityLevel(30), 2);
  assert.equal(intensityLevel(59), 2);
  assert.equal(intensityLevel(60), 3);
  assert.equal(intensityLevel(119), 3);
  assert.equal(intensityLevel(120), 4);
  assert.equal(intensityLevel(1000), 4);
  assert.equal(intensityLevel("abc"), 0);
  assert.equal(intensityLevel(undefined), 0);
});

test("mapRange devuelve null sin sesiones", () => {
  assert.equal(mapRange([], "2026-10-07"), null);
  assert.equal(mapRange(null, "2026-10-07"), null);
});

test("mapRange devuelve null si solo hay sesiones futuras", () => {
  const sessions = [{ fecha: "2026-10-10", minutos: 10 }];
  assert.equal(mapRange(sessions, "2026-10-07"), null);
});

test("mapRange usa la sesión más antigua por fecha y alinea a lunes/domingo", () => {
  const sessions = [
    { fecha: "2026-10-11", minutos: 10 },
    { fecha: "2026-09-01", minutos: 10 }
  ];
  const range = mapRange(sessions, "2026-10-11");
  assert.equal(range.start, "2026-08-31");
  assert.equal(range.end, "2026-10-11");
});

test("buildHeatmap marca los días futuros como noData", () => {
  const sessions = [{ fecha: "2026-10-05", tema: "mates", minutos: 30 }];
  const mapa = buildHeatmap(sessions, "2026-10-07");
  assert.equal(mapa.empty, false);
  assert.equal(mapa.columns.length, 1);
  assert.equal(mapa.columns[0].length, 7);

  const celdaLunes = mapa.columns[0][0];
  assert.equal(celdaLunes.date, "2026-10-05");
  assert.equal(celdaLunes.future, false);
  assert.equal(celdaLunes.level, 2);
  assert.equal(celdaLunes.minutes, 30);
  assert.deepEqual(celdaLunes.topics, ["mates"]);

  assert.equal(mapa.columns[0][2].future, false);
  assert.equal(mapa.columns[0][2].level, 0);
  assert.equal(mapa.columns[0][4].future, true);
  assert.equal(mapa.columns[0][4].level, "noData");
  assert.equal(mapa.columns[0][4].minutes, 0);
});

test("buildHeatmap devuelve estado vacío sin sesiones o solo futuras", () => {
  assert.equal(buildHeatmap([], "2026-10-07").empty, true);
  const soloFuturas = [{ fecha: "2026-10-10", minutos: 10 }];
  assert.equal(buildHeatmap(soloFuturas, "2026-10-07").empty, true);
});

test("buildHeatmap con primera sesión en domingo dentro de una sola semana", () => {
  const sessions = [{ fecha: "2026-10-11", minutos: 45 }];
  const mapa = buildHeatmap(sessions, "2026-10-11");
  assert.equal(mapa.columns.length, 1);
  assert.equal(mapa.columns[0].length, 7);
  assert.equal(mapa.columns[0][0].date, "2026-10-05");
  assert.equal(mapa.columns[0][0].level, 0);
  assert.equal(mapa.columns[0][6].date, "2026-10-11");
  assert.equal(mapa.columns[0][6].level, 2);
});

test("buildHeatmap cubre el cambio de año a mitad de semana", () => {
  const sessions = [{ fecha: "2025-12-26", minutos: 10 }];
  const mapa = buildHeatmap(sessions, "2026-01-04");
  assert.equal(mapa.columns.length, 2);
  assert.equal(mapa.columns[0][0].date, "2025-12-22");
  assert.equal(mapa.columns[1][6].date, "2026-01-04");
});

test("buildHeatmap incluye días bisiestos", () => {
  const sessions = [{ fecha: "2028-02-29", minutos: 10 }];
  const mapa = buildHeatmap(sessions, "2028-03-05");
  const fechas = mapa.columns.flat().map((c) => c.date);
  assert.equal(fechas.includes("2028-02-29"), true);
});

test("buildHeatmap maneja un histórico de más de un año", () => {
  const sessions = [{ fecha: "2025-12-29", minutos: 10 }];
  const mapa = buildHeatmap(sessions, "2027-01-04");
  assert.equal(mapa.columns.length, 54);
  for (const columna of mapa.columns) {
    assert.equal(columna.length, 7);
  }
  assert.equal(mapa.columns[0][0].date, "2025-12-29");
  assert.equal(mapa.columns[53][6].date, "2027-01-10");
});

test("monthLabels incluye el año en la primera etiqueta y en enero", () => {
  const sessions = [{ fecha: "2024-01-15", minutos: 10 }];
  const mapa = buildHeatmap(sessions, "2026-01-18");
  const labels = mapa.monthLabels;
  assert.equal(labels[0].text, "ene 2024");
  assert.equal(labels[0].columnIndex, 0);
  assert.equal(labels.some((l) => l.text === "ene 2025"), true);
  assert.equal(labels.some((l) => l.text === "ene 2026"), true);
});

test("monthLabels no confunde meses repetidos de años distintos", () => {
  const sessions = [{ fecha: "2024-01-15", minutos: 10 }];
  const mapa = buildHeatmap(sessions, "2026-02-22");
  const labels = mapa.monthLabels;
  assert.equal(labels.some((l) => l.text === "feb"), true);
  assert.equal(labels.some((l) => l.text === "feb 2025"), true);
  assert.equal(labels.some((l) => l.text === "feb 2026"), true);
});

test("monthLabels sitúa cada etiqueta en la primera columna del mes", () => {
  const sesion = { fecha: "2025-12-26", minutos: 10 };
  const mapa = buildHeatmap(sesion && [sesion], "2026-01-04");
  const labels = mapa.monthLabels;
  assert.equal(labels[0].text, "dic 2025");
  assert.equal(labels[0].columnIndex, 0);
  assert.equal(labels[1].text, "ene 2026");
  assert.equal(labels[1].columnIndex, 1);
});

test("LEVELS es la única fuente de umbrales", () => {
  assert.deepEqual(LEVELS.map((l) => l.level), [1, 2, 3, 4]);
  assert.equal(LEVELS[3].max, Infinity);
});

test("sumMinutesInWeek incluye lunes y domingo y excluye otras semanas", () => {
  const sessions = [
    { fecha: "2026-10-05", tema: "lunes", minutos: 20 },
    { fecha: "2026-10-11", tema: "domingo", minutos: 30 },
    { fecha: "2026-10-04", tema: "domingo anterior", minutos: 100 },
    { fecha: "2026-10-12", tema: "lunes siguiente", minutos: 100 }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-11"), 50);
});

test("sumMinutesInWeek excluye fechas futuras dentro de la semana", () => {
  const sessions = [
    { fecha: "2026-10-05", minutos: 20 },
    { fecha: "2026-10-07", minutos: 10 },
    { fecha: "2026-10-08", minutos: 40 },
    { fecha: "2026-10-10", minutos: 40 }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-07"), 30);
});

test("sumMinutesInWeek suma varias sesiones del mismo día", () => {
  const sessions = [
    { fecha: "2026-10-06", minutos: 20 },
    { fecha: "2026-10-06", minutos: 15 },
    { fecha: "2026-10-06", minutos: 5 }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-07"), 40);
});

test("sumMinutesInWeek suma decimales positivos con su valor", () => {
  const sessions = [
    { fecha: "2026-10-05", minutos: 10.5 },
    { fecha: "2026-10-06", minutos: 20.25 }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-07"), 30.75);
});

test("sumMinutesInWeek ignora minutos inválidos", () => {
  const sessions = [
    { fecha: "2026-10-05", minutos: 0 },
    { fecha: "2026-10-05", minutos: -5 },
    { fecha: "2026-10-06", minutos: "texto" },
    { fecha: "2026-10-06", minutos: NaN },
    { fecha: "2026-10-07", minutos: Infinity },
    { fecha: "2026-10-07", minutos: undefined },
    { fecha: "2026-10-07", minutos: null },
    { fecha: "2026-10-07", minutos: "" }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-07"), 0);
});

test("sumMinutesInWeek ignora fechas inválidas o ausentes", () => {
  const sessions = [
    { fecha: "2026-13-40", minutos: 10 },
    { fecha: "2026-2-5", minutos: 10 },
    { minutos: 10 },
    { fecha: null, minutos: 10 }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-07"), 0);
});

test("sumMinutesInWeek tolera datos vacíos o nulos", () => {
  assert.equal(sumMinutesInWeek(null, "2026-10-07"), 0);
  assert.equal(sumMinutesInWeek(undefined, "2026-10-07"), 0);
  assert.equal(sumMinutesInWeek([], "2026-10-07"), 0);
});

test("sumMinutesInWeek sin sesiones en la semana devuelve 0", () => {
  const sessions = [
    { fecha: "2026-09-01", minutos: 100 },
    { fecha: "2026-11-01", minutos: 100 }
  ];
  assert.equal(sumMinutesInWeek(sessions, "2026-10-07"), 0);
});

test("isValidWeeklyGoal acepta enteros positivos", () => {
  assert.equal(isValidWeeklyGoal(1), true);
  assert.equal(isValidWeeklyGoal(10), true);
  assert.equal(isValidWeeklyGoal(60), true);
});

test("isValidWeeklyGoal rechaza valores no enteros o no positivos", () => {
  assert.equal(isValidWeeklyGoal(0), false);
  assert.equal(isValidWeeklyGoal(-1), false);
  assert.equal(isValidWeeklyGoal(1.5), false);
  assert.equal(isValidWeeklyGoal("60"), false);
  assert.equal(isValidWeeklyGoal(NaN), false);
  assert.equal(isValidWeeklyGoal(Infinity), false);
  assert.equal(isValidWeeklyGoal(null), false);
  assert.equal(isValidWeeklyGoal(undefined), false);
  assert.equal(isValidWeeklyGoal({}), false);
});

test("parseWeeklyGoal acepta números enteros positivos y texto numérico", () => {
  assert.equal(parseWeeklyGoal(10), 10);
  assert.equal(parseWeeklyGoal("60"), 60);
  assert.equal(parseWeeklyGoal("  45  "), 45);
});

test("parseWeeklyGoal devuelve null ante valores inválidos o ausentes", () => {
  assert.equal(parseWeeklyGoal(""), null);
  assert.equal(parseWeeklyGoal("   "), null);
  assert.equal(parseWeeklyGoal("abc"), null);
  assert.equal(parseWeeklyGoal(0), null);
  assert.equal(parseWeeklyGoal(-5), null);
  assert.equal(parseWeeklyGoal(1.5), null);
  assert.equal(parseWeeklyGoal(null), null);
  assert.equal(parseWeeklyGoal(undefined), null);
  assert.equal(parseWeeklyGoal(NaN), null);
});

test("weeklyGoalProgress sin objetivo muestra estado sin-objetivo", () => {
  const progreso = weeklyGoalProgress(null, 0);
  assert.equal(progreso.hasGoal, false);
  assert.equal(progreso.goalMinutes, null);
  assert.equal(progreso.status, "sin-objetivo");
  assert.equal(progreso.statusText, "Sin objetivo");
  assert.equal(progreso.percent, 0);
  assert.equal(progreso.remaining, 0);
  assert.equal(progreso.showCongrats, false);
  assert.equal(progreso.showAbove, false);
});

test("weeklyGoalProgress en-curso calcula porcentaje y minutos restantes", () => {
  const progreso = weeklyGoalProgress(60, 30);
  assert.equal(progreso.hasGoal, true);
  assert.equal(progreso.goalMinutes, 60);
  assert.equal(progreso.minutes, 30);
  assert.equal(progreso.percent, 50);
  assert.equal(progreso.remaining, 30);
  assert.equal(progreso.status, "en-curso");
  assert.equal(progreso.statusText, "En curso");
  assert.equal(progreso.showCongrats, false);
  assert.equal(progreso.showAbove, false);
});

test("weeklyGoalProgress conseguido justo alcanza el objetivo", () => {
  const progreso = weeklyGoalProgress(60, 60);
  assert.equal(progreso.percent, 100);
  assert.equal(progreso.remaining, 0);
  assert.equal(progreso.status, "conseguido");
  assert.equal(progreso.statusText, "Conseguido");
  assert.equal(progreso.showCongrats, true);
  assert.equal(progreso.showAbove, false);
});

test("weeklyGoalProgress por-encima topea el porcentaje al 100%", () => {
  const progreso = weeklyGoalProgress(60, 75);
  assert.equal(progreso.percent, 100);
  assert.equal(progreso.remaining, 0);
  assert.equal(progreso.status, "por-encima");
  assert.equal(progreso.statusText, "Conseguido");
  assert.equal(progreso.showCongrats, true);
  assert.equal(progreso.showAbove, true);
});

test("weeklyGoalProgress con decimales por encima topea el porcentaje", () => {
  const progreso = weeklyGoalProgress(60, 60.5);
  assert.equal(progreso.percent, 100);
  assert.equal(progreso.remaining, 0);
  assert.equal(progreso.status, "por-encima");
  assert.equal(progreso.showAbove, true);
});

test("weeklyGoalProgress con 0 minutos y objetivo queda en-curso", () => {
  const progreso = weeklyGoalProgress(60, 0);
  assert.equal(progreso.minutes, 0);
  assert.equal(progreso.percent, 0);
  assert.equal(progreso.remaining, 60);
  assert.equal(progreso.status, "en-curso");
  assert.equal(progreso.statusText, "En curso");
});