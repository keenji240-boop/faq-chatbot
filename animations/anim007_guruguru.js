/* ========================================
   007 Guruguru（CSS回転リング）
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background = '#04070d';
  container.style.display    = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  // CSSをページに注入（重複防止）
  if (!document.getElementById('anim007-style')) {
    const style = document.createElement('style');
    style.id = 'anim007-style';
    style.textContent = `
      .mz-wrap007{position:relative;width:140px;height:140px;}
      .mz007{position:absolute;top:50%;left:50%;border-radius:50%;border:2px solid transparent;}
      .mz007.mz1{width:140px;height:140px;margin:-70px 0 0 -70px;border-top-color:#3aa0ff;border-bottom-color:#3aa0ff;animation:mzrot007 4s linear infinite;}
      .mz007.mz2{width:120px;height:120px;margin:-60px 0 0 -60px;border-left-color:#5fb6ff;border-right-color:#5fb6ff;animation:mzrot007 3.2s linear infinite reverse;}
      .mz007.mz3{width:100px;height:100px;margin:-50px 0 0 -50px;border-top-color:#e0115f;border-bottom-color:#e0115f;animation:mzrot007 2.6s linear infinite;}
      .mz007.mz4{width:80px;height:80px;margin:-40px 0 0 -40px;border-left-color:#9fe1ff;border-right-color:#9fe1ff;animation:mzrot007 2s linear infinite reverse;}
      .mz007.mz5{width:60px;height:60px;margin:-30px 0 0 -30px;border-top-color:#2a6fb8;border-bottom-color:#2a6fb8;animation:mzrot007 1.4s linear infinite;}
      .mz007.mz6{width:40px;height:40px;margin:-20px 0 0 -20px;border-left-color:#c9ecff;border-right-color:#c9ecff;animation:mzrot007 0.9s linear infinite reverse;}
      @keyframes mzrot007{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    `;
    document.head.appendChild(style);
  }

  const wrap = document.createElement('div');
  wrap.className = 'mz-wrap007';
  [1,2,3,4,5,6].forEach(n => {
    const d = document.createElement('div');
    d.className = `mz007 mz${n}`;
    wrap.appendChild(d);
  });
  container.appendChild(wrap);
}
