// The overview map links its stages to the detailed Core Concepts lessons.
(() => {
  'use strict';
  const root = document.getElementById('aa-staged-map');
  if (!root) return;
  const get = id => root.querySelector('#' + id);
  const state = { mode: 'finite', step: 'input' };
  const order = ['input','motion','endpoints','norm','compact','matching','score','joints','edits','object'];
  const groups = { describe: ['input','motion','endpoints'], measure: ['norm','compact','matching','score'], report: ['joints','edits','object'] };
  const remembered = { describe: 'input', measure: 'norm', report: 'joints' };
  const stages = {
    describe: { number: 1, title: 'Describe joints', sections: 'Sections 4.1–4.2' },
    measure: { number: 2, title: 'Compare motion', sections: 'Sections 4.3, 4.5–4.6' },
    report: { number: 3, title: 'Use the score', sections: 'Section 4.7' }
  };
  const examples = {
  "finite": {
    "input": {
      "title": "Reference + prediction",
      "why": "A reconstruction method has already produced a movable object. The evaluator compares its allowed movement with the reference.",
      "input": "Reference: drawer opens 0–50 cm\nPrediction: drawer opens 0–40 cm",
      "output": "Two joint descriptions and their connection trees",
      "formula": "Object → links + joints + connections",
      "note": "URDF is one format for storing this information. ArticulateArena evaluates the described movement; the reconstruction method produces the prediction."
    },
    "motion": {
      "title": "Describe movement",
      "why": "Joint type, direction, and axis location work together. A twist combines them into one movement rule; the limits set its allowed range.",
      "input": "Sliding joint; direction: right\nReference [0, 0.50] m; prediction [0, 0.40] m",
      "output": "Same twist ξ; different limits",
      "formula": "ξ = (0, 0, 0; 1, 0, 0)",
      "note": "The first three entries describe rotation; the last three describe translation. Both descriptions share the same q = 0 placement. q is the amount; ξ is the rule."
    },
    "endpoints": {
      "title": "Keep the two extremes",
      "why": "Multiply the movement rule by each limit. This gives two endpoint vectors for the reference and two for the prediction.",
      "input": "ξ and the interval [l⁻, l⁺]",
      "output": "Reference {0, 0.50ξ}\nPrediction {0, 0.40ξ}",
      "formula": "z⁻ = l⁻ξ;  z⁺ = l⁺ξ",
      "note": "Each endpoint has six numbers; it is not a point on the object. Section 4.4 discusses equivalent encodings. Optional full-turn wrapping happens before endpoint construction and is different from compactification φ."
    },
    "norm": {
      "title": "Choose how to measure",
      "why": "An endpoint difference can contain rotation and translation. A norm turns that difference into a magnitude, ready for the pairing calculation.",
      "input": "The difference between two endpoint vectors",
      "output": "This example uses the split norm\nα = 1 m⁻¹; the result is dimensionless",
      "formula": "‖Δz‖α² = ‖Δω‖² + α²‖Δv‖²",
      "note": "Eα needs no body geometry. EB uses the reference part’s material distribution and has units of meters before compactification. For this drawer, EB would be 0.10 m. Matching numerical values do not imply matching units."
    },
    "compact": {
      "title": "Compress φ",
      "why": "This drawer already has finite limits, so this example skips compression. A protocol that includes unlimited joints uses φ consistently for the joints being compared.",
      "input": "Reference {0, 0.50ξ}\nPrediction {0, 0.40ξ}",
      "output": "Keep the original endpoints and continue to matching",
      "formula": "This example: z → z",
      "note": "Finite joints can also be compactified; we choose not to do so here. Switch to the unlimited-wheel example to follow the path through φ."
    },
    "matching": {
      "title": "Try both pairings",
      "why": "Reversing an axis convention can exchange the lower and upper endpoint labels. Trying both pairings avoids penalizing that change of description.",
      "input": "Reference {0, 0.50ξ}\nPrediction {0, 0.40ξ}",
      "output": "Direct = 0.100\nSwapped ≈ 0.640",
      "formula": "Direct = √(0² + 0.10²)\nSwapped = √(0.40² + 0.50²)",
      "note": "Both candidates use the same split norm chosen earlier. Keep the smaller candidate; do not add the two candidates together."
    },
    "score": {
      "title": "Joint error",
      "why": "E is already an evaluation error for one joint. A smaller value means the two movement descriptions are closer under the chosen metric.",
      "input": "Candidates: 0.100 and 0.640",
      "output": "Eα = 0.100, dimensionless",
      "formula": "E = min(direct, swapped)",
      "note": "Here the discrepancy comes from a 10 cm difference in travel. You can report E directly. Using it, or a smooth surrogate, as a training loss is a separate use."
    },
    "joints": {
      "title": "Report joint accuracy",
      "why": "An experiment about joint accuracy can aggregate these scores using its stated evaluation protocol and compare reconstruction methods.",
      "input": "Each joint’s score under the chosen metric",
      "output": "One joint in this example: Eα = 0.100",
      "formula": "Joint-level evaluation",
      "note": "This is an output branch, not another transformation required before tree editing. Follow the tree branch to include connection structure."
    },
    "edits": {
      "title": "Include connections",
      "why": "A complete object may have wrong connections, missing joints, or extra joints. Find valid edits that transform the predicted tree into the reference tree.",
      "input": "Two trees and one joint-distance rule",
      "output": "Same structure here: substitute the drawer joint\nCost Eα = 0.100",
      "formula": "Substitute: E(J, J′)\nContract: E(J, J₀); expand: E(J₀, J′)",
      "note": "J₀ = {0, 0} is a fixed joint with no relative movement. The tree score is the minimum total cost of a valid edit sequence, not an arbitrary sum of joint errors."
    },
    "object": {
      "title": "Whole-object error",
      "why": "Add the costs in the cheapest valid edit sequence to obtain the distance between the two trees.",
      "input": "The best repair here: one joint substitution",
      "output": "Eαᵗʳᵉᵉ = 0.100, dimensionless",
      "formula": "Eᵗʳᵉᵉ = min Σ edit costs",
      "note": "This example has one edge and the correct connection, so its tree error equals its joint error. Objects with more joints require matching and structural reasoning. Evaluation does not require training a model."
    }
  },
  "unlimited": {
    "input": {
      "input": "Reference: wheel can keep turning\nPrediction: stops at ±180°",
      "output": "Two rotational joints with different permitted ranges",
      "note": "The two joints share a rotation axis and a zero placement. This example compares their permitted accumulated angle ranges."
    },
    "motion": {
      "input": "Same rotation axis, through the coordinate origin\nReference: unlimited; prediction: [−π, π]",
      "output": "Same rotational twist ξ; different limits",
      "formula": "ξ = (0, 0, 1; 0, 0, 0)",
      "note": "q is in radians. A continuous joint permits unlimited rotation. An ordinary door hinge usually has a bounded angle range."
    },
    "endpoints": {
      "input": "Reference: q ∈ (−∞, +∞)\nPrediction: q ∈ [−π, π]",
      "output": "Reference: infinite ends along ±ξ\nPrediction: {−πξ, +πξ}",
      "note": "Treat the infinite ends as directional limits, not ordinary six-dimensional vectors containing infinity. φ will turn those limits into finite boundary points."
    },
    "norm": {
      "input": "The rotational twist and its endpoint directions",
      "output": "Split norm with α = 1 m⁻¹\nThis twist has norm 1",
      "note": "Fix the norm before computing the length in φ and the subsequent endpoint distances. This axis passes through the origin, so the twist has no translational component."
    },
    "compact": {
      "title": "Compress φ",
      "why": "Ordinary endpoint distance cannot directly handle infinity. φ keeps direction while compressing magnitude, making finite and unlimited ranges comparable.",
      "input": "Reference: infinite ends along ±ξ\nPrediction: ±πξ",
      "output": "Reference: ±ξ\nPrediction: ±0.7616ξ",
      "formula": "φ(z) = tanh(‖z‖/κ) z/‖z‖\nHere κ = π; tanh(1) ≈ 0.7616",
      "note": "Apply the same φ to reference and prediction. Infinite ends reach the unit-ball boundary; finite ends remain inside. Eφ is dimensionless. This is different from full-turn angle wrapping."
    },
    "matching": {
      "input": "Reference {−ξ, +ξ}\nPrediction {−0.7616ξ, +0.7616ξ}",
      "output": "Direct ≈ 0.337\nSwapped ≈ 2.491",
      "formula": "Direct = √2(1 − tanh 1)\nSwapped = √2(1 + tanh 1)",
      "note": "The matching rule stays the same. Its input now consists of compactified endpoints."
    },
    "score": {
      "input": "Candidates: 0.337 and 2.491",
      "output": "Eαφ ≈ 0.337, dimensionless",
      "formula": "Eφ = E(compactified endpoint pairs)",
      "note": "The nonzero score reflects the different permitted ranges. It does not subtract infinities or average point-position errors over every possible wheel angle."
    },
    "joints": {
      "input": "Each joint’s compactified score",
      "output": "One joint here: Eαφ ≈ 0.337",
      "note": "A unified protocol can apply the same compactification to all evaluated joints, including both bounded and unlimited ones."
    },
    "edits": {
      "input": "Two trees and a compactified joint-distance rule",
      "output": "Same structure: substitute the wheel joint\nCost Eαφ ≈ 0.337",
      "note": "Use the same chosen joint distance to price every edit. A fixed joint still corresponds to {0, 0}. This one-edge example needs no connection changes."
    },
    "object": {
      "input": "Best repair: one wheel-joint substitution",
      "output": "Eαφ,tree ≈ 0.337, dimensionless",
      "note": "This tree has just one edge, so its result equals the joint score. The cabinet guide in section 4.7 shows why a wrong connection can add error in a larger tree."
    }
  }
};
  const sectionLinks = {"input": ["articulated-object", "Read the introduction"], "motion": ["twist", "Read section 4.1"], "endpoints": ["endpoint", "Read section 4.2"], "norm": ["norms", "Read section 4.5"], "compact": ["compact", "Read section 4.6"], "matching": ["quotient", "Read section 4.3"], "score": ["quotient", "Read how E is calculated"], "joints": ["decoder", "Read the score reference"], "edits": ["tree", "Read section 4.7"], "object": ["tree", "Read section 4.7"]};
  const t = Math.tanh(1);
  const score = () => state.mode === 'finite' ? 0.1 : Math.SQRT2 * (1 - t);
  const stage = () => Object.keys(groups).find(key => groups[key].includes(state.step));
  const record = () => state.mode === 'finite' ? examples.finite[state.step] : { ...examples.finite[state.step], ...examples.unlimited[state.step] };
  const add = (parent,tag,attrs,text) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attrs).forEach(([key,value]) => el.setAttribute(key,String(value)));
    if (text !== undefined) el.textContent = text;
    parent.appendChild(el); return el;
  };
  function activeNodes() {
    const keys = groups[stage()], i = keys.indexOf(state.step);
    const active = new Set(keys.slice(0,i+1));
    if (stage() === 'report') {
      active.add('context');
      if (state.step !== 'joints') active.delete('joints');
    }
    if (stage() === 'measure' && state.mode === 'finite') {
      active.delete('compact');
      if (i >= 1) active.add('raw');
    }
    return active;
  }
  function drawEdges() {
    const svg = get('learn-edges'), frame = get('learn-flow').getBoundingClientRect();
    const width = frame.width || 280, height = frame.height || 340;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`); svg.replaceChildren();
    const current = stage(), active = activeNodes();
    const edges = current === 'describe' ? [['input','motion'],['motion','endpoints']] : current === 'measure' ? [['norm','raw'],['raw','matching'],['norm','compact'],['compact','matching'],['matching','score']] : [['context','joints'],['context','edits'],['edits','object']];
    const unused = (a,b) => (a === 'raw' || b === 'raw') ? state.mode !== 'finite' : (a === 'compact' || b === 'compact') ? state.mode === 'finite' : false;
    const center = id => { const r = get('learn-'+id).getBoundingClientRect(); return { x:r.x-frame.x+r.width/2, top:r.y-frame.y, bottom:r.y-frame.y+r.height }; };
    edges.sort((a,b) => Number(unused(...b))-Number(unused(...a)));
    for (const [a,b] of edges) {
      const p=center(a),q=center(b),skip=unused(a,b),highlighted=!skip&&active.has(a)&&active.has(b);
      const start=p.bottom+1,end=q.top-2,mid=a==='context'?start+20:(start+end)/2;
      const d=Math.abs(p.x-q.x)<1?`M ${p.x} ${start} V ${end}`:`M ${p.x} ${start} V ${mid} H ${q.x} V ${end}`;
      const color=highlighted?'var(--p-accent)':'var(--p-wire)';
      add(svg,'path',{d,fill:'none',stroke:color,'stroke-width':highlighted?2.4:1.5,'stroke-linejoin':'round','stroke-dasharray':skip?'4 4':'none','data-edge':a+'-'+b,'data-used':String(!skip),'data-highlighted':String(highlighted)});
      add(svg,'polygon',{points:`${q.x},${end} ${q.x-3.5},${end-6} ${q.x+3.5},${end-6}`,fill:color});
    }
    if(current==='report'){const p=center('context');add(svg,'circle',{cx:p.x,cy:p.bottom+21,r:3,fill:'var(--p-accent)'});}
  }
  function drawFigure() {
    const svg=get('learn-figure'),w=svg.getBoundingClientRect().width||280;
    svg.setAttribute('viewBox',`0 0 ${w} 150`);svg.replaceChildren();
    const text=(x,y,label,anchor='start')=>add(svg,'text',{x,y,'text-anchor':anchor},label);
    const blue='var(--diagram-reference)',gold='var(--diagram-prediction)',wire='var(--p-wire)';
    if(stage()==='report'&&state.step!=='joints'){
      const parent=state.mode==='finite'?'Cabinet':'Mount',child=state.mode==='finite'?'Drawer':'Wheel';
      get('learn-figure-title').textContent='Two connection trees';get('learn-figure-unit').textContent='One joint each';
      for(const [x,color,label,range] of [[w*.26,blue,'Reference',state.mode==='finite'?'0–50 cm':'Unlimited'],[w*.74,gold,'Prediction',state.mode==='finite'?'0–40 cm':'−π to +π']]){
        text(x,20,label,'middle');text(x+10,46,parent);
        add(svg,'line',{x1:x,y1:47,x2:x,y2:91,stroke:color,'stroke-width':2.5});
        add(svg,'circle',{cx:x,cy:42,r:5,fill:color});add(svg,'circle',{cx:x,cy:96,r:5,fill:color});
        text(x+10,100,child);text(x,133,range,'middle');
      }
      get('learn-caption').textContent='Same connections; different motion range. This one-joint tree needs only a joint substitution.';
      svg.setAttribute('aria-label','Reference and prediction have the same two links and one joint, but different permitted movement ranges.');
      return;
    }
    const compact=state.mode==='infinite'&&order.indexOf(state.step)>=4;
    let a,b,domain;
    if(state.mode==='finite'){a=[0,.5];b=[0,.4];domain=[0,.55];get('learn-figure-unit').textContent='Meters';}
    else if(compact){a=[-1,1];b=[-t,t];domain=[-1.1,1.1];get('learn-figure-unit').textContent='After φ';}
    else{a=[-1,1];b=[-.65,.65];domain=[-1.1,1.1];get('learn-figure-unit').textContent='Schematic';}
    const x=v=>24+(v-domain[0])/(domain[1]-domain[0])*(w-48);
    text(0,19,'Reference');text(0,85,'Prediction');
    for(const [values,y,color,reference]of[[a,51,blue,true],[b,109,gold,false]]){
      add(svg,'line',{x1:x(values[0]),y1:y,x2:x(values[1]),y2:y,stroke:color,'stroke-width':4,'stroke-linecap':'round'});
      values.forEach((v,i)=>{
        add(svg,'circle',{cx:x(v),cy:y,r:4.5,fill:color});
        const label=state.mode==='finite'?v.toFixed(2):compact?v.toFixed(reference?0:3):(reference?(i?'+∞':'−∞'):(i?'+π':'−π'));
        text(x(v),y+23,label,'middle');
      });
    }
    if(['matching','score','joints'].includes(state.step))for(let i=0;i<2;i++)add(svg,'line',{x1:x(a[i]),y1:56,x2:x(b[i]),y2:104,stroke:wire,'stroke-width':1,'stroke-dasharray':'3 3'});
    get('learn-figure-title').textContent=state.mode==='finite'?'Drawer travel':'Wheel range';
    get('learn-caption').textContent=state.mode==='finite'?'The lower limits agree. The upper limits differ by 10 cm.':compact?'Only the endpoint coefficient along ξ is shown; each endpoint still has six numbers.':'An unlimited range has no finite length; this view is schematic.';
    svg.setAttribute('aria-label',state.mode==='finite'?'Reference drawer range 0 to 0.5 meters; predicted range 0 to 0.4 meters.':compact?'Compactified reference endpoints at minus and plus 1, prediction endpoints at minus and plus 0.7616.':'Reference wheel can turn without limit; prediction stops at minus and plus pi radians.');
  }
  function render() {
    const current=stage(),info=stages[current],r=record(),finite=state.mode==='finite',active=activeNodes();
    remembered[current]=state.step;
    root.querySelectorAll('[data-stage]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stage===current)));
    Object.keys(groups).forEach(key=>{get('group-'+key).hidden=key!==current;});
    root.querySelectorAll('[data-step]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.step===state.step));button.setAttribute('data-path',String(active.has(button.dataset.step)));});
    const [anchor,linkLabel]=sectionLinks[state.step];
    const inOverview=anchor==='articulated-object';
    get('learn-section-link').href=(inOverview?'':'concepts.html')+'#'+anchor;
    get('learn-section-link').textContent=linkLabel+(inOverview?' ↑':' →');
    get('learn-stage-title').textContent=info.title;get('learn-stage-sections').textContent=info.sections;
    get('learn-finite').setAttribute('aria-pressed',String(finite));get('learn-infinite').setAttribute('aria-pressed',String(!finite));
    get('learn-raw').setAttribute('data-used',String(finite));get('learn-compact').setAttribute('data-used',String(!finite));
    get('learn-raw-status').textContent=finite?'Used here':'Not used here';get('learn-compact-status').textContent=finite?'Skipped here · 4.6':'Used here · 4.6';
    const joint=(finite?'Eα = ':'Eαφ ≈ ')+score().toFixed(3),tree=(finite?'Eαᵗʳᵉᵉ = ':'Eαφ,tree ≈ ')+score().toFixed(3);
    get('learn-score-value').textContent=joint;get('learn-context-value').textContent=joint;get('learn-object-value').textContent=tree;
    for(const [id,value]of[['learn-tag','Selected step · '+info.title],['learn-title',r.title],['learn-why',r.why],['learn-input-text',r.input],['learn-output-text',r.output],['learn-formula',r.formula],['learn-note',r.note]])get(id).textContent=value;
    get('learn-legend').textContent=current==='measure'?'Solid: used route. Dashed: unused route.':current==='report'?'Both branches use the joint error from Compare motion.':'The output of this stage is the endpoint pair.';
    const position=groups[current].indexOf(state.step)+1;
    get('learn-where').textContent=`Stage ${info.number} of 3 · ${current==='report'?'Choose an output branch':'Step '+position+' of '+groups[current].length}`;
    get('learn-back').disabled=state.step==='input';
    const nextLabels={input:'Twist + limits →',motion:'Endpoints →',endpoints:'Next: compare motion →',norm:'Range handling →',compact:'Pair the endpoints →',matching:'Joint error →',score:'Next: use the score →',joints:'Explore tree costs →',edits:'Whole-object error →',object:'Start again ↺'};
    get('learn-next').textContent=nextLabels[state.step];drawEdges();drawFigure();
  }
  root.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{state.step=button.dataset.step;render();}));
  root.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>{state.step=remembered[button.dataset.stage];render();}));
  get('learn-finite').addEventListener('click',()=>{state.mode='finite';render();});
  get('learn-infinite').addEventListener('click',()=>{state.mode='infinite';render();});
  get('learn-back').addEventListener('click',()=>{state.step=order[Math.max(0,order.indexOf(state.step)-1)];render();});
  get('learn-next').addEventListener('click',()=>{state.step=order[(order.indexOf(state.step)+1)%order.length];render();});
  if(globalThis.ResizeObserver)new ResizeObserver(()=>{drawEdges();drawFigure();}).observe(root);
  render();
})();
