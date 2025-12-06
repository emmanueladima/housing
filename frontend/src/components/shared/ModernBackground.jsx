import { useEffect, useRef, useState } from 'react';

const ModernBackground = () => {
  const containerRef = useRef(null);
  const orbElementsRef = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simplified orb configuration - smaller on mobile
  const orbsStateRef = useRef([
    {
      x: 75, y: 85, vx: 0, vy: 0,
      baseSize: 400, size: 400, color: 'rgba(250, 204, 21, 1)',
      baseOpacity: 0.5, opacity: 0.5,
      temperature: 0.2, tempCycleSpeed: 0.03, tempPhase: 0,
      driftPhase: 0, driftSpeed: 0.05,
      sizeVariation: 60, morphSpeed: 0.04, morphPhase: 0
    },
    {
      x: 60, y: 60, vx: 0, vy: 0,
      baseSize: 450, size: 450, color: 'rgba(245, 158, 11, 1)',
      baseOpacity: 0.45, opacity: 0.45,
      temperature: 0.5, tempCycleSpeed: 0.025, tempPhase: Math.PI / 3,
      driftPhase: Math.PI / 2, driftSpeed: 0.06,
      sizeVariation: 70, morphSpeed: 0.05, morphPhase: Math.PI
    },
    {
      x: 80, y: 40, vx: 0, vy: 0,
      baseSize: 350, size: 350, color: 'rgba(253, 224, 71, 1)',
      baseOpacity: 0.55, opacity: 0.55,
      temperature: 0.8, tempCycleSpeed: 0.035, tempPhase: Math.PI * 0.66,
      driftPhase: Math.PI, driftSpeed: 0.045,
      sizeVariation: 50, morphSpeed: 0.045, morphPhase: Math.PI * 1.5
    },
  ]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Skip animation on mobile for performance
    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize orb DOM elements with starting positions
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

    // Animation loop - only runs on desktop
    const animationLoop = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const orbs = orbsStateRef.current;
      const time = Date.now() * 0.001;

      orbs.forEach((orb, index) => {
        // Temperature cycling
        orb.temperature = 0.5 + 0.5 * Math.sin(time * orb.tempCycleSpeed + orb.tempPhase);

        // Thermal buoyancy
        const buoyancyForce = (orb.temperature - 0.5) * -0.015;
        orb.vy += buoyancyForce;

        // Horizontal drift
        const driftForce = Math.sin(time * orb.driftSpeed + orb.driftPhase) * 0.005;
        orb.vx += driftForce;

        // Cursor interaction
        const orbX = rect.left + (rect.width * orb.x / 100);
        const orbY = rect.top + (rect.height * orb.y / 100);
        const deltaX = mouseRef.current.x - orbX;
        const deltaY = mouseRef.current.y - orbY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const repulsionRadius = 300;
        if (distance < repulsionRadius && distance > 0) {
          const force = (repulsionRadius - distance) / repulsionRadius;
          const repulsionStrength = 0.03;
          orb.vx -= (deltaX / distance) * force * repulsionStrength;
          orb.vy -= (deltaY / distance) * force * repulsionStrength;
        }

        // Friction
        orb.vx *= 0.99;
        orb.vy *= 0.99;

        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Boundary bouncing
        const orbSizePercent = (orb.size / rect.width) * 100 / 2;
        const minX = Math.max(orbSizePercent, 8);
        const maxX = 100 - Math.max(orbSizePercent, 8);
        const minY = Math.max(orbSizePercent, 8);
        const maxY = 100 - Math.max(orbSizePercent, 8);

        const restitution = 0.7;
        const minVelocity = 0.05;

        if (orb.x < minX) {
          orb.x = minX;
          orb.vx = Math.abs(orb.vx) * restitution;
          if (orb.vx < minVelocity) orb.vx = minVelocity;
        } else if (orb.x > maxX) {
          orb.x = maxX;
          orb.vx = -Math.abs(orb.vx) * restitution;
          if (orb.vx > -minVelocity) orb.vx = -minVelocity;
        }

        if (orb.y < minY) {
          orb.y = minY;
          orb.vy = Math.abs(orb.vy) * restitution;
          if (orb.vy < minVelocity) orb.vy = minVelocity;
        } else if (orb.y > maxY) {
          orb.y = maxY;
          orb.vy = -Math.abs(orb.vy) * restitution;
          if (orb.vy > -minVelocity) orb.vy = -minVelocity;
        }

        // Size morphing
        const sizeModulation = Math.sin(time * orb.morphSpeed + orb.morphPhase);
        orb.size = orb.baseSize + (orb.sizeVariation * sizeModulation * orb.temperature);

        // Opacity morphing
        const opacityModulation = Math.sin(time * orb.morphSpeed * 0.7 + orb.morphPhase);
        orb.opacity = Math.max(0.35, orb.baseOpacity + (0.08 * opacityModulation));

        // Update DOM
        const orbElement = orbElementsRef.current[index];
        if (orbElement) {
          orbElement.style.left = `${orb.x}%`;
          orbElement.style.top = `${orb.y}%`;
          orbElement.style.width = `${orb.size}px`;
          orbElement.style.height = `${orb.size}px`;
          orbElement.style.opacity = orb.opacity;
        }
      });

      requestAnimationFrame(animationLoop);
    };

    const animationId = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isMobile]);

  // Mobile: Simple static gradient (no animation for performance)
  if (isMobile) {
    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-orange-700" />

        {/* Static decorative elements - no animation */}
        <div
          className="absolute rounded-full"
          style={{
            top: '20%',
            right: '-10%',
            width: '60vw',
            height: '60vw',
            maxWidth: '300px',
            maxHeight: '300px',
            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, rgba(250, 204, 21, 0.2) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '10%',
            left: '-5%',
            width: '50vw',
            height: '50vw',
            maxWidth: '250px',
            maxHeight: '250px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0.15) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: '50%',
            left: '30%',
            width: '40vw',
            height: '40vw',
            maxWidth: '200px',
            maxHeight: '200px',
            background: 'radial-gradient(circle, rgba(253, 224, 71, 0.3) 0%, rgba(253, 224, 71, 0.15) 40%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </div>
    );
  }

  // Desktop: Animated lava lamp effect
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
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-orange-700" />

      {/* Animated Orbs - Desktop only */}
      {orbsStateRef.current.map((orb, index) => (
        <div
          key={index}
          ref={(el) => (orbElementsRef.current[index] = el)}
          className="absolute rounded-full will-change-transform"
          style={{
            background: `radial-gradient(circle, ${orb.color} 0%, ${orb.color.replace('1)', '0.5)')} 40%, transparent 70%)`,
            filter: 'blur(48px)',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      ))}
    </div>
  );
};

export default ModernBackground;
