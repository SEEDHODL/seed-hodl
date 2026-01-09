import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ dayCount, isVoid }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const moonRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = Math.min(50 + dayCount * 300, 2000);

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 300 + 100;
        particlesRef.current.push({
          x: canvas.width / 2 + Math.cos(angle) * radius,
          y: canvas.height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          angle: angle,
          radius: radius,
          trail: []
        });
      }
    }

    let splashPhase = 0;
    let voidPhase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (isVoid) {
        // VOID phase: particles scatter, then moon appears
        if (splashPhase === 0) {
          // Explosion phase
          particlesRef.current.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            p.vx = (dx / dist) * 15;
            p.vy = (dy / dist) * 15;
          });
          splashPhase = 1;
        }

        if (splashPhase === 1) {
          // Move particles outward
          particlesRef.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Draw particle
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            ctx.fillRect(p.x, p.y, 2, 2);
          });

          voidPhase += 0.02;

          // Draw expanding VOID gradient
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(canvas.width, canvas.height) * voidPhase);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(0.5, `rgba(0, 0, 0, ${Math.sin(voidPhase * Math.PI) * 0.6})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (voidPhase > 1) {
            splashPhase = 2;
            voidPhase = 0;
            moonRef.current = {
              x: centerX,
              y: centerY,
              radius: 80,
              pulse: 0
            };
          }
        } else if (splashPhase === 2) {
          // Moon convergence phase
          const moon = moonRef.current;
          if (moon) {
            voidPhase += 0.03;

            // Draw void
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw pulsing moon
            moon.pulse = Math.sin(voidPhase * 4) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${moon.pulse * 0.9})`;
            ctx.beginPath();
            ctx.arc(moon.x, moon.y, moon.radius * moon.pulse, 0, Math.PI * 2);
            ctx.fill();

            // Draw glow
            ctx.strokeStyle = `rgba(255, 255, 255, ${moon.pulse * 0.4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(moon.x, moon.y, moon.radius * moon.pulse + 20, 0, Math.PI * 2);
            ctx.stroke();

            // Particles converge to moon
            particlesRef.current.forEach(p => {
              const dx = moon.x - p.x;
              const dy = moon.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist > 10) {
                p.x += (dx / dist) * 8;
                p.y += (dy / dist) * 8;

                ctx.fillStyle = `rgba(100, 200, 255, ${Math.random() * 0.6})`;
                ctx.fillRect(p.x, p.y, 1.5, 1.5);
              }
            });
          }
        }
      } else {
        // Normal staking phase: orbital motion
        const targetParticles = Math.min(50 + dayCount * 300, 2000);

        // Adjust particle count
        while (particlesRef.current.length < targetParticles) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 300 + 100;
          particlesRef.current.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
            angle: angle,
            radius: radius,
            trail: []
          });
        }

        while (particlesRef.current.length > targetParticles) {
          particlesRef.current.pop();
        }

        // Orbital motion
        particlesRef.current.forEach((p, idx) => {
          const speed = 0.01 + dayCount * 0.005;
          p.angle += speed;
          const maxRadius = 150 + dayCount * 50;
          p.radius = Math.min(p.radius, maxRadius);

          p.x = centerX + Math.cos(p.angle) * p.radius;
          p.y = centerY + Math.sin(p.angle) * p.radius;

          // Trail
          if (!p.trail) p.trail = [];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 8) p.trail.shift();

          // Draw trail
          p.trail.forEach((point, i) => {
            const alpha = (i / p.trail.length) * 0.6;
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.fillRect(point.x, point.y, 1, 1);
          });

          // Draw particle
          ctx.fillStyle = `rgba(56, 189, 248, 0.8)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Glow effect
          const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
          glowGradient.addColorStop(0, `rgba(56, 189, 248, 0.4)`);
          glowGradient.addColorStop(1, `rgba(56, 189, 248, 0)`);
          ctx.fillStyle = glowGradient;
          ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
        });

        // Central glow
        if (dayCount > 0) {
          const glowSize = Math.min(150 + dayCount * 30, 400);
          const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${dayCount * 0.1})`);
          glowGradient.addColorStop(1, `rgba(56, 189, 248, 0)`);
          ctx.fillStyle = glowGradient;
          ctx.fillRect(centerX - glowSize, centerY - glowSize, glowSize * 2, glowSize * 2);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dayCount, isVoid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}