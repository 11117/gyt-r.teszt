/* Minden oldalon (web + PWA): két ujjas nagyítás engedélyezett, de elengedéskor az oldal visszaáll az alap méretre */
(function(){
  var vv=window.visualViewport,meta=document.querySelector('meta[name="viewport"]');
  if(!vv||!meta)return;
  var orig=meta.getAttribute('content')||'width=device-width, initial-scale=1.0',busy=false,touches=0,idle=null;
  function reset(){
    if(busy||touches>0||vv.scale<=1.02)return;
    busy=true;
    var base=orig.replace(/,?\s*(maximum-scale|minimum-scale|user-scalable)\s*=\s*[^,]*/g,'');
    meta.setAttribute('content',base+', maximum-scale=1.0, minimum-scale=1.0');
    setTimeout(function(){meta.setAttribute('content',orig);busy=false},150);
  }
  function lift(e){touches=e.touches?e.touches.length:0;if(touches===0)setTimeout(reset,60)}
  document.addEventListener('touchstart',function(e){touches=e.touches.length},{passive:true});
  document.addEventListener('touchend',lift,{passive:true});
  document.addEventListener('touchcancel',lift,{passive:true});
  vv.addEventListener('resize',function(){clearTimeout(idle);if(touches===0)idle=setTimeout(reset,450)});
})();
