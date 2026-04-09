# 🏃 C25K Trainer

> **Couch to 5K** 러닝 프로그램을 유튜브 음악과 함께 — 음성 가이드로 트레드밀에서 스마트하게 운동하세요.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://frioct.github.io/c25k-trainer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 배경

[C25K (Couch to 5K)](https://c25k.com/c25k_treadmill/) 프로그램은 9주 동안 걷기와 달리기를 반복하며 완전한 초보자도 5km를 완주할 수 있게 만들어주는 러닝 프로그램입니다.

트레드밀에서 운동하다 보면 매번 타이머를 보고 프로그램표를 확인하는 게 번거로웠습니다. 음악을 듣는 동안 **"달려요!"**, **"걸어요!"** 음성이 자동으로 나온다면 화면을 볼 필요가 없겠다는 아이디어에서 이 프로젝트가 시작되었습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🗓️ **스케줄 선택** | C25K 9주 × 3일 전체 프로그램 내장 |
| 🎵 **YouTube 연동** | 좋아하는 음악 재생하며 운동 |
| 🔊 **한국어 음성 큐** | 구간 전환 시 자동 음성 안내 (달리기/걷기/준비) |
| ⏱️ **인터벌 타이머** | 현재 구간 남은 시간 + 전체 진행률 시각화 |
| 📱 **모바일 최적화** | 트레드밀 위에서 한 손으로도 조작 가능한 UI |
| ⬇️ **믹싱 다운로드** | YouTube 음원 + 음성 큐를 하나의 MP3로 합성 |

---

## 스크린샷

> *(추후 추가 예정)*

---

## 사용 방법

### 온라인 (웹앱)

1. 주차 / 요일 선택
2. YouTube URL 입력 후 **불러오기**
3. **시작** 버튼 → 음성 가이드와 함께 운동 시작

### 오프라인 (MP3 다운로드)

로컬 서버를 실행하면 YouTube 음원 + 음성 큐가 합쳐진 MP3를 다운로드할 수 있습니다.

```bash
# 1. conda 환경 생성 (최초 1회)
conda create -n c2k python=3.11 -y
conda run -n c2k pip install -r requirements.txt

# 2. 서버 실행
conda run -n c2k python server.py

# 3. 브라우저에서 http://localhost:5000 접속
#    → YouTube URL 입력 → "노래+가이드 다운로드"
```

---

## 기술 스택

**Frontend**
- Vanilla JavaScript (No framework, no bundler)
- YouTube IFrame API
- Web Audio API (실시간 음성 큐 재생)
- GitHub Pages 배포

**Backend (선택적, 다운로드 기능)**
- Python / Flask
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) — YouTube 오디오 추출
- [`pydub`](https://github.com/jiaaro/pydub) — 오디오 믹싱
- [`edge-tts`](https://github.com/rany2/edge-tts) — Microsoft Neural TTS (한국어 여성 음성)
- Render.com 배포

---

## 프로젝트 구조

```
c25k-trainer/
├── index.html              # 메인 웹앱
├── css/
│   └── style.css           # 모바일 퍼스트 다크 테마
├── js/
│   ├── schedule.js         # C25K 9주 전체 스케줄 데이터
│   └── app.js              # 타이머 엔진 / YouTube / 오디오
├── audio/                  # 한국어 MP3 음성 큐 (9개)
├── server.py               # Flask API (YouTube 다운로드 + 믹싱)
├── generate_audio.py       # 음성 큐 재생성 스크립트
├── requirements.txt
└── render.yaml             # Render.com 배포 설정
```

---

## 배포 구조

```
GitHub Pages                Render.com (Free Tier)
────────────────            ──────────────────────
index.html                  server.py (Flask)
css / js / audio    ──────► /mix  (YouTube + pydub 믹싱)
                            /health
```

### Render.com 배포 방법

1. [render.com](https://render.com) 가입 후 **New Web Service**
2. GitHub 레포 연결 → `render.yaml` 자동 감지
3. 발급된 URL을 `index.html`의 `window.C25K_API_URL`에 입력

```html
<script>window.C25K_API_URL = "https://c25k-trainer-api.onrender.com";</script>
```

> **참고**: Render 무료 티어는 15분 비활성 시 슬립 상태가 됩니다.  
> 첫 다운로드 요청 시 30초 정도 깨어나는 시간이 필요할 수 있습니다.

---

## 음성 큐 목록

| 파일 | 내용 | 재생 시점 |
|------|------|-----------|
| `warmup.mp3` | "워밍업 시작! 천천히 걸어볼까요!" | 워밍업 시작 |
| `run.mp3` | "달려요! 파이팅!" | 달리기 시작 |
| `walk.mp3` | "잘 하셨어요! 이제 걸어요." | 걷기 시작 |
| `ready_run.mp3` | "30초 후 달리기 시작! 준비하세요!" | 달리기 30초 전 |
| `ready_walk.mp3` | "곧 걷기 시작합니다. 조금만 더요!" | 걷기 30초 전 |
| `halfway.mp3` | "절반 완료! 너무 잘하고 있어요!" | 구간 절반 |
| `one_min_left.mp3` | "1분 남았어요! 조금만 더 힘내요!" | 구간 1분 전 |
| `cooldown.mp3` | "쿨다운! 천천히 걸으며 마무리해요." | 쿨다운 시작 |
| `complete.mp3` | "운동 완료! 정말 잘 하셨어요! 최고예요!" | 운동 완료 |

음성 재생성:
```bash
conda run -n c2k python generate_audio.py
```

---

## 라이선스

MIT License

---

## 참고

- C25K 프로그램 출처: [c25k.com/c25k_treadmill](https://c25k.com/c25k_treadmill/)
- 음성 합성: [Microsoft Edge TTS](https://github.com/rany2/edge-tts) — `ko-KR-SunHiNeural`
