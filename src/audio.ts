/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmIntervalId: any = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  
  // Custom audio file tracks placeholders (if user wants to swap in MP3 files)
  private jumpSoundUrl: string = ''; // Place .mp3 URL here
  private deathSoundUrl: string = ''; // Place .mp3 URL here
  private bgmUrl: string = '';       // Place .mp3 URL here

  constructor() {
    // Initialized lazily under user interaction to satisfy browser security policies
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play Jump sound (Synthesized retro sound)
   */
  public playJump() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Optional: Load and play mp3 instead
    if (this.jumpSoundUrl) {
      this.playAudioFile(this.jumpSoundUrl);
      return;
    }

    // Procedural synthesis: square wave sweeping upwards
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    
    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Play Coin collect chime sound
   */
  public playCoin() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(880, now + 0.07); // A5 sweep up

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.002, now + 0.24);
    
    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Play Crash/Death sound (Synthesized retro sound)
   */
  public playDeath() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Optional: Load and play mp3 instead
    if (this.deathSoundUrl) {
      this.playAudioFile(this.deathSoundUrl);
      return;
    }

    // Procedural synthesis: noise explosion + low-passing pitch drop
    const now = this.ctx.currentTime;
    
    // Low rumble pitch drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.51);

    // Crash noise bursts
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      if (this.masterGain) noiseGain.connect(this.masterGain);
      
      noise.start(now);
      noise.stop(now + 0.4);
    } catch (err) {
      // Buffer creation fallback
    }
  }

  /**
   * Starts fully responsive looping procedural electronic rhythms representing BGM
   */
  public startBGM() {
    this.init();
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.init();

    if (!this.ctx) return;
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.bgmUrl) {
      // Loop user BGM file
      this.playBGMFile(this.bgmUrl);
      return;
    }

    // Create a procedural tracker beat
    let stepCount = 0;
    const tempo = 140; // BPM
    const stepDuration = 60 / tempo / 2; // Eighth notes
    
    // Simple synth rhythm chords sequence (Rhythm Dash theme: Am, F, G, Em style)
    const melody = [
      // Step: pitch frequencies
      220, 220, 330, 220,  // Bass Am
      174, 174, 261, 174,  // Bass F
      196, 196, 293, 196,  // Bass G
      165, 165, 247, 165   // Bass Em
    ];

    const playStep = () => {
      if (!this.ctx || !this.bgmPlaying || this.isMuted) return;
      const now = this.ctx.currentTime;
      
      const freq = melody[stepCount % melody.length];
      
      // Synthesize rhythmic bass pulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq / 2, now); // Octave lower for bass rhythm
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration * 0.9);
      
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      
      osc.start(now);
      osc.stop(now + stepDuration);

      // Simple Hi-Hat tick tick on odd steps
      if (stepCount % 2 === 1) {
        const hhOsc = this.ctx.createOscillator();
        const hhGain = this.ctx.createGain();
        hhOsc.type = 'triangle';
        hhOsc.frequency.setValueAtTime(10000, now);
        hhGain.gain.setValueAtTime(0.015, now);
        hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        hhOsc.connect(hhGain);
        if (this.masterGain) hhGain.connect(this.masterGain);
        hhOsc.start(now);
        hhOsc.stop(now + 0.04);
      }

      // Simple kick on beat (steps 0, 4, 8, 12, etc)
      if (stepCount % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        
        kickGain.gain.setValueAtTime(0.2, now);
        kickGain.gain.exponentialRampToValueAtTime(0.005, now + 0.13);
        
        kickOsc.connect(kickGain);
        if (this.masterGain) kickGain.connect(this.masterGain);
        
        kickOsc.start(now);
        kickOsc.stop(now + 0.14);
      }

      stepCount++;
      
      // Schedule next step precisely
      const nextTime = (stepDuration * 1000) - 10; // offset for timers
      this.bgmIntervalId = setTimeout(playStep, Math.max(10, nextTime));
    };

    // Begin looping
    playStep();
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmIntervalId) {
      clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // Play audio file utility (loads URL asynchronously)
  private playAudioFile(url: string) {
    if (!this.ctx) return;
    const audio = new Audio(url);
    const source = this.ctx.createMediaElementSource(audio);
    if (this.masterGain) source.connect(this.masterGain);
    audio.play().catch(e => console.log("Audio file play error:", e));
  }

  private playBGMFile(url: string) {
    if (!this.ctx) return;
    const audio = new Audio(url);
    audio.loop = true;
    const source = this.ctx.createMediaElementSource(audio);
    if (this.masterGain) source.connect(this.masterGain);
    audio.play().catch(e => console.log("BGM file play error:", e));
  }
}

export const gameAudio = new AudioEngine();
