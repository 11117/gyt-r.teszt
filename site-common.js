/* Minden oldalon (web + PWA): két ujjas nagyítás engedélyezett, elengedéskor az oldal lágyan visszaáll az alap méretre */
(function(){
  var vv=window.visualViewport,meta=document.querySelector('meta[name="viewport"]');
  if(!vv||!meta)return;
  var orig=meta.getAttribute('content')||'width=device-width, initial-scale=1.0',busy=false,touches=0,idle=null,raf=0,DUR=650;
  var base=orig.replace(/,?\s*(maximum-scale|minimum-scale|user-scalable|initial-scale)\s*=\s*[^,]*/g,'')+', initial-scale=1.0';
  function setMeta(c,replace){
    if(replace){ // a meta elem cseréje: a Safari böngészőben ez megbízhatóbban újraszámolja a nagyítást
      var m=document.createElement('meta');m.name='viewport';m.content=c;
      if(meta.parentNode)meta.parentNode.replaceChild(m,meta);else document.head.appendChild(m);
      meta=m;
    }else meta.setAttribute('content',c);
  }
  function restore(){cancelAnimationFrame(raf);setMeta(orig,true);busy=false}
  function instant(){ // tartalék: azonnali visszaállítás, ha a böngésző a fokozatos lépéseket nem veszi figyelembe
    cancelAnimationFrame(raf);
    setMeta(base+', maximum-scale=1.0, minimum-scale=1.0, user-scalable=no',true);
    setTimeout(restore,220);
  }
  function reset(){
    if(busy||touches>0||vv.scale<=1.02)return;
    busy=true;
    var s0=vv.scale,t0=performance.now(),frames=0;
    function step(now){
      if(touches>0){restore();return}                       // ha újra hozzáér, megszakítjuk
      var t=Math.min(1,(now-t0)/DUR),e=1-Math.pow(1-t,4);  // lassuló (easeOutQuart) mozgás
      var sc=Math.max(1,s0-(s0-1)*e);
      setMeta(base+', maximum-scale='+sc.toFixed(3)+', minimum-scale=1.0',false);
      frames++;
      if(frames===5&&sc<s0-0.08&&vv.scale>s0-0.02){instant();return}   // a böngésző nem követi a lépéseket
      if(t<1)raf=requestAnimationFrame(step);
      else{setMeta(base+', maximum-scale=1.0, minimum-scale=1.0',false);setTimeout(restore,160)}
    }
    raf=requestAnimationFrame(step);
  }
  function lift(e){touches=e.touches?e.touches.length:0;if(touches===0)setTimeout(reset,120)}
  document.addEventListener('touchstart',function(e){touches=e.touches.length;if(busy)restore()},{passive:true});
  document.addEventListener('touchend',lift,{passive:true});
  document.addEventListener('touchcancel',lift,{passive:true});
  vv.addEventListener('resize',function(){clearTimeout(idle);if(touches===0&&!busy)idle=setTimeout(reset,500)});
})();
