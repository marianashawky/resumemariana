(() => {
  const year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const navLinks = [...document.querySelectorAll(".nav a, .mobile-nav a")];
  const sections = [...document.querySelectorAll("section[id]")];
  const progress = document.querySelector(".scroll-progress");
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");

  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };

  const onScrollProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${value}%`;
  };

  window.addEventListener(
    "scroll",
    () => {
      onScrollHeader();
      onScrollProgress();
      setActiveNav();
    },
    { passive: true }
  );
  onScrollHeader();
  onScrollProgress();

  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      mobileNav.setAttribute("hidden", "");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    };

    const openMenu = () => {
      mobileNav.removeAttribute("hidden");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("nav-open");
    };

    menuToggle.addEventListener("click", () => {
      const open = mobileNav.hasAttribute("hidden");
      if (open) openMenu();
      else closeMenu();
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  function setActiveNav() {
    const pos = window.scrollY + 140;
    let current = "home";
    for (const section of sections) {
      if (pos >= section.offsetTop) current = section.id;
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href === `#${current}`);
    });
  }
  setActiveNav();

  // Split hero name into characters
  const splitTarget = document.querySelector("[data-split]");
  if (splitTarget) {
    splitTarget.querySelectorAll(".line").forEach((line) => {
      const text = line.textContent || "";
      line.textContent = "";
      [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.transitionDelay = `${0.08 + index * 0.035}s`;
        line.appendChild(span);
      });
    });

    requestAnimationFrame(() => {
      splitTarget.classList.add("is-ready");
    });
  }

  // Typing role rotation
  const roleEl = document.querySelector(".role-type");
  if (roleEl && !reduceMotion) {
    const words = (roleEl.getAttribute("data-words") || "").split(",").map((w) => w.trim()).filter(Boolean);
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = words[wordIndex] || "";
      if (!deleting) {
        charIndex += 1;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex >= current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex -= 1;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(tick, deleting ? 28 : 55);
    };
    tick();
  } else if (roleEl) {
    roleEl.textContent = "Angular Frontend Developer";
  }

  // Scroll reveals
  const reveals = [...document.querySelectorAll(".reveal")];
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("in"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Custom cursor + magnetic + tilt
  if (!reduceMotion && isFinePointer) {
    document.body.classList.add("has-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;

    window.addEventListener(
      "pointermove",
      (event) => {
        mx = event.clientX;
        my = event.clientY;
        if (cursorDot) {
          cursorDot.style.opacity = "1";
          cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        }
        if (cursor) cursor.style.opacity = "1";
      },
      { passive: true }
    );

    const animateCursor = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      if (cursor) cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll("a, button, .skill-block, .project-media").forEach((el) => {
      el.addEventListener("pointerenter", () => cursor?.classList.add("is-hover"));
      el.addEventListener("pointerleave", () => cursor?.classList.remove("is-hover"));
    });

    // Magnetic buttons
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });

    // 3D tilt cards
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 10;
        el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });

    // Orb parallax
    const orbs = [...document.querySelectorAll(".orb")];
    window.addEventListener(
      "pointermove",
      (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 24;
        const y = (event.clientY / window.innerHeight - 0.5) * 18;
        orbs.forEach((orb, index) => {
          const factor = (index + 1) * 0.45;
          orb.style.translate = `${x * factor}px ${y * factor}px`;
        });
      },
      { passive: true }
    );
  }
})();
