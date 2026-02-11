export type SoundEffect =
  | "click"
  | "pop"
  | "success"
  | "error"
  | "whoosh"
  | "celebrate";

class AudioController {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Initialize on first user interaction to handle autoplay policies
      window.addEventListener("click", () => this.init(), { once: true });
      window.addEventListener("touchstart", () => this.init(), { once: true });
      window.addEventListener("keydown", () => this.init(), { once: true });
    }
  }

  private init() {
    if (this.context) return;
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.3; // Default volume
    this.masterGain.connect(this.context.destination);
  }

  play(effect: SoundEffect) {
    if (!this.context || !this.masterGain) {
      // Try to init if not already (for edge cases where listeners didn't fire yet)
      this.init();
      if (!this.context || !this.masterGain) return;
    }

    if (this.context.state === "suspended") {
      this.context.resume();
    }

    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    switch (effect) {
      case "click":
        // Short high-pitch blip
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case "pop":
        // Cute bubble pop
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(1, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case "success":
        // Major chord arpeggio (C-E-G)
        this.playNote(523.25, t, 0.1, "sine"); // C5
        this.playNote(659.25, t + 0.1, 0.1, "sine"); // E5
        this.playNote(783.99, t + 0.2, 0.3, "sine"); // G5
        break;

      case "celebrate":
        // Fanfare
        this.playNote(523.25, t, 0.1, "triangle"); // C5
        this.playNote(523.25, t + 0.1, 0.1, "triangle"); // C5
        this.playNote(523.25, t + 0.2, 0.1, "triangle"); // C5
        this.playNote(783.99, t + 0.3, 0.6, "triangle"); // G5 (Long)
        break;

      case "error":
        // Low buzz/sawtooth slide down
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case "whoosh":
        // White noise burst
        const bufferSize = this.context.sampleRate * 0.3; // 0.3s
        const buffer = this.context.createBuffer(
          1,
          bufferSize,
          this.context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.3);

        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
        noise.stop(t + 0.3);
        break;
    }
  }

  private playNote(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = "sine",
  ) {
    if (!this.context || !this.masterGain) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.5, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(start);
    osc.stop(start + dur);
  }
}

export const audio = new AudioController();
