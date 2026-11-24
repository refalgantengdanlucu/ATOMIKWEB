import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface AtomCanvasModel {
  name: string;
  symbol: string;
  protons: number;
  neutrons: number;
  shells: number[];
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint extends Point3D {
  scale: number;
}

interface ParticleHit {
  key: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  radius: number;
}

interface TooltipState {
  key: string;
  label: string;
  detail: string;
  x: number;
  y: number;
}

const CAMERA_DISTANCE = 360;
const MAX_SHELL_ELECTRONS = 6;
const NUCLEON_POSITIONS: Point3D[] = Array.from({ length: 16 }, (_, index) => {
  const y = 1 - (2 * (index + 0.5)) / 16;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));

  return {
    x: Math.cos(angle) * radius * 13,
    y: y * 13,
    z: Math.sin(angle) * radius * 13,
  };
});

const ORBIT_PLANES = [
  { radiusX: 48, radiusZ: 38, tiltX: 0.72, tiltZ: -0.32, yaw: 0.16, speed: 0.8 },
  { radiusX: 79, radiusZ: 61, tiltX: -0.63, tiltZ: 0.82, yaw: -0.54, speed: -0.48 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function rotatePoint(point: Point3D, yaw: number, pitch: number, roll: number): Point3D {
  const yawX = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const yawZ = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  const pitchY = point.y * Math.cos(pitch) - yawZ * Math.sin(pitch);
  const pitchZ = point.y * Math.sin(pitch) + yawZ * Math.cos(pitch);

  return {
    x: yawX * Math.cos(roll) - pitchY * Math.sin(roll),
    y: yawX * Math.sin(roll) + pitchY * Math.cos(roll),
    z: pitchZ,
  };
}

function projectPoint(point: Point3D, width: number, height: number): ProjectedPoint {
  const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - point.z);
  return {
    x: width / 2 + point.x * scale,
    y: height / 2 + point.y * scale,
    z: point.z,
    scale,
  };
}

function orbitalPoint(angle: number, shellIndex: number): Point3D {
  const plane = ORBIT_PLANES[shellIndex];
  const localPoint = {
    x: Math.cos(angle) * plane.radiusX,
    y: 0,
    z: Math.sin(angle) * plane.radiusZ,
  };

  return rotatePoint(localPoint, plane.yaw, plane.tiltX, plane.tiltZ);
}

function drawGlossySphere(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colors: [string, string, string, string],
  glow: string,
  alpha: number,
) {
  if (alpha <= 0.01) return;

  context.save();
  context.globalAlpha = alpha;
  context.shadowColor = glow;
  context.shadowBlur = radius * 1.45;

  const gradient = context.createRadialGradient(
    x - radius * 0.34,
    y - radius * 0.4,
    radius * 0.08,
    x,
    y,
    radius,
  );
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.3, colors[1]);
  gradient.addColorStop(0.72, colors[2]);
  gradient.addColorStop(1, colors[3]);

  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
  context.restore();

  context.save();
  context.globalAlpha = alpha * 0.72;
  context.beginPath();
  context.ellipse(
    x - radius * 0.34,
    y - radius * 0.38,
    radius * 0.23,
    radius * 0.13,
    -0.55,
    0,
    Math.PI * 2,
  );
  context.fillStyle = '#FFFFFF';
  context.fill();
  context.restore();
}

export function AtomCanvas({ atom }: { atom: AtomCanvasModel }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atomRef = useRef(atom);
  const drawRef = useRef<(() => void) | null>(null);
  const hitsRef = useRef<ParticleHit[]>([]);
  const draggingRef = useRef({ active: false, pointerId: -1, x: 0, y: 0 });
  const viewRef = useRef({
    yaw: -0.12,
    pitch: -0.08,
    targetParallaxX: 0,
    targetParallaxY: 0,
    parallaxX: 0,
    parallaxY: 0,
    orbitTime: 0,
    protons: atom.protons,
    neutrons: atom.neutrons,
    shells: [...atom.shells],
  });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    atomRef.current = atom;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      viewRef.current.protons = atom.protons;
      viewRef.current.neutrons = atom.neutrons;
      viewRef.current.shells = [...atom.shells];
      drawRef.current?.();
    }
  }, [atom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const view = viewRef.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let lastFrameTime = 0;
    let pixelRatio = 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      render();
    };

    const render = (deltaSeconds = 0, animate = false) => {
      if (!width || !height) return;
      const target = atomRef.current;
      const blend = animate ? 1 - Math.exp(-deltaSeconds / 0.34) : 1;
      view.protons += (target.protons - view.protons) * blend;
      view.neutrons += (target.neutrons - view.neutrons) * blend;
      view.shells = Array.from({ length: ORBIT_PLANES.length }, (_, index) => {
        const current = view.shells[index] ?? 0;
        const next = target.shells[index] ?? 0;
        return current + (next - current) * blend;
      });

      context.clearRect(0, 0, width, height);
      const now = view.orbitTime;
      const parallaxBlend = animate ? 1 - Math.exp(-deltaSeconds / 0.2) : 1;
      view.parallaxX += (view.targetParallaxX - view.parallaxX) * parallaxBlend;
      view.parallaxY += (view.targetParallaxY - view.parallaxY) * parallaxBlend;
      const yaw = view.yaw + view.parallaxX;
      const pitch = view.pitch + view.parallaxY;
      const wobbleX = animate ? Math.sin(now * 2.1) * 0.55 : 0;
      const wobbleY = animate ? Math.cos(now * 1.7) * 0.45 : 0;
      const centerX = width / 2;
      const centerY = height / 2;

      const project = (point: Point3D) => {
        const rotated = rotatePoint(point, yaw, pitch, 0);
        const result = projectPoint(rotated, width, height);
        return { ...result, x: result.x + wobbleX, y: result.y + wobbleY };
      };

      const nucleusRadius = 27 + view.protons * 0.25 + view.neutrons * 0.15;
      const nucleusGlow = context.createRadialGradient(
        centerX,
        centerY,
        1,
        centerX,
        centerY,
        nucleusRadius * 1.9,
      );
      nucleusGlow.addColorStop(0, 'rgba(249, 115, 22, 0.24)');
      nucleusGlow.addColorStop(0.45, 'rgba(249, 115, 22, 0.1)');
      nucleusGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
      context.fillStyle = nucleusGlow;
      context.beginPath();
      context.arc(centerX, centerY, nucleusRadius * 1.9, 0, Math.PI * 2);
      context.fill();

      const hits: ParticleHit[] = [];

      ORBIT_PLANES.forEach((plane, shellIndex) => {
        const shellOpacity = clamp(view.shells[shellIndex] ?? 0, 0, 1);
        if (shellOpacity <= 0.01) return;

        const segments = 112;
        context.save();
        context.lineWidth = 1.05;
        context.shadowColor = 'rgba(59, 130, 246, 0.38)';
        context.shadowBlur = 5;

        for (let segment = 0; segment < segments; segment += 1) {
          const angle = (segment / segments) * Math.PI * 2;
          const nextAngle = ((segment + 1) / segments) * Math.PI * 2;
          const first = project(orbitalPoint(angle, shellIndex));
          const second = project(orbitalPoint(nextAngle, shellIndex));
          const depth = (first.z + second.z) / 2;
          const depthAlpha = 0.12 + clamp((depth + 85) / 170, 0, 1) * 0.3;

          context.globalAlpha = depthAlpha * shellOpacity;
          context.strokeStyle = '#60A5FA';
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
        context.restore();

        const electronCount = view.shells[shellIndex] ?? 0;
        const visibleElectronSlots = Math.min(
          MAX_SHELL_ELECTRONS,
          Math.ceil(electronCount),
        );

        for (let electronIndex = 0; electronIndex < visibleElectronSlots; electronIndex += 1) {
          const opacity = clamp(electronCount - electronIndex, 0, 1);
          if (opacity <= 0.01) continue;

          const angle = now * plane.speed + (electronIndex * Math.PI * 2) / Math.max(electronCount, 1);
          const trailPoints: ProjectedPoint[] = [];
          for (let trailIndex = 0; trailIndex <= 7; trailIndex += 1) {
            const trailAngle = angle - plane.speed * trailIndex * 0.055;
            trailPoints.push(project(orbitalPoint(trailAngle, shellIndex)));
          }

          for (let trailIndex = 0; trailIndex < trailPoints.length - 1; trailIndex += 1) {
            const first = trailPoints[trailIndex];
            const second = trailPoints[trailIndex + 1];
            context.save();
            context.globalAlpha = opacity * (1 - trailIndex / trailPoints.length) * 0.25;
            context.strokeStyle = '#60A5FA';
            context.lineWidth = 2.4 * first.scale;
            context.shadowColor = '#3B82F6';
            context.shadowBlur = 7;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
            context.restore();
          }

          const electron = project(orbitalPoint(angle, shellIndex));
          const frontness = clamp((electron.z + 75) / 150, 0, 1);
          const electronRadius = (3.4 + frontness * 1.3) * electron.scale;
          const brightness = 0.72 + frontness * 0.28;

          hits.push({
            key: `electron-${shellIndex}-${electronIndex}`,
            label: 'Elektron',
            detail: 'Muatan −1',
            x: electron.x,
            y: electron.y,
            radius: electronRadius + 5,
          });

          context.save();
          context.globalAlpha = opacity * brightness;
          context.shadowColor = '#3B82F6';
          context.shadowBlur = 12 * electron.scale;
          const electronGradient = context.createRadialGradient(
            electron.x - electronRadius * 0.35,
            electron.y - electronRadius * 0.4,
            0.4,
            electron.x,
            electron.y,
            electronRadius,
          );
          electronGradient.addColorStop(0, '#FFFFFF');
          electronGradient.addColorStop(0.34, '#BFDBFE');
          electronGradient.addColorStop(0.72, '#3B82F6');
          electronGradient.addColorStop(1, '#1D4ED8');
          context.fillStyle = electronGradient;
          context.beginPath();
          context.arc(electron.x, electron.y, electronRadius, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      });

      const totalNucleons = view.protons + view.neutrons;
      const nucleons = NUCLEON_POSITIONS.slice(0, Math.ceil(totalNucleons)).map((position, index) => {
        const opacity = clamp(totalNucleons - index, 0, 1);
        const point = project({
          x: position.x + wobbleX,
          y: position.y + wobbleY,
          z: position.z,
        });
        const protonOpacity = Math.min(opacity, clamp(view.protons - index, 0, 1));
        const neutronOpacity = Math.max(opacity - protonOpacity, 0);

        return { index, point, opacity, protonOpacity, neutronOpacity };
      });

      nucleons.sort((first, second) => first.point.z - second.point.z);
      nucleons.forEach(({ index, point, opacity, protonOpacity, neutronOpacity }) => {
        const radius = (7 + Math.min(totalNucleons, 16) * 0.025) * point.scale;
        const brightness = 0.76 + clamp((point.z + 18) / 36, 0, 1) * 0.24;

        if (protonOpacity > 0) {
          drawGlossySphere(
            context,
            point.x,
            point.y,
            radius,
            ['#FFF7ED', '#FB923C', '#EA580C', '#9A3412'],
            '#F97316',
            protonOpacity * brightness,
          );
        }
        if (neutronOpacity > 0) {
          drawGlossySphere(
            context,
            point.x,
            point.y,
            radius,
            ['#FFFFFF', '#CBD5E1', '#64748B', '#334155'],
            '#94A3B8',
            neutronOpacity * brightness,
          );
        }

        if (opacity > 0.05) {
          const isProton = protonOpacity >= neutronOpacity;
          hits.push({
            key: `${isProton ? 'proton' : 'neutron'}-${index}`,
            label: isProton ? 'Proton' : 'Neutron',
            detail: isProton ? 'Muatan +1' : 'Muatan 0',
            x: point.x,
            y: point.y,
            radius: radius + 3,
          });
        }
      });

      hitsRef.current = hits;
    };

    const tick = (timestamp: number) => {
      const deltaSeconds = lastFrameTime
        ? Math.min((timestamp - lastFrameTime) / 1000, 0.05)
        : 0;
      lastFrameTime = timestamp;
      if (!motionPreference.matches) view.orbitTime += deltaSeconds;
      render(deltaSeconds, !motionPreference.matches);

      if (!motionPreference.matches) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const startAnimation = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      lastFrameTime = 0;
      frameId = window.requestAnimationFrame(tick);
    };

    const handleMotionChange = () => {
      if (motionPreference.matches) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        view.protons = atomRef.current.protons;
        view.neutrons = atomRef.current.neutrons;
        view.shells = [...atomRef.current.shells];
        render();
      } else {
        startAnimation();
      }
    };

    drawRef.current = () => render();
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    motionPreference.addEventListener('change', handleMotionChange);
    if (!motionPreference.matches) startAnimation();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      motionPreference.removeEventListener('change', handleMotionChange);
      drawRef.current = null;
    };
  }, []);

  const updateTooltip = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    let nearest: ParticleHit | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    hitsRef.current.forEach((hit) => {
      const distance = Math.hypot(hit.x - x, hit.y - y);
      if (distance <= hit.radius + 3 && distance < nearestDistance) {
        nearest = hit;
        nearestDistance = distance;
      }
    });

    if (!nearest) {
      setTooltip((current) => current ? null : current);
      return;
    }

    const hit = nearest as ParticleHit;
    const tooltipX = clamp(x, 58, Math.max(58, bounds.width - 58));
    const tooltipY = clamp(y, 28, Math.max(28, bounds.height - 16));
    setTooltip((current) => {
      if (
        current?.key === hit.key &&
        current.x === tooltipX &&
        current.y === tooltipY
      ) {
        return current;
      }
      return {
        key: hit.key,
        label: hit.label,
        detail: hit.detail,
        x: tooltipX,
        y: tooltipY,
      };
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = {
      active: true,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.style.cursor = 'grabbing';
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = draggingRef.current;
    if (drag.active && drag.pointerId === event.pointerId) {
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      viewRef.current.yaw += deltaX * 0.012;
      viewRef.current.pitch = clamp(viewRef.current.pitch + deltaY * 0.01, -1.25, 1.25);
      setTooltip(null);
      drawRef.current?.();
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    viewRef.current.targetParallaxX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.18;
    viewRef.current.targetParallaxY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.12;
    updateTooltip(event);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current.pointerId !== event.pointerId) return;
    draggingRef.current.active = false;
    draggingRef.current.pointerId = -1;
    event.currentTarget.style.cursor = 'grab';
  };

  const handlePointerLeave = () => {
    if (!draggingRef.current.active) {
      viewRef.current.targetParallaxX = 0;
      viewRef.current.targetParallaxY = 0;
      setTooltip(null);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    const step = event.shiftKey ? 0.22 : 0.12;
    if (event.key === 'ArrowLeft') viewRef.current.yaw -= step;
    else if (event.key === 'ArrowRight') viewRef.current.yaw += step;
    else if (event.key === 'ArrowUp') viewRef.current.pitch = clamp(viewRef.current.pitch - step, -1.25, 1.25);
    else if (event.key === 'ArrowDown') viewRef.current.pitch = clamp(viewRef.current.pitch + step, -1.25, 1.25);
    else return;

    event.preventDefault();
    drawRef.current?.();
  };

  return (
    <div className="relative mx-auto my-3 aspect-square w-56 max-w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none cursor-grab rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]/60 focus-visible:ring-offset-2"
        role="application"
        tabIndex={0}
        aria-label={`Simulasi atom 3D ${atom.name} (${atom.symbol}). Geser untuk memutar, atau gunakan tombol panah pada keyboard.`}
        aria-describedby={tooltip ? 'atom-particle-tooltip' : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
      />
      {tooltip && (
        <div
          id="atom-particle-tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-[#F1E5D8] bg-white/95 px-2.5 py-1.5 text-left text-[10px] shadow-md"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          <span className="block font-bold text-[#172033]">{tooltip.label}</span>
          <span className="block text-[#64748B]">{tooltip.detail}</span>
        </div>
      )}
      <span className="sr-only">
        Proton berwarna oranye, neutron abu-abu metalik, elektron biru bercahaya.
      </span>
    </div>
  );
}
