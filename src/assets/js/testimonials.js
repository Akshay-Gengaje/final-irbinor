    document.addEventListener('DOMContentLoaded', function () {
      const container = document.getElementById('testimonial-container-new');
      const scrollLeftBtn = document.getElementById('scroll-left-new');
      const scrollRightBtn = document.getElementById('scroll-right-new');
      const dotsContainer = document.getElementById('testimonial-dots');

      if (!container || !scrollLeftBtn || !scrollRightBtn || !dotsContainer) return;

      const testimonials = Array.from(container.children).filter(el => el.tagName === 'ARTICLE');
      let dotButtons = [];

      const createDots = () => {
          dotsContainer.innerHTML = '';
          dotButtons = [];
          testimonials.forEach((testimonial, index) => {
              const button = document.createElement('button');
              button.className = 'w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300';
              button.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
              button.addEventListener('click', () => {
                  const cardWidth = testimonial.offsetWidth;
                  container.scrollTo({
                      left: index * cardWidth + (index * parseInt(getComputedStyle(testimonial).marginRight) * 2), // A more robust way to calculate scroll
                      behavior: 'smooth'
                  });
              });
              dotsContainer.appendChild(button);
              dotButtons.push(button);
          });
      };

      const updateActiveDot = () => {
          const cardWidth = testimonials[0].offsetWidth;
          const scrollLeft = container.scrollLeft;
          const currentIndex = Math.round(scrollLeft / cardWidth);

          dotButtons.forEach((button, index) => {
              if (index === currentIndex) {
                  button.classList.remove('bg-gray-300');
                  button.classList.add('bg-blue-500', 'scale-125');
              } else {
                  button.classList.remove('bg-blue-500', 'scale-125');
                  button.classList.add('bg-gray-300');
              }
          });
      };

      const checkScrollButtons = () => {
        const tolerance = 1;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        
        scrollLeftBtn.disabled = container.scrollLeft <= tolerance;
        scrollRightBtn.disabled = container.scrollLeft >= maxScrollLeft - tolerance;
        
        updateActiveDot();
      };

      const scroll = (direction) => {
        const card = testimonials[0];
        if (!card) return;
        
        const scrollAmount = card.offsetWidth;
        container.scrollBy({
          left: direction * scrollAmount,
          behavior: 'smooth'
        });
      };

      // Initial Setup
      createDots();
      scrollLeftBtn.addEventListener('click', () => scroll(-1));
      scrollRightBtn.addEventListener('click', () => scroll(1));
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          checkScrollButtons();
          container.addEventListener('scroll', checkScrollButtons, { passive: true });
          window.addEventListener('resize', () => {
            createDots();
            checkScrollButtons();
          });
        } else {
          container.removeEventListener('scroll', checkScrollButtons);
          window.removeEventListener('resize', checkScrollButtons);
        }
      }, { threshold: 0.1 });

      if (container) {
        observer.observe(container);
      }
    });