// Babel o Jerusalén · Introducción de Magnifica humanitas (León XIV)
// Escena 3D (Three.js local): la torre uniforme que se dispersa y la muralla que se levanta tramo a tramo.
import * as THREE from './three.module.min.js';

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.remove('no-js');
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

/* ---------------- Interfaz ---------------- */
requestAnimationFrame(() => document.body.classList.add('is-loaded'));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const menuBtn = document.querySelector('.top__btn'), menu = document.getElementById('menu'), curEl = document.getElementById('actual');
const setMenu = open => { menuBtn.setAttribute('aria-expanded', open); menu.hidden = !open; document.body.classList.toggle('menu-open', open); };
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
const dots = [...document.querySelectorAll('[data-dot]')], secs = [...document.querySelectorAll('.etapa')];
const navIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const n = e.target.dataset.n || null;
  dots.forEach(a => a.classList.toggle('is-active', a.dataset.dot === n));
  curEl.textContent = n ? dots[n - 1].querySelector('.rn').textContent + ' · ' + dots[n - 1].querySelector('.nm').textContent : 'Índice';
}), { rootMargin: '-45% 0px -45% 0px' });
[...secs, ...['inicio', 'prologo', 'final'].map(id => document.getElementById(id))].forEach(el => el && navIO.observe(el));
const wa = t => window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener');
document.querySelectorAll('[data-share]').forEach(b => b.addEventListener('click', () => {
  const n = +b.dataset.share, base = location.href.split('#')[0];
  if (!n) return wa('Babel o Jerusalén · La introducción de Magnifica humanitas, de León XIV, paso a paso\n' + base);
  const s = secs[n - 1];
  wa(`Babel o Jerusalén · ${s.querySelector('.etapa__rn').textContent}. ${s.querySelector('.etapa__lugar').textContent}: «${s.querySelector('.panel__title').textContent}»\n${base}#${s.id}`);
}));

/* ---------------- Escena ---------------- */
const stageEl = document.querySelector('.stage');
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('escena3d'), antialias: true, powerPreference: 'low-power' }); } catch (e) { renderer = null; }
if (!renderer) document.documentElement.classList.add('no-webgl'); else initScene();

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function initScene() {
  const mobile = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), BG = new THREE.Color('#0B0A08');
  scene.background = BG; scene.fog = new THREE.FogExp2(BG, .03);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 400);

  scene.add(new THREE.HemisphereLight('#46506a', '#1c130a', 1.0));
  const moon = new THREE.DirectionalLight('#d6d3cc', 1.3); moon.position.set(-10, 16, 10); scene.add(moon);

  // Suelo de desierto
  const groundTex = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = '#211a12'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 26000; i++) { const v = 20 + rand() * 30; g.fillStyle = `rgba(${v + 30},${v + 18},${v},${.25})`; g.fillRect(rand() * w, rand() * w, 2, 2); }
  });
  groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping; groundTex.repeat.set(10, 10);
  scene.add(new THREE.Mesh(new THREE.CircleGeometry(120, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 })));

  /* ---- Babel: torre escalonada de bloques idénticos, con una «lengua única» de datos ---- */
  const BX = 9, BZ = -2;
  const dataTex = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, w);
    g.font = '600 26px monospace'; g.fillStyle = '#5fd3e0';
    for (let y = 22; y < w; y += 32) for (let x = 6; x < w; x += 20) if (rand() > .35) g.fillText(rand() > .5 ? '1' : '0', x, y);
    g.strokeStyle = '#5fd3e0'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, w - 4);
  });
  const blockMat = new THREE.MeshStandardMaterial({ color: '#6a717b', roughness: .55, emissive: '#ffffff', emissiveMap: dataTex, emissiveIntensity: .5 });
  const B = .5, TIERS = 9, blocks = [];
  for (let t = 0; t < TIERS; t++) {
    const side = 7.2 - t * .72, rows = 2;
    for (let r = 0; r < rows; r++) {
      const y = (t * rows + r) * B + B / 2, n = Math.max(1, Math.round(side / B));
      for (let k = 0; k < n * 4; k++) {
        const e = Math.floor(k / n), i = k % n, s = -side / 2 + (i + .5) * side / n;
        const [x, z] = [[s, -side / 2], [side / 2, s], [-s, side / 2], [-side / 2, -s]][e];
        const dir = new THREE.Vector3(x, 0, z).normalize();
        blocks.push({ p: new THREE.Vector3(BX + x, y, BZ + z), tier: t + r / rows, d: (() => { const v = dir.multiplyScalar(2.5 + rand() * 5).add(new THREE.Vector3((rand() - .5) * 3, 0, (rand() - .5) * 3)); if (BX + x + v.x < 2) v.x = 2 - BX - x + rand(); return v; })(), spin: new THREE.Vector3(rand() * 6, rand() * 6, rand() * 6), delay: rand() * .35 + (TIERS - t) / TIERS * .25 });
      }
    }
  }
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(B * .96, B * .96, B * .96), blockMat, blocks.length);
  scene.add(inst);
  const babelGlow = new THREE.PointLight('#5fd3e0', 0, 16, 1.6); babelGlow.position.set(BX, 6, BZ + 5); scene.add(babelGlow);
  const dummy = new THREE.Object3D();
  function updateBabel(build, scatter) {
    const top = build * TIERS;
    blocks.forEach((b, i) => {
      const grow = Math.max(0, Math.min(1, (top - b.tier) * 1.5));
      const s = Math.max(0, Math.min(1, (scatter - b.delay) / .4));
      dummy.position.copy(b.p).addScaledVector(b.d, s);
      dummy.position.y = Math.max(B / 2, b.p.y * (1 - s) + Math.sin(s * Math.PI) * 1.5 * (1 - s) + B / 2 * s);
      dummy.rotation.set(b.spin.x * s, b.spin.y * s, b.spin.z * s);
      dummy.scale.setScalar(grow < .001 ? .0001 : grow);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  }

  /* ---- Jerusalén: muralla en tramos, torres, casas y templo ---- */
  const JX = -8, JZ = 2, JR = 5.2, SEGS = 12;
  const stoneTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#b89a6a'; g.fillRect(0, 0, w, h);
    const rows = 6, rh = h / rows;
    for (let r = 0; r < rows; r++) { let x = r % 2 ? -30 : 0; while (x < w) { const bw = 50 + rand() * 40, v = 150 + rand() * 50;
      g.fillStyle = `rgb(${v},${v * .84},${v * .6})`; g.fillRect(x + 2, r * rh + 2, bw - 4, rh - 4); x += bw; } }
  });
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: .9 });
  const glowTex = canvasTex(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,240,205,1)'); r.addColorStop(.3, 'rgba(240,190,100,.55)'); r.addColorStop(1, 'rgba(201,163,91,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const segs = [];
  for (let i = 0; i < SEGS; i++) {
    const a = i / SEGS * Math.PI * 2, a2 = (i + 1) / SEGS * Math.PI * 2, am = (a + a2) / 2;
    const len = 2 * JR * Math.sin(Math.PI / SEGS) + .05;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.7, .55), stoneMat);
    wall.position.set(JX + Math.cos(am) * JR * Math.cos(Math.PI / SEGS), .85, JZ + Math.sin(am) * JR * Math.cos(Math.PI / SEGS));
    wall.rotation.y = -am + Math.PI / 2; scene.add(wall);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(.45, .5, 2.4, 10), stoneMat);
    tower.position.set(JX + Math.cos(a) * JR, 1.2, JZ + Math.sin(a) * JR); scene.add(tower);
    // escombros
    const rub = new THREE.Group();
    for (let k = 0; k < 6; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.3 + rand() * .3, .2 + rand() * .2, .3 + rand() * .3), stoneMat);
      r.position.set((rand() - .5) * len, .1, (rand() - .5) * 1.2); r.rotation.set(rand(), rand() * 3, rand()); rub.add(r); }
    rub.position.copy(wall.position); rub.position.y = 0; rub.rotation.y = wall.rotation.y; scene.add(rub);
    // la familia que reconstruye su tramo: una lámpara al pie, por dentro
    const fam = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    fam.position.set(JX + Math.cos(am) * (JR - .9), .45, JZ + Math.sin(am) * (JR - .9)); fam.scale.setScalar(.9); scene.add(fam);
    const torch = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    torch.position.set(tower.position.x, 2.6, tower.position.z); torch.scale.setScalar(.8); scene.add(torch);
    segs.push({ wall, tower, rub, fam, torch, order: (i * 5) % SEGS });   // los tramos no se levantan en fila: cada familia a la vez
  }
  // casas y templo
  const houseMat = new THREE.MeshStandardMaterial({ color: '#a8916a', roughness: .95 });
  const houses = [];
  for (let k = 0; k < 18; k++) {
    const a = rand() * Math.PI * 2, r = 1.6 + rand() * 2.4, w = .5 + rand() * .5, h = .4 + rand() * .5;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * (.8 + rand() * .4)), houseMat);
    m.position.set(JX + Math.cos(a) * r, h / 2, JZ + Math.sin(a) * r); m.rotation.y = rand() * 3; m.userData.h = h; scene.add(m); houses.push(m);
  }
  const temple = new THREE.Group(); temple.position.set(JX, 0, JZ);
  const tBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, .4, 1.8), stoneMat); tBase.position.y = .2; temple.add(tBase);
  const tBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: '#e2cf9e', roughness: .7, emissive: '#e0a84e', emissiveIntensity: 0 })); tBody.position.y = .95; temple.add(tBody);
  scene.add(temple);
  const templeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  templeGlow.position.set(JX, 1.6, JZ); templeGlow.scale.setScalar(4); scene.add(templeGlow);
  const cityLight = new THREE.PointLight('#ffcf80', 0, 18, 1.4); cityLight.position.set(JX, 3.5, JZ); scene.add(cityLight);

  function updateCity(wall, glow, t) {
    segs.forEach(s => {
      const b = smooth(s.order / SEGS * .85, s.order / SEGS * .85 + .2, wall);
      s.wall.scale.y = Math.max(.02, b); s.wall.position.y = .85 * Math.max(.02, b);
      s.tower.scale.y = Math.max(.15, b); s.tower.position.y = 1.2 * Math.max(.15, b);
      s.rub.visible = b < .98; s.rub.scale.setScalar(1 - b * .9);
      s.fam.material.opacity = Math.min(1, b * 1.6) * (.75 + Math.sin(t * 3 + s.order) * .1);
      s.torch.material.opacity = b > .95 ? .4 + glow * .5 : 0;
    });
    houses.forEach((h, i) => { const b = smooth(.3 + i / 40, .7 + i / 40, wall); h.scale.y = Math.max(.05, b); h.position.y = h.userData.h / 2 * Math.max(.05, b); });
    temple.scale.y = Math.max(.1, smooth(.5, 1, wall));
    tBody.material.emissiveIntensity = glow * .6;
    templeGlow.material.opacity = glow * (.85 + Math.sin(t * 1.4) * .08);
    cityLight.intensity = wall * 3 + glow * 10;
  }

  // estrellas
  const SN = mobile ? 900 : 1600, sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) { const th = rand() * Math.PI * 2, ph = rand() * Math.PI * .42; sp.set([Math.cos(th) * Math.sin(ph) * 120, Math.cos(ph) * 70 + 8, Math.sin(th) * Math.sin(ph) * 120], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#efe4c8', size: mobile ? .38 : .3, fog: false, transparent: true, opacity: .8 })));

  /* ---- Cámara y progresos guiados por el scroll ---- */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const CAMS = {
    over:   { p: V(-1, 9, 24), t: V(-.5, 3, 0) },
    babel:  { p: V(1.5, 5, 9.5), t: V(BX, 4.2, BZ) },
    babel2: { p: V(0, 10, 14), t: V(BX - 1, 2.5, BZ) },
    neh:    { p: V(-15, 6.5, 12), t: V(JX, 1, JZ) },
    choice: { p: V(.5, 7.5, 19), t: V(.5, 2, 0) },
    city:   { p: V(-12, 10, 13), t: V(JX, .8, JZ) },
    city2:  { p: V(JX + 4, 14, JZ + 9), t: V(JX, .5, JZ) },
  };
  let keys = [], R = {}, vh = innerHeight;
  const OVER_L = CAMS.over, CHOICE_L = CAMS.choice;
  const OVER_P = { p: V(3, 3.5, 21), t: V(8, .2, -1.5) }, CHOICE_P = { p: V(2, 9, 15), t: V(-5, 1, 1) };
  function buildKeys() {
    const portrait = innerWidth < innerHeight;
    CAMS.over = portrait ? OVER_P : OVER_L; CAMS.choice = portrait ? CHOICE_P : CHOICE_L;
    vh = innerHeight; keys = []; const y0 = scrollY;
    const box = id => { const r = document.getElementById(id).getBoundingClientRect(); return { top: r.top + y0, bot: r.bottom + y0 }; };
    document.querySelectorAll('[data-cam]').forEach(el => {
      const c = el.dataset.cam; if (c === 'travel') return;
      const r = el.getBoundingClientRect(), top = r.top + y0, bot = r.bottom + y0, a = top - vh * .1, b = Math.max(a, bot - vh * .9);
      keys.push([a, CAMS[c]], [b, CAMS[c]]);
    });
    keys.sort((p, q) => p[0] - q[0]);
    const b2 = box('cosas-nuevas'), b3 = box('babel'), b4 = box('nehemias'), b5 = box('primera-eleccion'), b6 = box('construir');
    R = { build: [b2.top - vh * .3, b3.top], scatter: [b3.top + (b3.bot - b3.top) * .25, b4.top - vh * .2], wall: [b4.top - vh * .1, b5.top - vh * .2], glow: [b6.top - vh * .6, b6.top + vh * .2] };
  }
  const pAt = (y, [a, b]) => smooth(a, b, y);
  const tmpP = V(0, 0, 0), tmpT = V(0, 0, 0);
  function camAt(y) {
    if (y <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [ya, a] = keys[i], [yb, b] = keys[i + 1];
      if (y <= yb) { const t = yb > ya ? smooth(0, 1, (y - ya) / (yb - ya)) : 1; return { p: tmpP.lerpVectors(a.p, b.p, t).clone(), t: tmpT.lerpVectors(a.t, b.t, t).clone() }; }
    }
    return keys[keys.length - 1][1];
  }
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); buildKeys(); };
  addEventListener('resize', resize); addEventListener('load', buildKeys); resize();

  const cur = { p: keys[0][1].p.clone(), t: keys[0][1].t.clone(), build: .35, scatter: 0, wall: 0, glow: 0 };
  const clock = new THREE.Clock(); let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); loop(); } });
  const off = V(0, 0, 0);
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, y = scrollY;
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.8);
    const c = camAt(y);
    cur.p.lerp(c.p, k); cur.t.lerp(c.t, k);
    for (const key of ['build', 'scatter', 'wall', 'glow']) {
      const tg = key === 'build' ? .35 + .65 * pAt(y, R.build) : pAt(y, R[key]);
      cur[key] += (tg - cur[key]) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2));
    }
    // formato vertical: alejar la cámara en su propia dirección
    const aspect = camera.aspect, port = aspect < 1 ? 1 + (1 - aspect) * .55 : 1;
    off.subVectors(cur.p, cur.t).multiplyScalar(port);
    camera.position.copy(cur.t).add(off);
    if (!reduceMotion) camera.position.x += Math.sin(t * .15) * .3;
    camera.lookAt(cur.t);

    updateBabel(cur.build, cur.scatter);
    blockMat.emissiveIntensity = .5 * (1 - cur.scatter * .8);
    babelGlow.intensity = (cur.build - .3) * 6 * (1 - cur.scatter);
    updateCity(cur.wall, cur.glow, t);
    renderer.render(scene, camera);
  }
  loop();
  requestAnimationFrame(() => stageEl.classList.add('is-ready'));
}
