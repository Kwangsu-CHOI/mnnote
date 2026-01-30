"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export const AntigravityHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    // Configuration
    const particleCount = 80; // More scattered
    const mouseRadius = 150; // Interaction radius

    class Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      friction: number = 0.95;
      ease: number = 0.05;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.originX = this.x;
        this.originY = this.y;
        this.size = Math.random() * 4 + 2; // "Very big" effect relative to small dots
        this.vx = 0;
        this.vy = 0;
        
        // Google Antigravity style colors (Red, Blue, Yellow, Green) + Theme adaptability
        const colors = theme === 'dark' 
          ? ['#EA4335', '#4285F4', '#FBBC05', '#34A853', '#ffffff'] // Google colors + white
          : ['#EA4335', '#4285F4', '#FBBC05', '#34A853', '#5f6368']; // Google colors + gray
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(width: number, height: number, mouseX: number, mouseY: number) {
        // Calculate distance between mouse and particle
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // "Antigravity" / Repulsion effect
        if (distance < mouseRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            
            // Stronger force closer to mouse
            const force = (mouseRadius - distance) / mouseRadius; 
            const directionX = forceDirectionX * force * 15; // Push away strength
            const directionY = forceDirectionY * force * 15;

            this.vx -= directionX;
            this.vy -= directionY;
        }

        // Return to origin (elasticity)
        /*
        const homeDx = this.originX - this.x;
        const homeDy = this.originY - this.y;
        this.vx += homeDx * 0.01;
        this.vy += homeDy * 0.01;
        */
       
       // Alternatively: Float around randomly if not interacting
       if (distance >= mouseRadius) {
           this.vx += (Math.random() - 0.5) * 0.2;
           this.vy += (Math.random() - 0.5) * 0.2;
       }

        // Apply physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(width, height));
      }
    };

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update(width, height, mouse.x, mouse.y);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    init();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Remove fixed height, take full parent size
  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-background">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
};
