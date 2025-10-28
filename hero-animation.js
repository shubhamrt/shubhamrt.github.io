(function () {
  const canvas = document.getElementById("drylandCanvas");
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  let t = 0;

  // ------ dune layers (as line strokes, white-ish, to feel like contour lines)
  const duneLayers = [
    { amp: 40, speed: 0.04, offsetY: 0.65, stroke: "rgba(255,255,255,0.08)" },
    { amp: 60, speed: 0.025, offsetY: 0.72, stroke: "rgba(255,255,255,0.06)" },
    { amp: 90, speed: 0.015, offsetY: 0.8, stroke: "rgba(255,255,255,0.04)" },
  ];

  // ------ dust particles (wind-blown sand / aerosols)
  const particles = [];
  const PARTICLE_COUNT = 90;

  // ------ network graph (dryland connectivity)
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
    ctx.setTransform(1,0,0,1,0,0); // reset before scale
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
        x: randRange(w * 0.25, w * 0.75),
        y: randRange(h * 0.2, h * 0.55),
        vx: randRange(-0.3, 0.3),
        vy: randRange(-0.3, 0.3),
      });
    }

    // build links by proximity
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

  function clearBackground() {
    // gradient background that matches the CSS gradient, just to smooth artifacts
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#3a1a18");
    grad.addColorStop(0.3, "#6b3d26");
    grad.addColorStop(0.7, "#1a1d38");
    grad.addColorStop(1, "#0f0f10");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // subtle radial haze to make center brighter
    const rgrad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.4,
      0,
      w * 0.5,
      h * 0.4,
      w * 0.6
    );
    rgrad.addColorStop(0, "rgba(255,255,255,0.08)");
    rgrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rgrad;
    ctx.fillRect(0, 0, w, h);
  }

  function drawDunes() {
    duneLayers.forEach((layer, idx) => {
      ctx.beginPath();
      const baseY = h * layer.offsetY;
      for (let x = 0; x <= w; x += 6) {
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
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  function updateParticles() {
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 1;
      if (p.x > w + 20 || p.y < -20 || p.y > h + 20) {
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
      const alpha = 0.08 + 0.08 * Math.sin(p.life * 0.05);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function updateNetwork() {
    for (let n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // soft keep-in-bounds
      if (n.x < w * 0.2 || n.x > w * 0.8) n.vx *= -1;
      if (n.y < h * 0.15 || n.y > h * 0.6) n.vy *= -1;

      // jitter
      n.vx += randRange(-0.02, 0.02);
      n.vy += randR
