import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ArrowRight, CheckCircle2, Hand, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '@/contexts/I18nContext';
import {
  applyStudioEnvironment,
  createNexidCardRig,
  createNexidPhoneRig,
  createStudioRenderer,
  detectSoftwareGl,
  isWebGLAvailable,
} from '@/scenes/shared/nexid3dBuilders';

type ExperiencePhase = 'idle' | 'dragging' | 'snapping' | 'connected';

export function NFCExperience3D({ onExploreProfile }: { onExploreProfile?: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<ExperiencePhase>('idle');
  const [proximityPct, setProximityPct] = useState(0);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const phaseRef = useRef<ExperiencePhase>('idle');
  const cardTargetPos = useRef(new THREE.Vector3(-1.35, -0.05, 0.72));
  const autoConnectRef = useRef(false);
  const resetSignalRef = useRef(false);

  const triggerAutoConnect = useCallback(() => {
    if (phaseRef.current === 'connected') return;
    autoConnectRef.current = true;
    phaseRef.current = 'snapping';
    setPhase('snapping');
    setProximityPct(100);
  }, []);

  const triggerReset = useCallback(() => {
    autoConnectRef.current = false;
    resetSignalRef.current = true;
    phaseRef.current = 'idle';
    cardTargetPos.current.set(-1.35, -0.05, 0.72);
    setPhase('idle');
    setProximityPct(0);
  }, []);

  const goToAlexProfile = useCallback(() => {
    if (onExploreProfile) {
      onExploreProfile();
    } else {
      navigate('/demo/perfil/alex-rivera');
    }
  }, [navigate, onExploreProfile]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !isWebGLAvailable()) {
      setWebglUnsupported(true);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createStudioRenderer(container, isSoftwareGl);
    } catch {
      setWebglUnsupported(true);
      return;
    }

    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101114');
    scene.fog = new THREE.FogExp2('#101114', 0.065);

    const camera = new THREE.PerspectiveCamera(
      38,
      (container.clientWidth || 800) / (container.clientHeight || 520),
      0.1,
      50,
    );
    const updateCameraForViewport = () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.position.set(0, 0.1, w < 640 ? 6.5 : 5.1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    updateCameraForViewport();

    const disposeEnv = applyStudioEnvironment(scene, renderer);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Subtle dark studio stage disc
    const stageGeo = new THREE.CylinderGeometry(2.9, 3.05, 0.08, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x17191d,
      metalness: 0.25,
      roughness: 0.72,
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.set(0, -1.48, 0);
    stageMesh.receiveShadow = true;
    scene.add(stageMesh);

    const phoneTargetPos = new THREE.Vector3(1.1, 0.02, -0.15);
    const nfcSweetSpot = new THREE.Vector3(1.0, 0.36, 0.25);

    const phone = createNexidPhoneRig(
      { connected: false, proximity: 0, name: 'Alex Rivera', role: 'Diseñador digital y web' },
      maxAniso,
    );
    phone.group.position.copy(phoneTargetPos);
    phone.group.rotation.set(-0.04, -0.22, 0);
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
    card.group.position.copy(cardTargetPos.current);
    card.group.rotation.set(-0.08, 0.26, 0.04);
    scene.add(card.group);

    // Concentric NFC wave rings (visible during connection sequence)
    const waveRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; offset: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const rGeo = new THREE.RingGeometry(0.18, 0.21, 48);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0xd5b47a,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set(nfcSweetSpot.x, nfcSweetSpot.y, phoneTargetPos.z + 0.11);
      rMesh.rotation.y = -0.22;
      scene.add(rMesh);
      waveRings.push({ mesh: rMesh, mat: rMat, offset: i * 0.33 });
    }

    // Raycaster & drag plane
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.55);
    const intersectPt = new THREE.Vector3();
    let isPointerDown = false;
    let isHoveringCard = false;
    let lastScreenProximity = -1;
    let connectedTimer = 0;

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (phaseRef.current === 'snapping' || phaseRef.current === 'connected') return;
      updateNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObject(card.group, true);
      if (hits.length > 0) {
        isPointerDown = true;
        phaseRef.current = 'dragging';
        setPhase('dragging');
        renderer.domElement.setPointerCapture?.(e.pointerId);
        renderer.domElement.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      updateNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);

      if (isPointerDown && phaseRef.current === 'dragging') {
        if (raycaster.ray.intersectPlane(dragPlane, intersectPt)) {
          const clampedX = THREE.MathUtils.clamp(intersectPt.x, -2.1, 1.35);
          const clampedY = THREE.MathUtils.clamp(intersectPt.y, -0.85, 0.95);
          cardTargetPos.current.set(clampedX, clampedY, 0.65);

          const dist = cardTargetPos.current.distanceTo(nfcSweetSpot);
          const prox = THREE.MathUtils.clamp(1 - (dist - 0.55) / 1.9, 0, 1);
          const pct = Math.round(prox * 100);
          if (Math.abs(pct - lastScreenProximity) >= 4) {
            lastScreenProximity = pct;
            setProximityPct(pct);
            phone.updateScreen({
              connected: false,
              proximity: prox,
              name: 'Alex Rivera',
              role: 'Diseñador digital y web',
            });
          }

          // Magnetic snapping threshold
          if (dist < 1.05) {
            isPointerDown = false;
            phaseRef.current = 'snapping';
            setPhase('snapping');
            setProximityPct(100);
            autoConnectRef.current = true;
          }
        }
        return;
      }

      if (phaseRef.current === 'idle') {
        const hits = raycaster.intersectObject(card.group, true);
        isHoveringCard = hits.length > 0;
        renderer.domElement.style.cursor = isHoveringCard ? 'grab' : 'default';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
      renderer.domElement.style.cursor = 'grab';
      if (phaseRef.current === 'dragging') {
        phaseRef.current = 'idle';
        setPhase('idle');
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', updateCameraForViewport);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnsupported(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

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

      if (resetSignalRef.current) {
        resetSignalRef.current = false;
        connectedTimer = 0;
        lastScreenProximity = -1;
        phone.updateScreen({ connected: false, proximity: 0 });
        card.setRimHighlight(0.05);
        waveRings.forEach((r) => {
          r.mat.opacity = 0;
          r.mesh.scale.setScalar(1);
        });
      }

      if (phaseRef.current === 'snapping' || autoConnectRef.current) {
        cardTargetPos.current.set(nfcSweetSpot.x, nfcSweetSpot.y, nfcSweetSpot.z);
        const snapSpeed = reducedMotion ? 20 : 6;
        card.group.position.x = THREE.MathUtils.damp(card.group.position.x, cardTargetPos.current.x, snapSpeed, delta);
        card.group.position.y = THREE.MathUtils.damp(card.group.position.y, cardTargetPos.current.y, snapSpeed, delta);
        card.group.position.z = THREE.MathUtils.damp(card.group.position.z, cardTargetPos.current.z, snapSpeed, delta);

        card.group.rotation.x = THREE.MathUtils.damp(card.group.rotation.x, -0.04, 6, delta);
        card.group.rotation.y = THREE.MathUtils.damp(card.group.rotation.y, -0.22, 6, delta);
        card.group.rotation.z = THREE.MathUtils.damp(card.group.rotation.z, 0, 6, delta);
        card.setRimHighlight(0.55);

        if (card.group.position.distanceTo(nfcSweetSpot) < 0.06) {
          autoConnectRef.current = false;
          phaseRef.current = 'connected';
          setPhase('connected');
          phone.updateScreen({
            connected: true,
            proximity: 1,
            name: 'Alex Rivera',
            role: 'Diseñador digital y web',
          });
        }
      } else if (phaseRef.current === 'connected') {
        connectedTimer += delta;
        card.group.position.x = THREE.MathUtils.damp(card.group.position.x, nfcSweetSpot.x - 0.12, 4, delta);
        card.group.position.y = THREE.MathUtils.damp(
          card.group.position.y,
          nfcSweetSpot.y + (reducedMotion ? 0 : Math.sin(elapsed * 1.4) * 0.025),
          4,
          delta,
        );
        card.group.position.z = THREE.MathUtils.damp(card.group.position.z, nfcSweetSpot.z + 0.14, 4, delta);
        card.setRimHighlight(0.35);

        // Animate concentric golden NFC waves for ~2.5s then settle softly
        waveRings.forEach((ring) => {
          if (connectedTimer < 3.2 && !reducedMotion) {
            const cycle = ((connectedTimer * 0.7 + ring.offset) % 1);
            const scale = 1 + cycle * 3.8;
            ring.mesh.scale.setScalar(scale);
            ring.mat.opacity = (1 - cycle) * 0.65;
          } else {
            ring.mat.opacity = THREE.MathUtils.damp(ring.mat.opacity, 0, 4, delta);
          }
        });
      } else {
        // Idle or dragging
        const floatY = phaseRef.current === 'idle' && !reducedMotion ? Math.sin(elapsed * 1.2) * 0.05 : 0;
        card.group.position.x = THREE.MathUtils.damp(card.group.position.x, cardTargetPos.current.x, 8, delta);
        card.group.position.y = THREE.MathUtils.damp(card.group.position.y, cardTargetPos.current.y + floatY, 8, delta);
        card.group.position.z = THREE.MathUtils.damp(card.group.position.z, cardTargetPos.current.z, 8, delta);

        const hoverTiltX = isHoveringCard ? -pointerNdc.y * 0.18 : -0.08;
        const hoverTiltY = isHoveringCard ? 0.26 + pointerNdc.x * 0.22 : 0.26;
        card.group.rotation.x = THREE.MathUtils.damp(card.group.rotation.x, hoverTiltX, 6, delta);
        card.group.rotation.y = THREE.MathUtils.damp(card.group.rotation.y, hoverTiltY, 6, delta);
        card.group.rotation.z = THREE.MathUtils.damp(
          card.group.rotation.z,
          phaseRef.current === 'dragging' ? -0.06 : 0.04,
          6,
          delta,
        );
        card.setRimHighlight(isHoveringCard || phaseRef.current === 'dragging' ? 0.28 : 0.06);
      }

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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', updateCameraForViewport);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      card.dispose();
      phone.dispose();
      stageGeo.dispose();
      stageMat.dispose();
      waveRings.forEach((r) => {
        r.mesh.geometry.dispose();
        r.mat.dispose();
      });
      disposeEnv();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-[#101114] overflow-hidden">
      {/* Top Instruction Header (Non-obstructive) */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-5 pb-2">
        <div>
          <p className="font-display text-lg sm:text-xl font-bold text-[#F4F1EB]">
            {t('Una conexión comienza con un gesto', 'A connection begins with a gesture')}
          </p>
          <p className="text-xs sm:text-sm text-[#A6ABB4]">
            {phase === 'connected'
              ? t('Identidad detectada · Alex Rivera — Diseñador digital', 'Identity detected · Alex Rivera — Digital designer')
              : t(
                  'Arrastra la tarjeta hacia el teléfono o utiliza la conexión automática.',
                  'Drag the card toward the smartphone or trigger auto-connect.',
                )}
          </p>
        </div>

        <div className="text-xs font-mono-tabular text-[#D5B47A] shrink-0" aria-live="polite">
          {phase === 'connected'
            ? t('Estado: Conectado', 'Status: Connected')
            : phase === 'snapping'
              ? t('Estado: Sincronizando NFC', 'Status: Syncing NFC')
              : `${t('Proximidad', 'Proximity')}: ${proximityPct}%`}
        </div>
      </div>

      {/* 3D Canvas Viewport OR Accessible 2D Fallback */}
      {webglUnsupported ? (
        <div className="h-[400px] sm:h-[460px] flex flex-col items-center justify-center p-6 text-center bg-[#101114]">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <motion.div
              animate={phase === 'connected' ? { x: 24, scale: 0.96 } : { x: 0, scale: 1 }}
              className="w-64 h-40 rounded-2xl border border-[#D5B47A]/50 bg-[#17191D] p-5 text-left flex flex-col justify-between"
            >
              <span className="font-display text-xs font-semibold text-[#D5B47A]">NEXID ONE</span>
              <div>
                <p className="font-display text-sm font-bold text-[#F4F1EB]">ALEX RIVERA</p>
                <p className="text-xs text-[#A6ABB4]">Product Designer & Web Dev</p>
              </div>
            </motion.div>

            <div className="w-52 rounded-3xl border border-[#34373D] bg-[#17191D] p-5 text-center">
              <p className="text-xs font-semibold text-[#D5B47A]">
                {phase === 'connected'
                  ? t('Identidad detectada', 'Identity detected')
                  : t('Esperando tarjeta NFC', 'Waiting for NFC card')}
              </p>
              <p className="mt-2 font-display text-base font-bold text-[#F4F1EB]">Alex Rivera</p>
              <p className="text-xs text-[#A6ABB4]">{t('Diseñador digital', 'Digital designer')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={mountRef}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
              e.preventDefault();
              triggerAutoConnect();
            } else if (e.key === 'r' || e.key === 'R') {
              triggerReset();
            }
          }}
          aria-label={t(
            'Escena 3D interactiva NFC. Arrastra la tarjeta hacia el teléfono o presiona Enter para conectar.',
            'Interactive 3D NFC stage. Drag the card to the phone or press Enter to connect.',
          )}
          className="relative h-[400px] sm:h-[480px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B47A]"
        />
      )}

      {/* Confirmation Overlay Card on Connection */}
      <AnimatePresence>
        {phase === 'connected' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="mx-6 mb-4 rounded-2xl border border-[#D5B47A]/40 bg-[#17191D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#3BAA82] shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-sm font-bold text-[#F4F1EB]">
                  {t('Identidad detectada', 'Identity detected')}
                </p>
                <p className="text-xs text-[#A6ABB4]">
                  Alex Rivera — {t('Diseñador digital y desarrollador web', 'Digital designer & web developer')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={goToAlexProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D5B47A] px-4 py-2 text-sm font-semibold text-[#101114] hover:bg-[#E8D2A7] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t('Explorar identidad', 'Explore identity')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="border-t border-[#34373D] bg-[#17191D] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#A6ABB4]">
          <Hand className="h-4 w-4 text-[#D5B47A] shrink-0" />
          <span>
            {t(
              'Arrastra con el mouse o dedo · Teclado: Enter para conectar',
              'Drag with mouse or touch · Keyboard: Enter to connect',
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {phase !== 'connected' && (
            <button
              type="button"
              onClick={triggerAutoConnect}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D5B47A] px-4 py-2 text-xs font-semibold text-[#101114] hover:bg-[#E8D2A7] transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t('Conectar automáticamente', 'Auto-connect')}
            </button>
          )}
          <button
            type="button"
            onClick={triggerReset}
            className="inline-flex items-center gap-2 rounded-xl border border-[#34373D] px-3.5 py-2 text-xs font-medium text-[#F4F1EB] hover:bg-[#202329] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('Reiniciar', 'Reset')}
          </button>
          <button
            type="button"
            onClick={goToAlexProfile}
            className="inline-flex items-center gap-2 rounded-xl border border-[#34373D] px-3.5 py-2 text-xs font-medium text-[#A6ABB4] hover:text-[#F4F1EB] hover:bg-[#202329] transition-colors whitespace-nowrap shrink-0"
          >
            <SkipForward className="h-3.5 w-3.5" />
            {t('Omitir animación', 'Skip animation')}
          </button>
        </div>
      </div>
    </div>
  );
}
