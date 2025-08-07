document.addEventListener("DOMContentLoaded", () => {
  // Apply smooth scrolling to the entire document
  document.documentElement.classList.add('scroll-smooth');

  // Scroll animation for sections
  const sections = document.querySelectorAll('.fade-in-section, .slide-up, .scale-in');

  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of the section is visible
      rootMargin: '0px 0px -10% 0px', // Slight offset for better timing
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // Smooth scrolling for navbar links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY;
        const windowHeight = window.innerHeight;
        const elementHeight = targetElement.offsetHeight;
        const scrollPosition = offsetTop - (windowHeight - elementHeight) / 2;

        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });

        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });
});