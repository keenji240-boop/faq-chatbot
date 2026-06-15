/* ========================================
   002 Matrix Gold
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background = '#000';
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  container.appendChild(cv);

  cv.width  = container.offsetWidth  || 600;
  cv.height = container.offsetHeight || 150;
  const ctx  = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const fs = 14, cols = Math.floor(W / fs);
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$¥€';
  const drops = Array.from({length: cols}, () => Math.random() * -20);

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle   = drops[i] > 8 ? '#D4AF37' : '#FFF5CC';
      ctx.font        = `bold ${fs}px serif`;
      ctx.shadowBlur  = 7;
      ctx.shadowColor = '#D4AF37';
      ctx.fillText(ch, i * fs, drops[i] * fs);
      ctx.shadowBlur = 0;
      if (drops[i] * fs > H && Math.random() > 0.978) drops[i] = 0;
      drops[i] += 0.4;
    }
  }
  setInterval(draw, 50);
}
