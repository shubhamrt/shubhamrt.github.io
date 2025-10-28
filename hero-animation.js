/**
 * Hero animation:
 * - shifting dune layers (parallax ribbons)
 * - wind-blown sand particles
 * - network graph to represent dryland connectivity
 */

(function () {
  const canvas = document.getElementById("drylandCanvas");
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  let t = 0;

  // dune layers
  const duneLayers = [
    { amp: 40, speed: 0.04, offsetY: 0.65, color: "rgba(20,15,30,0.5)" },
    { amp: 60, speed: 0.025, offsetY: 0.7, color: "rgba(50,25,35,0.35)" },
    { amp: 90, speed: 0.015, offsetY: 0.78, color: "rgba(140,70,40,0.15)" },
  ];

  // sand particles
  const particles = [];
  const PARTICLE_COUNT = 90;

  // network graph
  const nodeCount = 24;
  const nodes = [];
  const links = [];
  const linkDist = 160;

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function init() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // init particles
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: randRange(0, w),
        y: randRange(h * 0.1, h * 0.8),
        vx: randRange(0.2, 0.6),
        vy: randRange(-0.05, 0.05),
        r: randRange(0.5, 1.5),
        life: randRange(0, 200),
      });
    }

    // init nodes
    nodes.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: randRange(w * 0.2, w * 0.8),
        y: randRange(h * 0.2, h * 0.5),
        vx: randRange(-0.3, 0.3),
        vy: randRange(-0.3, 0.3),
      });
    }

    // build links (simple proximity)
    links.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          links.push([i, j]);
        }
      }
    }
  }

  function drawGradientBackground() {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#441312");     // dark rust
    grad.addColorStop(0.3, "#8a3b21");   // eroded soil
    grad.addColorStop(0.7, "#1a1d38");   // shadowed dune
    grad.addColorStop(1, "#0f0f10");     // night base
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // radial glow accents
    const rgrad1 = ctx.createRadialGradient(
      w * 0.2,
      h * 0.25,
      0,
      w * 0.2,
      h * 0.25,
      w * 0.6
    );
    rgrad1.addColorStop(0, "rgba(255,138,60,0.35)");
    rgrad1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rgrad1;
    ctx.fillRect(0, 0, w, h);

    const rgrad2 = ctx.createRadialGradient(
      w * 0.8,
      h * 0.7,
      0,
      w * 0.8,
      h * 0.7,
      w * 0.6
    );
    rgrad2.addColorStop(0, "rgba(49,74,140,0.25)");
    rgrad2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rgrad2;
    ctx.fillRect(0, 0, w, h);
  }

  function drawDunes() {
    duneLayers.forEach((layer, idx) => {
      ctx.beginPath();
      const baseY = h * layer.offsetY;
      for (let x = 0; x <= w; x += 10) {
        const y =
          baseY +
          Math.sin((x * 0.01) + t * layer.speed * 2 + idx * 1.3) *
            layer.amp *
            0.4 +
          Math.cos((x * 0.003) - t * layer.speed * 1.5 + idx) *
            layer.amp *
            0.6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
    });
  }

  function updateParticles() {
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 1;
      if (p.x > w || p.y < -20 || p.y > h + 20) {
        // recycle
        p.x = -10;
        p.y = randRange(h * 0.1, h * 0.8);
        p.vx = randRange(0.2, 0.6);
        p.vy = randRange(-0.05, 0.05);
        p.life = 0;
      }
    }
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let p of particles) {
      const alpha = 0.15 + 0.15 * Math.sin(p.life * 0.05);
      ctx.fillStyle = `rgba(255,220,180,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function updateNetwork() {
    // gently move nodes, bounce back in zone
    for (let n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // soft bounds within central-ish band
      if (n.x < w * 0.15 || n.x > w * 0.85) n.vx *= -1;
      if (n.y < h * 0.15 || n.y > h * 0.55) n.vy *= -1;

      // tiny random jitter to keep it alive
      n.vx += randRange(-0.02, 0.02);
      n.vy += randRange(-0.02, 0.02);

      // limit velocity
      const maxV = 0.4;
      if (n.vx > maxV) n.vx = maxV;
      if (n.vx < -maxV) n.vx = -maxV;
      if (n.vy > maxV) n.vy = maxV;
      if (n.vy < -maxV) n.vy = -maxV;
    }
  }

  function drawNetwork() {
    ctx.save();

    // links (semi-transparent, warm tone)
    ctx.lineWidth = 1;
    for (let [i, j] of links) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // subtle pulse
      const pulse =
        0.4 + 0.3 * Math.sin((t * 0.02) + dist * 0.02);

      ctx.strokeStyle = `rgba(255,138,60,${0.15 * pulse})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // nodes (brighter points)
    for (let n of nodes) {
      const glow = 0.5 + 0.5 * Math.sin((t * 0.03) + n.x * 0.01);
      ctx.fillStyle = `rgba(255,170,100,${0.4 + glow * 0.4})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // outer soft glow
      const radial = ctx.createRadialGradient(
        n.x,
        n.y,
        0,
        n.x,
        n.y,
        18
      );
      radial.addColorStop(0, "rgba(255,138,60,0.4)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function frame() {
    t += 1;

    drawGradientBackground();
    drawDunes();
    updateParticles();
    drawParticles();
    updateNetwork();
    drawNetwork();

    requestAnimationFrame(frame);
  }

  init();
  frame();

  window.addEventListener("resize", () => {
    init();
  });
})();
