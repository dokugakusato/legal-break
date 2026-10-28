"""LEGAL BREAK 宣伝用ショート動画（縦1080x1920）を、ゲームを自動で動かして録画する"""
import base64, json, time, subprocess, os
from playwright.sync_api import sync_playwright

OUT = '/tmp/claude-0/promo'
URL = 'http://localhost:8766/index.html'

TAP = r"""
(()=>{const orig=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(t,...a){const r=orig.call(this,t,...a);
  try{if(window.__tap&&t instanceof AudioDestinationNode&&t.context===window.__tapCtx)orig.call(this,window.__tap)}catch(e){}return r};
})();
"""

PROMO_CSS = """
#promoCap{position:fixed;left:0;right:0;top:0;z-index:200;padding:calc(18px + env(safe-area-inset-top,0px)) 14px 16px;
 background:linear-gradient(180deg,rgba(0,0,0,.92),rgba(0,0,0,.75) 70%,rgba(0,0,0,0));text-align:center;pointer-events:none;
 font-family:"Noto Sans CJK JP","Hiragino Sans",sans-serif;font-weight:900;color:#fff;font-size:27px;line-height:1.35;
 text-shadow:0 3px 0 #c22d22,0 0 18px rgba(0,0,0,.9);transition:opacity .25s}
#promoCap small{display:block;font-size:16px;color:#d9a441;text-shadow:0 2px 0 #000;letter-spacing:.1em;margin-bottom:4px}
#promoCap.hide{opacity:0}
#promoCap.bottom{top:auto;bottom:0;padding:16px 14px calc(150px + env(safe-area-inset-bottom,0px));background:linear-gradient(0deg,rgba(0,0,0,.95),rgba(0,0,0,.8) 70%,rgba(0,0,0,0))}
#flash{position:fixed;inset:0;background:#fff;z-index:999}
#endCard{position:fixed;inset:0;z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;
 background:radial-gradient(ellipse at 50% 40%,#5a1209,#120c0a 70%);font-family:"Noto Sans CJK JP",sans-serif;color:#efe3cf;padding:20px}
#endCard .pre{background:#c22d22;border:2px solid #efe3cf;font-weight:900;font-size:16px;letter-spacing:.4em;padding:3px 6px 3px 14px}
#endCard .t{font-weight:900;font-size:62px;line-height:.95;text-shadow:4px 4px 0 #c22d22,8px 8px 0 #000;transform:skewY(-4deg)}
#endCard .s{font-weight:900;font-size:30px;color:#d9a441;text-shadow:3px 3px 0 #000}
#endCard .big{font-weight:900;font-size:30px;line-height:1.4;background:#000;border-left:8px solid #c22d22;padding:10px 16px}
#endCard .free{font-weight:900;font-size:22px;color:#fff}
#endCard .url{font-size:15px;color:#d9a441;font-weight:700;letter-spacing:.02em}
#endCard .hero{width:110px}
"""

def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = b.new_context(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1,
                            record_video_dir=OUT, record_video_size={'width': 1080, 'height': 1920},
                            reduced_motion='no-preference')
        ctx.add_init_script(TAP)
        ctx.add_init_script("document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.zoom='2.5'})")
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(1500)
        W = lambda ms: pg.wait_for_timeout(ms)
        J = lambda code: pg.evaluate(code)
        # 録音の準備（ゲームの音を全部ひろう）
        J("""(()=>{S.mute=false;S.noVoice=false;const a=ac();window.__tapCtx=a;window.__tap=a.createMediaStreamDestination();
          window.__chunks=[];const r=new MediaRecorder(window.__tap.stream,{mimeType:'audio/webm;codecs=opus'});r.ondataavailable=e=>e.data.size&&window.__chunks.push(e.data);
          window.__rec=r;r.start(250);
          const st=document.createElement('style');st.textContent=%s;document.head.appendChild(st);
          const cap=document.createElement('div');cap.id='promoCap';cap.className='hide';document.body.appendChild(cap);
          window.cap=(t,sm,pos)=>{cap.innerHTML=(sm?`<small>${sm}</small>`:'')+t;cap.classList.toggle('bottom',pos==='bottom');cap.classList.remove('hide')};window.capHide=()=>cap.classList.add('hide');
          // ゲームのセリフは流さない（あとで渋い声のナレーションを重ねる）。奥義の叫びの時刻だけ記録
          window.__t0=performance.now();window.__marks=[];window.mark=n=>window.__marks.push([n,(performance.now()-window.__t0)/1000]);
          window.say=say=function(list,done){for(const x of list)if(String(x[0]).includes('取消権'))mark('shout');done&&setTimeout(done,10)};
          return a.state})()""" % json.dumps(PROMO_CSS))
        # 同期合図（白いフラッシュ＋ピッ）
        J("""(()=>{const f=document.createElement('div');f.id='flash';document.body.appendChild(f);
          const a=window.__tapCtx,o=a.createOscillator(),g=a.createGain();o.frequency.value=1000;g.gain.value=.6;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.12);
          setTimeout(()=>f.remove(),400)})()""")
        W(900)
        # 1. タイトル
        J("BGM.play('title')")
        J("cap('行政書士試験の独学を、<br>ゲームにした。','LEGAL BREAK ―法の拳―','bottom');mark('l1')")
        W(3900)
        # 2. 4コマ（坂東のたくらみ → 田中の叫び）
        J("capHide()")
        J("playEp(1).then(()=>setTimeout(()=>{if(!document.querySelector('#op').hidden)opEnd()},50))")
        W(700)
        J("cap('荒野の事件を、<br>法律の知識で裁く');mark('l2')")
        J("$('#komaBtn').click()")  # 2コマ目へ（坂東）
        W(4100)
        J("$('#komaBtn').click()"); W(300); J("$('#komaBtn').click()")  # 4コマ目（田中の叫び）
        J("cap('土地は、誰のものか？');mark('l3')")
        W(5900)
        # 3. バトル：正解して殴る
        J("capHide()")
        J("while(!document.querySelector('#s-battle').offsetParent){$('#komaBtn').click()}")
        W(400)
        J("cap('正しい答えを選べば、<br>拳が決まる！');mark('l4')")
        W(2600)
        J("document.querySelector(`#qcard .opt[data-i=\"${EP.q.ans}\"]`).click()")
        W(2700)
        J("capHide()")
        W(1500)  # 決めゼリフの画面
        J("const ov=$('#ov');ov.hidden=true;ov.innerHTML='';closeSheet()")
        # 4. 章ボス：記述のキーワードを撃つ
        J("S.part=3;S.life=2;EP=CH.parts[3];EP.chapter=['第1話 意思表示編｜章ボス戦',EP.title];bossBattle()")
        W(500)
        J("cap('ボスは記述式。<br>キーワードを撃ち抜け！');mark('l5')")
        W(1900)
        keys = J("EP.keys.map((k,i)=>k.ok?i:-1).filter(i=>i>=0)")
        for i in keys:
            J(f"document.querySelector('.key[data-i=\"{i}\"]').click()")
            W(950)
        J("capHide()")
        W(5200)   # 暗転→筆文字「詐害行為取消権！」→ドカーン
        # 5. 締め
        J("""(()=>{const h=SIL.hero;const e=document.createElement('div');e.id='endCard';e.innerHTML=`<div class="pre">行政書士独学応援</div><div class="t">LEGAL<br>BREAK</div><div class="s">―法の拳―</div><div class="hero">${h}</div><div class="big">毎日1話、更新中</div><div class="free">無料・登録なしで遊べる</div><div class="url">プロフィールのリンクから</div>`;document.body.appendChild(e);fanfare();mark('l6')})()""")
        W(8200)
        # 録音を止めて取り出す
        audio_b64 = pg.evaluate("""new Promise(res=>{const r=window.__rec;r.onstop=()=>{const b=new Blob(window.__chunks,{type:'audio/webm'});const fr=new FileReader();fr.onload=()=>res(fr.result.split(',')[1]);fr.readAsDataURL(b)};r.stop()})""")
        open(f'{OUT}/audio.webm', 'wb').write(base64.b64decode(audio_b64))
        json.dump(pg.evaluate("window.__marks"), open(f'{OUT}/marks.json','w'))
        vpath = pg.video.path()
        pg.close(); ctx.close(); b.close()
        os.replace(vpath, f'{OUT}/raw.webm')
        print('errors:', errs)

if __name__ == '__main__':
    main()
