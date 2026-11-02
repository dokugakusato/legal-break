# 海事代理士版のアイコン（kaiji/icons/）とリンク画像（kaiji/ogp.png）を作る。自前の図形だけで描く（他社のロゴや団体の紋章は使わない）
#   python3 tools/make_kaiji_images.py
import math, pathlib
from PIL import Image, ImageDraw, ImageFont
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'kaiji'
(OUT / 'icons').mkdir(parents=True, exist_ok=True)
SANS = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'
NAVY, GOLD, SEA, RED, BONE = (6, 18, 28), (232, 192, 106), (56, 182, 200), (184, 48, 42), (242, 234, 216)

def font(path, size, idx=0):
    # ttc の中の日本語（JP）の書体を選ぶ
    for i in range(10):
        try:
            f = ImageFont.truetype(path, size, index=i)
            if 'JP' in f.getname()[0]:
                return f
        except OSError:
            break
    return ImageFont.truetype(path, size, index=idx)

def compass(d, cx, cy, r, col, w):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=w)
    d.ellipse([cx - r * .82, cy - r * .82, cx + r * .82, cy + r * .82], outline=col, width=max(1, w // 2))
    for k in range(16):
        a = k * math.pi / 8
        l = r * (.22 if k % 2 else .3)
        x1, y1 = cx + math.cos(a) * r * .82, cy + math.sin(a) * r * .82
        x2, y2 = cx + math.cos(a) * (r * .82 - l * .5), cy + math.sin(a) * (r * .82 - l * .5)
        d.line([x1, y1, x2, y2], fill=col, width=max(1, w // 2))
    # 羅針盤の針（4方向）
    for k in range(4):
        a = k * math.pi / 2 - math.pi / 2
        tip = (cx + math.cos(a) * r * 1.18, cy + math.sin(a) * r * 1.18)
        s1 = (cx + math.cos(a + math.pi / 2) * r * .1, cy + math.sin(a + math.pi / 2) * r * .1)
        s2 = (cx + math.cos(a - math.pi / 2) * r * .1, cy + math.sin(a - math.pi / 2) * r * .1)
        b = (cx + math.cos(a) * r * .9, cy + math.sin(a) * r * .9)
        d.polygon([tip, s1, b], fill=col)
        d.polygon([tip, s2, b], fill=tuple(int(c * .7) for c in col))

def icon(size, maskable=False):
    im = Image.new('RGB', (size, size), NAVY)
    d = ImageDraw.Draw(im)
    # 下半分に海の波
    for i in range(6):
        y = size * (.72 + i * .05)
        d.arc([-size * .2, y - size * .06, size * .5, y + size * .06], 200, 340, fill=SEA, width=max(1, size // 120))
        d.arc([size * .45, y - size * .06, size * 1.2, y + size * .06], 200, 340, fill=SEA, width=max(1, size // 120))
    sc = .78 if maskable else 1
    cx = cy = size / 2
    compass(d, cx, cy * .96, size * .36 * sc, GOLD, max(2, size // 64))
    f = font(SERIF, int(size * .4 * sc))
    d.text((cx, cy * .96), '海', font=f, fill=BONE, anchor='mm', stroke_width=max(1, size // 90), stroke_fill=RED)
    return im

for s in (180, 192, 512):
    icon(s).save(OUT / 'icons' / f'icon-{s}.png')
icon(512, True).save(OUT / 'icons' / 'maskable-512.png')

# リンク画像（1200×630）：夕暮れの海、灯台、題名
W, H = 1200, 630
im = Image.new('RGB', (W, H))
d = ImageDraw.Draw(im)
top, mid, low = (6, 18, 38), (122, 58, 82), (240, 138, 75)
hz = int(H * .6)
for y in range(hz):
    t = y / hz
    c = tuple(int(top[i] + (mid[i] - top[i]) * min(1, t / .75)) if t < .75 else int(mid[i] + (low[i] - mid[i]) * (t - .75) / .25) for i in range(3))
    d.line([0, y, W, y], fill=c)
for y in range(hz, H):
    t = (y - hz) / (H - hz)
    d.line([0, y, W, y], fill=(int(42 - 38 * t), int(58 - 48 * t), int(102 - 78 * t)))
d.pieslice([W * .82 - 80, hz - 80, W * .82 + 80, hz + 80], 180, 360, fill=(255, 210, 122))
for i in range(18):
    w = 30 + i * 22
    d.line([W * .82 - w / 2, hz + 6 + i * i * .9, W * .82 + w / 2, hz + 6 + i * i * .9], fill=(255, 200, 120), width=2)
# 灯台の岬
d.polygon([(0, H), (0, hz - 30), (180, hz - 40), (330, H)], fill=(10, 7, 16))
lx = 150
d.polygon([(lx - 22, hz - 36), (lx - 13, hz - 250), (lx + 13, hz - 250), (lx + 22, hz - 36)], fill=(216, 210, 196))
d.rectangle([lx - 18, hz - 170, lx + 18, hz - 148], fill=RED)
d.rectangle([lx - 16, hz - 228, lx + 16, hz - 212], fill=RED)
d.rectangle([lx - 20, hz - 278, lx + 20, hz - 250], fill=(26, 20, 32))
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).polygon([(lx, hz - 264), (W * .5, hz - 330), (W * .5, hz - 210)], fill=(255, 240, 180, 60)); im.paste(Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')); d = ImageDraw.Draw(im)
d.ellipse([lx - 8, hz - 272, lx + 8, hz - 256], fill=(255, 243, 192))
# 題名
cx = W * .64
d.text((cx, 120), '海事代理士独学応援', font=font(SANS, 34), fill=(191, 238, 246), anchor='mm')
d.text((cx, 230), 'KAIJI HUNTER', font=font(SANS, 112), fill=(246, 227, 176), anchor='mm', stroke_width=5, stroke_fill=(106, 58, 16))
d.text((cx, 340), '― 海事の拳 ―', font=font(SERIF, 52), fill=GOLD, anchor='mm', stroke_width=4, stroke_fill=(40, 16, 30))
d.text((cx, 560), '過去問の論点だけで学ぶ、海事代理士試験の独学ゲーム', font=font(SANS, 30), fill=BONE, anchor='mm', stroke_width=4, stroke_fill=NAVY)
im.save(OUT / 'ogp.png', optimize=True)
print('アイコンとリンク画像を作った')
