/**
 * Running Trainer — Schedule Data
 * Supports: C25K Treadmill, C25K Plan, Hal Higdon Intermediate 10K
 */

// ===== HELPERS =====
function W(type, mins, cue) { return { type, duration: mins * 60, cue }; }
function S(type, secs, cue) { return { type, duration: secs, cue }; }

// ===== C25K BUILDERS =====
function c25k_week1() {
  const iv = [W("warmup", 5, "warmup")];
  for (let i = 0; i < 8; i++) { iv.push(S("run", 60, "run")); iv.push(S("walk", 90, "walk")); }
  iv.push(W("cooldown", 5, "cooldown")); return iv;
}
function c25k_week2() {
  const iv = [W("warmup", 5, "warmup")];
  for (let i = 0; i < 6; i++) { iv.push(S("run", 90, "run")); iv.push(W("walk", 2, "walk")); }
  iv.push(W("cooldown", 5, "cooldown")); return iv;
}
function c25k_week3() {
  const iv = [W("warmup", 5, "warmup")];
  for (let i = 0; i < 2; i++) {
    iv.push(S("run", 90, "run")); iv.push(S("walk", 90, "walk"));
    iv.push(W("run", 3, "run"));  iv.push(W("walk", 3, "walk"));
  }
  iv.push(W("cooldown", 5, "cooldown")); return iv;
}
function c25k_week4() {
  return [
    W("warmup",5,"warmup"), W("run",3,"run"), S("walk",90,"walk"),
    W("run",5,"run"), S("walk",150,"walk"), W("run",3,"run"),
    S("walk",90,"walk"), W("run",5,"run"), W("cooldown",5,"cooldown"),
  ];
}
function c25k_w5d1() {
  return [W("warmup",5,"warmup"), W("run",5,"run"), W("walk",3,"walk"),
          W("run",5,"run"), W("walk",3,"walk"), W("run",5,"run"), W("cooldown",5,"cooldown")];
}
function c25k_w5d2() {
  return [W("warmup",5,"warmup"), W("run",8,"run"), W("walk",5,"walk"),
          W("run",8,"run"), W("cooldown",5,"cooldown")];
}
function c25k_w5d3() { return [W("warmup",5,"warmup"), W("run",20,"run"), W("cooldown",5,"cooldown")]; }
function c25k_w6d1() {
  return [W("warmup",5,"warmup"), W("run",5,"run"), W("walk",3,"walk"),
          W("run",8,"run"), W("walk",3,"walk"), W("run",5,"run"), W("cooldown",5,"cooldown")];
}
function c25k_w6d2() {
  return [W("warmup",5,"warmup"), W("run",10,"run"), W("walk",3,"walk"),
          W("run",10,"run"), W("cooldown",5,"cooldown")];
}
function c25k_w6d3() { return [W("warmup",5,"warmup"), W("run",22,"run"), W("cooldown",5,"cooldown")]; }
function c25k_week7() { return [W("warmup",5,"warmup"), W("run",25,"run"), W("cooldown",5,"cooldown")]; }
function c25k_week8() { return [W("warmup",5,"warmup"), W("run",28,"run"), W("cooldown",5,"cooldown")]; }
function c25k_week9() { return [W("warmup",5,"warmup"), W("run",30,"run"), W("cooldown",5,"cooldown")]; }

// ===== HAL HIGDON 10K INTERMEDIATE BUILDERS =====
// 속도 기준: easy ~10분/mile, tempo ~8:30분/mile
// 구조: warmup 5분 + run + cooldown 5분
// Tempo 구간: easy 10분 + tempo Xmin + easy 5분

function hh_easy(miles) {
  const mins = Math.round(miles * 10);
  return [W("warmup",5,"warmup"), W("run", mins, "easy_run"), W("cooldown",5,"cooldown")];
}
function hh_tempo(totalMiles) {
  // totalMiles 중 절반 정도가 tempo 구간
  const easyMins = 10;
  const tempoMins = Math.round((totalMiles * 8.5) - 15); // rough: subtract warmup/down
  const easyEndMins = 5;
  return [
    W("warmup",   5,         "warmup"),
    W("run",      easyMins,  "easy_run"),
    W("run",      Math.max(tempoMins, 5), "tempo"),
    W("run",      easyEndMins, "easy_run"),
    W("cooldown", 5,         "cooldown"),
  ];
}
function hh_long(miles) {
  const mins = Math.round(miles * 10);
  return [W("warmup",5,"warmup"), W("run", mins, "long_run"), W("cooldown",5,"cooldown")];
}
function hh_race() {
  return [W("warmup",10,"warmup"), W("run", 60, "race"), W("cooldown",10,"cooldown")];
}

// ===== PROGRAMS =====
const PROGRAMS = {

  // ─── C25K 트레드밀 ───
  c25k_treadmill: {
    name: "C25K 트레드밀",
    desc: "트레드밀 속도 기반 9주 프로그램",
    totalWeeks: 9,
    daysPerWeek: 3,
    weeks: {
      1:{ label:"1주차", days:{ 1:{label:"Day 1",intervals:c25k_week1()}, 2:{label:"Day 2",intervals:c25k_week1()}, 3:{label:"Day 3",intervals:c25k_week1()} } },
      2:{ label:"2주차", days:{ 1:{label:"Day 1",intervals:c25k_week2()}, 2:{label:"Day 2",intervals:c25k_week2()}, 3:{label:"Day 3",intervals:c25k_week2()} } },
      3:{ label:"3주차", days:{ 1:{label:"Day 1",intervals:c25k_week3()}, 2:{label:"Day 2",intervals:c25k_week3()}, 3:{label:"Day 3",intervals:c25k_week3()} } },
      4:{ label:"4주차", days:{ 1:{label:"Day 1",intervals:c25k_week4()}, 2:{label:"Day 2",intervals:c25k_week4()}, 3:{label:"Day 3",intervals:c25k_week4()} } },
      5:{ label:"5주차", days:{ 1:{label:"Day 1",intervals:c25k_w5d1()}, 2:{label:"Day 2",intervals:c25k_w5d2()}, 3:{label:"Day 3",intervals:c25k_w5d3()} } },
      6:{ label:"6주차", days:{ 1:{label:"Day 1",intervals:c25k_w6d1()}, 2:{label:"Day 2",intervals:c25k_w6d2()}, 3:{label:"Day 3",intervals:c25k_w6d3()} } },
      7:{ label:"7주차", days:{ 1:{label:"Day 1",intervals:c25k_week7()}, 2:{label:"Day 2",intervals:c25k_week7()}, 3:{label:"Day 3",intervals:c25k_week7()} } },
      8:{ label:"8주차", days:{ 1:{label:"Day 1",intervals:c25k_week8()}, 2:{label:"Day 2",intervals:c25k_week8()}, 3:{label:"Day 3",intervals:c25k_week8()} } },
      9:{ label:"9주차", days:{ 1:{label:"Day 1",intervals:c25k_week9()}, 2:{label:"Day 2",intervals:c25k_week9()}, 3:{label:"Day 3",intervals:c25k_week9()} } },
    }
  },

  // ─── C25K 플랜 ───
  c25k_plan: {
    name: "C25K 플랜",
    desc: "야외/일반 러닝 9주 프로그램",
    totalWeeks: 9,
    daysPerWeek: 3,
    weeks: {
      1:{ label:"1주차", days:{ 1:{label:"Day 1",intervals:c25k_week1()}, 2:{label:"Day 2",intervals:c25k_week1()}, 3:{label:"Day 3",intervals:c25k_week1()} } },
      2:{ label:"2주차", days:{ 1:{label:"Day 1",intervals:c25k_week2()}, 2:{label:"Day 2",intervals:c25k_week2()}, 3:{label:"Day 3",intervals:c25k_week2()} } },
      3:{ label:"3주차", days:{ 1:{label:"Day 1",intervals:c25k_week3()}, 2:{label:"Day 2",intervals:c25k_week3()}, 3:{label:"Day 3",intervals:c25k_week3()} } },
      4:{ label:"4주차", days:{ 1:{label:"Day 1",intervals:c25k_week4()}, 2:{label:"Day 2",intervals:c25k_week4()}, 3:{label:"Day 3",intervals:c25k_week4()} } },
      5:{ label:"5주차", days:{ 1:{label:"Day 1",intervals:c25k_w5d1()}, 2:{label:"Day 2",intervals:c25k_w5d2()}, 3:{label:"Day 3",intervals:c25k_w5d3()} } },
      6:{ label:"6주차", days:{ 1:{label:"Day 1",intervals:c25k_w6d1()}, 2:{label:"Day 2",intervals:c25k_w6d2()}, 3:{label:"Day 3",intervals:c25k_w6d3()} } },
      7:{ label:"7주차", days:{ 1:{label:"Day 1",intervals:c25k_week7()}, 2:{label:"Day 2",intervals:c25k_week7()}, 3:{label:"Day 3",intervals:c25k_week7()} } },
      8:{ label:"8주차", days:{ 1:{label:"Day 1",intervals:c25k_week8()}, 2:{label:"Day 2",intervals:c25k_week8()}, 3:{label:"Day 3",intervals:c25k_week8()} } },
      9:{ label:"9주차", days:{ 1:{label:"Day 1",intervals:c25k_week9()}, 2:{label:"Day 2",intervals:c25k_week9()}, 3:{label:"Day 3",intervals:c25k_week9()} } },
    }
  },

  // ─── Hal Higdon 10K 중급 ───
  hh10k_int: {
    name: "Hal Higdon 10K 중급",
    desc: "10K 완주를 위한 8주 중급 훈련 (Hal Higdon)",
    totalWeeks: 8,
    daysPerWeek: 4,
    weeks: {
      1:{ label:"1주차", days:{
        1:{label:"화 · 쉬운 달리기 3mi", intervals: hh_easy(3)},
        2:{label:"수 · 쉬운 달리기 2mi", intervals: hh_easy(2)},
        3:{label:"목 · 쉬운 달리기 3mi", intervals: hh_easy(3)},
        4:{label:"토 · 롱런 3mi",        intervals: hh_long(3)},
      }},
      2:{ label:"2주차", days:{
        1:{label:"화 · 쉬운 달리기 3mi", intervals: hh_easy(3)},
        2:{label:"수 · 템포런 2mi",      intervals: hh_tempo(2)},
        3:{label:"목 · 쉬운 달리기 3mi", intervals: hh_easy(3)},
        4:{label:"토 · 롱런 4mi",        intervals: hh_long(4)},
      }},
      3:{ label:"3주차", days:{
        1:{label:"화 · 쉬운 달리기 3mi", intervals: hh_easy(3)},
        2:{label:"수 · 템포런 2mi",      intervals: hh_tempo(2)},
        3:{label:"목 · 쉬운 달리기 3mi", intervals: hh_easy(3)},
        4:{label:"토 · 롱런 4mi",        intervals: hh_long(4)},
      }},
      4:{ label:"4주차", days:{
        1:{label:"화 · 쉬운 달리기 3.5mi", intervals: hh_easy(3.5)},
        2:{label:"수 · 템포런 3mi",        intervals: hh_tempo(3)},
        3:{label:"목 · 쉬운 달리기 3.5mi", intervals: hh_easy(3.5)},
        4:{label:"토 · 롱런 5mi",          intervals: hh_long(5)},
      }},
      5:{ label:"5주차", days:{
        1:{label:"화 · 쉬운 달리기 3.5mi", intervals: hh_easy(3.5)},
        2:{label:"수 · 템포런 3mi",        intervals: hh_tempo(3)},
        3:{label:"목 · 쉬운 달리기 3.5mi", intervals: hh_easy(3.5)},
        4:{label:"토 · 롱런 5mi",          intervals: hh_long(5)},
      }},
      6:{ label:"6주차", days:{
        1:{label:"화 · 쉬운 달리기 4mi", intervals: hh_easy(4)},
        2:{label:"수 · 템포런 3mi",      intervals: hh_tempo(3)},
        3:{label:"목 · 쉬운 달리기 4mi", intervals: hh_easy(4)},
        4:{label:"토 · 롱런 6mi",        intervals: hh_long(6)},
      }},
      7:{ label:"7주차 (회복)", days:{
        1:{label:"화 · 쉬운 달리기 4mi", intervals: hh_easy(4)},
        2:{label:"수 · 템포런 2mi",      intervals: hh_tempo(2)},
        3:{label:"목 · 쉬운 달리기 4mi", intervals: hh_easy(4)},
        4:{label:"토 · 롱런 4mi",        intervals: hh_long(4)},
      }},
      8:{ label:"8주차 (레이스 주)", days:{
        1:{label:"화 · 쉬운 달리기 2mi", intervals: hh_easy(2)},
        2:{label:"수 · 휴식",            intervals: [W("warmup",10,"warmup"), W("cooldown",10,"cooldown")]},
        3:{label:"목 · 쉬운 달리기 1mi", intervals: hh_easy(1)},
        4:{label:"토 · 10K 레이스!",     intervals: hh_race()},
      }},
    }
  },
};

// ===== UTILS =====
function getSchedule(programId, week, day) {
  const raw = PROGRAMS[programId].weeks[week].days[day].intervals;
  let t = 0;
  return raw.map(iv => { const start = t; t += iv.duration; return { ...iv, start, end: t }; });
}

function getTotalDuration(programId, week, day) {
  return PROGRAMS[programId].weeks[week].days[day].intervals
    .reduce((s, iv) => s + iv.duration, 0);
}
