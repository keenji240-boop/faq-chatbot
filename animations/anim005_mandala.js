/* ========================================
   005 Mandala
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background = '#030208';
  const cv = document.createElement('canvas');
  const SIZE = 150;
  cv.width = SIZE; cv.height = SIZE;
  cv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)';
  container.appendChild(cv);

  const ctx = cv.getContext('2d');
  const CX = SIZE/2, CY = SIZE/2, MAX_R = SIZE/2 - 4;
  let t = 0;
  const gold  = a => `rgba(255,215,70,${a})`;
  const red   = a => `rgba(230,50,40,${a})`;
  const white = a => `rgba(245,240,225,${a})`;

  function getPulse(t) {
    const s = (Math.sin(t * 0.015) + 1) / 2;
    return {
      primary:   `rgba(${Math.round(230+25*s)},${Math.round(70+145*s)},${Math.round(40+30*s)},0.85)`,
      secondary: `rgba(${Math.round(40+180*(1-s))},${Math.round(110+105*s)},${Math.round(220-150*s)},0.7)`
    };
  }
  function lotus(radius, count, angleOffset, color, lw, scaleY=0.4) {
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(angleOffset);
    ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.shadowColor=color; ctx.shadowBlur=3;
    for (let i=0; i<count; i++) {
      const angle = (Math.PI*2*i)/count;
      ctx.save(); ctx.rotate(angle);
      ctx.beginPath(); ctx.moveTo(0,-radius*0.5);
      ctx.quadraticCurveTo(-radius*scaleY,-radius*0.8,0,-radius);
      ctx.quadraticCurveTo(radius*scaleY,-radius*0.8,0,-radius*0.5);
      ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function render() {
    t++; ctx.clearRect(0,0,SIZE,SIZE);
    ctx.fillStyle='#030208'; ctx.fillRect(0,0,SIZE,SIZE);
    const pc = getPulse(t), baseR = MAX_R * 0.95;
    ctx.save(); ctx.strokeStyle=gold(0.6); ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(CX,CY,baseR,0,Math.PI*2); ctx.stroke(); ctx.restore();
    lotus(baseR, 24, -t*0.003, pc.secondary, 0.7, 0.22);
    lotus(baseR*0.78, 12, t*0.005, pc.primary, 1.1, 0.32);
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(-t*0.007);
    ctx.strokeStyle=gold(0.35); ctx.lineWidth=0.7;
    const innerR = baseR * 0.55;
    for (let i=0; i<8; i++) {
      const ang = (Math.PI*2*i)/8;
      ctx.beginPath(); ctx.arc(Math.cos(ang)*innerR*0.5, Math.sin(ang)*innerR*0.5, innerR*0.5, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
    lotus(baseR*0.44, 10, t*0.009, white(0.75), 1.0, 0.38);
    ctx.save(); ctx.translate(CX,CY); ctx.rotate(-t*0.012);
    ctx.strokeStyle=pc.secondary; ctx.lineWidth=0.8;
    const coreR = baseR * 0.25;
    for (let i=0; i<20; i++) {
      const ang = (Math.PI*2*i)/20;
      ctx.beginPath(); ctx.moveTo(Math.cos(ang)*coreR*0.55, Math.sin(ang)*coreR*0.55);
      ctx.lineTo(Math.cos(ang)*coreR, Math.sin(ang)*coreR); ctx.stroke();
    }
    ctx.restore();
    const rg = ctx.createRadialGradient(CX,CY,0,CX,CY,coreR*0.5);
    rg.addColorStop(0,'rgba(255,245,200,1)'); rg.addColorStop(0.3,gold(0.8));
    rg.addColorStop(0.7,red(0.4)); rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(CX,CY,coreR*0.5,0,Math.PI*2); ctx.fill();
    requestAnimationFrame(render);
  }
  render();
}
