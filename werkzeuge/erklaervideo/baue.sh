#!/bin/bash
# Baut assets/video/erklaervideo.mp4 neu: Bilder rendern, Ton mischen, zusammenführen.
# Voraussetzung: im Projektordner läuft `python3 -m http.server 8765`, Google Chrome ist installiert,
# `npm install` in diesem Ordner, `pip3 install --user numpy imageio-ffmpeg`.
set -e
cd "$(dirname "$0")"
FF=${FFMPEG:-$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")}
node render.js 60
python3 audio.py
"$FF" -loglevel error -y -i out/video_stumm.mp4 -i out/mix.wav \
  -c:v libx264 -preset slow -crf 20 -tune animation -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 160k -shortest -movflags +faststart ../../assets/video/erklaervideo.mp4
"$FF" -loglevel error -y -ss 4.7 -i ../../assets/video/erklaervideo.mp4 -frames:v 1 -vf scale=1280:720 ../../assets/img/video-poster.png
echo "fertig: assets/video/erklaervideo.mp4"
