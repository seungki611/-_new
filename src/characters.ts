/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterConfig } from './types';

export const CHARACTERS: Record<string, CharacterConfig> = {
  SPONGEBOB: {
    type: 'SPONGEBOB',
    name: '스폰지밥',
    tagline: '바닷속에서 가장 긍정적이고 유연한 해면동물!',
    color: '#eab308', // Yellow-500
    accentColor: '#fde047', // Yellow-300
    secondaryColor: '#78350f', // Brown shorts
    speed: 7.2,
    jumpForce: 12.5,
    radius: 35,
    skillName: '네모네모 거품막 (Bubble Shield)',
    skillDesc: '일정 시간 동안 주변에 비눗방울 방패를 둘러 공을 튕겨내고 스피드가 증가합니다.',
    skillCooldown: 5000,
    skillDuration: 1500,
  },
  PATRICK: {
    type: 'PATRICK',
    name: '뚱이',
    tagline: '단단하고 묵직한 하이점퍼 아기 지 불가사리!',
    color: '#f43f5e', // Rose-500 (Pink)
    accentColor: '#fda4af', // Rose-300
    secondaryColor: '#4ade80', // Green shorts
    speed: 6.2,
    jumpForce: 14.5,
    radius: 38,
    skillName: '뚱이 다이빙 슬램 (Star Slam)',
    skillDesc: '높은 점프 후 급강하하며, 접촉한 볼을 상대 진영으로 묵직하게 스파이크해 버립니다.',
    skillCooldown: 6000,
    skillDuration: 1200,
  },
  SQUIDWARD: {
    type: 'SQUIDWARD',
    name: '징징이',
    tagline: '길쭉한 예술적 다리와 영혼 없는 테크니션!',
    color: '#14b8a6', // Teal-500
    accentColor: '#99f6e4', // Teal-200
    secondaryColor: '#b45309', // Brown shirt
    speed: 6.8,
    jumpForce: 11.5,
    radius: 33,
    skillName: '라 클라리넷 음파 (Clarinet Note)',
    skillDesc: '클라리넷 불협화음을 불어, 자신 전방 범위 안의 공을 염동력처럼 순간 밀어냅니다.',
    skillCooldown: 4000,
    skillDuration: 800,
  },
  SANDY: {
    type: 'SANDY',
    name: '다람이',
    tagline: '지상 최강 카라테 무공을 지닌 텍사스 다람쥐!',
    color: '#f97316', // Orange-500
    accentColor: '#ffedd5', // Orange-100
    secondaryColor: '#ffffff', // Astro suit
    speed: 8.8,
    jumpForce: 12.0,
    radius: 32,
    skillName: '카라테 일격촙 (Karate Chop)',
    skillDesc: '빠른 기동력을 살려 초스피드로 돌진하며 공을 강력하게 후려칩니다.',
    skillCooldown: 5500,
    skillDuration: 1000,
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
