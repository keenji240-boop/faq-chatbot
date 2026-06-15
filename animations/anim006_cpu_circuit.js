/* ========================================
   006 CPU Circuit
   initAnim(container) を呼ぶと描画開始
======================================== */
function initAnim(container) {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  container.appendChild(cv);

  const W = cv.width  = container.offsetWidth  || 680;
  const H = cv.height = container.offsetHeight || 150;
  const ctx = cv.getContext('2d');
  const OX = W/2, OY = 82;

  function iso(x,y,z=0){ return {x:OX+(x-y)*0.866*0.48, y:OY+(x+y)*0.5*0.48-z*1.1}; }
  const CW=155, CD=155, CH=11, CX0=-CW/2, CY0=-CD/2;
  function extendToEdge(px,py,tx,ty){
    const dx=tx-px, dy=ty-py;
    if(Math.abs(dx)<0.001&&Math.abs(dy)<0.001) return {x:tx,y:ty};
    const ts=[];
    if(dx>0)ts.push((W-px)/dx); if(dx<0)ts.push(-px/dx);
    if(dy>0)ts.push((H-py)/dy); if(dy<0)ts.push(-py/dy);
    const t=Math.min(...ts.filter(v=>v>0));
    return {x:px+dx*t, y:py+dy*t};
  }
  const connTop=[], connBot=[], connLeft=[], connRight=[];
  for(let i=0;i<16;i++){const t=(i+0.5)/16; connTop.push({x:CX0+CW*t,y:CY0}); connBot.push({x:CX0+CW*t,y:CY0+CD});}
  for(let i=0;i<10;i++){const t=(i+0.5)/10; connLeft.push({x:CX0,y:CY0+CD*t}); connRight.push({x:CX0+CW,y:CY0+CD*t});}
  const SLINES=[];
  connTop.forEach((c,i)=>{const sp=iso(c.x,c.y,0),dir=iso(c.x,c.y-80,0),ex=extendToEdge(sp.x,sp.y,dir.x,dir.y);if(i%3===0){const mid={x:sp.x+(ex.x-sp.x)*0.4,y:sp.y+(ex.y-sp.y)*0.4},mid2={x:mid.x+(i%2===0?20:-20),y:mid.y},ex2=extendToEdge(mid2.x,mid2.y,mid2.x+(ex.x-sp.x)*0.3,mid2.y+(ex.y-sp.y));SLINES.push({spts:[sp,mid,mid2,ex2]});}else{SLINES.push({spts:[sp,ex]});}});
  connBot.forEach((c,i)=>{const sp=iso(c.x,c.y,0),dir=iso(c.x,c.y+80,0),ex=extendToEdge(sp.x,sp.y,dir.x,dir.y);if(i%3===1){const mid={x:sp.x+(ex.x-sp.x)*0.35,y:sp.y+(ex.y-sp.y)*0.35},mid2={x:mid.x+(i%2===0?-18:18),y:mid.y},ex2=extendToEdge(mid2.x,mid2.y,mid2.x+(ex.x-sp.x)*0.2,mid2.y+(ex.y-sp.y));SLINES.push({spts:[sp,mid,mid2,ex2]});}else{SLINES.push({spts:[sp,ex]});}});
  connLeft.forEach((c,i)=>{const sp=iso(c.x,c.y,0),dir=iso(c.x-80,c.y,0),ex=extendToEdge(sp.x,sp.y,dir.x,dir.y);if(i%2===0){const mid={x:sp.x+(ex.x-sp.x)*0.45,y:sp.y+(ex.y-sp.y)*0.45},mid2={x:mid.x,y:mid.y+(i%3===0?15:-15)},ex2=extendToEdge(mid2.x,mid2.y,mid2.x+(ex.x-sp.x),mid2.y+(ex.y-sp.y)*0.3);SLINES.push({spts:[sp,mid,mid2,ex2]});}else{SLINES.push({spts:[sp,ex]});}});
  connRight.forEach((c,i)=>{const sp=iso(c.x,c.y,0),dir=iso(c.x+80,c.y,0),ex=extendToEdge(sp.x,sp.y,dir.x,dir.y);if(i%2===1){const mid={x:sp.x+(ex.x-sp.x)*0.4,y:sp.y+(ex.y-sp.y)*0.4},mid2={x:mid.x,y:mid.y+(i%3===0?-12:12)},ex2=extendToEdge(mid2.x,mid2.y,mid2.x+(ex.x-sp.x),mid2.y+(ex.y-sp.y)*0.3);SLINES.push({spts:[sp,mid,mid2,ex2]});}else{SLINES.push({spts:[sp,ex]});}});
  function sLen(spts){let l=0;for(let i=1;i<spts.length;i++){const dx=spts[i].x-spts[i-1].x,dy=spts[i].y-spts[i-1].y;l+=Math.sqrt(dx*dx+dy*dy);}return l;}
  function sAt(spts,t){const tot=sLen(spts);let tgt=((t%1)+1)%1*tot,acc=0;for(let i=1;i<spts.length;i++){const dx=spts[i].x-spts[i-1].x,dy=spts[i].y-spts[i-1].y,seg=Math.sqrt(dx*dx+dy*dy);if(acc+seg>=tgt){const r=(tgt-acc)/seg;return{x:spts[i-1].x+dx*r,y:spts[i-1].y+dy*r};}acc+=seg;}return spts[spts.length-1];}
  const elecs=[];
  SLINES.forEach(l=>{const n=2+Math.floor(Math.random()*3);for(let k=0;k<n;k++)elecs.push({l,t:Math.random(),sp:(0.003+Math.random()*0.005)*(Math.random()<.5?1:-1),tr:[],c:Math.random()<.6?0:1});});
  const nodes=[];
  for(let r=0;r<3;r++)for(let c=0;c<4;c++)nodes.push({x:CX0+22+c*38,y:CY0+22+r*40,phase:Math.random()*Math.PI*2,spd:0.035+Math.random()*0.025});
  const innerGrid=[];
  for(let r=0;r<4;r++)innerGrid.push([{x:CX0+10,y:CY0+12+r*33},{x:-CX0-10,y:CY0+12+r*33}]);
  for(let c=0;c<5;c++)innerGrid.push([{x:CX0+12+c*30,y:CY0+10},{x:CX0+12+c*30,y:-CY0-10}]);
  function isoRect(x0,y0,w,d,z,fill,stroke,lw=1){const tl=iso(x0,y0,z),tr=iso(x0+w,y0,z),br=iso(x0+w,y0+d,z),bl=iso(x0,y0+d,z);ctx.beginPath();ctx.moveTo(tl.x,tl.y);ctx.lineTo(tr.x,tr.y);ctx.lineTo(br.x,br.y);ctx.lineTo(bl.x,bl.y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
  function isoSide(x0,y0,w,d,z0,z1,side,fill,stroke,lw=1){let pts;if(side==='front'){const a=iso(x0,y0+d,z0),b=iso(x0+w,y0+d,z0),c=iso(x0+w,y0+d,z1),dd=iso(x0,y0+d,z1);pts=[a,b,c,dd];}else{const a=iso(x0+w,y0,z0),b=iso(x0+w,y0+d,z0),c=iso(x0+w,y0+d,z1),dd=iso(x0+w,y0,z1);pts=[a,b,c,dd];}ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
  let tick=0;
  function draw(){
    ctx.clearRect(0,0,W,H); tick+=0.022;
    const P=(Math.sin(tick)+1)/2, P2=(Math.sin(tick*1.6+0.8)+1)/2;
    SLINES.forEach(l=>{ctx.beginPath();ctx.moveTo(l.spts[0].x,l.spts[0].y);for(let i=1;i<l.spts.length;i++)ctx.lineTo(l.spts[i].x,l.spts[i].y);ctx.strokeStyle='rgba(0,130,200,0.3)';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.moveTo(l.spts[0].x,l.spts[0].y);for(let i=1;i<l.spts.length;i++)ctx.lineTo(l.spts[i].x,l.spts[i].y);ctx.strokeStyle='rgba(0,190,255,0.07)';ctx.lineWidth=3.5;ctx.stroke();});
    isoSide(CX0-2,CY0-2,CW+4,CD+4,-2,0,'front','rgba(0,25,52,0.7)','rgba(0,88,168,0.28)',0.7);
    isoSide(CX0-2,CY0-2,CW+4,CD+4,-2,0,'right','rgba(0,16,38,0.7)','rgba(0,68,148,0.22)',0.7);
    isoRect(CX0-2,CY0-2,CW+4,CD+4,-2,'rgba(0,10,26,0.55)','rgba(0,108,188,0.18)',0.5);
    ctx.save();ctx.shadowBlur=12;ctx.shadowColor='rgba(0,140,255,0.35)';
    isoSide(CX0,CY0,CW,CD,0,CH,'front','rgba(0,20,50,0.94)',`rgba(0,${148+P*58},255,0.64)`,1);
    isoSide(CX0,CY0,CW,CD,0,CH,'right','rgba(0,14,38,0.94)',`rgba(0,${118+P*50},220,0.54)`,1);
    ctx.restore();
    ctx.save();ctx.shadowBlur=24;ctx.shadowColor=`rgba(0,165,255,0.48)`;
    isoRect(CX0,CY0,CW,CD,CH,'rgba(0,8,24,0.97)',`rgba(0,${168+P*62},255,0.84)`,1.5);
    ctx.restore();
    const bv=10,corners=[[CX0+bv,CY0],[CX0+CW-bv,CY0],[CX0+CW,CY0+bv],[CX0+CW,CY0+CD-bv],[CX0+CW-bv,CY0+CD],[CX0+bv,CY0+CD],[CX0,CY0+CD-bv],[CX0,CY0+bv]];
    const ic=corners.map(p=>iso(p[0],p[1],CH));
    ctx.beginPath();ctx.moveTo(ic[0].x,ic[0].y);for(let i=1;i<ic.length;i++)ctx.lineTo(ic[i].x,ic[i].y);ctx.closePath();
    ctx.strokeStyle='rgba(0,145,215,0.38)';ctx.lineWidth=0.8;ctx.stroke();
    for(let i=0;i<10;i++){const t=(i+1)/11;[[CX0+CW*t,CY0],[CX0+CW*t,CY0+CD],[CX0,CY0+CD*t],[CX0+CW,CY0+CD*t]].forEach(([px,py])=>{const a=iso(px,py,CH),b=iso(px,py,CH+5);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(0,${183+P*55},255,0.72)`;ctx.lineWidth=1.4;ctx.stroke();});}
    innerGrid.forEach(l=>{const p=l.map(pt=>iso(pt.x,pt.y,CH));ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.strokeStyle='rgba(0,148,208,0.2)';ctx.lineWidth=0.5;ctx.stroke();});
    nodes.forEach(n=>{const v=(Math.sin(tick*n.spd*45+n.phase)+1)/2,v2=(Math.sin(tick*n.spd*28+n.phase+2)+1)/2,p=iso(n.x,n.y,CH+0.5),r=3.2+v*2.8;ctx.save();ctx.shadowBlur=14+v*20;ctx.shadowColor=`rgba(${38+v2*125},${188+v2*67},255,0.95)`;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,`rgba(${155+v2*100},${222+v2*33},255,${0.88+v*0.12})`);g.addColorStop(0.5,`rgba(0,${158+v*82},255,${0.38+v*0.32})`);g.addColorStop(1,'rgba(0,95,198,0)');ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.restore();ctx.beginPath();ctx.arc(p.x,p.y,1.2,0,Math.PI*2);ctx.fillStyle=`rgba(218,248,255,${0.72+v*0.28})`;ctx.fill();});
    const cc=iso(0,0,CH+1),cg=ctx.createRadialGradient(cc.x,cc.y,0,cc.x,cc.y,62);
    cg.addColorStop(0,`rgba(0,178,255,${0.03+P2*0.1})`);cg.addColorStop(1,'rgba(0,78,198,0)');
    ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cc.x,cc.y,62,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.shadowBlur=18+P2*20;ctx.shadowColor=`rgba(0,210,255,${0.58+P2*0.42})`;
    isoRect(CX0+12,CY0+12,CW-24,CD-24,CH+0.3,null,`rgba(${55+P2*135},${203+P2*52},255,${0.42+P2*0.58})`,1.5);
    ctx.restore();
    elecs.forEach(e=>{e.t+=e.sp;const pos=sAt(e.l.spts,e.t);e.tr.push({...pos});if(e.tr.length>20)e.tr.shift();for(let i=0;i<e.tr.length;i++){const a=i/e.tr.length;ctx.beginPath();ctx.arc(e.tr[i].x,e.tr[i].y,1.3*a,0,Math.PI*2);ctx.fillStyle=e.c===0?`rgba(0,215,255,${a*0.55})`:`rgba(200,240,255,${a*0.4})`;ctx.fill();}ctx.save();ctx.shadowBlur=11;ctx.shadowColor=e.c===0?'rgba(0,220,255,1)':'rgba(210,245,255,1)';ctx.beginPath();ctx.arc(pos.x,pos.y,2,0,Math.PI*2);ctx.fillStyle=e.c===0?'rgba(75,228,255,1)':'rgba(255,255,255,1)';ctx.fill();ctx.restore();});
    requestAnimationFrame(draw);
  }
  draw();
}
