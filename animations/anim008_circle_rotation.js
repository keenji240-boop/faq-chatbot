/* ========================================
   008 Circle Rotation（3D CSS リング）
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background   = '#04070d';
  container.style.display      = 'flex';
  container.style.alignItems   = 'center';
  container.style.justifyContent = 'center';
  container.style.perspective  = '800px';

  // CSSをページに注入（重複防止）
  if (!document.getElementById('anim008-style')) {
    const style = document.createElement('style');
    style.id = 'anim008-style';
    style.textContent = `
      .ring-wrap008{position:relative;width:140px;height:140px;transform-style:preserve-3d;}
      .ring008{position:absolute;top:50%;left:50%;border-radius:50%;border:2px solid;transform-style:preserve-3d;}
      .ring008.r1{width:140px;height:140px;margin:-70px 0 0 -70px;border-color:#3aa0ff;animation:spinX008 6s linear infinite;}
      .ring008.r2{width:110px;height:110px;margin:-55px 0 0 -55px;border-color:#5fb6ff;animation:spinY008 5s linear infinite;}
      .ring008.r3{width:170px;height:170px;margin:-85px 0 0 -85px;border-color:#7fd0ff;animation:spinXY008 8s linear infinite;}
      .ring008.r4{width:80px;height:80px;margin:-40px 0 0 -40px;border-color:#2a6fb8;animation:spinY008 4s linear infinite reverse;}
      .ring008.r5{width:200px;height:200px;margin:-100px 0 0 -100px;border-color:#9fe1ff;animation:spinX008 10s linear infinite reverse;}
      @keyframes spinX008{from{transform:rotateX(0deg);}to{transform:rotateX(360deg);}}
      @keyframes spinY008{from{transform:rotateY(0deg);}to{transform:rotateY(360deg);}}
      @keyframes spinXY008{from{transform:rotate3d(1,1,0,0deg);}to{transform:rotate3d(1,1,0,360deg);}}
    `;
    document.head.appendChild(style);
  }

  const wrap = document.createElement('div');
  wrap.className = 'ring-wrap008';
  [1,2,3,4,5].forEach(n => {
    const d = document.createElement('div');
    d.className = `ring008 r${n}`;
    wrap.appendChild(d);
  });
  container.appendChild(wrap);
}
