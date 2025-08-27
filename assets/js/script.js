class ImprovedNoise {
    constructor() {
        this.p = new Uint8Array(512);
        this.perm = new Uint8Array(512);
        this.gradP = new Array(512);
        this.seed(Math.random());
    }
    seed(seed) {
        if (seed > 0 && seed < 1) {
            seed *= 65536;
        }
        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }
        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
                v = (seed ^ (i & 255)) & 255;
            } else {
                v = (seed ^ ((i >> 1) & 255)) & 255;
            }
            this.p[i] = v;
        }
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    noise(x, y, z) {
        const floorX = Math.floor(x), floorY = Math.floor(y), floorZ = Math.floor(z);
        const X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;
        x -= floorX;
        y -= floorY;
        z -= floorZ;
        const fx = this.fade(x), fy = this.fade(y), fz = this.fade(z);
        const A = this.perm[X] + Y, AA = this.perm[A] + Z, AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y, BA = this.perm[B] + Z, BB = this.perm[B + 1] + Z;
        return this.lerp(
            this.lerp(
                this.lerp(this.grad(this.perm[AA], x, y, z),
                          this.grad(this.perm[BA], x - 1, y, z), fx),
                this.lerp(this.grad(this.perm[AB], x, y - 1, z),
                          this.grad(this.perm[BB], x - 1, y - 1, z), fx), fy),
            this.lerp(
                this.lerp(this.grad(this.perm[AA + 1], x, y, z - 1),
                          this.grad(this.perm[BA + 1], x - 1, y, z - 1), fx),
                this.lerp(this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                          this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1), fx), fy),
            fz
        );
    }
}

// Three.js Wave Wireframe
const container = document.getElementById('wave-canvas-container');
const scene = new THREE.Scene();

// Add fog to the scene starting at 40 units, fading out by 60 units
scene.fog = new THREE.Fog(0xE5E5E5, 20, 40)

const camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 1000);

camera.position.set(0, 0, 20);
camera.lookAt(0, 5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0xE5E5E5, 0); // match background, transparent
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Responsive resize
window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
});

// Grid parameters
const gridWidth = 80;
const gridHeight = 80;
const segmentsW = 80;
const segmentsH = 80;
const geometry = new THREE.PlaneGeometry(gridWidth, gridHeight, segmentsW, segmentsH);

// Wireframe material
const material = new THREE.MeshBasicMaterial({
    color: 0xC8C8C8,
    wireframe: true
});

const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2.5;
scene.add(mesh);

// Perlin noise instance
const perlin = new ImprovedNoise();

// Amplitude constant for wave height
const WAVE_AMPLITUDE = 4.5;

// Mouse movement tracking for animation speed and direction
let lastMouseX = null;
let lastMouseY = null;
let mouseSpeed = 0;
let mouseDirection = 1; // 1 for forward, -1 for reverse
let lastUpdateTime = performance.now();
const MOUSE_SPEED_DECAY = 0.9; // Faster decay for immediate slowdown
const MIN_ANIMATION_SPEED = 0.00005;
const MAX_ANIMATION_SPEED = 0.0005;
const MOUSE_SPEED_SCALE = 0.0007; // Scale mouse speed to animation speed

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

window.addEventListener('mousemove', (event) => {
    if (lastMouseX !== null && lastMouseY !== null) {
        const dx = event.clientX - lastMouseX;
        const dy = event.clientY - lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        mouseSpeed = distance; // Set directly for immediate response

        // Determine direction: left movement (dx < 0) speeds up forward, right movement (dx > 0) reverses
        if (dx < 0) {
            mouseDirection = 1;
        } else if (dx > 0) {
            mouseDirection = -1;
        }
    }
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

// Animation loop
let animationTime = 0;

function animateWave(time) {
    const vertices = geometry.attributes.position;
    // Calculate animation speed based on mouse movement
    const now = performance.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;

    // Smooth and decay mouse speed quickly for responsiveness
    mouseSpeed *= MOUSE_SPEED_DECAY;
    // Clamp mouseSpeed to avoid excessive values
    const effectiveMouseSpeed = clamp(mouseSpeed, 0, 100);

    // Animation speed is base + scaled mouse speed
    const animationSpeed = clamp(
        MIN_ANIMATION_SPEED + effectiveMouseSpeed * MOUSE_SPEED_SCALE,
        MIN_ANIMATION_SPEED,
        MAX_ANIMATION_SPEED
    );

    animationTime += deltaTime * animationSpeed * mouseDirection;

    for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        // Perlin noise for smooth wave
        const z = perlin.noise(x * 0.15 + animationTime, y * 0.15, animationTime) * WAVE_AMPLITUDE;
        vertices.setZ(i, z);
    }
    vertices.needsUpdate = true;
    geometry.computeVertexNormals();
}

function animateThreeJs(time) {
    animateWave(time);
    renderer.render(scene, camera);
    requestAnimationFrame(animateThreeJs);
}


// Animate the camera to move above the plane and face down as the user scrolls using GSAP

if (typeof gsap !== 'undefined' && typeof camera !== 'undefined') {
    const initialCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const targetCameraPosition = { x: 0, y: 40, z: 0 };
    const initialBodyBg = window.getComputedStyle(document.body).backgroundColor;
    const targetBodyBg = "#f8f8f8";

    function getScrollProgress() {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight === 0) return 0;
        return Math.min(Math.max(scrollTop / docHeight, 0), 1);
    }

    function lerpColor(a, b, t) {
        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(x => x + x).join('');
            }
            const num = parseInt(hex, 16);
            return [num >> 16, (num >> 8) & 255, num & 255];
        }
        function parseColor(str) {
            if (str.startsWith('rgb')) {
                return str.match(/\d+/g).map(Number).slice(0, 3);
            }
            if (str.startsWith('#')) {
                return hexToRgb(str);
            }
            return [255, 255, 255];
        }
        const c1 = parseColor(a);
        const c2 = parseColor(b);
        return `rgb(${Math.round(c1[0] + (c2[0] - c1[0]) * t)},${Math.round(c1[1] + (c2[1] - c1[1]) * t)},${Math.round(c1[2] + (c2[2] - c1[2]) * t)})`;
    }

    function updateCameraOnScroll() {
        const progress = getScrollProgress();

        const newX = initialCameraPosition.x + (targetCameraPosition.x - initialCameraPosition.x) * progress;
        const newY = initialCameraPosition.y + (targetCameraPosition.y - initialCameraPosition.y) * progress;
        const newZ = initialCameraPosition.z + (targetCameraPosition.z - initialCameraPosition.z) * progress;

        gsap.to(camera.position, {
            x: newX,
            y: newY,
            z: newZ,
            duration: 0.5,
            overwrite: 'auto',
            ease: "power2.out",
            onUpdate: function() {
                camera.lookAt(0, 0, 0);
            }
        });

        const bgColor = lerpColor(initialBodyBg, targetBodyBg, progress);
        document.body.style.backgroundColor = bgColor;
    }

    window.addEventListener('scroll', updateCameraOnScroll, { passive: true });
}

(function() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;

    const projectsTitle = projectsSection.querySelector('.projects-title');
    const projectCards = Array.from(projectsSection.querySelectorAll('.project-card'));
    const elementsToAnimate = [projectsTitle, ...projectCards].filter(Boolean);
    let hasAnimated = false;

    // Only set initial state if not already visible
    function setInitialState() {
        elementsToAnimate.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'none';
        });
    }

    function isSectionInView(section) {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        // Trigger when any part of the section is visible in the viewport
        return rect.top < windowHeight && rect.bottom > 0;
    }

    function fadeInProjectsSectionStaggered() {
        if (hasAnimated) return;
        if (!isSectionInView(projectsSection)) return;

        hasAnimated = true;

        elementsToAnimate.forEach((el, idx) => {
            setTimeout(() => {
                el.style.transition = 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, idx * 120);
        });
    }

    function onScrollOrResize() {
        if (!hasAnimated) {
            fadeInProjectsSectionStaggered();
        }
    }

    setInitialState();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    // In case the section is already in view on load
    setTimeout(onScrollOrResize, 100);
})();






animateThreeJs();