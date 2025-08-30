/**
 * Main application script for handling site-wide interactivity.
 * This consolidated script includes all logic for:
 * 1. Mobile sidebar navigation.
 * 2. Theme (dark/light mode) switching.
 * 3. Active navigation link highlighting.
 * 4. Circular carousel for the main gallery with optimized images and auto-scroll.
 * 5. Revealing elements on scroll.
 * 6. FAQ Accordion.
 * 7. Expanding Services Panel.
 * 8. Smooth scrolling for anchor links.
 * 9. Contact form validation and submission with a status modal.
 */
document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;

  // --- Mobile Sidebar, Theme Toggler, and Nav Link Logic ---
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

  // --- Circular Carousel Gallery Logic ---
  const circularCarousel = document.getElementById("circular-carousel");
  if (circularCarousel) {
    const carouselImages = [
      {
        avif: "assets/images/carousel/corporate-conference-event.avif",
        webp: "assets/images/carousel/corporate-conference-event.webp",
        fallback: "assets/images/carousel/corporate-conference-event.jpg",
        alt: "Corporate conference event setup",
      },
      {
        avif: "assets/images/carousel/event-at-sea-side.avif",
        webp: "assets/images/carousel/event-at-sea-side.webp",
        fallback: "assets/images/carousel/event-at-sea-side.jpg",
        alt: "Seaside event setup",
      },
      {
        avif: "assets/images/carousel/stage-decoration-at-event.avif",
        webp: "assets/images/carousel/stage-decoration-at-event.webp",
        fallback: "assets/images/carousel/stage-decoration-at-event.jpg",
        alt: "Decorated event stage",
      },
      {
        avif: "assets/images/carousel/tent-outdoor-event-managment.avif",
        webp: "assets/images/carousel/tent-outdoor-event-managment.webp",
        fallback: "assets/images/carousel/tent-outdoor-event-managment.jpg",
        alt: "Outdoor event tent management",
      },
    ];
    const prevBtn = document.getElementById("carousel-prev-btn");
    const nextBtn = document.getElementById("carousel-next-btn");
    const carouselArea = document.getElementById("carousel-area");
    let currentIndex = 0;
    let autoScrollInterval;
    const autoScrollSpeed = 4000;

    const initializeCarousel = () => {
      circularCarousel.innerHTML = carouselImages
        .map(
          (img) => `
        <div class="carousel-item absolute w-3/4 md:w-1/2 transition-all duration-500 ease-in-out">
          <picture>
            <source srcset="${img.avif}" type="image/avif">
            <source srcset="${img.webp}" type="image/webp">
            <img src="${img.fallback}" alt="${img.alt}" class="w-full h-full object-cover rounded-xl shadow-2xl" loading="lazy">
          </picture>
        </div>`
        )
        .join("");
    };

    const updateCarousel = () => {
      const items = circularCarousel.querySelectorAll(".carousel-item");
      const total = items.length;
      items.forEach((item, i) => {
        let transform, opacity, zIndex, filter;
        if (i === currentIndex) {
          [transform, opacity, zIndex, filter] = [
            "translateX(0) scale(1)",
            "1",
            "10",
            "blur(0)",
          ];
        } else if (i === (currentIndex - 1 + total) % total) {
          [transform, opacity, zIndex, filter] = [
            "translateX(-50%) scale(0.8)",
            "0.6",
            "5",
            "blur(3px)",
          ];
        } else if (i === (currentIndex + 1) % total) {
          [transform, opacity, zIndex, filter] = [
            "translateX(50%) scale(0.8)",
            "0.6",
            "5",
            "blur(3px)",
          ];
        } else {
          [transform, opacity, zIndex, filter] = [
            "translateX(0) scale(0.7)",
            "0",
            "0",
            "blur(5px)",
          ];
        }
        item.style.transform = transform;
        item.style.opacity = opacity;
        item.style.zIndex = zIndex;
        item.style.filter = filter;
      });
    };

    const stopAutoScroll = () => clearInterval(autoScrollInterval);
    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % carouselImages.length;
        updateCarousel();
      }, autoScrollSpeed);
    };

    const resetAutoScroll = () => {
      stopAutoScroll();
      startAutoScroll();
    };

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      updateCarousel();
      resetAutoScroll();
    });
    prevBtn.addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + carouselImages.length) % carouselImages.length;
      updateCarousel();
      resetAutoScroll();
    });
    carouselArea.addEventListener("mouseenter", stopAutoScroll);
    carouselArea.addEventListener("mouseleave", startAutoScroll);

    initializeCarousel();
    updateCarousel();
    startAutoScroll();
  }

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
  faqQuestions.forEach((q) => {
    q.addEventListener("click", () => {
      const isOpen = q.getAttribute("aria-expanded") === "true";
      faqQuestions.forEach((item) => {
        item.setAttribute("aria-expanded", "false");
        item.classList.remove("active");
        item.nextElementSibling.style.maxHeight = null;
      });
      if (!isOpen) {
        q.setAttribute("aria-expanded", "true");
        q.classList.add("active");
        const answer = q.nextElementSibling;
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // --- Tabbed Services Logic ---
  const tabsContainer = document.getElementById("tabs-container");
  if (tabsContainer) {
    const tabButtons = tabsContainer.querySelectorAll(".tab-btn");
    const contentPanels = document.querySelectorAll(".content-panel");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        contentPanels.forEach((panel) => panel.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.target).classList.add("active");
      });
    });
  }

  // --- Smooth Scroll & Section Centering ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight =
          document.querySelector("header")?.offsetHeight || 0;
        const offsetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          30;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });


  // =========================================================================
  // --- START: CONTACT FORM & MODAL LOGIC ---
  // =========================================================================
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
      // Form fields and errors
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");
      const nameError = document.getElementById("name-error");
      const emailError = document.getElementById("email-error");
      const messageError = document.getElementById("message-error");

      // Submit button elements
      const submitBtn = document.getElementById("submit-btn");
      const submitBtnText = document.getElementById("submit-btn-text");
      const submitSpinner = document.getElementById("submit-spinner");
      
      // Modal elements
      const modalOverlay = document.getElementById('status-modal-overlay');
      const modal = document.getElementById('status-modal');
      const modalIconContainer = document.getElementById('modal-icon-container');
      const modalTitle = document.getElementById('modal-title');
      const modalMessage = document.getElementById('modal-message');
      const modalCloseBtn = document.getElementById('modal-close-btn');

      const successIconSVG = `
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`;
      
      const errorIconSVG = `
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`;

      const showModal = (isSuccess, title, message) => {
          modalTitle.textContent = title;
          modalMessage.textContent = message;

          // Reset classes
          modalIconContainer.className = 'mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-5';
          modalCloseBtn.className = 'text-white font-bold rounded-full px-10 py-3 transition-colors';

          if (isSuccess) {
              modalIconContainer.innerHTML = successIconSVG;
              modalIconContainer.classList.add('bg-green-100', 'text-green-600');
              modalCloseBtn.classList.add('bg-[var(--accent)]', 'hover:bg-[var(--accent-hover)]');
          } else {
              modalIconContainer.innerHTML = errorIconSVG;
              modalIconContainer.classList.add('bg-red-100', 'text-red-600');
              modalCloseBtn.classList.add('bg-red-500', 'hover:bg-red-600');
          }

          modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
          modal.classList.remove('scale-95');
          body.classList.add('overflow-hidden');
      };
      
      const hideModal = () => {
          modalOverlay.classList.add('opacity-0', 'pointer-events-none');
          modal.classList.add('scale-95');
          body.classList.remove('overflow-hidden');
      };

      modalCloseBtn.addEventListener('click', hideModal);
      modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) hideModal();
      });

      const validateEmail = (email) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(email).toLowerCase());

      contactForm.addEventListener("submit", function (e) {
          e.preventDefault();
          let isValid = true;
          
          // Reset previous errors
          [nameError, emailError, messageError].forEach(err => err.textContent = "");
          [nameInput, emailInput, messageInput].forEach(inp => inp.classList.remove('border-red-500'));

          if (nameInput.value.trim() === "") {
              nameError.textContent = "Name is required.";
              nameInput.classList.add('border-red-500');
              isValid = false;
          }
          if (emailInput.value.trim() === "" || !validateEmail(emailInput.value)) {
              emailError.textContent = "A valid email is required.";
              emailInput.classList.add('border-red-500');
              isValid = false;
          }
          if (messageInput.value.trim().length < 10) {
              messageError.textContent = "Message must be at least 10 characters.";
              messageInput.classList.add('border-red-500');
              isValid = false;
          }

          if (isValid) {
              submitBtn.disabled = true;
              submitBtnText.textContent = 'Sending...';
              submitSpinner.classList.remove('hidden');
              
              const formData = new FormData(contactForm);
              fetch("contact.php", { // Endpoint for your PHP script
                  method: "POST",
                  body: formData
              })
              .then(response => {
                  if (!response.ok) {
                      // Handle HTTP errors like 404 or 500
                      throw new Error(`Network response was not ok: ${response.statusText}`);
                  }
                  return response.json();
              })
              .then(data => {
                  if (data.success) {
                      showModal(true, "Success!", data.message || "Your message has been sent successfully.");
                      contactForm.reset();
                  } else {
                      showModal(false, "Submission Failed", data.message || "An unexpected error occurred.");
                  }
              })
              .catch(error => {
                  console.error("Fetch Error:", error);
                  showModal(false, "Connection Error", "Could not connect to the server. Please try again later.");
              })
              .finally(() => {
                  // This block runs regardless of success or failure
                  submitBtn.disabled = false;
                  submitBtnText.textContent = 'Send Message';
                  submitSpinner.classList.add('hidden');
              });
          }
      });
  }
  // =========================================================================
  // --- END: CONTACT FORM & MODAL LOGIC ---
  // =========================================================================
});
