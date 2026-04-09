# 🏃 Running Trainer

> YouTube 음악과 함께하는 러닝 가이드 — 음성 큐가 자동으로 달리기/걷기 구간을 알려줘요.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://frioct.github.io/c25k-trainer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 배경

트레드밀에서 운동하다 보면 매번 타이머를 보고 프로그램표를 확인하는 게 번거로웠습니다.
음악을 듣는 동안 **"달려요!"**, **"걸어요!"** 음성이 자동으로 나온다면 화면을 볼 필요가 없겠다는 아이디어에서 시작했습니다.

---

## 지원 프로그램

| 프로그램 | 출처 | 기간 | 목표 |
|---------|------|------|------|
| **C25K 트레드밀** | [c25k.com/c25k_treadmill](https://c25k.com/c25k_treadmill/) | 9주 · 3일/주 | 5K 완주 (트레드밀) |
| **C25K 플랜** | [c25k.com/c25k_plan](https://c25k.com/c25k_plan/) | 9주 · 3일/주 | 5K 완주 (야외) |
| **Hal Higdon 10K 중급** | [halhigdon.com](https://www.halhigdon.com/training-programs/10k-training/intermediate-10k/) | 8주 · 5일/주 | 10K 완주 |

### C25K 트레드밀 vs C25K 플랜 차이
- 트레드밀: 쿨다운 포함, Week 5 W1 조깅 3회
- 플랜(야외): 쿨다운 없음, Week 5 W1 조깅 3회 (동일하나 일부 구간 상이)

### Hal Higdon 10K 중급 구성
- 월/화/목: 쉬운 달리기 (KM 기준, 6:15/km 페이스)
- 수: 홀수주 템포런 / 짝수주 400m 인터벌
- 일: 롱런 (4주차: 5K 레이스, 8주차: 10K 레이스)
- 토요일 크로스 트레이닝은 앱에서 제외 (러닝 아님)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🗓️ **프로그램 선택** | 3가지 훈련 프로그램 중 선택 |
| 🎵 **YouTube 연동** | 좋아하는 음악 재생하며 운동 |
| 🔊 **한국어 음성 큐** | 구간 전환 시 자동 음성 안내 |
| ⏱️ **인터벌 타이머** | 현재 구간 + 전체 진행률 시각화 |
| 📱 **모바일 최적화** | 트레드밀 위에서 한 손으로도 조작 가능 |

---

## 음성 큐 목록

| 파일 | 내용 | 재생 시점 |
|------|------|-----------|
| `warmup.mp3` | "워밍업 시작! 천천히 걸어볼까요!" | 워밍업 시작 |
| `run.mp3` | "달려요! 파이팅!" | 달리기 시작 |
| `walk.mp3` | "잘 하셨어요! 이제 걸어요." | 걷기 시작 |
| `easy_run.mp3` | "편하게 달려요! 즐기면서 가요!" | HH 쉬운 달리기 |
| `tempo.mp3` | "템포! 속도를 올려요! 파이팅!" | 템포런 구간 |
| `speed400.mp3` | "400미터! 전력으로 달려요!" | 400m 인터벌 |
| `long_run.mp3` | "롱런 시작! 꾸준하게 달려요!" | HH 롱런 |
| `race.mp3` | "레이스 데이! 최선을 다해요!" | 레이스 |
| `ready_run.mp3` | "30초 후 달리기 시작! 준비하세요!" | 달리기 30초 전 |
| `ready_walk.mp3` | "곧 걷기 시작합니다. 조금만 더요!" | 걷기 30초 전 |
| `halfway.mp3` | "절반 완료! 너무 잘하고 있어요!" | 구간 절반 |
| `one_min_left.mp3` | "1분 남았어요! 조금만 더 힘내요!" | 구간 1분 전 |
| `complete.mp3` | "운동 완료! 정말 잘 하셨어요!" | 운동 완료 |

음성 재생성 (변경 시):
```bash
conda run -n c2k python generate_audio.py
```

---

## 프로젝트 구조

```
c25k-trainer/
├── index.html              # 메인 웹앱
├── css/style.css           # 모바일 퍼스트 다크 테마
├── js/
│   ├── schedule.js         # 3개 프로그램 전체 스케줄 데이터
│   └── app.js              # 타이머 / YouTube / 오디오 엔진
├── audio/                  # 한국어 MP3 음성 큐 (13개)
├── generate_audio.py       # 음성 큐 재생성 스크립트
└── requirements.txt        # edge-tts
```

---

## 기술 스택

- **Vanilla JavaScript** — 프레임워크 없음, 빌드 스텝 없음
- **YouTube IFrame API** — 영상 재생 연동
- **Web Audio API** — 모바일 호환 음성 큐 재생
- **edge-tts** (`ko-KR-SunHiNeural`) — 한국어 여성 음성 생성
- **GitHub Pages** — 무료 호스팅

---

## 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/FriOct/c25k-trainer.git
cd c25k-trainer

# 아무 로컬 서버로 실행 (Python 예시)
python -m http.server 8080
# → http://localhost:8080
```

---

## 참고

- C25K 트레드밀: [c25k.com/c25k_treadmill](https://c25k.com/c25k_treadmill/)
- C25K 플랜: [c25k.com/c25k_plan](https://c25k.com/c25k_plan/)
- Hal Higdon Intermediate 10K: [halhigdon.com](https://www.halhigdon.com/training-programs/10k-training/intermediate-10k/)
- 음성 합성: [Microsoft Edge TTS](https://github.com/rany2/edge-tts) — `ko-KR-SunHiNeural`
