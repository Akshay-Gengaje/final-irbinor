/**
 * Page-specific script for the Design & Production page.
 * This script handles:
 * 1. Portfolio Tabs.
 * 2. Tab-based Portfolio Carousels.
 */
document.addEventListener("DOMContentLoaded", function () {
  // --- Portfolio Tabs & Carousel ---
  const tabs = document.querySelectorAll('.portfolio-tab');
  const galleries = document.querySelectorAll('.portfolio-gallery');

  const portfolioImages = {
    corporate: [
      { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80", alt: "Modern corporate event stage" },
      { src: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Conference networking area" },
      { src: "https://images.unsplash.com/photo-1521737852577-6848d81b9328?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Gala dinner setup" }
    ],
    weddings: [
      { src: "https://images.unsplash.com/photo-1523438885289-0b45a3421d4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Luxury wedding ceremony decor" },
      { src: "https://images.unsplash.com/photo-1597904320629-54a5a587f74c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Elegant wedding table setting" },
      { src: "https://images.unsplash.com/photo-1606248852044-520cf25b8814?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Outdoor wedding reception" }
    ],
    brand: [
      { src: "https://images.unsplash.com/photo-1607958996333-41a34d33244d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Immersive brand activation space" },
      { src: "https://images.unsplash.com/photo-1556122071-67502a43cec7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Interactive product launch display" },
      { src: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", alt: "Tech-focused brand event" }
    ]
  };

  const initializeCarousel = (gallery) => {
    const container = gallery.querySelector('.carousel-container');
    const prevBtn = gallery.querySelector('.portfolio-prev-btn');
    const nextBtn = gallery.querySelector('.portfolio-next-btn');
    const category = gallery.id;
    const images = portfolioImages[category];
    let currentIndex = 0;

    container.innerHTML = images.map(img => `
      <div class="carousel-item absolute w-3/4 md:w-1/2 transition-all duration-500 ease-in-out">
        <img src="${img.src}" alt="${img.alt}" class="w-full h-full object-cover rounded-xl shadow-2xl" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/800x450/333/fff?text=Image+Not+Found';">
      </div>`).join('');

    const items = container.querySelectorAll(".carousel-item");
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

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % totalItems;
      updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateCarousel();
    });

    updateCarousel();
  };

  if (tabs.length) {
    // Initialize carousels for all galleries
    galleries.forEach(initializeCarousel);

    // Tab switching logic
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');

        tabs.forEach(t => {
          t.classList.remove('active-tab');
          t.style.borderColor = 'transparent';
          t.style.color = 'var(--text-secondary)';
        });
        
        tab.classList.add('active-tab');
        tab.style.borderColor = 'var(--accent)';
        tab.style.color = 'var(--accent)';

        galleries.forEach(gallery => {
          gallery.classList.toggle('hidden', gallery.id !== target);
        });
      });
    });

    // Set initial active tab style
    const activeTab = document.querySelector('.portfolio-tab.active-tab');
    if(activeTab) {
        activeTab.style.borderColor = 'var(--accent)';
        activeTab.style.color = 'var(--accent)';
    }
  }
});
