import { useEffect, useRef } from "react";

export default function SiteBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // very lightweight particle dots (same feel as Home)
    const el = containerRef.current;
    const dots = [];
    const max = 60;

    function addDot() {
      if (!el || dots.length >= max) return;
      const d = document.createElement("div");
      d.style.position = "absolute";
      d.style.width = d.style.height = `${2 + Math.floor(Math.random()*3)}px`;
      d.style.left = Math.random()*100 + "%";
      d.style.top = "100%";
      d.style.borderRadius = "50%";
      const colors = ["#00ffaa", "#66ffcc"];
      const c = colors[Math.floor(Math.random()*colors.length)];
      d.style.background = c;
      d.style.boxShadow = `0 0 6px ${c}80`;
      d.style.opacity = "0.7";
      d.style.transform = "translateY(0)";
      d.style.transition = `transform ${16+Math.random()*10}s linear, opacity .8s`;
      el.appendChild(d);
      requestAnimationFrame(() => (d.style.transform = "translateY(-120vh)"));
      dots.push(d);
      setTimeout(() => {
        d.style.opacity = "0";
        setTimeout(() => el.contains(d) && el.removeChild(d), 900);
      }, 16000);
    }

    const bgTimer = setInterval(addDot, 300);
    const initial = setInterval(addDot, 80);
    setTimeout(() => clearInterval(initial), 2000);

    const vis = () => {
      if (document.hidden) clearInterval(bgTimer);
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      clearInterval(bgTimer);
      clearInterval(initial);
      document.removeEventListener("visibilitychange", vis);
      dots.forEach(d => d.remove());
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(0,100,150,.05) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(0,80,120,.04) 0%, transparent 50%), #0a1420",
        }}
      />
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden" }}
      />
    </>
  );
}
