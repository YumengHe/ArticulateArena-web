// Independent guides across the Overview and Core Concepts Explore views.
(() => {
  'use strict';
  const root=document.querySelector('.aa-learning');
  if (!root) return;
  const el=id=>root.querySelector('#'+id);
  const ns='http://www.w3.org/2000/svg';
  const C={ink:'var(--aa-ink)',muted:'var(--aa-muted)',line:'var(--aa-line)',paper:'var(--aa-paper)',surface:'var(--aa-surface)',blue:'var(--aa-blue)',soft:'var(--aa-blue-soft)',pale:'var(--aa-blue-pale)',amber:'var(--aa-amber)',amberSoft:'var(--aa-amber-soft)',frame:'var(--aa-frame)',top:'var(--aa-frame-top)',quiet:'var(--aa-quiet)'};
  const state={part:'drawer',introMotion:.32,edit:0};
  let animation=0,playing='';
  function add(parent,tag,attrs={},text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;parent.appendChild(n);return n;}
  function setup(id,h){const s=el(id);const w=Math.max(210,s.getBoundingClientRect().width||280);s.setAttribute('viewBox',`0 0 ${w} ${h}`);s.replaceChildren();return [s,w];}
  function line(s,x1,y1,x2,y2,stroke=C.line,width=1,extra={}){return add(s,'line',{x1,y1,x2,y2,stroke,'stroke-width':width,...extra});}
  function label(s,x,y,text,anchor='start',extra={}){return add(s,'text',{x,y,'text-anchor':anchor,...extra},text);}
  function poly(s,points,fill,stroke=C.line,extra={}){return add(s,'polygon',{points:points.map(p=>p.join(',')).join(' '),fill,stroke,'stroke-width':1.4,'stroke-linejoin':'round',...extra});}
  function arrow(s,x1,y1,x2,y2,color=C.ink,width=1.5){line(s,x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1),len=6;poly(s,[[x2,y2],[x2-len*Math.cos(a-.5),y2-len*Math.sin(a-.5)],[x2-len*Math.cos(a+.5),y2-len*Math.sin(a+.5)]],color,color,{'stroke-width':.5});}
  const fmt=n=>Math.abs(n)<1e-8?'0':Number(n.toFixed(1)).toString();
  const partText={body:['Body','The fixed base in this example. Other parts move relative to it.'],drawer:['Drawer','Slides relative to the body. The latch comes along because it is attached to the drawer.'],door:['Door','Rotates relative to the body around its hinge line. One angle sets its opening.'],latch:['Latch','Turns relative to the drawer. It also travels with the drawer when the drawer slides.']};
  function drawCabinet(){
    const [s,w]=setup('aa-cabinet',270);const k=Math.min((w-44)/3.4,78),ox=(w-2.9*k)/2+.42*k,base=233;
    const p=(u,v,z)=>[ox+k*(u+.65*v),base-k*(z-.32*v)];
    const part=state.part,t=state.introMotion;
    const opening=part==='drawer'?t*.95:.30;
    const angle=(part==='door'?t*62:12)*Math.PI/180;
    function face(pts,fill,name,stroke){return poly(s,pts.map(v=>p(...v)),fill,stroke||C.line,{'data-part':name,'stroke-width':name===part?2.3:1.2});}
    const bodyFill=part==='body'?C.soft:C.frame;
    face([[0,0,0],[0,-.7,0],[0,-.7,2.4],[0,0,2.4]],bodyFill,'body',part==='body'?C.blue:C.quiet);
    face([[0,0,2.4],[0,-.7,2.4],[2.4,-.7,2.4],[2.4,0,2.4]],part==='body'?C.pale:C.top,'body',part==='body'?C.blue:C.quiet);
    face([[0,0,0],[2.4,0,0],[2.4,0,2.4],[0,0,2.4]],bodyFill,'body',part==='body'?C.blue:C.quiet);
    face([[.13,.01,.14],[2.27,.01,.14],[2.27,.01,1.5],[.13,.01,1.5]],C.paper,'body');
    face([[.13,.01,1.65],[2.27,.01,1.65],[2.27,.01,2.18],[.13,.01,2.18]],C.paper,'body');
    const du=2.1*Math.cos(angle),dv=2.1*Math.sin(angle),doorFill=part==='door'?C.soft:C.top;
    face([[.14,.03,.15],[.14+du,dv+.03,.15],[.14+du,dv+.03,1.49],[.14,.03,1.49]],doorFill,'door',part==='door'?C.blue:C.quiet);
    const hp=p(.14+du*.91,.03+dv*.91,.8);add(s,'circle',{cx:hp[0],cy:hp[1],r:3.5,fill:C.ink,'data-part':'door'});
    for(const z of [.42,1.22]){const hp2=p(.14,.03,z);add(s,'rect',{x:hp2[0]-2.5,y:hp2[1]-5,width:5,height:10,rx:1,fill:C.quiet,'data-part':'door'});}
    face([[.14,opening-.6,2.17],[2.26,opening-.6,2.17],[2.26,opening,2.17],[.14,opening,2.17]],C.pale,'drawer',part==='drawer'?C.blue:C.quiet);
    face([[2.26,opening-.6,1.65],[2.26,opening,1.65],[2.26,opening,2.17],[2.26,opening-.6,2.17]],C.soft,'drawer',part==='drawer'?C.blue:C.quiet);
    face([[.14,opening,1.65],[2.26,opening,1.65],[2.26,opening,2.17],[.14,opening,2.17]],part==='drawer'?C.soft:C.top,'drawer',part==='drawer'?C.blue:C.quiet);
    const lp=p(1.19,opening+.01,1.9),la=(part==='latch'?t*15:0)*Math.PI/180;
    add(s,'circle',{cx:lp[0],cy:lp[1],r:8,fill:part==='latch'?C.soft:C.paper,stroke:part==='latch'?C.blue:C.quiet,'stroke-width':1.5,'data-part':'latch'});
    line(s,lp[0]-10*Math.cos(la),lp[1]-10*Math.sin(la),lp[0]+10*Math.cos(la),lp[1]+10*Math.sin(la),part==='latch'?C.blue:C.ink,4,{'stroke-linecap':'round','data-part':'latch'});
    line(s,...p(.2,0,0),...p(.2,0,-.12),C.quiet,5);line(s,...p(2.2,0,0),...p(2.2,0,-.12),C.quiet,5);
    label(s,w/2,263,'Drawer + door + turning latch','middle');
  }
  function introTree(){const [s,w]=setup('aa-intro-tree',270),x=w/2,l=w*.22,r=w*.78;line(s,x,48,l,111,state.part==='door'?C.blue:C.line,2);line(s,x,48,r,111,state.part==='drawer'?C.blue:C.line,2);line(s,r,153,r,219,state.part==='latch'?C.blue:C.line,2);label(s,l,80,'hinge','middle');label(s,r,80,'slide','middle');label(s,r-12,190,'turn','end');}
  function drawIntro(){drawCabinet();introTree();const [name,copy]=partText[state.part];el('aa-part-name').textContent=name;el('aa-part-copy').textContent=copy;root.querySelectorAll('[data-node]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.node===state.part)));el('aa-play-part').disabled=state.part==='body';el('aa-play-part').textContent=playing==='part'?'Pause motion':state.part==='body'?'Body stays fixed':`Play ${state.part} motion`;}
  function drawerScene(id,cm,{height=238,latch=false,attached=true,pred=false,full=true}={}){
    // Keep part of the drawer inside the cabinet throughout its allowed travel.
    const [s,w]=setup(id,height),left=15,bodyW=(w-30)*.55,drawerW=bodyW-13,closedFront=left+8+drawerW,travel=w-35-closedFront,x=left+8+travel*cm/50,front=x+drawerW;
    const y=full?66:28,h=full?88:66;
    add(s,'rect',{x:left,y:y-16,width:bodyW+10,height:h+35,rx:3,fill:C.frame,stroke:C.quiet,'stroke-width':1.3});
    add(s,'rect',{x:left+8,y,width:drawerW,height:h,fill:C.paper,stroke:C.quiet,'stroke-dasharray':'4 4'});
    poly(s,[[x,y],[x+9,y-9],[front+9,y-9],[front,y]],pred?C.amberSoft:C.pale,pred?C.amber:C.blue);
    add(s,'rect',{x,y,width:drawerW,height:h,fill:pred?C.amberSoft:C.soft,stroke:pred?C.amber:C.blue,'stroke-width':1.4});
    poly(s,[[front,y],[front+9,y-9],[front+9,y+h-9],[front,y+h]],pred?C.amber:C.blue,pred?C.amber:C.blue);
    if(latch){const lx=attached?front-10:closedFront-10,ly=y+h*.45;add(s,'circle',{cx:lx,cy:ly,r:9,fill:C.paper,stroke:pred?C.amber:C.blue,'stroke-width':2,'data-latch':'true'});line(s,lx-8,ly,lx+8,ly,C.ink,3,{'stroke-linecap':'round'});line(s,lx,ly+12,lx,height-29,C.quiet,1,{'stroke-dasharray':'3 3'});label(s,Math.min(w-5,Math.max(30,lx)),height-12,'latch','middle');}
    if(full){
      label(s,17,25,'Fixed cabinet');arrow(s,w*.58,24,w-23,24,C.ink);label(s,w*.79,44,'+ direction','middle');
      const gy=height-43;line(s,closedFront,gy,w-35,gy,C.line,2);line(s,closedFront,gy,front,gy,C.blue,3);add(s,'circle',{cx:front,cy:gy,r:4,fill:C.blue,'data-q-marker':'true'});line(s,closedFront,gy-7,closedFront,gy+7,C.quiet);line(s,w-35,gy-7,w-35,gy+7,C.quiet);
      label(s,closedFront,gy+26,'0','middle');label(s,w-35,gy+26,'50 cm','end');
      label(s,17,height-6,'Fixed travel limits · only q changes');
    }
  }
  function drawQ(){const cm=Number(el('aa-q').value),m=(cm/100).toFixed(2);drawerScene('aa-q-scene',cm);el('aa-q-value').textContent=`${cm} cm · ${m} m`;el('aa-q-equation').textContent=`${m} × (1, 0, 0) = (${m}, 0, 0) m`;el('aa-q').setAttribute('aria-valuetext',`${cm} centimeters open`);el('aa-q-play').textContent=playing==='q'?'Pause motion':'Play open → close';}
  function candidates(cm,reversed){const ref=[0,50],pred=reversed?[cm,0]:[0,cm];const a=[Math.abs(ref[0]-pred[0]),Math.abs(ref[1]-pred[1])],b=[Math.abs(ref[0]-pred[1]),Math.abs(ref[1]-pred[0])];return {a,b,direct:Math.hypot(...a),swapped:Math.hypot(...b)};}
  function matchingScene(id,cm,reversed,swapped,wins){const [s,w]=setup(id,196),x=v=>29+(w-58)*v/60,y1=52,y2=145;
    const ref=[0,50],pred=reversed?[cm,0]:[0,cm];
    for(let i=0;i<2;i++){const j=swapped?1-i:i;line(s,x(ref[i]),y1,x(pred[j]),y2,wins?C.ink:C.quiet,wins?1.7:1.1,{'stroke-dasharray':wins?'none':'5 4'});}
    line(s,x(0),y1,x(50),y1,C.blue,5,{'stroke-linecap':'round'});line(s,x(0),y2,x(cm),y2,C.amber,5,{'stroke-linecap':'round'});
    for(let i=0;i<2;i++){add(s,'circle',{cx:x(ref[i]),cy:y1,r:5,fill:C.blue,stroke:C.paper,'stroke-width':2});label(s,x(ref[i]),y1-18,`z${i?'⁺':'⁻'} = ${ref[i]}`,'middle');add(s,'circle',{cx:x(pred[i]),cy:y2,r:5,fill:C.amber,stroke:C.paper,'stroke-width':2});label(s,x(pred[i]),y2+27,`z${i?'⁺':'⁻'} = ${pred[i]}`,'middle');}
  }
  function drawMatch(){const cm=Number(el('aa-pred-range').value),reversed=el('aa-reverse').checked,{a,b,direct,swapped}=candidates(cm,reversed),value=Math.min(direct,swapped),directWins=direct<=swapped;
    el('aa-pred-value').textContent=`${cm} cm`;el('aa-pred-range').setAttribute('aria-valuetext',`${cm} centimeters maximum opening`);el('aa-encoding').textContent=`Prediction: positive direction ${reversed?'←':'→'} · coordinate limits ${reversed?`[−${cm}, 0]`:`[0, ${cm}]`} cm`;
    matchingScene('aa-direct-scene',cm,reversed,false,directWins);matchingScene('aa-swapped-scene',cm,reversed,true,!directWins);
    el('aa-direct-value').textContent=fmt(direct)+' cm';el('aa-swapped-value').textContent=fmt(swapped)+' cm';el('aa-direct-calc').textContent=`√(${fmt(a[0])}² + ${fmt(a[1])}²)`;el('aa-swapped-calc').textContent=`√(${fmt(b[0])}² + ${fmt(b[1])}²)`;el('aa-direct-win').textContent=directWins?'SMALLER CANDIDATE':'Higher candidate';el('aa-swapped-win').textContent=directWins?'Higher candidate':'SMALLER CANDIDATE';el('aa-final-match').textContent=`E_B = ${fmt(value)} cm`;
    el('aa-match-takeaway').textContent=(cm===50?'The two descriptions allow exactly the same movement.':cm<50?`The prediction stops ${50-cm} cm short.`:`The prediction allows ${cm-50} cm too much travel.`)+` ${directWins?'Direct':'Swapped'} pairing wins.`;
  }
  function drawNorm(){const width=Number(el('aa-door-width').value)/100,delta=Math.PI/12,body=delta*width/Math.sqrt(3),[s,w]=setup('aa-norm-scene',250),maxLen=Math.min(177,w*.66),px=w/2-maxLen*.28,py=209,len=maxLen*width/1.2,t1=Math.PI/3,t2=5*Math.PI/12;
    const point=(r,t)=>[px+r*Math.cos(t),py-r*Math.sin(t)];
    line(s,px,py,px+maxLen,py,C.quiet,1,{'stroke-dasharray':'4 4'});label(s,px+maxLen,py+22,'Closed · 0°','end');
    for(const [angle,color] of [[t1,C.blue],[t2,C.amber]]){const p=point(len,angle);line(s,px,py,p[0],p[1],color,5,{'stroke-linecap':'round'});}
    for(const f of [.2,.4,.6,.8,1]){const a=point(len*f,t1),b=point(len*f,t2);line(s,...a,...b,C.ink,1);add(s,'circle',{cx:a[0],cy:a[1],r:3,fill:C.blue});add(s,'circle',{cx:b[0],cy:b[1],r:3,fill:C.amber});}
    add(s,'circle',{cx:px,cy:py,r:6,fill:C.paper,stroke:C.ink,'stroke-width':2});label(s,px-9,py-4,'Hinge','end');
    const end=point(len,t1),end2=point(len,t2);label(s,end[0]+11,end[1]+5,'60°');label(s,end2[0]-9,end2[1]-12,'75°','end');
    label(s,w-5,24,'Angle error: 15°','end');label(s,w-5,44,'W = '+width.toFixed(2)+' m','end');
    el('aa-width-value').textContent=width.toFixed(2)+' m';el('aa-door-width').setAttribute('aria-valuetext',`${Math.round(width*100)} centimeters wide`);el('aa-split-value').textContent=delta.toFixed(3);el('aa-body-value').textContent=body.toFixed(3);el('aa-body-note').textContent=`About ${(body*100).toFixed(1)} cm of RMS linearized discrepancy. Double the width → double this score.`;
  }
  const latchCost=Math.PI/12;
  function treeDiagram(id,stage,reference){const [s,w]=setup(id,226),narrow=w<265;
    let nodes,edges;
    if(stage===0&&!reference){nodes={body:[w*.5,35],door:[w*.19,177],drawer:[w*.5,177],latch:[w*.81,177]};edges=[['body','door','hinge'],['body','drawer','slide'],['body','latch','turn']];}
    else {nodes={body:[w*.5,29],door:[w*.20,113],drawer:[w*.79,113]};edges=[['body','door','hinge'],['body','drawer','slide']];if(stage!==1||reference){nodes.latch=[w*.79,203];edges.push(['drawer','latch','turn']);}}
    for(const [a,b,name] of edges){const p=nodes[a],q=nodes[b],color=reference?C.blue:C.amber;line(s,...p,...q,color,1.6);const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;const vertical=Math.abs(p[0]-q[0])<3;label(s,mx+(vertical?12:0),my+(vertical&&name==='slide'?27:vertical?0:-8),name,vertical?'start':'middle');}
    for(const [name,[x,y]] of Object.entries(nodes)){const tw=(name==='body'&&stage===1&&!reference)?108:narrow?54:66;
      add(s,'rect',{x:x-tw/2,y:y-16,width:tw,height:32,rx:6,fill:C.paper,stroke:C.line});label(s,x,y+4,name==='body'&&stage===1&&!reference?'Body + latch':name[0].toUpperCase()+name.slice(1),'middle');}
  }
  function drawTree(){const cm=Number(el('aa-tree-q').value),stage=state.edit;el('aa-tree-q-value').textContent=cm+' cm';el('aa-tree-q').setAttribute('aria-valuetext',`${cm} centimeters open`);
    drawerScene('aa-tree-ref-cab',cm,{height:156,latch:true,attached:true,full:false});drawerScene('aa-tree-pred-cab',cm,{height:156,latch:true,attached:stage===2,pred:true,full:false});treeDiagram('aa-tree-ref',2,true);treeDiagram('aa-tree-pred',stage,false);
    el('aa-tree-pred-title').textContent=['Original prediction','After contraction','Repaired prediction'][stage];el('aa-tree-pred-sub').textContent=['Latch on body','Body + latch merged','Latch on drawer'][stage];
    el('aa-tree-score').textContent=((2-stage)*latchCost).toFixed(3);
    el('aa-tree-score-note').textContent=['The latch is attached to the wrong part. Two edits are needed to match the reference.','The incorrect joint is gone. One expansion is still needed to attach the latch to the drawer.','The repaired tree matches the reference. No error remains.'][stage];
    el('aa-tree-joint-score').textContent=(stage===1?latchCost:0).toFixed(3);
    el('aa-tree-joint-note').textContent=['All three joint descriptions match. Ignoring connections misses the misplaced latch.',`The current prediction is missing the latch joint. Its joint-list difference from the reference is ${latchCost.toFixed(3)}.`,'All three joint descriptions match, and their connections are now correct too.'][stage];
    el('aa-tree-pose-note').textContent=stage===2?'The repaired latch follows the drawer, just as in the reference. Both tree errors stay zero at every opening.':cm===0?'At 0 cm, both objects look the same. Pull the drawers open: the reference latch moves with the drawer, while the predicted latch stays with the body. The scores compare their motion and connections, not this single pose.':'The reference latch follows the drawer. The predicted latch stays with the body. The slider changes the displayed pose; the scores compare the allowed motion and connections.';
    el('aa-edit-original').textContent=(2*latchCost).toFixed(3);
    el('aa-edit-copy').textContent=[`The latch is connected to the body. Its joint parameters are correct; the connection is not.`,`Contract the body–latch joint. The two nodes merge into one fixed unit. Cost: Eα(Jlatch, J₀) = ${latchCost.toFixed(3)}.`,`Expand the drawer node, creating the latch and its turning joint. It now follows the drawer. This edit costs ${latchCost.toFixed(3)}; the repaired tree has zero remaining error. The original prediction’s tree error was ${(2*latchCost).toFixed(3)}, the total cost of the two edits.`][stage];
    el('aa-edit-paid').textContent=(stage*latchCost).toFixed(3);el('aa-edit-remaining').textContent=((2-stage)*latchCost).toFixed(3);root.querySelectorAll('[data-edit]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.edit)===stage)));
  }
  function redraw(){[drawIntro,drawQ,drawMatch,drawNorm,drawTree].forEach((draw,i)=>{if(el('aa-panel-'+(i+1))?.getBoundingClientRect().width)draw();});}
  function stop(){if(animation)cancelAnimationFrame(animation);animation=0;playing='';}
  function run(which){if(playing===which){stop();redraw();return;}stop();const reduce=globalThis.matchMedia&&globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce){if(which==='q')el('aa-q').value=Number(el('aa-q').value)<25?'50':'0';else state.introMotion=state.introMotion<.5?1:0;redraw();return;}playing=which;const start=performance.now(),duration=3000,initial=which==='q'?Number(el('aa-q').value)/50:state.introMotion;function tick(now){const t=Math.min(1,(now-start)/duration),movement=t<.5?initial+(1-initial)*(1-Math.cos(2*Math.PI*t))/2:(1+Math.cos(2*Math.PI*(t-.5)))/2;if(which==='q'){el('aa-q').value=String(Math.round(movement*50));drawQ();}else{state.introMotion=movement;drawIntro();}if(t<1)animation=requestAnimationFrame(tick);else{stop();redraw();}}animation=requestAnimationFrame(tick);redraw();}
  function choose(part){stop();state.part=part;state.introMotion=.32;drawIntro();}
  root.querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.node)));
  el('aa-cabinet')?.addEventListener('click',e=>{const p=e.target.closest('[data-part]');if(p)choose(p.getAttribute('data-part'));});
  el('aa-play-part')?.addEventListener('click',()=>run('part'));el('aa-q-play')?.addEventListener('click',()=>run('q'));
  el('aa-q')?.addEventListener('input',()=>{stop();drawQ();});el('aa-pred-range')?.addEventListener('input',drawMatch);el('aa-reverse')?.addEventListener('change',drawMatch);el('aa-door-width')?.addEventListener('input',drawNorm);el('aa-tree-q')?.addEventListener('input',drawTree);root.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>{state.edit=Number(b.dataset.edit);drawTree();}));
  root.addEventListener('cc:lessonchange',()=>{stop();redraw();});
  // Recompute SVG coordinates when a guide is shown or its width changes.
  if(globalThis.ResizeObserver){
    const widths=new WeakMap();
    const resizeObserver=new ResizeObserver(entries=>{
      if(entries.some(entry=>{const old=widths.get(entry.target);widths.set(entry.target,entry.contentRect.width);return old!==entry.contentRect.width;}))redraw();
    });
    root.querySelectorAll('.aa-guide').forEach(guide=>resizeObserver.observe(guide));
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();redraw();}});
  if(globalThis.IntersectionObserver){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting&&((entry.target.id==='aa-panel-1'&&playing==='part')||(entry.target.id==='aa-panel-2'&&playing==='q'))){stop();redraw();}
    }));
    ['aa-panel-1','aa-panel-2'].forEach(id=>{const panel=el(id);if(panel)observer.observe(panel);});
  }
  redraw();
})();
