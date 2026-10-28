"""録画・ゲーム音・ナレーションを合わせて、宣伝動画を書き出す"""
import json,subprocess,wave,numpy as np
D='/tmp/claude-0/promo';R='/home/claude/legal-break/'
marks=dict((n,t) for n,t in json.load(open(f'{D}/marks.json')))
lines=json.load(open(f'{D}/lines.json'))
out=subprocess.run(['ffmpeg','-i',f'{D}/raw.webm','-vf','scale=54:96,format=gray','-f','rawvideo','-'],capture_output=True).stdout
m=np.frombuffer(out,np.uint8).reshape(-1,96*54).mean(1)
runs=[];cur=None
for i,v in enumerate(m):
    b=v>240
    if b and cur is None:cur=i
    if not b and cur is not None:runs.append((cur/25,(i-cur)/25));cur=None
fl=[r for r in runs if r[0]>2][0][0]
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{D}/audio.webm','-ac','1','-ar','16000',f'{D}/audio.wav'],check=True)
w=wave.open(f'{D}/audio.wav');al=w.getnframes()/16000
S=0.6;dur=round(al-S-0.15,2)
cuts={k:round(v-S,3) for k,v in marks.items()};cuts['end']=dur
json.dump(cuts,open(f'{D}/cuts.json','w'))
subprocess.run(['python3',f'{D}/music.py'],check=True)
cmd=['ffmpeg','-y','-loglevel','error','-ss',str(fl+S),'-i',f'{D}/raw.webm','-ss',str(S),'-i',f'{D}/audio.webm']
order=['l1','l2','l3','l4','l5','shout','l6'];fl_parts=['[1:a]volume=0.5,aresample=48000[g]'];mixin=['[g]']
for j,k in enumerate(order):
    if k not in marks:continue
    cmd+=['-i',R+lines[k]]
for j,k in enumerate([k for k in order if k in marks]):
    ms=max(0,int((marks[k]-S+0.15)*1000));vol=1.5 if k!='shout' else 1.7
    fl_parts.append(f'[{j+2}:a]aresample=48000,volume={vol},adelay={ms}|{ms}[n{j}]');mixin.append(f'[n{j}]')
cmd+=['-i',f'{D}/music.wav'];nm=len([k for k in order if k in marks])+2
fl_parts.append(f'[{nm}:a]aresample=48000,volume=0.42[mu]');mixin.append('[mu]')
fl_parts.append(''.join(mixin)+f'amix=inputs={len(mixin)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st={dur-0.6}:d=0.6[a]')
cmd+=['-t',str(dur),'-filter_complex',';'.join(fl_parts),'-map','0:v','-map','[a]','-vf','fps=30,scale=1080:1920:flags=lanczos,format=yuv420p',
 '-c:v','libx264','-preset','veryfast','-crf','19','-c:a','aac','-b:a','160k','-movflags','+faststart',f'{D}/LEGAL_BREAK_promo.mp4']
subprocess.run(cmd,check=True);print('flash',fl,'dur',dur,'marks',marks)
