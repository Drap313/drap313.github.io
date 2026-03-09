const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Starfield background
const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5,
    speed: Math.random() * 0.5 + 0.1,
    alpha: Math.random()
}));

function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Move stars slowly to create a parallax effect
        star.y += star.speed;
        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
        
        // Twinkle effect
        star.alpha += (Math.random() - 0.5) * 0.1;
        star.alpha = Math.max(0.1, Math.min(1, star.alpha));
    });
    ctx.globalAlpha = 1;
}

// Comet Object
class Comet {
    constructor() {
        this.reset();
        // Give it a random starting position so it doesn't wait too long on first load
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
    }

    reset() {
        this.x = Math.random() * width * 1.5; // Start further right to cross the screen
        this.y = -200; // Start above the screen
        
        // Angle pointing towards bottom left
        const angle = (Math.PI / 4) + (Math.random() * 0.2 - 0.1); 
        this.vx = -Math.cos(angle) * (Math.random() * 5 + 10); // Velocity X
        this.vy = Math.sin(angle) * (Math.random() * 5 + 10);  // Velocity Y
        
        this.radius = Math.random() * 3 + 2; // Head size
        
        // Comet colors (cyan/teal to purple/pink)
        const hues = [
            [180, 220], // Cyan/Blue
            [260, 300], // Purple/Pink
            [10, 50]    // Orange/Yellow (rare)
        ];
        
        const palette = hues[Math.floor(Math.random() * hues.length)];
        this.hue = palette[0] + Math.random() * (palette[1] - palette[0]);
        this.tailLength = Math.random() * 150 + 100;
        
        this.active = true;
    }

    update() {
        if (!this.active) return;
        
        this.x += this.vx;
        this.y += this.vy;

        // Reset if it goes off screen (plus a buffer)
        if (this.x < -1000 || this.y > height + 1000) {
            this.active = false;
            // Wait a bit before spawning a new one
            setTimeout(() => this.reset(), Math.random() * 3000 + 1000);
        }
    }

    draw() {
        if (!this.active) return;

        // Draw the tail (gradient)
        const gradient = ctx.createLinearGradient(
            this.x, this.y, 
            this.x - this.vx * (this.tailLength/10), 
            this.y - this.vy * (this.tailLength/10)
        );
        
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 0.8)`);
        gradient.addColorStop(0.2, `hsla(${this.hue + 20}, 100%, 50%, 0.4)`);
        gradient.addColorStop(1, `hsla(${this.hue + 40}, 100%, 30%, 0)`);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - this.vx * (this.tailLength/10) + this.vy * 0.5, 
            this.y - this.vy * (this.tailLength/10) - this.vx * 0.5
        );
        ctx.lineTo(
            this.x - this.vx * (this.tailLength/10) - this.vy * 0.5, 
            this.y - this.vy * (this.tailLength/10) + this.vx * 0.5
        );
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw the head (glowing circle)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, 80%)`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for other drawings
    }
}

// Create an array of comets for higher chance of seeing one
const comets = Array.from({ length: 3 }, () => new Comet());

// Animation Loop
function animate() {
    // Clear the canvas with a slight trail effect for smoothness
    ctx.fillStyle = 'rgba(2, 1, 17, 0.3)';
    ctx.fillRect(0, 0, width, height);

    drawStars();

    comets.forEach(comet => {
        comet.update();
        comet.draw();
    });

    requestAnimationFrame(animate);
}

animate();
