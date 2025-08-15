/**
 * Main application script for handling site-wide interactivity.
 * This consolidated script includes all logic for:
 * 1. Mobile sidebar navigation.
 * 2. Theme (dark/light mode) switching.
 * 3. Active navigation link highlighting.
 * 4. Interactive carousel modal for the static gallery.
 * 5. Revealing elements on scroll.
 * 6. FAQ Accordion.
 */
document.addEventListener("DOMContentLoaded", function () {
    // --- Mobile Sidebar, Theme Toggler, and Nav Link Logic ---
    // (This is the standard setup code for the header and general interactivity)
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
        sidebarLinks.forEach(link => link.addEventListener("click", toggleSidebar));
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !sidebar.classList.contains("translate-x-full")) {
                toggleSidebar();
            }
        });
    }
    
    // Theme Toggler
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        const applyTheme = (theme, store = false) => {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            darkIcon.classList.toggle('hidden', theme !== 'dark');
            lightIcon.classList.toggle('hidden', theme === 'dark');
            if (store) localStorage.setItem('theme', theme);
        };
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(newTheme, true);
        });
    }

    // =========================================================================
    // --- START: INTERACTIVE CAROUSEL FOR STATIC GALLERY ---
    // =========================================================================
    const categoryGrid = document.getElementById('category-grid');
    if (categoryGrid) {
        const galleryData = {
            'luxury-weddings': {
                title: 'Luxury Weddings',
                images: [
                    'https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/2291462/pexels-photo-2291462.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ]
            },
            'corporate-gala': {
                title: 'Corporate Galas',
                images: [
                    'https://images.pexels.com/photos/6519188/pexels-photo-6519188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/5638743/pexels-photo-5638743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ]
            },
            'minimalist-events': {
                title: 'Minimalist Designs',
                images: [
                    'https://images.pexels.com/photos/6492397/pexels-photo-6492397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/8903617/pexels-photo-8903617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ]
            },
            'destination-events': {
                title: 'Destination Events',
                images: [
                    'https://images.pexels.com/photos/1834407/pexels-photo-1834407.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/2440856/pexels-photo-2440856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                ]
            }
        };

          const modal = document.getElementById('image-modal');
        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = document.getElementById('modal-title');
        const modalCounter = document.getElementById('modal-counter');
        const closeModalBtn = document.getElementById('close-modal');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const carouselContainer = document.getElementById('carousel-container');
        let currentCategoryImages = [];
        let currentImageIndex = 0;

        // --- Main function to display an image, now with loading and error handling ---
        function showImage(index) {
            // 1. Set the initial loading state with a centered spinner
            carouselContainer.innerHTML = `
              <div id="loading-spinner" class="w-12 h-12 border-4 border-[var(--text-secondary)]/30 border-t-[var(--accent)] rounded-full animate-spin"></div>
              <img id="modal-image" src="" alt="Event Inspiration" class="carousel-image w-full h-full object-contain opacity-0 transition-opacity duration-300">
            `;

            const spinner = document.getElementById('loading-spinner');
            const modalImage = document.getElementById('modal-image');
            
            // 2. Preload the image in the background
            const tempImage = new Image();
            tempImage.src = currentCategoryImages[index];

            // 3. Handle successful image load
            tempImage.onload = () => {
                spinner.style.display = 'none'; // Hide spinner
                modalImage.src = tempImage.src; // Set the image source
                modalImage.classList.remove('opacity-0'); // Fade in the image
            };

            // 4. Handle image loading errors
            tempImage.onerror = () => {
                spinner.style.display = 'none'; // Hide spinner
                // Display a user-friendly error message with a retry button
                carouselContainer.innerHTML = `
                    <div class="text-center p-4 text-[var(--text-secondary)] flex flex-col items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="font-semibold">Sorry, the image could not be loaded.</p>
                        <button
                            onclick="retryImage(${index})"
                            class="bg-[var(--accent)] text-white font-bold rounded-full px-6 py-2 hover:bg-[var(--accent-hover)] transition-colors duration-300"
                        >
                            Retry
                        </button>
                    </div>`;
            };

            modalCounter.textContent = `${index + 1} / ${currentCategoryImages.length}`;
        }

        // --- Make the retry function globally accessible for the inline onclick event ---
        window.retryImage = (index) => {
            showImage(index);
        };

        function openModal(categoryId) {
            const category = galleryData[categoryId];
            if (!category) return;
            currentCategoryImages = category.images;
            currentImageIndex = 0;
            modalTitle.textContent = category.title;
            showImage(currentImageIndex);
            modal.classList.remove('pointer-events-none', 'opacity-0');
            modalContent.classList.remove('opacity-0', 'scale-95', '-translate-y-5');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.add('opacity-0');
            modalContent.classList.add('opacity-0', 'scale-95', '-translate-y-5');
            setTimeout(() => {
                modal.classList.add('pointer-events-none');
                document.body.style.overflow = 'auto';
            }, 300);
        }

        function navigateCarousel(direction) {
            if (currentCategoryImages.length === 0) return;
            currentImageIndex = (currentImageIndex + direction + currentCategoryImages.length) % currentCategoryImages.length;
            showImage(currentImageIndex);
        }

        // --- Event Listeners ---
        categoryGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (card) {
                openModal(card.dataset.categoryId);
            }
        });

        nextBtn.addEventListener('click', () => navigateCarousel(1));
        prevBtn.addEventListener('click', () => navigateCarousel(-1));
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => e.target === modal && closeModal());
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('opacity-0')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') nextBtn.click();
            if (e.key === 'ArrowLeft') prevBtn.click();
        });
    }
    // =========================================================================
    // --- END: INTERACTIVE CAROUSEL LOGIC ---
    // =========================================================================

    // --- Unified Reveal on Scroll Animation ---
    const revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach((el) => revealObserver.observe(el));
    }

    // --- FAQ Accordion ---
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach((question) => {
        question.addEventListener("click", () => {
            const answer = question.nextElementSibling;
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other open answers
            if (!isExpanded) {
                 faqQuestions.forEach(otherQuestion => {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherQuestion.nextElementSibling.style.maxHeight = null;
                    otherQuestion.querySelector("svg").style.transform = "rotate(0deg)";
                 });
            }

            // Toggle the clicked one
            question.setAttribute('aria-expanded', !isExpanded);
            answer.style.maxHeight = isExpanded ? null : answer.scrollHeight + "px";
            question.querySelector("svg").style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
        });
    });
});