// 試作の声：VOICEVOX で arena/voices.json のセリフを mp3 にして arena/audio/ に入れる（本番の online/ の仕組みと同じやり方）
// GitHub Actions（.github/workflows/arena-voice.yml）から動かす。本番の声にはさわらない
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ROOT = new URL('./', import.meta.url).pathname, ENGINE = process.env.VOICEVOX_URL || 'http://127.0.0.1:50021';
const { CAST } = require('../tools/battle-test/arena-chars.js');
const yomi = t => t.replace(/荒野/g, 'こうや').replace(/土倉/g, 'どくら').replace(/権田/g, 'ごんだ').replace(/鬼瓦/g, 'おにがわら').replace(/鬼塚/g, 'おにづか').replace(/矢吹/g, 'やぶき')
  .replace(/本官/g, 'ほんかん').replace(/百裂/g, 'ひゃくれつ').replace(/百烈/g, 'ひゃくれつ').replace(/井戸端/g, 'いどばた').replace(/牢名主/g, 'ろうなぬし').replace(/無権代理/g, 'むけんだいり')
  .replace(/影分身/g, 'かげぶんしん').replace(/懲罰房/g, 'ちょうばつぼう').replace(/杖杖杖杖/g, 'つえつえつえつえ').replace(/女将/g, 'おかみ').replace(/時効/g, 'じこう').replace(/〜/g, 'ー').replace(/中技/g, 'ちゅうわざ').replace(/大技/g, 'おおわざ').replace(/超ウルトラ技/g, 'ちょうウルトラわざ').replace(/法竜/g, 'ほうりゅう').replace(/昇天波/g, 'しょうてんぱ').replace(/百万脚/g, 'ひゃくまんきゃく').replace(/千樽/g, 'せんだる').replace(/鉄鎖/g, 'てっさ').replace(/獄門/g, 'ごくもん').replace(/圧殺/g, 'あっさつ').replace(/組手/g, 'くみて').replace(/お膳/g, 'おぜん').replace(/房内/g, 'ぼうない').replace(/雑居房/g, 'ざっきょぼう').replace(/偽委任状/g, 'にせいにんじょう').replace(/仮装売買/g, 'かそうばいばい').replace(/詐術/g, 'さじゅつ').replace(/地上げ/g, 'じあげ').replace(/表見代理/g, 'ひょうけんだいり');
const { lines } = JSON.parse(fs.readFileSync(ROOT + 'voices.json', 'utf8'));
const speakers = await (await fetch(ENGINE + '/speakers')).json();
const style = k => { const c = CAST[k] || CAST.hero; const sp = speakers.find(s => s.name === c[0]) || speakers[0]; const st = sp.styles.find(s => s.name === c[1]) || sp.styles[0]; return { id: st.id, sig: [sp.name, st.name, c[2], c[3], c[4]].join('|'), c }; };
const dir = ROOT + 'audio/'; fs.mkdirSync(dir, { recursive: true });
const MAN = dir + 'manifest.json'; let man = {}; try { man = JSON.parse(fs.readFileSync(MAN, 'utf8')); } catch (e) {}
let made = 0; const ok = {};
for (const [id, k, text] of lines) {
  const st = style(k), say = yomi(text), sig = st.sig + '|' + say, mp3 = dir + id + '.mp3'; ok[id] = 1;
  if (fs.existsSync(mp3) && man[id] === sig) continue;
  const q = await (await fetch(`${ENGINE}/audio_query?speaker=${st.id}&text=${encodeURIComponent(say)}`, { method: 'POST' })).json();
  Object.assign(q, { speedScale: st.c[2], pitchScale: st.c[3], intonationScale: st.c[4], volumeScale: 1.25, prePhonemeLength: .05, postPhonemeLength: .1 });
  const wav = Buffer.from(await (await fetch(`${ENGINE}/synthesis?speaker=${st.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })).arrayBuffer());
  fs.writeFileSync('/tmp/av.wav', wav); // アナウンスは会場に響くように（低音を足して、こだまをかける）
  const fx = k === 'ann' ? ['-af', 'bass=g=6,aecho=0.8:0.85:110|230|360:0.42|0.28|0.16,apad=pad_dur=0.6,volume=1.3'] : [];
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', '/tmp/av.wav', ...fx, '-ac', '1', '-ar', '24000', '-b:a', '64k', mp3]);
  man[id] = sig; made++; console.log('録音', id, say, '／', st.sig);
}
fs.writeFileSync(MAN, JSON.stringify(man));
fs.writeFileSync(dir + 'index.js', `/* 試作の声の目次（arena/gen_voice.mjs が作る） */\nwindow.OL_AUDIO2=${JSON.stringify(Object.keys(ok).filter(id => fs.existsSync(dir + id + '.mp3')))};\n`);
console.log(`セリフ ${lines.length} 行、新しく録音 ${made} 行`);
