/**
 * Running Trainer — Schedule Data
 *
 * Programs:
 *  1. C25K 트레드밀  (c25k.com/c25k_treadmill) — 9주 3일, 쿨다운 포함
 *  2. C25K 플랜      (c25k.com/c25k_plan)       — 9주 3일, 쿨다운 없음
 *  3. Hal Higdon 10K 중급 (halhigdon.com)        — 8주 5일 (KM 기준)
 */

// ===== HELPERS =====
function W(type, mins, cue) { return { type, duration: mins * 60, cue }; }
function S(type, secs, cue) { return { type, duration: secs, cue }; }

// ================================================================
// C25K TREADMILL  (warmup + intervals + cooldown)
// ================================================================
function ct_w1()  {
  const iv = [W("warmup",5,"warmup")];
  for(let i=0;i<8;i++){iv.push(S("run",60,"run"));iv.push(S("walk",90,"walk"));}
  iv.push(W("cooldown",5,"cooldown")); return iv;
}
function ct_w2()  {
  const iv = [W("warmup",5,"warmup")];
  for(let i=0;i<6;i++){iv.push(S("run",90,"run"));iv.push(W("walk",2,"walk"));}
  iv.push(W("cooldown",5,"cooldown")); return iv;
}
function ct_w3()  {
  const iv = [W("warmup",5,"warmup")];
  for(let i=0;i<2;i++){iv.push(S("run",90,"run"));iv.push(S("walk",90,"walk"));iv.push(W("run",3,"run"));iv.push(W("walk",3,"walk"));}
  iv.push(W("cooldown",5,"cooldown")); return iv;
}
function ct_w4()  { return [W("warmup",5,"warmup"),W("run",3,"run"),S("walk",90,"walk"),W("run",5,"run"),S("walk",150,"walk"),W("run",3,"run"),S("walk",90,"walk"),W("run",5,"run"),W("cooldown",5,"cooldown")]; }
function ct_w5d1(){ return [W("warmup",5,"warmup"),W("run",5,"run"),W("walk",3,"walk"),W("run",5,"run"),W("walk",3,"walk"),W("run",5,"run"),W("cooldown",5,"cooldown")]; }
function ct_w5d2(){ return [W("warmup",5,"warmup"),W("run",8,"run"),W("walk",5,"walk"),W("run",8,"run"),W("cooldown",5,"cooldown")]; }
function ct_w5d3(){ return [W("warmup",5,"warmup"),W("run",20,"run"),W("cooldown",5,"cooldown")]; }
function ct_w6d1(){ return [W("warmup",5,"warmup"),W("run",5,"run"),W("walk",3,"walk"),W("run",8,"run"),W("walk",3,"walk"),W("run",5,"run"),W("cooldown",5,"cooldown")]; }
function ct_w6d2(){ return [W("warmup",5,"warmup"),W("run",10,"run"),W("walk",3,"walk"),W("run",10,"run"),W("cooldown",5,"cooldown")]; }
function ct_w6d3(){ return [W("warmup",5,"warmup"),W("run",22,"run"),W("cooldown",5,"cooldown")]; }
function ct_w7()  { return [W("warmup",5,"warmup"),W("run",25,"run"),W("cooldown",5,"cooldown")]; }
function ct_w8()  { return [W("warmup",5,"warmup"),W("run",28,"run"),W("cooldown",5,"cooldown")]; }
function ct_w9()  { return [W("warmup",5,"warmup"),W("run",30,"run"),W("cooldown",5,"cooldown")]; }

// ================================================================
// C25K PLAN  (c25k.com/c25k_plan — NO cooldown)
// Week 1–2: "for a total of 20 minutes" (intervals only, after warmup)
// Week 6 Day 3: 25min (not 22)
// ================================================================
function cp_w1()  {
  const iv = [W("warmup",5,"warmup")];
  for(let i=0;i<8;i++){iv.push(S("run",60,"run"));iv.push(S("walk",90,"walk"));}
  return iv; // no cooldown
}
function cp_w2()  {
  const iv = [W("warmup",5,"warmup")];
  for(let i=0;i<6;i++){iv.push(S("run",90,"run"));iv.push(W("walk",2,"walk"));}
  return iv;
}
function cp_w3()  {
  const iv = [W("warmup",5,"warmup")];
  for(let i=0;i<2;i++){iv.push(S("run",90,"run"));iv.push(S("walk",90,"walk"));iv.push(W("run",3,"run"));iv.push(W("walk",3,"walk"));}
  return iv;
}
function cp_w4()  { return [W("warmup",5,"warmup"),W("run",3,"run"),S("walk",90,"walk"),W("run",5,"run"),S("walk",150,"walk"),W("run",3,"run"),S("walk",90,"walk"),W("run",5,"run")]; }
function cp_w5d1(){ return [W("warmup",5,"warmup"),W("run",5,"run"),W("walk",3,"walk"),W("run",5,"run"),W("walk",3,"walk"),W("run",5,"run")]; }
function cp_w5d2(){ return [W("warmup",5,"warmup"),W("run",8,"run"),W("walk",5,"walk"),W("run",8,"run")]; }
function cp_w5d3(){ return [W("warmup",5,"warmup"),W("run",20,"run")]; }
function cp_w6d1(){ return [W("warmup",5,"warmup"),W("run",5,"run"),W("walk",3,"walk"),W("run",8,"run"),W("walk",3,"walk"),W("run",5,"run")]; }
function cp_w6d2(){ return [W("warmup",5,"warmup"),W("run",10,"run"),W("walk",3,"walk"),W("run",10,"run")]; }
function cp_w6d3(){ return [W("warmup",5,"warmup"),W("run",25,"run")]; }  // ← 25분 (트레드밀판 22분과 다름)
function cp_w7()  { return [W("warmup",5,"warmup"),W("run",25,"run")]; }
function cp_w8()  { return [W("warmup",5,"warmup"),W("run",28,"run")]; }
function cp_w9()  { return [W("warmup",5,"warmup"),W("run",30,"run")]; }

// ================================================================
// HAL HIGDON INTERMEDIATE 10K  (KM 기준, 6:15 min/km 페이스)
//
// Schedule (KMs tab):
// Wk | Mon      | Tue     | Wed             | Thu      | Sun
//  1 | 4.8km    | 4.8km   | 35min tempo     | 4.8km    | 6.4km
//  2 | 4.8km    | 5.9km   | 8×400 5K pace   | 6.4km    | 8.1km
//  3 | 4.8km    | 6.4km   | 40min tempo     | 4.8km    | 9.7km
//  4 | 4.8km    | 7.3km   | 9×400 5K pace   | 6.4km    | 5K Race
//  5 | 4.8km    | 8.1km   | 45min tempo     | 4.8km    | 9.7km
//  6 | 4.8km    | 8.9km   | 10×400 5K pace  | 6.4km    | 11.3km
//  7 | 4.8km    | 9.7km   | 50min tempo     | 6.4km    | 12.9km
//  8 | 4.8km    | 4.8km   | 5×400 5K pace   | 1.6–4.8km| 10K Race
//
// Tempo structure: "10-15min easy → tempo middle → 5-10min easy"
// Speedwork: 10min easy warmup + N×(2:30 fast + 2:00 recovery) + 5min cooldown
// ================================================================

// pace: 6:15 min/km → multiply km × 6.25 → minutes
function hhRun(km) { return Math.round(km * 6.25); }

function hh_easy(km) {
  return [W("warmup",5,"warmup"), W("easy",hhRun(km),"easy_run"), W("cooldown",5,"cooldown")];
}
function hh_long(km) {
  return [W("warmup",5,"warmup"), W("easy",hhRun(km),"long_run"), W("cooldown",5,"cooldown")];
}
function hh_tempo(totalMin) {
  // "10-15min easy, tempo in middle, 5-10min easy end"
  const easyStart = totalMin <= 35 ? 10 : (totalMin <= 45 ? 12 : 15);
  const easyEnd   = 10;
  const tempoMin  = totalMin - easyStart - easyEnd;
  return [
    W("warmup",5,"warmup"),
    W("easy",easyStart,"easy_run"),
    W("tempo",tempoMin,"tempo"),
    W("easy",easyEnd,"easy_run"),
    W("cooldown",5,"cooldown"),
  ];
}
function hh_speed(reps) {
  // 10min easy warmup + N×(2:30 fast + 2:00 recovery jog) + 5min cooldown
  const iv = [W("warmup",5,"warmup"), W("easy",10,"easy_run")];
  for(let i=0;i<reps;i++){
    iv.push(S("speed",150,"speed400")); // 400m @ 5K pace ~2:30
    iv.push(S("walk",120,"walk"));      // 2min recovery jog
  }
  iv.push(W("cooldown",5,"cooldown"));
  return iv;
}
function hh_5k_race() {
  // 워밍업 10분 + 5K 레이스 ~30분 + 쿨다운 10분
  return [W("warmup",10,"warmup"), W("race",30,"race"), W("cooldown",10,"cooldown")];
}
function hh_10k_race() {
  // 워밍업 10분 + 10K 레이스 ~62분 + 쿨다운 10분
  return [W("warmup",10,"warmup"), W("race",62,"race"), W("cooldown",10,"cooldown")];
}
function hh_w8_thu() {
  // Week 8 Thu: "1.6–4.8km" — 10분 쉬운 달리기 (가볍게)
  return [W("warmup",5,"warmup"), W("easy",15,"easy_run"), W("cooldown",5,"cooldown")];
}

// ================================================================
// PROGRAM DEFINITIONS
// ================================================================
const PROGRAMS = {

  c25k_treadmill: {
    name: "C25K 트레드밀",
    desc: "트레드밀 속도 기반 9주 프로그램 (쿨다운 포함)",
    totalWeeks: 9, daysPerWeek: 3,
    weeks: {
      1:{ label:"1주차", days:{ 1:{label:"Day 1",intervals:ct_w1()}, 2:{label:"Day 2",intervals:ct_w1()}, 3:{label:"Day 3",intervals:ct_w1()} }},
      2:{ label:"2주차", days:{ 1:{label:"Day 1",intervals:ct_w2()}, 2:{label:"Day 2",intervals:ct_w2()}, 3:{label:"Day 3",intervals:ct_w2()} }},
      3:{ label:"3주차", days:{ 1:{label:"Day 1",intervals:ct_w3()}, 2:{label:"Day 2",intervals:ct_w3()}, 3:{label:"Day 3",intervals:ct_w3()} }},
      4:{ label:"4주차", days:{ 1:{label:"Day 1",intervals:ct_w4()}, 2:{label:"Day 2",intervals:ct_w4()}, 3:{label:"Day 3",intervals:ct_w4()} }},
      5:{ label:"5주차", days:{ 1:{label:"Day 1",intervals:ct_w5d1()}, 2:{label:"Day 2",intervals:ct_w5d2()}, 3:{label:"Day 3",intervals:ct_w5d3()} }},
      6:{ label:"6주차", days:{ 1:{label:"Day 1",intervals:ct_w6d1()}, 2:{label:"Day 2",intervals:ct_w6d2()}, 3:{label:"Day 3",intervals:ct_w6d3()} }},
      7:{ label:"7주차", days:{ 1:{label:"Day 1",intervals:ct_w7()}, 2:{label:"Day 2",intervals:ct_w7()}, 3:{label:"Day 3",intervals:ct_w7()} }},
      8:{ label:"8주차", days:{ 1:{label:"Day 1",intervals:ct_w8()}, 2:{label:"Day 2",intervals:ct_w8()}, 3:{label:"Day 3",intervals:ct_w8()} }},
      9:{ label:"9주차", days:{ 1:{label:"Day 1",intervals:ct_w9()}, 2:{label:"Day 2",intervals:ct_w9()}, 3:{label:"Day 3 🎉",intervals:ct_w9()} }},
    }
  },

  c25k_plan: {
    name: "C25K 플랜",
    desc: "야외/일반 러닝 9주 프로그램 (쿨다운 없음)",
    totalWeeks: 9, daysPerWeek: 3,
    weeks: {
      1:{ label:"1주차", days:{ 1:{label:"Workout 1",intervals:cp_w1()}, 2:{label:"Workout 2",intervals:cp_w1()}, 3:{label:"Workout 3",intervals:cp_w1()} }},
      2:{ label:"2주차", days:{ 1:{label:"Workout 1",intervals:cp_w2()}, 2:{label:"Workout 2",intervals:cp_w2()}, 3:{label:"Workout 3",intervals:cp_w2()} }},
      3:{ label:"3주차", days:{ 1:{label:"Workout 1",intervals:cp_w3()}, 2:{label:"Workout 2",intervals:cp_w3()}, 3:{label:"Workout 3",intervals:cp_w3()} }},
      4:{ label:"4주차", days:{ 1:{label:"Workout 1",intervals:cp_w4()}, 2:{label:"Workout 2",intervals:cp_w4()}, 3:{label:"Workout 3",intervals:cp_w4()} }},
      5:{ label:"5주차", days:{ 1:{label:"Workout 1",intervals:cp_w5d1()}, 2:{label:"Workout 2",intervals:cp_w5d2()}, 3:{label:"Workout 3",intervals:cp_w5d3()} }},
      6:{ label:"6주차", days:{ 1:{label:"Workout 1",intervals:cp_w6d1()}, 2:{label:"Workout 2",intervals:cp_w6d2()}, 3:{label:"Workout 3",intervals:cp_w6d3()} }},
      7:{ label:"7주차", days:{ 1:{label:"Workout 1",intervals:cp_w7()}, 2:{label:"Workout 2",intervals:cp_w7()}, 3:{label:"Workout 3",intervals:cp_w7()} }},
      8:{ label:"8주차", days:{ 1:{label:"Workout 1",intervals:cp_w8()}, 2:{label:"Workout 2",intervals:cp_w8()}, 3:{label:"Workout 3",intervals:cp_w8()} }},
      9:{ label:"9주차", days:{ 1:{label:"Workout 1",intervals:cp_w9()}, 2:{label:"Workout 2",intervals:cp_w9()}, 3:{label:"Workout 3 🎉",intervals:cp_w9()} }},
    }
  },

  hh10k_int: {
    name: "Hal Higdon 10K 중급",
    desc: "10K 완주 8주 중급 훈련 · KM 기준 · 5일/주",
    totalWeeks: 8, daysPerWeek: 5,
    weeks: {
      1:{ label:"1주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        3:{label:"수 · 35분 템포런",           intervals:hh_tempo(35)},
        4:{label:"목 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        5:{label:"일 · 6.4km 롱런",           intervals:hh_long(6.4)},
      }},
      2:{ label:"2주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 5.9km 쉬운 달리기",    intervals:hh_easy(5.9)},
        3:{label:"수 · 8×400m 인터벌",        intervals:hh_speed(8)},
        4:{label:"목 · 6.4km 쉬운 달리기",    intervals:hh_easy(6.4)},
        5:{label:"일 · 8.1km 롱런",           intervals:hh_long(8.1)},
      }},
      3:{ label:"3주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 6.4km 쉬운 달리기",    intervals:hh_easy(6.4)},
        3:{label:"수 · 40분 템포런",           intervals:hh_tempo(40)},
        4:{label:"목 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        5:{label:"일 · 9.7km 롱런",           intervals:hh_long(9.7)},
      }},
      4:{ label:"4주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 7.3km 쉬운 달리기",    intervals:hh_easy(7.3)},
        3:{label:"수 · 9×400m 인터벌",        intervals:hh_speed(9)},
        4:{label:"목 · 6.4km 쉬운 달리기",    intervals:hh_easy(6.4)},
        5:{label:"일 · 5K 레이스 🏁",         intervals:hh_5k_race()},
      }},
      5:{ label:"5주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 8.1km 쉬운 달리기",    intervals:hh_easy(8.1)},
        3:{label:"수 · 45분 템포런",           intervals:hh_tempo(45)},
        4:{label:"목 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        5:{label:"일 · 9.7km 롱런",           intervals:hh_long(9.7)},
      }},
      6:{ label:"6주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 8.9km 쉬운 달리기",    intervals:hh_easy(8.9)},
        3:{label:"수 · 10×400m 인터벌",       intervals:hh_speed(10)},
        4:{label:"목 · 6.4km 쉬운 달리기",    intervals:hh_easy(6.4)},
        5:{label:"일 · 11.3km 롱런",          intervals:hh_long(11.3)},
      }},
      7:{ label:"7주차", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 9.7km 쉬운 달리기",    intervals:hh_easy(9.7)},
        3:{label:"수 · 50분 템포런",           intervals:hh_tempo(50)},
        4:{label:"목 · 6.4km 쉬운 달리기",    intervals:hh_easy(6.4)},
        5:{label:"일 · 12.9km 롱런",          intervals:hh_long(12.9)},
      }},
      8:{ label:"8주차 (레이스 주)", days:{
        1:{label:"월 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        2:{label:"화 · 4.8km 쉬운 달리기",    intervals:hh_easy(4.8)},
        3:{label:"수 · 5×400m 인터벌",        intervals:hh_speed(5)},
        4:{label:"목 · 가볍게 (1.6–4.8km)",   intervals:hh_w8_thu()},
        5:{label:"일 · 10K 레이스 🏆",        intervals:hh_10k_race()},
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
  return PROGRAMS[programId].weeks[week].days[day].intervals.reduce((s,iv)=>s+iv.duration,0);
}
