/**
 * BioGuessr - Motore Audio Sintetizzato di Laboratorio (Web Audio API)
 * Include suoni realistici per pipetta, torretta microscopio, striscio su agar,
 * sfoglio pagine dei quaderni, incubatore e flusso laminare della cappa BSL-2.
 */
(function () {
  class LabAudio {
    constructor() {
      this.enabled = true;
      this.volume = 0.8;
      this.ctx = null;
      this.hoodNodes = null;
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, Number(val)));
      if (this.hoodNodes && this.hoodNodes.gain && this.ctx) {
        this.hoodNodes.gain.gain.setTargetAtTime(0.016 * this.volume, this.ctx.currentTime, 0.05);
      }
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (!this.enabled) {
        this.setHoodHum(false);
      } else {
        this.playClick();
      }
      return this.enabled;
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.042);
      gain.gain.setValueAtTime(0.075 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }

    playPageFlip() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * 0.11);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI) * 0.8;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.11);
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(now);
    }

    playMicroscopeClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.05].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 980 : 1380, now + offset);
        osc.frequency.exponentialRampToValueAtTime(440, now + offset + 0.035);
        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.045);
      });
    }

    playPipetteDrop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Leggera pressione bulbo in gomma + plop goccia liquida
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(1120, now + 0.085);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    playStreak(shortGrain) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const dur = shortGrain ? 0.065 : 0.17;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.linearRampToValueAtTime(2450, now + dur);
      filter.Q.value = 3.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(shortGrain ? 0.04 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    playDrop() {
      this.playPipetteDrop();
    }

    playBubbles() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 10; i++) {
        const start = now + i * 0.036 + Math.random() * 0.02;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = 680 + Math.random() * 940;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, start + 0.045);
        gain.gain.setValueAtTime(0.045, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.055);
      }
    }

    playIncubatorChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        const start = now + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.085, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    }

    setHoodHum(active) {
      if (!active || !this.enabled) {
        if (this.hoodNodes) {
          try {
            const now = this.ctx ? this.ctx.currentTime : 0;
            this.hoodNodes.gain.gain.setTargetAtTime(0.0001, now, 0.08);
            const src = this.hoodNodes.src;
            setTimeout(() => {
              try {
                src.stop();
              } catch (_) {}
            }, 220);
          } catch (_) {}
          this.hoodNodes = null;
        }
        return;
      }

      if (this.hoodNodes) return;
      this.init();
      if (!this.ctx) return;

      // Rumore bianco soffice filtrato per simulare il flusso laminare HEPA
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 340;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.setTargetAtTime(0.016 * this.volume, this.ctx.currentTime, 0.25);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start();
      this.hoodNodes = { src, gain };
    }

    playWrong() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [220, 175].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.06, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.17);
      });
    }

    playWin() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.085;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.11, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    }

    playTransitionSwoosh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Reazione chimica con effervescenza e zoom microscopico
      this.playBubbles();
      
      const dur = 1.2;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin((i / bufferSize) * Math.PI), 1.5);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(3800, now + 0.6);
      filter.frequency.exponentialRampToValueAtTime(400, now + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    playGameOver() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [349.23, 311.13, 277.18, 233.08];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    }
  }

  window.labAudio = new LabAudio();
})();
