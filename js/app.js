/**
 * C25K Trainer — Main App
 */

// ===== STATE =====
let selectedWeek = 1;
let selectedDay  = 1;
let schedule     = [];       // flat intervals with start/end
let totalDuration = 0;       // seconds

let elapsed    = 0;          // seconds elapsed in workout
let timerRef   = null;       // setInterval handle
let isRunning  = false;
let curIdx     = -1;         // current interval index

let ytPlayer   = null;
let ytReady    = false;
let cueEnabled = true;
let cueVolume  = 0.9;

// Audio buffers cache
const audioCache = {};

// ===== DOM REFS =====
const selWeek       = document.getElementById("sel-week");
const selDay        = document.getElementById("sel-day");
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
const btnDownload   = document.getElementById("btn-download");
const toggleCue     = document.getElementById("toggle-cue");
const volSlider     = document.getElementById("vol-slider");
const toast         = document.getElementById("toast");

// ===== ICONS / LABELS =====
const TYPE_META = {
  warmup:   { icon: "🚶", label: "워밍업",  cls: "warmup"   },
  run:      { icon: "🏃", label: "달리기", cls: "run"      },
  walk:     { icon: "🚶", label: "걷기",   cls: "walk"     },
  cooldown: { icon: "🧊", label: "쿨다운", cls: "cooldown" },
};

// ===== INIT =====
function init() {
  buildWeekOptions();
  onWeekChange();
  preloadAudio();

  selWeek.addEventListener("change", onWeekChange);
  selDay.addEventListener("change",  onDayChange);
  btnLoad.addEventListener("click",  loadYouTube);
  ytUrlInput.addEventListener("keydown", e => { if (e.key === "Enter") loadYouTube(); });
  btnStartPause.addEventListener("click", toggleStartPause);
  btnReset.addEventListener("click",      resetWorkout);
  btnDownload.addEventListener("click",   downloadCueTrack);
  toggleCue.addEventListener("change", () => { cueEnabled = toggleCue.checked; });
  volSlider.addEventListener("input",  () => { cueVolume = volSlider.value / 100; });
}

// ===== WEEK/DAY OPTIONS =====
function buildWeekOptions() {
  selWeek.innerHTML = "";
  for (let w = 1; w <= 9; w++) {
    const opt = document.createElement("option");
    opt.value = w;
    opt.textContent = `Week ${w}`;
    selWeek.appendChild(opt);
  }
}

function onWeekChange() {
  selectedWeek = parseInt(selWeek.value);
  selDay.innerHTML = "";
  for (let d = 1; d <= 3; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `Day ${d}`;
    selDay.appendChild(opt);
  }
  onDayChange();
}

function onDayChange() {
  selectedDay   = parseInt(selDay.value);
  schedule      = getSchedule(selectedWeek, selectedDay);
  totalDuration = getTotalDuration(selectedWeek, selectedDay);
  resetWorkout();
  renderSummary();
  renderTimeline();
}

// ===== SUMMARY CHIPS =====
function renderSummary() {
  summaryChips.innerHTML = "";
  schedule.forEach(iv => {
    const meta = TYPE_META[iv.type];
    const chip = document.createElement("span");
    chip.className = `chip ${iv.type}`;
    chip.textContent = `${meta.icon} ${meta.label} ${formatDuration(iv.duration)}`;
    summaryChips.appendChild(chip);
  });
}

// ===== TIMELINE =====
function renderTimeline() {
  timeline.innerHTML = "";
  schedule.forEach((iv, i) => {
    const seg = document.createElement("div");
    seg.className = `tl-seg ${iv.type} upcoming`;
    seg.id = `tl-${i}`;
    seg.style.flex = iv.duration;
    seg.title = `${TYPE_META[iv.type].label} ${formatDuration(iv.duration)}`;
    timeline.appendChild(seg);
  });
}

function updateTimeline(idx) {
  schedule.forEach((_, i) => {
    const seg = document.getElementById(`tl-${i}`);
    if (!seg) return;
    seg.className = `tl-seg ${schedule[i].type} ${i < idx ? "done" : i === idx ? "active" : "upcoming"}`;
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
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
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

// ===== AUDIO =====
async function preloadAudio() {
  const cues = ["warmup","run","walk","cooldown","complete","ready_run","ready_walk","halfway","one_min_left"];
  for (const name of cues) {
    try {
      const res  = await fetch(`audio/${name}.mp3`);
      const buf  = await res.arrayBuffer();
      audioCache[name] = buf;
    } catch(e) { /* ok if missing */ }
  }
}

async function playCue(name) {
  if (!cueEnabled) return;
  const buf = audioCache[name];
  if (!buf) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await ctx.decodeAudioData(buf.slice(0));
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = cueVolume;
    src.buffer = decoded;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
    src.onended = () => ctx.close();
  } catch(e) { console.warn("Audio play failed:", e); }
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
  elapsed  = 0;
  curIdx   = -1;
  btnStartPause.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> 시작`;
  btnStartPause.className = "btn btn-primary";
  if (ytPlayer && ytReady) { ytPlayer.stopVideo(); }
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
  if (idx !== curIdx) {
    curIdx = idx;
    onIntervalChange(idx);
  }

  updateTimer();
  updateOverall();
}

function onIntervalChange(idx) {
  if (idx < 0) return;
  const iv   = schedule[idx];
  const meta = TYPE_META[iv.type];

  // update status card
  statusCard.className  = `card status-card ${meta.cls}`;
  statusIcon.textContent  = meta.icon;
  statusLabel.className   = `status-label ${meta.cls}`;
  statusLabel.textContent = meta.label;

  ivProgressBar.parentElement.parentElement
    .querySelector(".interval-progress").className = `interval-progress`;

  updateTimeline(idx);
  playCue(iv.cue);

  // schedule 30-sec warning for next interval
  scheduleWarning(idx);
}

function scheduleWarning(idx) {
  const iv = schedule[idx];
  const remaining = iv.end - elapsed;
  if (remaining > 35 && idx + 1 < schedule.length) {
    const next = schedule[idx + 1];
    const warnCue = next.type === "run" ? "ready_run" : "ready_walk";
    const delay = (remaining - 30) * 1000;
    setTimeout(() => {
      if (isRunning && curIdx === idx) playCue(warnCue);
    }, delay);
  }
  // halfway cue
  if (remaining > 60) {
    setTimeout(() => {
      if (isRunning && curIdx === idx) playCue("halfway");
    }, (remaining / 2) * 1000);
  }
  // 1-min left cue
  if (remaining > 75) {
    setTimeout(() => {
      if (isRunning && curIdx === idx) playCue("one_min_left");
    }, (remaining - 60) * 1000);
  }
}

function updateTimer() {
  if (curIdx < 0) return;
  const iv = schedule[curIdx];
  const remaining = iv.end - elapsed;
  timerDisplay.textContent = formatTime(remaining);

  const pct = ((iv.duration - remaining) / iv.duration) * 100;
  ivProgressBar.style.width = `${pct}%`;

  // next interval
  if (curIdx + 1 < schedule.length) {
    const next = schedule[curIdx + 1];
    const nm   = TYPE_META[next.type];
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
  statusCard.className  = "card status-card run";
  statusIcon.textContent  = "🎉";
  statusLabel.className   = "status-label run";
  statusLabel.textContent = "완료!";
  timerDisplay.textContent = "00:00";
  nextLabelEl.innerHTML = "<strong>운동 완료! 수고하셨습니다 🎉</strong>";
  btnStartPause.disabled = true;
  updateTimeline(schedule.length);
  updateOverall();
}

function renderIdle() {
  statusCard.className  = "card status-card idle";
  statusIcon.textContent  = "🏃";
  statusLabel.className   = "status-label idle";
  statusLabel.textContent = "준비";
  timerDisplay.textContent = formatTime(totalDuration);
  ivProgressBar.style.width = "0%";
  nextLabelEl.innerHTML = `시작 버튼을 눌러주세요`;
  btnStartPause.disabled = false;
  overallBar.style.width = "0%";
  progressMeta.innerHTML = `<strong>00:00</strong> / ${formatTime(totalDuration)}`;
}

// ===== DOWNLOAD =====
const SERVER_URL = "http://localhost:5000";

const DOWNLOAD_BTN_HTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/></svg> 노래+가이드 다운로드`;

async function checkServer() {
  try {
    const res = await fetch(`${SERVER_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch { return false; }
}

async function downloadCueTrack() {
  const ytUrl = ytUrlInput.value.trim();
  if (!ytUrl) {
    showToast("YouTube URL을 먼저 입력해주세요");
    return;
  }

  const btn = btnDownload;
  btn.disabled = true;
  btn.textContent = "서버 확인 중...";

  const serverOk = await checkServer();
  if (!serverOk) {
    btn.disabled = false;
    btn.innerHTML = DOWNLOAD_BTN_HTML;
    document.getElementById("server-modal").style.display = "flex";
    return;
  }

  btn.textContent = "믹싱 중... (1~3분 소요)";
  showToast("YouTube 다운로드 + 믹싱 중...");

  try {
    const res = await fetch(`${SERVER_URL}/mix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: ytUrl, week: selectedWeek, day: selectedDay }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const nameMatch = disposition.match(/filename="?([^";\r\n]+)"?/);
    const filename = nameMatch ? decodeURIComponent(nameMatch[1]) : `c25k_w${selectedWeek}d${selectedDay}.mp3`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast("다운로드 완료! 🎉");
  } catch(e) {
    console.error(e);
    showToast("실패: " + e.message);
  }

  btn.disabled = false;
  btn.innerHTML = DOWNLOAD_BTN_HTML;
}

// ===== UTILS =====
function formatTime(sec) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

function formatDuration(sec) {
  if (sec < 60) return `${sec}초`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}분 ${s}초` : `${m}분`;
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ===== START =====
document.addEventListener("DOMContentLoaded", init);
