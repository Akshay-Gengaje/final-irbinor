document.addEventListener("DOMContentLoaded", function () {
  // --- Mobile Menu Toggle ---
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // --- Smooth Scrolling to Section Center on Link Click ---
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Prevent the default anchor link behavior
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        // Calculate the position to scroll to
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition +
          window.pageYOffset -
          window.innerHeight / 2 +
          targetSection.clientHeight / 2;

        // Scroll to the calculated position
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // --- Active Nav Link & Centering Logic (On Scroll) ---
  const navContainer = document.querySelector(".nav-container");
  const sections = document.querySelectorAll("section[id]");

  if (navLinks.length > 0 && navContainer && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      // Threshold of 0.5 means the callback will trigger when 50% of the section is visible.
      // This is generally better than 1, which requires the entire section to be visible.
      threshold: 0.5,
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);

          // Remove active class from all links
          navLinks.forEach((link) => link.classList.remove("active"));

          // Add active class to the current link
          if (activeLink) {
            activeLink.classList.add("active");

            // Scroll the nav container to center the active link
            const containerRect = navContainer.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            const scrollLeft =
              navContainer.scrollLeft +
              linkRect.left -
              containerRect.left -
              containerRect.width / 2 +
              linkRect.width / 2;

            navContainer.scrollTo({
              left: scrollLeft,
              behavior: "smooth",
            });
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // --- Scroll Animation on Content ---
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // --- Count-Up Animation ---
  const countUpElements = document.querySelectorAll(".count-up");

  if (countUpElements.length > 0) {
    const countUpObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = +el.getAttribute("data-target");
            let current = 0;
            const increment = target / 100;

            const updateCount = () => {
              if (current < target) {
                current += increment;
                el.innerText = Math.ceil(current);
                requestAnimationFrame(updateCount);
              } else {
                el.innerText = target;
              }
            };
            updateCount();
            observer.unobserve(el); // Animate only once
          }
        });
      },
      { threshold: 0.5 }
    );

    countUpElements.forEach((el) => {
      countUpObserver.observe(el);
    });
  }
});

//========= NEW SCRIPT FOR SIDEBAR =========
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("mobile-menu");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebarLinks = document.querySelectorAll("#mobile-menu a");
  const body = document.body;

  const toggleSidebar = () => {
    body.classList.toggle("sidebar-open");
    const isSidebarOpen = body.classList.contains("sidebar-open");
    menuBtn.setAttribute("aria-expanded", isSidebarOpen);
  };

  menuBtn.addEventListener("click", toggleSidebar);
  closeBtn.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (body.classList.contains("sidebar-open")) {
        toggleSidebar();
      }
    });
  });

  // Optional: Close sidebar with the Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.classList.contains("sidebar-open")) {
      toggleSidebar();
    }
  });
});
