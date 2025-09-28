import React, { useEffect } from "react";

const Layout = ({ 
  children, 
  title = "SnapFaultCore", 
  description = "Professional Automotive Diagnostic Platform by SnapCore AI Systems Ltd.",
  showParticles = true,
  className = ""
}) => {
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  useEffect(() => {
    if (!showParticles) return;

    // Daily Themed Particle System
    class DailyThemedParticleSystem {
      constructor() {
        this.container = document.getElementById('particleContainer');
        if (!this.container) {
          console.warn('[Particles] Container not found, skipping init.');
          return;
        }
        this.particles = [];
        this.maxParticles = 60;
        this.addTimer = null;
        this.cleanupTimer = null;
        this.prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.setDailyTheme();
        this.init();
      }

      setDailyTheme() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        document.body.classList.remove('theme-tuesday','theme-wednesday','theme-thursday','theme-friday','theme-saturday','theme-sunday');
        
        switch(dayOfWeek) {
          case 1: console.log('[Daily Theme] Monday - Green particles'); break;
          case 2: document.body.classList.add('theme-tuesday'); console.log('[Daily Theme] Tuesday - Cyan particles'); break;
          case 3: document.body.classList.add('theme-wednesday'); console.log('[Daily Theme] Wednesday - Orange particles'); break;
          case 4: document.body.classList.add('theme-thursday'); console.log('[Daily Theme] Thursday - Red particles'); break;
          case 5: document.body.classList.add('theme-friday'); console.log('[Daily Theme] Friday - Purple particles'); break;
          case 6: document.body.classList.add('theme-saturday'); console.log('[Daily Theme] Saturday - Yellow particles'); break;
          case 0: document.body.classList.add('theme-sunday'); console.log('[Daily Theme] Sunday - Blue particles'); break;
        }
      }

      init() {
        if (this.prefersReduced) return;
        
        for(let i = 0; i < 35; i++) { 
          setTimeout(() => this.addParticle(), i * 120); 
        }
        
        this.addTimer = setInterval(() => {
          if (this.container && this.particles.length < this.maxParticles) {
            this.addParticle();
          }
        }, 300);
        
        this.cleanupTimer = setInterval(() => {
          this.cleanupParticles();
        }, 1500);
        
        document.addEventListener('visibilitychange', () => {
          const paused = document.hidden;
          if (paused) {
            clearInterval(this.addTimer);
            clearInterval(this.cleanupTimer);
          } else {
            if (!this.prefersReduced) {
              this.addTimer = setInterval(() => {
                if (this.container && this.particles.length < this.maxParticles) {
                  this.addParticle();
                }
              }, 300);
              this.cleanupTimer = setInterval(() => {
                this.cleanupParticles();
              }, 1500);
            }
          }
        });
      }

      addParticle() {
        const el = document.createElement('div');
        const r = Math.random();
        el.className = r < 0.4 ? 'particle' : r < 0.7 ? 'particle medium' : 'particle large';
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDelay = (Math.random() * 5) + 's';
        el.style.animationDuration = (18 + Math.random() * 12) + 's';
        this.container.appendChild(el);
        this.particles.push(el);
      }

      cleanupParticles() {
        this.particles = this.particles.filter(p => {
          if (!p.isConnected) return false;
          const rect = p.getBoundingClientRect();
          if (rect.bottom < -40) { 
            p.remove(); 
            return false; 
          }
          return true;
        });
      }

      destroy() {
        clearInterval(this.addTimer);
        clearInterval(this.cleanupTimer);
        this.particles.forEach(p => p.remove());
        this.particles = [];
      }
    }

    const particleSystem = new DailyThemedParticleSystem();
    
    return () => {
      particleSystem.destroy();
    };
  }, [showParticles]);

  return (
    <div className={`snapfault-layout ${className}`}>
      {/* Global Styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          line-height: 1.45;
        }

        :root {
          --bg: #0a1420;
          --accent: #00ffaa;
          --accent-dim: #66ffcc;
          --brand: #ff4444;
          --text: #ffffff;
          --muted: rgba(255,255,255,.75);
          --panel: rgba(15,25,40,.4);
          --panel-border: rgba(0,255,170,.25);
          --panel-hover: rgba(0,255,170,.08);
          --ring: rgba(0,255,102,.6);
          --shadow: 0 8px 32px rgba(0,0,0,.35);
          --radius: 12px;
          --gap: 40px;
          --particle-color: #00ffaa;
          --particle-glow: rgba(0, 255, 170, 0.6);
          --particle-secondary: #66ffcc;
          --particle-secondary-glow: rgba(102, 255, 204, 0.45);
        }

        /* Daily particle themes */
        .theme-tuesday {
          --particle-color: #00ffff;
          --particle-glow: rgba(0, 255, 255, 0.6);
          --particle-secondary: #66ffff;
          --particle-secondary-glow: rgba(102, 255, 255, 0.45);
        }

        .theme-wednesday {
          --particle-color: #ff8800;
          --particle-glow: rgba(255, 136, 0, 0.6);
          --particle-secondary: #ffaa44;
          --particle-secondary-glow: rgba(255, 170, 68, 0.45);
        }

        .theme-thursday {
          --particle-color: #ff4444;
          --particle-glow: rgba(255, 68, 68, 0.6);
          --particle-secondary: #ff6666;
          --particle-secondary-glow: rgba(255, 102, 102, 0.45);
        }

        .theme-friday {
          --particle-color: #aa44ff;
          --particle-glow: rgba(170, 68, 255, 0.6);
          --particle-secondary: #cc66ff;
          --particle-secondary-glow: rgba(204, 102, 255, 0.45);
        }

        .theme-saturday {
          --particle-color: #ffff00;
          --particle-glow: rgba(255, 255, 0, 0.6);
          --particle-secondary: #ffff66;
          --particle-secondary-glow: rgba(255, 255, 102, 0.45);
        }

        .theme-sunday {
          --particle-color: #4488ff;
          --particle-glow: rgba(68, 136, 255, 0.6);
          --particle-secondary: #66aaff;
          --particle-secondary-glow: rgba(102, 170, 255, 0.45);
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--particle-color);
          width: 2px;
          height: 2px;
          opacity: .8;
          box-shadow: 0 0 4px var(--particle-glow);
          animation: particleFloat 20s linear infinite;
          will-change: transform, opacity;
        }

        .particle.medium {
          width: 3px;
          height: 3px;
          opacity: .6;
          animation-duration: 25s;
        }

        .particle.large {
          width: 4px;
          height: 4px;
          background: var(--particle-secondary);
          opacity: .45;
          animation-duration: 30s;
          box-shadow: 0 0 6px var(--particle-secondary-glow);
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0);
            opacity: 0;
          }
          5% { opacity: .8; }
          95% { opacity: .8; }
          100% {
            transform: translateY(-20vh) translateX(30px) rotate(180deg);
            opacity: 0;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Focus styles */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,.05);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--accent-dim);
        }
      `}</style>

      {/* Background Layers */}
      {showParticles && (
        <>
          <div className="particle-background" aria-hidden="true" />
          <div className="floating-particles" id="particleContainer" aria-hidden="true" />
        </>
      )}

      {/* Main Content */}
      <main className="layout-content">
        {children}
      </main>

      {/* Layout Styles */}
      <style jsx>{`
        .snapfault-layout {
          min-height: 100vh;
          position: relative;
        }

        .particle-background {
          position: fixed;
          inset: 0;
          z-index: -1000;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(0,100,150,.05) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(0,80,120,.04) 0%, transparent 50%),
            var(--bg);
          pointer-events: none;
        }

        .floating-particles {
          position: fixed;
          inset: 0;
          z-index: -999;
          pointer-events: none;
          overflow: hidden;
        }

        .layout-content {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Layout;