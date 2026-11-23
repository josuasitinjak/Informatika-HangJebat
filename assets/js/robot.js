/**
 * robot.js — maskot 3D "Jebat" (Three.js r149, WebGL) sesuai Character Model Sheet pemilik.
 *
 * Struktur model (semua geometri dibuat prosedural, tanpa berkas 3D eksternal):
 *  KEPALA   helm putih superelipsoid lebar (kubah atas, bawah lebih datar) + panel melingkar di atas;
 *           layar 3 lapis: bingkai abu-abu kebiruan → bezel hitam tebal → layar kaca gelap
 *           melengkung & menjorok ke dalam (wajah digambar di tekstur kanvas, bisa berganti ekspresi).
 *  LEHER    sambungan mekanis pendek abu-abu metalik dengan alur gelap.
 *  BADAN    lathe membulat compact; jas navy 3D bertebal dengan bukaan V sungguhan, lapel, tepi (hem);
 *           kemeja putih, kerah 2 bagian, dasi merah 3D bergaris emas horizontal;
 *           mangkuk bawah putih + senyum LED cyan + thruster cincin cyan di dasar.
 *  TANGAN   kapsul putih + cincin cyan + cincin logam + sambungan mekanis gelap yang mengarah ke badan.
 *
 * API (tidak berubah):
 *   const bot = HJRobot.mount(el, { size, bubble, mood, lines, controls });
 *   bot.setMood('idle'|'happy'|'sad'|'think'|'wow'|'shy'|'peek'|'wink'|'excited'),
 *   bot.say(), bot.lookAt(), bot.celebrate(), bot.shake(), bot.setView(yawDeg, pitchDeg)
 *   HJRobot.group([...])
 * controls: true → seret untuk memutar 360°, roda/cubit untuk zoom, klik dua kali untuk reset.
 * Tanpa WebGL → cadangan 2D HJRobotSVG. Hormati prefers-reduced-motion.
 */
(function () {
  'use strict';
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function webglOK() {
    if (!window.THREE) return false;
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }

  // ═════════ Ukuran utama (satuan dunia) ═════════
  const HEAD = { a: 1.0, top: 0.8, bot: 0.62, ex: 0.42, eyT: 0.82, eyB: 0.5, depth: 0.86 };
  const HEAD_Y = 0.28 + 0.62;          // pusat kepala (pivot leher 0.28 + setengah bawah kepala)
  const SCR = { w: 1.34, h: 0.76, r: 0.26, cy: 0.06 }; // layar terhadap pusat kepala
  const BEZ = { w: 1.5, h: 0.92, r: 0.33 };
  const FRM = { w: 1.62, h: 1.04, r: 0.4 };
  const BEND = 0.22;                   // kelengkungan layar/bingkai (z turun di tepi kiri-kanan)
  // Profil badan (radius, y)
  const PROFILE = [[0, -1.12], [0.3, -1.09], [0.56, -1.0], [0.76, -0.84], [0.88, -0.64], [0.93, -0.42], [0.935, -0.2], [0.9, -0.03], [0.83, 0.06], [0.7, 0.12], [0, 0.13]];
  function bodyR(y) {
    for (let i = 0; i < PROFILE.length - 1; i++) {
      const [r1, y1] = PROFILE[i], [r2, y2] = PROFILE[i + 1];
      if ((y >= y1 && y <= y2) || (y <= y1 && y >= y2)) { const t = (y - y1) / ((y2 - y1) || 1); return r1 + (r2 - r1) * t; }
    }
    return 0.9;
  }
  const JACKET = { top: 0.06, hem: -0.62, vBottom: -0.52, gapTop: 0.46, off: 0.032 };

  // ═════════ Tekstur wajah ═════════
  const FW = 512, FH = Math.round(512 * SCR.h / SCR.w);
  const CYAN = '#7AF5FF';
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function drawFace(ctx, mood, ex, ey, blink) {
    ctx.clearRect(0, 0, FW, FH);
    // layar berbentuk rounded rect (sudut di luar transparan → alphaTest)
    rr(ctx, 0, 0, FW, FH, Math.round(FW * SCR.r / SCR.w));
    const g = ctx.createRadialGradient(FW / 2, FH * 0.3, 10, FW / 2, FH / 2, FW * 0.7);
    g.addColorStop(0, '#0D1428'); g.addColorStop(1, '#020309');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    const L = { x: 178 + ex, y: FH * 0.44 + ey }, R = { x: 334 + ex, y: FH * 0.44 + ey };
    ctx.strokeStyle = CYAN; ctx.fillStyle = CYAN;
    ctx.lineWidth = 25; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(60,220,255,.75)'; ctx.shadowBlur = 22;
    const arch = (p) => {
      ctx.save(); ctx.translate(p.x, p.y + 20); ctx.scale(1, blink); ctx.translate(-p.x, -(p.y + 20));
      ctx.beginPath(); ctx.moveTo(p.x - 38, p.y + 40); ctx.lineTo(p.x - 38, p.y + 8); ctx.arc(p.x, p.y + 8, 38, Math.PI, 0); ctx.lineTo(p.x + 38, p.y + 40); ctx.stroke();
      ctx.restore();
    };
    const chevron = (p, dir) => { ctx.beginPath(); ctx.moveTo(p.x - 28 * dir, p.y - 14); ctx.lineTo(p.x + 28 * dir, p.y + 16); ctx.lineTo(p.x - 28 * dir, p.y + 46); ctx.stroke(); };
    const caret = (p) => { ctx.beginPath(); ctx.moveTo(p.x - 38, p.y + 42); ctx.lineTo(p.x, p.y - 2); ctx.lineTo(p.x + 38, p.y + 42); ctx.stroke(); };
    const dot = (p, r) => { ctx.save(); ctx.translate(p.x, p.y + 18); ctx.scale(1, blink); ctx.beginPath(); ctx.arc(0, 0, r || 36, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
    const sadArc = (p, tilt) => { ctx.save(); ctx.translate(p.x, p.y + 34); ctx.rotate(tilt); ctx.beginPath(); ctx.moveTo(-38, 14); ctx.lineTo(-38, 4); ctx.arc(0, 4, 38, Math.PI, 0); ctx.lineTo(38, 14); ctx.restore(); ctx.stroke(); };
    switch (mood) {
      case 'wink': arch(L); chevron(R, -1); break;
      case 'wow': dot(L); dot(R); break;
      case 'sad': sadArc(L, -0.22); sadArc(R, 0.22); break;
      case 'excited': caret(L); caret(R); break;
      case 'think':
        ctx.save(); ctx.translate(L.x, L.y + 18); ctx.beginPath(); ctx.arc(0, 0, 36, Math.PI * 0.5, Math.PI * 1.5); ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.moveTo(R.x - 32, R.y + 18); ctx.lineTo(R.x + 32, R.y + 18); ctx.stroke();
        break;
      case 'shy': chevron(L, 1); chevron(R, -1); break;
      case 'peek': dot(R, 32); break;
      default: arch(L); arch(R);
    }
    ctx.restore();
  }

  // ═════════ Utilitas geometri ═════════
  function roundedPts(THREE, w, h, r, n) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    return s.getSpacedPoints(n || 220);
  }
  function ringGeo(THREE, outer, inner, depth, bevel) {
    const shape = new THREE.Shape(roundedPts(THREE, outer.w, outer.h, outer.r));
    shape.holes.push(new THREE.Path(roundedPts(THREE, inner.w, inner.h, inner.r)));
    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 4 });
  }
  /** Lengkungkan geometri: z turun mengikuti x² agar mengikuti muka helm. */
  function bend(geo, k, halfW) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) / halfW; p.setZ(i, p.getZ(i) - k * x * x); }
    geo.computeVertexNormals();
    return geo;
  }
  /** Profil kepala (superelips): sisi tegak, kubah di atas, bawah lebih datar. Diputar → bulat dari atas. */
  function headProfile(n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const phi = -Math.PI / 2 + Math.PI * (i / n), c = Math.cos(phi), sn = Math.sin(phi);
      const r = HEAD.a * Math.pow(Math.abs(c), HEAD.ex);
      const y = sn >= 0 ? HEAD.top * Math.pow(sn, HEAD.eyT) : -HEAD.bot * Math.pow(-sn, HEAD.eyB);
      pts.push([i === 0 || i === n ? 0 : r, y]);
    }
    return pts;
  }
  function headTopY(r) { // tinggi permukaan atas kepala pada radius r
    const pts = headProfile(400).filter(([, y]) => y > 0);
    let best = pts[0];
    pts.forEach((q) => { if (Math.abs(q[0] - r) < Math.abs(best[0] - r)) best = q; });
    return best[1];
  }
  function headGeometry(THREE) {
    const g = new THREE.LatheGeometry(headProfile(96).map(([r, y]) => new THREE.Vector2(r, y)), 160);
    g.scale(1, 1, HEAD.depth); // kedalaman kepala sedikit lebih kecil dari lebarnya (sesuai tampak samping)
    g.computeVertexNormals();
    return g;
  }
  /** Permukaan pita mengelilingi badan, dengan celah depan berbentuk V (jas). */
  function bandGeo(THREE, yTop, yBot, rowsN, colsN, thetaFn, radiusFn) {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= rowsN; i++) {
      const y = yTop + (yBot - yTop) * (i / rowsN);
      const [t0, t1] = thetaFn(y);
      for (let j = 0; j <= colsN; j++) {
        const th = t0 + (t1 - t0) * (j / colsN), r = radiusFn(y);
        pos.push(r * Math.sin(th), y, r * Math.cos(th));
        uv.push(j / colsN, i / rowsN);
      }
    }
    for (let i = 0; i < rowsN; i++) for (let j = 0; j < colsN; j++) {
      const a = i * (colsN + 1) + j, b = a + colsN + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const vGap = (y) => (y <= JACKET.vBottom ? 0 : JACKET.gapTop * Math.min(1, (y - JACKET.vBottom) / (JACKET.top - JACKET.vBottom)));
  const tube = (THREE, pts, r, closed) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, !!closed), Math.max(24, pts.length * 3), r, 10, !!closed);

  function stripeTexture(THREE) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#C9302A'; x.fillRect(0, 0, 16, 64);
    x.fillStyle = '#F2B33D'; x.fillRect(0, 22, 16, 9);
    x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, 31, 16, 3);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 1 / 0.085); t.encoding = THREE.sRGBEncoding;
    return t;
  }
  function shadowTexture(THREE) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,10,.55)'); g.addColorStop(0.55, 'rgba(0,0,10,.18)'); g.addColorStop(1, 'rgba(0,0,10,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  function studioEnv(THREE, renderer) {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x20263a, side: THREE.BackSide })));
    const panel = (w, h, color, pos, rot) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
      m.position.set(...pos); if (rot) m.rotation.set(...rot); s.add(m);
    };
    panel(7, 2.4, 0xffffff, [0, 4.8, 0.5], [Math.PI / 2, 0, 0]);
    panel(2.6, 4.5, 0xeef2ff, [-4.8, 1, 1.5], [0, Math.PI / 2, 0]);
    panel(2.2, 3.5, 0x4a66ff, [4.8, 0.6, -1.5], [0, -Math.PI / 2, 0]);
    panel(5, 1.8, 0xffffff, [0, 1.2, 4.8], [0, Math.PI, 0]);
    panel(3, 1, 0x9fdfff, [0, -4.8, 1], [-Math.PI / 2, 0, 0]);
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(s, 0.035).texture;
    pm.dispose();
    return tex;
  }

  // ═════════ Rakit model ═════════
  function buildRobot(THREE, faceTex) {
    const M = {
      white: new THREE.MeshPhysicalMaterial({ color: 0xF3F5F9, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 }),
      frame: new THREE.MeshPhysicalMaterial({ color: 0x8E9BB3, roughness: 0.38, metalness: 0.35, clearcoat: 0.6 }),
      bezel: new THREE.MeshPhysicalMaterial({ color: 0x15181F, roughness: 0.32, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
      metal: new THREE.MeshStandardMaterial({ color: 0xC3C9D4, roughness: 0.28, metalness: 0.75 }),
      joint: new THREE.MeshStandardMaterial({ color: 0x343946, roughness: 0.34, metalness: 0.7 }),
      navy: new THREE.MeshStandardMaterial({ color: 0x1A2647, roughness: 0.82, metalness: 0, envMapIntensity: 0.45, side: THREE.DoubleSide }),
      lapel: new THREE.MeshStandardMaterial({ color: 0x223058, roughness: 0.6, envMapIntensity: 0.55, side: THREE.DoubleSide }),
      shirt: new THREE.MeshPhysicalMaterial({ color: 0xFBFCFE, roughness: 0.6, sheen: 0.3, side: THREE.DoubleSide }),
      tie: new THREE.MeshPhysicalMaterial({ map: stripeTexture(THREE), roughness: 0.45, clearcoat: 0.4 }),
      knot: new THREE.MeshPhysicalMaterial({ color: 0xC9302A, roughness: 0.45, clearcoat: 0.4 }),
      cyan: new THREE.MeshStandardMaterial({ color: 0x8AF6FF, emissive: 0x2FE2FF, emissiveIntensity: 1.9, roughness: 0.3 }),
      screen: new THREE.MeshPhysicalMaterial({ map: faceTex, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: 0.85, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, alphaTest: 0.5 }),
    };
    const root = new THREE.Group();
    const add = (parent, geo, mat, pos, rot, scale) => {
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(...pos); if (rot) m.rotation.set(...rot); if (scale) m.scale.set(...scale);
      parent.add(m); return m;
    };

    // ── BADAN ──
    const body = new THREE.Group(); root.add(body);
    add(body, new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 128), M.white);
    // Jas navy bertebal dengan bukaan V
    const rJ = (y) => bodyR(y) + JACKET.off;
    add(body, bandGeo(THREE, JACKET.top, JACKET.hem, 48, 180, (y) => [vGap(y), Math.PI * 2 - vGap(y)], rJ), M.navy);
    add(body, bandGeo(THREE, JACKET.top, JACKET.hem, 48, 180, (y) => [vGap(y), Math.PI * 2 - vGap(y)], (y) => rJ(y) - 0.022), M.navy); // sisi dalam (tebal)
    // Lapel kiri & kanan (lipatan kerah jas)
    [1, -1].forEach((s) => {
      const w = (y) => 0.03 + 0.2 * Math.max(0, (y - JACKET.vBottom) / (JACKET.top - JACKET.vBottom));
      const th = (y) => (s > 0 ? [vGap(y), vGap(y) + w(y)] : [-vGap(y) - w(y), -vGap(y)]);
      add(body, bandGeo(THREE, JACKET.top + 0.005, JACKET.vBottom, 20, 10, th, (y) => rJ(y) + 0.016), M.lapel);
      // tepi lapel luar & tepi bukaan V (memberi ketebalan)
      const edge = [], outer = [];
      for (let k = 0; k <= 20; k++) {
        const y = JACKET.top + (JACKET.vBottom - JACKET.top) * (k / 20);
        const a = s * vGap(y), b = s * (vGap(y) + w(y));
        edge.push(new THREE.Vector3(rJ(y) * Math.sin(a), y, rJ(y) * Math.cos(a)));
        outer.push(new THREE.Vector3((rJ(y) + 0.016) * Math.sin(b), y, (rJ(y) + 0.016) * Math.cos(b)));
      }
      add(body, tube(THREE, edge, 0.024), M.lapel);
      add(body, tube(THREE, outer, 0.011), M.navy);
    });
    // Tepi atas jas (mengitari leher, kecuali bukaan depan) & tepi bawah (hem)
    const topPts = [];
    for (let k = 0; k <= 64; k++) { const t = vGap(JACKET.top) + (Math.PI * 2 - 2 * vGap(JACKET.top)) * (k / 64); topPts.push(new THREE.Vector3(rJ(JACKET.top) * Math.sin(t), JACKET.top, rJ(JACKET.top) * Math.cos(t))); }
    add(body, tube(THREE, topPts, 0.03), M.navy);
    add(body, new THREE.TorusGeometry(rJ(JACKET.hem), 0.028, 12, 128), M.navy, [0, JACKET.hem, 0], [Math.PI / 2, 0, 0]);
    // Kerah kemeja (pita leher + dua ujung kerah)
    add(body, new THREE.TorusGeometry(0.62, 0.045, 14, 96), M.shirt, [0, 0.11, 0.02], [Math.PI / 2, 0, 0]);
    const collarShape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.2, 0.01), new THREE.Vector2(0.05, -0.21)]);
    const collarGeo = new THREE.ExtrudeGeometry(collarShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 3 });
    [1, -1].forEach((s) => {
      const c = add(body, collarGeo, M.shirt, [s * 0.025, 0.115, bodyR(0.06) + 0.03], [-0.5, s * 0.28, s * -0.1]);
      c.scale.x = s;
    });
    // Dasi 3D: simpul + bilah bergaris emas horizontal
    add(body, new THREE.SphereGeometry(1, 32, 20), M.knot, [0, 0.035, bodyR(0.035) + 0.045], [-0.3, 0, 0], [0.085, 0.07, 0.05]);
    const tieShape = new THREE.Shape([new THREE.Vector2(-0.045, 0), new THREE.Vector2(0.045, 0), new THREE.Vector2(0.1, -0.4), new THREE.Vector2(0, -0.49), new THREE.Vector2(-0.1, -0.4)]);
    const tieGeo = new THREE.ExtrudeGeometry(tieShape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3 });
    add(body, tieGeo, M.tie, [0, -0.01, bodyR(-0.01) + 0.02], [-0.13, 0, 0]);
    // Senyum LED & thruster bawah
    const arc = Math.PI * 0.6;
    add(body, new THREE.TorusGeometry(0.2, 0.026, 12, 48, arc), M.cyan, [0, -0.81, bodyR(-0.81) - 0.012], [-0.72, 0, -Math.PI / 2 - arc / 2]);
    add(body, new THREE.CircleGeometry(0.2, 48), M.joint, [0, -1.108, 0], [Math.PI / 2, 0, 0]);
    add(body, new THREE.TorusGeometry(0.25, 0.04, 14, 64), M.cyan, [0, -1.085, 0], [Math.PI / 2, 0, 0]);
    // Leher mekanis
    add(body, new THREE.CylinderGeometry(0.5, 0.58, 0.17, 64), M.metal, [0, 0.2, 0]);
    add(body, new THREE.TorusGeometry(0.525, 0.016, 10, 80), M.joint, [0, 0.215, 0], [Math.PI / 2, 0, 0]);

    // ── KEPALA ──
    const head = new THREE.Group(); head.position.y = 0.28; root.add(head);
    const hc = 0.62; // pusat kepala relatif pivot
    add(head, headGeometry(THREE), M.white, [0, hc, 0]);
    // Panel melingkar di atas kepala (dua alur)
    [0.5, 0.44].forEach((r, k) => {
      const yTop = headTopY(r);
      add(head, new THREE.TorusGeometry(r, k ? 0.008 : 0.013, 8, 96), k ? M.frame : M.metal, [0, hc + yTop - 0.004, 0], [Math.PI / 2, 0, 0], [1, HEAD.depth, 1]);
    });
    // Layar 3 lapis, dilengkungkan mengikuti muka helm
    const faceZ = 0.48, sy = hc + SCR.cy;
    const frame = add(head, bend(ringGeo(THREE, FRM, BEZ, 0.42, 0.018), BEND, FRM.w / 2), M.frame, [0, sy, faceZ]);
    const bez = add(head, bend(ringGeo(THREE, BEZ, SCR, 0.46, 0.024), BEND, FRM.w / 2), M.bezel, [0, sy, faceZ + 0.005]);
    const scrGeo = bend(new THREE.PlaneGeometry(SCR.w + 0.02, SCR.h + 0.02, 48, 12), BEND, FRM.w / 2);
    add(head, scrGeo, M.screen, [0, sy, faceZ + 0.44]);
    // panel belakang gelap (mencegah tembus pandang ke dalam helm)
    add(head, bend(new THREE.PlaneGeometry(SCR.w + 0.04, SCR.h + 0.04, 24, 4), BEND, FRM.w / 2), M.bezel, [0, sy, faceZ + 0.39]);
    void frame; void bez;

    // ── TANGAN ──
    const makeHand = (side) => {
      const h = new THREE.Group();
      add(h, new THREE.SphereGeometry(0.28, 48, 32), M.white, [0, 0, 0], null, [1, 1.1, 1]);
      add(h, new THREE.TorusGeometry(0.276, 0.024, 12, 64), M.cyan, [0, -0.08, 0], [Math.PI / 2, 0, 0]);
      // sambungan mekanis gelap, condong ke arah badan
      const j = new THREE.Group(); j.rotation.z = side < 0 ? 0.6 : -0.6; h.add(j);
      add(j, new THREE.TorusGeometry(0.115, 0.024, 10, 40), M.metal, [0, -0.29, 0], [Math.PI / 2, 0, 0]);
      add(j, new THREE.CylinderGeometry(0.085, 0.1, 0.18, 24), M.joint, [0, -0.37, 0]);
      add(j, new THREE.SphereGeometry(0.1, 24, 16), M.joint, [0, -0.46, 0]);
      add(j, new THREE.TorusGeometry(0.088, 0.012, 8, 32), M.metal, [0, -0.41, 0], [Math.PI / 2, 0, 0]);
      root.add(h);
      return h;
    };
    const handL = makeHand(-1), handR = makeHand(1);
    return { root, body, head, handL, handR, M };
  }

  // ═════════ Mount ═════════
  function mount(host, opts) {
    if (!host) return null;
    if (!webglOK()) return window.HJRobotSVG ? window.HJRobotSVG.mount(host, opts) : null;
    const THREE = window.THREE;
    // Warna hex diperlakukan sebagai sRGB (bukan linear) agar navy/merah/putih tampil sesuai desain
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    const o = Object.assign({ size: 200, bubble: false, mood: 'idle', controls: false }, opts || {});
    host.classList.add('hj-robot', 'hj-robot--3d');
    if (o.controls) host.classList.add('hj-robot--controls');
    host.style.setProperty('--size', `${o.size}px`);
    host.innerHTML = `${o.bubble ? '<div class="hj-robot__bubble" aria-hidden="true"></div>' : ''}<div class="hj-robot__stage"></div>`;
    const stage = host.querySelector('.hj-robot__stage');
    const bubble = host.querySelector('.hj-robot__bubble');

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: !!o.preserve }); } catch (e) {
      host.classList.remove('hj-robot--3d');
      return window.HJRobotSVG ? window.HJRobotSVG.mount(host, opts) : null;
    }
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = studioEnv(THREE, renderer);
    const camera = new THREE.PerspectiveCamera(28, 0.89, 0.1, 60);
    const TARGET = new THREE.Vector3(0, 0.26, 0);
    let dist = o.distance || 7.6, distT = dist;
    const placeCamera = () => { camera.position.set(0, TARGET.y + 0.35, dist); camera.lookAt(TARGET); };
    placeCamera();

    scene.add(new THREE.HemisphereLight(0xffffff, 0x223, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(-3, 5, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x5b74ff, 2.0); rim.position.set(4, 2.5, -4); scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0xa9c4ff, 0.8); rim2.position.set(-4, 1, -3); scene.add(rim2);
    const fill = new THREE.DirectionalLight(0x7af5ff, 0.3); fill.position.set(0, -3, 3); scene.add(fill);

    const faceCanvas = document.createElement('canvas'); faceCanvas.width = FW; faceCanvas.height = FH;
    const fctx = faceCanvas.getContext('2d');
    const faceTex = new THREE.CanvasTexture(faceCanvas); faceTex.encoding = THREE.sRGBEncoding; faceTex.anisotropy = 4;
    const R = buildRobot(THREE, faceTex);
    const pivot = new THREE.Group(); pivot.add(R.root); scene.add(pivot); // pivot = rotasi pengguna (seret)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.0), new THREE.MeshBasicMaterial({ map: shadowTexture(THREE), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.48; scene.add(shadow);

    // ───────── Keadaan ─────────
    let mood = '';
    let target = null, px = 0, py = 0, cx = 0, cy = 0, pointerActive = false;
    let blink = 1, nextBlink = 2 + Math.random() * 3, blinkT = -1;
    let jump = 0, jumpV = 0, shakeT = 0, waveT = 0, spin = 0, spinV = 0;
    let yaw = 0, pitch = 0, yawV = 0, pitchV = 0, idleSince = 0, frozen = false;
    let lastFace = '';
    const REST = { L: [-1.27, -0.14, 0.12], R: [1.27, -0.14, 0.12] };
    const POSES = {
      shy: { L: [-0.36, 0.96, 1.2], R: [0.36, 0.96, 1.2] },
      peek: { L: [-0.36, 0.96, 1.2], R: REST.R },
      think: { L: REST.L, R: [0.72, 0.36, 1.0] },
      excited: { L: [-1.2, 1.1, 0.3], R: [1.2, 1.1, 0.3] },
      wow: { L: [-1.28, 0.28, 0.45], R: [1.28, 0.28, 0.45] },
    };
    const pose = { L: REST.L.slice(), R: REST.R.slice() };
    const cur = { L: REST.L.slice(), R: REST.R.slice() };
    const setPose = (name) => { const p = POSES[name] || {}; pose.L = (p.L || REST.L).slice(); pose.R = (p.R || REST.R).slice(); };

    function paintFace() {
      const still = mood === 'shy' || frozen;
      const ex = still ? 0 : cx * 30, ey = still ? 0 : cy * 16;
      const k = `${mood}|${ex.toFixed(1)}|${ey.toFixed(1)}|${blink.toFixed(2)}`;
      if (k === lastFace) return;
      lastFace = k; drawFace(fctx, mood, ex, ey, blink); faceTex.needsUpdate = true;
    }

    let size = { w: 0, h: 0 };
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h || (w === size.w && h === size.h)) return;
      size = { w, h };
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      render();
    }

    function apply(t, dt) {
      const k = 1 - Math.pow(0.86, dt * 60);
      cx += (px - cx) * k; cy += (py - cy) * k;
      const idle = reduced || frozen ? 0 : 1;
      const bob = Math.sin(t * 1.7) * 0.06 * idle;
      jumpV += (-jump * 140 - jumpV * 12) * dt; jump += jumpV * dt;
      spinV += (-spin * 60 - spinV * 9) * dt; spin += spinV * dt;
      // rotasi pengguna (inersia) + kembali menghadap depan setelah diam
      if (!dragging) {
        yaw += yawV * dt; pitch += pitchV * dt;
        yawV *= Math.pow(0.04, dt); pitchV *= Math.pow(0.04, dt);
        if (!frozen && t - idleSince > 3.5 && o.controls) {
          const home = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
          yaw += (home - yaw) * Math.min(1, dt * 2); pitch += (0 - pitch) * Math.min(1, dt * 2);
        }
      }
      pivot.rotation.set(pitch, yaw, 0);
      R.root.position.y = bob + Math.max(-0.05, jump);
      R.root.rotation.y = (frozen ? 0 : cx * 0.16) + spin;
      R.root.rotation.z = frozen ? 0 : Math.sin(t * 0.9) * 0.015 * idle;
      shadow.scale.setScalar(1 - (bob + Math.max(0, jump)) * 0.9);
      shadow.material.opacity = 1 - Math.max(0, jump) * 0.8;
      const shake = shakeT > 0 ? Math.sin(shakeT * 38) * 0.22 * (shakeT / 0.6) : 0;
      if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
      R.head.rotation.y = (frozen ? 0 : cx * 0.4) + shake;
      R.head.rotation.x = frozen ? 0 : cy * 0.2 + Math.sin(t * 1.3) * 0.02 * idle;
      R.head.rotation.z = frozen ? 0 : -cx * 0.05 + Math.sin(t * 0.8) * 0.02 * idle;
      if (waveT > 0) waveT = Math.max(0, waveT - dt);
      ['L', 'R'].forEach((s, i) => {
        const tgt = pose[s].slice();
        if (s === 'R' && waveT > 0) { tgt[0] = 1.22 + Math.sin(t * 14) * 0.12; tgt[1] = 1.0; tgt[2] = 0.45; }
        const prev = cur[s].slice();
        for (let a = 0; a < 3; a++) cur[s][a] += (tgt[a] - cur[s][a]) * Math.min(1, k * 1.25);
        const h = s === 'L' ? R.handL : R.handR;
        const hb = Math.sin(t * 2.1 + i * 1.4) * 0.05 * idle;
        h.position.set(cur[s][0] + (frozen ? 0 : cx * 0.08), cur[s][1] + hb, cur[s][2]);
        // condong mengikuti arah gerak & ayunan halus (lebih alami)
        const vx = (cur[s][0] - prev[0]) / Math.max(dt, 1e-3), vy = (cur[s][1] - prev[1]) / Math.max(dt, 1e-3);
        const sign = s === 'L' ? 1 : -1;
        h.rotation.z = sign * (cur[s][1] > 0.6 ? 0.55 : 0.08) - vx * 0.05 + Math.sin(t * 1.6 + i) * 0.06 * idle;
        h.rotation.x = -vy * 0.04 + (cur[s][2] > 0.9 ? -0.5 : 0);
      });
      if (!reduced && !frozen) {
        nextBlink -= dt;
        if (nextBlink <= 0 && blinkT < 0) { blinkT = 0; nextBlink = 2.2 + Math.random() * 3.5; }
        if (blinkT >= 0) { blinkT += dt; blink = blinkT < 0.07 ? 1 - (blinkT / 0.07) * 0.9 : blinkT < 0.14 ? 0.1 + ((blinkT - 0.07) / 0.07) * 0.9 : 1; if (blinkT >= 0.14) { blinkT = -1; blink = 1; } }
      }
      dist += (distT - dist) * Math.min(1, dt * 10);
      placeCamera();
      paintFace();
    }
    function render() { renderer.render(scene, camera); }

    let raf = 0, visible = true, last = 0, clock = 0;
    function frame(now) {
      raf = 0;
      if (!visible || document.hidden || !size.w) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now; clock += dt;
      if (target) { const r = target.getBoundingClientRect(); aimFrom(r.left + Math.min(r.width, 160) * 0.6, r.top + r.height / 2); }
      apply(clock, dt); render();
      raf = requestAnimationFrame(frame);
    }
    function wake() {
      if (reduced || frozen) { apply(clock, 1); render(); return; }
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function aimFrom(x, y) {
      const r = stage.getBoundingClientRect();
      const hx = r.left + r.width / 2, hy = r.top + r.height * 0.3;
      const reach = Math.max(280, r.width * 1.5);
      px = Math.max(-1, Math.min(1, (x - hx) / reach));
      py = Math.max(-1, Math.min(1, (y - hy) / reach));
    }

    // ───────── Kontrol: seret putar 360°, roda/cubit zoom ─────────
    let dragging = false, dragMoved = 0, lastX = 0, lastY = 0, lastMoveT = 0;
    const pointers = new Map(); let pinch0 = 0, dist0 = dist;
    if (o.controls && !reduced) {
      const cv = renderer.domElement;
      cv.style.touchAction = 'none';
      cv.addEventListener('pointerdown', (e) => {
        pointers.set(e.pointerId, e); cv.setPointerCapture(e.pointerId);
        if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); dist0 = distT; }
        dragging = true; dragMoved = 0; lastX = e.clientX; lastY = e.clientY; lastMoveT = performance.now(); yawV = pitchV = 0;
      });
      cv.addEventListener('pointermove', (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, e);
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          if (pinch0) distT = Math.max(4.6, Math.min(11, dist0 * (pinch0 / d)));
          return;
        }
        const dx = e.clientX - lastX, dy = e.clientY - lastY, now = performance.now();
        dragMoved += Math.abs(dx) + Math.abs(dy);
        yaw += dx * 0.012; pitch = Math.max(-0.9, Math.min(0.9, pitch + dy * 0.008));
        const dtm = Math.max(1, now - lastMoveT) / 1000;
        yawV = (dx * 0.012) / dtm; pitchV = (dy * 0.008) / dtm;
        lastX = e.clientX; lastY = e.clientY; lastMoveT = now; idleSince = clock;
        wake();
      });
      const end = (e) => { pointers.delete(e.pointerId); if (!pointers.size) { dragging = false; idleSince = clock; pinch0 = 0; } };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      cv.addEventListener('wheel', (e) => { e.preventDefault(); distT = Math.max(4.6, Math.min(11, distT * (1 + Math.sign(e.deltaY) * 0.08))); idleSince = clock; wake(); }, { passive: false });
      cv.addEventListener('dblclick', () => { distT = o.distance || 7.6; yawV = pitchV = 0; idleSince = -10; });
    }

    // ───────── API ─────────
    const POSE_OF = { shy: 'shy', peek: 'peek', think: 'think', excited: 'excited', wow: 'wow' };
    function setMood(m) {
      const key = ['idle', 'happy', 'sad', 'think', 'wow', 'shy', 'peek', 'wink', 'excited'].includes(m) ? m : (m === 'wave' ? 'happy' : 'idle');
      if (key === mood) return;
      mood = key; setPose(POSE_OF[key]); lastFace = ''; wake();
    }
    function say(text, ms) {
      if (!bubble || !text) return;
      bubble.textContent = text; bubble.classList.add('is-on');
      clearTimeout(bubble._t); bubble._t = setTimeout(() => bubble.classList.remove('is-on'), ms || 2600);
      if (window.Motion && !reduced) window.Motion.animate(bubble, { scale: [0.85, 1], y: [6, 0] }, { type: 'spring', stiffness: 380, damping: 20 });
    }
    function celebrate() { if (!reduced && !frozen) { jumpV = 4.2; spinV = 9; waveT = 1.2; wake(); } }
    function shake() { if (!reduced && !frozen) { shakeT = 0.6; wake(); } }
    function lookAt(el) { target = el || null; if (!target && !pointerActive) { px = 0; py = 0; } wake(); }
    /** Sudut pandang tetap (untuk evaluasi/turntable): yaw & pitch dalam derajat. */
    function setView(yawDeg, pitchDeg) {
      frozen = true; px = py = cx = cy = 0;
      yaw = (yawDeg || 0) * Math.PI / 180; pitch = (pitchDeg || 0) * Math.PI / 180;
      cur.L = pose.L.slice(); cur.R = pose.R.slice(); blink = 1; lastFace = '';
      apply(clock, 1); render();
    }

    if (!reduced) {
      window.addEventListener('pointermove', (e) => { pointerActive = true; if (!target && !dragging) aimFrom(e.clientX, e.clientY); }, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { pointerActive = false; if (!target) { px = 0; py = 0; } });
      new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); if (visible) wake(); }).observe(host);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
    }
    new ResizeObserver(() => { resize(); wake(); }).observe(stage);

    const LINES = o.lines || ['Halo, aku Jebat!', 'Siap naik level hari ini?', 'Klik aku lagi, seru kan?', 'Seret aku buat lihat dari segala sisi!'];
    let li = 0;
    host.addEventListener('click', () => {
      if (dragMoved > 6 || frozen) return; // seret bukan klik
      const prev = mood;
      setMood(li % 2 ? 'wink' : 'excited');
      celebrate(); say(LINES[li++ % LINES.length]);
      if (window.X && X.sfx) X.sfx.pop();
      setTimeout(() => { setMood(prev === 'excited' || prev === 'wink' ? 'happy' : prev); }, 1400);
    });

    setMood(o.mood);
    resize();
    if (o.view) setView(o.view[0], o.view[1]); else wake();
    return { setMood, say, lookAt, celebrate, shake, setView, get mood() { return mood; } };
  }

  function group(list) {
    const bots = list.filter(Boolean);
    const call = (fn, ...a) => bots.forEach((b) => b[fn] && b[fn](...a));
    return { setMood: (m) => call('setMood', m), say: (t, ms) => call('say', t, ms), lookAt: (el) => call('lookAt', el), celebrate: () => call('celebrate'), shake: () => call('shake') };
  }

  window.HJRobot = { mount, group };
})();
