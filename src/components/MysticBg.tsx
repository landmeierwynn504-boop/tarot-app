"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
  delay: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  hue: number;       // 40-55 gold, 200-220 silver
  alpha: number;
  life: number;
  maxLife: number;
}

function spawnMeteor(w: number, h: number): Meteor {
  const angle = Math.random() * Math.PI * 0.25 + Math.PI * 0.35; // mostly downward-right
  const spd = Math.random() * 3 + 4;
  const isGold = Math.random() < 0.55;
  return {
    x: Math.random() * w * 0.9,
    y: Math.random() * h * 0.3 - 20,
    vx: Math.cos(angle) * spd,
    vy: Math.sin(angle) * spd,
    len: Math.random() * 200 + 100,   // longer tails: 100-300
    hue: isGold ? Math.random() * 15 + 40 : Math.random() * 20 + 200,
    alpha: Math.random() * 0.3 + 0.7, // brighter: 0.7-1.0
    life: 0,
    maxLife: Math.random() * 180 + 120,
  };
}

export default function MysticBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: Star[] = [];
    const meteors: Meteor[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    // Create stars
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        delay: Math.random() * 3,
      });
    }

    // Seed initial meteors
    for (let i = 0; i < 3; i++) {
      const m = spawnMeteor(canvas.width, canvas.height);
      m.life = Math.floor(Math.random() * m.maxLife * 0.6);
      meteors.push(m);
    }

    let spawnTimer = 0;
    let time = 0;

    function draw() {
      time += 0.01;
      spawnTimer++;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn new meteor every ~1-3s
      if (spawnTimer > Math.random() * 100 + 55 && meteors.length < 5) {
        meteors.push(spawnMeteor(canvas!.width, canvas!.height));
        spawnTimer = 0;
      }

      // Draw & update meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const progress = m.life / m.maxLife;
        const fade = progress < 0.2
          ? progress / 0.2
          : 1 - (progress - 0.2) / 0.8;
        const alpha = m.alpha * fade;

        if (alpha <= 0.01 || m.x > canvas!.width + 50 || m.y > canvas!.height + 50) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - m.vx * m.len * 0.015;
        const tailY = m.y - m.vy * m.len * 0.015;

        // Comet trail — thicker outer glow
        const gradient = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `hsla(${m.hue}, 70%, 72%, ${alpha})`);
        gradient.addColorStop(0.15, `hsla(${m.hue}, 60%, 58%, ${alpha * 0.7})`);
        gradient.addColorStop(0.4, `hsla(${m.hue}, 50%, 40%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${m.hue}, 30%, 25%, 0)`);

        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.8;
        ctx!.stroke();

        // Bright core line
        const coreGrad = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
        coreGrad.addColorStop(0, `hsla(${m.hue}, 80%, 88%, ${alpha})`);
        coreGrad.addColorStop(0.3, `hsla(${m.hue}, 70%, 65%, ${alpha * 0.4})`);
        coreGrad.addColorStop(1, `hsla(${m.hue}, 40%, 35%, 0)`);

        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = coreGrad;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();

        // Head glow
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${m.hue}, 80%, 85%, ${alpha})`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 5, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${m.hue}, 70%, 60%, ${alpha * 0.25})`;
        ctx!.fill();
      }

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(time * star.speed * 10 + star.delay) * 0.4 + 0.6;
        const alpha = star.opacity * twinkle;

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(212, 168, 83, ${alpha})`;
        ctx!.fill();

        star.y -= star.speed * 0.05;
        if (star.y < -5) {
          star.y = canvas!.height + 5;
          star.x = Math.random() * canvas!.width;
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
