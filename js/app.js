/**
 * Running Trainer — App
 * - Multi-program: C25K Treadmill / C25K Plan / Hal Higdon 10K Int
 * - Mobile-safe Web Audio (single AudioContext, resume on gesture)
 * - YouTube IFrame API integration
 */

// ===== STATE =====
let selectedProgram = "c25k_treadmill";
let selectedWeek    = 1;
let selectedDay     = 1;
let schedule        = [];
let totalDuration   = 0;

let elapsed   = 0;
let timerRef  = null;
let isRunning = false;
let curIdx    = -1;

let ytPlayer  = null;
let ytReady   = false;
let cueEnabled = true;
let cueVolume  = 0.9;

// ===== AUDIO (single persistent AudioContext for mobile) =====
let audioCtx = null;
const audioCache = {};

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // iOS/Android may suspend context — always resume before playing
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Unlock audio on first user gesture (required on iOS)
function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  // Play a silent buffer to fully unlock
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
}

async function preloadAudio() {
  const names = [
    "warmup","run","walk","cooldown","complete",
    "ready_run","ready_walk","halfway","one_min_left",
    "easy_run","tempo","long_run","race",
  ];
  for (const name of names) {
    try {
      const res = await fetch(`audio/${name}.mp3`);
      audioCache[name] = await res.arrayBuffer();
    } catch { /* skip missing */ }
  }
}

async function playCue(name) {
  if (!cueEnabled) return;
  const raw = audioCache[name];
  if (!raw) return;
  try {
    const ctx = getAudioCtx();
    const decoded = await ctx.decodeAudioData(raw.slice(0));
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = cueVolume;
    src.buffer = decoded;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
  } catch(e) { console.warn("cue play failed:", e); }
}

// ===== DOM =====
const selProgram    = document.getElementById("sel-program");
const selWeek       = document.getElementById("sel-week");
const selDay        = document.getElementById("sel-day");
const dayLabel      = document.getElementById("day-label");
const summaryChips  = document.getElementById("summary-chips");
const ytUrlInput    = document.getElementById("yt-url");
const btnLoad       = document.getElementById("btn-load");
const ytContainer   = document.getElementById("yt-container");
const statusCard    = document.getElementById("status-card");
const statusIcon    = document.getElementById("status-icon");
const statusLabel   = document.getElementById("status-label");
const timerDisplay  = document.getElementById("timer-display");
const ivProgressBar = document.getElementById("iv-progress-bar");
const nextLabelEl   = document.getElementById("next-label");
const overallBar    = document.getElementById("overall-bar");
const progressMeta  = document.getElementById("progress-meta");
const timeline      = document.getElementById("timeline");
const btnStartPause = document.getElementById("btn-start-pause");
const btnReset      = document.getElementById("btn-reset");
const toggleCue     = document.getElementById("toggle-cue");
const volSlider     = document.getElementById("vol-slider");
const toast         = document.getElementById("toast");

// ===== TYPE META =====
const TYPE_META = {
  warmup:   { icon: "🚶", label: "워밍업",    cls: "warmup"   },
  run:      { icon: "🏃", label: "달리기",    cls: "run"      },
  walk:     { icon: "🚶", label: "걷기",      cls: "walk"     },
  cooldown: { icon: "🧊", label: "쿨다운",    cls: "cooldown" },
};

// ===== INIT =====
function init() {
  buildProgramOptions();
  onProgramChange();
  preloadAudio();

  selProgram.addEventListener("change", onProgramChange);
  selWeek.addEventListener("change",    onWeekChange);
  selDay.addEventListener("change",     onDayChange);
  btnLoad.addEventListener("click",     loadYouTube);
  ytUrlInput.addEventListener("keydown", e => { if (e.key === "Enter") loadYouTube(); });
  btnStartPause.addEventListener("click", () => { unlockAudio(); toggleStartPause(); });
  btnReset.addEventListener("click",      resetWorkout);
  toggleCue.addEventListener("change",   () => { cueEnabled = toggleCue.checked; });
  volSlider.addEventListener("input",    () => { cueVolume = volSlider.value / 100; });

  // Unlock audio on any early touch (mobile)
  document.addEventListener("touchstart", unlockAudio, { once: true });
  document.addEventListener("click",      unlockAudio, { once: true });
}

// ===== PROGRAM / WEEK / DAY =====
function buildProgramOptions() {
  selProgram.innerHTML = "";
  Object.entries(PROGRAMS).forEach(([id, prog]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = prog.name;
    selProgram.appendChild(opt);
  });
}

function onProgramChange() {
  selectedProgram = selProgram.value;
  const prog = PROGRAMS[selectedProgram];

  // week options
  selWeek.innerHTML = "";
  for (let w = 1; w <= prog.totalWeeks; w++) {
    const opt = document.createElement("option");
    opt.value = w;
    opt.textContent = prog.weeks[w].label;
    selWeek.appendChild(opt);
  }
  onWeekChange();
}

function onWeekChange() {
  selectedWeek = parseInt(selWeek.value);
  const prog = PROGRAMS[selectedProgram];
  const week = prog.weeks[selectedWeek];

  selDay.innerHTML = "";
  Object.entries(week.days).forEach(([d, day]) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = day.label;
    selDay.appendChild(opt);
  });
  onDayChange();
}

function onDayChange() {
  selectedDay   = parseInt(selDay.value);
  schedule      = getSchedule(selectedProgram, selectedWeek, selectedDay);
  totalDuration = getTotalDuration(selectedProgram, selectedWeek, selectedDay);
  resetWorkout();
  renderSummary();
  renderTimeline();
}

// ===== SUMMARY CHIPS =====
function renderSummary() {
  summaryChips.innerHTML = "";
  // Deduplicate consecutive same-type for Hal Higdon long/easy runs
  let prev = null;
  schedule.forEach(iv => {
    const type = iv.type;
    const meta = TYPE_META[type] || { icon:"🏃", label: type, cls: "run" };
    if (type === prev) return; // skip duplicates in long continuous runs
    prev = type;
    const chip = document.createElement("span");
    chip.className = `chip ${meta.cls}`;
    chip.textContent = `${meta.icon} ${meta.label} ${formatDuration(iv.duration)}`;
    summaryChips.appendChild(chip);
  });

  // show total
  const total = document.createElement("span");
  total.className = "chip";
  total.style.cssText = "background:var(--surface2);color:var(--text-dim);border:1px solid var(--border)";
  total.textContent = `⏱ 총 ${formatDuration(totalDuration)}`;
  summaryChips.appendChild(total);
}

// ===== TIMELINE =====
function renderTimeline() {
  timeline.innerHTML = "";
  schedule.forEach((iv, i) => {
    const meta = TYPE_META[iv.type] || { cls: "run" };
    const seg = document.createElement("div");
    seg.className = `tl-seg ${meta.cls} upcoming`;
    seg.id = `tl-${i}`;
    seg.style.flex = iv.duration;
    seg.title = `${meta.label || iv.type} ${formatDuration(iv.duration)}`;
    timeline.appendChild(seg);
  });
}

function updateTimeline(idx) {
  schedule.forEach((_, i) => {
    const seg = document.getElementById(`tl-${i}`);
    if (!seg) return;
    const meta = TYPE_META[schedule[i].type] || { cls: "run" };
    seg.className = `tl-seg ${meta.cls} ${i < idx ? "done" : i === idx ? "active" : "upcoming"}`;
  });
}

// ===== YOUTUBE =====
function loadYouTube() {
  const url = ytUrlInput.value.trim();
  if (!url) { showToast("YouTube URL을 입력하세요"); return; }
  const vid = extractVideoId(url);
  if (!vid) { showToast("올바른 YouTube URL이 아닙니다"); return; }

  ytContainer.innerHTML = `<div class="yt-player-wrap"><div id="yt-player"></div></div>`;

  if (window.YT && YT.Player) {
    createPlayer(vid);
  } else {
    window._ytVidId = vid;
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }
}

window.onYouTubeIframeAPIReady = function() {
  if (window._ytVidId) createPlayer(window._ytVidId);
};

function createPlayer(vid) {
  ytPlayer = new YT.Player("yt-player", {
    videoId: vid,
    playerVars: { autoplay: 0, playsinline: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => { ytReady = true; showToast("영상 로드 완료!"); }
    }
  });
}

function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ===== TIMER =====
function toggleStartPause() {
  if (isRunning) pauseWorkout(); else startWorkout();
}

function startWorkout() {
  if (elapsed >= totalDuration) resetWorkout();
  isRunning = true;
  btnStartPause.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> 일시정지`;
  btnStartPause.className = "btn btn-secondary";
  if (ytPlayer && ytReady) ytPlayer.playVideo();
  timerRef = setInterval(tick, 1000);
}

function pauseWorkout() {
  isRunning = false;
  clearInterval(timerRef);
  btnStartPause.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> 재개`;
  btnStartPause.className = "btn btn-primary";
  if (ytPlayer && ytReady) ytPlayer.pauseVideo();
}

function resetWorkout() {
  isRunning = false;
  clearInterval(timerRef);
  elapsed = 0; curIdx = -1;
  btnStartPause.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> 시작`;
  btnStartPause.className = "btn btn-primary";
  btnStartPause.disabled = false;
  if (ytPlayer && ytReady) ytPlayer.stopVideo();
  renderIdle();
  renderTimeline();
  updateOverall();
}

function tick() {
  elapsed++;
  if (elapsed > totalDuration) {
    elapsed = totalDuration;
    finishWorkout();
    return;
  }
  const idx = schedule.findIndex(iv => elapsed > iv.start && elapsed <= iv.end);
  if (idx !== curIdx) { curIdx = idx; onIntervalChange(idx); }
  updateTimer();
  updateOverall();
}

function onIntervalChange(idx) {
  if (idx < 0) return;
  const iv   = schedule[idx];
  const meta = TYPE_META[iv.type] || { icon:"🏃", label: iv.type, cls: "run" };

  statusCard.className    = `card status-card ${meta.cls}`;
  statusIcon.textContent  = meta.icon;
  statusLabel.className   = `status-label ${meta.cls}`;
  statusLabel.textContent = meta.label;

  updateTimeline(idx);
  playCue(iv.cue);
  scheduleWarnings(idx);
}

function scheduleWarnings(idx) {
  const iv = schedule[idx];
  const remaining = iv.end - elapsed;

  // 30-sec warning before next interval
  if (remaining > 35 && idx + 1 < schedule.length) {
    const next    = schedule[idx + 1];
    const warnCue = (next.type === "run" || next.cue === "tempo" || next.cue === "easy_run" || next.cue === "long_run")
                    ? "ready_run" : "ready_walk";
    setTimeout(() => {
      if (isRunning && curIdx === idx) playCue(warnCue);
    }, (remaining - 30) * 1000);
  }

  // halfway cue (only for runs > 2 minutes)
  if (remaining > 120) {
    setTimeout(() => {
      if (isRunning && curIdx === idx) playCue("halfway");
    }, (remaining / 2) * 1000);
  }

  // 1-min left
  if (remaining > 75) {
    setTimeout(() => {
      if (isRunning && curIdx === idx) playCue("one_min_left");
    }, (remaining - 60) * 1000);
  }
}

function updateTimer() {
  if (curIdx < 0) return;
  const iv        = schedule[curIdx];
  const remaining = iv.end - elapsed;
  timerDisplay.textContent = formatTime(remaining);

  const pct = ((iv.duration - remaining) / iv.duration) * 100;
  ivProgressBar.style.width = `${pct}%`;

  if (curIdx + 1 < schedule.length) {
    const next = schedule[curIdx + 1];
    const nm   = TYPE_META[next.type] || { icon:"🏃", label: next.type };
    nextLabelEl.innerHTML = `다음: <strong>${nm.icon} ${nm.label} ${formatDuration(next.duration)}</strong>`;
  } else {
    nextLabelEl.innerHTML = `<strong>마지막 구간!</strong>`;
  }
}

function updateOverall() {
  const pct = Math.min((elapsed / totalDuration) * 100, 100);
  overallBar.style.width = `${pct}%`;
  progressMeta.innerHTML = `<strong>${formatTime(elapsed)}</strong> / ${formatTime(totalDuration)}`;
}

function finishWorkout() {
  isRunning = false;
  clearInterval(timerRef);
  if (ytPlayer && ytReady) ytPlayer.pauseVideo();
  playCue("complete");
  statusCard.className    = "card status-card run";
  statusIcon.textContent  = "🎉";
  statusLabel.className   = "status-label run";
  statusLabel.textContent = "완료!";
  timerDisplay.textContent = "00:00";
  nextLabelEl.innerHTML   = "<strong>운동 완료! 수고하셨습니다 🎉</strong>";
  btnStartPause.disabled  = true;
  updateTimeline(schedule.length);
  updateOverall();
}

function renderIdle() {
  statusCard.className    = "card status-card idle";
  statusIcon.textContent  = "🏃";
  statusLabel.className   = "status-label idle";
  statusLabel.textContent = "준비";
  timerDisplay.textContent = formatTime(totalDuration);
  ivProgressBar.style.width = "0%";
  nextLabelEl.innerHTML   = "시작 버튼을 눌러주세요";
  overallBar.style.width  = "0%";
  progressMeta.innerHTML  = `<strong>00:00</strong> / ${formatTime(totalDuration)}`;
}

// ===== UTILS =====
function formatTime(sec) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60), r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}
function formatDuration(sec) {
  if (sec < 60) return `${sec}초`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}분 ${s}초` : `${m}분`;
}

let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("DOMContentLoaded", init);
