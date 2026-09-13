/* =============================================================
   MAYO JAPAN — Cinematic Hero Video Engine
   Creates a full-screen autoplay "video" experience using
   canvas rendering: Ken Burns panning, crossfade transitions,
   floating salt crystal particles, and logo overlay.
   ============================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-video-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, dpr;

  /* ── Configuration ─────────────────────────────────────────── */
  const CONFIG = {
    slideDuration: 8000,       // ms per slide
    crossfadeDuration: 2000,   // ms crossfade overlap
    panRange: 0.08,            // max pan offset as fraction of size
    zoomRange: [1.05, 1.18],   // min/max zoom
    particleCount: 55,
    particleColor: 'rgba(232,160,160,',   // blush tint
    vignetteOpacity: 0.55,
    logoSize: 0.12,            // logo width as fraction of canvas width
  };

  /* ── State ──────────────────────────────────────────────────── */
  const images = [];
  let logo = null;
  let currentSlide = 0;
  let slideStart = 0;
  let particles = [];
  let running = false;

  /* ── Resize ─────────────────────────────────────────────────── */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.parentElement.clientWidth;
    H = canvas.parentElement.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);

  /* ── Image Loading ──────────────────────────────────────────── */
  const imageSources = [
    'img/hero-bg-1.png',
    'img/hero-bg-2.png',
    'https://mayojapan.com/img/nat01.jpg',
    'https://mayojapan.com/img/room01.jpg',
  ];

  let loaded = 0;
  const totalToLoad = imageSources.length + 1; // +1 for logo

  function onLoad() {
    loaded++;
    if (loaded >= 2 && !running) {   // start after 2 images loaded
      running = true;
      slideStart = performance.now();
      initParticles();
      resize();
      requestAnimationFrame(render);
    }
  }

  imageSources.forEach(src => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = onLoad;
    img.onerror = () => {
      // fallback — create gradient-filled canvas
      const fallback = document.createElement('canvas');
      fallback.width = 1920; fallback.height = 1080;
      const fctx = fallback.getContext('2d');
      const g = fctx.createLinearGradient(0, 0, 1920, 1080);
      g.addColorStop(0, '#1E0A14');
      g.addColorStop(0.5, '#3D1525');
      g.addColorStop(1, '#5A1E30');
      fctx.fillStyle = g;
      fctx.fillRect(0, 0, 1920, 1080);
      images.push(fallback);
      onLoad();
    };
    img.src = src;
    images.push(img);
  });

  // Logo
  logo = new Image();
  logo.crossOrigin = 'anonymous';
  logo.onload = onLoad;
  logo.onerror = () => { logo = null; onLoad(); };
  logo.src = 'https://mayojapan.com/img/logo2.png';

  /* ── Particles ──────────────────────────────────────────────── */
  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        r: 1 + Math.random() * 3,
        speed: 0.0002 + Math.random() * 0.0006,
        opacity: 0.15 + Math.random() * 0.45,
        drift: (Math.random() - 0.5) * 0.0003,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawParticles(t) {
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift + Math.sin(t * 0.0008 + p.phase) * 0.00015;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < -0.02) p.x = 1.02;
      if (p.x > 1.02) p.x = -0.02;

      const px = p.x * W;
      const py = p.y * H;
      const flicker = 0.7 + 0.3 * Math.sin(t * 0.002 + p.phase);

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.particleColor + (p.opacity * flicker).toFixed(3) + ')';
      ctx.fill();
    });
  }

  /* ── Drawing Helpers ────────────────────────────────────────── */
  function drawImageCover(img, zoom, panX, panY, alpha) {
    if (!img || !img.width) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    const imgAR = img.width / img.height;
    const canvasAR = W / H;
    let drawW, drawH;

    if (imgAR > canvasAR) {
      drawH = H * zoom;
      drawW = drawH * imgAR;
    } else {
      drawW = W * zoom;
      drawH = drawW / imgAR;
    }

    const x = (W - drawW) / 2 + panX * W;
    const y = (H - drawH) / 2 + panY * H;

    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();
  }

  function drawVignette() {
    const gradient = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.85);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(10,4,6,' + CONFIG.vignetteOpacity + ')');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  function drawColorOverlay() {
    ctx.fillStyle = 'rgba(30,10,20,0.35)';
    ctx.fillRect(0, 0, W, H);
  }

  function drawLogo(t) {
    if (!logo || !logo.width) return;

    const logoW = W * CONFIG.logoSize;
    const logoH = logoW * (logo.height / logo.width);
    const x = W - logoW - 32;
    const y = H - logoH - 32;

    // Subtle breathing pulse
    const pulse = 0.85 + 0.15 * Math.sin(t * 0.001);

    ctx.save();
    ctx.globalAlpha = 0.7 * pulse;
    ctx.shadowColor = 'rgba(232,160,160,0.4)';
    ctx.shadowBlur = 20;
    ctx.drawImage(logo, x, y, logoW, logoH);
    ctx.restore();
  }

  function drawFilmGrain(t) {
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 300; i++) {
      const gx = Math.random() * W;
      const gy = Math.random() * H;
      ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.restore();
  }

  /* ── Easing ─────────────────────────────────────────────────── */
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /* ── Render Loop ────────────────────────────────────────────── */
  function render(time) {
    if (!running) return;

    ctx.clearRect(0, 0, W, H);

    const totalDuration = CONFIG.slideDuration;
    const elapsed = time - slideStart;
    const progress = Math.min(elapsed / totalDuration, 1);

    // Current slide
    const idx = currentSlide % images.length;
    const nextIdx = (currentSlide + 1) % images.length;

    // Ken Burns: slow zoom + pan
    const zoomEased = easeInOutQuad(progress);
    const zoom = CONFIG.zoomRange[0] + (CONFIG.zoomRange[1] - CONFIG.zoomRange[0]) * zoomEased;
    const panX = CONFIG.panRange * Math.sin(progress * Math.PI) * (idx % 2 === 0 ? 1 : -1);
    const panY = CONFIG.panRange * 0.5 * Math.cos(progress * Math.PI * 0.7) * (idx % 2 === 0 ? -1 : 1);

    // Crossfade transition at end
    const fadeStart = 1 - CONFIG.crossfadeDuration / totalDuration;
    let currentAlpha = 1;
    let nextAlpha = 0;

    if (progress > fadeStart) {
      const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
      const easedFade = easeInOutQuad(fadeProgress);
      currentAlpha = 1 - easedFade;
      nextAlpha = easedFade;

      // Next slide with slight zoom-in
      const nextZoom = CONFIG.zoomRange[0];
      const nextPanX = CONFIG.panRange * 0.5 * (nextIdx % 2 === 0 ? -1 : 1);
      drawImageCover(images[nextIdx], nextZoom, nextPanX, 0, nextAlpha);
    }

    // Current slide
    drawImageCover(images[idx], zoom, panX, panY, currentAlpha);

    // Slide change
    if (progress >= 1) {
      currentSlide = (currentSlide + 1) % images.length;
      slideStart = time;
    }

    // Overlays
    drawColorOverlay();
    drawVignette();
    drawParticles(time);
    drawFilmGrain(time);
    drawLogo(time);

    requestAnimationFrame(render);
  }

})();
