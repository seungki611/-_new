/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterType, SoundSynth } from './types';

class WebAudioSynth implements SoundSynth {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private bgmPlaying = false;
  private bgmVolumeNode: GainNode | null = null;

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay policies.
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmVolumeNode = this.ctx.createGain();
        this.bgmVolumeNode.gain.setValueAtTime(0.12, this.ctx.currentTime); // Gentle volume for BGM
        this.bgmVolumeNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    // Slide up
    osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playHit() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playScore() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Quick ascending major arpeggio
    const playNote = (freq: number, start: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration - 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(261.63, now, 0.08);      // C4
    playNote(329.63, now + 0.08, 0.08); // E4
    playNote(392.00, now + 0.16, 0.08); // G4
    playNote(523.25, now + 0.24, 0.2);  // C5
  }

  playConfetti() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.1;
      const freq = 400 + Math.random() * 600;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.005, now + delay + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    }
  }

  playSkill(char: CharacterType) {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (char) {
      case 'SPONGEBOB': {
        // Cute bubble pop sound effect (two high pop chirps)
        const makePop = (delay: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now + delay);
          osc.frequency.exponentialRampToValueAtTime(1400, now + delay + 0.06);
          gain.gain.setValueAtTime(0.18, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.07);
        };
        makePop(0);
        makePop(0.08);
        break;
      }
      case 'PATRICK': {
        // Star smash: Low, heavy crash sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.26);
        break;
      }
      case 'SQUIDWARD': {
        // Funny off-key squeaky clarinet note
        const osc = this.ctx.createOscillator();
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(349.23, now); // F4 clarinet squeak
        osc.frequency.linearRampToValueAtTime(370, now + 0.2); // slide up weirdly

        // Squeaky vibrato
        vibrato.frequency.setValueAtTime(12, now);
        vibratoGain.gain.setValueAtTime(15, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        vibrato.start();
        osc.start();
        vibrato.stop(now + 0.25);
        osc.stop(now + 0.25);
        break;
      }
      case 'SANDY': {
        // Karate chop: sharp swipe/shh sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.13);
        break;
      }
    }
  }

  toggleBGM(on: boolean) {
    this.initCtx();
    if (!this.ctx) return;

    if (on && !this.bgmPlaying) {
      this.bgmPlaying = true;
      let beat = 0;
      // Simple steelpan tropical rhythm
      const notes = [
        261.63, 293.66, 329.63, 392.00, // C4 D4 E4 G4
        329.63, 392.00, 440.00, 523.25, // E4 G4 A4 C5
      ];
      const chords = [
        [261.63, 329.63, 392.00], // C Maj
        [349.23, 440.00, 523.25], // F Maj
        [392.00, 493.88, 587.33], // G Maj
        [261.63, 329.63, 392.00], // C Maj
      ];

      this.bgmInterval = setInterval(() => {
        if (!this.ctx || !this.bgmPlaying || !this.bgmVolumeNode) return;
        const now = this.ctx.currentTime;

        // Play gentle island steel drum bass on beat 0, 4, 8, 12, etc. Give a syncopated groove
        if (beat % 4 === 0) {
          const chordIndex = Math.floor(beat / 4) % chords.length;
          const chord = chords[chordIndex];
          chord.forEach((freq, idx) => {
            if (!this.ctx || !this.bgmVolumeNode) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq / 2, now); // Low bass sound
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.bgmVolumeNode);
            osc.start();
            osc.stop(now + 0.4);
          });
        }

        // Play upbeat melody notes count
        if (beat % 2 !== 0 && Math.random() > 0.3) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteIndex = (beat + Math.floor(Math.random() * 3)) % notes.length;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(notes[noteIndex], now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.bgmVolumeNode);
          osc.start();
          osc.stop(now + 0.16);
        }

        beat = (beat + 1) % 16;
      }, 150); // Fast upbeat bubble tropical feel
    } else if (!on && this.bgmPlaying) {
      this.bgmPlaying = false;
      if (this.bgmInterval) {
        clearInterval(this.bgmInterval);
        this.bgmInterval = null;
      }
    }
  }

  isBGMOn(): boolean {
    return this.bgmPlaying;
  }
}

export const audioSynth = new WebAudioSynth();
