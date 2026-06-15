/* ========================================
   003 Magic Circle（3パターン自動切替）
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background = '#06050f';
  const cv = document.createElement('canvas');
  const SIZE = 150;
  cv.width = SIZE; cv.height = SIZE;
  cv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)';
  container.appendChild(cv);

  const ctx = cv.getContext('2d');
  const CX = SIZE / 2, CY = SIZE / 2, R = 52;
  const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  const col = {
    gold:   a => `rgba(255,210,50,${a})`,
    blue:   a => `rgba(80,160,255,${a})`,
    white:  a => `rgba(220,230,255,${a})`,
    red:    a => `rgba(255,50,30,${a})`,
    cyan:   a => `rgba(60,230,220,${a})`,
    violet: a => `rgba(180,80,255,${a})`
  };
  function getColor(n, a) { return (col[n] || col.gold)(a); }
  function pulseColor(n, t, i) {
    const p = (Math.sin(t * 0.04 + i * 0.72) + 1) / 2;
    const map = {
      'gold-red':    [[255,210,50],[255,40,20]],
      'red-gold':    [[255,40,20],[255,210,50]],
      'blue-red':    [[80,160,255],[255,40,20]],
      'cyan-violet': [[60,230,220],[180,80,255]],
      'violet-cyan': [[180,80,255],[60,230,220]]
    };
    const [c1, c2] = (map[n] || [[255,210,50],[255,40,20]]);
    const r = Math.round(c1[0] + (c2[0]-c1[0]) * p);
    const g = Math.round(c1[1] + (c2[1]-c1[1]) * p);
    const b = Math.round(c1[2] + (c2[2]-c1[2]) * p);
    return { color: `rgba(${r},${g},${b},${0.75 + 0.25 * p})`, blur: 6 + 10 * (1 - p) };
  }
  const PATS = [
    {rc:'gold-red',   layers:[{t:'circle',r:1.00,lw:1.5,c:'gold',gw:12,rd:1},{t:'ticks',r:1.00,n:36,len:4,lw:1.0,c:'gold',gw:6,rd:1},{t:'runes',r:1.12,n:20,sz:8,c:'gold-red',rd:0.35},{t:'circle',r:0.80,lw:1.3,c:'blue',gw:14,rd:1},{t:'star',r:0.74,n:6,sk:2,lw:1.1,c:'blue',gw:10,rd:1},{t:'circle',r:0.58,lw:1.2,c:'gold',gw:10,rd:1},{t:'circle',r:0.44,lw:1.0,c:'white',gw:8,rd:1},{t:'star',r:0.40,n:5,sk:2,lw:1.2,c:'gold',gw:11,rd:1},{t:'core'}]},
    {rc:'red-gold',   layers:[{t:'circle',r:1.00,lw:1.8,c:'red',gw:16,rd:1},{t:'ticks',r:1.00,n:48,len:3,lw:0.8,c:'red',gw:8,rd:1},{t:'runes',r:1.12,n:20,sz:8,c:'red-gold',rd:-0.4},{t:'star',r:0.90,n:8,sk:3,lw:1.2,c:'red',gw:12,rd:-1},{t:'circle',r:0.72,lw:1.3,c:'gold',gw:12,rd:1},{t:'star',r:0.64,n:6,sk:2,lw:1.0,c:'gold',gw:9,rd:1},{t:'circle',r:0.50,lw:1.0,c:'red',gw:10,rd:-1},{t:'core',c:'red'}]},
    {rc:'cyan-violet',layers:[{t:'circle',r:1.00,lw:1.5,c:'cyan',gw:14,rd:1},{t:'ticks',r:1.00,n:32,len:5,lw:1.0,c:'cyan',gw:8,rd:-1},{t:'runes',r:1.12,n:20,sz:8,c:'cyan-violet',rd:0.5},{t:'circle',r:0.78,lw:1.0,c:'cyan',gw:10,rd:-1},{t:'star',r:0.68,n:7,sk:3,lw:1.0,c:'cyan',gw:10,rd:-1},{t:'circle',r:0.55,lw:1.3,c:'violet',gw:14,rd:1},{t:'core',c:'violet'}]}
  ];
  const T_DRAW=280, T_SHOW=460, T_FADE=70, T_TOTAL=530;
  let patIdx=0, nextIdx=1, t=0, gT=0, spinA=0;
  function eio(x) { return x < 0.5 ? 2*x*x : 1-(-2*x+2)**2/2; }
  function prog(t,s,e) { return eio(Math.min(1, Math.max(0, (t-s)/(e-s)))); }
  function drawLayer(l, progress, spinA) {
    ctx.save();
    ctx.translate(CX, CY); ctx.rotate(spinA*(l.rd||1)); ctx.translate(-CX, -CY);
    if (l.t === 'circle') {
      const c = getColor(l.c, 0.9); ctx.strokeStyle=c; ctx.lineWidth=l.lw||1; ctx.shadowColor=c; ctx.shadowBlur=l.gw||8;
      ctx.beginPath(); ctx.arc(CX,CY,R*l.r,-Math.PI/2,-Math.PI/2+Math.PI*2*progress); ctx.stroke();
    } else if (l.t === 'ticks') {
      const c = getColor(l.c, 0.7); ctx.strokeStyle=c; ctx.lineWidth=l.lw||1; ctx.shadowColor=c; ctx.shadowBlur=l.gw||6;
      const drawn = Math.floor(progress * l.n);
      for (let i=0; i<drawn; i++) {
        const ang = Math.PI*2*i/l.n, r = R*l.r;
        ctx.beginPath(); ctx.moveTo(CX+Math.cos(ang)*r,CY+Math.sin(ang)*r); ctx.lineTo(CX+Math.cos(ang)*(r+l.len),CY+Math.sin(ang)*(r+l.len)); ctx.stroke();
      }
    } else if (l.t === 'star') {
      const c = getColor(l.c, 0.8); ctx.strokeStyle=c; ctx.lineWidth=l.lw||1; ctx.shadowColor=c; ctx.shadowBlur=l.gw||10;
      const pts = []; for (let i=0; i<l.n; i++) { const ang=-Math.PI/2+Math.PI*2*i/l.n; pts.push([CX+Math.cos(ang)*R*l.r, CY+Math.sin(ang)*R*l.r]); }
      const order = []; let idx=0; for (let i=0; i<l.n; i++) { order.push(idx); idx=(idx+l.sk)%l.n; } order.push(order[0]);
      const drawn = progress * l.n; ctx.beginPath(); ctx.moveTo(pts[order[0]][0], pts[order[0]][1]);
      for (let i=1; i<=l.n; i++) {
        const seg = Math.min(1, Math.max(0, drawn-(i-1))); if (seg<=0) break;
        const a=pts[order[i]], b=pts[order[i-1]]; ctx.lineTo(b[0]+(a[0]-b[0])*seg, b[1]+(a[1]-b[1])*seg);
      }
      ctx.stroke();
    } else if (l.t === 'runes') {
      const drawn = Math.floor(progress * l.n); ctx.font=`${l.sz||8}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      for (let i=0; i<drawn; i++) {
        const ang=Math.PI*2*i/l.n-Math.PI/2, x=CX+Math.cos(ang)*R*l.r, y=CY+Math.sin(ang)*R*l.r;
        const pc = pulseColor(l.c, gT, i);
        ctx.save(); ctx.fillStyle=pc.color; ctx.shadowColor=pc.color; ctx.shadowBlur=pc.blur;
        ctx.translate(x,y); ctx.rotate(ang+Math.PI/2); ctx.fillText(RUNES[i%RUNES.length],0,0); ctx.restore();
      }
    } else if (l.t === 'core') {
      const cv2 = {blue:[80,100,255],red:[255,60,40],violet:[160,80,255],gold:[255,200,80],cyan:[60,220,200]};
      const [rr,gg,bb] = cv2[l.c||'blue']||cv2.blue;
      const cg = ctx.createRadialGradient(CX,CY,0,CX,CY,R*0.18*progress);
      cg.addColorStop(0,`rgba(${rr+60},${gg+60},${bb+60},${0.85*progress})`);
      cg.addColorStop(0.5,`rgba(${rr},${gg},${bb},${0.45*progress})`);
      cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(CX,CY,R*0.18,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  function lp(pat, li, t) {
    const layers = PATS[pat].layers;
    if (layers[li].t==='core') return prog(t, T_DRAW*0.88, T_DRAW);
    const nc = layers.filter(l=>l.t!=='core'), n=nc.length, mi=nc.indexOf(layers[li]);
    if (mi<0) return prog(t, T_DRAW*0.88, T_DRAW);
    const sl=(T_DRAW*0.85)/n, ov=sl*0.4;
    return prog(t, mi*(sl-ov), mi*(sl-ov)+sl);
  }
  function renderPat(pat, t, spinA, alpha) {
    ctx.save(); ctx.globalAlpha=alpha;
    PATS[pat].layers.forEach((l,li)=>{ const p=lp(pat,li,t); if(p>0) drawLayer(l,p,spinA); });
    ctx.restore();
  }
  function render() {
    t++; gT++;
    if (t > T_DRAW+20) spinA += 0.006 + (t-T_DRAW)*0.000035;
    let aA, aB;
    if (t<=T_FADE) { aA=eio(t/T_FADE); aB=0; }
    else if (t<T_SHOW) { aA=1; aB=0; }
    else if (t<=T_TOTAL) { const fp=(t-T_SHOW)/T_FADE; aA=1-eio(fp); aB=eio(fp); }
    else { patIdx=nextIdx; nextIdx=(nextIdx+1)%PATS.length; t=1; spinA=0; aA=1; aB=0; }
    ctx.clearRect(0,0,SIZE,SIZE); ctx.fillStyle='rgba(6,5,15,0.97)'; ctx.fillRect(0,0,SIZE,SIZE);
    if (aA>0.01) renderPat(patIdx, Math.min(t,T_SHOW), spinA, aA);
    if (aB>0.01) renderPat(nextIdx, Math.max(0,t-T_SHOW), 0, aB);
    requestAnimationFrame(render);
  }
  render();
}
