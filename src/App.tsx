/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Keyboard,
  RefreshCw,
  User,
  Cpu,
  Trophy,
  Play,
  HelpCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { audioSynth } from './audio';
import { CHARACTER_LIST, CHARACTERS } from './characters';
import { GameState, GameMode, Player, Ball } from './types';
import { drawBackground, drawNet, drawPlayer, drawBall, drawParticles } from './renderer';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number; // frames
  life: number; // frames
}

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('VS_AI');
  const [aiDifficulty, setAiDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
  const [targetScore, setTargetScore] = useState<number>(5);
  const [p1Character, setP1Character] = useState<string>('SPONGEBOB');
  const [p2Character, setP2Character] = useState<string>('PATRICK');
  const [bgmActive, setBgmActive] = useState<boolean>(false);
  const [winner, setWinner] = useState<'P1' | 'P2' | null>(null);

  // Stats Counters
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [consecutiveTouches, setConsecutiveTouches] = useState<number>(0);
  const [lastTouchId, setLastTouchId] = useState<'P1' | 'P2' | null>(null);

  // Active Key Flags
  const keysPressed = useRef<Record<string, boolean>>({});

  // Canvas details
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Physics engine states
  const p1Ref = useRef<Player>({
    id: 'P1',
    x: 150,
    y: 460,
    vx: 0,
    vy: 0,
    width: 60,
    height: 70,
    isGrounded: true,
    character: CHARACTERS.SPONGEBOB,
    score: 0,
    touches: 0,
    skillCooldownTimer: 0,
    skillActiveTimer: 0,
    facingLeft: false,
  });

  const p2Ref = useRef<Player>({
    id: 'P2',
    x: 650,
    y: 460,
    vx: 0,
    vy: 0,
    width: 60,
    height: 70,
    isGrounded: true,
    character: CHARACTERS.PATRICK,
    score: 0,
    touches: 0,
    skillCooldownTimer: 0,
    skillActiveTimer: 0,
    facingLeft: true,
  });

  const ballRef = useRef<Ball>({
    x: 200,
    y: 150,
    vx: 2,
    vy: 0,
    radius: 16,
    spin: 0,
    lastTouchBy: null,
    netCollided: false,
  });

  // Kinetic items
  const particlesRef = useRef<Particle[]>([]);
  const backgroundBubbles = useRef<Array<{ x: number; y: number; speed: number; radius: number }>>([]);
  const backgroundJellyfish = useRef<Array<{ x: number; y: number; angle: number; speed: number; size: number }>>([]);

  // Initialize Sea Environment Particles
  useEffect(() => {
    // Spawn background bubbles
    const bubbles = [];
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        speed: 0.5 + Math.random() * 0.8,
        radius: 3 + Math.random() * 6,
      });
    }
    backgroundBubbles.current = bubbles;

    // Spawn cute swimming jellyfish
    const jf = [
      { x: 100, y: 100, angle: 0, speed: 0.4, size: 15 },
      { x: 380, y: 80, angle: 1.5, speed: 0.3, size: 18 },
      { x: 700, y: 120, angle: 3, speed: 0.5, size: 14 },
    ];
    backgroundJellyfish.current = jf;
  }, []);

  // Set character configs when changed
  useEffect(() => {
    p1Ref.current.character = CHARACTERS[p1Character];
    p2Ref.current.character = CHARACTERS[p2Character];
  }, [p1Character, p2Character]);

  // Audio start trigger on user click
  const handleToggleBgm = () => {
    const newState = !bgmActive;
    setBgmActive(newState);
    audioSynth.toggleBGM(newState);
  };

  // Add explosive impact particles
  const addImpactParticles = (x: number, y: number, color: string, count = 10) => {
    const temp: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      temp.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1,
        maxLife: 20 + Math.floor(Math.random() * 20),
        life: 0,
      });
    }
    particlesRef.current = [...particlesRef.current, ...temp];
  };

  // Reset ball to a serving position above the player who scored
  const serveBall = (servingPlayer: 'P1' | 'P2') => {
    const ball = ballRef.current;
    ball.x = servingPlayer === 'P1' ? 200 : 600;
    ball.y = 100;
    ball.vx = servingPlayer === 'P1' ? 1.5 : -1.5;
    ball.vy = 0;
    ball.spin = 0;
    ball.lastTouchBy = null;
    setConsecutiveTouches(0);
    setLastTouchId(null);
  };

  // Trigger active skill
  const activateSkill = (player: Player) => {
    if (player.skillCooldownTimer > 0) return; // on cooldown

    player.skillCooldownTimer = player.character.skillCooldown;
    player.skillActiveTimer = player.character.skillDuration;

    audioSynth.playSkill(player.character.type);

    // Apply immediate skill-specific physical boosts
    if (player.character.type === 'PATRICK') {
      // Jump and slam down instantly if already in air
      if (!player.isGrounded) {
        player.vy = 14;
        addImpactParticles(player.x, player.y - player.height / 2, '#fda4af', 15);
      } else {
        player.vy = -player.character.jumpForce * 1.1; // super jump
      }
    } else if (player.character.type === 'SANDY') {
      // Karate dash horizontally
      player.vx = player.facingLeft ? -15 : 15;
      addImpactParticles(player.x, player.y - player.height / 2, '#f97316', 12);
    } else if (player.character.type === 'SQUIDWARD') {
      // Clarinet push wave: evaluate ball pushing from distance
      const ball = ballRef.current;
      const dx = ball.x - player.x;
      const dy = ball.y - (player.y - player.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If ball is within 130px and Squidward is facing the ball
      const isFacingBall = player.facingLeft ? dx < 0 : dx > 0;
      if (dist < 130 && isFacingBall) {
        ball.vx = player.facingLeft ? -11 : 11;
        ball.vy = -6;
        ball.lastTouchBy = player.id;
        addImpactParticles(ball.x, ball.y, '#2dd4bf', 15);
        audioSynth.playHit();
      }
    } else if (player.character.type === 'SPONGEBOB') {
      // speed boost immediate
      player.vx = player.facingLeft ? -11 : 11;
    }
  };

  // Human on-screen control helper triggers (click gamepad)
  const handleGamepadPress = (action: 'LEFT' | 'RIGHT' | 'UP' | 'SKILL') => {
    const p1 = p1Ref.current;
    if (action === 'LEFT') {
      keysPressed.current['KeyA'] = true;
      setTimeout(() => { keysPressed.current['KeyA'] = false; }, 180);
    } else if (action === 'RIGHT') {
      keysPressed.current['KeyD'] = true;
      setTimeout(() => { keysPressed.current['KeyD'] = false; }, 180);
    } else if (action === 'UP') {
      keysPressed.current['KeyW'] = true;
      setTimeout(() => { keysPressed.current['KeyW'] = false; }, 150);
    } else if (action === 'SKILL') {
      activateSkill(p1);
    }
  };

  // Reset core game state to play again
  const startPlaying = (mode: GameMode) => {
    setGameMode(mode);
    setP1Score(0);
    setP2Score(0);
    p1Ref.current.score = 0;
    p2Ref.current.score = 0;
    p1Ref.current.x = 150;
    p2Ref.current.x = 650;
    p1Ref.current.vy = 0;
    p2Ref.current.vy = 0;
    p1Ref.current.skillCooldownTimer = 0;
    p2Ref.current.skillCooldownTimer = 0;
    p1Ref.current.skillActiveTimer = 0;
    p2Ref.current.skillActiveTimer = 0;

    setWinner(null);
    setGameState('PLAYING');
    serveBall('P1');
  };

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // Single triggers
      if (e.code === 'Space') {
        activateSkill(p1Ref.current);
        e.preventDefault();
      }
      if (e.code === 'KeyW' && p1Ref.current.isGrounded) {
        audioSynth.playJump();
      }
      if (e.code === 'ArrowUp' && gameMode === 'VS_2P' && p2Ref.current.isGrounded) {
        audioSynth.playJump();
      }
      if ((e.code === 'Numpad0' || e.code === 'Enter') && gameMode === 'VS_2P') {
        activateSkill(p2Ref.current);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode]);

  // Main Loop logic (physics update & frame rendering)
  const updateGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gravity = 0.42;
    const friction = 0.985;
    const p1 = p1Ref.current;
    const p2 = p2Ref.current;
    const ball = ballRef.current;

    // --- 1. Bubble & Jellyfish motion update ---
    backgroundBubbles.current.forEach((b) => {
      b.y -= b.speed;
      if (b.y < -10) {
        b.y = 510;
        b.x = Math.random() * 800;
      }
    });

    backgroundJellyfish.current.forEach((j) => {
      j.x += Math.cos(j.angle) * j.speed;
      j.y += Math.sin(j.angle) * j.speed * 0.5;
      j.angle += 0.01;
      if (j.x < -30) j.x = 830;
      if (j.x > 830) j.x = -30;
    });

    // --- 2. Update player skills timers ---
    [p1, p2].forEach((p) => {
      if (p.skillCooldownTimer > 0) {
        p.skillCooldownTimer = Math.max(0, p.skillCooldownTimer - 16.67); // roughly 60fps frame delta
      }
      if (p.skillActiveTimer > 0) {
        p.skillActiveTimer = Math.max(0, p.skillActiveTimer - 16.67);
      }
    });

    // --- 3. Player 1 Movement Integration ---
    // Active skill modifies speed stats
    const p1Speed = p1.character.speed * (p1.skillActiveTimer > 0 ? 1.4 : 1.0);
    p1.vx = 0;
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft'] && gameMode === 'VS_AI') {
      p1.vx = -p1Speed;
      p1.facingLeft = true;
    }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight'] && gameMode === 'VS_AI') {
      p1.vx = p1Speed;
      p1.facingLeft = false;
    }
    if (keysPressed.current['KeyW'] && p1.isGrounded) {
      p1.vy = -p1.character.jumpForce;
      p1.isGrounded = false;
    }

    // Apply Player 1 Physics
    p1.vy += gravity;
    p1.x += p1.vx;
    p1.y += p1.vy;

    // Keep Player 1 within their left side boundary
    if (p1.x < p1.width / 2) {
      p1.x = p1.width / 2;
    }
    if (p1.x > 400 - p1.width / 2 - 4) {
      p1.x = 400 - p1.width / 2 - 4; // cannot cross the net (x=400)
    }
    if (p1.y >= 460) {
      p1.y = 460;
      p1.vy = 0;
      p1.isGrounded = true;
    }

    // --- 4. Player 2 (Local 2P or AI Bot) Movement Integration ---
    if (gameMode === 'VS_2P') {
      const p2Speed = p2.character.speed * (p2.skillActiveTimer > 0 ? 1.4 : 1.0);
      p2.vx = 0;
      if (keysPressed.current['ArrowLeft']) {
        p2.vx = -p2Speed;
        p2.facingLeft = true;
      }
      if (keysPressed.current['ArrowRight']) {
        p2.vx = p2Speed;
        p2.facingLeft = false;
      }
      if (keysPressed.current['ArrowUp'] && p2.isGrounded) {
        p2.vy = -p2.character.jumpForce;
        p2.isGrounded = false;
      }

      // Apply Player 2 physics
      p2.vy += gravity;
      p2.x += p2.vx;
      p2.y += p2.vy;
    } else {
      // Intelligent AI Bot Engine
      const aiSpeedCoefficient = aiDifficulty === 'EASY' ? 0.65 : aiDifficulty === 'NORMAL' ? 0.82 : 1.05;
      const p2Speed = p2.character.speed * aiSpeedCoefficient * (p2.skillActiveTimer > 0 ? 1.3 : 1.0);
      
      // Target position
      let targetX = 640; // Default sweet spot on the right court
      
      if (ball.x > 380) {
        // Ball is on AI side or heading there, perform physical target prediction!
        if (aiDifficulty === 'HARD') {
          // Hard predicts landing spots ahead of time
          const timeToDescend = (ball.vy + Math.sqrt(ball.vy * ball.vy + 2 * gravity * (460 - ball.y))) / gravity;
          targetX = ball.x + ball.vx * Math.min(timeToDescend, 18);
        } else {
          // Easy or normal tracks ball raw X directly
          targetX = ball.x;
        }
      } else {
        // Ball is on P1 side, retract to comfort default defensive spot
        targetX = 620;
      }

      // Smooth steering toward target
      const dx = targetX - p2.x;
      p2.vx = 0;
      if (Math.abs(dx) > 10) {
        p2.vx = Math.sign(dx) * p2Speed;
        p2.facingLeft = dx < 0;
      }

      // AI Jump triggers
      const isBallVerticalMatch = Math.abs(ball.x - p2.x) < 55;
      const isBallFloatNear = ball.y > 180 && ball.y < 340;
      
      if (isBallVerticalMatch && isBallFloatNear && p2.isGrounded && Math.random() < (aiDifficulty === 'HARD' ? 0.15 : 0.06)) {
        p2.vy = -p2.character.jumpForce;
        p2.isGrounded = false;
        audioSynth.playJump();
      }

      // AI Skill Trigger decisions
      const isCloseBallSkill = Math.abs(ball.x - p2.x) < 100 && Math.abs(ball.y - (p2.y - 45)) < 110;
      if (isCloseBallSkill && p2.skillCooldownTimer === 0 && Math.random() < 0.05) {
        activateSkill(p2);
      }

      p2.vy += gravity;
      p2.x += p2.vx;
      p2.y += p2.vy;
    }

    // Keep Player 2 within their right side boundary
    if (p2.x < 400 + p2.width / 2 + 4) {
      p2.x = 400 + p2.width / 2 + 4; // cannot cross the net (x=400)
    }
    if (p2.x > 800 - p2.width / 2) {
      p2.x = 800 - p2.width / 2;
    }
    if (p2.y >= 460) {
      p2.y = 460;
      p2.vy = 0;
      p2.isGrounded = true;
    }

    // --- 5. Physical Ball Movement Integration ---
    const ballGravity = 0.22; // low under the sea gravity makes volleys long and spectacular!
    ball.vy += ballGravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Apply friction/drag resistance
    ball.vx *= 0.994;
    ball.vy *= 0.994;

    // Ceiling boundaries bounce
    if (ball.y < ball.radius) {
      ball.y = ball.radius;
      ball.vy = -ball.vy * 0.85;
      audioSynth.playHit();
    }
    // Left & Right full solid wall bounds bounce
    if (ball.x < ball.radius) {
      ball.x = ball.radius;
      ball.vx = -ball.vx * 0.85;
      audioSynth.playHit();
    }
    if (ball.x > 800 - ball.radius) {
      ball.x = 800 - ball.radius;
      ball.vx = -ball.vx * 0.85;
      audioSynth.playHit();
    }

    // --- 6. Central Net Collisions Logic ---
    // Net is situated at x = 400, top is y = 330, goes down to 460 (sandfloor)
    const netTop = 330;
    const netX = 400;

    if (ball.y > netTop - ball.radius && ball.y < 460) {
      // Ball is vertically in range of the net divider
      if (ball.x > netX - ball.radius - 8 && ball.x < netX + ball.radius + 8) {
        // Horizontal overlap occurs!
        if (ball.y <= netTop + 5) {
          // Ball hit the top edge pulley of the net! Bounce up dynamically
          ball.y = netTop - ball.radius;
          ball.vy = -Math.abs(ball.vy) * 0.95;
          ball.vx = (ball.x < netX ? -2 : 2) * (1.2 + Math.random() * 2);
          addImpactParticles(netX, netTop, '#ca8a04', 12);
        } else {
          // Ball hit the side of the meshネット!
          if (ball.x < netX) {
            // coming from left
            ball.x = netX - ball.radius - 4;
            ball.vx = -Math.abs(ball.vx) * 0.8;
          } else {
            // coming from right
            ball.x = netX + ball.radius + 4;
            ball.vx = Math.abs(ball.vx) * 0.8;
          }
          addImpactParticles(ball.x, ball.y, '#ffffff', 8);
        }
        audioSynth.playHit();
      }
    }

    // --- 7. Player vs Ball Collisions ---
    [p1, p2].forEach((player) => {
      const pCenterY = player.y - player.height / 2.2;
      const dx = ball.x - player.x;
      const dy = ball.y - pCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check standard Spongebob Bubble active skill extra large collision shield
      const actualPlayerRadius = player.id === 'P1' && p1Character === 'SPONGEBOB' && p1.skillActiveTimer > 0 
        ? player.character.radius * 1.5 
        : player.character.radius;

      const collLimit = actualPlayerRadius + ball.radius;

      if (distance < collLimit) {
        // Collided!
        audioSynth.playHit();
        addImpactParticles(ball.x, ball.y, player.character.color, 12);

        // Update score tally tracking logs
        if (lastTouchId !== player.id) {
          setConsecutiveTouches(1);
          setLastTouchId(player.id);
        } else {
          setConsecutiveTouches((prev) => prev + 1);
        }
        ball.lastTouchBy = player.id;

        // Push ball cleanly out of player bounds
        const nx = dx / distance;
        const ny = dy / distance;
        ball.x = player.x + nx * (collLimit + 1);
        ball.y = pCenterY + ny * (collLimit + 1);

        // Calculate bounce impact velocities
        const rvx = ball.vx - player.vx;
        const rvy = ball.vy - player.vy;
        const velNormal = rvx * nx + rvy * ny;

        if (velNormal < 0) {
          const bounceCoeff = 1.08; // high energy rebound
          const impulse = -(1 + bounceCoeff) * velNormal;
          
          ball.vx = player.vx + nx * impulse;
          ball.vy = player.vy + ny * impulse;
        }

        // Apply skill modifications on hits
        if (player.skillActiveTimer > 0) {
          if (player.character.type === 'PATRICK') {
            // Heavy slam spike direction down
            ball.vy = 12.5;
            ball.vx = player.facingLeft ? -7.5 : 7.5;
            addImpactParticles(ball.x, ball.y, '#f43f5e', 20);
          } else if (player.character.type === 'SANDY') {
            // Karate diagonal chop
            ball.vx = player.facingLeft ? -13.5 : 13.5;
            ball.vy = -3.5;
            addImpactParticles(ball.x, ball.y, '#f97316', 15);
          } else if (player.character.type === 'SPONGEBOB') {
            // Elastic shield launch
            ball.vx = nx * 13;
            ball.vy = ny * 13 - 2;
          }
        } else {
          // Normal redirection pop
          ball.vy = Math.min(ball.vy, -4.5); // always pop upward slightly on touch to encourage gameplay
        }

        // Add fun rotation/spin values
        ball.spin += (ball.vx / 4) * 0.15;
      }
    });

    // --- 8. Particle systems physics ---
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

    // --- 9. Scoring and Round Reset ---
    // If the ball hits the floor sand (y = 460 - ball.radius)
    if (ball.y >= 460 - ball.radius) {
      // Land sparks
      addImpactParticles(ball.x, 460, '#eab308', 25);
      audioSynth.playScore();

      if (ball.x < 400) {
        // Landed on Player 1's court -> Player 2 wins point!
        setP2Score((prev) => {
          const n = prev + 1;
          if (n >= targetScore) {
            setWinner('P2');
            setGameState('GAME_OVER');
            audioSynth.playConfetti();
          } else {
            serveBall('P2');
          }
          return n;
        });
      } else {
        // Landed on Player 2's court -> Player 1 wins point!
        setP1Score((prev) => {
          const n = prev + 1;
          if (n >= targetScore) {
            setWinner('P1');
            setGameState('GAME_OVER');
            audioSynth.playConfetti();
          } else {
            serveBall('P1');
          }
          return n;
        });
      }
      return; // exit loop to reset serve cleanly
    }

    // --- 10. Draw everything recursively ---
    ctx.clearRect(0, 0, 800, 500);

    // Draw Sea visual graphics
    drawBackground(ctx, 800, 500, backgroundBubbles.current, backgroundJellyfish.current);
    
    // Draw Bamboo central net
    drawNet(ctx, 400, 310, 150);

    // Draw active particle clouds
    drawParticles(ctx, particlesRef.current);

    // Draw Characters
    drawPlayer(ctx, p1);
    drawPlayer(ctx, p2);

    // Draw Ball
    drawBall(ctx, ball);

    // Loop callback
    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameMode, aiDifficulty, targetScore, lastTouchId, p1Character, p2Character]);

  // Handle game animation hook
  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, updateGame]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-yellow-400 selection:text-slate-900 font-sans leading-normal">
      
      {/* HEADER CONTROL BAR */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-3 bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl spin-slow">
            🍍
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-yellow-300 via-rose-300 to-teal-200 bg-clip-text text-transparent">
              스폰지밥 발리볼 아케이드
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Bikini Bottom Volleyball v1.2</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Loop BGM trigger */}
          <button
            onClick={handleToggleBgm}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 border ${
              bgmActive 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                : 'bg-slate-700/60 text-slate-400 border-slate-600/40 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {bgmActive ? (
              <>
                <Volume2 size={14} className="animate-bounce" />
                <span>배경음 ON</span>
              </>
            ) : (
              <>
                <VolumeX size={14} />
                <span>배경음 무음</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- SCREEN 1: TITLE SCREEN --- */}
      {gameState === 'TITLE' && (
        <section className="w-full max-w-4xl bg-gradient-to-b from-sky-950 to-slate-900 border border-sky-800/60 rouned-3xl px-8 py-12 rounded-3xl text-center shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          {/* Bubble backdrop decoration */}
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-sky-500/5 filter blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-yellow-500/5 filter blur-xl animate-pulse" />

          <div className="my-auto">
            <span className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold mb-4 inline-block">
              UNDER THE SEA 2D PHYSICS GAME
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-yellow-300 tracking-tight leading-none mb-3 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
              스폰지밥 발리볼
            </h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto mb-8 font-medium">
              피카츄 배구 추억을 담은 Bikini Bottom의 해변 스포츠! 귀여운 캐릭터들과 고유의 액티브 점프 기술을 활용해 최강의 챔피언에 도전하세요.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <button
                onClick={() => {
                  setGameMode('VS_AI');
                  setGameState('CHARACTER_SELECT');
                }}
                className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/35 rounded-2xl hover:border-yellow-400 transition-all cursor-pointer hover:shadow-xl hover:shadow-yellow-500/5"
              >
                <Cpu className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="font-extrabold text-yellow-200 text-sm">싱글플레이 (vs 인공지능)</span>
                <span className="text-[11px] text-slate-400 mt-1 font-mono">가장 빠르고 간편하게 즐기는 AI전</span>
              </button>

              <button
                onClick={() => {
                  setGameMode('VS_2P');
                  setGameState('CHARACTER_SELECT');
                }}
                className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/35 rounded-2xl hover:border-teal-400 transition-all cursor-pointer hover:shadow-xl hover:shadow-teal-500/5"
              >
                <User className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="font-extrabold text-teal-200 text-sm">듀얼플레이 (2인 로컬 대전)</span>
                <span className="text-[11px] text-slate-400 mt-1 font-mono">한 키보드로 즐기는 우정 파괴 매치</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Keyboard size={14} className="text-yellow-400" />
              <span>P1 이동: A/D 점프: W 기술: Space</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={14} className="text-teal-400" />
              <span>전 수컷/암컷 고유의 개성적인 필살기 보유</span>
            </span>
          </div>
        </section>
      )}

      {/* --- SCREEN 2: CHARACTER SELECT SCREEN --- */}
      {gameState === 'CHARACTER_SELECT' && (
        <section className="w-full max-w-4xl bg-slate-800/90 border border-slate-700/60 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-5">
            <div>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded uppercase font-mono font-bold">
                SETUP MATCH
              </span>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
                캐릭터 선택 및 대전 환경
              </h2>
            </div>
            <button
              onClick={() => setGameState('TITLE')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              메인으로 가기
            </button>
          </div>

          {/* CUSTOM SETTINGS BAR */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/40 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wider font-mono">목표 득점 점수 설정</h4>
              <div className="flex gap-2">
                {[5, 10, 15].map((score) => (
                  <button
                    key={score}
                    onClick={() => setTargetScore(score)}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${
                      targetScore === score
                        ? 'bg-yellow-400 text-slate-900 border-yellow-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {score} 점 내기
                  </button>
                ))}
              </div>
            </div>

            {gameMode === 'VS_AI' && (
              <div>
                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wider font-mono">AI 인공지능 난이도</h4>
                <div className="flex gap-2">
                  {(['EASY', 'NORMAL', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setAiDifficulty(diff)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${
                        aiDifficulty === diff
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {diff === 'EASY' ? '쉬움' : diff === 'NORMAL' ? '보통' : '어려움'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PLAYER 1 SELECT SECTOR */}
            <div className="bg-slate-900/50 p-4 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">1P</div>
                <h3 className="font-bold text-blue-400 text-sm">Player 1 선택</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {CHARACTER_LIST.map((char) => (
                  <button
                    key={char.type}
                    onClick={() => {
                      setP1Character(char.type);
                      audioSynth.playSkill(char.type);
                    }}
                    style={{ borderColor: p1Character === char.type ? char.color : 'rgba(51, 65, 85, 0.4)' }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      p1Character === char.type 
                        ? 'bg-slate-800 shadow-lg' 
                        : 'bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm" style={{ color: p1Character === char.type ? char.color : '#cbd5e1' }}>
                        {char.name}
                      </span>
                      {p1Character === char.type && <span className="text-xs text-yellow-400">★</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">{char.tagline}</span>
                  </button>
                ))}
              </div>

              {/* Character Details Box */}
              <div className="mt-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40 text-xs">
                <span className="font-bold text-slate-200 block mb-1">
                  고유 필살기 : {CHARACTERS[p1Character].skillName}
                </span>
                <p className="text-slate-400 leading-normal text-[11px] mb-3">{CHARACTERS[p1Character].skillDesc}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-700/40">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>이동 속도 (Speed)</span>
                    <span className="text-yellow-400">★ ★ ★ ★ {CHARACTERS[p1Character].speed > 8 ? '★' : '☆'}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>점프 세기 (Jump)</span>
                    <span className="text-rose-400">★ ★ ★ ★ {CHARACTERS[p1Character].jumpForce > 13 ? '★' : '☆'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PLAYER 2 / AI SELECT SECTOR */}
            <div className="bg-slate-900/50 p-4 border border-rose-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {gameMode === 'VS_2P' ? '2P' : 'AI'}
                </div>
                <h3 className="font-bold text-rose-400 text-sm">
                  {gameMode === 'VS_2P' ? 'Player 2 선택' : '상대 인공지능 선택'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {CHARACTER_LIST.map((char) => (
                  <button
                    key={char.type}
                    onClick={() => {
                      setP2Character(char.type);
                      audioSynth.playSkill(char.type);
                    }}
                    style={{ borderColor: p2Character === char.type ? char.color : 'rgba(51, 65, 85, 0.4)' }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      p2Character === char.type 
                        ? 'bg-slate-800 shadow-lg' 
                        : 'bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm" style={{ color: p2Character === char.type ? char.color : '#cbd5e1' }}>
                        {char.name}
                      </span>
                      {p2Character === char.type && <span className="text-xs text-yellow-400">★</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">{char.tagline}</span>
                  </button>
                ))}
              </div>

              {/* Character Details Box */}
              <div className="mt-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40 text-xs">
                <span className="font-bold text-slate-200 block mb-1">
                  고유 필살기 : {CHARACTERS[p2Character].skillName}
                </span>
                <p className="text-slate-400 leading-normal text-[11px] mb-3">{CHARACTERS[p2Character].skillDesc}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-700/40">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>이동 속도 (Speed)</span>
                    <span className="text-yellow-400">★ ★ ★ ★ {CHARACTERS[p2Character].speed > 8 ? '★' : '☆'}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>점프 세기 (Jump)</span>
                    <span className="text-rose-400">★ ★ ★ ★ {CHARACTERS[p2Character].jumpForce > 13 ? '★' : '☆'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => startPlaying(gameMode)}
              className="px-10 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 text-slate-950 rounded-2xl text-base font-black hover:scale-105 active:scale-95 transition-all text-center shadow-lg hover:shadow-yellow-400/20 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Play fill="currentColor" size={16} />
              시합 시작하기 (Play Ball!)
            </button>
          </div>
        </section>
      )}

      {/* --- SCREEN 3: ACTIVE PLAYING GAME SCREEN --- */}
      {gameState === 'PLAYING' && (
        <section className="w-full max-w-4xl flex flex-col justify-center">
          
          {/* STATS & SCORE BOARD */}
          <div className="w-full grid grid-cols-3 items-center bg-slate-800 border border-slate-700 px-6 py-4 rounded-t-3xl shadow-lg">
            
            {/* PLAYER 1 PANEL */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl relative flex items-center justify-center font-extrabold text-[#111] overflow-hidden"
                style={{ backgroundColor: CHARACTERS[p1Character].color }}
              >
                {CHARACTERS[p1Character].name[0]}
                {p1Ref.current.skillActiveTimer > 0 && (
                  <div className="absolute inset-0 bg-sky-500/40 flex items-center justify-center">
                    <Zap size={14} className="text-white animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-bold">1P</span>
                <h4 className="font-bold text-xs mt-0.5 text-slate-100 dark:text-gray-100 truncate">{CHARACTERS[p1Character].name}</h4>
                {/* Cooldown bar */}
                <div className="w-20 bg-slate-700/60 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full transition-all duration-100" 
                    style={{ width: `${Math.max(0, 100 - (p1Ref.current.skillCooldownTimer / CHARACTERS[p1Character].skillCooldown) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* MAIN CENTRAL SCOREBOARD PANEL */}
            <div className="text-center">
              <div className="inline-flex items-center gap-4 bg-slate-900 border border-slate-700/60 px-5 py-2.5 rounded-2xl shadow-xl">
                <span className="text-3xl font-black text-blue-400 font-mono tracking-tight">{p1Score}</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">VS</span>
                <span className="text-3xl font-black text-rose-400 font-mono tracking-tight">{p2Score}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center justify-center gap-1">
                <span>목표 점수: <b className="text-yellow-400">{targetScore}</b></span>
                {gameMode === 'VS_AI' && (
                  <>
                    <span>•</span>
                    <span>AI 난이도: <b className="text-rose-400">{aiDifficulty}</b></span>
                  </>
                )}
              </div>
            </div>

            {/* PLAYER 2 / AI PANEL */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div className="min-w-0">
                <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded font-bold">
                  {gameMode === 'VS_2P' ? '2P' : 'BOT'}
                </span>
                <h4 className="font-bold text-xs mt-0.5 text-slate-100 truncate">{CHARACTERS[p2Character].name}</h4>
                {/* Cooldown bar */}
                <div className="w-20 bg-slate-700/60 h-1.5 rounded-full mt-1 overflow-hidden block ml-auto">
                  <div 
                    className="bg-rose-500 h-full transition-all duration-100" 
                    style={{ width: `${Math.max(0, 100 - (p2Ref.current.skillCooldownTimer / CHARACTERS[p2Character].skillCooldown) * 100)}%` }} 
                  />
                </div>
              </div>
              <div 
                className="w-10 h-10 rounded-xl relative flex items-center justify-center font-extrabold text-[#111] overflow-hidden"
                style={{ backgroundColor: CHARACTERS[p2Character].color }}
              >
                {CHARACTERS[p2Character].name[0]}
                {p2Ref.current.skillActiveTimer > 0 && (
                  <div className="absolute inset-0 bg-rose-500/40 flex items-center justify-center">
                    <Zap size={14} className="text-white animate-pulse" />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* GAME CANVAS STAGE */}
          <div className="relative bg-black overflow-hidden border-x border-b border-slate-700 shadow-2xl flex items-center justify-center">
            <canvas
              ref={canvasRef}
              id="game-canvas"
              width={800}
              height={500}
              className="max-w-full aspect-[8/5] bg-sky-950 cursor-pointer block"
            />

            {/* Serve help bubble popup overlay */}
            {consecutiveTouches === 0 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none animate-bounce">
                <div className="bg-yellow-400 text-slate-900 border border-yellow-300 rounded-xl px-4 py-1.5 shadow-xl text-xs font-extrabold flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  <span>이동(A/D/방향키), 점프(W/위방향키), 필살기(Space/Numpad0)</span>
                </div>
              </div>
            )}
          </div>

          {/* CONTROL PAD FOR MOUSE CLICKS / MOBILE ACCESSIBILITY */}
          <div className="mt-4 bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-300">🎮 마우스 온스크린 플레이 제어기:</span>
              <span className="text-slate-400 hidden sm:inline">키보드가 없을 시, 아래 패드를 클릭하여 실시간 조작이 가능합니다.</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleGamepadPress('LEFT')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 active:scale-95 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1"
              >
                ◀ 좌측 이동
              </button>
              <button
                onClick={() => handleGamepadPress('UP')}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 active:scale-95 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1"
              >
                ▲ 점프
              </button>
              <button
                onClick={() => handleGamepadPress('RIGHT')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 active:scale-95 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1"
              >
                ▶ 우측 이동
              </button>
              <button
                onClick={() => handleGamepadPress('SKILL')}
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-350 active:scale-95 text-slate-950 font-black rounded-lg cursor-pointer flex items-center gap-1"
              >
                💥 필살 거품막 기공(Skill)
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setGameState('CHARACTER_SELECT')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← 캐릭터 다시 선택
            </button>
            <button
              onClick={() => startPlaying(gameMode)}
              className="text-xs text-yellow-400 hover:text-yellow-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              <span>경기 재시작 (Restart Match)</span>
            </button>
          </div>

        </section>
      )}

      {/* --- SCREEN 4: GAME OVER SCREEN --- */}
      {gameState === 'GAME_OVER' && (
        <section className="w-full max-w-lg bg-slate-800 border-2 border-yellow-400/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 bg-yellow-500/5 w-48 h-48 rounded-full filter blur-3xl animate-pulse" />

          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
          
          <span className="text-[10px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
            VICTORY CHAMPION
          </span>

          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-100">
            {winner === 'P1' ? CHARACTERS[p1Character].name : CHARACTERS[p2Character].name} 우승!
          </h2>
          
          <p className="text-slate-400 text-xs max-w-sm mx-auto mt-2 mb-6">
            최종 점수 <b className="text-blue-400 text-sm font-mono">{p1Score}</b> vs <b className="text-rose-400 text-sm font-mono">{p2Score}</b>를 달리며 대망의 Bikini Bottom 스포츠 매치 우승 타이틀을 거머쥐었습니다!
          </p>

          <div className="space-y-2 max-w-xs mx-auto">
            <button
              onClick={() => startPlaying(gameMode)}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm cursor-pointer shadow-md shadow-yellow-500/10"
            >
              방금 그 모드로 복수전 (Rematch)
            </button>
            <button
              onClick={() => setGameState('CHARACTER_SELECT')}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-bold rounded-xl text-xs cursor-pointer hover:text-white transition-colors"
            >
              캐릭터 선택으로 이동
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="w-full max-w-4xl text-center mt-6 text-[11px] text-slate-500 font-mono flex items-center justify-between px-3 border-t border-slate-800/40 pt-4">
        <span>© 2026 Spongebob Volleyball Arcade Engine</span>
        <span>HTML5 Canvas & Web Audio Synthesizer</span>
      </footer>
    </div>
  );
}
