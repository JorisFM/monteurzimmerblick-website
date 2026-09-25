"""Mischt den Ton fürs Erklärvideo: Sprecher (geschnitten), Musik (unter der Stimme abgesenkt), Geräusche.
python3 audio.py  ->  out/mix.wav   (liest out/cues.json aus render.js)
"""
import json, os, subprocess
import numpy as np

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
try:
    import imageio_ffmpeg
    FF = os.environ.get('FFMPEG') or imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FF = os.environ.get('FFMPEG', 'ffmpeg')
VOICE = os.path.join(SITE, 'assets/video/sprecher.mp3')
MUSIC = os.path.join(SITE, 'assets/video/musik.mp3')
SR = 48000
rng = np.random.default_rng(7)


def load(path, ch):
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).astype(np.float64)


def db(x):
    return 10 ** (x / 20)


def smooth(x, a_up, a_down):
    """Hüllkurve mit getrennter Anstiegs- und Abfallzeit (Sekunden)."""
    cu, cd = np.exp(-1 / (a_up * SR)), np.exp(-1 / (a_down * SR))
    y = np.zeros_like(x); v = 0.0
    for i, s in enumerate(x):
        c = cu if s > v else cd
        v = c * v + (1 - c) * s
        y[i] = v
    return y


# ---------------- Geräusche ----------------
def t_(d):
    return np.arange(int(d * SR)) / SR


def sweep(f0, f1, d, curve=1.0):
    t = t_(d); f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def env(d, att, tau):
    t = t_(d)
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-np.maximum(0, t - att) / tau)


def onepole_lp(x, fc):
    fc = np.broadcast_to(fc, x.shape)
    y = np.zeros_like(x); v = 0.0
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * fc[i] / SR)
        v += a * (x[i] - v); y[i] = v
    return y


def bell(f, d=0.9, tau=0.35, parts=((1, 1), (2.0, .25), (3.01, .12), (4.2, .05))):
    t = t_(d); y = np.zeros_like(t)
    for m, g in parts:
        y += g * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (tau / (1 + (m - 1) * 0.6)))
    return y * np.minimum(1, t / 0.002)


def make_sfx(name):
    if name == 'pop':
        d = 0.14; return 0.55 * sweep(320, 980, d, 0.6) * env(d, 0.004, 0.045)
    if name == 'tick':
        d = 0.06; t = t_(d)
        return 0.4 * (np.sin(2 * np.pi * 1850 * t) + 0.5 * rng.standard_normal(len(t))) * env(d, 0.001, 0.009)
    if name == 'click':
        d = 0.08; t = t_(d)
        body = np.sin(2 * np.pi * 620 * t) * env(d, 0.001, 0.014)
        snap = rng.standard_normal(len(t)) * env(d, 0.0005, 0.003)
        return 0.6 * (body + 0.6 * snap)
    if name == 'whoosh':
        d = 0.55; t = t_(d); p = t / d
        n = rng.standard_normal(len(t))
        fc = 350 + 3800 * np.sin(np.pi * np.clip(p * 1.1, 0, 1)) ** 2
        y = onepole_lp(n, fc) - onepole_lp(n, fc * 0.18)
        e = np.sin(np.pi * np.clip(p, 0, 1)) ** 2 * (1 - 0.3 * p)
        return 0.9 * y * e
    if name == 'thud':
        d = 0.35; return 0.8 * sweep(120, 42, d, 0.5) * env(d, 0.003, 0.09)
    if name == 'thump':
        d = 0.3; t = t_(d)
        k = sweep(160, 48, d, 0.4) * env(d, 0.002, 0.08)
        c = rng.standard_normal(len(t)) * env(d, 0.0005, 0.004)
        return 0.75 * k + 0.12 * c
    if name == 'down':
        a = bell(587.3, 0.3, 0.16, ((1, 1), (2, .2))) * 0.5
        b = bell(440.0, 0.6, 0.28, ((1, 1), (2, .2))) * 0.5
        y = np.zeros(int(0.9 * SR)); y[:len(a)] += a; o = int(0.2 * SR); y[o:o + len(b)] += b
        return y
    if name == 'drop':
        d = 0.42; y = 0.45 * sweep(980, 240, d, 0.7) * env(d, 0.005, 0.2)
        th = 0.4 * sweep(140, 60, 0.15) * env(0.15, 0.002, 0.04)
        o = int(0.3 * SR); y[o:o + len(th)] += th[:len(y) - o]
        return y
    if name.startswith('plink'):
        i = int(name[5:] or 0)
        return 0.35 * bell([1046.5, 1174.7, 1318.5, 1568.0][i % 4], 0.6, 0.22)
    if name == 'ding':
        a = bell(1318.5, 1.6, 0.7); b = bell(1760.0, 1.6, 0.7)
        y = np.zeros(int(1.8 * SR)); y[:len(a)] += 0.4 * a; o = int(0.085 * SR); y[o:o + len(b)] += 0.45 * b
        return y
    if name == 'type':
        d = 0.03; t = t_(d)
        return 0.3 * (rng.standard_normal(len(t)) + np.sin(2 * np.pi * rng.uniform(2200, 3000) * t)) * env(d, 0.0005, 0.004)
    raise ValueError(name)


def main():
    cues = json.load(open(os.path.join(HERE, 'cues.json')))
    D = cues['duration']; N = int((D + 0.2) * SR)

    # Sprecher
    src = load(VOICE, 1)[:, 0]
    voice = np.zeros(N)
    for s in cues['voice']:
        a, b = int(s['from'] * SR), int(s['to'] * SR)
        piece = src[a:b].copy(); f = int(0.012 * SR)
        piece[:f] *= np.linspace(0, 1, f); piece[-f:] *= np.linspace(1, 0, f)
        o = int(s['at'] * SR); piece = piece[:N - o]
        voice[o:o + len(piece)] += piece
    act = np.abs(voice) > 0.02
    vr = np.sqrt(np.mean(voice[act] ** 2))
    voice *= db(-18) / vr                                   # Sprache aktiv bei ca. -18 dBFS RMS

    # Musik: sanft ausgleichen, unter der Stimme absenken, Ende auf die Videolänge
    mus = load(MUSIC, 2)
    if len(mus) < N: mus = np.vstack([mus, np.zeros((N - len(mus), 2))])
    mus = mus[:N]
    mono = mus.mean(axis=1)
    lvl = np.sqrt(np.convolve(mono ** 2, np.ones(SR) / SR, 'same')) + 1e-6
    ref = np.sqrt(np.mean(mono ** 2))
    corr = np.clip((ref / lvl) ** 0.45, 0.6, 2.2)
    corr = np.convolve(corr, np.ones(SR // 4) / (SR // 4), 'same')
    mus *= corr[:, None]
    mr = np.sqrt(np.mean(mus.mean(axis=1) ** 2))
    mus *= db(-25.5) / mr                                   # Musik ohne Stimme ca. -25 dBFS
    venv = smooth(np.abs(voice), 0.015, 0.35)
    duck = 1 - 0.5 * np.clip(venv / 0.06, 0, 1)             # bis ca. -6 dB unter der Stimme
    mus *= duck[:, None]
    fo = int(0.25 * SR); mus[:fo] *= np.linspace(0, 1, fo)[:, None]

    # Geräusche
    sfx = np.zeros((N, 2)); cache = {}
    for c in cues['sfx']:
        nm = c['name']
        if nm not in cache: cache[nm] = make_sfx(nm)
        y = cache[nm] * c['gain'] * 0.42
        o = int(c['t'] * SR)
        if o >= N: continue
        y = y[:N - o]
        pan = rng.uniform(-0.25, 0.25)
        sfx[o:o + len(y), 0] += y * (1 - pan); sfx[o:o + len(y), 1] += y * (1 + pan)

    mix = mus + sfx + voice[:, None]
    pk = np.max(np.abs(mix))
    if pk > 0.95: mix *= 0.95 / pk
    out = os.path.join(HERE, 'mix_raw.f32')
    mix.astype(np.float32).tofile(out)
    # Lautheit für Web/Social: -16 LUFS, True Peak -1.5 dB (zwei Durchgänge)
    inp = ['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', out]
    m = subprocess.run([FF, '-hide_banner', *inp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    af = ('loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:'
          'measured_thresh={input_thresh}:offset={target_offset}:linear=true').format(**js)
    subprocess.run([FF, '-loglevel', 'error', '-y', *inp, '-af', af, '-ar', str(SR), os.path.join(HERE, 'mix.wav')], check=True)
    print('mix.wav', D, 's; gemessen', js['input_i'], 'LUFS')


if __name__ == '__main__':
    main()
