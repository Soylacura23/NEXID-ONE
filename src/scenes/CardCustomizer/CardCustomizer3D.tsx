import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RefreshCw } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { CardFinish, CardLayoutStyle } from '@/types/nexid';
import {
  applyStudioEnvironment,
  createNexidCardRig,
  createStudioRenderer,
  detectSoftwareGl,
  isWebGLAvailable,
  NexidCardRig,
} from '@/scenes/shared/nexid3dBuilders';

interface CardCustomizer3DProps {
  displayName: string;
  roleLabel: string;
  publicCode: string;
  finish: CardFinish;
  layoutStyle: CardLayoutStyle;
}

export function CardCustomizer3D({
  displayName,
  roleLabel,
  publicCode,
  finish,
  layoutStyle,
}: CardCustomizer3DProps) {
  const { t } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<NexidCardRig | null>(null);
  const flipTargetRef = useRef(0);
  const [flipped, setFlipped] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !isWebGLAvailable()) {
      setFallback(true);
      return;
    }

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createStudioRenderer(container, isSoftwareGl);
    } catch {
      setFallback(true);
      return;
    }

    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      (container.clientWidth || 500) / (container.clientHeight || 340),
      0.1,
      40,
    );
    camera.position.set(0, 0.25, 3.1);

    const disposeEnv = applyStudioEnvironment(scene, renderer);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const rig = createNexidCardRig(
      { displayName, roleLabel, publicCode, finish, layoutStyle },
      maxAniso,
    );
    rigRef.current = rig;
    scene.add(rig.group);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 4.6;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.72;

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 8);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 8);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      rig.group.rotation.y = THREE.MathUtils.damp(rig.group.rotation.y, flipTargetRef.current, 7, delta);
      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      rig.dispose();
      rigRef.current = null;
      disposeEnv();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // Initialize WebGL once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reactive live texture update without recreating WebGL context
  useEffect(() => {
    rigRef.current?.updateTextures({
      displayName,
      roleLabel,
      publicCode,
      finish,
      layoutStyle,
    });
  }, [displayName, roleLabel, publicCode, finish, layoutStyle]);

  const toggleFlip = () => {
    setFlipped((prev) => {
      const next = !prev;
      flipTargetRef.current = next ? Math.PI : 0;
      return next;
    });
  };

  if (fallback) {
    return (
      <div className="h-[320px] rounded-2xl border border-[var(--border-subtle)] bg-[#101114] flex flex-col items-center justify-center p-6">
        <div className="w-72 h-44 rounded-2xl border border-[#D5B47A]/40 bg-[#17191D] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold text-[#D5B47A]">NEXID ONE</span>
            <span className="font-mono-tabular text-[11px] text-[#A6ABB4]">{publicCode}</span>
          </div>
          <div>
            <p className="font-display text-base font-bold text-[#F4F1EB] uppercase">{displayName || 'NEXID ONE'}</p>
            <p className="text-xs text-[#A6ABB4]">{roleLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[#101114] overflow-hidden">
      <div ref={mountRef} className="h-[320px] sm:h-[360px] w-full cursor-grab active:cursor-grabbing" />
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#34373D] bg-[#17191D]">
        <span className="text-xs text-[#A6ABB4]">
          {t('Arrastra para rotar · Vista previa digital 3D', 'Drag to orbit · 3D digital preview')}
        </span>
        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#34373D] px-3 py-1.5 text-xs font-medium text-[#F4F1EB] hover:bg-[#202329] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#D5B47A]" />
          {flipped ? t('Ver frente', 'View front') : t('Ver reverso', 'View back')}
        </button>
      </div>
    </div>
  );
}
