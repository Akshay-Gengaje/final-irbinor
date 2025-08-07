document.addEventListener("DOMContentLoaded", () => {
  const overlays = document.querySelectorAll(".overlay-image");

  overlays.forEach((overlay) => {
    const container = overlay.parentElement;
    let animationFrame;
    let radius = 0;
    let maxRadius = 0;

    container.addEventListener("mouseenter", (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      radius = 0;
      maxRadius = Math.sqrt(rect.width ** 2 + rect.height ** 2);

      const animate = () => {
        radius += 20;
        const gradient = `radial-gradient(circle at ${x}px ${y}px, transparent ${radius}px, rgba(0, 0, 0, 1) ${
          radius + 10
        }px)`;
        overlay.style.maskImage = gradient;
        overlay.style.webkitMaskImage = gradient;

        if (radius < maxRadius) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      cancelAnimationFrame(animationFrame);
      animate();
    });

    container.addEventListener("mouseleave", () => {
      cancelAnimationFrame(animationFrame);
      overlay.style.maskImage = "";
      overlay.style.webkitMaskImage = "";
    });
  });
});
