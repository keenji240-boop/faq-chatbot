/* ========================================
   009 Machine God（SVG回路 + フリッカーJS）
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background = '#04070d';

  // CSSをページに注入（重複防止）
  if (!document.getElementById('anim009-style')) {
    const style = document.createElement('style');
    style.id = 'anim009-style';
    style.textContent = `
      @keyframes pulseGlow9{0%,100%{opacity:0.35;}50%{opacity:0.85;}}
      .pulse9{animation:pulseGlow9 2.4s ease-in-out infinite;}
      @keyframes lookAround9{0%,8%{transform:translateX(0);}25%,38%{transform:translateX(-12px);}55%,68%{transform:translateX(12px);}85%,100%{transform:translateX(0);}}
      #iris-group9-inst{animation:lookAround9 9s ease-in-out infinite;}
    `;
    document.head.appendChild(style);
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 500 150');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%';

  svg.innerHTML = `
    <defs>
      <radialGradient id="glow9inst" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3aa0ff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#3aa0ff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g id="circuit9inst" stroke="#2a6fb8" stroke-width="1.2" fill="none">
      <path d="M250 75 H180 L160 55 H60"/>
      <path d="M250 75 H180 L160 95 H60"/>
      <path d="M250 75 H320 L340 55 H440"/>
      <path d="M250 75 H320 L340 95 H440"/>
      <path d="M250 75 V40 L230 20 V0"/>
      <path d="M250 75 V40 L270 20 V0"/>
      <path d="M250 75 V110 L230 130 V150"/>
      <path d="M250 75 V110 L270 130 V150"/>
      <path d="M250 75 L210 35 H140"/>
      <path d="M250 75 L290 35 H360"/>
      <path d="M250 75 L210 115 H140"/>
      <path d="M250 75 L290 115 H360"/>
      <path d="M200 60 H120 L100 40 H30"/>
      <path d="M200 90 H120 L100 110 H30"/>
      <path d="M300 60 H380 L400 40 H470"/>
      <path d="M300 90 H380 L400 110 H470"/>
      <path d="M210 35 V10 H170"/>
      <path d="M290 35 V10 H330"/>
      <path d="M210 115 V140 H170"/>
      <path d="M290 115 V140 H330"/>
      <path d="M140 35 H80 L65 50"/>
      <path d="M140 115 H80 L65 100"/>
      <path d="M360 35 H420 L435 50"/>
      <path d="M360 115 H420 L435 100"/>
      <path d="M180 75 H120 L105 60 H40"/>
      <path d="M180 75 H120 L105 90 H40"/>
      <path d="M320 75 H380 L395 60 H460"/>
      <path d="M320 75 H380 L395 90 H460"/>
      <path d="M250 40 H210 L195 25 H130"/>
      <path d="M250 40 H290 L305 25 H370"/>
      <path d="M250 110 H210 L195 125 H130"/>
      <path d="M250 110 H290 L305 125 H370"/>
      <path d="M160 55 L160 30 L120 20"/>
      <path d="M160 95 L160 120 L120 130"/>
      <path d="M340 55 L340 30 L380 20"/>
      <path d="M340 95 L340 120 L380 130"/>
      <path d="M30 40 H10"/><path d="M30 110 H10"/>
      <path d="M470 40 H490"/><path d="M470 110 H490"/>
      <path d="M60 55 V35"/><path d="M60 95 V115"/>
      <path d="M440 55 V35"/><path d="M440 95 V115"/>
      <circle cx="60" cy="55" r="2.5"/><circle cx="60" cy="95" r="2.5"/>
      <circle cx="440" cy="55" r="2.5"/><circle cx="440" cy="95" r="2.5"/>
      <circle cx="140" cy="35" r="2.5"/><circle cx="360" cy="35" r="2.5"/>
      <circle cx="140" cy="115" r="2.5"/><circle cx="360" cy="115" r="2.5"/>
      <circle cx="30" cy="40" r="2.5"/><circle cx="30" cy="110" r="2.5"/>
      <circle cx="470" cy="40" r="2.5"/><circle cx="470" cy="110" r="2.5"/>
      <circle cx="100" cy="40" r="2.5"/><circle cx="100" cy="110" r="2.5"/>
      <circle cx="400" cy="40" r="2.5"/><circle cx="400" cy="110" r="2.5"/>
      <circle cx="65" cy="50" r="2.5"/><circle cx="65" cy="100" r="2.5"/>
      <circle cx="435" cy="50" r="2.5"/><circle cx="435" cy="100" r="2.5"/>
      <circle cx="170" cy="10" r="2.5"/><circle cx="330" cy="10" r="2.5"/>
      <circle cx="170" cy="140" r="2.5"/><circle cx="330" cy="140" r="2.5"/>
      <circle cx="120" cy="20" r="2.5"/><circle cx="120" cy="130" r="2.5"/>
      <circle cx="380" cy="20" r="2.5"/><circle cx="380" cy="130" r="2.5"/>
    </g>
    <circle cx="250" cy="75" r="45" fill="url(#glow9inst)" class="pulse9"/>
    <g stroke="#7fd0ff" stroke-width="2" fill="none">
      <path d="M250 50 L268 75 L250 100 L232 75 Z"/>
    </g>
    <ellipse cx="250" cy="75" rx="36" ry="20" fill="#04070d" stroke="#7fd0ff" stroke-width="1.5"/>
    <g id="iris-group9-inst">
      <ellipse cx="250" cy="75" rx="15" ry="17" fill="#0b3a5c" stroke="#3aa0ff" stroke-width="1.5"/>
      <ellipse cx="250" cy="75" rx="3.5" ry="15" fill="#7fd0ff"/>
    </g>
  `;
  container.appendChild(svg);

  // フリッカーJS
  const paths = svg.querySelectorAll('#circuit9inst path, #circuit9inst circle');
  paths.forEach(p => {
    function flicker() {
      const op = (0.2 + Math.random() * 0.7).toFixed(2);
      const bright = Math.random() > 0.6;
      p.style.opacity    = op;
      p.style.stroke     = bright ? '#6fc4ff' : '#2a6fb8';
      p.style.transition = `opacity ${(0.3+Math.random()*0.8).toFixed(2)}s, stroke ${(0.3+Math.random()*0.8).toFixed(2)}s`;
      setTimeout(flicker, 400 + Math.random() * 2000);
    }
    setTimeout(flicker, Math.random() * 1000);
  });
}
