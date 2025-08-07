  // Count-up animation logic
  const counters = document.querySelectorAll('.count-up');
  const options = {
    threshold: 0.6,
  };

  const animateCount = (counter) => {
    const target = +counter.getAttribute('data-target');
    const duration = 2000; // total animation time in ms
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      counter.textContent = value + '+';

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, options);

  counters.forEach((counter) => observer.observe(counter));