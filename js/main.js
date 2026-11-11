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
  // Capítulo III: la torre se reconstruye (rebuild) y después se «desarma» en un camino hacia la ciudad (disarm)
  const PATH_N = 4 * 22, pathPos = [];
  for (let i = 0; i < PATH_N; i++) { const c = Math.floor(i / 4), r = i % 4; pathPos.push(new THREE.Vector3(7.6 - c * .5, B * .2, 1.6 + (r - 1.5) * .5 + c * .012)); }
  function updateBabel(build, scatter, rebuild = 0, disarm = 0) {
    const top = build * TIERS;
    blocks.forEach((b, i) => {
      const grow = Math.max(0, Math.min(1, (top - b.tier) * 1.5));
      const s = Math.max(0, Math.min(1, (scatter - b.delay) / .4)) * (1 - Math.max(0, Math.min(1, (rebuild - (1 - b.delay) * .3) / .7)));
      dummy.position.copy(b.p).addScaledVector(b.d, s);
      dummy.position.y = Math.max(B / 2, b.p.y * (1 - s) + Math.sin(s * Math.PI) * 1.5 * (1 - s) + B / 2 * s);
      dummy.rotation.set(b.spin.x * s, b.spin.y * s, b.spin.z * s);
      dummy.scale.setScalar(grow < .001 ? .0001 : grow);
      if (disarm > 0) {
        const dk = Math.max(0, Math.min(1, (disarm - (i % PATH_N) / PATH_N * .4) / .6));
        if (i < PATH_N) {
          dummy.position.lerp(pathPos[i], dk); dummy.position.y += Math.sin(dk * Math.PI) * 1.2;
          dummy.rotation.set(dummy.rotation.x * (1 - dk), dummy.rotation.y * (1 - dk), dummy.rotation.z * (1 - dk));
          dummy.scale.set(1, 1 - .6 * dk, 1);
        } else { const k = Math.max(0, Math.min(1, (disarm - b.delay * .5) / .5)); dummy.scale.multiplyScalar(Math.max(.0001, 1 - k)); dummy.position.y *= 1 - k; }
      }
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
    const a = Math.PI * 1.05 + rand() * Math.PI * .9, r = 3.95 + rand() * .55, w = .45 + rand() * .35, h = .35 + rand() * .4;   // casas junto a la muralla norte; la plaza queda libre
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

  /* ---- Capítulo I: el camino de la doctrina social, de las ruinas de Babel a la puerta de Jerusalén ---- */
  const HITOS = [
    ['1891', 'Rerum novarum', 'León XIII'], ['1931', 'Quadragesimo anno', 'Pío XI'], ['1939-58', 'Mensajes de Navidad', 'Pío XII'],
    ['1961', 'Mater et magistra', 'Juan XXIII'], ['1963', 'Pacem in terris', 'Juan XXIII'], ['1965', 'Gaudium et spes', 'Vaticano II'],
    ['1967', 'Populorum progressio', 'Pablo VI'], ['1971', 'Octogesima adveniens', 'Pablo VI'], ['1981', 'Laborem exercens', 'Juan Pablo II'],
    ['1987', 'Sollicitudo rei socialis', 'Juan Pablo II'], ['1991', 'Centesimus annus', 'Juan Pablo II'], ['2009', 'Caritas in veritate', 'Benedicto XVI'],
    ['2013', 'Evangelii gaudium', 'Francisco'], ['2015', 'Laudato si’', 'Francisco'], ['2020', 'Fratelli tutti', 'Francisco'],
    ['2024', 'Dilexit nos', 'Francisco'], ['2026', 'Magnifica humanitas', 'León XIV'],
  ];
  const road = new THREE.CatmullRomCurve3([V3(7, 0, 8.5), V3(5, 0, 12.5), V3(1, 0, 14.5), V3(-3, 0, 13.5), V3(-6.2, 0, 11), V3(JX, 0, JZ + JR + .4)]);
  function V3(x, y, z) { return new THREE.Vector3(x, y, z); }
  { // calzada
    const N = 160, pos = [], idx = [], W = .75;
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = road.getPointAt(u), tg = road.getTangentAt(u), sd = new THREE.Vector3(-tg.z, 0, tg.x);
      pos.push(p.x + sd.x * W, .02, p.z + sd.z * W, p.x - sd.x * W, .02, p.z - sd.z * W);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#4d3f2d', roughness: 1, side: THREE.DoubleSide })));
  }
  const stelae = HITOS.map((h, i) => {
    const u = .05 + i / (HITOS.length - 1) * .87, p = road.getPointAt(u), tg = road.getTangentAt(u), sd = new THREE.Vector3(-tg.z, 0, tg.x);
    const side = i % 2 ? 1 : -1, grp = new THREE.Group();
    grp.position.set(p.x + sd.x * 1.3 * side, 0, p.z + sd.z * 1.3 * side);
    grp.rotation.y = Math.atan2(sd.x * side, sd.z * side) * .25;       // de cara al sur, un poco abiertas al camino
    const stone = new THREE.Mesh(new THREE.BoxGeometry(.75, 1.25, .2), stoneMat); stone.position.y = .62; grp.add(stone);
    const plaqueMat = new THREE.MeshStandardMaterial({ map: canvasTex(256, 384, (g, w, hh) => {
      g.fillStyle = '#1e1912'; g.fillRect(0, 0, w, hh); g.strokeStyle = '#C9A35B'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, hh - 20);
      g.fillStyle = '#e2c27a'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `600 ${h[0].length > 4 ? 52 : 74}px ${SERIF}`; g.fillText(h[0], w / 2, 110);
      g.font = `italic 500 ${h[1].length > 16 ? 30 : 36}px ${SERIF}`; wrap(g, h[1], w / 2, 205, w - 40, 36);
      g.font = `500 28px ${SERIF}`; g.fillStyle = '#b8a37a'; g.fillText(h[2], w / 2, 320);
    }), emissive: '#ffffff', emissiveIntensity: 0, roughness: .8 });
    plaqueMat.emissiveMap = plaqueMat.map;
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(.62, .93), plaqueMat); plaque.position.set(0, .7, .105); grp.add(plaque);
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    flame.position.y = 1.45; flame.scale.setScalar(.8); grp.add(flame);
    scene.add(grp);
    return { u, plaqueMat, flame, lit: 0, litAt: Infinity };
  });
  function wrap(g, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '', lines = [];
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    lines.push(line); lines.forEach((l, i) => g.fillText(l, x, y + (i - (lines.length - 1) / 2) * lh));
  }
  const ROAD = u => { const p = road.getPointAt(Math.min(u, 1)), wide = innerWidth > innerHeight ? 2.2 : 0;
    return { p: new THREE.Vector3(p.x + 1.5 + wide, 5.2, p.z + 7.5), t: new THREE.Vector3(p.x + wide, .7, p.z - .3) }; };

  const COL0 = new THREE.Color('#6a717b'), COL1 = new THREE.Color('#b99a68'), EM0 = new THREE.Color('#ffffff'), EM1 = new THREE.Color('#ffc56a');
  const graceMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uO: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform float uO; varying vec2 vUv; void main(){ float a = pow(1. - vUv.y, 1.6) * .55 + .08; gl_FragColor = vec4(vec3(1., .86, .58) * a * uO, a * uO); }' });
  const roadLight = new THREE.PointLight('#ffc873', 0, 12, 1.5); roadLight.position.set(2.5, 2.2, 2.4); scene.add(roadLight);
  const grace = new THREE.Mesh(new THREE.CylinderGeometry(.5, 1.7, 36, 40, 1, true), graceMat);
  grace.position.set(JX, 18, JZ); scene.add(grace);

  /* ---- Capítulo IV: tres puertas de la muralla (verdad, trabajo, libertad) ---- */
  const PUERTAS = [['LA VERDAD', 1], ['EL TRABAJO', 3], ['LA LIBERTAD', 5]];
  const gates = PUERTAS.map(([txt, si]) => {
    const am = (si + .5) / SEGS * Math.PI * 2, out = new THREE.Vector3(Math.cos(am), 0, Math.sin(am)), tg = new THREE.Vector3(-out.z, 0, out.x);
    const pos = new THREE.Vector3(JX, 0, JZ).addScaledVector(out, JR * Math.cos(Math.PI / SEGS) + .55);
    const grp = new THREE.Group(); grp.position.copy(pos); grp.rotation.y = Math.atan2(out.x, out.z);
    [-.85, .85].forEach(x => { const pl = new THREE.Mesh(new THREE.BoxGeometry(.4, 2.5, .55), stoneMat); pl.position.set(x, 1.25, 0); grp.add(pl); });
    const lin = new THREE.Mesh(new THREE.BoxGeometry(2.3, .5, .6), stoneMat); lin.position.y = 2.7; grp.add(lin);
    const plMat = new THREE.MeshStandardMaterial({ map: canvasTex(512, 112, (g, w, h) => {
      g.fillStyle = '#1e1912'; g.fillRect(0, 0, w, h); g.strokeStyle = '#C9A35B'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = '#e8c87e'; g.font = `600 58px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 3);
    }), emissive: '#ffffff', emissiveIntensity: 0, roughness: .7 });
    plMat.emissiveMap = plMat.map;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .46), plMat); plate.position.set(0, 2.7, .31); grp.add(plate);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    glow.position.set(0, 1.3, .4); glow.scale.set(2.4, 3, 1); grp.add(glow);
    scene.add(grp);
    return { pos, out, tg, plMat, glow, lit: 0, litAt: Infinity };
  });
  const GATE = i => { const g = gates[i], wide = innerWidth > innerHeight ? 1.6 : 0;
    return { p: g.pos.clone().addScaledVector(g.out, 6.5).addScaledVector(g.tg, wide).add(new THREE.Vector3(0, 3, 0)), t: g.pos.clone().addScaledVector(g.tg, wide).add(new THREE.Vector3(0, 1.7, 0)) }; };

  /* ---- Capítulo V: luces rojas de la guerra, palomas de luz y amanecer ---- */
  const redTex = canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,190,160,1)'); r.addColorStop(.3, 'rgba(255,70,40,.7)'); r.addColorStop(1, 'rgba(255,40,20,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const drones = [], fires = [], doves = [];
  for (let i = 0; i < 70; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: redTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    sp.scale.setScalar(.35 + rand() * .25); scene.add(sp); drones.push({ sp, r: 3 + rand() * 6, h: 2.5 + rand() * 5, a: rand() * 6.28, w: .2 + rand() * .5 }); }
  for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: redTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    sp.position.set(2 + rand() * 12, .5, -7 + rand() * 12); sp.scale.setScalar(1 + rand() * 1.4); scene.add(sp); fires.push({ sp, f: rand() * 6 }); }
  for (let i = 0; i < 46; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: '#fff6e6' }));
    sp.scale.setScalar(.35 + rand() * .2); scene.add(sp); doves.push({ sp, a: rand() * 6.28, r: .5 + rand() * 6, s: rand(), v: .25 + rand() * .3 }); }
  const warLight = new THREE.PointLight('#ff4a2a', 0, 22, 1.4); warLight.position.set(6, 4, -1); scene.add(warLight);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }));
  sun.position.set(10, 6, -70); sun.scale.set(70, 26, 1); scene.add(sun);
  const BG_N = new THREE.Color('#0B0A08'), BG_D = new THREE.Color('#231b2a');
  const hemi = scene.children.find(o => o.isHemisphereLight);

  /* ---- Conclusión: un solo cuerpo, puertas abiertas a las naciones, árbol de la vida y Magníficat ---- */
  const addGlow = (color, op = 0) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op, color })); scene.add(sp); return sp; };
  // hilos de luz entre las lámparas de las familias (estrella {12/5}): un solo cuerpo
  const thrPts = [];
  for (let i = 0; i < SEGS; i++) { const a = (i + .5) / SEGS * Math.PI * 2, b = ((i + 5) % SEGS + .5) / SEGS * Math.PI * 2, r = JR - .9;
    thrPts.push(JX + Math.cos(a) * r, .45, JZ + Math.sin(a) * r, JX + Math.cos(b) * r, .45, JZ + Math.sin(b) * r);
    thrPts.push(JX + Math.cos(a) * r, .45, JZ + Math.sin(a) * r, JX, 1.2, JZ); }
  const thrGeo = new THREE.BufferGeometry(); thrGeo.setAttribute('position', new THREE.Float32BufferAttribute(thrPts, 3));
  const thrMat = new THREE.LineBasicMaterial({ color: '#ffd68a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.LineSegments(thrGeo, thrMat));
  // doce puertas abiertas y peregrinos de luz que llegan de todas las naciones
  const gates12 = [], pilgrims = [];
  for (let i = 0; i < SEGS; i++) { const am = (i + .5) / SEGS * Math.PI * 2, out = new THREE.Vector3(Math.cos(am), 0, Math.sin(am));
    const g = addGlow('#ffe3a8'); g.position.set(JX + out.x * (JR + .1), 1, JZ + out.z * (JR + .1)); g.scale.set(1.6, 2.4, 1); gates12.push(g);
    for (let k = 0; k < 7; k++) { const sp = addGlow('#fff2d6'); sp.scale.setScalar(.28 + rand() * .14); pilgrims.push({ sp, out, s: rand(), v: .5 + rand() * .5, j: (rand() - .5) * .9 }); } }
  // el árbol de la vida en la plaza, con hojas «para curar a los pueblos»
  const TX = JX, TZ = JZ + 1.85, tree = new THREE.Group(); tree.position.set(TX, 0, TZ); scene.add(tree);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.1, .2, 1.9, 8), new THREE.MeshStandardMaterial({ color: '#6d5232', roughness: .9, emissive: '#c98a3a', emissiveIntensity: .25 }));
  trunk.position.y = .95; tree.add(trunk);
  const CN = 320, cp = new Float32Array(CN * 3);
  for (let i = 0; i < CN; i++) { const u = rand() * 6.283, v = Math.acos(2 * rand() - 1), r = 1.15 * Math.cbrt(rand());
    cp.set([Math.sin(v) * Math.cos(u) * r, 2.3 + Math.cos(v) * r * .75, Math.sin(v) * Math.sin(u) * r], i * 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cp, 3));
  const crownMat = new THREE.PointsMaterial({ map: glowTex, color: '#ffe2a0', size: .34, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  tree.add(new THREE.Points(cg, crownMat));
  const treeGlow = addGlow('#ffd890'); treeGlow.position.set(TX, 2.3, TZ); treeGlow.scale.setScalar(4.2);
  const leaves = [];
  for (let i = 0; i < 40; i++) { const sp = addGlow('#d9ffcf'); sp.scale.setScalar(.16 + rand() * .1); leaves.push({ sp, a: rand() * 6.283, s: rand(), v: .4 + rand() * .4 }); }
  const BG_M = new THREE.Color('#2e2219');

  /* ---- Capítulo II: nueve piedras de cimiento en la plaza de Jerusalén ---- */
  const PIEDRAS = ['IMAGEN DE DIOS', 'IGUAL DIGNIDAD', 'DERECHOS HUMANOS', 'BIEN COMÚN', 'DESTINO UNIVERSAL', 'SUBSIDIARIEDAD', 'SOLIDARIDAD', 'JUSTICIA SOCIAL', 'DESARROLLO INTEGRAL'];
  const stones = PIEDRAS.map((txt, i) => {
    const a = Math.PI / 2 + (i - (PIEDRAS.length - 1) / 2) * (Math.PI * 2 / 10), r = 3.15;   // abanico abierto hacia la puerta sur
    const pos = new THREE.Vector3(JX + Math.cos(a) * r, 0, JZ + Math.sin(a) * r);
    const topMat = new THREE.MeshStandardMaterial({ map: canvasTex(512, 256, (g, w, h) => {
      g.fillStyle = '#cdb489'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(80,60,30,${rand() * .12})`; g.fillRect(rand() * w, rand() * h, 3, 3); }
      g.strokeStyle = '#7a5a2e'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = '#5a3d1a'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `600 ${txt.length > 15 ? 46 : 56}px ${SERIF}`; g.fillText(txt, w / 2, h / 2 + 4);
    }), emissive: '#ffcf80', emissiveIntensity: 0, roughness: .85 });
    const side = new THREE.MeshStandardMaterial({ color: '#a88c62', roughness: .9 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.25, .32, .62), [side, side, topMat, side, side, side]);
    m.position.set(pos.x, .16, pos.z); m.rotation.y = -a + Math.PI / 2; scene.add(m);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    glow.position.set(pos.x, .55, pos.z); glow.scale.setScalar(1.4); scene.add(glow);
    return { pos, a, topMat, glow, lit: 0, litAt: Infinity };
  });
  const STONE = i => { const st = stones[i], out = new THREE.Vector3(Math.cos(st.a), 0, Math.sin(st.a)), tg = new THREE.Vector3(-out.z, 0, out.x);
    const wide = innerWidth > innerHeight ? .9 : 0;
    return { p: st.pos.clone().addScaledVector(out, 5.5).add(new THREE.Vector3(0, 6.5, 0)).addScaledVector(tg, wide * 1.6), t: st.pos.clone().addScaledVector(tg, wide).add(new THREE.Vector3(0, .2, 0)) }; };
  let examen = 0, examenAt = Infinity;

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
    ch0:    { p: V(2, 17, 30), t: V(0, 0, 6) },
    ch1:    { p: V(-2, 6, 22), t: V(-7, 1.5, 4) },
    ch2:    { p: V(4, 3.2, 17), t: V(-2, .8, 12) },
    ch3:    { p: V(-16, 7, 15), t: V(JX, 1, JZ) },
    ch4:    { p: V(0, 12, 20), t: V(-4, 0, 6) },
    gate:   { p: V(-4.5, 3.4, 15.5), t: V(JX, 1.6, JZ + 3) },
    ch2a:   { p: V(JX + 7, 15, JZ + 15), t: V(JX, 0, JZ + 1) },
    examen: { p: V(JX + 1.5, 4.2, JZ + 8.5), t: V(JX, 1.1, JZ) },
    ch3a:   { p: V(3, 10, 24), t: V(2.5, 3, 0) },
    ai:     { p: V(BX - 4.5, 3.8, BZ + 6), t: V(BX - .5, 3.2, BZ) },
    desarme:{ p: V(5.5, 6.5, 11.5), t: V(3, .4, 1.4) },
    limite: { p: V(JX + 7.5, 2.4, JZ + 3.5), t: V(JX + 4, .6, JZ + 1) },
    ch4a:   { p: V(JX + 3, 9, JZ + 16), t: V(JX, 1.2, JZ + 2) },
    war:    { p: V(8, 6.5, 15), t: V(6, 2.8, -1) },
    war2:   { p: V(10, 4.5, 10), t: V(6, 4, -2) },
    love:   { p: V(JX + 6, 6, JZ + 12), t: V(JX, 3.2, JZ) },
    love2:  { p: V(-1, 9, 20), t: V(-3, 3.5, 0) },
    dawn:   { p: V(2, 6, 26), t: V(0, 4.5, -6) },
    concl0: { p: V(-2, 16, 27), t: V(-3, 1, 0) },
    arch:   { p: V(-1, 7, 19), t: V(-4, 2, 1) },
    verbo:  { p: V(JX + 2.2, 6.5, JZ + 8), t: V(JX, 1, JZ) },
    cuerpo: { p: V(JX + 1, 15, JZ + 6.5), t: V(JX, 0, JZ) },
    nueva:  { p: V(JX + 10, 10, JZ + 17), t: V(JX, 1.5, JZ) },
    maria:  { p: V(JX + 4, 5.2, JZ + 8.5), t: V(JX, 2.2, JZ + 1.6) },
    magni:  { p: V(1, 8.5, 28), t: V(-5, 3.5, 0) },
  };
  let keys = [], R = {}, R3 = {}, R5 = {}, R6 = {}, vh = innerHeight;
  const OVER_L = CAMS.over, CHOICE_L = CAMS.choice;
  const OVER_P = { p: V(3, 3.5, 21), t: V(8, .2, -1.5) }, CHOICE_P = { p: V(2, 9, 15), t: V(-5, 1, 1) };
  // en escritorio, desplazar el encuadre para que la ciudad quede a la izquierda del panel de texto
  const SHIFT = new Set(['verbo', 'cuerpo', 'nueva', 'maria', 'magni']);
  function shiftCam(c) { const d = c.t.clone().sub(c.p), r = d.clone().cross(V(0, 1, 0)).setY(0).normalize().multiplyScalar(d.length() * .2);
    return { p: c.p.clone().add(r), t: c.t.clone().add(r) }; }
  function buildKeys() {
    const portrait = innerWidth < innerHeight;
    CAMS.over = portrait ? OVER_P : OVER_L; CAMS.choice = portrait ? CHOICE_P : CHOICE_L;
    vh = innerHeight; keys = []; const y0 = scrollY;
    gates.forEach(g => { g.litAt = Infinity; });
    const box = id => { const r = document.getElementById(id).getBoundingClientRect(); return { top: r.top + y0, bot: r.bottom + y0 }; };
    document.querySelectorAll('[data-cam]').forEach(el => {
      const c = el.dataset.cam; if (c === 'travel') return;
      const r = el.getBoundingClientRect(), top = r.top + y0, bot = r.bottom + y0, a = top - vh * .1, b = Math.max(a, bot - vh * .9);
      if (el.dataset.gate !== undefined) { const gi = +el.dataset.gate, st = GATE(gi); keys.push([a, st], [b, st]); gates[gi].litAt = Math.min(gates[gi].litAt, top - vh * .35); }
      else if (c === 'stone') { const st = STONE(+el.dataset.stone); keys.push([a, st], [b, st]); stones[+el.dataset.stone].litAt = top - vh * .35; }
      else if (c === 'road') { const [u0, u1] = el.dataset.ru.split(',').map(Number); keys.push([a, ROAD(u0)], [b, ROAD(u1)]); }
      else { const cm = (!portrait && SHIFT.has(c)) ? shiftCam(CAMS[c]) : CAMS[c]; keys.push([a, cm], [b, cm]); }
      if (c === 'examen') examenAt = top - vh * .4;
      if (el.dataset.hitos) { const [h0, h1] = el.dataset.hitos.split(',').map(Number);
        for (let h = h0; h <= h1; h++) stelae[h].litAt = top - vh * .3 + (h1 > h0 ? (h - h0) / (h1 - h0) : 0) * Math.max(0, (bot - top) - vh * .6); }
    });
    keys.sort((p, q) => p[0] - q[0]);
    const b2 = box('cosas-nuevas'), b3 = box('babel'), b4 = box('nehemias'), b5 = box('primera-eleccion'), b6 = box('construir');
    const c52 = box('c5-guerra'), c53 = box('c5-armas'), c55 = box('c5-esperanza'), c56 = box('c5-palabras'), c59 = box('c5-orar');
    const cp4 = box('capitulo-4');
    const k3 = box('cc-cuerpo'), k7 = box('cc-nueva'), k9 = box('cc-magnificat');
    R6 = { unity: [k3.top - vh * .5, k3.top + vh * .2], nations: [k7.top - vh * .6, k7.top + vh * .2], tree: [k7.top - vh * .3, k7.top + vh * .6], magni: [k9.top - vh * .7, k9.top + vh * .3] };
    R5 = { graceOff: [cp4.top - vh, cp4.top], war: [c52.top - vh * .5, c53.top], love: [c55.top - vh * .5, c56.top], dawn: [c59.top - vh * .6, c59.top + vh * .2] };
    const c31 = box('c3-hoy'), c33 = box('c3-poder'), c36 = box('c3-desarmar'), c310 = box('c3-gracia');
    R3 = { rebuild: [c31.top - vh * .5, c33.bot - vh * .8], disarm: [c36.top - vh * .3, c36.top + (c36.bot - c36.top) * .5], grace: [c310.top - vh * .5, c310.top + vh * .3] };
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

  const cur = { p: keys[0][1].p.clone(), t: keys[0][1].t.clone(), build: .35, scatter: 0, wall: 0, glow: 0, rebuild: 0, disarm: 0, grace: 0, war: 0, love: 0, dawn: 0, unity: 0, nations: 0, tree: 0, magni: 0 };
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
    for (const key of ['build', 'scatter', 'wall', 'glow', 'rebuild', 'disarm', 'grace', 'war', 'love', 'dawn', 'unity', 'nations', 'tree', 'magni']) {
      const tg = key === 'build' ? .35 + .65 * pAt(y, R.build) : pAt(y, R[key] || R3[key] || R5[key] || R6[key]);
      cur[key] += (tg - cur[key]) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2));
    }
    // formato vertical: alejar la cámara en su propia dirección
    const aspect = camera.aspect, port = aspect < 1 ? 1 + (1 - aspect) * .55 : 1;
    off.subVectors(cur.p, cur.t).multiplyScalar(port);
    camera.position.copy(cur.t).add(off);
    if (!reduceMotion) camera.position.x += Math.sin(t * .15) * .3;
    camera.lookAt(cur.t);

    updateBabel(cur.build, cur.scatter, cur.rebuild, cur.disarm);
    const tower = 1 - cur.scatter * (1 - cur.rebuild);
    blockMat.emissiveIntensity = .5 * (.2 + .8 * tower) + cur.disarm * .45;
    roadLight.intensity = cur.disarm * 7;
    blockMat.emissive.lerpColors(EM0, EM1, cur.disarm);
    blockMat.color.lerpColors(COL0, COL1, cur.disarm);
    babelGlow.intensity = (cur.build - .3) * 6 * tower * (1 - cur.disarm);
    graceMat.uniforms.uO.value = cur.grace * (1 - pAt(y, R5.graceOff));
    gates.forEach((g, i) => {
      g.lit += ((y > g.litAt ? 1 : 0) - g.lit) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 2.5));
      g.plMat.emissiveIntensity = g.lit * .6; g.glow.material.opacity = g.lit * (.45 + Math.sin(t * 2 + i) * .05);
    });
    const war = cur.war * (1 - cur.love), love = cur.love;
    drones.forEach((d, i) => { const a = d.a + t * d.w * (reduceMotion ? 0 : 1);
      d.sp.position.set(6 + Math.cos(a) * d.r, d.h + Math.sin(t * 1.3 + i) * .3, -1 + Math.sin(a) * d.r * .8); d.sp.material.opacity = war * .9; });
    fires.forEach(f => { f.sp.material.opacity = war * (.55 + Math.sin(t * 7 + f.f) * .2); });
    warLight.intensity = war * 9;
    doves.forEach(d => { const k = (d.s + t * .05 * d.v * (reduceMotion ? 0 : 1)) % 1, a = d.a + k * 3;
      d.sp.position.set(JX + Math.cos(a) * (d.r * .4 + k * 6), 1 + k * 13, JZ + Math.sin(a) * (d.r * .4 + k * 6)); d.sp.material.opacity = love * (1 - k) * .95; });
    scene.background.lerpColors(BG_N, BG_D, cur.dawn).lerp(BG_M, cur.magni); scene.fog.color.copy(scene.background);
    sun.material.opacity = cur.dawn * .75; if (hemi) hemi.intensity = 1 + cur.dawn * .6 + cur.magni * .5;
    const mv = reduceMotion ? 0 : 1, M = cur.magni;
    thrMat.opacity = cur.unity * (.42 + Math.sin(t * 1.6) * .06) + M * .3;
    gates12.forEach((g, i) => { g.material.opacity = cur.nations * (.5 + Math.sin(t * 2 + i) * .06); });
    pilgrims.forEach(p => { const k = (p.s + t * .035 * p.v * mv) % 1, r = JR + 15 - k * 15.5;
      p.sp.position.set(JX + p.out.x * r - p.out.z * p.j * (1 - k), .35, JZ + p.out.z * r + p.out.x * p.j * (1 - k));
      p.sp.material.opacity = cur.nations * Math.min(1, k * 4) * Math.min(1, (1 - k) * 6) * .9; });
    const tg = Math.max(.001, cur.tree); tree.scale.set(tg, tg, tg); tree.visible = cur.tree > .01;
    crownMat.opacity = cur.tree * .95; trunk.material.emissiveIntensity = .25 + M * .4;
    treeGlow.material.opacity = cur.tree * (.45 + M * .35 + Math.sin(t * 1.2) * .05); treeGlow.position.y = .3 + 2 * tg;
    leaves.forEach(l => { const k = (l.s + t * .03 * l.v * mv) % 1, a = l.a + k * 1.2, r = .6 + k * 13;
      l.sp.position.set(TX + Math.cos(a) * r, 2.4 + Math.sin(k * Math.PI) * 2.5 - k * 2, TZ + Math.sin(a) * r);
      l.sp.material.opacity = cur.tree * Math.min(1, k * 6) * (1 - k) * .9; });

    updateCity(cur.wall, cur.glow, t);
    stones.forEach((st, i) => {
      st.lit += ((y > st.litAt ? 1 : 0) - st.lit) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 2.5));
      st.topMat.emissiveIntensity = st.lit * .35;
      st.glow.material.opacity = st.lit * (.55 + Math.sin(t * 2 + i) * .06);
    });
    examen += ((y > examenAt ? 1 : 0) - examen) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 1.5));
    if (examen > .001) {
      tBody.material.emissiveIntensity = .6 + examen * .9;
      templeGlow.scale.setScalar(4 + examen * 3);
      cityLight.intensity = 13 + examen * 8;
      segs.forEach(sg => { sg.fam.scale.setScalar(.9 + examen * .6); });
    }
    if (M > .001) { cityLight.intensity += M * 10; templeGlow.material.opacity = Math.min(1, templeGlow.material.opacity + M * .2); }
    stelae.forEach((st, i) => {
      st.lit += ((y > st.litAt ? 1 : 0) - st.lit) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 2.5));
      st.plaqueMat.emissiveIntensity = st.lit * .55;
      st.flame.material.opacity = st.lit * (.8 + Math.sin(t * 3 + i) * .08);
    });
    renderer.render(scene, camera);
  }
  loop();
  requestAnimationFrame(() => stageEl.classList.add('is-ready'));
}
