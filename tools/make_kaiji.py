# 海事代理士版（kaiji/index.html と kaiji/kijutsu.js）を、行政書士版のゲーム本体（index.html・kijutsu.js）から作る。
# 行政書士版の本体を直したら、これを動かせば海事代理士版にも同じ直しが入る：  python3 tools/make_kaiji.py
# 海事代理士版だけの部分（海の背景・登場人物・曲など）は kaiji/extra.js に書く。
# 話は「1話＝1論点」の形（kijutsu:1）で作るので、記述の章のエンジン kijutsu.js も海事代理士版用の言葉に置きかえて kaiji/ に作る。
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
h = (ROOT / 'index.html').read_text(encoding='utf-8')
# 行政書士版だけのおまけ（BONUS STAGE・CM）は、外す
h = h.replace('\n<script src="bonus.js"></script>', '')
# 行政書士版だけの「おことわり」は、外す
h = re.sub(r'\n    <details class="okotowari"[\s\S]*?</details>', '', h, count=1)

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if count is not None and n != count:
        raise SystemExit(f'置き換え先が {n} 個見つかった（{count} 個のはず）：{old[:60]}')
    h = h.replace(old, new)

# 1) 旧住所（GitHub）からの引っ越し用のしくみは要らない
h, n = re.subn(r'<script>/\* 旧住所（GitHub）から新住所へ.*?</script>', '', h, count=1, flags=re.S)
assert n == 1, '引っ越し用のしくみが見つからない'

# 1b) オンライン対戦の入口は、行政書士版だけ
h, n = re.subn(r'\n\s*<button class="btn onlinebtn" id="onlineBtn"[^\n]*</button>', '', h, count=1)
assert n == 1, 'オンライン対戦の入口が見つからない'

# 2) 名前・説明
rep('<title>LEGAL BREAK 法の拳</title>', '<title>KAIJI HUNTER 海事の拳</title>')
rep('content="法の拳"', 'content="海事の拳"')
DESC = '海賊がのさばる海を「海事の拳」で裁きながら、海事代理士試験を独学で学ぶゲーム。過去問の論点だけで作っています。'
rep('content="荒野の事件を「法の拳」で裁きながら、行政書士試験を独学で学ぶゲーム。毎日1話更新。"', f'content="{DESC}"', 2)
rep('content="LEGAL BREAK ―法の拳―｜行政書士独学応援ゲーム"', 'content="KAIJI HUNTER ―海事の拳―｜海事代理士独学応援ゲーム"')
rep('content="https://legal-break.5ukaku.com/"', 'content="https://legal-break.5ukaku.com/kaiji/"')
LOGO_OLD = '<span class="pre">行政書士独学応援</span>LEGAL BREAK<small>―法の拳―</small>'
LOGO_NEW = '<span class="pre">海事代理士独学応援</span>KAIJI HUNTER<small>―海事の拳―</small>'
rep(LOGO_OLD, LOGO_NEW, 3)
rep('独学で戦うお前に、<br>法の拳を教えてやる。', '法なき海で、<br>海事の拳を叩き込め。')
rep('毎日1話ずつ更新中。1話は事件3つと章ボス。事件を法の拳で裁け。', '1話ずつ更新中。出題は海事代理士試験の過去問の論点だけ。海賊を海事の拳で裁け。')
rep('「LEGAL BREAK 法の拳 にログイン」', '「KAIJI HUNTER にログイン」')
rep("『LEGAL BREAK 法の拳』で行政書士試験を修行中", "『KAIJI HUNTER 海事の拳』で海事代理士試験を修行中")
rep("const SITE='https://legal-break.5ukaku.com/',TAGS=' #行政書士 #行政書士試験 #独学';",
    "const SITE='https://legal-break.5ukaku.com/kaiji/',TAGS=' #海事代理士 #海事代理士試験 #独学';")
rep("const SHARE_BASE='荒野の事件を「法の拳」で裁きながら行政書士試験を学ぶゲーム『LEGAL BREAK 法の拳』で修行中！毎日1話更新';",
    "const SHARE_BASE='海賊の海を「海事の拳」で裁きながら海事代理士試験を学ぶゲーム『KAIJI HUNTER 海事の拳』で修行中！';")
rep('ホーム画面の「法の拳」のアイコンから', 'ホーム画面の「海事の拳」のアイコンから')
# 次回予告のタイトルと声
rep('<small>次回　LEGAL BREAK</small>', '<small>次回　KAIJI HUNTER</small>')
rep("sayP('次回、リーガルブレイク。'+CH.nextTitle+'！','narr')", "sayP('次回、カイジハンター。'+CH.nextTitle+'！','narr')")

# 3) ファイルの場所（共通のものは1つ上のフォルダにある）。アイコンとリンク画像は海事代理士版専用
rep('<meta name="theme-color" content="#120c0a">', '<meta name="theme-color" content="#06121c">')
rep('content="https://legal-break.5ukaku.com/icons/ogp.png"', 'content="https://legal-break.5ukaku.com/kaiji/ogp.png?v=1"', 2)
rep('href="privacy.html"', 'href="../privacy.html"', None)
rep('<script src="config.js"></script>', '<script src="../config.js"></script>')
rep('href="faces/${key}.png"', 'href="../faces/${key}.png"')
rep("navigator.serviceWorker.register('sw.js',", "navigator.serviceWorker.register('../sw.js',")

# 4) 記録は行政書士版・宅建版と別の場所に保存する（ログインは共通）
#    kj は行政書士版の「記述の章」で使っている名前なので、海事代理士版は kd_ にする
rep("const SAVE_KEY='legalbreak.v2';", "const SAVE_KEY='kaiji.v1';")
rep("collection('progress')", "collection('kd_progress')", 3)
rep("collection('ranking')", "collection('kd_ranking')", 4)
# 登録を消すときは、3つのゲームの記録を全部消す（ログインが共通なので）
rep("Promise.all([ACC.db.collection('kd_progress').doc(u.uid).delete(),ACC.db.collection('kd_ranking').doc(u.uid).delete(),ACC.db.collection('tk_progress').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('tk_ranking').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('kd_progress').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('kd_ranking').doc(u.uid).delete().catch(()=>{})])",
    "Promise.all([ACC.db.collection('kd_progress').doc(u.uid).delete(),ACC.db.collection('kd_ranking').doc(u.uid).delete(),ACC.db.collection('progress').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('ranking').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('tk_progress').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('tk_ranking').doc(u.uid).delete().catch(()=>{})])")
rep('ログインは宅建版（TAKKEN HUNTER）・海事代理士版（KAIJI HUNTER）と共通なので、そちらのネットの記録も消える。', 'ログインは行政書士版（LEGAL BREAK）・宅建版（TAKKEN HUNTER）と共通なので、そちらのネットの記録も消える。')

# 5) 海事代理士版だけの部分を読み込む（海の背景・登場人物・曲）
rep('<script src="episodes/list.js"></script>', '<script src="episodes/list.js"></script>\n<script>window.KD=1</script>')
h = h.replace('</body></html>', '<script src="extra.js"></script>\n</body></html>', 1)
assert h.count('src="extra.js"') == 1
# 記述の章のエンジンは、海事代理士版用に作った kaiji/kijutsu.js を読む（同じフォルダなので書きかえ不要）
assert h.count('<script src="kijutsu.js"></script>') == 1

# 6) 読み方。声の自動録音（tools/gen_voice.mjs）にも同じ直しが入っている
rep("const yomi=t=>t.replace(", "const yomi=t=>t.replace(/汐見/g,'しおみ').replace(/鉄錨/g,'てついかり').replace(/凪/g,'なぎ').replace(/海事代理士/g,'かいじだいりし').replace(/書換/g,'かきかえ').replace(/毀損/g,'きそん').replace(/解撤/g,'かいてつ').replace(/喫水/g,'きっすい').replace(/端舟/g,'たんしゅう').replace(/臨検/g,'りんけん').replace(/信号符字/g,'しんごうふじ').replace(/存否/g,'そんぴ').replace(/改測/g,'かいそく').replace(/点附/g,'てんぷ').replace(/両舷/g,'りょうげん').replace(/黒霧/g,'くろぎり').replace(/大渦/g,'おおうず').replace(/櫓櫂/g,'ろかい').replace(")

head = '<!-- このファイルは tools/make_kaiji.py が行政書士版の index.html から作る。直接は直さず、海事代理士版だけの部分は extra.js に書く -->\n'
(ROOT / 'kaiji' / 'index.html').write_text(head + h, encoding='utf-8')
print('kaiji/index.html を作った', len(h), '文字')

# ---------- kijutsu.js（1話＝1論点のエンジン）を、海事代理士版の言葉にする ----------
k = (ROOT / 'kijutsu.js').read_text(encoding='utf-8')
def krep(old, new, count=1):
    global k
    n = k.count(old)
    if count is not None and n != count:
        raise SystemExit(f'kijutsu.js の置き換え先が {n} 個見つかった（{count} 個のはず）：{old[:60]}')
    k = k.replace(old, new)
# ボス戦は「記述」ではなく、本試験と同じ「条文の穴埋め」。ボスの問いの書き方は話データ（boss.tagline）で変えられる
krep("記述ボス戦`", "ボス戦`")
krep("'記述で倒す ▶'", "'条文で倒す ▶'")
krep('<span class="qtag">記述ボス戦 ― 40字前後で書いて倒せ</span>', '<span class="qtag">${CH.boss.tagline||\'ボス戦 ― 条文を組み立てて倒せ\'}</span>')
krep('placeholder="ここに答案を書く（40字前後）"', 'placeholder="ここに答えを書く"')
krep('記述 ${r.total}／${r.max}点 ― 撃破！', '${r.total}／${r.max}点 ― 撃破！')
krep('記述 ${r.total}／${r.max}点 ― まだ倒れない', '${r.total}／${r.max}点 ― まだ倒れない')
krep('<span class="qtag">記述の得点</span>', '<span class="qtag">ボス戦の得点</span>')
krep('<span class="qtag">正答例</span>', '<span class="qtag">正しい条文</span>')
k = '/* このファイルは tools/make_kaiji.py が行政書士版の kijutsu.js から作る。直接は直さない */\n' + k
(ROOT / 'kaiji' / 'kijutsu.js').write_text(k, encoding='utf-8')
print('kaiji/kijutsu.js を作った', len(k), '文字')
