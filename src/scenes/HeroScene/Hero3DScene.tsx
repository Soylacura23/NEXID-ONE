import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  applyStudioEnvironment,
  createNexidCardRig,
  createNexidPhoneRig,
  createStudioRenderer,
  detectSoftwareGl,
  isWebGLAvailable,
} from '@/scenes/shared/nexid3dBuilders';
import { NexidLogo } from '@/components/ui/NexidLogo';

export function Hero3DScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !isWebGLAvailable()) {
      setFallback(true);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      36,
      (container.clientWidth || 600) / (container.clientHeight || 480),
      0.1,
      50,
    );
    camera.position.set(0, 0.15, 5.2);

    const disposeEnv = applyStudioEnvironment(scene, renderer);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const phone = createNexidPhoneRig(
      { connected: true, proximity: 1, name: 'Alex Rivera', role: 'Diseñador digital y web' },
      maxAniso,
    );
    phone.group.position.set(0.75, -0.05, -0.25);
    phone.group.rotation.set(-0.08, -0.28, -0.04);
    scene.add(phone.group);

    const card = createNexidCardRig(
      {
        displayName: 'ALEX RIVERA',
        roleLabel: 'Product Designer & Web Dev',
        publicCode: 'NX-ALEX-01',
        finish: 'obsidian',
        layoutStyle: 'monogram',
      },
      maxAniso,
    );
    card.group.position.set(-0.68, -0.18, 0.55);
    card.group.rotation.set(-0.18, 0.34, 0.12);
    scene.add(card.group);

    // Subtle ground contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(5.5, 2.5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.42, 0);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerTarget.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

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
      const elapsed = clock.getElapsedTime();

      if (isVisible) {
        if (!reducedMotion) {
          pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4, delta);
          pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4, delta);

          card.group.position.y = -0.18 + Math.sin(elapsed * 1.1) * 0.06;
          card.group.rotation.y = 0.34 + pointerCurrent.x * 0.16 + Math.sin(elapsed * 0.7) * 0.04;
          card.group.rotation.x = -0.18 - pointerCurrent.y * 0.12;

          phone.group.position.y = -0.05 + Math.cos(elapsed * 0.9) * 0.04;
          phone.group.rotation.y = -0.28 + pointerCurrent.x * 0.08;
          phone.group.rotation.x = -0.08 - pointerCurrent.y * 0.06;
        }
        renderer.render(scene, camera);
      }

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
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      card.dispose();
      phone.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      disposeEnv();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (fallback) {
    return (
      <div className="relative h-[420px] sm:h-[480px] w-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center p-8 overflow-hidden">
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="w-72 h-44 rounded-2xl border border-[var(--accent-gold)]/40 bg-[#14161A] p-5 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <NexidLogo variant="horizontal" tone="gold" size="sm" />
              <span className="text-[11px] font-mono-tabular text-[#A6ABB4]">NFC</span>
            </div>
            <div>
              <p className="font-display text-base font-bold text-[#F4F1EB]">ALEX RIVERA</p>
              <p className="text-xs text-[#A6ABB4]">Product Designer & Web Dev</p>
            </div>
          </div>
          <div className="w-48 rounded-3xl border border-[#34373D] bg-[#101114] p-4 shadow-2xl text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-[#D5B47A] text-[#101114] flex items-center justify-center font-display font-bold text-sm">
              AR
            </div>
            <p className="mt-2 font-display text-sm font-semibold text-[#F4F1EB]">Alex Rivera</p>
            <p className="text-[11px] text-[#D5B47A]">Identidad conectada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative h-[400px] sm:h-[480px] lg:h-[520px] w-full select-none"
      aria-label="Composición 3D de tarjeta inteligente NEXID ONE y teléfono móvil"
    />
  );
}
