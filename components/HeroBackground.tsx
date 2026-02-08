'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const GOLD = { r: 212, g: 175, b: 55 };
const GOLD_LIGHT = { r: 232, g: 213, b: 163 };
const NODE_RADIUS = 2.5;
const CONNECT_DIST = 140;
const GLOW_RADIUS = 80;
const GLOW_STRENGTH = 0.9;

function buildGraph(width: number, height: number) {
  const nodes: { x: number; y: number }[] = [];
  const count = Math.min(80, Math.floor((width * height) / 12000));
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (dx * dx + dy * dy < CONNECT_DIST * CONNECT_DIST) {
        edges.push([i, j]);
      }
    }
  }
  return { nodes, edges };
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<{ nodes: { x: number; y: number }[]; edges: [number, number][] } | null>(null);
  const glowRef = useRef<number[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onResize = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w > 0 && h > 0) {
      setSize({ w, h });
      graphRef.current = buildGraph(w, h);
      glowRef.current = new Array(graphRef.current.nodes.length).fill(0);
    }
  }, []);

  useEffect(() => {
    onResize();
    const ro = new ResizeObserver(onResize);
    const el = sectionRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [onResize]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const graph = graphRef.current;
    if (!canvas || !graph || size.w <= 0 || size.h <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      const { nodes, edges } = graph;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const glows = glowRef.current;

      for (let i = 0; i < nodes.length; i++) {
        const dx = mx - nodes[i].x;
        const dy = my - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = dist < GLOW_RADIUS ? (1 - dist / GLOW_RADIUS) * GLOW_STRENGTH : 0;
        glows[i] += (target - glows[i]) * 0.12;
      }

      ctx.clearRect(0, 0, size.w, size.h);

      ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const g = Math.max(glows[a], glows[b]);
        const alpha = 0.08 + g * 0.35;
        ctx.strokeStyle = `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      });

      nodes.forEach((node, i) => {
        const g = glows[i];
        const baseAlpha = 0.25 + g * 0.6;
        const radius = NODE_RADIUS + g * 3;
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius * 3
        );
        gradient.addColorStop(0, `rgba(${GOLD_LIGHT.r},${GOLD_LIGHT.g},${GOLD_LIGHT.b},${baseAlpha})`);
        gradient.addColorStop(0.4, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${baseAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${GOLD_LIGHT.r},${GOLD_LIGHT.g},${GOLD_LIGHT.b},${0.4 + g * 0.6})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <div ref={sectionRef} className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,175,55,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 60% 70% at 80% 60%, rgba(184,134,11,0.14) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50% 80%, rgba(232,213,163,0.1) 0%, transparent 45%),
            radial-gradient(ellipse 70% 40% at 70% 20%, rgba(212,175,55,0.12) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="absolute inset-0 w-full h-full opacity-90"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}
