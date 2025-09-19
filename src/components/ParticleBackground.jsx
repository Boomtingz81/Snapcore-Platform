// src/components/ParticleBackground.jsx
import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Particle class
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.fadeDelay = Math.random() * 600;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1000;
        this.ox = this.x;
        this.oy = this.y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.energy = Math.random() * 6 + 1;
        this.radius = Math.random() * 1.5 + 0.5;
        this.life = Math.random() * 0.002 + 0.0005;
        this.death = Math.random() * 0.0005 + 0.00009;
        this.wind = (Math.random() - 0.5) * 0.1;
        
        // Color variations
        const colorType = Math.random();
        if (colorType < 0.4) {
          this.color = { r: 0, g: 212, b: 255, a: 1 }; // Cyan
        } else if (colorType < 0.7) {
          this.color = { r: 124, g: 58, b: 237, a: 1 }; // Purple
        } else if (colorType < 0.9) {
          this.color = { r: 6, g: 255, b: 165, a: 1 }; // Green
        } else {
          this.color = { r: 255, g: 255, b: 255, a: 0.8 }; // White
        }
      }

      update() {
        this.x += this.vx + this.wind;
        this.y += this.vy;
        this.energy -= this.death;
        
        if (this.energy <= 0) {
          this.energy = 0;
        }
        
        // Mouse interaction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          this.vx += dx * force * 0.0001;
          this.vy += dy * force * 0.0001;
          this.energy += force * 0.01;
        }

        // Boundary check
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.energy <= 0) {
          this.reset();
        }
      }

      draw() {
        if (this.energy <= 0) return;

        const alpha = Math.min(this.energy, 1) * this.color.a;
        const size = this.radius * Math.min(this.energy, 1);

        // Outer glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 3);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.8})`);
        gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Connection lines between particles
    const drawConnections = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150 && p1.energy > 0.3 && p2.energy > 0.3) {
            const alpha = (1 - distance / 150) * 0.15;
            
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${alpha})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    };

    // Initialize particles
    const initParticles = () => {
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 150);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      particlesRef.current = particles;
    };

    // Animation loop
    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      drawConnections();

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Touch tracking for mobile
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    // Setup
    resizeCanvas();
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <>
      {/* Main particle canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)' }}
      />
      
      {/* Additional atmospheric effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle grid overlay */}
        <div 
          className="w-full h-full opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-cyan-400/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-green-400/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="scanning-line"></div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
          50% { opacity: 0.1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .scanning-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(0, 212, 255, 0.3) 30%, 
            rgba(0, 212, 255, 0.8) 50%, 
            rgba(0, 212, 255, 0.3) 70%, 
            transparent 100%
          );
          animation: scan 8s linear infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
            opacity: 0.7;
          }
          50% { 
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
