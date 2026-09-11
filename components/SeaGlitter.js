'use client';

import { useEffect, useRef } from 'react';
import tracking from '@/lib/masterplan2-sea-tracking.json';

function project(matrix, x, y) {
  const divisor = matrix[6] * x + matrix[7] * y + 1;
  return {
    x: (matrix[0] * x + matrix[1] * y + matrix[2]) / divisor,
    y: (matrix[3] * x + matrix[4] * y + matrix[5]) / divisor,
  };
}

// Sample the moving footage so reflections stay on water as the camera turns.
export default function SeaGlitter({ videoRef, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const sample = document.createElement('canvas');
    sample.width = 480;
    sample.height = 270;
    const sampling = sample.getContext('2d', { willReadFrequently: true });
    if (!context || !sampling) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    let pixels;
    let lastSample = -1;
    let lastPaint = 0;
    let seed = 73;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(0.00001, random()))) * Math.cos(random() * Math.PI * 2);
    const patches = [
      { x: 0.36, y: 0.08, spreadX: 0.085, spreadY: 0.11 },
      { x: 0.30, y: 0.25, spreadX: 0.10, spreadY: 0.09 },
      { x: 0.24, y: 0.40, spreadX: 0.075, spreadY: 0.10 },
    ];
    const glints = Array.from({ length: 4200 }, () => {
      const patch = patches[Math.floor(random() * patches.length)];
      return {
        x: patch.x + gaussian() * patch.spreadX,
        y: patch.y + gaussian() * patch.spreadY,
        size: 0.35 + random() ** 2 * 0.9,
        phase: random() * Math.PI * 2,
        secondaryPhase: random() * Math.PI * 2,
        speed: 0.35 + random() * 0.65,
        angle: (random() - 0.5) * Math.PI,
        strength: 0.45 + random() * 0.55,
      };
    });

    // Soft, compact points of light; no elongated halo or directional trails.
    const sparkle = document.createElement('canvas');
    sparkle.width = sparkle.height = 32;
    const sparkleContext = sparkle.getContext('2d');
    if (!sparkleContext) return;
    const glow = sparkleContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, 'rgba(255,255,248,1)');
    glow.addColorStop(0.22, 'rgba(255,252,232,.95)');
    glow.addColorStop(0.45, 'rgba(255,247,219,.35)');
    glow.addColorStop(1, 'rgba(255,244,208,0)');
    sparkleContext.fillStyle = glow;
    sparkleContext.fillRect(0, 0, 32, 32);

    const resize = () => {
      canvas.width = Math.min(1920, Math.round(canvas.clientWidth));
      canvas.height = Math.round(canvas.width * 9 / 16);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const paint = (now) => {
      frame = requestAnimationFrame(paint);
      if (now - lastPaint < 40 || document.hidden) return;
      lastPaint = now;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      if (!pixels || video.currentTime !== lastSample) {
        sampling.drawImage(video, 0, 0, sample.width, sample.height);
        pixels = sampling.getImageData(0, 0, sample.width, sample.height).data;
        lastSample = video.currentTime;
      }

      const time = motion.matches ? 0 : now / 1000;
      const scale = canvas.width / 1440;
      const framePosition = Math.max(0, Math.min(tracking.frames.length - 1, video.currentTime * tracking.fps));
      const lower = Math.floor(framePosition);
      const upper = Math.min(lower + 1, tracking.frames.length - 1);
      const blend = framePosition - lower;
      const matrix = tracking.frames[lower].map((value, index) => value + (tracking.frames[upper][index] - value) * blend);
      for (const glint of glints) {
        // Anchor each sparkle to the tracked surface; only its light flickers.
        const surfaceX = glint.x;
        const surfaceY = glint.y;
        const position = project(matrix, surfaceX, surfaceY);
        if (position.x < 0 || position.x >= 1 || position.y < 0 || position.y >= 1) continue;
        const index = (Math.floor(position.y * sample.height) * sample.width + Math.floor(position.x * sample.width)) * 4;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        // Reject sand, vegetation, buildings and white clouds; soften water edges.
        const water = Math.max(0, Math.min(1, (Math.min(green, blue) - red - 24) / 36));
        if (!water || blue < green * 0.9) continue;
        // Let actual bright/dark ripples in the footage modulate the reflection.
        const above = Math.max(0, index - sample.width * 4);
        const below = Math.min(pixels.length - 4, index + sample.width * 4);
        const contrast = (green - (pixels[above + 1] + pixels[below + 1]) * 0.5) / 28;
        const texture = Math.max(0.45, Math.min(1.4, 0.85 + contrast));
        const pulse = Math.sin(time * glint.speed + glint.phase) * 0.7
          + Math.sin(time * glint.speed * 1.73 + glint.secondaryPhase) * 0.3;
        const crest = Math.pow(Math.max(0, pulse), 2);
        const alpha = Math.min(0.95, water * crest * texture * glint.strength);
        if (alpha < 0.008) continue;
        const x = position.x * canvas.width;
        const y = position.y * canvas.height;
        const edge = project(matrix, surfaceX + 0.001, surfaceY);
        const dx = (edge.x - position.x) * canvas.width;
        const dy = (edge.y - position.y) * canvas.height;
        const angle = Math.atan2(dy, dx) + glint.angle;
        const magnification = Math.min(2.5, Math.hypot(dx, dy) / (canvas.width * 0.001));
        const radius = Math.min(2.1 * scale, glint.size * scale * magnification);
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.globalAlpha = alpha;
        context.drawImage(sparkle, -radius * 1.5, -radius, radius * 3, radius * 2);
        context.restore();
      }
    };
    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [videoRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
