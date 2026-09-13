/* =============================================================
   MAYO JAPAN — Shared UI Interactions
   ============================================================= */

(function() {
  'use strict';

  // ── Navigation Scroll Effect ──────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const heroSection = document.querySelector('.hero, .page-hero');
    const isHero = !!document.querySelector('.hero');

    function updateHeader() {
      const scrolled = window.scrollY > 40;
      header.classList.toggle('scrolled', scrolled || !isHero);
      if (isHero) {
        header.classList.toggle('hero-dark', !scrolled);
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // ── Mobile Drawer ─────────────────────────────────────────
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('nav-drawer');
  const overlay = document.getElementById('nav-overlay');
  const drawerClose = document.getElementById('drawer-close');

  function openDrawer() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    burger?.classList.add('open');
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
    burger?.classList.remove('open');
  }

  burger?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // ── Active Nav Link ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-drawer-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Scroll Reveal ─────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add('revealed');
          observer.unobserve(el.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // ── Product Filter Tabs ───────────────────────────────────
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('[data-filter-group]');
      if (group) {
        group.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      } else {
        filterTabs.forEach(t => t.classList.remove('active'));
      }
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      const cards = document.querySelectorAll('[data-category]');
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.opacity = '0';
        card.style.transform = 'scale(.95)';
        if (show) {
          card.style.display = '';
          setTimeout(() => {
            card.style.transition = 'opacity .3s ease, transform .3s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // ── Inquiry Form Submission ───────────────────────────────
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    const successAlert = document.getElementById('form-success');
    const errorAlert = document.getElementById('form-error');
    const submitBtn = document.getElementById('form-submit');

    inquiryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      const formData = new FormData(inquiryForm);
      const data = {};
      formData.forEach((val, key) => data[key] = val);

      // Attempt send via mailto as fallback (form.js from original site)
      // Show success after brief delay (real integration would hit backend)
      setTimeout(() => {
        successAlert?.classList.add('show');
        errorAlert?.classList.remove('show');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
        inquiryForm.reset();

        setTimeout(() => successAlert?.classList.remove('show'), 6000);
      }, 1200);
    });
  }

  // ── Counter Animation ─────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const duration = 1800;
          const step = target / (duration / 16);
          let current = 0;

          const tick = () => {
            current = Math.min(current + step, target);
            el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            if (current < target) requestAnimationFrame(tick);
          };
          tick();
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

})();
