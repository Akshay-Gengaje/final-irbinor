/**
 * Main application script for IRBINOR website (Revamped)
 * Handles all site-wide interactivity with modern practices.
 *
 * 1. Header scroll effects
 * 2. Mobile sidebar navigation & services accordion
 * 3. Theme (dark/light mode) switching
 * 4. Gallery slider functionality
 * 5. Reveal elements on scroll using Intersection Observer
 * 6. Smooth scrolling for anchor links
 * 7. Active navigation link highlighting on scroll
 * 8. FAQ Accordion
 */
document.addEventListener("DOMContentLoaded", () => {
  const doc = document.documentElement;
  const body = document.body;
  const header = document.getElementById("main-header");
  const navLinks = document.querySelectorAll(".nav-link");

  // --- 1. Header Scroll Effect ---
  const handleScroll = () => {
    header.classList.toggle("header-scrolled", window.scrollY > 50);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });

  // --- 2. Mobile Sidebar & Accordion ---
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("mobile-menu");
  const overlay = document.getElementById("sidebar-overlay");
  const closeBtn = document.getElementById("sidebar-close-btn");

  const toggleSidebar = () => {
    const isSidebarOpen = !sidebar.classList.contains("translate-x-full");
    sidebar.classList.toggle("translate-x-full", isSidebarOpen);
    overlay.classList.toggle("opacity-0", isSidebarOpen);
    overlay.classList.toggle("pointer-events-none", isSidebarOpen);
    body.classList.toggle("overflow-hidden", !isSidebarOpen);
    menuBtn.setAttribute("aria-expanded", String(!isSidebarOpen));
  };

  if (menuBtn && sidebar && overlay && closeBtn) {
    menuBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);
    closeBtn.addEventListener("click", toggleSidebar);
    
    // Close sidebar on any link click within it
    sidebar.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', (e) => {
            // Only close if it's a direct link, not the accordion toggle
            if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('#')) {
                 if (!sidebar.classList.contains('translate-x-full')) {
                    setTimeout(toggleSidebar, 300); // Add a small delay for better UX
                }
            }
        });
    });

    const mobileServicesToggle = document.getElementById("mobile-services-toggle");
    const mobileServicesSubmenu = document.getElementById("mobile-services-submenu");
    const mobileServicesChevron = document.getElementById("mobile-services-chevron");

    if (mobileServicesToggle) {
      mobileServicesToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = mobileServicesToggle.getAttribute("aria-expanded") === "true";
        mobileServicesToggle.setAttribute("aria-expanded", String(!isExpanded));
        mobileServicesSubmenu.style.maxHeight = isExpanded ? null : `${mobileServicesSubmenu.scrollHeight}px`;
        mobileServicesChevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      });
    }
  }

  // --- 3. Theme Toggler ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    const darkIcon = document.getElementById("theme-toggle-dark-icon");
    const lightIcon = document.getElementById("theme-toggle-light-icon");
    
    const applyTheme = (theme, store = false) => {
      doc.classList.toggle("dark", theme === "dark");
      darkIcon.classList.toggle("hidden", theme !== "dark");
      lightIcon.classList.toggle("hidden", theme === "dark");
      if (store) localStorage.setItem("theme", theme);
    };

    applyTheme(localStorage.getItem("theme") || "light");

    themeToggleBtn.addEventListener("click", () => {
      const newTheme = doc.classList.contains("dark") ? "light" : "dark";
      applyTheme(newTheme, true);
    });
  }

  // --- 4. Gallery Slider ---
  const gallerySlider = document.getElementById("gallery-slider");
  if (gallerySlider) {
    const images = [
      { avif: "./assets/images/carousel/corporate-conference-event.avif", webp: "./assets/images/carousel/corporate-conference-event.webp", fallback: "./assets/images/carousel/corporate-conference-event.jpg", alt: "Corporate conference event setup" },
      { avif: "./assets/images/carousel/event-at-sea-side.avif", webp: "./assets/images/carousel/event-at-sea-side.webp", fallback: "./assets/images/carousel/event-at-sea-side.jpg", alt: "Seaside event setup" },
      { avif: "./assets/images/carousel/stage-decoration-at-event.avif", webp: "./assets/images/carousel/stage-decoration-at-event.webp", fallback: "./assets/images/carousel/stage-decoration-at-event.jpg", alt: "Decorated event stage" },
      { avif: "./assets/images/carousel/tent-outdoor-event-managment.avif", webp: "./assets/images/carousel/tent-outdoor-event-managment.webp", fallback: "./assets/images/carousel/tent-outdoor-event-managment.jpg", alt: "Outdoor event tent" },
    ];
    let currentIndex = 0;

    gallerySlider.innerHTML = images.map((img, index) => `
      <div class="absolute w-full h-full transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}">
        <picture>
          <source srcset="${img.avif}" type="image/avif">
          <source srcset="${img.webp}" type="image/webp">
          <img src="${img.fallback}" alt="${img.alt}" class="w-full h-full object-cover rounded-2xl shadow-xl" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/1200x800/333/fff?text=Image+Not+Found';">
        </picture>
      </div>
    `).join('');

    const slides = gallerySlider.querySelectorAll("div");
    const prevBtn = document.getElementById("gallery-prev");
    const nextBtn = document.getElementById("gallery-next");

    const updateSlider = (newIndex) => {
      slides[currentIndex].classList.remove('opacity-100');
      currentIndex = (newIndex + slides.length) % slides.length;
      slides[currentIndex].classList.add('opacity-100');
    };

    if(prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => updateSlider(currentIndex - 1));
        nextBtn.addEventListener("click", () => updateSlider(currentIndex + 1));
    }
    
    setInterval(() => updateSlider(currentIndex + 1), 5000);
  }

  // --- 5. Reveal on Scroll ---
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- 6. Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1 && document.querySelector(targetId)) {
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // --- 7. Active Nav Link Highlighting ---
  const sections = document.querySelectorAll("main section[id]");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: "-30% 0px -70% 0px" });

  if(sections.length > 0 && navLinks.length > 0){
    sections.forEach(section => sectionObserver.observe(section));
  }
  
  // --- 8. FAQ Accordion ---
  const faqToggles = document.querySelectorAll('.faq-question');
  faqToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
          const answer = toggle.nextElementSibling;
          const iconSvg = toggle.querySelector('svg');
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

          // Close all other open FAQs before opening the new one
          faqToggles.forEach(otherToggle => {
              if (otherToggle !== toggle) {
                  otherToggle.setAttribute('aria-expanded', 'false');
                  otherToggle.nextElementSibling.style.maxHeight = null;
                  otherToggle.querySelector('svg').style.transform = 'rotate(0deg)';
              }
          });

          // Toggle the clicked FAQ
          toggle.setAttribute('aria-expanded', String(!isExpanded));
          answer.style.maxHeight = isExpanded ? null : `${answer.scrollHeight}px`;
          iconSvg.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(45deg)';
      });
  });
});
