/* Minden oldalon (web + PWA): két ujjas nagyítás engedélyezett, elengedéskor az oldal lágyan visszaáll az alap méretre */
(function(){
  var vv=window.visualViewport,meta=document.querySelector('meta[name="viewport"]');
  if(!vv||!meta)return;
  var orig=meta.getAttribute('content')||'width=device-width, initial-scale=1.0',busy=false,touches=0,idle=null,raf=0,DUR=650;
  var base=orig.replace(/,?\s*(maximum-scale|minimum-scale|user-scalable)\s*=\s*[^,]*/g,'');
  function restore(){cancelAnimationFrame(raf);meta.setAttribute('content',orig);busy=false}
  function reset(){
    if(busy||touches>0||vv.scale<=1.02)return;
    busy=true;
    var s0=vv.scale,t0=performance.now();
    function step(now){
      if(touches>0){restore();return}                       // ha újra hozzáér, megszakítjuk
      var t=Math.min(1,(now-t0)/DUR),e=1-Math.pow(1-t,4);  // lassuló (easeOutQuart) mozgás
      var sc=Math.max(1,s0-(s0-1)*e);
      meta.setAttribute('content',base+', maximum-scale='+sc.toFixed(3)+', minimum-scale=1.0');
      if(t<1)raf=requestAnimationFrame(step);
      else{meta.setAttribute('content',base+', maximum-scale=1.0, minimum-scale=1.0');setTimeout(restore,160)}
    }
    raf=requestAnimationFrame(step);
  }
  function lift(e){touches=e.touches?e.touches.length:0;if(touches===0)setTimeout(reset,120)}
  document.addEventListener('touchstart',function(e){touches=e.touches.length;if(busy)restore()},{passive:true});
  document.addEventListener('touchend',lift,{passive:true});
  document.addEventListener('touchcancel',lift,{passive:true});
  vv.addEventListener('resize',function(){clearTimeout(idle);if(touches===0&&!busy)idle=setTimeout(reset,500)});
})();
