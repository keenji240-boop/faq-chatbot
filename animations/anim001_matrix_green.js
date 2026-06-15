/* ========================================
   001 Matrix Green
   initAnim(container) を呼ぶと描画開始
   container: #animHeader の div 要素
======================================== */
function initAnim(container) {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  container.appendChild(cv);

  cv.width  = container.offsetWidth  || 600;
  cv.height = container.offsetHeight || 150;
  const ctx  = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const fs = 14, cols = Math.floor(W / fs);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
  const drops = Array.from({length: cols}, () => Math.random() * -30);

  function draw() {
    ctx.fillStyle = 'rgba(6,6,15,0.18)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.font = `bold ${fs}px monospace`;
      ctx.fillStyle  = drops[i] > 4 ? '#00cc44' : '#aaffcc';
      ctx.shadowBlur = drops[i] > 4 ? 4 : 10;
      ctx.shadowColor = '#00ff44';
      ctx.fillText(ch, i * fs, drops[i] * fs);
      ctx.shadowBlur = 0;
      if (drops[i] * fs > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.45;
    }
  }
  setInterval(draw, 48);
}
