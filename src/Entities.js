class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.markedForDeletion = false;
    }

    draw(ctx) {
        // Base draw method
    }
    
    // Simple AABB collision check
    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}

class Coin extends Entity {
    constructor(x, y) {
        // Center the coin in the tile
        const size = 20;
        super(x + (TILE_SIZE - size) / 2, y + (TILE_SIZE - size) / 2, size, size);
        this.bobOffset = Math.random() * Math.PI * 2; // Randomize start phase
    }

    update(deltaTime) {
        this.bobOffset += 0.005 * deltaTime;
        // Bobbing is just visual, hitbox stays same for simplicity
    }

    draw(ctx) {
        const bobAmount = Math.sin(this.bobOffset) * 4;
        
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2 + bobAmount, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2 + bobAmount, this.width / 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Spike extends Entity {
    constructor(x, y) {
        // Spikes sit ON TOP of the platform tile at (x, y)
        // Hitbox is the space just above the platform
        const spikeHeight = 15;
        super(x, y - spikeHeight, TILE_SIZE, spikeHeight);
        this.baseX = x;
        this.baseY = y;
    }

    draw(ctx, theme) {
        // The platform base is already drawn by Level.js since we added it to this.platforms
        
        // Draw Spike Points sitting on top of the platform
        ctx.fillStyle = '#A9A9A9'; // Dark grey
        const spikeHeight = 15;
        const spikeWidth = TILE_SIZE / 3;
        
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.baseX + (i * spikeWidth), this.baseY); // base on the platform top
            ctx.lineTo(this.baseX + (i * spikeWidth) + spikeWidth / 2, this.baseY - spikeHeight); // tip pointing up
            ctx.lineTo(this.baseX + (i * spikeWidth) + spikeWidth, this.baseY); // base on the platform top
            ctx.fill();
        }
    }
}

class Goal extends Entity {
    constructor(x, y) {
        super(x, y, TILE_SIZE, TILE_SIZE);
    }

    draw(ctx) {
        // Draw a flag
        
        // Pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 5, this.y, 4, this.height);
        
        // Flag
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(this.x + 9, this.y + 5);
        ctx.lineTo(this.x + this.width - 5, this.y + 15);
        ctx.lineTo(this.x + 9, this.y + 25);
        ctx.fill();
    }
}

class PowerUp extends Entity {
    constructor(x, y, type) {
        const size = 25;
        super(x + (TILE_SIZE - size) / 2, y + (TILE_SIZE - size) / 2, size, size);
        this.type = type; // 'speed' or 'shield'
        this.pulse = 0;
    }

    update(deltaTime) {
        this.pulse += 0.01 * deltaTime;
    }

    draw(ctx) {
        const pulseAmount = Math.sin(this.pulse) * 5;
        const color = this.type === 'speed' ? '#00FFFF' : '#ADFF2F'; // Cyan for speed, Green-yellow for shield
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + pulseAmount / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon/Symbol
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.type === 'speed') {
            // Lightning bolt or fast lines
            ctx.moveTo(this.x + 10, this.y + 15);
            ctx.lineTo(this.x + 15, this.y + 5);
            ctx.lineTo(this.x + 15, this.y + 12);
            ctx.lineTo(this.x + 20, this.y + 10);
            ctx.lineTo(this.x + 10, this.y + 20);
            ctx.lineTo(this.x + 10, this.y + 13);
            ctx.closePath();
        } else {
            // Shield shape
            ctx.moveTo(this.x + 5, this.y + 5);
            ctx.lineTo(this.x + 20, this.y + 5);
            ctx.lineTo(this.x + 20, this.y + 15);
            ctx.quadraticCurveTo(this.x + 12.5, this.y + 25, this.x + 5, this.y + 15);
            ctx.closePath();
        }
        ctx.stroke();
    }
}

class SpeedBoost extends PowerUp {
    constructor(x, y) {
        super(x, y, 'speed');
    }
}

class Shield extends PowerUp {
    constructor(x, y) {
        super(x, y, 'shield');
    }
}
