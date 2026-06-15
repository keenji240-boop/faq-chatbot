/* ========================================
   004 Eye of Sauron
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  container.style.background = '#030000';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, CX, CY;

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    CX = W/2; CY = H/2;
    initObjects();
  }
  function catEyePath(scale) {
    const s = scale||1.0, rx=100*s, ry=H*0.44*s;
    ctx.beginPath();
    ctx.moveTo(CX,CY-ry);
    ctx.bezierCurveTo(CX+rx*.52,CY-ry,   CX+rx*.97,CY-ry*.12,CX+rx,CY);
    ctx.bezierCurveTo(CX+rx*.97,CY+ry*.12,CX+rx*.52,CY+ry,   CX,CY+ry);
    ctx.bezierCurveTo(CX-rx*.52,CY+ry,   CX-rx*.97,CY+ry*.12,CX-rx,CY);
    ctx.bezierCurveTo(CX-rx*.97,CY-ry*.12,CX-rx*.52,CY-ry,  CX,CY-ry);
    ctx.closePath();
  }
  function flameHSLA(alpha) {
    const t=Math.random(); let h,l;
    if      (t<0.20){h=52+Math.random()*10;l=72+Math.random()*18;}
    else if (t<0.42){h=40+Math.random()*12;l=65+Math.random()*16;}
    else if (t<0.65){h=28+Math.random()*12;l=56+Math.random()*16;}
    else if (t<0.82){h=16+Math.random()*12;l=48+Math.random()*14;}
    else            {h= 8+Math.random()*10;l=38+Math.random()*14;}
    return `hsla(${h|0},100%,${l|0}%,${alpha.toFixed(2)})`;
  }
  function lavaHSLA(alpha) {
    const h=20+Math.random()*30, l=45+Math.random()*30;
    return `hsla(${h|0},100%,${l|0}%,${alpha.toFixed(2)})`;
  }
  class InwardFlame {
    constructor(){this.reset();}
    reset(){
      this.ang=Math.random()*Math.PI*2;
      const margin=0.82+Math.random()*0.10, rx=100*margin, ry=H*0.44*margin;
      this.startX=CX+rx*Math.cos(this.ang); this.startY=CY+ry*Math.sin(this.ang);
      const irisR=Math.min(W,H)*0.27, targAng=this.ang+Math.PI+(Math.random()-0.5)*0.5;
      this.endX=CX+Math.cos(targAng)*irisR*(0.78+Math.random()*0.20);
      this.endY=CY+Math.sin(targAng)*irisR*(0.78+Math.random()*0.20);
      const mx=(this.startX+this.endX)/2, my=(this.startY+this.endY)/2, perp=this.ang+Math.PI/2;
      const bend=(Math.random()-0.5)*Math.min(W,H)*0.18;
      this.cp1x=mx+Math.cos(perp)*bend*0.8+(Math.random()-0.5)*W*0.06;
      this.cp1y=my+Math.sin(perp)*bend*0.8+(Math.random()-0.5)*H*0.06;
      this.cp2x=mx+Math.cos(perp)*bend*0.3+(Math.random()-0.5)*W*0.03;
      this.cp2y=my+Math.sin(perp)*bend*0.3+(Math.random()-0.5)*H*0.03;
      this.life=40+Math.floor(Math.random()*60); this.age=Math.floor(Math.random()*this.life);
      this.w=1.0+Math.random()*3.5; this.alpha=0.40+Math.random()*0.48;
      this.phase=Math.random()*Math.PI*2; this.speed=0.05+Math.random()*0.09;
      this.hStart=10+Math.random()*16; this.hEnd=48+Math.random()*16;
    }
    update(){this.age++;this.phase+=this.speed;if(this.age>this.life)this.reset();}
    draw(){
      const fl=0.5+0.5*Math.sin(this.phase), fade=Math.min(1,Math.min(this.age/10,(this.life-this.age)/10));
      const a=this.alpha*fl*fade; if(a<0.02)return;
      const segs=10;
      for(let i=0;i<segs;i++){
        const t0=i/segs, t1=(i+1)/segs;
        const b=(t,p0,p1,p2,p3)=>(1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t**2*p2+t**3*p3;
        const x0=b(t0,this.startX,this.cp1x,this.cp2x,this.endX), y0=b(t0,this.startY,this.cp1y,this.cp2y,this.endY);
        const x1=b(t1,this.startX,this.cp1x,this.cp2x,this.endX), y1=b(t1,this.startY,this.cp1y,this.cp2y,this.endY);
        const hue=this.hStart+(this.hEnd-this.hStart)*t1, light=45+48*t1, lw=this.w*(1.2-t1*0.45)*(0.7+0.3*fl);
        const g=ctx.createLinearGradient(x0,y0,x1,y1);
        g.addColorStop(0,`hsla(${hue|0},100%,${light|0}%,${(a*0.75).toFixed(2)})`);
        g.addColorStop(1,`hsla(${(hue+8)|0},100%,${Math.min(light+14,95)|0}%,${a.toFixed(2)})`);
        ctx.save();ctx.strokeStyle=g;ctx.lineWidth=lw;ctx.lineCap='round';
        if(t1>0.72){ctx.shadowColor=`hsla(${this.hEnd|0},100%,85%,0.85)`;ctx.shadowBlur=7*fl;}
        ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore();
      }
    }
  }
  class DriftParticle {
    constructor(){this.reset();}
    reset(){
      this.ang=Math.random()*Math.PI*2;
      const margin=0.76+Math.random()*0.16, rx=100*margin, ry=H*0.44*margin;
      this.x=CX+rx*Math.cos(this.ang); this.y=CY+ry*Math.sin(this.ang);
      const toCenter=this.ang+Math.PI, drift=(Math.random()-0.5)*0.7, spd=0.25+Math.random()*0.7;
      this.vx=Math.cos(toCenter+drift)*spd; this.vy=Math.sin(toCenter+drift)*spd;
      this.life=25+Math.floor(Math.random()*50); this.age=Math.floor(Math.random()*this.life);
      this.size=1.5+Math.random()*4.0; this.h=18+Math.random()*38;
    }
    update(){this.x+=this.vx;this.y+=this.vy;this.vx*=0.96;this.vy*=0.96;this.age++;if(this.age>this.life)this.reset();}
    draw(){
      const fade=1-this.age/this.life, sz=this.size*(0.3+0.7*fade);
      ctx.save();ctx.globalAlpha=fade*0.90;
      const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,sz*2);
      g.addColorStop(0,`hsla(${this.h+25},100%,90%,1)`);g.addColorStop(0.35,`hsla(${this.h+12},100%,70%,0.9)`);
      g.addColorStop(0.7,`hsla(${this.h},100%,48%,0.5)`);g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x,this.y,sz*2,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
  class LavaPool {
    constructor(){this.reset();}
    reset(){
      const irisR=Math.min(W,H)*0.27, maxR=100;
      this.angle=Math.random()*Math.PI*2; this.span=0.08+Math.random()*0.28;
      this.rS=irisR*0.95; this.rE=irisR*1.3+Math.random()*(maxR-irisR*1.2);
      this.phase=Math.random()*Math.PI*2; this.speed=0.012+Math.random()*0.028;
      this.life=80+Math.floor(Math.random()*200); this.age=Math.floor(Math.random()*this.life);
      this.h=18+Math.random()*36; this.alpha=0.25+Math.random()*0.45;
    }
    update(){this.age++;this.phase+=this.speed;if(this.age>this.life)this.reset();}
    draw(){
      const fl=0.4+0.6*Math.sin(this.phase), fade=Math.min(1,Math.min(this.age/20,(this.life-this.age)/20));
      const a=this.alpha*fl*fade; if(a<0.015)return;
      const a0=this.angle-this.span/2, a1=this.angle+this.span/2;
      const g=ctx.createRadialGradient(CX,CY,this.rS,CX,CY,this.rE);
      g.addColorStop(0,`hsla(${this.h+20},100%,72%,${(a*0.6).toFixed(2)})`);
      g.addColorStop(0.35,`hsla(${this.h+10},100%,60%,${a.toFixed(2)})`);
      g.addColorStop(0.7,`hsla(${this.h},100%,45%,${(a*0.7).toFixed(2)})`);
      g.addColorStop(1,`hsla(${this.h},100%,25%,0)`);
      ctx.save();ctx.beginPath();ctx.moveTo(CX,CY);ctx.arc(CX,CY,this.rE,a0,a1);ctx.arc(CX,CY,this.rS,a1,a0,true);
      ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.restore();
    }
  }
  class BrokenRay {
    constructor(){this.reset();}
    reset(){
      this.angle=Math.random()*Math.PI*2; this.waver=(Math.random()-0.5)*0.18;
      this.waverP=Math.random()*Math.PI*2; this.waverS=0.02+Math.random()*0.06;
      const irisR=Math.min(W,H)*0.27, maxR=100;
      const rS=irisR+Math.random()*irisR*0.2, rE=irisR*1.4+Math.random()*(maxR-irisR*1.3);
      this.segs=this._segs(rS,rE);
      this.w=1.0+Math.random()*4.5; this.alpha=0.5+Math.random()*0.48;
      this.phase=Math.random()*Math.PI*2; this.speed=0.03+Math.random()*0.08;
      this.life=50+Math.floor(Math.random()*180); this.age=Math.floor(Math.random()*this.life);
    }
    _segs(r0,r1){const s=[];let r=r0;while(r<r1){const on=5+Math.random()*22;const gap=Math.random()<0.35?1+Math.random()*7:0;s.push({r0:r,r1:Math.min(r+on,r1)});r+=on+gap;}return s;}
    update(){this.age++;this.phase+=this.speed;this.waverP+=this.waverS;if(this.age>this.life)this.reset();}
    draw(){
      const fl=0.45+0.55*Math.sin(this.phase), ang=this.angle+this.waver*Math.sin(this.waverP);
      const fade=Math.min(1,Math.min(this.age/16,(this.life-this.age)/16));
      const a=this.alpha*fl*fade; if(a<0.02)return;
      const lw=this.w*(0.65+0.35*fl);
      this.segs.forEach(seg=>{
        const x0=CX+Math.cos(ang)*seg.r0, y0=CY+Math.sin(ang)*seg.r0;
        const x1=CX+Math.cos(ang)*seg.r1, y1=CY+Math.sin(ang)*seg.r1;
        const bend=(Math.random()-0.5)*lw*2.5, mx=(x0+x1)/2+Math.sin(this.phase*1.5+seg.r0*0.1)*bend;
        const my=(y0+y1)/2+Math.cos(this.phase*1.2+seg.r0*0.1)*bend;
        const g=ctx.createLinearGradient(x0,y0,x1,y1);
        g.addColorStop(0,flameHSLA(a*0.6));g.addColorStop(0.35,flameHSLA(a));g.addColorStop(0.7,flameHSLA(a*0.85));g.addColorStop(1,flameHSLA(a*0.25));
        ctx.save();ctx.strokeStyle=g;ctx.lineWidth=lw;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();ctx.restore();
      });
    }
  }
  class GlowRay {
    constructor(){this.reset();}
    reset(){
      const irisR=Math.min(W,H)*0.27, maxR=100;
      this.angle=Math.random()*Math.PI*2; this.rS=irisR+Math.random()*irisR*0.22;
      this.rE=irisR*1.5+Math.random()*(maxR-irisR*1.35);
      this.w=12+Math.random()*28; this.alpha=0.18+Math.random()*0.38;
      this.phase=Math.random()*Math.PI*2; this.speed=0.018+Math.random()*0.042;
      this.life=80+Math.floor(Math.random()*240); this.age=Math.floor(Math.random()*this.life);
      this.waver=(Math.random()-0.5)*0.14; this.waverP=Math.random()*Math.PI*2; this.waverS=0.012+Math.random()*0.032;
    }
    update(){this.age++;this.phase+=this.speed;this.waverP+=this.waverS;if(this.age>this.life)this.reset();}
    draw(){
      const fl=0.4+0.6*Math.sin(this.phase), ang=this.angle+this.waver*Math.sin(this.waverP);
      const fade=Math.min(1,Math.min(this.age/24,(this.life-this.age)/24));
      const a=this.alpha*fl*fade; if(a<0.01)return;
      const x0=CX+Math.cos(ang)*this.rS, y0=CY+Math.sin(ang)*this.rS;
      const x1=CX+Math.cos(ang)*this.rE, y1=CY+Math.sin(ang)*this.rE;
      const g=ctx.createLinearGradient(x0,y0,x1,y1);
      g.addColorStop(0,lavaHSLA(a*0.5));g.addColorStop(0.4,lavaHSLA(a));g.addColorStop(1,lavaHSLA(a*0.12));
      ctx.save();ctx.strokeStyle=g;ctx.lineWidth=this.w*(0.7+0.3*fl);ctx.lineCap='round';ctx.filter='blur(5px)';
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore();
    }
  }
  class IrisRay {
    constructor(){this.reset();}
    reset(){
      const irisR=Math.min(W,H)*0.27;
      this.angle=Math.random()*Math.PI*2;
      this.segs=this._segs(4+Math.random()*irisR*0.22, irisR*0.25+Math.random()*irisR*0.60);
      this.w=1.0+Math.random()*3.5; this.alpha=0.4+Math.random()*0.55;
      this.phase=Math.random()*Math.PI*2; this.speed=0.04+Math.random()*0.09;
      this.waver=(Math.random()-0.5)*0.15; this.waverP=Math.random()*Math.PI*2; this.waverS=0.03+Math.random()*0.055;
      this.life=45+Math.floor(Math.random()*150); this.age=Math.floor(Math.random()*this.life);
    }
    _segs(r0,r1){const s=[];let r=r0;while(r<r1){const on=6+Math.random()*18;const gap=Math.random()<0.3?1+Math.random()*7:0;s.push({r0:r,r1:Math.min(r+on,r1)});r+=on+gap;}return s;}
    update(){this.age++;this.phase+=this.speed;this.waverP+=this.waverS;if(this.age>this.life)this.reset();}
    draw(){
      const fl=0.5+0.5*Math.sin(this.phase), ang=this.angle+this.waver*Math.sin(this.waverP);
      const fade=Math.min(1,Math.min(this.age/14,(this.life-this.age)/14));
      const a=this.alpha*fl*fade; if(a<0.02)return;
      const lw=this.w*(0.7+0.3*fl);
      this.segs.forEach(seg=>{
        const x0=CX+Math.cos(ang)*seg.r0, y0=CY+Math.sin(ang)*seg.r0;
        const x1=CX+Math.cos(ang)*seg.r1, y1=CY+Math.sin(ang)*seg.r1;
        const bend=(Math.random()-0.5)*lw*2, mx=(x0+x1)/2+Math.sin(this.phase*1.3)*bend;
        const my=(y0+y1)/2+Math.cos(this.phase*1.1)*bend;
        const g=ctx.createLinearGradient(x0,y0,x1,y1);
        g.addColorStop(0,flameHSLA(a*0.55));g.addColorStop(0.4,flameHSLA(a));g.addColorStop(1,flameHSLA(a*0.22));
        ctx.save();ctx.strokeStyle=g;ctx.lineWidth=lw;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();ctx.restore();
      });
    }
  }
  class PupilRimFlame {
    constructor(idx,total){this.idx=idx;this.total=total;this.reset();}
    reset(){
      const irisR=Math.min(W,H)*0.27, pw=irisR*0.24, ph=irisR*0.82;
      const baseAng=(this.idx/this.total)*Math.PI*2, jitter=(Math.random()-0.5)*(Math.PI*2/this.total)*0.8;
      this.ang=baseAng+jitter; this.span=0.05+Math.random()*0.20; this.rimR=0.90+Math.random()*0.16;
      this.phase=Math.random()*Math.PI*2; this.speed=0.04+Math.random()*0.08;
      this.life=30+Math.floor(Math.random()*55); this.age=Math.floor(Math.random()*this.life);
      this.alpha=0.45+Math.random()*0.50; this.h=10+Math.random()*22; this.pw=pw; this.ph=ph;
    }
    update(){this.age++;this.phase+=this.speed;if(this.age>this.life)this.reset();}
    draw(ox){
      const fl=0.5+0.5*Math.sin(this.phase), fade=Math.min(1,Math.min(this.age/10,(this.life-this.age)/10));
      const a=this.alpha*fl*fade; if(a<0.03)return;
      const pw=this.pw*this.rimR, ph=this.ph*this.rimR, steps=14;
      for(let i=0;i<steps;i++){
        const a0=this.ang+(i/steps)*this.span, a1=this.ang+((i+1)/steps)*this.span;
        const x0=ox+pw*Math.cos(a0), y0=CY+ph*Math.sin(a0);
        const x1=ox+pw*Math.cos(a1), y1=CY+ph*Math.sin(a1);
        const frac=i/steps;
        ctx.save();ctx.strokeStyle=`hsla(${(this.h+frac*14)|0},100%,${(50+30*frac)|0}%,${a.toFixed(2)})`;
        ctx.lineWidth=3+5*fl*(1-frac);ctx.lineCap='round';
        ctx.shadowColor=`hsla(${this.h|0},100%,70%,0.75)`;ctx.shadowBlur=9*fl;
        ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore();
      }
    }
  }
  let lavaPools=[],glowRays=[],conjRays=[],irisRays=[],driftParticles=[],inwardFlames=[],darkBlobs=[],pupilRimFlames=[];
  function initObjects(){
    lavaPools      = Array.from({length:55},()=>new LavaPool());
    glowRays       = Array.from({length:38},()=>new GlowRay());
    conjRays       = Array.from({length:85},()=>new BrokenRay());
    irisRays       = Array.from({length:26},()=>new IrisRay());
    driftParticles = Array.from({length:100},()=>{const e=new DriftParticle();e.age=Math.floor(Math.random()*e.life);return e;});
    inwardFlames   = Array.from({length:90},()=>{const e=new InwardFlame();e.age=Math.floor(Math.random()*e.life);return e;});
    pupilRimFlames = Array.from({length:55},(_,i)=>new PupilRimFlame(i,55));
    darkBlobs      = Array.from({length:8},()=>({
      x:CX+(Math.random()-0.5)*W*0.7, y:CY+(Math.random()-0.5)*H*0.65,
      rx:H*0.07+Math.random()*H*0.14, ry:H*0.04+Math.random()*H*0.10,
      phase:Math.random()*Math.PI*2, speed:0.006+Math.random()*0.014, maxA:0.16+Math.random()*0.28
    }));
  }
  let gazeT=0, pupilX=0, pupilSkew=0;
  function render(){
    gazeT+=0.008; pupilX=Math.sin(gazeT*0.38)*W*0.008+Math.sin(gazeT*0.17)*W*0.004; pupilSkew=pupilX/(W*0.06);
    const irisR=Math.min(W,H)*0.27, ox=CX+pupilX;
    ctx.clearRect(0,0,W,H); ctx.fillStyle='#030000'; ctx.fillRect(0,0,W,H);
    const outerGl=ctx.createRadialGradient(CX,CY,irisR*1.1,CX,CY,160);
    outerGl.addColorStop(0,'rgba(200,80,0,0.22)');outerGl.addColorStop(0.4,'rgba(160,40,0,0.12)');outerGl.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=outerGl; ctx.fillRect(0,0,W,H);
    ctx.save(); catEyePath(1.0); ctx.clip();
    ctx.fillStyle='#040000'; ctx.fillRect(0,0,W,H);
    const cb=ctx.createRadialGradient(CX,CY,irisR,CX,CY,120);
    cb.addColorStop(0,'rgba(120,28,0,0)');cb.addColorStop(0.18,'rgba(140,42,0,0.65)');cb.addColorStop(0.45,'rgba(100,18,0,0.72)');cb.addColorStop(1,'rgba(5,0,0,0.95)');
    ctx.fillStyle=cb; ctx.fillRect(0,0,W,H);
    lavaPools.forEach(r=>{r.update();r.draw();}); glowRays.forEach(r=>{r.update();r.draw();}); conjRays.forEach(r=>{r.update();r.draw();});
    inwardFlames.forEach(e=>{e.update();e.draw();}); driftParticles.forEach(e=>{e.update();e.draw();}); ctx.restore();
    for(const [blur,alpha,prob] of [[3.0,0.70,0.55],[6.0,0.45,0.35],[1.0,0.85,0.40]]){
      ctx.save();ctx.filter=`blur(${blur}px)`;ctx.globalAlpha=alpha;
      conjRays.forEach(r=>{if(Math.random()<prob)r.draw();}); inwardFlames.forEach(e=>{if(Math.random()<prob*0.7)e.draw();}); ctx.restore();
    }
    ctx.save(); catEyePath(1.0); ctx.clip();
    darkBlobs.forEach(b=>{
      b.phase+=b.speed; const a=b.maxA*Math.max(0,Math.sin(b.phase)); if(a<0.02)return;
      ctx.save();ctx.translate(b.x,b.y);ctx.scale(1,b.ry/b.rx);
      const dg=ctx.createRadialGradient(0,0,0,0,0,b.rx);
      dg.addColorStop(0,`rgba(0,0,0,${a})`);dg.addColorStop(0.5,`rgba(0,0,0,${a*0.3})`);dg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=dg;ctx.beginPath();ctx.arc(0,0,b.rx,0,Math.PI*2);ctx.fill();ctx.restore();
    });
    const rball=ctx.createRadialGradient(CX,CY,0,CX,CY,irisR*1.36);
    rball.addColorStop(0,'rgba(180,22,0,0.88)');rball.addColorStop(0.44,'rgba(120,8,0,0.45)');rball.addColorStop(0.76,'rgba(50,0,0,0.18)');rball.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rball; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,irisR,0,Math.PI*2); ctx.clip();
    const irg=ctx.createRadialGradient(CX,CY,0,CX,CY,irisR);
    irg.addColorStop(0,'rgba(55,4,0,0.92)');irg.addColorStop(0.5,'rgba(80,8,0,0.75)');irg.addColorStop(0.8,'rgba(60,6,0,0.55)');irg.addColorStop(1,'rgba(28,3,0,0.38)');
    ctx.fillStyle=irg; ctx.fillRect(0,0,W,H);
    const ieg=ctx.createRadialGradient(CX,CY,irisR*0.50,CX,CY,irisR);
    ieg.addColorStop(0,'rgba(110,16,0,0)');ieg.addColorStop(0.6,'rgba(155,26,0,0.20)');ieg.addColorStop(0.85,'rgba(195,38,0,0.40)');ieg.addColorStop(1,'rgba(220,50,0,0.16)');
    ctx.fillStyle=ieg; ctx.fillRect(0,0,W,H);
    irisRays.forEach(r=>{r.update();r.draw();});
    [[CX-irisR*0.28,CY-irisR*0.22,irisR*0.20,irisR*0.13,2.0],[CX+irisR*0.24,CY+irisR*0.18,irisR*0.17,irisR*0.12,1.75],[CX-irisR*0.05,CY+irisR*0.26,irisR*0.15,irisR*0.09,2.4]].forEach(([x,y,rx,ry,spd],i)=>{
      const a=0.24*Math.max(0,Math.sin(gazeT*spd+i*2.2)); if(a<0.02)return;
      ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);
      const dg=ctx.createRadialGradient(0,0,0,0,0,rx);dg.addColorStop(0,`rgba(0,0,0,${a})`);dg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=dg;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();
    });
    pupilRimFlames.forEach(r=>{r.update();});
    const pw=irisR*(0.24+pupilSkew*0.04), ph=irisR*(0.82-Math.abs(pupilSkew)*0.03);
    pupilRimFlames.forEach(r=>r.draw(ox));
    ctx.save(); ctx.translate(ox,CY);
    ctx.beginPath();ctx.moveTo(0,-ph);
    ctx.bezierCurveTo(pw*0.65,-ph*0.55,pw,-ph*0.26,pw,0);ctx.bezierCurveTo(pw,ph*0.26,pw*0.65,ph*0.55,0,ph);
    ctx.bezierCurveTo(-pw*0.65,ph*0.55,-pw,ph*0.26,-pw,0);ctx.bezierCurveTo(-pw,-ph*0.26,-pw*0.65,-ph*0.55,0,-ph);
    ctx.closePath(); ctx.fillStyle='#000'; ctx.fill(); ctx.restore();
    ctx.restore(); ctx.restore(); ctx.restore();
    requestAnimationFrame(render);
  }
  canvas.style.width='100%'; canvas.style.height='100%';
  resize();
  new ResizeObserver(()=>resize()).observe(canvas.parentElement);
  render();
}
