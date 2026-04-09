"""
C25K / Running Trainer — Korean voice cue generator
Voice: ko-KR-SunHiNeural (Microsoft Neural TTS, female, energetic)
Run: conda run -n c2k python generate_audio.py
"""
import asyncio
import edge_tts
import os

os.makedirs("audio", exist_ok=True)

VOICE = "ko-KR-SunHiNeural"

# (text, rate, pitch)
cues = {
    # C25K 공통
    "warmup":        ("워밍업 시작! 천천히 걸어볼까요!",           "+0%",  "+2Hz"),
    "run":           ("달려요! 파이팅!",                           "+15%", "+5Hz"),
    "walk":          ("잘 하셨어요! 이제 걸어요.",                  "+5%",  "+2Hz"),
    "cooldown":      ("쿨다운! 천천히 걸으며 마무리해요.",           "+0%",  "+2Hz"),
    "complete":      ("운동 완료! 정말 잘 하셨어요! 최고예요!",      "+10%", "+5Hz"),
    "ready_run":     ("30초 후 달리기 시작! 준비하세요!",            "+10%", "+5Hz"),
    "ready_walk":    ("곧 걷기 시작합니다. 조금만 더요!",            "+5%",  "+2Hz"),
    "halfway":       ("절반 완료! 너무 잘하고 있어요!",              "+10%", "+5Hz"),
    "one_min_left":  ("1분 남았어요! 조금만 더 힘내요!",             "+10%", "+5Hz"),
    # Hal Higdon 추가
    "easy_run":      ("편하게 달려요! 즐기면서 가요!",               "+5%",  "+2Hz"),
    "tempo":         ("템포! 속도를 올려요! 파이팅!",                "+15%", "+5Hz"),
    "long_run":      ("롱런 시작! 꾸준하게 달려요!",                 "+5%",  "+2Hz"),
    "race":          ("레이스 데이! 최선을 다해요! 파이팅!",          "+15%", "+8Hz"),
    "speed400":      ("400미터! 전력으로 달려요!",                   "+20%", "+8Hz"),
}

async def generate_cue(name, text, rate, pitch):
    path = f"audio/{name}.mp3"
    comm = edge_tts.Communicate(text=text, voice=VOICE, rate=rate, pitch=pitch)
    await comm.save(path)
    print(f"생성: {path}  [{text}]")

async def main():
    tasks = [generate_cue(n, t, r, p) for n, (t, r, p) in cues.items()]
    await asyncio.gather(*tasks)
    print(f"\n총 {len(cues)}개 음성 파일 생성 완료!")

if __name__ == "__main__":
    asyncio.run(main())
