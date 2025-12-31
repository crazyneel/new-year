document.addEventListener('DOMContentLoaded', () => {
    // --- Audio & Start Screen Setup ---
    const bgMusic = document.getElementById('bg-music');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const page1 = document.getElementById('page1');

    startBtn.addEventListener('click', () => {
        // Play music
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Audio play failed:", e));

        // Fade out start screen
        startScreen.classList.add('hidden');

        // Show Page 1 after a slight delay
        setTimeout(() => {
            startScreen.style.display = 'none';
            page1.classList.add('active');
            updateCanvasMode('page1'); // Ensure fireworks start
        }, 1000);
    });

    // --- Page Navigation Logic ---
    const pages = ['page1', 'page2', 'page3', 'page4', 'page5', 'page6'];
    let currentPageIndex = 0;

    window.nextPage = function () {
        if (currentPageIndex < pages.length - 1) {
            const currentId = pages[currentPageIndex];
            const nextId = pages[currentPageIndex + 1];

            const currentSection = document.getElementById(currentId);
            const nextSection = document.getElementById(nextId);

            // Fade out current
            currentSection.classList.remove('active');

            // Fade in next
            nextSection.classList.add('active');

            currentPageIndex++;
            updateCanvasMode(nextId);
        }
    };

    // --- Canvas Animation (Fireworks & Stars) ---
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let backgroundStars = []; // Persistent background stars

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initBackgroundStars(); // Re-init stars on resize
    }
    window.addEventListener('resize', resize);

    // --- Particle Classes ---
    class Star {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2; // Small stars
            this.alpha = Math.random();
            this.blinkSpeed = Math.random() * 0.02 + 0.005;
            this.color = `rgba(255, 255, 255, ${this.alpha})`;
        }

        update() {
            // Twinkle effect
            this.alpha += Math.sin(Date.now() * this.blinkSpeed) * 0.01;
            // Clamp alpha
            if (this.alpha < 0.2) this.alpha = 0.2;
            if (this.alpha > 1) this.alpha = 1;
            this.color = `rgba(255, 255, 255, ${this.alpha})`;
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Particle {
        constructor(type) {
            this.init(type);
        }

        init(type) {
            this.type = type; // 'firework', 'gold_particle'
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.alpha = Math.random();

            if (type === 'firework') {
                this.x = width / 2;
                this.y = height;
                this.vx = (Math.random() - 0.5) * 10;
                this.vy = -(Math.random() * 10 + 10);
                this.gravity = 0.2;
                this.size = 3;
                this.color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`; // Gold/Warm hues
                this.exploded = false;
                this.shards = [];
            } else if (type === 'gold_particle') {
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
                this.size = Math.random() * 3 + 1;
                this.color = `rgba(242, 208, 107, ${this.alpha})`;
            }
        }

        update() {
            if (this.type === 'gold_particle') {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.init('gold_particle');
                }
            } else if (this.type === 'firework') {
                if (!this.exploded) {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += this.gravity;
                    if (this.vy >= 0) {
                        this.explode();
                    }
                } else {
                    this.shards.forEach(shard => {
                        shard.x += shard.vx;
                        shard.y += shard.vy;
                        shard.vy += shard.gravity;
                        shard.alpha -= 0.02;
                    });
                    this.shards = this.shards.filter(s => s.alpha > 0);
                    if (this.shards.length === 0) {
                        this.init('firework');
                    }
                }
            }
        }

        explode() {
            this.exploded = true;
            for (let i = 0; i < 50; i++) {
                this.shards.push({
                    x: this.x,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    gravity: 0.1,
                    alpha: 1,
                    color: this.color
                });
            }
        }

        draw() {
            if (this.type === 'firework' && this.exploded) {
                this.shards.forEach(shard => {
                    ctx.globalAlpha = shard.alpha;
                    ctx.fillStyle = shard.color;
                    ctx.beginPath();
                    ctx.arc(shard.x, shard.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
                return;
            }

            ctx.globalAlpha = 1;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initBackgroundStars() {
        backgroundStars = [];
        for (let i = 0; i < 200; i++) { // Lots of stars
            backgroundStars.push(new Star());
        }
    }

    // Manage particles based on mode
    function updateCanvasMode(sectionId) {
        particles = [];
        let count = 0;
        let type = '';

        switch (sectionId) {
            case 'page1': // Slow golden fireworks
                count = 3;
                type = 'firework';
                break;
            case 'page2': // Subtle fireworks
                count = 1;
                type = 'firework';
                break;
            case 'page3': // Floating golden particles
                count = 50;
                type = 'gold_particle';
                break;
            case 'page4': // Just stars (background handles it)
                count = 0;
                break;
            case 'page5': // Brighter fireworks
                count = 6;
                type = 'firework';
                break;
            case 'page6': // Just stars
                count = 0;
                break;
            default:
                count = 0;
        }

        if (type) {
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(type));
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw persistent background stars
        backgroundStars.forEach(star => {
            star.update();
            star.draw();
        });

        // Draw active section particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    // Init
    resize();
    animate();
});
