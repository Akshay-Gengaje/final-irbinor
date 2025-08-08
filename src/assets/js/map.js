document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("globe-container");
  if (!container) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Globe
  const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
  const globeMaterial = new THREE.MeshPhongMaterial({
    color: 0x3b82f6, // Blue-500 from your theme
    shininess: 10,
    transparent: true,
    opacity: 0.9,
  });
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // Service Locations
  const locations = [
    { lat: 18.5204, lon: 73.8567, name: "Pune" },
    { lat: 40.7128, lon: -74.006, name: "New York" },
    { lat: 51.5074, lon: -0.1278, name: "London" },
    { lat: 35.6895, lon: 139.6917, name: "Tokyo" },
    { lat: -33.8688, lon: 151.2093, name: "Sydney" },
    { lat: 25.276987, lon: 55.296249, name: "Dubai" },
    { lat: -23.5505, lon: -46.6333, name: "São Paulo" },
  ];

  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  locations.forEach((loc) => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      markerMaterial
    );
    const pos = latLonToVector3(loc.lat, loc.lon, 5);
    marker.position.set(pos.x, pos.y, pos.z);
    globe.add(marker);
  });

  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  // Mouse Interaction
  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };

  container.addEventListener("mousedown", (e) => {
    isMouseDown = true;
  });
  container.addEventListener("mouseup", () => {
    isMouseDown = false;
  });
  container.addEventListener("mouseleave", () => {
    isMouseDown = false;
  });

  container.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    globe.rotation.y += deltaX * 0.005;
    globe.rotation.x += deltaY * 0.005;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener("mousedown", (e) => {
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (!isMouseDown) {
      globe.rotation.y += 0.0005;
    }
    renderer.render(scene, camera);
  }
  animate();

  // Responsive Resizing
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
