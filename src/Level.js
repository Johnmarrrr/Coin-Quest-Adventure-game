class Level {
    constructor(levelData) {
        this.theme = levelData.theme;
        this.map = levelData.map;
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.powerups = [];
        this.goal = null;
        this.startX = 50;
        this.startY = 50;
        
        this.parseLevel();
    }

    parseLevel() {
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const tileId = this.map[row][col];
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;

                switch (tileId) {
                    case 1: // Platform
                        this.platforms.push({ x, y, width: TILE_SIZE, height: TILE_SIZE });
                        break;
                    case 2: // Coin
                        this.coins.push(new Coin(x, y));
                        break;
                    case 3: // Spike
                        this.platforms.push({ x, y, width: TILE_SIZE, height: TILE_SIZE });
                        this.spikes.push(new Spike(x, y));
                        break;
                    case 4: // Goal
                        this.goal = new Goal(x, y);
                        break;
                    case 5: // Player Start
                        this.startX = x;
                        this.startY = y;
                        break;
                    case 6: // Speed Boost
                        this.powerups.push(new SpeedBoost(x, y));
                        break;
                    case 7: // Shield
                        this.powerups.push(new Shield(x, y));
                        break;
                }
            }
        }
    }

    update(deltaTime, player) {
        // Update coins and powerups (for animation)
        this.coins.forEach(coin => coin.update(deltaTime));
        this.powerups.forEach(pu => pu.update(deltaTime));

        // Check Coin Collisions
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (player.checkCollision(this.coins[i])) {
                this.coins.splice(i, 1);
                score += 10;
                audioManager.playCoinSound();
                updateHUD();
            }
        }

        // Check PowerUp Collisions
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            if (player.checkCollision(this.powerups[i])) {
                const pu = this.powerups[i];
                if (pu.type === 'speed') {
                    player.speedBoostTimer = 5000; // 5 seconds
                } else if (pu.type === 'shield') {
                    player.shieldTimer = 8000; // 8 seconds
                }
                audioManager.playPowerUpSound();
                this.powerups.splice(i, 1);
            }
        }

        // Check Spike Collisions
        for (let spike of this.spikes) {
            // Precise spike hitbox check
            if (player.checkCollision(spike)) {
                if (player.shieldTimer > 0) {
                    // Shield protects
                } else {
                    audioManager.playGameOverSound();
                    switchState(GameState.GAME_OVER);
                    return; 
                }
            }
        }

        // Check Goal Collision
        if (this.goal && player.checkCollision(this.goal)) {
            audioManager.playGoalSound();
            if (currentLevelIndex < levelsData.length - 1) {
                switchState(GameState.LEVEL_COMPLETE);
            } else {
                switchState(GameState.VICTORY);
            }
        }
    }

    draw(ctx) {
        // Draw Background based on theme
        if (this.theme === 'sky') {
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#87CEEB'); // Sky blue
            grad.addColorStop(1, '#E0F6FF'); // Lighter blue
            ctx.fillStyle = grad;
        } else if (this.theme === 'cave') {
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#2b2b2b');
            grad.addColorStop(1, '#4a4a4a');
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = '#333';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Platforms
        ctx.fillStyle = this.theme === 'cave' ? '#696969' : '#8B4513'; // Dirt color
        for (let p of this.platforms) {
            ctx.fillRect(p.x, p.y, p.width, p.height);
            // Draw grass on top for sky theme
            if (this.theme === 'sky') {
                ctx.fillStyle = '#228B22'; // Grass green
                ctx.fillRect(p.x, p.y, p.width, 10);
                ctx.fillStyle = '#8B4513'; // Reset back to dirt
            }
            // Draw simple border for platforms
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.strokeRect(p.x, p.y, p.width, p.height);
        }

        // Draw Entities
        if (this.goal) this.goal.draw(ctx);
        this.spikes.forEach(spike => spike.draw(ctx, this.theme));
        this.coins.forEach(coin => coin.draw(ctx));
        this.powerups.forEach(pu => pu.draw(ctx));
    }
}
