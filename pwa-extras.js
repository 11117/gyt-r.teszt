(function(){
var D=document,ua=navigator.userAgent;
var iOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true))return; // csak telepített alkalmazásban (PWA)
var LS=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
var G='#2E7D32',G2='#4CAF50';
if(!LS('gyFirstRun'))LS('gyFirstRun',new Date().toISOString());

/* ---------- stílus ---------- */
var st=D.createElement('style');
st.textContent='footer{display:none!important}'+
'html,body{touch-action:manipulation}a,button,label,[role=button],.card,.answer,.opt,.game-filter{touch-action:manipulation;-webkit-tap-highlight-color:rgba(0,0,0,0)}.pwa-pill-nav,.pwa-pill-nav a{touch-action:pan-x}'+
'.pwa-settings-li{margin-top:18px!important;padding-top:14px;border-top:1px solid #333}.pwa-settings-li a{display:flex!important;align-items:center;justify-content:center;gap:9px}.pwa-settings-li svg{width:20px;height:20px}'+
'.pw-wrap{position:fixed;left:0;right:0;top:calc(60px + env(safe-area-inset-top,0px));bottom:0;z-index:9000;background:#f4f7f4;display:none;flex-direction:column;font-family:inherit;color:#1a1a1a}.pw-wrap.on{display:flex}'+
'.pw-head{flex:none;display:flex;align-items:center;gap:12px;background:#1a1a1a;color:#fff;padding:14px 16px;border-bottom:1px solid #333}.pw-head b{font-size:1.05rem;flex:1}.pw-back{border:0;background:#2a2a2a;color:#fff;width:38px;height:38px;border-radius:50%;font-size:1.3rem;line-height:1}'+
'.pw-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 16px calc(110px + env(safe-area-inset-bottom,0px))}.pw-page{display:none;max-width:560px;margin:0 auto}.pw-page.on{display:block}'+
'.pw-row{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;background:#fff;border:1px solid #e6ece6;border-radius:16px;padding:14px 16px;margin-bottom:12px;font:inherit;font-size:1rem;color:#1a1a1a;text-align:left;text-decoration:none;box-shadow:0 6px 16px rgba(0,0,0,.05)}'+
'.pw-ic{flex:none;width:40px;height:40px;border-radius:11px;background:#E8F5E9;color:'+G+';display:inline-flex;align-items:center;justify-content:center}.pw-ic svg{width:21px;height:21px}.pw-row span.t{flex:1;font-weight:600}.pw-row small{display:block;font-weight:400;color:#667;font-size:.8rem;margin-top:2px}.pw-chev{color:#9aa;font-size:1.2rem}'+
'.pw-card{background:#fff;border:1px solid #e6ece6;border-radius:16px;padding:18px;line-height:1.7;text-align:center;box-shadow:0 6px 16px rgba(0,0,0,.05)}.pw-card p{margin:0 0 8px}.pw-note{font-size:.78rem;color:#667;line-height:1.55;margin:6px 6px 0;text-align:center}.pw-sub{font-size:.8rem;font-weight:700;color:'+G+';text-transform:uppercase;letter-spacing:.05em;margin:4px 4px 10px}'+
'.pt-ov{position:fixed;inset:0;z-index:99900;touch-action:manipulation}.pt-spot{position:fixed;z-index:99901;border-radius:14px;box-shadow:0 0 0 100vmax rgba(0,0,0,.74);border:2px solid '+G2+';pointer-events:none;transition:all .3s}.pt-spot.none{border-color:transparent}'+
'.pt-arr{position:fixed;z-index:99902;font-size:34px;line-height:1;color:'+G2+';text-shadow:0 0 8px rgba(0,0,0,.6);pointer-events:none;animation:ptb .9s ease-in-out infinite}@keyframes ptb{50%{transform:translateY(var(--d,10px))}}'+
'.pt-bub{position:fixed;z-index:99903;left:50%;transform:translateX(-50%);width:min(88vw,340px);box-sizing:border-box;background:#fff;color:#1a1a1a;border-radius:16px;padding:14px 16px 12px;box-shadow:0 12px 34px rgba(0,0,0,.4);font:14px/1.45 inherit;font-family:inherit}'+
'.pt-bub h4{margin:0 0 4px;font-size:1rem;color:'+G+'}.pt-bub p{margin:0 0 12px}.pt-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.pt-n{font-size:.75rem;color:#889}.pt-next{border:0;border-radius:999px;background:'+G+';color:#fff;font-weight:700;font-size:.9rem;padding:9px 20px}.pt-skip{display:block;margin:10px auto 0;border:0;background:none;color:#778;font-size:.74rem;text-decoration:underline;padding:2px 6px}'+
'@media(prefers-reduced-motion:reduce){.pt-arr{animation:none}.pt-spot{transition:none}}';
D.head.appendChild(st);

/* ---------- biztonsági háló: beragadt görgetés oldása ---------- */
function newsOpen(){var n=D.getElementById('news-modal');return !!(n&&n.style.display==='block')}
function cookieVisible(){var n=D.getElementById('gyszt-notice'),s=D.getElementById('gyszt-settings-panel');return !!((n&&getComputedStyle(n).display!=='none')||(s&&getComputedStyle(s).display!=='none'))}
function unstick(){
 try{
  if(newsOpen()||cookieVisible())return;
  if(D.body.style.overflow==='hidden')D.body.style.overflow='';
  if(D.documentElement.style.overflow==='hidden')D.documentElement.style.overflow='';
  D.documentElement.classList.remove('gyszt-lock');
 }catch(e){}
}
addEventListener('pageshow',unstick);addEventListener('focus',unstick);
D.addEventListener('visibilitychange',function(){if(!D.hidden)unstick()});
D.addEventListener('touchstart',unstick,{passive:true,capture:true});
setInterval(unstick,3000);

/* ---------- iOS: elveszett koppintások pótlása ---------- */
if(iOS){
 var tx,ty,tt,tel,clicked=false;
 addEventListener('click',function(){clicked=true},true);
 D.addEventListener('touchstart',function(e){var t=e.touches[0];tx=t.clientX;ty=t.clientY;tt=Date.now();tel=e.target.closest&&e.target.closest('a[href],button,label,[role=button],.card,.answer,.opt,.game-filter,.pwa-pill-item')},{passive:true,capture:true});
 D.addEventListener('touchend',function(e){
  if(!tel)return;var t=e.changedTouches[0];
  if(Math.abs(t.clientX-tx)>10||Math.abs(t.clientY-ty)>10||Date.now()-tt>600)return;
  var el=tel;clicked=false;
  setTimeout(function(){if(!clicked&&D.contains(el))el.click()},400);
 },{passive:true,capture:true});
}

/* ---------- ikonok ---------- */
var GEAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
function ico(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var I={help:ico('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>'),
 legal:ico('<path d="M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
 info:ico('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
 tour:ico('<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3z"/><path d="M9 3v15M15 6v15"/>'),
 reload:ico('<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>'),
 doc:ico('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
 cookie:ico('<path d="M21 12a9 9 0 1 1-9-9 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3 3z"/><path d="M8.5 10h.01M12 15h.01M15.5 13h.01M9 15.5h.01"/>'),
 warn:ico('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>')};

/* ---------- Beállítások ---------- */
var wrap=null,pageStack=[];
function fmt(d){try{return new Date(d).toLocaleDateString('hu-HU',{year:'numeric',month:'long',day:'numeric'})}catch(e){return ''}}
function row(icon,title,sub,attrs){return '<'+(attrs&&attrs.href?'a':'button')+' type="button" class="pw-row" '+(attrs?Object.keys(attrs).map(function(k){return k+'="'+attrs[k]+'"'}).join(' '):'')+'><span class="pw-ic">'+icon+'</span><span class="t">'+title+(sub?'<small>'+sub+'</small>':'')+'</span><span class="pw-chev">›</span></'+(attrs&&attrs.href?'a':'button')+'>'}
function build(){
 wrap=D.createElement('div');wrap.className='pw-wrap';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-label','Beállítások');
 var y=new Date().getFullYear();
 wrap.innerHTML='<div class="pw-head"><button type="button" class="pw-back" aria-label="Vissza">‹</button><b class="pw-title">Beállítások</b></div><div class="pw-body">'+
 '<div class="pw-page on" data-t="Beállítások" data-id="root">'+
  row(I.help,'Súgó','Útmutató és frissítés',{'data-go':'help'})+
  row(I.legal,'Adatvédelem és jogi tudnivalók','Impresszum, süti-beállítások',{'data-go':'legal'})+
  row(I.info,'Az alkalmazásról','Készítő, jogok, dátumok',{'data-go':'about'})+
 '</div>'+
 '<div class="pw-page" data-t="Súgó" data-id="help">'+
  row(I.tour,'Rövid útmutató – Mit hol talál?','Az alkalmazás bemutatása újra',{'data-act':'tour'})+
  row(I.reload,'Oldal frissítése','Az oldal újratöltése',{'data-act':'reload'})+
 '</div>'+
 '<div class="pw-page" data-t="Adatvédelem és jog" data-id="legal">'+
  row(I.doc,'Impresszum','',{href:'impresszum.html'})+
  row(I.doc,'Adatkezelési és süti tájékoztató','',{href:'adatkezeles.html'})+
  row(I.cookie,'Sütibeállítások','Külső tartalmak engedélyezése',{'data-act':'cookie'})+
  '<div class="pw-sub" style="margin-top:18px">Fontos tudnivaló</div><div class="pw-card" style="font-size:.85rem;color:#556">Az oldalon megjelenő információk tájékoztató jellegűek.<br>A gyógyszerek kockázatairól és mellékhatásairól olvassa el a betegtájékoztatót, vagy kérdezze meg kezelőorvosát, gyógyszerészét!</div>'+
 '</div>'+
 '<div class="pw-page" data-t="Az alkalmazásról" data-id="about"><div class="pw-card">'+
  '<p style="font-weight:700;font-size:1.05rem">Gondviselés Gyógyszertár Orgovány</p>'+
  '<p>Készítette: <span style="color:'+G+';font-weight:600">Vetési Ábel Márk</span></p>'+
  '<p>&copy; 2026-'+y+' Minden jog fenntartva.</p>'+
  '<p style="margin-top:14px;font-size:.88rem;color:#556">Első megnyitás: <b>'+fmt(LS('gyFirstRun'))+'</b><br>Mai dátum: <b>'+fmt(new Date())+'</b></p>'+
 '</div></div></div>';
 D.body.appendChild(wrap);
 wrap.addEventListener('click',function(e){
  var b=e.target.closest('.pw-row,.pw-back');if(!b)return;
  if(b.classList.contains('pw-back')){back();return}
  var go=b.getAttribute('data-go'),act=b.getAttribute('data-act');
  if(go)page(go);
  else if(act==='tour'){closeSettings();startTour(true)}
  else if(act==='reload')location.reload();
  else if(act==='cookie'&&typeof openCookieSettings==='function')openCookieSettings();
 });
}
function page(id){
 var ps=wrap.querySelectorAll('.pw-page'),i;
 for(i=0;i<ps.length;i++){var on=ps[i].getAttribute('data-id')===id;ps[i].classList.toggle('on',on);if(on)wrap.querySelector('.pw-title').textContent=ps[i].getAttribute('data-t')}
 wrap.querySelector('.pw-body').scrollTop=0;
 if(id==='root')pageStack=[];else pageStack=['root'];
}
function back(){if(pageStack.length)page('root');else closeSettings()}
function openSettings(){
 if(!wrap)build();
 var ck=D.getElementById('check');if(ck)ck.checked=false;
 page('root');wrap.classList.add('on');
}
function closeSettings(){if(wrap)wrap.classList.remove('on')}
function addMenuItem(){
 var ul=D.querySelector('.nav-links');if(!ul||D.getElementById('pwa-settings-btn'))return;
 var li=D.createElement('li');li.className='pwa-settings-li';
 li.innerHTML='<a href="javascript:void(0)" id="pwa-settings-btn">'+GEAR+'<span>Beállítások</span></a>';
 ul.appendChild(li);
 li.firstChild.addEventListener('click',function(e){e.preventDefault();openSettings()});
}
addMenuItem();
// a főmenü bármely másik elemére koppintva a beállítások lap bezárul
D.querySelectorAll('.nav-links a').forEach(function(a){if(a.id!=='pwa-settings-btn')a.addEventListener('click',closeSettings)});
D.querySelectorAll('.pwa-pill-item').forEach(function(a){a.addEventListener('click',closeSettings)});

/* ---------- Rövid útmutató: Mit hol talál? ---------- */
var tour=null;
function steps(){
 var S=[{t:'Rövid útmutató',d:'Mit hol talál az alkalmazásban? Koppintson a képernyőre vagy a Tovább gombra, és végigvezetjük.',menu:0},
 {sel:'.menu-toggle',t:'Főmenü',d:'Itt nyílik a menü – nézzük meg, mi található benne.',menu:0}];
 [['a[href="#akciok-szekcio"]','Akcióink','Az aktuális akciós termékek.'],
  ['a[href="#szolgaltatasok"]','Szolgáltatások','Mit nyújt gyógyszertárunk, fizetési lehetőségek.'],
  ['#news-menu-btn','Híreink','Fontos hírek és közlemények.'],
  ['a[href="#jatekok"]','Ismeretterjesztő játékok','Egészségügyi kvíz, labirintus, napi kihívás, színezők.'],
  ['.nav-links a[href="web-gyogyszeresz.html"]','Web gyógyszerész','Panaszkereső, receptek és egészségügyi tudnivalók.'],
  ['.nav-links a[href="#nyitvatartas"]','Nyitvatartás','Mikor várjuk Önt.'],
  ['.nav-links a[href="#terkep-szekcio"]','Térkép','Hol talál meg minket.'],
  ['.nav-links a[href="#kapcsolat"]','Kapcsolat','Telefon, e-mail és elérhetőségek.'],
  ['#pwa-settings-btn','Beállítások','Jogi tudnivalók, süti-beállítások, az alkalmazásról – és ez az útmutató újra.']
 ].forEach(function(a){S.push({sel:a[0].indexOf('.nav-links')===0?a[0]:'.nav-links '+a[0],range:1,t:a[1],d:a[2],menu:1})});
 S.push({sel:'#pwa-pill-nav',t:'Gyorsnavigáció',d:'Az alsó sávval egy koppintással a fő részekre ugorhat.',menu:0});
 S.push({sel:'.quick-phone',t:'Hívás',d:'Ezzel a gombbal azonnal felhívhatja gyógyszertárunkat.',menu:0});
 S.push({sel:'.nav-refresh-btn',t:'Frissítés',d:'Ha valami nem tölt be, itt újratöltheti az oldalt.',menu:0});
 S.push({t:'Készen is vagyunk!',d:'Az útmutatót a Beállítások menüben bármikor újra megnézheti.',menu:0,last:1});
 return S;
}
function endTour(done){
 if(!tour)return;
 if(done!==false)LS('gyTourDone','1');
 tour.ov.remove();tour=null;
 var ck=D.getElementById('check');if(ck)ck.checked=false;
 removeEventListener('resize',place);
}
function place(){
 if(!tour)return;
 var s=tour.list[tour.i],spot=tour.spot,bub=tour.bub,arr=tour.arr,vw=innerWidth,vh=innerHeight;
 var el=s.sel?D.querySelector(s.sel):null,r=null;
 if(el){
  if(s.range){var rg=D.createRange();rg.selectNodeContents(el);r=rg.getBoundingClientRect()}
  else r=el.getBoundingClientRect();
  if(!r||(!r.width&&!r.height))r=el.getBoundingClientRect();
 }
 var last=s.last,n=tour.list.length;
 bub.innerHTML='<h4>'+s.t+'</h4><p>'+s.d+'</p><div class="pt-row"><span class="pt-n">'+(tour.i+1)+' / '+n+'</span><button type="button" class="pt-next">'+(last?'Kész':'Tovább')+'</button></div>'+(last?'':'<button type="button" class="pt-skip">Útmutató kihagyása</button>');
 if(!r){
  spot.className='pt-spot none';spot.style.cssText='left:'+(vw/2)+'px;top:'+(vh/2)+'px;width:0;height:0';
  arr.style.display='none';bub.style.top=Math.round(vh/2-70)+'px';bub.style.bottom='auto';
 }else{
  var pad=s.range?12:6;
  spot.className='pt-spot';
  spot.style.cssText='left:'+(r.left-pad)+'px;top:'+(r.top-pad+2)+'px;width:'+(r.width+2*pad)+'px;height:'+(r.height+2*pad-4)+'px';
  var below=(r.top+r.bottom)/2<vh/2;
  arr.style.display='block';arr.textContent=below?'\u25B2':'\u25BC';
  arr.style.setProperty('--d',below?'-10px':'10px');
  arr.style.left=Math.max(8,Math.min(vw-40,(r.left+r.right)/2-14))+'px';
  if(below){arr.style.top=(r.bottom+pad+2)+'px';arr.style.bottom='auto';bub.style.top=(r.bottom+pad+40)+'px';bub.style.bottom='auto'}
  else{arr.style.bottom=(vh-r.top+pad+2)+'px';arr.style.top='auto';bub.style.bottom=(vh-r.top+pad+40)+'px';bub.style.top='auto'}
 }
}
function show(){
 var s=tour.list[tour.i],ck=D.getElementById('check'),want=!!s.menu,delay=0;
 if(ck&&ck.checked!==want){ck.checked=want;delay=460}
 if(!want&&wrap)closeSettings();
 setTimeout(place,delay);
}
function next(){if(!tour)return;if(tour.list[tour.i].last){endTour();return}tour.i++;show()}
function startTour(force){
 if(tour)return;
 if(!force&&LS('gyTourDone'))return;
 var ov=D.createElement('div');ov.className='pt-ov';
 var spot=D.createElement('div'),arr=D.createElement('div'),bub=D.createElement('div');
 spot.className='pt-spot none';arr.className='pt-arr';bub.className='pt-bub';
 ov.appendChild(spot);ov.appendChild(arr);ov.appendChild(bub);D.body.appendChild(ov);
 tour={ov:ov,spot:spot,arr:arr,bub:bub,list:steps(),i:0};
 ov.addEventListener('click',function(e){
  if(e.target.closest('.pt-skip')){endTour();return}
  next();
 });
 addEventListener('resize',place);
 show();
}
function consentOk(){try{var d=JSON.parse(localStorage.getItem('gyogyszertar_cookie_v2'));return!!(d&&d.ts)}catch(e){return false}}
function maybeStart(){if(LS('gyTourDone'))return;setTimeout(function(){startTour(false)},1200)}
if(consentOk())maybeStart();else{addEventListener('cookieConsentDecided',maybeStart,{once:true});D.addEventListener('cookieConsentDecided',maybeStart,{once:true})}
})();
