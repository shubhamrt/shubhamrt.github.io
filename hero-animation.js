(function () {
  const canvas = document.getElementById("drylandCanvas");
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  let t = 0;

  // dust particles
  const particles = [];
  const PARTICLE_COUNT = 80;

  // network nodes
  let nodes = [];
  let links = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeNetworkLayout() {
    nodes = [];
    links = [];

    // two ridge lines (bands across the hero)
    const ridge1Y = h * 0.35;
    const ridge2Y = h * 0.52;

    const ridgeCount = 9;
    for (let i = 0; i < ridgeCount; i++) {
      const frac = i / (ridgeCount - 1); // 0 -> 1
      nodes.push({
        x: w * (0.15 + frac * 0.7) + rand(-10, 10),
        y: ridge1Y + rand(-10, 10),
        vx: rand(-0.1, 0.1),
        vy: rand(-0.1, 0.1),
        type: "ridge1",
      });
    }
    for (let i = 0; i < ridgeCount; i++) {
      const frac = i / (ridgeCount - 1);
      nodes.push({
        x: w * (0.15 + frac * 0.7) + rand(-10, 10),
        y: ridge2Y + rand(-10, 10),
        vx: rand(-0.1, 0.1),
        vy: rand(-0.1, 0.1),
        type: "ridge2",
      });
    }

    // hotspot cluster (degraded patch) in the middle-ish
    const hotspotCenterX = w * 0.5;
    const hotspotCenterY = h * 0.43;
    for (let i = 0; i < 5; i++) {
      nodes.push({
        x: hotspotCenterX + rand(-20, 20),
        y: hotspotCenterY + rand(-20, 20),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.15, 0.15),
        type: "hotspot",
      });
    }

    // build links:
    // connect sequential ridge nodes
    function linkSequential(startIdx, count) {
      for (let i = 0; i < count - 1; i++) {
        links.push([startIdx + i, startIdx + i + 1]);
      }
    }
    const r1Start = 0;
    const r2Start = ridgeCount;
    linkSequential(r1Start, ridgeCount);           // ridge1 chain
    linkSequential(r2Start, ridgeCount);           // ridge2 chain

    // connect hotspot nodes together (small dense cluster)
    const hotspotStart = ridgeCount * 2;
    for (let i = hotspotStart; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        links.push([i, j]);
      }
    }

    // connect hotspot to nearest few ridge nodes for cross links
    for (let i = hotspotStart; i < nodes.length; i++) {
      // pick a few random ridge neighbors
      const r1Index = r1Start + Math.floor(rand(2, ridgeCount - 3));
      const r2Index = r2Start + Math.floor(rand(2, ridgeCount - 3));
      links.push([i, r1Index]);
      links.push([i, r2Index]);
    }
  }

  function init() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);

    // init particles (wind-blown dust)
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: rand(0, w),
        y: rand(h * 0.15, h * 0.75),
        vx: rand(0.15, 0.4),
        vy: rand(-0.05, 0.05),
        r: rand(0.5, 1.4),
        life: rand(0, 200),
      });
    }

    makeNetworkLayout();
  }

  // draw gently shaded dune silhouettes at bottom of hero
  function drawDuneSilhouette() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    const baseY = h * 0.78;
    for (let x = 0; x <= w; x += 10) {
      const y =
        baseY +
        Math.sin((x * 0.01) + t * 0.01) * 12 +
        Math.cos((x * 0.003) - t * 0.008) * 18;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    const baseY2 = h * 0.85;
    for (let x = 0; x <= w; x += 10) {
      const y =
        baseY2 +
        Math.sin((x * 0.012) + t * 0.015) * 8 +
        Math.cos((x * 0.004) - t * 0.01) * 12;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function updateParticles() {
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 1;
      // recycle when off-screen
      if (p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        p.x = -10;
        p.y = rand(h * 0.15, h * 0.75);
        p.vx = rand(0.15, 0.4);
        p.vy = rand(-0.05, 0.05);
        p.life = 0;
      }
    }
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let p of particles) {
      // pale sandy/airy dots
      const alpha = 0.08 + 0.08 * Math.sin(p.life * 0.05);
      ctx.fillStyle = `rgba(255,255,240,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function updateNetwork() {
    // gentle jitter + soft bounds
    for (let n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // keep them near their band area (not bouncing wildly)
      if (n.type === "ridge1") {
        const targetY = h * 0.35;
        n.vy += (targetY - n.y) * 0.0005;
      } else if (n.type === "ridge2") {
        const targetY = h * 0.52;
        n.vy += (targetY - n.y) * 0.0005;
      } else if (n.type === "hotspot") {
        const targetY = h * 0.43;
        n.vy += (targetY - n.y) * 0.0005;
      }

      n.vx += rand(-0.01, 0.01);
      n.vy += rand(-0.01, 0.01);

      // light damping so they don't drift too far horizontally
      n.vx *= 0.98;
      n.vy *= 0.98;
    }
  }

  function drawNetwork() {
    ctx.save();

    // LINKS
    ctx.lineWidth = 1;
    for (let [i, j] of links) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // subtle breathing alpha
      const pulse = 0.5 + 0.3 * Math.sin((t * 0.015) + dist * 0.02);

      ctx.strokeStyle = `rgba(255,255,255,${0.15 * pulse})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // NODES
    for (let n of nodes) {
      const glow = 0.5 + 0.5 * Math.sin((t * 0.02) + n.x * 0.015);
      const r = 2.5;

      // core point
      ctx.fillStyle = `rgba(255,255,255,${0.4 + glow * 0.4})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();

      // soft halo
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
      grad.addColorStop(0, "rgba(255,255,255,0.25)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function frame() {
    t += 1;
    // fully clear canvas each frame
    ctx.clearRect(0, 0, w, h);

    drawParticles();
    drawNetwork();
    drawDuneSilhouette();

    updateParticles();
    updateNetwork();

    requestAnimationFrame(frame);
  }

  init();
  frame();

  window.addEventListener("resize", () => {
    init();
  });
})();
