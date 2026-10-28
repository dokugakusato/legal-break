"""宣伝動画用のオリジナル曲：80年代アニメ風の熱いハードロック（ホ短調・152BPM）
区切りは動画の場面（ナレーションの開始時刻）に合わせる"""
import numpy as np, json, wave, sys

SR = 44100
D = '/tmp/claude-0/promo'
cut = json.load(open(f'{D}/cuts.json'))   # 出力動画での各場面の開始秒
LEN = cut['end']
out = np.zeros((int(SR * (LEN + 2)), 2), np.float32)
rng = np.random.default_rng(7)
BPM = 152; BEAT = 60 / BPM; E8 = BEAT / 2

def note(n):  # MIDI → Hz
    return 440 * 2 ** ((n - 69) / 12)

def put(sig, t, pan=0.0, vol=1.0):
    i = int(t * SR)
    if i >= len(out): return
    sig = sig[: len(out) - i] * vol
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    out[i:i + len(sig), 0] += sig * l * 1.414
    out[i:i + len(sig), 1] += sig * r * 1.414

def env(n, a=0.005, d=0.1, s=0.6, r=0.1, hold=None):
    tot = n; e = np.ones(tot)
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, max(na, 1))[:len(e[:na])]
    e[na:na + nd] = np.linspace(1, s, max(nd, 1))[:len(e[na:na + nd])]
    e[na + nd:] = s
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def saw(f, dur, det=(0,)):
    t = np.arange(int(dur * SR)) / SR
    return sum(2 * ((t * f * 2 ** (c / 1200)) % 1) - 1 for c in det) / len(det)

def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR); y = np.zeros_like(x); p = 0.0
    for i in range(len(x)):
        p = (1 - a) * x[i] + a * p; y[i] = p
    return y

def lp_fast(x, cut):  # 2段の簡易ローパス（ベクトル化）
    from scipy.signal import lfilter
    a = np.exp(-2 * np.pi * cut / SR)
    y = lfilter([1 - a], [1, -a], x); return lfilter([1 - a], [1, -a], y)

# ---- 楽器 ----
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.1

def snare():
    n = int(0.25 * SR); t = np.arange(n) / SR
    nz = lp_fast(rng.uniform(-1, 1, n), 6000) * np.exp(-t * 16)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    return (nz * 0.9 + tone * 0.5) * 0.9

def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
    x = rng.uniform(-1, 1, n); x = x - lp_fast(x, 7000)
    return x * np.exp(-t * (12 if open_ else 70)) * 0.35

def crash():
    n = int(1.8 * SR); t = np.arange(n) / SR
    x = rng.uniform(-1, 1, n); x = x - lp_fast(x, 4000)
    return x * np.exp(-t * 2.2) * 0.45

def tom(f=90):
    n = int(0.5 * SR); t = np.arange(n) / SR
    fr = f * (1 + 0.5 * np.exp(-t * 20))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 6) * 0.9

def guitar(root, dur, mute=False):  # パワーコード（ルート・5度・オクターブ）をひずませる
    x = saw(note(root), dur, (-9, 9)) + saw(note(root + 7), dur, (-7, 7)) * 0.8 + saw(note(root + 12), dur, (5,)) * 0.5
    x = np.tanh(x * 5)
    x = lp_fast(x, 1400 if mute else 3200)
    n = len(x); e = env(n, 0.003, 0.08 if mute else 0.2, 0.25 if mute else 0.75, 0.03)
    return x * e * 0.32

def bass(root, dur):
    x = saw(note(root - 12), dur, (0,)); x = np.tanh(x * 2.5); x = lp_fast(x, 700)
    return x * env(len(x), 0.003, 0.06, 0.7, 0.02) * 0.55

def brass(n_, dur):
    x = saw(note(n_), dur, (-8, 0, 8)) + saw(note(n_ - 12), dur, (0,)) * 0.5
    t = np.arange(len(x)) / SR
    cut = 900 + 2600 * np.minimum(t / 0.06, 1)
    x = np.tanh(lp_fast(x, 2600) * 2) * (1 + 0.04 * np.sin(2 * np.pi * 5.5 * t))
    return x * env(len(x), 0.02, 0.15, 0.7, 0.08) * 0.28

def timpani(f=55):
    n = int(1.4 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 3) * 0.9

# ---- 曲の組み立て ----
E, C, D_, G, A, B = 40, 36, 38, 43, 45, 47   # パワーコードのルート（E2基準）
PROG = [E, E, C, D_]                          # i - i - VI - VII（1小節ずつ）
BAR = BEAT * 4

def drums_bar(t, fill=False, half=False):
    for b in range(4):
        put(kick(), t + b * BEAT, vol=0.9) if (b in (0, 2) or (not half)) and b != 1 and b != 3 else None
        if b in (1, 3) and not half: put(snare(), t + b * BEAT, 0.05)
        if half and b == 2: put(snare(), t + b * BEAT, 0.05)
    if not half: put(kick(), t + 2.5 * BEAT, vol=0.7)
    for k in range(8): put(hat(open_=(k == 7)), t + k * E8, 0.35)
    if fill:
        for k, f in enumerate([120, 100, 85, 70]): put(tom(f), t + 3 * BEAT + k * E8 / 2, -0.3 + k * 0.2, 0.8)

def riff_bar(t, root, chug=True):
    if chug:
        pat = [1, 1, 0, 1, 1, 0, 1, 1]   # 刻み（8分）
        for k, on in enumerate(pat):
            if on: put(guitar(root, E8 * 0.95, mute=True), t + k * E8, -0.5); put(guitar(root, E8 * 0.95, mute=True), t + k * E8 + 0.012, 0.5)
    else:
        put(guitar(root, BAR * 0.98), t, -0.5); put(guitar(root, BAR * 0.98), t + 0.012, 0.5)
    for k in range(8): put(bass(root, E8 * 0.9), t + k * E8, 0)

MEL = [  # オリジナルの旋律（MIDI, 8分の数）
    [(71, 2), (71, 1), (74, 1), (76, 4)],
    [(74, 2), (71, 2), (69, 2), (67, 2)],
    [(69, 2), (71, 1), (74, 1), (78, 4)],
    [(76, 6), (None, 2)],
]

def mel_bar(t, bar):
    x = t
    for n_, l in bar:
        if n_: put(brass(n_, l * E8 * 0.95), x, 0.15, 1.0)
        x += l * E8

def section(t0, t1, kind):
    t = t0; i = 0
    while t + BAR * 0.5 < t1:
        root = PROG[i % 4]; last = t + BAR >= t1 - 0.01
        if kind == 'verse':
            drums_bar(t, fill=last); riff_bar(t, root, chug=True)
        elif kind == 'build':
            drums_bar(t, fill=last); riff_bar(t, root, chug=(i % 2 == 0))
            put(brass(root + 24, BEAT * 0.6), t, 0.2, 0.8)   # 小節頭の吹奏
        elif kind == 'chorus':
            drums_bar(t, fill=last); riff_bar(t, root, chug=False); mel_bar(t, MEL[i % 4])
            if i % 4 == 0: put(crash(), t, -0.2)
        t += BAR; i += 1
    return t

# 1. 導入：重い一撃を3回（ドン…ドン…ドン）
for k, tt in enumerate([0.0, 1.6, 3.2]):
    put(timpani(41.2), tt, 0, 1.0); put(guitar(E, 1.3), tt, -0.4); put(guitar(E, 1.3), tt + 0.01, 0.4); put(crash(), tt, 0, 0.6)
    put(kick(), tt, vol=1.2)
# 2. 場面に合わせて
t = section(cut['l2'] - 0.2, cut['l4'], 'verse')
t = section(cut['l4'], cut['l5'], 'build')
t = section(cut['l5'], cut['shout'] - 0.05, 'chorus')
# 3. 奥義：音を止めて、筆文字の一撃
hit = cut['shout'] + 1.55
put(timpani(41.2), hit, 0, 1.3); put(crash(), hit, 0, 1.0); put(kick(), hit, vol=1.4)
put(guitar(E, 2.4), hit, -0.4); put(guitar(E, 2.4), hit + 0.01, 0.4)
# 4. 締め：堂々としたファンファーレ
te = cut['l6'] - 0.1
for k, (root, mel) in enumerate([(C, 72), (D_, 74), (E, 76), (E, 79)]):
    tt = te + k * BAR
    if tt > LEN - 1: break
    put(guitar(root, BAR * 0.98), tt, -0.5); put(guitar(root, BAR * 0.98), tt + 0.012, 0.5)
    put(brass(mel, BAR * 0.9), tt, 0.1); put(brass(mel - 5, BAR * 0.9), tt, -0.1, 0.7)
    put(kick(), tt); put(crash(), tt, 0, 0.7)
    for b in range(1, 4): put(kick(), tt + b * BEAT, vol=0.6); put(snare(), tt + b * BEAT + E8, 0, 0.4)

# 仕上げ：音量をそろえて書き出す
out /= max(1e-6, np.abs(out).max()) / 0.89
fade = int(0.8 * SR); end = int(LEN * SR)
out[end - fade:end] *= np.linspace(1, 0, fade)[:, None]; out = out[:end]
pcm = (out * 32767).astype(np.int16)
w = wave.open(f'{D}/music.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('music', LEN, 's')
