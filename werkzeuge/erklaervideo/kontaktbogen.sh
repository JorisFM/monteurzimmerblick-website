#!/bin/bash
# Kontaktbögen aus out/stills: je 4 Standbilder (2×2) mit Zeitstempel -> out/stills/bogen_N.png
cd "$(dirname "$0")/out/stills"
FF=${FFMPEG:-$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")}
rm -f bogen_*.png
files=( $(ls t*.png | sort) )
n=0
for ((i=0; i<${#files[@]}; i+=4)); do
  args=(); filt=""; k=0
  for ((j=i; j<i+4 && j<${#files[@]}; j++)); do
    args+=( -i "${files[$j]}" )
    lbl=$(echo "${files[$j]}" | sed 's/t0*\([0-9]*\.[0-9]*\)\.png/\1/')
    filt+="[$k:v]scale=960:540,drawtext=text='${lbl}s':x=12:y=12:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6[v$k];"
    k=$((k+1))
  done
  while [ $k -lt 4 ]; do args+=( -f lavfi -i "color=c=gray:s=960x540:d=1" ); filt+="[$k:v]null[v$k];"; k=$((k+1)); done
  filt+="[v0][v1]hstack[a];[v2][v3]hstack[b];[a][b]vstack"
  "$FF" -loglevel error -y "${args[@]}" -filter_complex "$filt" -frames:v 1 bogen_$n.png 2>&1 | grep -v Fontconfig
  echo "$(pwd)/bogen_$n.png"
  n=$((n+1))
done
