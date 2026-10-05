(function(){
var ua=navigator.userAgent,D=document,iOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),AND=/Android/i.test(ua);
var mb=D.getElementById('pwa-menu-dl');
if(!(iOS||AND)||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true){if(mb&&mb.parentNode)mb.parentNode.style.setProperty('display','none','important');return}
var LS=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
var br=/GSA\//.test(ua)?'g':/CriOS|EdgiOS|FxiOS/.test(ua)?'c':/OPT\/|OPiOS|OPR\//.test(ua)?'o':navigator.brave?'b':AND?'c':'s';
var bar=LS('igBar')||(iOS?(br==='c'?'t':'b'):(br==='o'?'b':'t'));
var old=D.getElementById('pwa-install-banner'),ICON=(old&&old.querySelector('img')||{}).src||'icon-192.png',NAME='Gyógyszertáram';
if(old)old.remove();
var BL=iOS?'#007AFF':'#1a73e8',SAFE='env(safe-area-inset-bottom,0px)';
var st=D.createElement('style');st.textContent='.ig-pop,.ig-card{position:fixed;z-index:99000;background:#fff;color:#1a1a1a;border-radius:14px;box-shadow:0 6px 22px rgba(0,0,0,.3);font:13px/1.3 -apple-system,"Segoe UI",system-ui,sans-serif;left:8px;right:8px;max-width:440px;margin:auto}'+
'.ig-pop{display:none;align-items:center;gap:8px;padding:6px 8px}.ig-pop.on{display:flex}.ig-pop img{width:34px;height:34px;border-radius:8px}.ig-pop div{flex:1;min-width:0}.ig-pop b{display:block;font-size:.8rem}.ig-pop span{font-size:.68rem;color:#555}'+
'.ig-btn{border:0;border-radius:999px;background:'+BL+';color:#fff;font-weight:700;padding:6px 13px;font-size:.78rem}'+
'.ig-top{top:var(--ig-top,0)}.ig-bot{bottom:calc(8px + '+SAFE+')}.ig-bot.ar{bottom:calc(56px + '+SAFE+')}'+
'.ig-card{display:none;padding:5px 3px 3px}.ig-card.on{display:block}.ig-row{display:flex;align-items:center;gap:2px}.ig-nav{flex:none;width:24px;height:40px;border:0;border-radius:12px;background:#eef1f4;font-size:20px;color:#333;padding:0}'+
'.ig-body{flex:1;min-width:0;display:flex;gap:7px;align-items:center}.ig-ill{flex:0 0 46%}.ig-svg{display:block;width:100%;height:auto;border-radius:8px}.ig-tx{flex:1;min-width:0}.ig-tx>b{display:block;font-size:.8rem}.ig-tx p{margin:2px 0 0;font-size:.7rem;line-height:1.28;color:#444}'+
'.ig-h{font-size:.66rem;font-weight:700;color:#555;padding:0 8px 2px}.ig-foot{display:flex;align-items:center;justify-content:space-between;padding:3px 8px 0}.ig-alt{min-width:104px;font-size:.62rem;color:#777}.ig-dots{display:flex;gap:4px}.ig-dots i{font-style:normal;width:18px;height:18px;border-radius:50%;background:#dde2e7;color:#555;font-size:.62rem;line-height:18px;text-align:center}.ig-dots i.on{background:'+BL+';color:#fff}'+
'.ig-x{background:#222;color:#fff;border:0;border-radius:999px;font-size:.74rem;font-weight:700;padding:7px 13px;white-space:nowrap}.ig-pop .ig-x{background:none;color:#888;font-size:22px;font-weight:400;padding:0 2px}'+
'.ig-arr{position:fixed;z-index:99001;font-size:46px;line-height:1;color:#e53935;display:none;animation:igb .85s ease-in-out infinite;text-shadow:0 0 6px #fff,0 0 16px rgba(255,255,255,.9);filter:drop-shadow(0 0 8px rgba(229,57,53,.95));pointer-events:none}.ig-arr.on{display:block}@keyframes igb{0%,100%{transform:translateY(0) scale(1);opacity:1}50%{transform:translateY(var(--d,12px)) scale(1.3);opacity:.55}}.ig-ring{animation:igp 1.2s infinite}@keyframes igp{50%{opacity:.25}}@media(prefers-reduced-motion:reduce){.ig-arr,.ig-ring,.ig-mk{animation:none}}'+
'.ig-bg{display:none;position:fixed;left:0;right:0;top:var(--ig-top,0);bottom:0;z-index:98900;background:#3b3f45;flex-direction:column;align-items:center;box-sizing:border-box;font:13px/1.3 -apple-system,system-ui,sans-serif}.ig-bg.on{display:flex}.ig-or{margin:2px 0 6px;font-size:.7rem;color:#c9ced6;letter-spacing:.08em}.ig-lbl{margin:0 0 6px;font-size:.78rem;font-weight:700;color:#fff;text-align:center}.ig-steps{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:2}.ig-steps i{box-sizing:border-box;width:30px;height:30px;border:2px solid rgba(255,255,255,.9);border-radius:50%;color:#fff;font:700 .8rem/26px -apple-system,system-ui,sans-serif;font-style:normal;text-align:center;background:transparent;transition:background .2s,color .2s}.ig-steps i.on{background:#fff;color:#3b3f45}.ig-intro{position:fixed;inset:0;z-index:99500;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62)}.ig-intro.on{display:flex}.ig-intro div{max-width:340px;background:#fff;color:#1a1a1a;border-radius:20px;padding:22px 20px 18px;text-align:center;font:15px/1.5 -apple-system,system-ui,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.4)}.ig-intro p{margin:0 0 16px}.ig-intro button{border:0;border-radius:999px;background:#007AFF;color:#fff;font-weight:700;font-size:.9rem;padding:11px 20px}.ig-bg.rev .ig-lbl{order:1}.ig-bg.rev .ig-vw{order:2}.ig-bg.rev .ig-or{order:3;margin:6px 0 2px}.ig-vw{position:relative;flex:1;min-height:0;aspect-ratio:360/736;max-width:100%;border:6px solid #1c1c1e;border-radius:24px;box-sizing:border-box;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.25)}.ig-vw video{width:100%;height:100%;display:block;object-fit:cover}.ig-mk{position:absolute;border:3px solid #e53935;box-sizing:border-box;transform:translate(-50%,-50%);display:none;animation:igp 1.2s infinite;pointer-events:none}';
D.head.appendChild(st);
// ---- SVG kellékek ----
function R(x,y,w,h,r,f,s){return'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+(f||'none')+'"'+(s?' stroke="'+s+'" stroke-width="1.2"':'')+'/>'}
function T(x,y,t,z,f,a,w){z=z||10;return'<text x="'+x+'" y="'+y+'" font-size="'+z+'" fill="'+(f||'#222')+'" text-anchor="'+(a||'start')+'"'+(w?' font-weight="700"':'')+'>'+t.split('|').map(function(s,i){return'<tspan x="'+x+'" dy="'+(i?z*1.15:0)+'">'+s+'</tspan>'}).join('')+'</text>'}
function C(x,y,r,f){return'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>'}
function ring(x,y,r){return'<circle class="ig-ring" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="#e53935" stroke-width="3"/>'}
function box(x,y,w,h){return'<rect class="ig-ring" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="7" fill="none" stroke="#e53935" stroke-width="3"/>'}
function g(x,y,p,c,s){s=s||1.2;return'<g transform="translate('+x+','+y+') scale('+s+')" fill="none" stroke="'+(c||'#333')+'" stroke-width="'+(1.8/s)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</g>'}
function ic(p,c){return'<svg width="15" height="15" viewBox="-10 -10 20 20" style="vertical-align:-3px" fill="none" stroke="'+(c||'#333')+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
function S(i,bg){return'<svg class="ig-svg" viewBox="0 0 240 80">'+R(0,0,240,80,0,bg||'#e9ecef')+i+'</svg>'}
var SH='<path d="M-3.5-3H-5a2.2 2.2 0 0 0-2.2 2.2V6.5A2.5 2.5 0 0 0-4.7 9H4.7a2.5 2.5 0 0 0 2.5-2.5V-.8A2.2 2.2 0 0 0 5-3H3.5M0 4.5V-9M-3.5-5.5L0-9l3.5 3.5"/>',
PL='<rect x="-7" y="-7" width="14" height="14" rx="3.5"/><path d="M0-3.5v7M-3.5 0h7"/>',CV='<path d="M-7-2.5L0 4l7-6.5"/>',
CP='<rect x="-6" y="-3" width="9" height="11" rx="2"/><path d="M-3-6h6.5a2 2 0 0 1 2 2V5"/>',BM='<path d="M-4.5-7h9v14l-4.5-3.5-4.5 3.5z"/>',
GL='<circle cx="-4.5" cy="1" r="3.5"/><circle cx="4.5" cy="1" r="3.5"/><path d="M-1 .5h2"/>',ST='<path d="M0-8l2.4 5 5.4.7-4 3.8 1 5.4L0 4l-4.8 2.9 1-5.4-4-3.8 5.4-.7z"/>',
LP='<circle cx="-4" cy="-5" r="3"/><path d="M-4-6.5v3M-5.5-5h3M1-5h7M-7 0h15M-7 5h15"/>',DC='<rect x="-5" y="-6" width="10" height="13" rx="2"/><path d="M-2 0l2 2 3-4"/>',
RM='<rect x="-6" y="-7" width="12" height="14" rx="2.5"/><path d="M-3-3h6M-3 0h6M-3 3h3"/>',SR='<circle cx="-1.5" cy="-1.5" r="5"/><path d="M2 2l5 5"/>',
DH='<circle cx="-5" r="1.6" fill="#fff"/><circle r="1.6" fill="#fff"/><circle cx="5" r="1.6" fill="#fff"/>',DV='<circle cy="-5" r="1.6" fill="#333"/><circle r="1.6" fill="#333"/><circle cy="5" r="1.6" fill="#333"/>',
BK='<path d="M2-6l-6 6 6 6"/>',FW='<path d="M-2-6l6 6-6 6"/>',BOOK='<path d="M0-4v11M0-4C-2-6-6-6-9-5v11c3-1 7-1 9 1 2-2 6-2 9-1V-5C6-6 2-6 0-4z"/>',TABS='<rect x="-7" y="-4" width="11" height="11" rx="2.5"/><path d="M-4-7h8a3 3 0 0 1 3 3v8"/>',LINES='<path d="M-6-3h12M-6 0h8M-6 3h5"/>',RELOAD='<path d="M5-2a5 5 0 1 0 1 4M5-6v4h-4"/>';
function HOME(){return S([20,78,136].map(function(x){return R(x,10,36,36,9,'#fff')}).join('')+'<image href="'+ICON+'" x="188" y="10" width="36" height="36"/>'+ring(206,28,27)+T(206,62,NAME,9,'#222','middle'),'#cfe0f0')}
function steps(){
 var top=bar==='t';
 var HM='<path d="M-7 1L0-6 7 1M-5 0v7h4v-4h2v4h4V0"/>',TN='<path d="M-6-2h7M4-2h2M-6 3h2M0 3h6"/><circle cx="3" cy="-2" r="1.6"/><circle cx="-2" cy="3" r="1.6"/>',DVW='<circle cy="-5" r="1.6" fill="#fff"/><circle r="1.6" fill="#fff"/><circle cy="5" r="1.6" fill="#fff"/>',MENUBG='#f6f4fb';
 if(br==='g')return[{t:iOS?'Nyisd meg Safariban':'Nyisd meg Chrome-ban',d:iOS?'A Google appból nem telepíthető. Koppints a '+ic('<circle r="7"/><path d="M-2.5-2.5l5-2-2 5-5 2z"/>')+' <b>Megnyitás Safariban</b> gombra, és ott folytasd.':'Koppints a <b>⋮</b> menüre, majd a <b>Megnyitás a(z) Chrome böngészőben</b> pontra.',s:iOS?S(R(30,20,180,40,10,'#fff')+T(120,45,'Megnyitás böngészőben',11,'#222','middle')+box(34,24,172,32)):S(R(20,2,200,76,10,MENUBG,'#ccc')+T(30,18,'Link másolása',8.5)+T(30,33,'Mentett oldalak megtekintése',8.5)+T(30,52,'Megnyitás a(z) Chrome böngészőben',8.5,'#111',0,1)+g(206,49,'<path d="M-5-5h6M5-5v7M-5-5v10h10M0 0l7-7M2-7h5v5"/>','#222',.8)+T(30,68,'Chrome-előzmények',8.5)+box(24,40,192,16))}];
 if(AND){return[
 {t:'Menü megnyitása',d:'Koppints a <b>⋮</b> gombra a '+(top?'jobb felső':'jobb alsó')+' sarokban.',s:S(top?R(0,0,240,34,0,'#1b1b1d')+g(16,17,HM,'#fff',1)+R(30,6,120,22,11,'#3b3b3e')+g(42,17,TN,'#fff',.9)+T(54,20,'gyogyszertarorgovany.hu',7,'#fff')+g(166,17,'<path d="M0-6v12M-6 0h12"/>','#fff',1)+R(181,10,14,14,4,'none','#fff')+T(188,20,'43',7,'#fff','middle')+g(222,17,DVW,'#fff',1)+ring(222,17,14)+R(0,34,240,46,0,'#d5dae0'):R(6,6,228,22,11,'#dfe3e8')+T(120,21,'gyogyszertarorgovany.hu',10,'#555','middle')+R(6,54,228,22,11,'#dfe3e8')+g(222,65,DV,'#333',1)+ring(222,65,13))},
 {t:'Menüpont kiválasztása',d:'Görgess lefelé, és koppints a <b>Telepítés és parancsikon</b> pontra (régebbi Chrome: Alkalmazás telepítése).',s:S(R(66,2,170,76,10,MENUBG,'#ccc')+T(76,16,'Fordítás…',8.5)+T(76,30,'Olvasási mód megjelenítése…',8.5)+T(76,45,'Telepítés és parancsikon',8.5,'#111',0,1)+T(76,61,'Asztali webhely',8.5)+R(214,52,12,12,2,'none','#222')+box(70,34,162,16))},
 {t:'Telepítés',d:'Az „Alkalmazás telepítése” ablakban koppints a <b>Telepítés</b> gombra.',s:S(R(14,4,212,72,14,'#f9f9fe','#ddd')+T(24,20,'Alkalmazás telepítése',10,'#111')+'<image href="'+ICON+'" x="24" y="27" width="22" height="22"/>'+T(54,37,NAME+' –',8,'#111')+T(54,46,'Gondviselés Gyógyszertár',8,'#111')+T(54,56,'gyogyszertarorgovany.hu',6.5,'#555')+T(130,69,'Mégse',8.5,'#1a73e8')+T(180,69,'Telepítés',8.5,'#1a73e8','start',1)+box(172,58,50,15))},
 {t:'Hozzáadás',d:'Samsungon a „Felveszi a kezdőképernyőre?” kérdésnél koppints a <b>Hozzáadás</b> gombra.',s:S(R(14,4,212,74,14,'#f2f2f0','#ddd')+T(24,19,'Felveszi a kezdőképernyőre?',9,'#111',0,1)+R(22,25,196,30,8,'#e4e4e4')+'<image href="'+ICON+'" x="108" y="27" width="16" height="16"/>'+T(120,51,NAME,6.5,'#555','middle')+T(66,70,'Mégse',9,'#111','middle',1)+T(170,70,'Hozzáadás',9,'#111','middle',1)+box(124,58,92,16))},
 {t:'Kész!',d:'Az ikont a főképernyőn találod.',s:HOME()}]}
 var s1=top?S(R(6,6,228,26,13,'#d1d1d6')+T(120,23,'gyogyszertarorgovany.hu',11,'#333','middle')+g(214,19,SH,'#333',1)+ring(214,19,15)+R(6,40,228,34,8,'#dfe3e8')):
  br==='b'?S(R(6,6,228,26,13,'#1c1c1e')+T(120,23,'gyogyszertarorgovany.hu',11,'#fff','middle')+R(0,40,240,40,0,'#2c2c2e')+g(24,60,BK,'#fff')+g(71,60,SH,'#fff',1)+ring(71,60,15)+g(118,60,'<path d="M0-7v14M-7 0h14"/>','#fff',1)+R(158,53,14,14,3,'none','#fff')+g(211,60,DH,'#fff'),'#555'):
  S(R(6,4,228,24,12,'#1c1c1e')+T(120,20,'gyogyszertarorgovany.hu',11,'#fff','middle')+g(24,16,LINES,'#fff',.9)+g(216,16,RELOAD,'#fff',.9)+R(6,36,228,40,20,'#f2f2f7','#c7c7cc')+g(32,56,BK)+g(75,56,FW,'#bbb')+g(117,56,SH)+ring(117,56,15)+g(161,56,BOOK)+g(205,56,TABS));
 var it={s:[[CP,'Másolás'],[BM,'Hozzáadás|ehhez:|Könyvjelzők'],[GL,'Hozzáadás az|olvasási|listához']],c:[[CP,'Másolás'],[LP,'Hozzáadás az|Olvasólistá-|hoz'],[ST,'Hozzáadás a|könyvjelzők-|höz']],b:[[CP,'Másolás'],[DC,'Tiszta|hivatkozás|másolása'],[RM,'Olvasó mód|átkapcsolása']]}[br==='c'?'c':br==='s'?'s':'b'].concat([[CV,'Továbbiak|megtekintése']]);
 var s2=S(R(4,2,232,76,14,'#f2f2f7','#c7c7cc')+it.map(function(a,n){var x=32+n*57;return C(x,26,16,'#e5e5ea')+g(x,26,a[0],'#333',1.1)+T(x,52,a[1],7.5,'#333','middle')}).join('')+ring(203,26,19));
 var s3=S(R(4,2,232,76,14,'#f2f2f7','#c7c7cc')+T(14,22,'Keresés az oldalon',10.5)+g(216,18,SR,'#333',.9)+'<path d="M14 29H226M14 55H226" stroke="#d1d1d6"/>'+T(14,46,'Főképernyőhöz adás',10.5,'#111',0,1)+g(216,42,PL,'#333',.9)+T(14,70,'Nyomtatás',10.5)+box(8,32,224,20));
 var s4=S(R(4,2,232,76,14,'#f2f2f7','#c7c7cc')+T(14,18,'Mégse',10,BL)+T(120,18,'Főképernyőhöz adás',10,'#111','middle',1)+T(226,18,'Hozzáadás',10,BL,'end',1)+box(168,6,62,16)+'<image href="'+ICON+'" x="12" y="28" width="24" height="24"/>'+R(42,28,184,24,6,'#fff')+T(50,44,NAME,10.5)+T(14,70,'Megnyitás webalkalmazásként',9)+R(190,60,32,16,8,'#34c759')+C(214,68,6,'#fff'));
 return[{t:'Megosztás',d:'Koppints a '+ic(SH)+' <b>Megosztás</b> ikonra '+(top?'a címsor jobb szélén.':'az alsó sávban. Egyszerűsített nézetben: <b>⋯</b> gomb.'),s:s1},
 {t:'Továbbiak',d:'A panel alján koppints a '+ic(CV)+' <b>Továbbiak megtekintése</b> gombra.',s:s2},
 {t:'Főképernyőhöz adás',d:'A listán válaszd a '+ic(PL)+' <b>Főképernyőhöz adás</b> sort (görgess, ha nem látod).',s:s3},
 {t:'Hozzáadás',d:'Hagyd bekapcsolva a <b>Megnyitás webalkalmazásként</b> kapcsolót, majd: <b>Hozzáadás</b>.',s:s4},
 {t:'Kész!',d:'Az ikon a főképernyőn van, onnan nyisd meg.',s:HOME()}]}
// ---- Felület ----
var pop=D.createElement('div');pop.className='ig-pop';pop.setAttribute('role','dialog');pop.innerHTML='<img src="'+ICON+'" alt=""><div><b>Töltse le alkalmazásunkat!</b><span>Gyorsabb elérés a főképernyőről</span></div><button class="ig-btn" type="button">Letöltés</button><button class="ig-x" type="button" aria-label="Bezárás">&times;</button>';
var card=D.createElement('div');card.className='ig-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Telepítési útmutató');
var arr=D.createElement('div');arr.className='ig-arr';
var intro=D.createElement('div');intro.className='ig-intro';intro.innerHTML='<div><p>Az Apple webalkalmazás korlátozásai miatt a letöltést 4 lépésben tudja elvégezni. Egy videós és egy lebegő ablakos útmutatóval megmutatjuk a folyamatot.</p><button type="button">Letöltési ÚTMUTATÓ megtekintése</button></div>';
D.body.appendChild(intro);
intro.addEventListener('click',function(){intro.classList.remove('on');open()});
var bgOn=iOS&&br!=='g',bg=D.createElement('div');bg.className='ig-bg';
bg.innerHTML='<div class="ig-or">— vagy —</div><div class="ig-lbl">▶ Videós bemutató az alkalmazás telepítéséhez</div><div class="ig-vw"><video muted loop playsinline preload="auto" poster="install-guide.jpg" src="install-guide.mp4"></video><div class="ig-mk"></div></div><div class="ig-steps"><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i></div>';
var vid=bg.querySelector('video'),mk=bg.querySelector('.ig-mk'),raf,stepEls=bg.querySelectorAll('.ig-steps i'),curStep=-1;vid.muted=true;
// [kezdet,vég (mp), középpont x,y, szélesség,magasság (arány), kör?, minden böngészőre?] — mindig csak az éppen kattintandó elem van jelölve
var K=[[0,3.9,.483,.938,.19,.093,1,0],[4,5.6,.828,.867,.2,.098,1,1],[6.2,8.5,.5,.733,.93,.058,0,1],[8.7,11.9,.795,.059,.31,.062,0,1],[12,14.8,.16,.092,.24,.117,1,1]];
function tick(){var t=vid.currentTime,k=null,sn=t<4?0:t<6.1?1:t<8.6?2:t<12?3:4;if(sn!==curStep){curStep=sn;for(var q=0;q<stepEls.length;q++)stepEls[q].className=q===sn?'on':''}K.forEach(function(a){if(t>=a[0]&&t<a[1]&&(a[7]||br==='s'))k=a});var m=mk.style;if(k){m.display='block';m.left=k[2]*100+'%';m.top=k[3]*100+'%';m.width=k[4]*100+'%';m.height=k[5]*100+'%';m.borderRadius=k[6]?'50%':'14px'}else m.display='none';raf=requestAnimationFrame(tick)}
D.body.appendChild(pop);D.body.appendChild(bg);D.body.appendChild(card);D.body.appendChild(arr);
var idx=0,auto=true,tm,jt,list=[],defer=window.__bip||null,arrowOn=true;
function setTop(){var n=D.querySelector('nav'),h=n?n.getBoundingClientRect().bottom:0;D.documentElement.style.setProperty('--ig-top',Math.max(h,0)+'px')}
function stop(){auto=false;clearInterval(tm)}
function render(){
 var s=list[idx];
 card.innerHTML='<div class="ig-h">Az alkalmazás telepítése lépésről lépésre</div><div class="ig-row"><button class="ig-nav" aria-label="Előző">&#8249;</button><div class="ig-body" aria-live="polite"><div class="ig-ill">'+s.s+'</div><div class="ig-tx"><b>'+(idx+1)+'. '+s.t+'</b><p>'+s.d+'</p></div></div><button class="ig-nav" aria-label="Következő">&#8250;</button></div><div class="ig-foot"><a class="ig-alt" href="#">'+(iOS&&br!=='g'?(bar==='t'?'Alul van a címsor?':'Felül van a címsor?'):'')+'</a><span class="ig-dots">'+list.map(function(_,n){return'<i class="'+(n===idx?'on':'')+'">'+(n+1)+'</i>'}).join('')+'</span><button class="ig-x" type="button">Bezárás &times;</button></div>';
 var b=card.querySelectorAll('.ig-nav');b[0].onclick=function(){stop();go(idx-1)};b[1].onclick=function(){stop();go(idx+1)};
 card.querySelector('.ig-x').onclick=close;
 var al=card.querySelector('.ig-alt');al.onclick=function(e){e.preventDefault();if(!al.textContent)return;bar=bar==='t'?'b':'t';LS('igBar',bar);open()};
 arr.classList.toggle('on',arrowOn&&card.classList.contains('on'));
}
function go(n){idx=(n+list.length)%list.length;render()}
var opened=false;
function hide(){clearInterval(tm);clearTimeout(jt);bg.classList.remove('on');vid.pause();cancelAnimationFrame(raf);card.classList.remove('on');arr.classList.remove('on')}
function close(){hide();if(opened){opened=false;try{if(history.state&&history.state.ig)history.back()}catch(e){}}}
addEventListener('popstate',function(){if(opened){opened=false;hide()}});
function fit(){card.style.minHeight='';var h=0,i;for(i=0;i<list.length;i++){idx=i;render();h=Math.max(h,card.offsetHeight)}card.style.minHeight=h+'px';idx=0;render();
 if(bgOn)bg.style.padding=bar==='b'?(h+8)+'px 10px 58px':'10px 10px calc('+(h+16)+'px + '+SAFE+')'}
function open(){
 pop.classList.remove('on');clearInterval(tm);clearTimeout(jt);list=steps();idx=0;arrowOn=br!=='g';setTop();
 auto=!matchMedia('(prefers-reduced-motion: reduce)').matches;var tp=bar==='b';
 card.className='ig-card on '+(tp?(arrowOn&&!bgOn?'ig-bot ar':'ig-top'):'ig-bot');
 if(bgOn){bg.classList.toggle('rev',bar!=='b');bg.classList.add('on');vid.currentTime=0;var pp=vid.play();if(pp&&pp.catch)pp.catch(function(){});cancelAnimationFrame(raf);tick()}
 var up=bar==='t';arr.textContent=up?'\u25B2':'\u25BC';arr.style.setProperty('--d',up?'-12px':'12px');
 arr.style.cssText=(up?'--d:-12px;top:2px;right:'+(iOS?'20px':'8px'):'--d:12px;bottom:calc(2px + '+SAFE+');'+(AND?'right:8px':'left:'+(br==='b'?'27%':'47%')));
 render();fit();if(!opened){opened=true;try{history.pushState({ig:1},'')}catch(e){}}
 tm=setInterval(function(){if(auto)go(idx+1)},4300);
 // alsó sávos böngészőnél a panel pár mp múlva a fejléc alá ugrik (a megosztási panel ne takarja)
 if(tp&&arrowOn&&!bgOn)jt=setTimeout(function(){card.className='ig-card on ig-top'},3500);
 card.onpointerdown=stop;var x0;card.ontouchstart=function(e){x0=e.touches[0].clientX};card.ontouchend=function(e){var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){stop();go(idx+(dx<0?1:-1))}};
}
pop.querySelector('.ig-x').onclick=function(){pop.classList.remove('on');LS('igPopX',String(Date.now()))}; // kiikszelés után 12 óráig nem jelenik meg újra
function start(){ // rendszerszintű telepítési ablak, ha elérhető; a lépéses útmutató csak tartalék
 if(defer){var p=defer;defer=null;window.__bip=null;pop.classList.remove('on');p.prompt()}else if(iOS&&br!=='g'){pop.classList.remove('on');intro.classList.add('on')}else open()}
pop.querySelector('.ig-btn').onclick=start;
addEventListener('beforeinstallprompt',function(e){e.preventDefault();defer=e});
addEventListener('appinstalled',function(){pop.classList.remove('on');close()});
function consent(){try{var d=JSON.parse(localStorage.getItem('gyogyszertar_cookie_v2'));return!!(d&&d.ts&&Date.now()-d.ts<31536e6)}catch(e){return false}}
function reveal(){if(popOff)return;if(Date.now()-parseInt(LS('igPopX')||'0',10)<432e5)return;setTimeout(function(){setTop();pop.className='ig-pop on ig-top'},1200)}
consent()?reveal():addEventListener('cookieConsentDecided',reveal,{once:true});
var ck=D.getElementById('check'),popWas=false,popOff=false;if(ck)ck.addEventListener('change',function(){if(ck.checked){popWas=pop.classList.contains('on');pop.classList.remove('on');if(card.classList.contains('on'))close()}else if(popWas&&!popOff){popWas=false;pop.classList.add('on')}});
if(mb)mb.addEventListener('click',function(e){e.preventDefault();var c=D.getElementById('check');if(c)c.checked=false;popOff=true;popWas=false;pop.classList.remove('on');start()});
if(/[?&]app=1/.test(location.search))setTimeout(start,600);
})();
