import { useEffect, useRef } from 'react';

const ModernBackground = () => {
  const containerRef = useRef(null);
  const orbElementsRef = useRef([]);
  const orbsStateRef = useRef([
    { 
      x: 75, y: 85, vx: 0, vy: 0, 
      baseSize: 600, size: 600, color: 'rgba(250, 204, 21, 1)', 
      baseOpacity: 0.5, opacity: 0.5, 
      temperature: 0.2, tempCycleSpeed: 0.03, tempPhase: 0,
      driftPhase: 0, driftSpeed: 0.05,
      sizeVariation: 100, morphSpeed: 0.04, morphPhase: 0
    },
    { 
      x: 60, y: 60, vx: 0, vy: 0, 
      baseSize: 700, size: 700, color: 'rgba(245, 158, 11, 1)', 
      baseOpacity: 0.45, opacity: 0.45,
      temperature: 0.5, tempCycleSpeed: 0.025, tempPhase: Math.PI / 3,
      driftPhase: Math.PI / 2, driftSpeed: 0.06,
      sizeVariation: 120, morphSpeed: 0.05, morphPhase: Math.PI
    },
    { 
      x: 80, y: 40, vx: 0, vy: 0, 
      baseSize: 550, size: 550, color: 'rgba(253, 224, 71, 1)', 
      baseOpacity: 0.55, opacity: 0.55,
      temperature: 0.8, tempCycleSpeed: 0.035, tempPhase: Math.PI * 0.66,
      driftPhase: Math.PI, driftSpeed: 0.045,
      sizeVariation: 90, morphSpeed: 0.045, morphPhase: Math.PI * 1.5
    },
    { 
      x: 40, y: 70, vx: 0, vy: 0, 
      baseSize: 500, size: 500, color: 'rgba(251, 191, 36, 1)', 
      baseOpacity: 0.4, opacity: 0.4,
      temperature: 0.3, tempCycleSpeed: 0.028, tempPhase: Math.PI * 1.2,
      driftPhase: Math.PI * 1.3, driftSpeed: 0.055,
      sizeVariation: 80, morphSpeed: 0.038, morphPhase: Math.PI * 0.5
    },
    { 
      x: 30, y: 20, vx: 0, vy: 0, 
      baseSize: 450, size: 450, color: 'rgba(254, 240, 138, 1)', 
      baseOpacity: 0.5, opacity: 0.5,
      temperature: 0.6, tempCycleSpeed: 0.032, tempPhase: Math.PI * 1.8,
      driftPhase: Math.PI * 1.8, driftSpeed: 0.04,
      sizeVariation: 70, morphSpeed: 0.042, morphPhase: Math.PI * 0.8
    },
  ]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize orb DOM elements with starting positions (one-time only)
    orbsStateRef.current.forEach((orb, index) => {
      const orbElement = orbElementsRef.current[index];
      if (orbElement) {
        orbElement.style.left = `${orb.x}%`;
        orbElement.style.top = `${orb.y}%`;
        orbElement.style.width = `${orb.size}px`;
        orbElement.style.height = `${orb.size}px`;
        orbElement.style.opacity = orb.opacity;
        orbElement.style.transform = `translate(-50%, -50%)`;
      }
    });

    // Lava lamp physics animation loop
    const animationLoop = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const orbs = orbsStateRef.current;
      const time = Date.now() * 0.001; // Convert to seconds
      
      orbs.forEach((orb, index) => {
        // Temperature cycling (sine wave between 0 and 1)
        orb.temperature = 0.5 + 0.5 * Math.sin(time * orb.tempCycleSpeed + orb.tempPhase);
        
        // Thermal buoyancy - hot orbs rise (negative vy), cool orbs fall (positive vy)
        const buoyancyForce = (orb.temperature - 0.5) * -0.015; // Reduced from -0.02
        orb.vy += buoyancyForce;
        
        // Gentle horizontal drift
        const driftForce = Math.sin(time * orb.driftSpeed + orb.driftPhase) * 0.005;
        orb.vx += driftForce;
        
        // Calculate orb position in pixels for cursor interaction
        const orbX = rect.left + (rect.width * orb.x / 100);
        const orbY = rect.top + (rect.height * orb.y / 100);
        
        // Calculate distance to mouse
        const deltaX = mouseRef.current.x - orbX;
        const deltaY = mouseRef.current.y - orbY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Apply cursor repulsion force (when cursor is near)
        const repulsionRadius = 300;
        if (distance < repulsionRadius && distance > 0) {
          const force = (repulsionRadius - distance) / repulsionRadius;
          const repulsionStrength = 0.03; // Gentle repulsion
          orb.vx -= (deltaX / distance) * force * repulsionStrength;
          orb.vy -= (deltaY / distance) * force * repulsionStrength;
        }
        
        // Apply gentle friction (slower dampening for lava lamp effect)
        const friction = 0.99; // Increased from 0.98 for slower deceleration
        orb.vx *= friction;
        orb.vy *= friction;
        
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;
        
        // Simple bouncing physics - orbs bounce off walls
        const orbSizePercent = (orb.size / rect.width) * 100 / 2;
        const minX = 0 + Math.max(orbSizePercent, 8);
        const maxX = 100 - Math.max(orbSizePercent, 8);
        const minY = 0 + Math.max(orbSizePercent, 8);
        const maxY = 100 - Math.max(orbSizePercent, 8);
        
        const restitution = 0.7; // Bounce dampening (keep 70% of velocity)
        const minVelocity = 0.05; // Minimum velocity to prevent sticking
        
        // Bounce off horizontal walls
        if (orb.x < minX) {
          orb.x = minX;
          orb.vx = Math.abs(orb.vx) * restitution;
          if (orb.vx < minVelocity) orb.vx = minVelocity;
        } else if (orb.x > maxX) {
          orb.x = maxX;
          orb.vx = -Math.abs(orb.vx) * restitution;
          if (orb.vx > -minVelocity) orb.vx = -minVelocity;
        }
        
        // Bounce off vertical walls
        if (orb.y < minY) {
          orb.y = minY;
          orb.vy = Math.abs(orb.vy) * restitution;
          if (orb.vy < minVelocity) orb.vy = minVelocity;
        } else if (orb.y > maxY) {
          orb.y = maxY;
          orb.vy = -Math.abs(orb.vy) * restitution;
          if (orb.vy > -minVelocity) orb.vy = -minVelocity;
        }
        
        // Blob morphing - size changes based on temperature
        const sizeModulation = Math.sin(time * orb.morphSpeed + orb.morphPhase);
        orb.size = orb.baseSize + (orb.sizeVariation * sizeModulation * orb.temperature);
        
        // Opacity morphing - subtle pulsing (clamped to prevent disappearing)
        const opacityModulation = Math.sin(time * orb.morphSpeed * 0.7 + orb.morphPhase);
        orb.opacity = Math.max(0.35, orb.baseOpacity + (0.08 * opacityModulation));
        
        // Direct DOM manipulation - update element without React re-render
        const orbElement = orbElementsRef.current[index];
        if (orbElement) {
          orbElement.style.left = `${orb.x}%`;
          orbElement.style.top = `${orb.y}%`;
          orbElement.style.width = `${orb.size}px`;
          orbElement.style.height = `${orb.size}px`;
          orbElement.style.opacity = orb.opacity;
          orbElement.style.transform = `translate(-50%, -50%)`;
        }
      });
      
      requestAnimationFrame(animationLoop);
    };

    const animationId = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden select-none"
      style={{ 
        cursor: 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Orange Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-orange-700"></div>
      
      {/* Lava Lamp Yellow Gradient Orbs */}
      {orbsStateRef.current.map((orb, index) => (
        <div
          key={index}
          ref={(el) => (orbElementsRef.current[index] = el)}
          className="absolute rounded-full blur-3xl will-change-transform"
          style={{
            background: `radial-gradient(circle, ${orb.color} 0%, ${orb.color.replace('1)', '0.5)')} 40%, transparent 70%)`,
            pointerEvents: 'none',
            userSelect: 'none',
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      ))}
    </div>
  );
};

export default ModernBackground;
