"""
C25K Trainer — Local Mixing Server
- YouTube 오디오 다운로드 (yt-dlp)
- 음성 큐를 타이밍에 맞춰 오버레이 (pydub)
- 완성된 MP3 반환

Run: conda run -n c2k python server.py
"""

import os
import tempfile
import json
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import yt_dlp
from pydub import AudioSegment

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio")

# ===== C25K 스케줄 (server-side mirror of schedule.js) =====

def w(type_, mins, cue):
    return {"type": type_, "duration": mins * 60, "cue": cue}

def s(type_, secs, cue):
    return {"type": type_, "duration": secs, "cue": cue}

def build_week1():
    ivs = [w("warmup", 5, "warmup")]
    for _ in range(8):
        ivs += [s("run", 60, "run"), s("walk", 90, "walk")]
    ivs.append(w("cooldown", 5, "cooldown"))
    return ivs

def build_week2():
    ivs = [w("warmup", 5, "warmup")]
    for _ in range(6):
        ivs += [s("run", 90, "run"), w("walk", 2, "walk")]
    ivs.append(w("cooldown", 5, "cooldown"))
    return ivs

def build_week3():
    ivs = [w("warmup", 5, "warmup")]
    for _ in range(2):
        ivs += [s("run", 90, "run"), s("walk", 90, "walk"), w("run", 3, "run"), w("walk", 3, "walk")]
    ivs.append(w("cooldown", 5, "cooldown"))
    return ivs

def build_week4():
    return [
        w("warmup", 5, "warmup"),
        w("run", 3, "run"), s("walk", 90, "walk"),
        w("run", 5, "run"), s("walk", 150, "walk"),
        w("run", 3, "run"), s("walk", 90, "walk"),
        w("run", 5, "run"),
        w("cooldown", 5, "cooldown"),
    ]

def build_week5_day1():
    return [w("warmup",5,"warmup"), w("run",5,"run"), w("walk",3,"walk"),
            w("run",5,"run"), w("walk",3,"walk"), w("run",5,"run"), w("cooldown",5,"cooldown")]

def build_week5_day2():
    return [w("warmup",5,"warmup"), w("run",8,"run"), w("walk",5,"walk"),
            w("run",8,"run"), w("cooldown",5,"cooldown")]

def build_week5_day3():
    return [w("warmup",5,"warmup"), w("run",20,"run"), w("cooldown",5,"cooldown")]

def build_week6_day1():
    return [w("warmup",5,"warmup"), w("run",5,"run"), w("walk",3,"walk"),
            w("run",8,"run"), w("walk",3,"walk"), w("run",5,"run"), w("cooldown",5,"cooldown")]

def build_week6_day2():
    return [w("warmup",5,"warmup"), w("run",10,"run"), w("walk",3,"walk"),
            w("run",10,"run"), w("cooldown",5,"cooldown")]

def build_week6_day3():
    return [w("warmup",5,"warmup"), w("run",22,"run"), w("cooldown",5,"cooldown")]

def build_week7():
    return [w("warmup",5,"warmup"), w("run",25,"run"), w("cooldown",5,"cooldown")]

def build_week8():
    return [w("warmup",5,"warmup"), w("run",28,"run"), w("cooldown",5,"cooldown")]

def build_week9():
    return [w("warmup",5,"warmup"), w("run",30,"run"), w("cooldown",5,"cooldown")]

SCHEDULE = {
    1: {1: build_week1(), 2: build_week1(), 3: build_week1()},
    2: {1: build_week2(), 2: build_week2(), 3: build_week2()},
    3: {1: build_week3(), 2: build_week3(), 3: build_week3()},
    4: {1: build_week4(), 2: build_week4(), 3: build_week4()},
    5: {1: build_week5_day1(), 2: build_week5_day2(), 3: build_week5_day3()},
    6: {1: build_week6_day1(), 2: build_week6_day2(), 3: build_week6_day3()},
    7: {1: build_week7(), 2: build_week7(), 3: build_week7()},
    8: {1: build_week8(), 2: build_week8(), 3: build_week8()},
    9: {1: build_week9(), 2: build_week9(), 3: build_week9()},
}

def get_schedule_with_times(week, day):
    raw = SCHEDULE[week][day]
    t = 0
    result = []
    for iv in raw:
        result.append({**iv, "start": t, "end": t + iv["duration"]})
        t += iv["duration"]
    return result, t  # intervals, total_duration_sec


# ===== ROUTES =====

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/mix", methods=["POST"])
def mix():
    data = request.get_json()
    yt_url = data.get("url", "").strip()
    week   = int(data.get("week", 1))
    day    = int(data.get("day", 1))

    if not yt_url:
        return jsonify({"error": "YouTube URL이 없습니다"}), 400
    if week not in range(1, 10) or day not in range(1, 4):
        return jsonify({"error": "올바르지 않은 주차/요일"}), 400

    schedule, total_sec = get_schedule_with_times(week, day)

    with tempfile.TemporaryDirectory() as tmpdir:
        # 1. Download YouTube audio
        yt_path = os.path.join(tmpdir, "yt_audio.%(ext)s")
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": yt_path,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
            "quiet": True,
            "no_warnings": True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(yt_url, download=True)
                video_title = info.get("title", "workout")
        except Exception as e:
            return jsonify({"error": f"YouTube 다운로드 실패: {str(e)}"}), 500

        yt_file = os.path.join(tmpdir, "yt_audio.mp3")
        if not os.path.exists(yt_file):
            # find the downloaded file
            for f in os.listdir(tmpdir):
                if f.endswith(".mp3"):
                    yt_file = os.path.join(tmpdir, f)
                    break

        # 2. Build base track: loop/trim YouTube audio to total_sec
        total_ms = total_sec * 1000
        try:
            yt_audio = AudioSegment.from_mp3(yt_file)
        except Exception as e:
            return jsonify({"error": f"오디오 변환 실패: {str(e)}"}), 500

        # Loop YouTube audio until it covers total duration
        if len(yt_audio) < total_ms:
            loops_needed = int(total_ms / len(yt_audio)) + 2
            yt_audio = yt_audio * loops_needed
        base = yt_audio[:total_ms]

        # Lower YouTube audio slightly to make cues audible
        base = base - 4  # -4 dB

        # 3. Load all cue audio files
        cue_cache = {}
        for cue_name in ["warmup","run","walk","cooldown","complete",
                         "ready_run","ready_walk","halfway","one_min_left"]:
            cue_path = os.path.join(AUDIO_DIR, f"{cue_name}.mp3")
            if os.path.exists(cue_path):
                cue_cache[cue_name] = AudioSegment.from_mp3(cue_path)

        # 4. Overlay cues at correct timestamps
        def overlay_cue(track, cue_name, at_sec):
            cue = cue_cache.get(cue_name)
            if cue is None:
                return track
            at_ms = int(at_sec * 1000)
            # Boost cue volume slightly
            boosted = cue + 3  # +3 dB
            return track.overlay(boosted, position=at_ms)

        mixed = base

        for i, iv in enumerate(schedule):
            # Main cue at interval start
            mixed = overlay_cue(mixed, iv["cue"], iv["start"])

            remaining = iv["end"] - iv["start"]

            # 30-sec warning before next interval
            if i + 1 < len(schedule):
                next_iv = schedule[i + 1]
                warn_at = iv["end"] - 30
                if warn_at > iv["start"] + 5:
                    warn_cue = "ready_run" if next_iv["type"] == "run" else "ready_walk"
                    mixed = overlay_cue(mixed, warn_cue, warn_at)

            # 1-min left cue
            one_min_at = iv["end"] - 60
            if one_min_at > iv["start"] + 5:
                mixed = overlay_cue(mixed, "one_min_left", one_min_at)

            # Halfway cue
            half_at = iv["start"] + remaining / 2
            if remaining > 120 and half_at > iv["start"] + 10:
                mixed = overlay_cue(mixed, "halfway", half_at)

        # Complete cue near end
        complete_cue = cue_cache.get("complete")
        if complete_cue:
            complete_at = max(0, total_sec - complete_cue.duration_seconds - 1)
            mixed = overlay_cue(mixed, "complete", complete_at)

        # 5. Export
        safe_title = "".join(c for c in video_title if c.isalnum() or c in " _-")[:40].strip()
        out_name = f"c25k_w{week}d{day}_{safe_title}.mp3"
        out_path = os.path.join(tmpdir, out_name)
        mixed.export(out_path, format="mp3", bitrate="192k",
                     tags={"title": f"C25K W{week}D{day} - {video_title}",
                           "artist": "C25K Trainer"})

        return send_file(
            out_path,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name=out_name,
        )


if __name__ == "__main__":
    print("=" * 50)
    print("  C25K Trainer 로컬 서버 실행 중")
    print("  브라우저: http://localhost:5000")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=False)
