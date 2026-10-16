import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { BAR_D, BLOCK_D, MARK } from "../lib/mark";

/**
 * The hero scene: the Arijentek mark as a blueprint that becomes real.
 *
 * Built from the logo's own paths (lib/mark.ts), so the silhouette is exact.
 * The block stands solid; the bar starts as an orange construction drawing
 * and turns solid from its top end down as `progress` goes 0 → 1 — the idea
 * becoming the thing. Light lives in the seam, not in a lamp: the solid
 * shader brightens with distance to the seam plane, which is both cheaper
 * than real lights and truer to the logo.
 *
 * Plain three.js rather than react-three-fiber: one object, one camera, and
 * a render loop that has to stop when the hero leaves the screen.
 */

const UNIT = 0.01; // logo units → world units (the mark is ~5.6 wide)
const DEPTH = 110; // extrusion, = one stroke
const CX = (MARK.minX + MARK.maxX) / 2;
const CY = (MARK.minY + MARK.maxY) / 2;
const FLOOR_Y = -(MARK.maxY - CY) * UNIT;
// The seam in world space. x_logo + y_logo = seam  →  X − Y = (seam − CX − CY)·UNIT
const SEAM_K = (MARK.seam - CX - CY) * UNIT;
const HALF_GAP = MARK.halfGap * UNIT;

function shapeGeometry(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const shapes = SVGLoader.createShapes(data.paths[0]);
  const g = new ExtrudeGeometry(shapes, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 2.5,
    bevelSize: 2,
    bevelSegments: 2,
    curveSegments: 10,
  });
  // Centre, then turn the SVG's y-down into y-up with a real rotation (a
  // negative scale would flip the triangle winding and the normals with it).
  g.translate(-CX, -CY, -DEPTH / 2);
  g.rotateX(Math.PI);
  g.scale(UNIT, UNIT, UNIT);
  g.computeVertexNormals();
  return g;
}

const COMMON = /* glsl */ `
  uniform float uCut;     // solid where s > uCut, s = position along the bar
  uniform float uSeam;    // seam light strength
  uniform float uTime;
  uniform float uSeamK;
  uniform float uHalfGap;
  float along(vec3 p) { return (p.x + p.y) * 0.70710678; }
  float seamDist(vec3 p) { return abs(p.x - p.y - uSeamK) * 0.70710678; }
`;

const MESH_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vPos = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const MESH_FRAG = /* glsl */ `
  ${COMMON}
  uniform float uPass;    // 0 = solid pass, 1 = blueprint pass
  uniform vec3 uOrange;
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vView;

  float gridLines(vec3 p, vec3 n, float k) {
    vec3 q = p * k;
    vec3 f = abs(fract(q) - 0.5);
    vec3 w = fwidth(q) * 1.2;
    vec3 l = smoothstep(0.5 - w, vec3(0.5), f); // 1 on the line, 0 between
    vec3 an = abs(n);
    // Only the two axes lying in the face draw lines on it.
    return max(max(l.x * step(an.x, 0.6), l.y * step(an.y, 0.6)), l.z * step(an.z, 0.6));
  }

  void main() {
    float s = along(vPos);
    float solid = smoothstep(uCut - 0.015, uCut + 0.015, s);
    vec3 n = normalize(vN);
    vec3 v = normalize(vView);
    float fres = pow(1.0 - abs(dot(n, v)), 2.5);
    float d = seamDist(vPos);
    float seam = exp(-max(d - uHalfGap, 0.0) * 7.0);
    // The scan line where drawing turns into object.
    float scan = exp(-abs(s - uCut) * 34.0) * step(-3.6, uCut) * step(uCut, 3.5);

    if (uPass < 0.5) {
      if (solid < 0.5) discard;
      vec3 key = normalize(vec3(-0.45, 0.8, 0.55));
      float diff = max(dot(n, key), 0.0);
      vec3 col = vec3(0.045, 0.045, 0.052) + vec3(0.13, 0.13, 0.14) * diff;
      col += vec3(0.11, 0.11, 0.12) * fres;
      // Fine machined grain, so large faces are not dead flat.
      col += (fract(sin(dot(floor(vPos.xy * 220.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.008;
      col += uOrange * seam * uSeam * (0.55 + 0.45 * (1.0 - abs(n.z)));
      col += uOrange * scan * 1.6;
      gl_FragColor = vec4(col, 1.0);
    } else {
      if (solid > 0.5) discard;
      float g = gridLines(vPos, n, 6.0);
      float g2 = gridLines(vPos, n, 1.5);
      float a = g * 0.34 + g2 * 0.30 + fres * 0.035 + scan * 0.9;
      vec3 col = uOrange * a * (0.92 + 0.08 * sin(uTime * 1.3 + s * 2.0));
      gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
    }
  }
`;

const LINE_VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  ${COMMON}
  uniform vec3 uOrange;
  varying vec3 vPos;
  void main() {
    float s = along(vPos);
    float solid = smoothstep(uCut - 0.015, uCut + 0.015, s);
    // Blueprint: bright orange edges. Solid: a faint machined highlight.
    vec3 col = mix(uOrange * 1.1, vec3(0.32, 0.31, 0.3), solid);
    float a = mix(0.95, 0.22, solid);
    float seam = exp(-max(seamDist(vPos) - uHalfGap, 0.0) * 7.0);
    col = mix(col, uOrange * 1.4, seam * uSeam * 0.6 * solid);
    col *= a;
    gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
`;

const FLOOR_FRAG = /* glsl */ `
  uniform vec3 uOrange;
  uniform float uSeam;
  uniform float uSeamX;
  uniform float uFade;
  varying vec3 vPos;
  void main() {
    vec2 p = vPos.xz;
    vec2 q = p * 1.6;
    vec2 f = abs(fract(q) - 0.5);
    vec2 w = fwidth(q) * 1.1;
    vec2 l = smoothstep(0.5 - w, vec2(0.5), f);
    float line = max(l.x, l.y);
    float dots = (1.0 - smoothstep(0.0, w.x * 2.2, length(f - 0.5)));
    // How far the floor reaches before it fades out (lower = further).
    float fall = exp(-length(p * vec2(0.1, 0.15)) * 1.6);
    float a = (line * 0.3 + dots * 0.9) * fall * uFade;
    // A pool of seam light where the mark meets the floor.
    float pool = exp(-length((p - vec2(uSeamX, 0.0)) * vec2(0.55, 1.4)) * 1.8) * uSeam;
    vec3 col = uOrange * a + uOrange * pool * 0.22;
    gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
`;

const ss = (x: number) => x * x * (3 - 2 * x);

export type BlueprintScene = {
  setProgress: (p: number) => void;
  setPhase2: (q: number) => void;
  setPointer: (x: number, y: number) => void;
  setLayout: (layout: "wide" | "narrow") => void;
  resize: () => void;
  start: () => void;
  stop: () => void;
  renderOnce: () => void;
  dispose: () => void;
};

/** The hero pose on wide screens: share of the half-width, height, size;
 *  and the view: `yaw`, how far the mark is turned from facing you (radians,
 *  at the start of act 1; it turns 0.3 further as it becomes solid), and
 *  `camY`, the camera's height. Near eye level and only a little turned, the
 *  A stands upright and reads as the logo, with just enough turn to show
 *  its depth. The Statement keeps the higher, more turned view. */
const HERO = { x: 0.4, y: -0.22, scale: 1.08, yaw: -0.3, camY: 1.0 };
/** Narrow screens: the mark's height in the hero, low enough to sit in the
 *  open space under the hero's buttons rather than behind them. */
const NARROW_HERO_Y = -1.4;
/** The Statement's view (the one the whole opening used to have). */
const STATEMENT_VIEW = { yaw: -0.42, camY: 2.1 };
/** The Statement pose on wide screens: level with the middle of the copy
 *  block (headline to the four points), not its top, and just far enough
 *  right that its foot clears the end of the points' rules. */
const STATEMENT = { x: 0.54, y: -0.38, scale: 1.12 };

export function createBlueprintScene(
  canvas: HTMLCanvasElement,
  /** finale: the Close's pose — whole, solid, seam lit, rising with progress. */
  opts: { lite?: boolean; finale?: boolean; onFirstFrame?: () => void } = {},
): BlueprintScene {
  const renderer = new WebGLRenderer({ canvas, antialias: !opts.lite, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lite ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  const orange = new Color("#ea580c");

  const uniforms = {
    uCut: { value: 3.6 }, // past the top of the mark: all drawing, no metal yet
    uSeam: { value: 0.7 },
    uTime: { value: 0 },
    uSeamK: { value: SEAM_K },
    uHalfGap: { value: HALF_GAP },
    uOrange: { value: new Vector3(orange.r, orange.g, orange.b) },
  };
  const mark = new Group();
  scene.add(mark);
  // Each piece in its own group (the seam glow is computed per piece).
  const barPiece = new Group();
  const blockPiece = new Group();
  mark.add(barPiece, blockPiece);

  const barGeo = shapeGeometry(BAR_D);
  const blockGeo = shapeGeometry(BLOCK_D);

  const solid = (u: typeof uniforms) =>
    new ShaderMaterial({ vertexShader: MESH_VERT, fragmentShader: MESH_FRAG, uniforms: { ...u, uPass: { value: 0 } } });
  const blueprint = (u: typeof uniforms) =>
    new ShaderMaterial({
      vertexShader: MESH_VERT,
      fragmentShader: MESH_FRAG,
      uniforms: { ...u, uPass: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    premultipliedAlpha: true,
      side: DoubleSide,
    });
  const lines = (u: typeof uniforms) =>
    new ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      premultipliedAlpha: true,
    });

  // Both pieces start as drawing and share one cut, so the scan sweeps the
  // whole mark from its top corner down.
  const piece = (geo: ExtrudeGeometry, group: Group) => {
    const print = new Mesh(geo, blueprint(uniforms));
    const edges = new LineSegments(new EdgesGeometry(geo, 25), lines(uniforms));
    print.renderOrder = 2;
    edges.renderOrder = 3;
    group.add(new Mesh(geo, solid(uniforms)), print, edges);
  };
  piece(barGeo, barPiece);
  piece(blockGeo, blockPiece);

  // Construction lines: the bar's two long edges run on past it, with a
  // plumb line and a level from its top corner, as on a drafting sheet.
  const cons = new Group();
  const segs: number[] = [];
  const dash = (a: [number, number], b: [number, number], step = 0.09) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    for (let t = 0; t < len; t += step * 2) {
      const t2 = Math.min(len, t + step);
      segs.push(a[0] + (dx * t) / len, a[1] + (dy * t) / len, 0.56, a[0] + (dx * t2) / len, a[1] + (dy * t2) / len, 0.56);
    }
  };
  const W = (x: number, y: number): [number, number] => [(x - CX) * UNIT, -(y - CY) * UNIT];
  // Outer edge of the bar, x + y = 1016.4; inner edge, x + y = 1171.8.
  dash(W(150, 866.4), W(900, 116.4));
  dash(W(300, 871.8), W(1000, 171.8));
  dash(W(831.8, 340), W(831.8, 739.4));
  dash(W(560, 340), W(1000, 340));
  const consGeo = new BufferGeometry();
  consGeo.setAttribute("position", new Float32BufferAttribute(segs, 3));
  const consMat = new ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: /* glsl */ `uniform vec3 uOrange; uniform float uFade; void main(){ vec3 c = uOrange * 0.55 * uFade; gl_FragColor = vec4(c, c.r); }`,
    uniforms: { uOrange: uniforms.uOrange, uFade: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    premultipliedAlpha: true,
  });
  cons.add(new LineSegments(consGeo, consMat));
  // Small square nodes where construction lines cross the grid.
  const nodes: number[] = [];
  [W(831.8, 340), W(560, 340), W(1000, 340), W(831.8, 739.4), W(450, 566.4), W(370, 646.4)].forEach(([x, y]) => nodes.push(x, y, 0.56));
  const nodeGeo = new BufferGeometry();
  nodeGeo.setAttribute("position", new Float32BufferAttribute(nodes, 3));
  const nodeMat = new ShaderMaterial({
    vertexShader: /* glsl */ `uniform float uSize; void main(){ gl_PointSize = uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `uniform vec3 uOrange; uniform float uFade; void main(){ vec3 c = uOrange * uFade; gl_FragColor = vec4(c, c.r); }`,
    uniforms: { uOrange: uniforms.uOrange, uFade: consMat.uniforms.uFade, uSize: { value: 5 * renderer.getPixelRatio() } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    premultipliedAlpha: true,
  });
  cons.add(new Points(nodeGeo, nodeMat));
  mark.add(cons);

  const floorMat = new ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: FLOOR_FRAG,
    uniforms: {
      uOrange: uniforms.uOrange,
      uSeam: uniforms.uSeam,
      uSeamX: { value: SEAM_K + FLOOR_Y },
      uFade: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    premultipliedAlpha: true,
  });
  const floor = new Mesh(new PlaneGeometry(60, 60, 1, 1), floorMat);
  floor.geometry.rotateX(-Math.PI / 2);
  floor.position.y = FLOOR_Y - 0.002;
  floor.renderOrder = 1;
  mark.add(floor);

  // ------------------------------------------------------------------ state
  let progress = 0;
  let phase2 = 0; // 0 → 1 across the Statement that follows the hero
  let layout: "wide" | "narrow" = "wide";
  const pointer = new Vector2();
  const eased = new Vector2();
  let raf = 0;
  let running = false;
  let first = true;
  const t0 = performance.now();

  const frame = () => {
    const t = (performance.now() - t0) / 1000;
    uniforms.uTime.value = t;
    eased.lerp(pointer, 0.06);

    if (opts.finale) {
      // The Close: the finished mark rises into view as the section arrives,
      // its seam brightening as the call to action lands.
      const f = ss(Math.min(1, Math.max(0, progress)));
      uniforms.uCut.value = -4;
      uniforms.uSeam.value = 0.8 + f * 1.4;
      consMat.uniforms.uFade.value = 0;
      floorMat.uniforms.uFade.value = 0.25 * f;
      const wideF = layout === "wide";
      mark.position.set(wideF ? 2.2 : 0, -2.6 + f * 2.6 + Math.sin(t * 0.6) * 0.025, 0);
      mark.rotation.set(0.02 + eased.y * 0.05, -0.75 + f * 0.6 + eased.x * 0.12, 0);
      const dF = wideF ? 15.5 : Math.min(34, 14 / Math.max(camera.aspect, 0.35));
      camera.position.set(0, 1.6 + eased.y * 0.2, dF);
      camera.lookAt(wideF ? 1.2 : 0, -0.1, 0);
      renderer.render(scene, camera);
      if (first) {
        first = false;
        opts.onFirstFrame?.();
      }
      return;
    }

    // Act 1, the hero: 0 → 1. The first stretch holds the drawing still so it
    // can be read; the whole mark then turns solid from its top corner down.
    const p = Math.min(1, Math.max(0, (progress - 0.08) / 0.8));
    const e = ss(p);
    uniforms.uCut.value = 3.6 - e * 7.4;
    uniforms.uSeam.value = 0.55 + e * 0.9;
    consMat.uniforms.uFade.value = 1 - e * 0.85;

    // Act 2, the Statement: the mark stays whole. It steps aside to the
    // right of the copy, turns, and scrolls away with the section. (The seam
    // used to open and close here; that was dropped as too busy.)
    const q = phase2;
    // Moves early, so it is clear of the text column before the first line.
    const move = ss(Math.min(1, q / 0.18));
    // The grid floor stays under the mark in the Statement too, about as
    // strong as in the hero, so the solid A still stands on something rather
    // than floating (it has to read on the white theme as well).
    floorMat.uniforms.uFade.value = (1 - e * 0.35) * (1 + move * 0.45);

    const wide = layout === "wide";
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    // Narrow screens pull back with the aspect so the whole mark fits across.
    const dist = (wide ? 15 : Math.min(34, 13.5 / Math.max(camera.aspect, 0.35))) - e * 1.4 + move * 3.5;
    // Wide: the mark keeps to the right-hand column, clear of the copy. Its
    // place is a share of the visible half-width at its depth, so it sits in
    // the same part of the screen whatever the window's proportions.
    const halfW = Math.tan(((camera.fov / 2) * Math.PI) / 180) * dist * camera.aspect;
    // In the hero it sits a little in from the right edge and low, clear of
    // the copy and the nav; in the Statement it steps out to the right.
    mark.position.set(
      wide ? 0.6 + halfW * lerp(HERO.x, STATEMENT.x, move) : 0.15,
      (wide ? lerp(HERO.y, STATEMENT.y, move) : lerp(NARROW_HERO_Y, 1.9, move)) + Math.sin(t * 0.6) * 0.025,
      0,
    );
    mark.scale.setScalar(wide ? lerp(HERO.scale, STATEMENT.scale, move) : 1);
    // Wide: the hero's own view, blending into the Statement's as the mark
    // steps aside. Narrow screens keep the Statement's view throughout.
    const view = (a: number, b: number) => (wide ? lerp(a, b, move) : b);
    mark.rotation.y =
      view(HERO.yaw, STATEMENT_VIEW.yaw) + e * 0.3 + move * 0.45 - ss(Math.max(0, (q - 0.55) / 0.45)) * 0.25 + eased.x * 0.12;
    mark.rotation.x = 0.02 + eased.y * 0.05;
    camera.position.set(0, view(HERO.camY, STATEMENT_VIEW.camY) + eased.y * 0.2, dist);
    camera.lookAt(wide ? 0.6 : 0, -0.25, 0);

    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onFirstFrame?.();
    }
  };

  const loop = () => {
    frame();
    raf = requestAnimationFrame(loop);
  };

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!running) frame();
  };
  resize();

  return {
    setProgress: (p) => {
      progress = p;
      if (!running) frame();
    },
    setPhase2: (q) => {
      phase2 = q;
      if (!running) frame();
    },
    setPointer: (x, y) => pointer.set(x, y),
    setLayout: (l) => {
      layout = l;
      if (!running) frame();
    },
    resize,
    start: () => {
      if (running) return;
      running = true;
      loop();
    },
    stop: () => {
      running = false;
      cancelAnimationFrame(raf);
    },
    renderOnce: frame,
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        const mat = m.material as ShaderMaterial | ShaderMaterial[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
    },
  };
}

/** Whether this browser can run the scene at all. */
export function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}
