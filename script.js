//  CURSOR
const cursor = document.getElementById("cursor");
const ring = document.getElementById("ring");
let mouseX = 0,
  mouseY = 0,
  trailX = 0,
  trailY = 0;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
(function loop() {
  cursor.style.left = mouseX + "px";
  cursor.style.top = mouseY + "px";
  trailX += (mouseX - trailX) * 0.13;
  trailY += (mouseY - trailY) * 0.13;
  ring.style.left = trailX + "px";
  ring.style.top = trailY + "px";
  requestAnimationFrame(loop);
})();

// TERMINAL

const command = "build a portfolio for ATRI SUKUL";
const steps = [
  { t: "> Initializing neural environment...", dim: false },
  {
    t: "> Loading model weights for the portfolio",
    dim: false,
  },
  {
    t: "> Fetching training data from /home/atri/.config/profile.json",
    dim: false,
  },
  { t: "> Running forward pass...", dim: false },
  { t: "> Training completed. Generating portfolio...", dim: true },
];

const typedEl = document.getElementById("typed-text");
const blinkEl = document.getElementById("blink");
const outputEl = document.getElementById("output");
const loaderEl = document.getElementById("loader");
const progressWrap = document.getElementById("progress-wrap");
const progressBar = document.getElementById("progress-bar");

let charPos = 0;
function typeChar() {
  if (charPos < command.length) {
    typedEl.textContent += command[charPos++];
    setTimeout(typeChar, 58 + Math.random() * 44);
  } else {
    blinkEl.style.display = "none";
    setTimeout(() => showLine(0), 260);
  }
}

function showLine(i) {
  if (i >= steps.length) {
    progressWrap.style.display = "block";
    fillBar(0);
    return;
  }
  const d = document.createElement("div");
  d.className = "output-line" + (steps[i].dim ? " dim" : "");
  d.textContent = steps[i].t;
  outputEl.appendChild(d);
  setTimeout(() => showLine(i + 1), 340);
}

function fillBar(pct) {
  if (pct >= 100) {
    progressBar.style.width = "100%";
    setTimeout(() => {
      loaderEl.classList.add("fade-out");
      setTimeout(launch, 650);
    }, 280);
    return;
  }
  progressBar.style.width = pct + "%";
  setTimeout(() => fillBar(pct + 2), 24);
}

let launched = false;
function launch() {
  if (launched) return;
  launched = true;
  loaderEl.style.display = "none";
  document.getElementById("site").classList.add("show");
  
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      initNeuralNet();
      initSkillGraph();
      setTimeout(attachReveal, 80);
    }),
  );
}

setTimeout(typeChar, 700);

// SCROLL REVEAL

const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("on");
    });
  },
  { threshold: 0.12 },
);

function attachReveal() {
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));
}


const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () =>
  navbar.classList.toggle("scrolled", window.scrollY > 50),
);


const navList = document.getElementById("nav-list");
const navBurger = document.getElementById("nav-burger");

navBurger.addEventListener("click", () => {
  navBurger.classList.toggle("open");
  navList.classList.toggle("open");
  document.body.style.overflow = navList.classList.contains("open")
    ? "hidden"
    : "";
});

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const el = document.querySelector(a.getAttribute("href"));
    if (el) {
      e.preventDefault();
      
      navBurger.classList.remove("open");
      navList.classList.remove("open");
      document.body.style.overflow = "";
      el.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// NEURAL NETWORK
function initNeuralNet() {
  const canvas = document.getElementById("neural-bg");
  const scene = new THREE.Scene();
  const W = () => canvas.clientWidth || window.innerWidth;
  const H = () => canvas.clientHeight || window.innerHeight;

  // responsive helpers 
  const isMobile = () => window.innerWidth < 768;
  const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1100;
  const camZ = () => (isMobile() ? 26 : isTablet() ? 22 : 18);
  const xOffset = () => (isMobile() ? 0 : isTablet() ? 1.5 : 3);
  const layerSpan = () => (isMobile() ? 3.0 : isTablet() ? 3.8 : 4.8);
  const nodeSpan = () => (isMobile() ? 1.0 : isTablet() ? 1.1 : 1.25);

  const camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 1000);
  camera.position.set(xOffset(), 0, camZ());

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H(), false);
  renderer.setClearColor(0x000000, 0);

  // node layers 
  const LAYERS = [5, 8, 10, 8, 4];
  const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const nodeList = [];

  const layers = LAYERS.map((count, li) => {
    const row = [];
    for (let ni = 0; ni < count; ni++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xede8df });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      scene.add(mesh);
      const node = {
        mesh,
        li,
        ni,
        active: 0,
        zJitter: (Math.random() - 0.5) * 0.3,
      };
      row.push(node);
      nodeList.push(node);
    }
    return row;
  });

  function layoutNodes() {
    const lSpan = layerSpan();
    const nSpan = nodeSpan();
    layers.forEach((row, li) => {
      const x = (li - (LAYERS.length - 1) / 2) * lSpan;
      row.forEach((node, ni) => {
        const y = (ni - (row.length - 1) / 2) * nSpan;
        node.mesh.position.set(x, y, node.zJitter);
      });
    });
  }
  layoutNodes();

  // connections 
  const connectionLines = [];
  layers.forEach((layer, li) => {
    if (li >= layers.length - 1) return;
    layer.forEach((a) => {
      layers[li + 1].forEach((b) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          a.mesh.position,
          b.mesh.position,
        ]);
        const mat = new THREE.LineBasicMaterial({
          color: 0x3a2e24,
          transparent: true,
          opacity: 0.45,
        });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        connectionLines.push({ line, a, b });
      });
    });
  });

  function refreshConnectionLines() {
    connectionLines.forEach(({ line, a, b }) => {
      const pos = line.geometry.attributes.position;
      pos.setXYZ(0, a.mesh.position.x, a.mesh.position.y, a.mesh.position.z);
      pos.setXYZ(1, b.mesh.position.x, b.mesh.position.y, b.mesh.position.z);
      pos.needsUpdate = true;
    });
  }

  // background particles 
  const particlePos = new Float32Array(220 * 3);
  for (let i = 0; i < 220 * 3; i++) particlePos[i] = (Math.random() - 0.5) * 44;
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePos, 3),
  );
  scene.add(
    new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x2a2218,
        size: 0.055,
        transparent: true,
        opacity: 0.6,
      }),
    ),
  );

  // forward pass detection 
  let firstPassDone = false;
  function onFirstPassComplete() {
    if (firstPassDone) return;
    firstPassDone = true;
    document.getElementById("resume-panel").classList.add("show");
  }

  // resume open in new tab 
  const resumeBtn = document.getElementById("resume-btn");
  resumeBtn.addEventListener("click", () => {
    window.open("Atri_Sukul_Resume.pdf", "_blank");
  });

  // signal pool 
  const dotGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xc47830,
    transparent: true,
    opacity: 0.9,
  });
  const signalPool = Array.from({ length: 24 }, () => {
    const m = new THREE.Mesh(dotGeo, dotMat.clone());
    m.visible = false;
    scene.add(m);
    return m;
  });
  let poolIdx = 0;
  let active = [];

  function spawnPulse() {
    const li = Math.floor(Math.random() * (LAYERS.length - 1));
    const src = layers[li][Math.floor(Math.random() * layers[li].length)];
    const dst =
      layers[li + 1][Math.floor(Math.random() * layers[li + 1].length)];
    const m = signalPool[poolIdx++ % signalPool.length];
    m.visible = true;
    src.active = 0.8;
    active.push({
      m,
      src,
      dst,
      t: 0,
      spd: 0.021 + Math.random() * 0.009,
    });
  }
  const pulseInterval = setInterval(spawnPulse, 150);

  // mouse 
  const pointer = { x: 0, y: 0 };
  function onMouseMove(e) {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener("mousemove", onMouseMove);

  // rendering loop 
  let time = 0;
  (function animate() {
    requestAnimationFrame(animate);
    time += 0.008;

    const ox = xOffset();
    camera.position.x += (pointer.x * 3.5 + ox - camera.position.x) * 0.017;
    camera.position.y += (pointer.y * 2 - camera.position.y) * 0.017;
    camera.position.z += (camZ() - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);

    nodeList.forEach((n) => {
      n.active = Math.max(0, n.active - 0.007);
      const scale =
        0.18 + 0.055 * Math.sin(time * 1.8 + n.li * 1.4 + n.ni * 0.8);
      n.mesh.scale.setScalar((scale / 0.18) * (1 + n.active * 0.7));
      const hot = n.active > 0.12;
      const base = (0.32 + n.active * 0.5) * 0.9;
      n.mesh.material.color.setRGB(
        hot ? 0.77 : base,
        hot ? 0.47 : base,
        hot ? 0.19 : base,
      );
    });

    active = active.filter((s) => {
      s.t += s.spd;
      if (s.t >= 1) {
        s.m.visible = false;
        s.dst.active = 0.9;
        /* this is for first full forward pass: signal arrived at output layer i.e. resume */
        if (s.dst.li === LAYERS.length - 1) onFirstPassComplete();
        return false;
      }
      s.m.position.lerpVectors(s.src.mesh.position, s.dst.mesh.position, s.t);
      return true;
    });

    renderer.render(scene, camera);
  })();

  // this is for resizing: update sizes + relayout nodes 
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = W();
      const h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      layoutNodes();
      refreshConnectionLines();
    }, 120);
  });
}

/* ═══════════════════════════════════════════
   SKILL FEEDFORWARD GRAPH — 2D Canvas (2×2)
═══════════════════════════════════════════ */
function initSkillGraph() {
  const canvas = document.getElementById("skill-map");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* 2×2 grid: [row0col0, row0col1, row1col0, row1col1] */
  const GROUPS = [
    {
      cat: "Technologies",
      skills: [
        "PyTorch",
        "OpenCV",
        "Pandas",
        "Numpy",
        "Matplotlib",
        "scikit-learn",
        "ReactJs",
        "NodeJs",
      ],
      col: 0,
      row: 0,
    },
    {
      cat: "Languages",
      skills: ["Python", "C", "C++", "JavaScript", "SQL"],
      col: 1,
      row: 0,
    },
    { cat: "Databases", skills: ["MySQL", "MongoDB"], col: 0, row: 1 },
    {
      cat: "Specializations",
      skills: ["NLP", "Computer Vision", "Deep Learning"],
      col: 1,
      row: 1,
    },
  ];

  let nodes = [],
    groups = [],
    edges = [];
  let hovered = -1,
    drawProgress = 0,
    pulses = [],
    frameCount = 0;

  // layout 
  function init() {
    const CW = canvas.offsetWidth;
    const CH = canvas.offsetHeight;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const W = CW,
      H = CH;
    /* each cell occupies half width, half height */
    const CELL_W = W / 2;
    const CELL_H = H / 2;
    const PAD_X = CELL_W * 0.06; /* left padding inside cell */
    const PAD_Y = CELL_H * 0.1; /* top/bottom padding inside cell */
    const SK_W = Math.min(145, CELL_W * 0.3);
    const SK_H = 26;
    const SK_G = 8;
    const CAT_W = Math.min(148, CELL_W * 0.28);
    const CAT_H = 48;

    nodes = [];
    groups = [];
    edges = [];

    GROUPS.forEach((g, gi) => {
      const cellX = g.col * CELL_W;
      const cellY = g.row * CELL_H;
      const LX = cellX + PAD_X;
      const RX = cellX + CELL_W - PAD_X - CAT_W;

      /* vertically centre skills in cell */
      const totalSkH = g.skills.length * SK_H + (g.skills.length - 1) * SK_G;
      const startY = cellY + (CELL_H - totalSkH) / 2;
      const firstSI = nodes.length;

      g.skills.forEach((s, si) => {
        const ny = startY + si * (SK_H + SK_G);
        nodes.push({
          x: LX,
          y: ny,
          w: SK_W,
          h: SK_H,
          label: s,
          gi,
          ex: LX + SK_W /* right edge — bezier start */,
          ey: ny + SK_H / 2,
        });
      });

      const midY = cellY + CELL_H / 2;
      groups.push({
        x: RX,
        y: midY - CAT_H / 2,
        w: CAT_W,
        h: CAT_H,
        label: g.cat,
        gi,
        ex: RX /* left edge — bezier end */,
        ey: midY,
      });

      for (let si = firstSI; si < nodes.length; si++)
        edges.push({ si, ci: gi });
    });
  }

  // bezier helpers 
  function getCurve(conn) {
    const s = nodes[conn.si],
      c = groups[conn.ci];
    const x0 = s.ex,
      y0 = s.ey;
    const x3 = c.ex,
      y3 = c.ey;
    const mid = x0 + (x3 - x0) * 0.55;
    return [x0, y0, mid, y0, mid, y3, x3, y3];
  }

  function pointAt(pts, t) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = pts;
    const m = 1 - t;
    return {
      x:
        m * m * m * x0 +
        3 * m * m * t * x1 +
        3 * m * t * t * x2 +
        t * t * t * x3,
      y:
        m * m * m * y0 +
        3 * m * m * t * y1 +
        3 * m * t * t * y2 +
        t * t * t * y3,
    };
  }

  function drawCurve(pts, prog, alpha, lw) {
    if (prog <= 0) return;
    const N = 60,
      steps = Math.max(1, Math.floor(prog * N));
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 1; i <= steps; i++) {
      const p = pointAt(pts, i / N);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = `rgba(196,120,48,${alpha})`;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  // draw 
  function render() {
    const W = canvas.offsetWidth,
      H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    /* subtle cell dividers */
    ctx.strokeStyle = "rgba(196,120,48,0.08)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    /* connections */
    edges.forEach((conn) => {
      const pts = getCurve(conn);
      const focused = hovered === conn.ci;
      const alpha = focused ? 0.82 : hovered === -1 ? 0.18 : 0.03;
      const lw = focused ? 1.5 : 0.8;
      drawCurve(pts, drawProgress, alpha, lw);

      /* dot at skill exit point */
      const s = nodes[conn.si];
      ctx.beginPath();
      ctx.arc(s.ex, s.ey, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,120,48,${focused ? 0.9 : hovered === -1 ? 0.32 : 0.06})`;
      ctx.fill();
    });

    /* signal dots */
    pulses.forEach((sig) => {
      if (sig.t > drawProgress) return;
      const pts = getCurve(sig.conn);
      const p = pointAt(pts, sig.t);
      const vis = hovered === -1 || hovered === sig.conn.ci;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2);
      ctx.shadowColor = "#c47830";
      ctx.shadowBlur = vis ? 14 : 0;
      ctx.fillStyle = `rgba(196,120,48,${vis ? 1 : 0.06})`;
      ctx.fill();
      ctx.restore();
    });

    /* skill node boxes */
    ctx.font = '11px "Share Tech Mono",monospace';
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    nodes.forEach((n) => {
      const focused = hovered === n.gi;
      const dimmed = hovered !== -1 && !focused;
      ctx.fillStyle = focused
        ? "rgba(196,120,48,0.12)"
        : dimmed
          ? "rgba(196,120,48,0.015)"
          : "rgba(196,120,48,0.045)";
      ctx.fillRect(n.x, n.y, n.w, n.h);
      ctx.strokeStyle = focused
        ? "rgba(196,120,48,0.9)"
        : dimmed
          ? "rgba(196,120,48,0.07)"
          : "rgba(196,120,48,0.3)";
      ctx.lineWidth = focused ? 1.2 : 0.7;
      ctx.strokeRect(n.x + 0.5, n.y + 0.5, n.w - 1, n.h - 1);
      ctx.fillStyle = focused
        ? "rgba(237,232,223,1)"
        : dimmed
          ? "rgba(237,232,223,0.18)"
          : "rgba(237,232,223,0.65)";
      ctx.fillText(n.label, n.x + 10, n.ey);
    });

    /* category boxes */
    ctx.textAlign = "center";
    //   ctx.borderRadius = "10px"
    groups.forEach((n, i) => {
      const hov = hovered === i;
      const dimmed = hovered !== -1 && !hov;
      ctx.save();
      if (hov) {
        ctx.shadowColor = "#c47830";
        ctx.shadowBlur = 15;
      }
      ctx.fillStyle = hov ? "#c47830" : dimmed ? "#261a0a" : "#c47830";
      ctx.fillRect(n.x, n.y, n.w, n.h);
      ctx.restore();
      /* top accent */
      if (!dimmed) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(n.x, n.y, n.w, 1.5);
      }
      /* connector dot */
      ctx.beginPath();
      ctx.arc(n.ex, n.ey, hov ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = hov ? "#fff" : "rgba(255,255,255,0.55)";
      ctx.fill();
      /* label */
      ctx.font = 'bold 11px "Share Tech Mono",monospace';
      ctx.textBaseline = "middle";
      ctx.fillStyle = dimmed ? "rgba(237,232,223,0.2)" : "#ede8df";
      ctx.fillText(n.label, n.x + n.w / 2, n.ey);
    });
  }

  // signals 
  function spawnPulse() {
    if (drawProgress < 0.4 || edges.length === 0) return;
    const conn = edges[Math.floor(Math.random() * edges.length)];
    pulses.push({ conn, t: 0, spd: 0.007 + Math.random() * 0.006 });
    if (pulses.length > 18) pulses.shift();
  }

  // hover detection 
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left,
      py = e.clientY - r.top;
    hovered = -1;
    groups.forEach((n, i) => {
      if (px >= n.x && px <= n.x + n.w && py >= n.y && py <= n.y + n.h)
        hovered = i;
    });
  });
  canvas.addEventListener("mouseleave", () => (hovered = -1));

  // init & loop 
  init();
  window.addEventListener("resize", init);

  (function tick() {
    requestAnimationFrame(tick);
    frameCount++;
    if (drawProgress < 1) drawProgress = Math.min(1, drawProgress + 0.007);
    if (frameCount % 10 === 0) spawnPulse();
    pulses = pulses.filter((s) => {
      s.t += s.spd;
      return s.t < 1;
    });
    render();
  })();
}
