import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CardFinish, CardLayoutStyle } from '@/types/nexid';

export function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export function createStudioRenderer(container: HTMLElement, isSoftwareGl: boolean): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth || 600, container.clientHeight || 420);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

export function applyStudioEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer): () => void {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  pmremGenerator.dispose();

  // Balanced 3-point warm/cool studio rig
  const hemi = new THREE.HemisphereLight(0xdbe7ff, 0x17191d, 0.75);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff0d6, 2.1);
  keyLight.position.set(4.2, 5.5, 5.2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  const d = 4.5;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xd5b47a, 1.35);
  rimLight.position.set(-4.5, 2.5, -4.0);
  scene.add(rimLight);

  return () => {
    envTarget.dispose();
  };
}

export function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

const FINISH_PALETTE: Record<
  CardFinish,
  { bg: string; bgAlt: string; ink: string; muted: string; accent: string; metalness: number; roughness: number; clearcoat: number }
> = {
  obsidian: {
    bg: '#14161A',
    bgAlt: '#1E2127',
    ink: '#F4F1EB',
    muted: '#9CA2AD',
    accent: '#D5B47A',
    metalness: 0.48,
    roughness: 0.38,
    clearcoat: 0.35,
  },
  graphite: {
    bg: '#262A32',
    bgAlt: '#323741',
    ink: '#F4F1EB',
    muted: '#B4BAC4',
    accent: '#E8D2A7',
    metalness: 0.72,
    roughness: 0.28,
    clearcoat: 0.4,
  },
  gold: {
    bg: '#B89456',
    bgAlt: '#D5B47A',
    ink: '#101114',
    muted: '#3B3222',
    accent: '#101114',
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.6,
  },
  ivory: {
    bg: '#EFECE5',
    bgAlt: '#FAF8F4',
    ink: '#101114',
    muted: '#5D626D',
    accent: '#B6914F',
    metalness: 0.12,
    roughness: 0.32,
    clearcoat: 0.75,
  },
};

export interface CardTextureConfig {
  displayName: string;
  roleLabel: string;
  publicCode: string;
  finish: CardFinish;
  layoutStyle: CardLayoutStyle;
}

export function drawCardFrontCanvas(canvas: HTMLCanvasElement, cfg: CardTextureConfig): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pal = FINISH_PALETTE[cfg.finish];
  const w = canvas.width;
  const h = canvas.height;

  // Base gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, pal.bg);
  grad.addColorStop(1, pal.bgAlt);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle brushed texture lines
  ctx.strokeStyle = cfg.finish === 'ivory' ? 'rgba(16,17,20,0.03)' : 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Subtle architectural border inset
  ctx.strokeStyle = cfg.finish === 'gold' ? 'rgba(16,17,20,0.22)' : 'rgba(213,180,122,0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  // Draw geometric N monogram
  const drawNMark = (cx: number, cy: number, size: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.11;

    ctx.strokeStyle = pal.ink;
    ctx.beginPath();
    ctx.moveTo(-size * 0.38, size * 0.38);
    ctx.lineTo(-size * 0.38, -size * 0.38);
    ctx.lineTo(0, size * 0.08);
    ctx.lineTo(0, -size * 0.38);
    ctx.stroke();

    ctx.strokeStyle = pal.accent;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.08);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.38, -size * 0.38);
    ctx.stroke();
    ctx.restore();
  };

  if (cfg.layoutStyle === 'monogram') {
    drawNMark(w - 110, 104, 72);
    ctx.fillStyle = pal.accent;
    ctx.font = '600 22px Manrope, sans-serif';
    ctx.fillText('NEXID ONE', 64, 96);
  } else if (cfg.layoutStyle === 'executive') {
    drawNMark(94, 98, 56);
    ctx.fillStyle = pal.ink;
    ctx.font = '700 24px Manrope, sans-serif';
    ctx.fillText('NEXID ONE', 142, 106);
  } else {
    drawNMark(w / 2, h / 2 - 42, 86);
  }

  // Name & role typography
  if (cfg.layoutStyle === 'minimal') {
    ctx.textAlign = 'center';
    ctx.fillStyle = pal.ink;
    ctx.font = '700 34px Manrope, sans-serif';
    ctx.fillText((cfg.displayName || 'ALEX RIVERA').toUpperCase(), w / 2, h - 130);
    ctx.fillStyle = pal.muted;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(cfg.roleLabel || 'Digital Identity', w / 2, h - 92);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = pal.ink;
    ctx.font = '700 36px Manrope, sans-serif';
    ctx.fillText((cfg.displayName || 'ALEX RIVERA').toUpperCase(), 64, h - 122);
    ctx.fillStyle = pal.muted;
    ctx.font = '500 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(cfg.roleLabel || 'Product Designer & Web Dev', 64, h - 84);
  }

  // Subtle NFC contact arc mark bottom right
  ctx.save();
  ctx.translate(w - 76, h - 84);
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2.5;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, i * 10, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCardBackCanvas(canvas: HTMLCanvasElement, cfg: CardTextureConfig): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pal = FINISH_PALETTE[cfg.finish];
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  // Magnetic/signature minimalist stripe
  ctx.fillStyle = pal.bgAlt;
  ctx.fillRect(0, 66, w, 74);

  // Center emblem
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(w / 2 - 62, h / 2 - 42, 124, 84);

  ctx.fillStyle = pal.ink;
  ctx.textAlign = 'center';
  ctx.font = '700 22px Manrope, sans-serif';
  ctx.fillText('NEXID ONE', w / 2, h / 2 + 6);

  ctx.fillStyle = pal.muted;
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText(cfg.publicCode || 'NX-ALEX-01', w / 2, h - 76);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('One identity. Infinite connections.', w / 2, h - 46);
  ctx.textAlign = 'left';
}

export interface NexidCardRig {
  group: THREE.Group;
  updateTextures: (cfg: CardTextureConfig) => void;
  setRimHighlight: (intensity: number) => void;
  dispose: () => void;
}

export function createNexidCardRig(
  initialCfg: CardTextureConfig,
  maxAnisotropy: number,
): NexidCardRig {
  const group = new THREE.Group();
  const cardW = 1.71; // ISO/IEC 7810 ID-1 ratio (85.6mm x 53.98mm -> 1.586:1)
  const cardH = 1.08;
  const cardD = 0.022;

  // Part 1: Beveled card chassis
  const coreShape = createRoundedRectShape(cardW, cardH, 0.08);
  const coreGeo = new THREE.ExtrudeGeometry(coreShape, {
    depth: cardD,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
    curveSegments: 16,
  });
  coreGeo.center();

  const pal = FINISH_PALETTE[initialCfg.finish];
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(pal.bg),
    metalness: pal.metalness,
    roughness: pal.roughness,
    clearcoat: pal.clearcoat,
    clearcoatRoughness: 0.25,
    anisotropy: 0.6,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  group.add(coreMesh);

  // Part 2: Metallic gold edge accent frame
  const rimShape = createRoundedRectShape(cardW + 0.014, cardH + 0.014, 0.085);
  const rimHole = createRoundedRectShape(cardW - 0.006, cardH - 0.006, 0.078);
  rimShape.holes.push(rimHole);
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
    depth: cardD * 0.55,
    bevelEnabled: false,
    curveSegments: 16,
  });
  rimGeo.center();
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd5b47a,
    metalness: 0.9,
    roughness: 0.24,
    emissive: new THREE.Color(0xd5b47a),
    emissiveIntensity: 0.05,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  group.add(rimMesh);

  // Part 3: Front face canvas texture plane
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 1024;
  frontCanvas.height = 648;
  drawCardFrontCanvas(frontCanvas, initialCfg);
  const frontTex = new THREE.CanvasTexture(frontCanvas);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.anisotropy = maxAnisotropy;

  const faceGeo = new THREE.ShapeGeometry(createRoundedRectShape(cardW - 0.02, cardH - 0.02, 0.072), 12);
  // Normalize UVs for ShapeGeometry
  const posAttr = faceGeo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    uvs[i * 2] = (px + (cardW - 0.02) / 2) / (cardW - 0.02);
    uvs[i * 2 + 1] = (py + (cardH - 0.02) / 2) / (cardH - 0.02);
  }
  faceGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const frontMat = new THREE.MeshPhysicalMaterial({
    map: frontTex,
    roughness: pal.roughness,
    metalness: pal.metalness * 0.45,
    clearcoat: pal.clearcoat,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const frontMesh = new THREE.Mesh(faceGeo, frontMat);
  frontMesh.position.z = cardD / 2 + 0.009;
  group.add(frontMesh);

  // Part 4: Back face canvas texture plane
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 1024;
  backCanvas.height = 648;
  drawCardBackCanvas(backCanvas, initialCfg);
  const backTex = new THREE.CanvasTexture(backCanvas);
  backTex.colorSpace = THREE.SRGBColorSpace;
  backTex.anisotropy = maxAnisotropy;

  const backMat = new THREE.MeshPhysicalMaterial({
    map: backTex,
    roughness: pal.roughness,
    metalness: pal.metalness * 0.45,
    clearcoat: pal.clearcoat,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const backMesh = new THREE.Mesh(faceGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -(cardD / 2 + 0.009);
  group.add(backMesh);

  // Part 5: Subtle metallic NFC contact emblem inlay on top-left corner
  const chipGeo = new THREE.PlaneGeometry(0.22, 0.16);
  const chipMat = new THREE.MeshStandardMaterial({
    color: 0xd5b47a,
    metalness: 0.92,
    roughness: 0.22,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const chipMesh = new THREE.Mesh(chipGeo, chipMat);
  chipMesh.position.set(-0.56, 0.04, cardD / 2 + 0.011);
  group.add(chipMesh);

  const updateTextures = (cfg: CardTextureConfig) => {
    const nextPal = FINISH_PALETTE[cfg.finish];
    coreMat.color.set(nextPal.bg);
    coreMat.metalness = nextPal.metalness;
    coreMat.roughness = nextPal.roughness;
    coreMat.clearcoat = nextPal.clearcoat;

    frontMat.roughness = nextPal.roughness;
    frontMat.metalness = nextPal.metalness * 0.45;
    backMat.roughness = nextPal.roughness;
    backMat.metalness = nextPal.metalness * 0.45;

    drawCardFrontCanvas(frontCanvas, cfg);
    drawCardBackCanvas(backCanvas, cfg);
    frontTex.needsUpdate = true;
    backTex.needsUpdate = true;
  };

  const setRimHighlight = (intensity: number) => {
    rimMat.emissiveIntensity = intensity;
  };

  const dispose = () => {
    coreGeo.dispose();
    rimGeo.dispose();
    faceGeo.dispose();
    chipGeo.dispose();
    coreMat.dispose();
    rimMat.dispose();
    frontMat.dispose();
    backMat.dispose();
    chipMat.dispose();
    frontTex.dispose();
    backTex.dispose();
  };

  return { group, updateTextures, setRimHighlight, dispose };
}

export interface PhoneScreenState {
  connected: boolean;
  proximity: number; // 0..1
  name?: string;
  role?: string;
}

export function drawPhoneScreenCanvas(canvas: HTMLCanvasElement, state: PhoneScreenState): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // Base OLED obsidian backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, state.connected ? '#181A20' : '#101114');
  grad.addColorStop(1, '#0D0E11');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle golden top glow when proximity > 0 or connected
  const glowAlpha = state.connected ? 0.34 : state.proximity * 0.28;
  if (glowAlpha > 0.01) {
    const rad = ctx.createRadialGradient(w / 2, 130, 10, w / 2, 130, 260);
    rad.addColorStop(0, `rgba(213, 180, 122, ${glowAlpha})`);
    rad.addColorStop(1, 'rgba(213, 180, 122, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);
  }

  // Dynamic Island / Top speaker pill
  ctx.fillStyle = '#070709';
  ctx.beginPath();
  ctx.roundRect(w / 2 - 64, 24, 128, 28, 14);
  ctx.fill();

  if (!state.connected) {
    // Standby NFC reader state
    ctx.strokeStyle = state.proximity > 0.2 ? '#D5B47A' : '#34373D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.36, 54, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(213, 180, 122, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.36, 78 + state.proximity * 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#F4F1EB';
    ctx.textAlign = 'center';
    ctx.font = '700 28px Manrope, sans-serif';
    ctx.fillText('NEXID ONE', w / 2, h * 0.56);

    ctx.fillStyle = '#A6ABB4';
    ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      state.proximity > 0.35 ? 'Detectando señal NFC...' : 'Listo para recibir identidad',
      w / 2,
      h * 0.62,
    );
    ctx.textAlign = 'left';
    return;
  }

  // Connected state: NFC banner + Alex Rivera Profile preview
  ctx.fillStyle = '#202329';
  ctx.strokeStyle = '#D5B47A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(36, 82, w - 72, 92, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D5B47A';
  ctx.font = '700 17px Manrope, sans-serif';
  ctx.fillText('IDENTIDAD DETECTADA', 62, 118);
  ctx.fillStyle = '#F4F1EB';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Perfil verificado vía NFC', 62, 148);

  // Profile Card inside screen
  ctx.fillStyle = '#17191D';
  ctx.strokeStyle = '#34373D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(36, 206, w - 72, 470, 24);
  ctx.fill();
  ctx.stroke();

  // Cover strip
  const cov = ctx.createLinearGradient(36, 206, w - 36, 326);
  cov.addColorStop(0, '#262930');
  cov.addColorStop(1, '#1A1C22');
  ctx.fillStyle = cov;
  ctx.beginPath();
  ctx.roundRect(36, 206, w - 72, 128, [24, 24, 0, 0]);
  ctx.fill();

  // Avatar circle
  ctx.fillStyle = '#D5B47A';
  ctx.beginPath();
  ctx.arc(w / 2, 334, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#101114';
  ctx.textAlign = 'center';
  ctx.font = '800 32px Manrope, sans-serif';
  ctx.fillText('AR', w / 2, 345);

  ctx.fillStyle = '#F4F1EB';
  ctx.font = '700 32px Manrope, sans-serif';
  ctx.fillText(state.name || 'Alex Rivera', w / 2, 424);

  ctx.fillStyle = '#D5B47A';
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(state.role || 'Diseñador digital y desarrollador web', w / 2, 458);

  // Preview link pills inside phone UI
  const items = ['Portafolio · 3 proyectos', 'Guardar contacto (vCard)', 'LinkedIn · GitHub · Behance'];
  items.forEach((label, idx) => {
    const y = 502 + idx * 54;
    ctx.fillStyle = idx === 1 ? '#D5B47A' : '#202329';
    ctx.beginPath();
    ctx.roundRect(64, y, w - 128, 42, 12);
    ctx.fill();
    ctx.fillStyle = idx === 1 ? '#101114' : '#F4F1EB';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label, w / 2, y + 27);
  });

  ctx.textAlign = 'left';
}

export interface NexidPhoneRig {
  group: THREE.Group;
  updateScreen: (state: PhoneScreenState) => void;
  dispose: () => void;
}

export function createNexidPhoneRig(initialState: PhoneScreenState, maxAnisotropy: number): NexidPhoneRig {
  const group = new THREE.Group();
  const phoneW = 1.18;
  const phoneH = 2.38;
  const phoneD = 0.12;

  // Part 1: Anodized titanium chassis
  const bodyGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(phoneW, phoneH, 0.16), {
    depth: phoneD,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 4,
    curveSegments: 16,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x22252b,
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.3,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Part 2: Front black glass bezel
  const bezelGeo = new THREE.ShapeGeometry(createRoundedRectShape(phoneW - 0.04, phoneH - 0.04, 0.14), 16);
  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0c0e,
    metalness: 0.1,
    roughness: 0.08,
    clearcoat: 1.0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.z = phoneD / 2 + 0.021;
  group.add(bezelMesh);

  // Part 3: OLED Screen texture
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 1024;
  drawPhoneScreenCanvas(screenCanvas, initialState);
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = maxAnisotropy;

  const screenGeo = new THREE.ShapeGeometry(createRoundedRectShape(phoneW - 0.11, phoneH - 0.12, 0.11), 14);
  const posAttr = screenGeo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  const sw = phoneW - 0.11;
  const sh = phoneH - 0.12;
  for (let i = 0; i < posAttr.count; i++) {
    uvs[i * 2] = (posAttr.getX(i) + sw / 2) / sw;
    uvs[i * 2 + 1] = (posAttr.getY(i) + sh / 2) / sh;
  }
  screenGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    roughness: 0.18,
    metalness: 0.05,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: screenTex,
    emissiveIntensity: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = phoneD / 2 + 0.024;
  group.add(screenMesh);

  // Part 4: Side hardware buttons
  const btnGeo = new THREE.BoxGeometry(0.025, 0.24, 0.04);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x3b3f48, metalness: 0.9, roughness: 0.2 });
  const powerBtn = new THREE.Mesh(btnGeo, btnMat);
  powerBtn.position.set(phoneW / 2 + 0.02, 0.28, 0);
  group.add(powerBtn);

  // Part 5: Gold NFC reader target ring (positioned near top back/front zone)
  const ringGeo = new THREE.RingGeometry(0.24, 0.265, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd5b47a,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.set(0, 0.48, phoneD / 2 + 0.028);
  group.add(ringMesh);

  const updateScreen = (state: PhoneScreenState) => {
    drawPhoneScreenCanvas(screenCanvas, state);
    screenTex.needsUpdate = true;
    ringMat.opacity = state.connected ? 0.75 : 0.15 + state.proximity * 0.6;
    screenMat.emissiveIntensity = state.connected ? 0.85 : 0.6 + state.proximity * 0.2;
  };

  const dispose = () => {
    bodyGeo.dispose();
    bezelGeo.dispose();
    screenGeo.dispose();
    btnGeo.dispose();
    ringGeo.dispose();
    bodyMat.dispose();
    bezelMat.dispose();
    screenMat.dispose();
    btnMat.dispose();
    ringMat.dispose();
    screenTex.dispose();
  };

  return { group, updateScreen, dispose };
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material?.dispose();
      }
    }
  });
}
