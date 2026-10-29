# 宅建版（takken/index.html）を、行政書士版のゲーム本体（index.html）から作る。
# 行政書士版の本体を直したら、これを動かせば宅建版にも同じ直しが入る：  python3 tools/make_takken.py
# 宅建版だけの部分（街の背景・登場人物・曲など）は takken/extra.js に書く。
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'index.html').read_text(encoding='utf-8')
h = src

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if count is not None and n != count:
        raise SystemExit(f'置き換え先が {n} 個見つかった（{count} 個のはず）：{old[:60]}')
    h = h.replace(old, new)

# 1) 旧住所（GitHub）からの引っ越し用のしくみは、宅建版には要らない
h, n = re.subn(r'<script>/\* 旧住所（GitHub）から新住所へ.*?</script>', '', h, count=1, flags=re.S)
assert n == 1, '引っ越し用のしくみが見つからない'

# 2) 名前・説明
rep('<title>LEGAL BREAK 法の拳</title>', '<title>TAKKEN HUNTER 不動産の拳</title>')
rep('content="法の拳"', 'content="宅建の拳"')
DESC = '街の不動産トラブルを「不動産の拳」で裁きながら、宅建士試験を独学で学ぶゲーム。毎日1話更新。'
rep('content="荒野の事件を「法の拳」で裁きながら、行政書士試験を独学で学ぶゲーム。毎日1話更新。"', f'content="{DESC}"', 2)
rep('content="LEGAL BREAK ―法の拳―｜行政書士独学応援ゲーム"', 'content="TAKKEN HUNTER ―不動産の拳―｜宅建士独学応援ゲーム"')
rep('content="https://legal-break.5ukaku.com/"', 'content="https://legal-break.5ukaku.com/takken/"')
LOGO_OLD = '<span class="pre">行政書士独学応援</span>LEGAL BREAK<small>―法の拳―</small>'
LOGO_NEW = '<span class="pre">宅建士独学応援</span>TAKKEN HUNTER<small>―不動産の拳―</small>'
rep(LOGO_OLD, LOGO_NEW, 3)
rep('独学で戦うお前に、<br>法の拳を教えてやる。', '独学で戦うお前に、<br>不動産の拳を教えてやる。')
rep('毎日1話ずつ更新中。1話は事件3つと章ボス。事件を法の拳で裁け。', '毎日1話ずつ更新中。1話は事件3つと章ボス。街の事件を不動産の拳で裁け。')
rep('「LEGAL BREAK 法の拳 にログイン」', '「TAKKEN HUNTER にログイン」')
rep("『LEGAL BREAK 法の拳』で行政書士試験を修行中", "『TAKKEN HUNTER 不動産の拳』で宅建士試験を修行中")
rep("const SITE='https://legal-break.5ukaku.com/',TAGS=' #行政書士 #行政書士試験 #独学';",
    "const SITE='https://legal-break.5ukaku.com/takken/',TAGS=' #宅建 #宅建士 #宅建試験 #独学';")
rep("const SHARE_BASE='荒野の事件を「法の拳」で裁きながら行政書士試験を学ぶゲーム『LEGAL BREAK 法の拳』で修行中！毎日1話更新';",
    "const SHARE_BASE='街の不動産トラブルを「不動産の拳」で裁きながら宅建士試験を学ぶゲーム『TAKKEN HUNTER 不動産の拳』で修行中！毎日1話更新';")
rep('ホーム画面の「法の拳」のアイコンから', 'ホーム画面の「宅建の拳」のアイコンから')

# 3) ファイルの場所（共通のものは1つ上のフォルダにある）
# アイコンとリンク画像は宅建版専用（takken/icons・takken/ogp.png）
rep('<meta name="theme-color" content="#120c0a">', '<meta name="theme-color" content="#0a0f1f">')
rep('content="https://legal-break.5ukaku.com/icons/ogp.png"', 'content="https://legal-break.5ukaku.com/takken/ogp.png?v=2"', 2)
rep('href="privacy.html"', 'href="../privacy.html"', None)
rep('<script src="config.js"></script>', '<script src="../config.js"></script>')
rep('href="faces/${key}.png"', 'href="../faces/${key}.png"')
rep("navigator.serviceWorker.register('sw.js',", "navigator.serviceWorker.register('../sw.js',")

# 4) 記録は行政書士版と別の場所に保存する（ログインは共通）
rep("const SAVE_KEY='legalbreak.v2';", "const SAVE_KEY='takken.v1';")
rep("collection('progress')", "collection('tk_progress')", 3)
rep("collection('ranking')", "collection('tk_ranking')", 4)
# 登録を消すときは、両方のゲームの記録を消す（ログインが共通なので）
rep("Promise.all([ACC.db.collection('tk_progress').doc(u.uid).delete(),ACC.db.collection('tk_ranking').doc(u.uid).delete(),ACC.db.collection('tk_progress').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('tk_ranking').doc(u.uid).delete().catch(()=>{})])",
    "Promise.all([ACC.db.collection('tk_progress').doc(u.uid).delete(),ACC.db.collection('tk_ranking').doc(u.uid).delete(),ACC.db.collection('progress').doc(u.uid).delete().catch(()=>{}),ACC.db.collection('ranking').doc(u.uid).delete().catch(()=>{})])")
rep('ログインは宅建版（TAKKEN HUNTER）と共通なので、そちらのネットの記録も消える。', 'ログインは行政書士版（LEGAL BREAK）と共通なので、そちらのネットの記録も消える。')

# 5) 宅建版だけの部分を読み込む（街の背景・登場人物・曲）
rep('<script src="episodes/list.js"></script>', '<script src="episodes/list.js"></script>\n<script>window.TK=1</script>')
h = h.replace('</body></html>', '<script src="extra.js"></script>\n</body></html>', 1)
assert h.count('src="extra.js"') == 1

# 6) 読み方（宅建・黒鍵）。声の自動録音（tools/gen_voice.mjs）にも同じ直しが入っている
rep("const yomi=t=>t.replace(", "const yomi=t=>t.replace(/宅建/g,'たっけん').replace(/黒鍵/g,'くろかぎ').replace(")

# 7) もう一方のゲームへ行くボタン（同じアプリ・同じログインのまま行き来できる）

head = '<!-- このファイルは tools/make_takken.py が行政書士版の index.html から作る。直接は直さず、宅建版だけの部分は extra.js に書く -->\n'
(ROOT / 'takken' / 'index.html').write_text(head + h, encoding='utf-8')
print('takken/index.html を作った', len(h), '文字')
