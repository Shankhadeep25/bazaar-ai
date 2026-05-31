export function initInteractions() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. CUSTOM CURSOR
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  
  if (dot && ring) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; 
      my = e.clientY;
      dot.style.left = mx + 'px'; 
      dot.style.top = my + 'px';
    });

    const animateRing = () => {
      rx += (mx - rx) * 0.12; 
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; 
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    };
    animateRing();
  }

  // Set up hover states for all clickable elements
  const setupHoverElements = () => {
    document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
      // Avoid attaching multiple times
      if (!(el as any)._cursorAttached) {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        (el as any)._cursorAttached = true;
      }
    });
  };

  // 2. TEXT SCRAMBLE
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦★';
  const scramble = (el: HTMLElement) => {
    const original = el.innerText;
    let iteration = 0;
    const intervalId = (el as any)._scramble;
    if (intervalId) clearInterval(intervalId);
    
    (el as any)._scramble = setInterval(() => {
      el.innerText = original.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i < iteration) return original[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      if (iteration >= original.length) clearInterval((el as any)._scramble);
      iteration += 0.7;
    }, 28);
  };

  const setupScramble = () => {
    document.querySelectorAll('h1, h2').forEach((el) => {
      if (!el.closest('.chat-page')) scramble(el as HTMLElement);
    });
  };

  // 3. SCROLL FADE-UP
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  const setupReveal = () => {
    document.querySelectorAll('.feature-card, section > *, .hero-content, .step').forEach((el) => {
      if (!el.closest('.chat-page') && !el.classList.contains('reveal')) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      }
    });
  };

  // 4. MAGNETIC BUTTONS
  const setupMagnetic = () => {
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach((btn: any) => {
      if (btn.closest('.chat-page') || btn._magneticAttached) return;
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.25;
        btn.style.transform = `translate(${x}px,${y}px) translateY(-2px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform = 'translate(0,0)';
      });
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.1s linear';
      });
      btn._magneticAttached = true;
    });
  };

  // 5. SECTION BACKGROUND SHIFT
  const bgObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const bg = (e.target as HTMLElement).dataset.bg;
        if (bg) document.body.style.background = bg;
      }
    });
  }, { threshold: 0.5 });

  const setupBgShift = () => {
    document.querySelectorAll('section[data-bg], div[data-bg], header[data-bg]').forEach((s) => {
      if (!(s as any)._bgAttached) {
        bgObserver.observe(s);
        (s as any)._bgAttached = true;
      }
    });
  };

  // Setup everything initially
  const runSetup = () => {
    setupHoverElements();
    setupScramble();
    setupReveal();
    setupMagnetic();
    setupBgShift();
  };
  
  runSetup();

  // Re-run setup occasionally or listen to mutations since React re-renders
  const observer = new MutationObserver(() => {
    setupHoverElements();
    setupMagnetic();
    setupReveal();
    setupBgShift();
    
    // Chat cursor logic
    const chatPage = document.querySelector('.chat-page');
    if (chatPage && !(chatPage as any)._cursorHandled && dot && ring) {
      chatPage.addEventListener('mouseenter', () => {
        dot.style.opacity = '0'; 
        ring.style.opacity = '0';
        document.body.style.cursor = 'auto';
      });
      chatPage.addEventListener('mouseleave', () => {
        dot.style.opacity = '1'; 
        ring.style.opacity = '1';
        document.body.style.cursor = 'none';
      });
      (chatPage as any)._cursorHandled = true;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
