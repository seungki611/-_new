/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'TITLE' | 'CHARACTER_SELECT' | 'PLAYING' | 'GAME_OVER';

export type GameMode = 'VS_AI' | 'VS_2P';

export type CharacterType = 'SPONGEBOB' | 'PATRICK' | 'SQUIDWARD' | 'SANDY';

export interface CharacterConfig {
  type: CharacterType;
  name: string;
  tagline: string;
  color: string;
  accentColor: string;
  secondaryColor: string;
  speed: number;
  jumpForce: number;
  radius: number;
  skillName: string;
  skillDesc: string;
  skillCooldown: number; // millisecond
  skillDuration: number; // duration of skill effect in ms
}

export interface Player {
  id: 'P1' | 'P2';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  character: CharacterConfig;
  score: number;
  touches: number;
  skillCooldownTimer: number; // ms remaining
  skillActiveTimer: number; // ms active remaining
  facingLeft: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spin: number; // angular speed
  lastTouchBy: 'P1' | 'P2' | null;
  netCollided: boolean;
}

export interface SoundSynth {
  playJump: () => void;
  playHit: () => void;
  playScore: () => void;
  playSkill: (char: CharacterType) => void;
  playConfetti: () => void;
  toggleBGM: (on: boolean) => void;
  isBGMOn: () => boolean;
}
