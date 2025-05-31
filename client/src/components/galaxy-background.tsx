import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  color: string;
}

interface CosmicDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: Star[] = [];
    const nebulaClouds: NebulaCloud[] = [];
    const cosmicDust: CosmicDust[] = [];
    const shootingStars: ShootingStar[] = [];

    const starCount = 300;
    const nebulaCount = 12;
    const dustCount = 150;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 0.08 + 0.02, // Much faster twinkling
        twinklePhase: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#fff8dc', '#e6e6fa', '#ffd700', '#87ceeb'][Math.floor(Math.random() * 5)]
      });
    }

    // Create nebula clouds
    for (let i = 0; i < nebulaCount; i++) {
      nebulaClouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 150 + 50,
        opacity: Math.random() * 0.3 + 0.1,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02, // Much faster rotation
        pulsePhase: Math.random() * Math.PI * 2,
        color: ['#4b0082', '#8b008b', '#483d8b', '#6a5acd', '#9370db'][Math.floor(Math.random() * 5)]
      });
    }

    // Create cosmic dust
    for (let i = 0; i < dustCount; i++) {
      cosmicDust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2, // Faster movement
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.9 + 0.3,
        life: Math.random() * 1000,
        maxLife: 1000
      });
    }

    const createShootingStar = () => {
      if (Math.random() < 0.008) { // More frequent shooting stars
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: Math.random() * 8 + 4, // Much faster
          vy: Math.random() * 4 + 2,
          length: Math.random() * 80 + 50, // Longer trails
          opacity: 1,
          life: Math.random() * 150 + 80 // Longer lasting
        });
      }
    };

    const drawNebula = (cloud: NebulaCloud) => {
      ctx.save();
      ctx.translate(cloud.x, cloud.y);
      ctx.rotate(cloud.rotation);
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radius);
      const baseOpacity = cloud.opacity * (0.8 + 0.4 * Math.sin(cloud.pulsePhase));
      
      gradient.addColorStop(0, cloud.color + Math.floor(baseOpacity * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.3, cloud.color + Math.floor(baseOpacity * 0.6 * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.7, cloud.color + Math.floor(baseOpacity * 0.3 * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, cloud.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-cloud.radius, -cloud.radius, cloud.radius * 2, cloud.radius * 2);
      ctx.restore();
    };

    const drawStar = (star: Star) => {
      const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
      const currentBrightness = star.brightness * twinkle;
      
      ctx.save();
      ctx.globalAlpha = currentBrightness;
      
      // Create star glow
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
      gradient.addColorStop(0, star.color);
      gradient.addColorStop(0.2, star.color + '80');
      gradient.addColorStop(1, star.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(star.x - star.size * 3, star.y - star.size * 3, star.size * 6, star.size * 6);
      
      // Draw star core
      ctx.fillStyle = star.color;
      ctx.fillRect(star.x - star.size/2, star.y - star.size/2, star.size, star.size);
      
      // Add sparkle effect for larger stars
      if (star.size > 2) {
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(star.x - star.size * 2, star.y);
        ctx.lineTo(star.x + star.size * 2, star.y);
        ctx.moveTo(star.x, star.y - star.size * 2);
        ctx.lineTo(star.x, star.y + star.size * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawShootingStar = (shootingStar: ShootingStar) => {
      ctx.save();
      ctx.globalAlpha = shootingStar.opacity;
      
      const gradient = ctx.createLinearGradient(
        shootingStar.x, shootingStar.y,
        shootingStar.x - shootingStar.vx * shootingStar.length / 5, 
        shootingStar.y - shootingStar.vy * shootingStar.length / 5
      );
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#ffd700');
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(
        shootingStar.x - shootingStar.vx * shootingStar.length / 5,
        shootingStar.y - shootingStar.vy * shootingStar.length / 5
      );
      ctx.stroke();
      
      ctx.restore();
    };

    const animate = () => {
      // Create deep space background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, '#000011');
      bgGradient.addColorStop(0.5, '#000033');
      bgGradient.addColorStop(1, '#001122');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nebula clouds
      nebulaClouds.forEach((cloud) => {
        cloud.rotation += cloud.rotationSpeed;
        cloud.pulsePhase += 0.08; // Faster pulsing
        // Add floating movement to nebula clouds
        cloud.x += Math.sin(cloud.pulsePhase * 0.5) * 0.3;
        cloud.y += Math.cos(cloud.pulsePhase * 0.3) * 0.2;
        drawNebula(cloud);
      });

      // Update and draw cosmic dust
      cosmicDust.forEach((dust, index) => {
        dust.x += dust.vx;
        dust.y += dust.vy;
        dust.life--;
        
        if (dust.x < 0) dust.x = canvas.width;
        if (dust.x > canvas.width) dust.x = 0;
        if (dust.y < 0) dust.y = canvas.height;
        if (dust.y > canvas.height) dust.y = 0;
        
        if (dust.life <= 0) {
          dust.life = dust.maxLife;
          dust.opacity = Math.random() * 0.8 + 0.2;
        }
        
        ctx.save();
        ctx.globalAlpha = dust.opacity * (dust.life / dust.maxLife);
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(dust.x, dust.y, dust.size, dust.size);
        ctx.restore();
      });

      // Update and draw stars
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        drawStar(star);
      });

      // Create and manage shooting stars
      createShootingStar();
      
      // Update and draw shooting stars
      shootingStars.forEach((shootingStar, index) => {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life--;
        shootingStar.opacity = shootingStar.life / 100;
        
        if (shootingStar.life <= 0 || shootingStar.x > canvas.width || shootingStar.y > canvas.height) {
          shootingStars.splice(index, 1);
        } else {
          drawShootingStar(shootingStar);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}