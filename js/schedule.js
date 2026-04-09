/**
 * C25K Treadmill Schedule
 * Each interval: { type: 'warmup'|'run'|'walk'|'cooldown', duration: seconds }
 * 'cue' field: which MP3 to play at start of interval
 */

const SCHEDULE = {
  1: {
    label: "Week 1",
    days: {
      1: {
        label: "Day 1",
        // 5min warmup, 8x(run 1min + walk 90sec), 5min cooldown
        intervals: buildWeek1()
      },
      2: { label: "Day 2", intervals: buildWeek1() },
      3: { label: "Day 3", intervals: buildWeek1() }
    }
  },
  2: {
    label: "Week 2",
    days: {
      1: { label: "Day 1", intervals: buildWeek2() },
      2: { label: "Day 2", intervals: buildWeek2() },
      3: { label: "Day 3", intervals: buildWeek2() }
    }
  },
  3: {
    label: "Week 3",
    days: {
      1: { label: "Day 1", intervals: buildWeek3() },
      2: { label: "Day 2", intervals: buildWeek3() },
      3: { label: "Day 3", intervals: buildWeek3() }
    }
  },
  4: {
    label: "Week 4",
    days: {
      1: { label: "Day 1", intervals: buildWeek4() },
      2: { label: "Day 2", intervals: buildWeek4() },
      3: { label: "Day 3", intervals: buildWeek4() }
    }
  },
  5: {
    label: "Week 5",
    days: {
      1: { label: "Day 1", intervals: buildWeek5Day1() },
      2: { label: "Day 2", intervals: buildWeek5Day2() },
      3: { label: "Day 3", intervals: buildWeek5Day3() }
    }
  },
  6: {
    label: "Week 6",
    days: {
      1: { label: "Day 1", intervals: buildWeek6Day1() },
      2: { label: "Day 2", intervals: buildWeek6Day2() },
      3: { label: "Day 3", intervals: buildWeek6Day3() }
    }
  },
  7: {
    label: "Week 7",
    days: {
      1: { label: "Day 1", intervals: buildWeek7() },
      2: { label: "Day 2", intervals: buildWeek7() },
      3: { label: "Day 3", intervals: buildWeek7() }
    }
  },
  8: {
    label: "Week 8",
    days: {
      1: { label: "Day 1", intervals: buildWeek8() },
      2: { label: "Day 2", intervals: buildWeek8() },
      3: { label: "Day 3", intervals: buildWeek8() }
    }
  },
  9: {
    label: "Week 9",
    days: {
      1: { label: "Day 1", intervals: buildWeek9() },
      2: { label: "Day 2", intervals: buildWeek9() },
      3: { label: "Day 3", intervals: buildWeek9() }
    }
  }
};

function W(type, mins, cue) {
  return { type, duration: mins * 60, cue };
}
function S(type, secs, cue) {
  return { type, duration: secs, cue };
}

function buildWeek1() {
  // 5min warmup, 8x(run 1min + walk 90sec), 5min cooldown = ~29min
  const intervals = [W("warmup", 5, "warmup")];
  for (let i = 0; i < 8; i++) {
    intervals.push(S("run",  60, "run"));
    intervals.push(S("walk", 90, "walk"));
  }
  intervals.push(W("cooldown", 5, "cooldown"));
  return intervals;
}

function buildWeek2() {
  // 5min warmup, 6x(run 90sec + walk 2min), 5min cooldown = ~28min
  const intervals = [W("warmup", 5, "warmup")];
  for (let i = 0; i < 6; i++) {
    intervals.push(S("run",  90, "run"));
    intervals.push(W("walk",  2, "walk"));
  }
  intervals.push(W("cooldown", 5, "cooldown"));
  return intervals;
}

function buildWeek3() {
  // 5min warmup, 2x(run 90sec, walk 90sec, run 3min, walk 3min), 5min cooldown = ~28min
  const intervals = [W("warmup", 5, "warmup")];
  for (let i = 0; i < 2; i++) {
    intervals.push(S("run",  90, "run"));
    intervals.push(S("walk", 90, "walk"));
    intervals.push(W("run",   3, "run"));
    intervals.push(W("walk",  3, "walk"));
  }
  intervals.push(W("cooldown", 5, "cooldown"));
  return intervals;
}

function buildWeek4() {
  // 5min warmup, run 3min, walk 90sec, run 5min, walk 2.5min, run 3min, walk 90sec, run 5min, 5min cooldown
  return [
    W("warmup",   5,   "warmup"),
    W("run",      3,   "run"),
    S("walk",     90,  "walk"),
    W("run",      5,   "run"),
    S("walk",     150, "walk"),
    W("run",      3,   "run"),
    S("walk",     90,  "walk"),
    W("run",      5,   "run"),
    W("cooldown", 5,   "cooldown"),
  ];
}

function buildWeek5Day1() {
  // 5min warmup, run 5min, walk 3min, run 5min, walk 3min, run 5min, 5min cooldown
  return [
    W("warmup",   5, "warmup"),
    W("run",      5, "run"),
    W("walk",     3, "walk"),
    W("run",      5, "run"),
    W("walk",     3, "walk"),
    W("run",      5, "run"),
    W("cooldown", 5, "cooldown"),
  ];
}

function buildWeek5Day2() {
  // 5min warmup, run 8min, walk 5min, run 8min, 5min cooldown
  return [
    W("warmup",   5, "warmup"),
    W("run",      8, "run"),
    W("walk",     5, "walk"),
    W("run",      8, "run"),
    W("cooldown", 5, "cooldown"),
  ];
}

function buildWeek5Day3() {
  // 5min warmup, run 20min, 5min cooldown
  return [
    W("warmup",   5,  "warmup"),
    W("run",      20, "run"),
    W("cooldown", 5,  "cooldown"),
  ];
}

function buildWeek6Day1() {
  // 5min warmup, run 5min, walk 3min, run 8min, walk 3min, run 5min, 5min cooldown
  return [
    W("warmup",   5, "warmup"),
    W("run",      5, "run"),
    W("walk",     3, "walk"),
    W("run",      8, "run"),
    W("walk",     3, "walk"),
    W("run",      5, "run"),
    W("cooldown", 5, "cooldown"),
  ];
}

function buildWeek6Day2() {
  // 5min warmup, run 10min, walk 3min, run 10min, 5min cooldown
  return [
    W("warmup",   5,  "warmup"),
    W("run",      10, "run"),
    W("walk",     3,  "walk"),
    W("run",      10, "run"),
    W("cooldown", 5,  "cooldown"),
  ];
}

function buildWeek6Day3() {
  // 5min warmup, run 22min, 5min cooldown
  return [
    W("warmup",   5,  "warmup"),
    W("run",      22, "run"),
    W("cooldown", 5,  "cooldown"),
  ];
}

function buildWeek7() {
  return [
    W("warmup",   5,  "warmup"),
    W("run",      25, "run"),
    W("cooldown", 5,  "cooldown"),
  ];
}

function buildWeek8() {
  return [
    W("warmup",   5,  "warmup"),
    W("run",      28, "run"),
    W("cooldown", 5,  "cooldown"),
  ];
}

function buildWeek9() {
  return [
    W("warmup",   5,  "warmup"),
    W("run",      30, "run"),
    W("cooldown", 5,  "cooldown"),
  ];
}

/** Get flat intervals with start/end times for a given week+day */
function getSchedule(week, day) {
  const raw = SCHEDULE[week].days[day].intervals;
  let t = 0;
  return raw.map(iv => {
    const start = t;
    t += iv.duration;
    return { ...iv, start, end: t };
  });
}

/** Total duration in seconds for a given week+day */
function getTotalDuration(week, day) {
  return SCHEDULE[week].days[day].intervals.reduce((s, iv) => s + iv.duration, 0);
}
