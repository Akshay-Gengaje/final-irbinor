/**
 * Main application script for handling site-wide interactivity.
 * This includes:
 * 1. Mobile sidebar navigation toggle.
 * 2. Theme (dark/light mode) switching.
 * 3. Active navigation link highlighting and centering on scroll.
 * 4. Smooth scrolling for anchor links.
 * 5. Revealing elements on scroll with IntersectionObserver.
 * 6. Animating numbers to count up when visible.
 */
document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;

  // --- Mobile Sidebar Logic ---
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("mobile-menu");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebarLinks = document.querySelectorAll("#mobile-menu a");

  /**
   * Toggles the visibility of the mobile sidebar.
   * - Adds/removes a class to the body to prevent background scrolling.
   * - Toggles ARIA attributes for accessibility.
   * - Manages the visual state of the sidebar and overlay.
   */
  const toggleSidebar = () => {
    const isSidebarOpen = sidebar.classList.contains("translate-x-full");
    // Toggle sidebar and overlay visibility
    sidebar.classList.toggle("translate-x-full");
    overlay.classList.toggle("opacity-0");
    overlay.classList.toggle("pointer-events-none");
    // Toggle body scroll
    body.classList.toggle("overflow-hidden");
    // Update ARIA attribute for the menu button
    menuBtn.setAttribute("aria-expanded", !isSidebarOpen);
  };

  // Event listeners for opening/closing the sidebar
  menuBtn.addEventListener("click", toggleSidebar);
  closeBtn.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);

  // Close sidebar when a link inside it is clicked
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", toggleSidebar);
  });

  // Close sidebar with the Escape key for better accessibility
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sidebar.classList.contains("translate-x-full")) {
      toggleSidebar();
    }
  });


// --- Theme Toggler ---
const themeToggleBtn = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');

// Function to apply theme (but only store if explicitly told)
const applyTheme = (theme, store = false) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    darkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
    if (store) localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    darkIcon.classList.add('hidden');
    lightIcon.classList.remove('hidden');
    if (store) localStorage.setItem('theme', 'light');
  }
};

// Set initial theme: default to light if nothing in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme('light'); // Default without storing
}

// Handle theme toggle button click
themeToggleBtn.addEventListener('click', () => {
  const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(newTheme, true); // Store only after toggle
});


// --- Active Nav Link & Centering Logic ---
const navLinks = document.querySelectorAll("a.nav-link");
const navContainer = document.querySelector(".nav-container");
const sections = document.querySelectorAll("main section[id]");

if (sections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      // Filter for the entry that is currently intersecting
      const intersectingEntry = entries.find(entry => entry.isIntersecting);

      if (intersectingEntry) {
        const id = intersectingEntry.target.getAttribute("id");
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);

        // First, reset all links to their default, inactive state.
        navLinks.forEach((link) => {
          link.classList.remove("text-[var(--accent)]");
          link.classList.add("text-[var(--text-secondary)]");
        });

        // Now, apply the active state to the correct link.
        if (activeLink) {
          // Remove the inactive class and add the active one.
          activeLink.classList.remove("text-[var(--text-secondary)]");
          activeLink.classList.add("text-[var(--accent)]");

          // Center the active link in the navigation bar (for desktop).
          if (navContainer) {
            const containerRect = navContainer.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            const scrollLeft =
              navContainer.scrollLeft +
              linkRect.left -
              containerRect.left -
              containerRect.width / 2 +
              linkRect.width / 2;

            navContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
        }
      }
    },
    {
      rootMargin: "0px 0px -50% 0px", // Trigger when a section is at 50% of the viewport height.
      threshold: 0.25,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

  // --- Reveal on Scroll Animation ---
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    /**
     * IntersectionObserver to add a 'visible' class to elements when they enter the viewport.
     * This triggers a CSS transition for a fade-in/up effect.
     */
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Unobserve the element after it has been revealed to save resources
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach((el) => revealObserver.observe(el));
  }


  // --- Count-Up Animation ---
  const countUpElements = document.querySelectorAll("[data-target]");
  if (countUpElements.length > 0) {
    const countUpObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-target"), 10);
          let current = 0;
          const duration = 2000; // Animation duration in ms
          const stepTime = 20; // Time between steps
          const steps = duration / stepTime;
          const increment = target / steps;
          
          const updateCount = () => {
            current += increment;
            if (current < target) {
              el.textContent = Math.ceil(current);
              setTimeout(updateCount, stepTime);
            } else {
              el.textContent = target; // Ensure it ends on the exact target number
            }
          };
          
          updateCount();
          observer.unobserve(el); // Animate only once
        }
      });
    }, { threshold: 0.5 });
    
    countUpElements.forEach(el => countUpObserver.observe(el));
  }

});