class Player extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 5;
        this.speed = this.baseSpeed;
        this.jumpForce = -10;
        this.isGrounded = false;
        this.color = '#FF6347'; // Tomato color
        
        // Power-up states
        this.speedBoostTimer = 0;
        this.shieldTimer = 0;

        // Jump mechanics
        this.jumpsLeft = 2;
        this.canJump = true;
    }

    update(deltaTime, level) {
        // Update power-up timers
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= deltaTime;
            this.speed = this.baseSpeed * 1.6;
            if (this.speedBoostTimer <= 0) this.speed = this.baseSpeed;
        }

        if (this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime;
        }

        // Horizontal movement
        if (keys.left) {
            this.vx = -this.speed;
        } else if (keys.right) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }

        // Apply horizontal velocity
        this.x += this.vx;
        
        // Horizontal screen boundaries (Prevent vanishing in corners)
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        this.handleCollisions(level, 'horizontal');

        // Vertical movement (Gravity)
        this.vy += GRAVITY;
        
        // Double Jump Implementation
        if (keys.up) {
            if (this.canJump && this.jumpsLeft > 0) {
                this.vy = this.jumpForce;
                this.jumpsLeft--;
                this.isGrounded = false;
                this.canJump = false; // Require key release for next jump
            }
        } else {
            this.canJump = true; // Key released, can jump again if jumps left
        }

        // Apply vertical velocity
        this.y += this.vy;
        
        // Grounded check will be handled in collision
        const wasGrounded = this.isGrounded;
        this.isGrounded = false; 
        this.handleCollisions(level, 'vertical');
        
        // Reset jumps if we just landed
        if (this.isGrounded && !wasGrounded) {
            this.jumpsLeft = 2;
        }

        // Bounds checking (falling off map)
        if (this.y > canvas.height) {
            // Died by falling
            audioManager.playGameOverSound();
            switchState(GameState.GAME_OVER);
        }
    }

    handleCollisions(level, direction) {
        const platforms = level.platforms;
        
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            
            if (this.checkCollision(platform)) {
                if (direction === 'horizontal') {
                    if (this.vx > 0) { // Moving right
                        this.x = platform.x - this.width;
                    } else if (this.vx < 0) { // Moving left
                        this.x = platform.x + platform.width;
                    }
                    this.vx = 0;
                } else if (direction === 'vertical') {
                    if (this.vy > 0) { // Falling
                        this.y = platform.y - this.height;
                        this.isGrounded = true;
                    } else if (this.vy < 0) { // Jumping up into a block
                        this.y = platform.y + platform.height;
                    }
                    this.vy = 0;
                }
            }
        }
    }

    draw(ctx) {
        // Draw Shield effect
        if (this.shieldTimer > 0) {
            ctx.strokeStyle = '#ADFF2F';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
            ctx.stroke();
            
            // Pulsing inner shield
            ctx.fillStyle = 'rgba(173, 255, 47, 0.2)';
            ctx.fill();
        }

        // Draw Speed Boost effect (trails/afterimages)
        if (this.speedBoostTimer > 0) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(this.x - this.vx * 2, this.y, this.width, this.height);
            ctx.fillRect(this.x - this.vx * 4, this.y, this.width, this.height);
        }

        // Draw player body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw eyes to give it some character
        ctx.fillStyle = 'white';
        // Eye placement depends on direction moving
        let eyeOffset = 0;
        if(this.vx > 0) eyeOffset = 5;
        if(this.vx < 0) eyeOffset = -5;
        
        ctx.fillRect(this.x + 5 + eyeOffset, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17 + eyeOffset, this.y + 5, 8, 8);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 8 + eyeOffset, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 20 + eyeOffset, this.y + 8, 4, 4);
    }
}
