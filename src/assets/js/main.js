/**
 * Main application script for handling site-wide interactivity.
 * This consolidated script includes all logic for:
 * 1. Mobile sidebar navigation with services accordion.
 * 2. Header scroll effect.
 * 3. Theme (dark/light mode) switching.
 * 4. Active navigation link highlighting.
 * 5. Circular carousel for the main gallery with optimized images.
 * 6. Revealing elements on scroll.
 * 7. FAQ Accordion.
 * 8. Smooth scrolling for anchor links.
 */
document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const header = document.getElementById("main-header");
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("mobile-menu");
  const overlay = document.getElementById("sidebar-overlay");

  // --- Header Scroll Effect ---
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll);

  // --- Mobile Sidebar Logic ---
  const toggleSidebar = () => {
    if (!sidebar) return;
    const isSidebarOpen = !sidebar.classList.contains("translate-x-full");
    sidebar.classList.toggle("translate-x-full");
    overlay.classList.toggle("opacity-0");
    overlay.classList.toggle("pointer-events-none");
    body.classList.toggle("overflow-hidden", !isSidebarOpen);
    menuBtn.setAttribute("aria-expanded", String(!isSidebarOpen));
  };

  if (menuBtn) {
    menuBtn.addEventListener("click", toggleSidebar);
    closeBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !sidebar.classList.contains("translate-x-full")) {
        toggleSidebar();
      }
    });
  }

  // --- Mobile Services Submenu Accordion ---
  const mobileServicesToggle = document.getElementById("mobile-services-toggle");
  const mobileServicesSubmenu = document.getElementById("mobile-services-submenu");
  const mobileServicesChevron = document.getElementById("mobile-services-chevron");

  if (mobileServicesToggle) {
    mobileServicesToggle.addEventListener("click", () => {
      const isExpanded = mobileServicesToggle.getAttribute("aria-expanded") === "true";
      mobileServicesToggle.setAttribute("aria-expanded", String(!isExpanded));
      if (mobileServicesSubmenu.style.maxHeight) {
        mobileServicesSubmenu.style.maxHeight = null;
        mobileServicesChevron.style.transform = "rotate(0deg)";
      } else {
        mobileServicesSubmenu.style.maxHeight = mobileServicesSubmenu.scrollHeight + "px";
        mobileServicesChevron.style.transform = "rotate(180deg)";
      }
    });
  }

  // --- Close sidebar on link click (if not a submenu toggle) ---
  const allLinks = document.querySelectorAll("#mobile-menu a");
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!sidebar.classList.contains('translate-x-full')) {
        toggleSidebar();
      }
    });
  });


  // --- Theme Toggler ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    const darkIcon = document.getElementById("theme-toggle-dark-icon");
    const lightIcon = document.getElementById("theme-toggle-light-icon");
    const applyTheme = (theme, store = false) => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      darkIcon.classList.toggle("hidden", theme !== "dark");
      lightIcon.classList.toggle("hidden", theme === "dark");
      if (store) localStorage.setItem("theme", theme);
    };
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
    themeToggleBtn.addEventListener("click", () => {
      const newTheme = document.documentElement.classList.contains("dark")
        ? "light"
        : "dark";
      applyTheme(newTheme, true);
    });
  }

  // --- Circular Carousel Gallery ---
  const circularCarousel = document.getElementById("circular-carousel");
  if (circularCarousel) {
    const carouselImages = [
      { avif: "assets/images/carousel/corporate-conference-event.avif", webp: "assets/images/carousel/corporate-conference-event.webp", fallback: "assets/images/carousel/corporate-conference-event.jpg", alt: "Corporate conference event setup" },
      { avif: "assets/images/carousel/event-at-sea-side.avif", webp: "assets/images/carousel/event-at-sea-side.webp", fallback: "assets/images/carousel/event-at-sea-side.jpg", alt: "Seaside event setup" },
      { avif: "assets/images/carousel/stage-decoration-at-event.avif", webp: "assets/images/carousel/stage-decoration-at-event.webp", fallback: "assets/images/carousel/stage-decoration-at-event.jpg", alt: "Decorated event stage" },
      { avif: "assets/images/carousel/tent-outdoor-event-managment.avif", webp: "assets/images/carousel/tent-outdoor-event-managment.webp", fallback: "assets/images/carousel/tent-outdoor-event-managment.jpg", alt: "Outdoor event tent" },
    ];
    const prevBtn = document.getElementById("carousel-prev-btn");
    const nextBtn = document.getElementById("carousel-next-btn");
    let currentIndex = 0;

    circularCarousel.innerHTML = carouselImages.map(img => `
      <div class="carousel-item absolute w-3/4 md:w-1/2 transition-all duration-500 ease-in-out">
        <picture>
          <source srcset="${img.avif}" type="image/avif">
          <source srcset="${img.webp}" type="image/webp">
          <img src="${img.fallback}" alt="${img.alt}" class="w-full h-full object-cover rounded-xl shadow-2xl" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/800x450/333/fff?text=Image+Not+Found';">
        </picture>
      </div>`).join('');

    const items = circularCarousel.querySelectorAll(".carousel-item");
    const totalItems = items.length;

    const updateCarousel = () => {
      items.forEach((item, i) => {
        const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
        const nextIndex = (currentIndex + 1) % totalItems;
        item.style.transform = "translateX(0) scale(0.7)";
        item.style.opacity = "0";
        item.style.zIndex = "0";
        item.style.filter = "blur(5px)";
        if (i === currentIndex) {
          item.style.transform = "translateX(0) scale(1)";
          item.style.opacity = "1";
          item.style.zIndex = "10";
          item.style.filter = "blur(0)";
        } else if (i === prevIndex) {
          item.style.transform = "translateX(-50%) scale(0.8)";
          item.style.opacity = "0.6";
          item.style.zIndex = "5";
          item.style.filter = "blur(3px)";
        } else if (i === nextIndex) {
          item.style.transform = "translateX(50%) scale(0.8)";
          item.style.opacity = "0.6";
          item.style.zIndex = "5";
          item.style.filter = "blur(3px)";
        }
      });
    };
    nextBtn.addEventListener("click", () => { currentIndex = (currentIndex + 1) % totalItems; updateCarousel(); });
    prevBtn.addEventListener("click", () => { currentIndex = (currentIndex - 1 + totalItems) % totalItems; updateCarousel(); });
    updateCarousel();
  }

  // --- Reveal on Scroll ---
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

  // --- FAQ Accordion ---
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach(question => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isExpanded = question.getAttribute("aria-expanded") === "true";
      if (!isExpanded) {
        faqQuestions.forEach(other => {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.style.maxHeight = null;
          other.querySelector("svg").style.transform = "rotate(0deg)";
        });
      }
      question.setAttribute("aria-expanded", String(!isExpanded));
      answer.style.maxHeight = isExpanded ? null : answer.scrollHeight + "px";
      question.querySelector("svg").style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
    });
  });

  // --- Smooth Scroll & Active Nav Link ---
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = header ? header.offsetHeight : 0;
          const offsetPosition = targetElement.offsetTop - headerHeight - 30;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    });
  });
});
