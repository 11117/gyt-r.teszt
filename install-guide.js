(function(){
var ua=navigator.userAgent,iOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),AND=/Android/i.test(ua);
if(!(iOS||AND))return;
if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)return;
var D=document,LS=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
var br=/GSA\//.test(ua)?'g':/CriOS|EdgiOS|FxiOS/.test(ua)?'c':/OPT\/|OPiOS|OPR\//.test(ua)?'o':AND?(navigator.brave?'b':'c'):'s';
var old=D.getElementById('pwa-install-banner'),ICON=(old&&old.querySelector('img')||{}).src||'icon-192.png';
if(old)old.remove();
var css='.ig-pop,.ig-card{position:fixed;z-index:99000;background:#fff;color:#1a1a1a;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.3);font:14px/1.4 -apple-system,"Segoe UI",system-ui,sans-serif}'+
'.ig-pop{left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));max-width:400px;margin:auto;padding:10px 12px;display:none;align-items:center;gap:10px}.ig-pop.on{display:flex}'+
'.ig-pop img{width:44px;height:44px;border-radius:10px}.ig-pop b{display:block;font-size:.9rem}.ig-pop span{font-size:.76rem;color:#555}.ig-pop div{flex:1}'+
'.ig-btn{border:0;border-radius:999px;background:'+(iOS?'#007AFF':'#1a73e8')+';color:#fff;font-weight:700;padding:9px 16px;font-size:.85rem}'+
'.ig-x{position:absolute;top:2px;right:6px;background:none;border:0;font-size:22px;color:#888;padding:4px 8px}.ig-pop .ig-x{position:static}'+
'.ig-card{left:8px;right:8px;max-width:440px;margin:auto;padding:12px 10px 8px;display:none;transition:top .6s,bottom .6s}.ig-card.on{display:block}'+
'.ig-card.bot{bottom:calc(8px + env(safe-area-inset-bottom,0px))}.ig-card.top{top:var(--ig-top,64px)}'+
'.ig-row{display:flex;align-items:center;gap:4px}.ig-sl{flex:1;min-width:0;text-align:center}.ig-nav{border:0;background:#eef1f4;border-radius:50%;width:34px;height:34px;font-size:20px;color:#333;flex:none}'+
'.ig-svg{width:100%;max-height:150px;border-radius:10px;background:#eef1f4}.ig-sl h4{margin:6px 0 2px;font-size:.95rem}.ig-sl p{margin:0;font-size:.8rem;color:#444}.ig-sl p svg{vertical-align:middle}'+
'.ig-dots{display:flex;justify-content:center;gap:6px;margin-top:8px}.ig-dots i{font-style:normal;width:22px;height:22px;border-radius:50%;background:#dde2e7;color:#555;font-size:.7rem;line-height:22px;text-align:center}.ig-dots i.on{background:'+(iOS?'#007AFF':'#1a73e8')+';color:#fff}'+
'.ig-alt{display:block;text-align:center;font-size:.7rem;color:#777;margin-top:6px;text-decoration:underline}'+
'.ig-arr{position:fixed;z-index:99001;font-size:34px;color:#e53935;display:none;animation:igb 1s infinite;text-shadow:0 0 4px #fff;pointer-events:none}.ig-arr.on{display:block}'+
'@keyframes igb{50%{transform:translateY(8px)}}.ig-ring{animation:igp 1.2s infinite}@keyframes igp{50%{opacity:.25}}@media(prefers-reduced-motion:reduce){.ig-arr,.ig-ring{animation:none}}';
var st=D.createElement('style');st.textContent=css;D.head.appendChild(st);
// --- SVG kellékek ---
var BL=iOS?'#007AFF':'#1a73e8';
function R(x,y,w,h,r,f,s){return'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+(f||'none')+'"'+(s?' stroke="'+s+'" stroke-width="1.2"':'')+'/>'}
function T(x,y,t,z,f,a){return'<text x="'+x+'" y="'+y+'" font-size="'+(z||8)+'" fill="'+(f||'#333')+'" text-anchor="'+(a||'start')+'">'+t+'</text>'}
function C(x,y,r,f){return'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>'}
function ring(x,y){return'<circle class="ig-ring" cx="'+x+'" cy="'+y+'" r="13" fill="none" stroke="#e53935" stroke-width="2.5"/>'}
function box(x,y,w,h){return'<rect class="ig-ring" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="none" stroke="#e53935" stroke-width="2.5"/>'}
function g(x,y,p,c){return'<g transform="translate('+x+','+y+')" fill="none" stroke="'+(c||BL)+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+p+'</g>'}
var SH='<path d="M-5 0v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V0M0 5V-8M-3-5l3-3 3 3"/>',DOTS='<circle cx="0" cy="-4" r="1.3"/><circle cx="0" cy="0" r="1.3"/><circle cx="0" cy="4" r="1.3"/>',
PLUS='<rect x="-6" y="-6" width="12" height="12" rx="3"/><path d="M0-3v6M-3 0h6"/>',CHV='<path d="M-6-2l6 5 6-5"/>';
function S(i){return'<svg class="ig-svg" viewBox="0 0 240 130">'+R(0,0,240,130,0,'#eef1f4')+i+'</svg>'}
var HOME=S(R(0,0,240,130,0,'#cfe0f0')+[0,1,2,3].map(function(n){return R(20+n*55,16,38,38,9,'#fff')}).join('')+R(20,70,38,38,9,'#fff')+R(75,70,38,38,9,'#fff')+'<image href="'+ICON+'" x="130" y="70" width="38" height="38"/>'+box(126,66,46,46)+T(149,120,'Gondviselés',7,'#333','middle'));
var hu=!/^en/i.test(navigator.language||'hu'),L={add:hu?'Főképernyőhöz adás':'Add to Home Screen',more:hu?'Továbbiak megtekintése':'View More',share:hu?'Megosztás':'Share',inst:hu?'Alkalmazás telepítése':'Install app',web:hu?'Megnyitás webalkalmazásként':'Open as Web App',addb:hu?'Hozzáadás':'Add'};
var bar=LS('igBar')||((iOS&&(br==='c'))?'t':'b'); // címsor helye: t=fent, b=lent
function steps(){
 if(br==='g')return[{t:'Nyisd meg böngészőben',d:iOS?'A Google alkalmazás beépített nézetéből nem lehet telepíteni. Koppints a '+g(0,0,'<circle cx="0" cy="0" r="6"/><path d="M-2-2l5-2-2 5-5 2z"/>','#333').replace('<g','<svg width="16" height="16" viewBox="-8 -8 16 16"><g').replace('</g>','</g></svg>')+' <b>Megnyitás Safariban</b> lehetőségre, majd ott kövesd a lépéseket.':'Koppints a <b>⋮</b> menüre, majd a <b>Megnyitás Chrome-ban</b> lehetőségre, és ott kövesd a lépéseket.',s:S(R(20,30,200,70,10,'#fff')+T(120,70,'Megnyitás böngészőben',10,'#333','middle')+box(30,52,180,34))}];
 if(AND){var topB=br!=='o',my=topB?16:114;
  return[{t:'Nyisd meg a menüt',d:'Koppints a <b>⋮</b> (három pont) gombra a böngésző '+(topB?'jobb felső':'jobb alsó')+' sarkában.',s:S(R(8,6,224,20,10,'#e2e5e9')+T(120,20,'11117.github.io',8,'#555','middle')+g(222,my>20?my:16,DOTS,'#333')+(topB?ring(222,16):R(8,100,224,24,12,'#e2e5e9')+g(222,112,DOTS,'#333')+ring(222,112)))},
  {t:'Válaszd a telepítést',d:'Koppints az <b>'+L.inst+'</b> vagy a <b>Hozzáadás a kezdőképernyőhöz</b> menüpontra.',s:S(R(100,topB?24:8,132,topB?96:92,8,'#fff','#ccc')+T(108,topB?42:26,'Új lap',8)+T(108,topB?58:42,'Könyvjelzők',8)+T(108,topB?74:58,L.inst,8,'#111')+T(108,topB?90:74,'Beállítások',8)+box(102,topB?62:46,128,18))},
  {t:'Erősítsd meg',d:'A felugró ablakban koppints a <b>Telepítés</b> (vagy <b>Hozzáadás</b>) gombra.',s:S(R(20,30,200,76,12,'#fff','#ccc')+'<image href="'+ICON+'" x="30" y="40" width="26" height="26"/>'+T(64,57,'Gondviselés Gyógyszertár',8)+R(150,80,60,20,10,BL)+T(180,94,'Telepítés',8,'#fff','middle')+ring(180,90))},
  {t:'Kész!',d:'Az alkalmazás ikonját a főképernyőn (vagy az alkalmazások között) találod.',s:HOME}];}
 var top=bar==='t',sx=top?216:118,sy=top?16:111;
 var bars=top?R(8,5,224,22,11,'#e2e5e9')+T(120,20,'11117.github.io',8,'#555','middle')+g(sx,16,SH)+R(0,106,240,24,0,'#e9ebee'):R(8,98,224,28,14,'#f7f7f9','#ccc')+g(40,112,'<path d="M3-6l-6 6 6 6"/>','#333')+g(118,111,SH)+g(160,112,'<path d="M-6-5h5a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2h-5zM6-5h-5"/>','#333')+R(194,104,12,12,3,'none','#333');
 var oy=top?30:14;
 return[{t:'Koppints a Megosztás ikonra',d:'A '+(top?'címsor jobb szélén':'böngésző alsó sávjában')+' lévő '+g(0,0,SH).replace('<g','<svg width="16" height="16" viewBox="-9 -10 18 20"><g').replace('</g>','</g></svg>')+' <b>'+L.share+'</b> ikon. Ha nem látod, nyisd meg előbb a <b>⋯</b> menüt.',s:S(bars+ring(sx,sy>20?sy:16))},
 {t:'Továbbiak megtekintése',d:'A megosztási panel alján, a műveletek sorának végén koppints a '+g(0,0,CHV,'#333').replace('<g','<svg width="16" height="14" viewBox="-8 -6 16 12"><g').replace('</g>','</g></svg>')+' <b>'+L.more+'</b> gombra.',s:S(R(14,oy-6,212,112,12,'#fff','#ccc')+[0,1,2].map(function(n){return C(44+n*56,oy+68,14,'#e3e6ea')+T(44+n*56,oy+96,['Másolás','Üzenetek','Mail'][n],7,'#555','middle')}).join('')+C(212,oy+68,14,'#e3e6ea')+g(212,oy+68,CHV,'#333')+ring(212,oy+68)+T(120,oy+14,'Gondviselés Gyógyszertár',8,'#111','middle'))},
 {t:'Főképernyőhöz adás',d:'A lista alján válaszd a '+g(0,0,PLUS,'#333').replace('<g','<svg width="16" height="16" viewBox="-8 -8 16 16"><g').replace('</g>','</g></svg>')+' <b>'+L.add+'</b> sort. Ha nem látod, görgess lejjebb.',s:S(R(14,8,212,114,12,'#fff','#ccc')+T(26,30,'Hozzáadás a könyvjelzőkhöz',8)+T(26,52,'Hozzáadás az olvasólistához',8)+T(26,74,'Keresés az oldalon',8)+g(204,70,'<path d="M-4-5h8v10h-8z"/>','#333')+T(26,100,L.add,8,'#111')+g(206,97,PLUS,'#333')+box(18,86,196,20))},
 {t:'Hozzáadás',d:'Hagyd bekapcsolva a <b>'+L.web+'</b> kapcsolót (iOS 26), majd koppints a jobb felső <b>'+L.addb+'</b> gombra.',s:S(R(14,6,212,118,12,'#fff','#ccc')+T(28,24,'Mégse',8,BL)+T(212,24,L.addb,8,BL,'end')+ring(196,21)+'<image href="'+ICON+'" x="28" y="36" width="30" height="30"/>'+T(66,56,'Gondviselés Gyógyszertár',8)+R(28,82,184,26,6,'#f2f3f5')+T(36,99,L.web,7.5)+R(170,87,32,16,8,'#34c759')+C(194,95,6,'#fff'))},
 {t:'Kész!',d:'Az alkalmazás ikonja megjelent a főképernyőn. Nyisd meg onnan!',s:HOME}];
}
// --- Felület ---
var pop=D.createElement('div');pop.className='ig-pop';pop.setAttribute('role','dialog');pop.innerHTML='<img src="'+ICON+'" alt=""><div><b>Töltse le alkalmazásunkat!</b><span>Gyorsabb elérés a főképernyőről.</span></div><button class="ig-btn" type="button">Letöltés</button><button class="ig-x" type="button" aria-label="Bezárás">&times;</button>';
var card=D.createElement('div');card.className='ig-card bot';card.setAttribute('role','dialog');card.setAttribute('aria-label','Telepítési útmutató');
var arr=D.createElement('div');arr.className='ig-arr';
D.body.appendChild(pop);D.body.appendChild(card);D.body.appendChild(arr);
var idx=0,auto=true,tm,jt,list=[],defer=null;
function dismiss(){pop.classList.remove('on');LS('pwaBannerDismissedAt',String(Date.now()))}
function stop(){auto=false;clearInterval(tm)}
function render(){
 var s=list[idx];
 card.innerHTML='<button class="ig-x" aria-label="Bezárás">&times;</button><div class="ig-row"><button class="ig-nav" aria-label="Előző">&#8249;</button><div class="ig-sl" aria-live="polite"><small>'+(idx+1)+' / '+list.length+'. lépés</small>'+s.s+'<h4>'+(idx+1)+'. '+s.t+'</h4><p>'+s.d+'</p></div><button class="ig-nav" aria-label="Következő">&#8250;</button></div><div class="ig-dots">'+list.map(function(_,n){return'<i class="'+(n===idx?'on':'')+'">'+(n+1)+'</i>'}).join('')+'</div>'+(iOS&&br!=='g'?'<a class="ig-alt" href="#">Nálad a címsor '+(bar==='t'?'lent':'fent')+' van? Váltás</a>':'');
 var b=card.querySelectorAll('.ig-nav');
 b[0].onclick=function(){stop();go(idx-1)};b[1].onclick=function(){stop();go(idx+1)};
 card.querySelector('.ig-x').onclick=close;
 var al=card.querySelector('.ig-alt');if(al)al.onclick=function(e){e.preventDefault();bar=bar==='t'?'b':'t';LS('igBar',bar);open()};
 arr.classList.toggle('on',idx===0&&card.classList.contains('on'));
}
function go(n){idx=(n+list.length)%list.length;render()}
function arrow(){ // nyíl a megfelelő gombra mutat (csak az 1. lépésnél)
 var up=AND?br!=='o':bar==='t';
 arr.textContent=up?'\u25B2':'\u25BC';arr.style.cssText=up?'top:2px;right:'+(AND?'10px':'22px'):'bottom:calc(2px + env(safe-area-inset-bottom,0px));'+(AND&&br==='o'?'right:10px':iOS?'left:46%':'left:50%');
}
function close(){clearInterval(tm);clearTimeout(jt);card.classList.remove('on');arr.classList.remove('on')}
function open(){
 pop.classList.remove('on');list=steps();idx=0;auto=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 var nav=D.querySelector('nav'),h=nav?nav.getBoundingClientRect().bottom:64;card.style.setProperty('--ig-top',Math.max(h,0)+'px');
 card.className='ig-card on bot';render();arrow();clearInterval(tm);clearTimeout(jt);
 tm=setInterval(function(){if(auto)go(idx+1)},5000);
 // alsó sávos böngészőnél a panel pár mp múlva a fejléc alá ugrik (hogy a Megosztás-panel ne takarja)
 if(iOS&&bar==='b'&&br!=='g')jt=setTimeout(function(){card.classList.replace('bot','top');arr.classList.add('on')},3500);
 card.addEventListener('pointerdown',stop,{once:true});
 var x0;card.ontouchstart=function(e){x0=e.touches[0].clientX};card.ontouchend=function(e){var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){stop();go(idx+(dx<0?1:-1))}};
}
pop.querySelector('.ig-x').onclick=dismiss;
pop.querySelector('.ig-btn').onclick=function(){
 if(defer){var p=defer;defer=null;pop.classList.remove('on');p.prompt();p.userChoice.then(function(c){if(c.outcome!=='accepted')open()})}else open()};
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();defer=e});
window.addEventListener('appinstalled',function(){pop.classList.remove('on');close();LS('pwaBannerDismissedAt',String(Date.now()))});
function consent(){try{var d=JSON.parse(localStorage.getItem('gyogyszertar_cookie_v2'));return!!(d&&d.ts&&Date.now()-d.ts<31536e6)}catch(e){return false}}
function reveal(){var t=parseInt(LS('pwaBannerDismissedAt')||'0',10);if(Date.now()-t<12096e5)return;setTimeout(function(){pop.classList.add('on')},1200)}
consent()?reveal():addEventListener('cookieConsentDecided',reveal,{once:true});
// hamburger menü gombja (a "Kapcsolat" alatt)
var mb=D.getElementById('pwa-menu-dl');
if(mb)mb.addEventListener('click',function(e){e.preventDefault();var c=D.getElementById('check');if(c)c.checked=false;open()});
if(/[?&]app=1/.test(location.search))setTimeout(open,600);
})();
