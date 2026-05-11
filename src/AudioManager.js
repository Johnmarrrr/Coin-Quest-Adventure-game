class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playCoinSound() {
        this.beep(880, 0.1, 'triangle'); // High pitch beep
        setTimeout(() => this.beep(1320, 0.1, 'triangle'), 50); // Second higher pitch beep
    }

    playPowerUpSound() {
        this.beep(440, 0.1, 'square');
        setTimeout(() => this.beep(660, 0.1, 'square'), 100);
        setTimeout(() => this.beep(880, 0.2, 'square'), 200);
    }

    playGoalSound() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        notes.forEach((freq, i) => {
            setTimeout(() => this.beep(freq, 0.2, 'sine'), i * 150);
        });
    }

    playGameOverSound() {
        this.beep(220, 0.3, 'sawtooth');
        setTimeout(() => this.beep(110, 0.5, 'sawtooth'), 200);
    }

    beep(frequency, duration, type = 'sine') {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + duration);
    }
}

const audioManager = new AudioManager();
