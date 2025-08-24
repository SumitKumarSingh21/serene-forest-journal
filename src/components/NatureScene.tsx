import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Simple elegant background with floating orbs and gradients
export default function PeacefulBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Floating orbs
    const orbs: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
    }> = [];

    // Create orbs
    for (let i = 0; i < 15; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 60 + 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        color: `hsl(${35 + Math.random() * 50}, ${60 + Math.random() * 30}%, ${60 + Math.random() * 20}%)`
      });
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return;
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#1a1a1a');
      gradient.addColorStop(1, '#0f0f0f');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw orbs
      orbs.forEach(orb => {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off edges
        if (orb.x <= orb.radius || orb.x >= canvas.width - orb.radius) {
          orb.vx *= -1;
        }
        if (orb.y <= orb.radius || orb.y >= canvas.height - orb.radius) {
          orb.vy *= -1;
        }

        // Draw orb with gradient
        const orbGradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        orbGradient.addColorStop(0, `${orb.color.slice(0, -1)}, ${orb.opacity})`);
        orbGradient.addColorStop(1, `${orb.color.slice(0, -1)}, 0)`);

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)' }}
    />
  );
}