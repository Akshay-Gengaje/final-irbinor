/**
 * Main application script for handling site-wide interactivity.
 * This consolidated script includes all logic for:
 * 1. Mobile sidebar navigation.
 * 2. Theme (dark/light mode) switching.
 * 3. Active navigation link highlighting.
 * 4. Circular carousel for the main gallery.
 * 5. Revealing elements on scroll.
 * 6. FAQ Accordion.
 */
document.addEventListener("DOMContentLoaded", function () {
  // --- Mobile Sidebar, Theme Toggler, and Nav Link Logic ---
  const body = document.body;
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("mobile-menu");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebarLinks = document.querySelectorAll("#mobile-menu a");

  const toggleSidebar = () => {
    if (!sidebar) return;
    const isSidebarOpen = sidebar.classList.contains("translate-x-full");
    sidebar.classList.toggle("translate-x-full");
    overlay.classList.toggle("opacity-0");
    overlay.classList.toggle("pointer-events-none");
    body.classList.toggle("overflow-hidden");
    menuBtn.setAttribute("aria-expanded", !isSidebarOpen);
  };

  if (menuBtn) {
    menuBtn.addEventListener("click", toggleSidebar);
    closeBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);
    sidebarLinks.forEach((link) =>
      link.addEventListener("click", toggleSidebar)
    );
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !sidebar.classList.contains("translate-x-full")
      ) {
        toggleSidebar();
      }
    });
  }

  // Theme Toggler
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

  // =========================================================================
  // --- START: CIRCULAR CAROUSEL GALLERY LOGIC ---
  // =========================================================================
  const circularCarousel = document.getElementById("circular-carousel");
  if (circularCarousel) {
    // --- Configuration ---
    const carouselImages = [
      {
        src: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        alt: "Corporate Gala Dinner",
      },
      {
        src: "https://images.pexels.com/photos/6492397/pexels-photo-6492397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        alt: "Minimalist Event Design",
      },
      {
        src: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        alt: "Destination Event by the Water",
      },
      {
        src: "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        alt: "Elegant Table Setting",
      },
    ];

    // --- Element References ---
    const prevBtn = document.getElementById("carousel-prev-btn");
    const nextBtn = document.getElementById("carousel-next-btn");

    // --- State ---
    let currentIndex = 0;

    // --- Functions ---
    function initializeCarousel() {
      let carouselHTML = "";
      carouselImages.forEach((image) => {
        carouselHTML += `
                    <div class="carousel-item absolute w-3/4 md:w-1/2 transition-all duration-500 ease-in-out">
                        <img src="${image.src}" alt="${image.alt}" class="w-full h-full object-cover rounded-xl shadow-2xl" onerror="this.onerror=null;this.src='https://placehold.co/800x450/333/fff?text=Image+Not+Found';">
                    </div>
                `;
      });
      circularCarousel.innerHTML = carouselHTML;
    }

    function updateCarousel() {
      const items = circularCarousel.querySelectorAll(".carousel-item");
      const totalItems = items.length;

      items.forEach((item, i) => {
        const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
        const nextIndex = (currentIndex + 1) % totalItems;

        // Reset styles
        item.style.transform = "translateX(0) scale(0.7)";
        item.style.opacity = "0";
        item.style.zIndex = "0";
        item.style.filter = "blur(5px)";

        if (i === currentIndex) {
          // Style for the active (center) item
          item.style.transform = "translateX(0) scale(1)";
          item.style.opacity = "1";
          item.style.zIndex = "10";
          item.style.filter = "blur(0)";
        } else if (i === prevIndex) {
          // Style for the previous (left) item
          item.style.transform = "translateX(-50%) scale(0.8)";
          item.style.opacity = "0.6";
          item.style.zIndex = "5";
          item.style.filter = "blur(3px)";
        } else if (i === nextIndex) {
          // Style for the next (right) item
          item.style.transform = "translateX(50%) scale(0.8)";
          item.style.opacity = "0.6";
          item.style.zIndex = "5";
          item.style.filter = "blur(3px)";
        }
      });
    }

    // --- Event Listeners ---
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + carouselImages.length) % carouselImages.length;
      updateCarousel();
    });

    // --- Initialization ---
    initializeCarousel();
    updateCarousel();
  }
  // =========================================================================
  // --- END: CIRCULAR CAROUSEL GALLERY LOGIC ---
  // =========================================================================

  // --- Unified Reveal on Scroll Animation ---
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // --- FAQ Accordion ---
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isExpanded = question.getAttribute("aria-expanded") === "true";

      // Close all other open answers
      if (!isExpanded) {
        faqQuestions.forEach((otherQuestion) => {
          otherQuestion.setAttribute("aria-expanded", "false");
          otherQuestion.nextElementSibling.style.maxHeight = null;
          otherQuestion.querySelector("svg").style.transform = "rotate(0deg)";
        });
      }

      // Toggle the clicked one
      question.setAttribute("aria-expanded", !isExpanded);
      answer.style.maxHeight = isExpanded ? null : answer.scrollHeight + "px";
      question.querySelector("svg").style.transform = isExpanded
        ? "rotate(0deg)"
        : "rotate(180deg)";
    });
  });
});

/* Add this new section to your main.js file */

// =========================================================================
// --- START: SMOOTH SCROLL & SECTION CENTERING ---
// =========================================================================
const navLinks = document.querySelectorAll('a[href^="#"]');
const header = document.querySelector("header");

navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault(); // Stop the default anchor link behavior

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerHeight = header ? header.offsetHeight : 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight - 30;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});
// =========================================================================
// --- END: SMOOTH SCROLL & SECTION CENTERING ---
// =========================================================================
