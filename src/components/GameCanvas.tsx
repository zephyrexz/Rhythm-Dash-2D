import React, { useEffect, useRef, useState } from 'react';
import { GameState, Player, Obstacle, Particle, Vector2D, Coin, SkinType, ObstacleType } from '../types';
import { gameAudio } from '../audio';
import { HomeScreenOverlay } from './HomeScreenOverlay';
import { ShopOverlay } from './ShopOverlay';
import { TopupOverlay } from './TopupOverlay';
import { GameOverOverlay } from './GameOverOverlay';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onHighScoreUpdate: (score: number) => void;
  onGameStateChange: (state: GameState) => void;
  gameState: GameState;
  isMuted: boolean;
  isElectron: boolean;
  toggleMute?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onScoreUpdate,
  onHighScoreUpdate,
  onGameStateChange,
  gameState,
  isMuted,
  isElectron,
  toggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // VIEWPORT MEASUREMENTS
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const viewportWidthRef = useRef<number>(window.innerWidth);
  const viewportHeightRef = useRef<number>(window.innerHeight);

  // SCORING AND ECONOMY STATE
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_highscore');
      return persisted ? parseInt(persisted, 10) : 0;
    } catch { return 0; }
  });

  const [dashTokens, setDashTokens] = useState<number>(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_tokens');
      return persisted ? parseInt(persisted, 10) : 0;
    } catch { return 0; }
  });

  const [equippedSkin, setEquippedSkin] = useState<SkinType>(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_equipped_skin');
      return (persisted as SkinType) || 'CYAN';
    } catch { return 'CYAN'; }
  });

  const [unlockedSkins, setUnlockedSkins] = useState<SkinType[]>(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_unlocked_skins');
      return persisted ? JSON.parse(persisted) : ['CYAN'];
    } catch { return ['CYAN']; }
  });

  const [equippedTrail, setEquippedTrail] = useState<string>(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_equipped_trail');
      return persisted || 'DEFAULT';
    } catch { return 'DEFAULT'; }
  });

  const [unlockedTrails, setUnlockedTrails] = useState<string[]>(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_unlocked_trails');
      return persisted ? JSON.parse(persisted) : ['DEFAULT'];
    } catch { return ['DEFAULT']; }
  });

  // GAMEPLAY UTILITY STATES
  const [tokensCollectedThisRun, setTokensCollectedThisRun] = useState<number>(0);
  const [countdownVal, setCountdownVal] = useState<number | string | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  
  // STATS TRACKING
  const [comboCount, setComboCount] = useState<number>(0);
  const [maxComboThisRun, setMaxComboThisRun] = useState<number>(0);
  const [totalJumps, setTotalJumps] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('rhythm_dash_total_jumps') || '0', 10); } catch { return 0; }
  });

  // CLAIM FLAGS
  const [jumpsClaimed, setJumpsClaimed] = useState<boolean>(() => {
    try { return localStorage.getItem('rhythm_dash_mission_jumps_claimed') === 'true'; } catch { return false; }
  });
  const [scoreClaimed, setScoreClaimed] = useState<boolean>(() => {
    try { return localStorage.getItem('rhythm_dash_mission_score_claimed') === 'true'; } catch { return false; }
  });
  const [comboClaimed, setComboClaimed] = useState<boolean>(() => {
    try { return localStorage.getItem('rhythm_dash_mission_combo_claimed') === 'true'; } catch { return false; }
  });
  const [hasAchievedMaxCombo, setHasAchievedMaxCombo] = useState<boolean>(() => {
    try { return localStorage.getItem('rhythm_dash_achieved_max_combo') === 'true'; } catch { return false; }
  });
  const [lastDailyClaim, setLastDailyClaim] = useState<string>(() => {
    try { return localStorage.getItem('rhythm_dash_daily_last_claim') || ''; } catch { return ''; }
  });

  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // REFS TO PREVENT LAG / OVERHEAD IN RAPID CANVAS LOOP
  const requestRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  
  const playerRef = useRef<Player>({
    x: 0, y: 0, width: 34, height: 34, vy: 0,
    onGround: true, rotation: 0, targetRotation: 0, rotationSpeed: 0,
    jumpBuffered: false, bufferTimer: 0, trailTimer: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);

  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const hasAchievedMaxComboRef = useRef<boolean>(hasAchievedMaxCombo);
  const speedRef = useRef<number>(1);
  
  const lastSpawnRef = useRef<number>(0);
  const lastCoinSpawnRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);
  const countdownActiveRef = useRef<boolean>(false);
  const countdownTimersRef = useRef<any[]>([]);

  const skinRef = useRef<SkinType>(equippedSkin);
  const trailRef = useRef<string>(equippedTrail);

  // Sync state parameters to refs
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    skinRef.current = equippedSkin;
  }, [equippedSkin]);

  useEffect(() => {
    trailRef.current = equippedTrail;
  }, [equippedTrail]);

  useEffect(() => {
    comboRef.current = comboCount;
    if (comboCount > maxComboThisRun) {
      setMaxComboThisRun(comboCount);
    }
    if (comboCount >= 10 && !hasAchievedMaxCombo) {
      setHasAchievedMaxCombo(true);
      hasAchievedMaxComboRef.current = true;
      try { localStorage.setItem('rhythm_dash_achieved_max_combo', 'true'); } catch {}
    }
  }, [comboCount, maxComboThisRun, hasAchievedMaxCombo]);

  // Touch support check
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const addDashTokens = (amount: number) => {
    setDashTokens(prev => {
      const u = Math.max(0, prev + amount);
      try { localStorage.setItem('rhythm_dash_tokens', u.toString()); } catch {}
      return u;
    });
  };

  const claimDaily = () => {
    const today = new Date().toDateString();
    if (lastDailyClaim === today) return;
    addDashTokens(25);
    setLastDailyClaim(today);
    try { localStorage.setItem('rhythm_dash_daily_last_claim', today); } catch {}
    gameAudio.playCoin();
    spawnGlitterAtCenter(0.5);
  };

  const claimJumps = () => {
    if (totalJumps < 30 || jumpsClaimed) return;
    addDashTokens(50);
    setJumpsClaimed(true);
    try { localStorage.setItem('rhythm_dash_mission_jumps_claimed', 'true'); } catch {}
    gameAudio.playCoin();
    spawnGlitterAtCenter(0.3);
  };

  const claimScore = () => {
    if (highScore < 50 || scoreClaimed) return;
    addDashTokens(100);
    setScoreClaimed(true);
    try { localStorage.setItem('rhythm_dash_mission_score_claimed', 'true'); } catch {}
    gameAudio.playCoin();
    spawnGlitterAtCenter(0.4);
  };

  const claimCombo = () => {
    if (!hasAchievedMaxCombo || comboClaimed) return;
    addDashTokens(150);
    setComboClaimed(true);
    try { localStorage.setItem('rhythm_dash_mission_combo_claimed', 'true'); } catch {}
    gameAudio.playCoin();
    spawnGlitterAtCenter(0.5);
  };

  const spawnGlitterAtCenter = (ratio: number) => {
    const W = viewportWidthRef.current;
    const H = viewportHeightRef.current;
    const floorY = H - 100;
    for (let i = 0; i < 24; i++) {
      particlesRef.current.push({
        x: W / 2 + (Math.random() - 0.5) * 200,
        y: floorY - 120 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 2,
        size: Math.random() * 5 + 3,
        color: '#FFD700',
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 20)
      });
    }
  };

  // TRIGGER KEY / TOUCH INTERACTION
  const triggerJump = () => {
    if (gameStateRef.current !== 'PLAYING' || countdownActiveRef.current) return;
    
    const player = playerRef.current;
    const H = viewportHeightRef.current;
    const gravity = H * 0.0016;
    const jumpForce = -Math.sqrt(2 * gravity * (H * 0.28));

    if (player.onGround) {
      player.vy = jumpForce;
      player.onGround = false;
      player.targetRotation = player.rotation + Math.PI / 2;
      player.rotationSpeed = Math.PI / 2 / 24;
      gameAudio.playJump();

      setTotalJumps(prev => {
        const u = prev + 1;
        try { localStorage.setItem('rhythm_dash_total_jumps', u.toString()); } catch {}
        return u;
      });

      spawnSplashParticles(player.x + player.width / 2, H - 100, 8);
    } else {
      // Buffer a potential jump in mid-air
      player.jumpBuffered = true;
      player.bufferTimer = 16; 
    }
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Do not jump if player clicks on overlays, UI layers, or buttons
    if (target && (target.closest('button') || target.closest('[id*="overlay"]') || target.closest('[id*="button"]'))) {
      return;
    }
    triggerJump();
  };

  // RESET GAME BOARD FOR NEW RUN
  const resetGame = () => {
    scoreRef.current = 0;
    setCurrentScore(0);
    onScoreUpdate(0);
    setTokensCollectedThisRun(0);
    setComboCount(0);
    setMaxComboThisRun(0);

    const W = viewportWidthRef.current;
    const H = viewportHeightRef.current;
    
    // Dino Chrome Style Initial Speed adjusted to viewport width
    const baseSpeed = 4.5;
    speedRef.current = W * (baseSpeed / 1000);
    distanceTraveledRef.current = 0;
    screenShakeRef.current = 0;
    obstaclesRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    lastSpawnRef.current = W;
    lastCoinSpawnRef.current = W + 200;

    const pSize = Math.max(34, Math.min(46, H * 0.08));
    playerRef.current = {
      x: W * 0.15,
      y: H - 100 - pSize,
      width: pSize,
      height: pSize,
      vy: 0,
      onGround: true,
      rotation: 0,
      targetRotation: 0,
      rotationSpeed: 0,
      jumpBuffered: false,
      bufferTimer: 0,
      trailTimer: 0
    };
  };

  const triggerDeath = () => {
    onGameStateChange('GAME_OVER');
    gameAudio.playDeath();
    screenShakeRef.current = 18;
    
    const p = playerRef.current;
    spawnDeathExplosion(p.x + p.width / 2, p.y + p.height / 2);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      onHighScoreUpdate(scoreRef.current);
      try { localStorage.setItem('rhythm_dash_highscore', scoreRef.current.toString()); } catch {}
    }
  };

  // DYNAMIC COMPONENT RESIZE CAPABILITY (FILLING 100% SCREEN)
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      setViewport({ width: w, height: h });
      viewportWidthRef.current = w;
      viewportHeightRef.current = h;

      canvas.width = w;
      canvas.height = h;

      // Adjust player horizontal anchor and sizing on operational resize
      const p = playerRef.current;
      p.x = w * 0.15;
      const pSize = Math.max(34, Math.min(46, h * 0.08));
      p.width = pSize;
      p.height = pSize;
      if (p.onGround) {
        p.y = h - 100 - pSize;
      }
    };

    // Build parallax background stars initially
    const w = window.innerWidth;
    const h = window.innerHeight;
    const stars: any[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * (h - 150),
        size: Math.random() * 2.8 + 0.6,
        speed: Math.random() * 0.65 + 0.15
      });
    }
    starsRef.current = stars;

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // START IN-GAME COUNTDOWN TIMER
  const startCountdownSequence = () => {
    setIsCountdownActive(true);
    countdownActiveRef.current = true;
    setCountdownVal(3);
    
    countdownTimersRef.current.forEach(t => clearTimeout(t));
    countdownTimersRef.current = [];

    const triggerTimer = (val: number | string | null, delay: number, nextCb?: () => void) => {
      const t = setTimeout(() => {
        setCountdownVal(val);
        if (nextCb) nextCb();
      }, delay);
      countdownTimersRef.current.push(t);
    };

    triggerTimer(2, 600);
    triggerTimer(1, 1200);
    triggerTimer('DASH', 1800);
    triggerTimer(null, 2400, () => {
      setIsCountdownActive(false);
      countdownActiveRef.current = false;
    });
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
      startCountdownSequence();
    }
    return () => {
      countdownTimersRef.current.forEach(t => clearTimeout(t));
    };
  }, [gameState]);

  // ROTATIONAL MATH FOR COLLISION SAT MODEL
  const rotatePoint = (x: number, y: number, cx: number, cy: number, angle: number): Vector2D => {
    const cosVal = Math.cos(angle);
    const sinVal = Math.sin(angle);
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + (dx * cosVal - dy * sinVal),
      y: cy + (dx * sinVal + dy * cosVal)
    };
  };

  const satCollision = (poly1: Vector2D[], poly2: Vector2D[]): boolean => {
    const polys = [poly1, poly2];
    for (let i = 0; i < polys.length; i++) {
      const p = polys[i];
      for (let j = 0; j < p.length; j++) {
        const nIdx = (j + 1) % p.length;
        const edge = { x: p[nIdx].x - p[j].x, y: p[nIdx].y - p[j].y };
        const normal = { x: -edge.y, y: edge.x };
        
        const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        if (len === 0) continue;
        normal.x /= len;
        normal.y /= len;
        
        let min1: number | null = null;
        let max1: number | null = null;
        for (let k = 0; k < poly1.length; k++) {
          const projected = poly1[k].x * normal.x + poly1[k].y * normal.y;
          if (min1 === null || projected < min1) min1 = projected;
          if (max1 === null || projected > max1) max1 = projected;
        }
        
        let min2: number | null = null;
        let max2: number | null = null;
        for (let k = 0; k < poly2.length; k++) {
          const projected = poly2[k].x * normal.x + poly2[k].y * normal.y;
          if (min2 === null || projected < min2) min2 = projected;
          if (max2 === null || projected > max2) max2 = projected;
        }
        
        if (min1! > max2! || min2! > max1!) {
          return false; // Verified safe clearance
        }
      }
    }
    return true; 
  };

  // CHECK COLLISIONS
  const checkCollisions = () => {
    const player = playerRef.current;
    const obstacles = obstaclesRef.current;
    
    const pCenter = {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2
    };
    
    const p0 = rotatePoint(player.x, player.y, pCenter.x, pCenter.y, player.rotation);
    const p1 = rotatePoint(player.x + player.width, player.y, pCenter.x, pCenter.y, player.rotation);
    const p2 = rotatePoint(player.x + player.width, player.y + player.height, pCenter.x, pCenter.y, player.rotation);
    const p3 = rotatePoint(player.x, player.y + player.height, pCenter.x, pCenter.y, player.rotation);
    const playerPoly: Vector2D[] = [p0, p1, p2, p3];

    for (const obs of obstacles) {
      if (obs.type === 'BLOCK' || obs.type === 'HANGING_PILLAR') {
        const obsPoly: Vector2D[] = [
          { x: obs.x, y: obs.y },
          { x: obs.x + obs.width, y: obs.y },
          { x: obs.x + obs.width, y: obs.y + obs.height },
          { x: obs.x, y: obs.y + obs.height }
        ];
        
        if (satCollision(playerPoly, obsPoly)) {
          triggerDeath();
          return;
        }
      } else if (obs.type === 'SPIKE_SINGLE') {
        const obsPoly: Vector2D[] = [
          { x: obs.x, y: obs.y + obs.height },
          { x: obs.x + obs.width / 2, y: obs.y + 1 },
          { x: obs.x + obs.width, y: obs.y + obs.height }
        ];
        
        if (satCollision(playerPoly, obsPoly)) {
          triggerDeath();
          return;
        }
      } else if (obs.type === 'SPIKE_DOUBLE') {
        const halfWidth = obs.width / 2;
        
        const spike1: Vector2D[] = [
          { x: obs.x, y: obs.y + obs.height },
          { x: obs.x + halfWidth / 2, y: obs.y + 1 },
          { x: obs.x + halfWidth, y: obs.y + obs.height }
        ];

        const spike2: Vector2D[] = [
          { x: obs.x + halfWidth, y: obs.y + obs.height },
          { x: obs.x + halfWidth + halfWidth / 2, y: obs.y + 1 },
          { x: obs.x + obs.width, y: obs.y + obs.height }
        ];

        if (satCollision(playerPoly, spike1) || satCollision(playerPoly, spike2)) {
          triggerDeath();
          return;
        }
      } else if (obs.type === 'SPIKE_TRIPLE') {
        const thirdWidth = obs.width / 3;

        const spike1: Vector2D[] = [
          { x: obs.x, y: obs.y + obs.height },
          { x: obs.x + thirdWidth / 2, y: obs.y + 1 },
          { x: obs.x + thirdWidth, y: obs.y + obs.height }
        ];

        const spike2: Vector2D[] = [
          { x: obs.x + thirdWidth, y: obs.y + obs.height },
          { x: obs.x + thirdWidth + thirdWidth/2, y: obs.y + 1 },
          { x: obs.x + thirdWidth * 2, y: obs.y + obs.height }
        ];

        const spike3: Vector2D[] = [
          { x: obs.x + thirdWidth * 2, y: obs.y + obs.height },
          { x: obs.x + thirdWidth * 2 + thirdWidth/2, y: obs.y + 1 },
          { x: obs.x + obs.width, y: obs.y + obs.height }
        ];

        if (satCollision(playerPoly, spike1) || satCollision(playerPoly, spike2) || satCollision(playerPoly, spike3)) {
          triggerDeath();
          return;
        }
      }
    }
  };

  const checkCoinCollisions = () => {
    const player = playerRef.current;
    const coins = coinsRef.current;
    
    const pBox = {
      left: player.x,
      right: player.x + player.width,
      top: player.y,
      bottom: player.y + player.height
    };

    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      if (coin.collected) continue;

      const cBox = {
        left: coin.x,
        right: coin.x + coin.width,
        top: coin.y,
        bottom: coin.y + coin.height
      };

      const overlaps = !(
        pBox.right < cBox.left ||
        pBox.left > cBox.right ||
        pBox.bottom < cBox.top ||
        pBox.top > cBox.bottom
      );

      if (overlaps) {
        coin.collected = true;
        gameAudio.playCoin();
        
        spawnCoinSparkles(coin.x + coin.width / 2, coin.y + coin.height / 2);
        setTokensCollectedThisRun(prev => prev + 1);
        addDashTokens(1);
        
        coins.splice(i, 1);
      }
    }
  };

  const distanceTraveledRef = useRef<number>(0);

  // PROCEDURAL HARDCORE OBSTACLES GENERATION 
  const spawnObstacle = () => {
    const W = viewportWidthRef.current;
    const H = viewportHeightRef.current;
    const floorY = H - 100;
    const gravity = H * 0.0016;
    const jumpForce = -Math.sqrt(2 * gravity * (H * 0.28));
    const currentSpeed = speedRef.current;
    const scoreVal = scoreRef.current;

    // Minimum jumpability space safety verification
    const airTimeFrames = Math.abs(jumpForce / gravity) * 2;
    const gapMultiplier = Math.max(1.12, 1.35 - Math.floor(scoreVal / 5) * 0.035);
    const minSafeGap = currentSpeed * airTimeFrames * gapMultiplier;

    const distanceSinceLastSpawn = W - lastSpawnRef.current;
    if (distanceSinceLastSpawn < minSafeGap) {
      return; 
    }

    const r = Math.random();
    let type: ObstacleType = 'SPIKE_SINGLE';
    
    let width = Math.max(26, Math.min(48, W * 0.045));
    let height = Math.max(26, Math.min(48, H * 0.08));
    let customY = floorY - height;

    if (scoreVal < 10) {
      if (r < 0.45) {
        type = 'SPIKE_SINGLE';
      } else if (r < 0.8) {
        type = 'SPIKE_DOUBLE';
        width = Math.max(52, Math.min(96, W * 0.09));
      } else {
        type = 'BLOCK';
        width = Math.max(28, Math.min(50, W * 0.048));
        height = Math.max(28, Math.min(50, H * 0.085));
      }
      customY = floorY - height;
    } else {
      if (r < 0.22) {
        type = 'SPIKE_SINGLE';
      } else if (r < 0.44) {
        type = 'SPIKE_DOUBLE';
        width = Math.max(52, Math.min(96, W * 0.09));
      } else if (r < 0.62) {
        type = 'BLOCK';
        width = Math.max(28, Math.min(50, W * 0.048));
        height = Math.max(28, Math.min(50, H * 0.085));
      } else if (r < 0.82) {
        type = 'SPIKE_TRIPLE';
        width = Math.max(78, Math.min(144, W * 0.135));
      } else {
        type = 'HANGING_PILLAR';
        width = Math.max(30, Math.min(52, W * 0.05));
        height = H * 0.35;
        customY = floorY - H * 0.45; 
      }
      if (type !== 'HANGING_PILLAR') {
        customY = floorY - height;
      }
    }

    // Do not overlap immediate coins
    const isOverlappingCoin = coinsRef.current.some(coin => Math.abs(coin.x - (W + 60)) < 260);
    if (isOverlappingCoin) return;

    const newObstacle: Obstacle = {
      id: Math.random().toString(36).substring(2, 9),
      x: W + 60,
      y: customY,
      width,
      height,
      type,
      passed: false
    };

    obstaclesRef.current.push(newObstacle);
    lastSpawnRef.current = W + 60;
  };

  // HIGH BALANCED SINGLE COIN SPAWNING
  const spawnCoin = () => {
    const W = viewportWidthRef.current;
    const H = viewportHeightRef.current;
    const floorY = H - 100;

    const distanceSinceLastCoin = W - lastCoinSpawnRef.current;
    if (distanceSinceLastCoin < 300) return;

    const targetX = W + 60;

    // Enforce 550 minimum spacing buffer from other coins
    const isTooCloseToCoins = coinsRef.current.some(coin => Math.abs(coin.x - targetX) < 550);
    if (isTooCloseToCoins) return;

    // Enforce 350 minimum spacing buffer from obstacles
    const isTooCloseToObstacles = obstaclesRef.current.some(obs => Math.abs(obs.x - targetX) < 350);
    if (isTooCloseToObstacles) return;

    const heights = [
      floorY - H * 0.12, 
      floorY - H * 0.26, 
      floorY - H * 0.38  
    ];
    const targetY = heights[Math.floor(Math.random() * heights.length)];
    const coinSize = Math.max(16, Math.min(26, H * 0.05));

    const newCoin: Coin = {
      id: Math.random().toString(36).substring(2, 9),
      x: targetX,
      y: targetY,
      width: coinSize,
      height: coinSize,
      collected: false,
      pulseOffset: Math.random() * Math.PI * 2
    };

    coinsRef.current.push(newCoin);
    lastCoinSpawnRef.current = targetX;
  };

  // SPARKLE AND SPLASH GENERATORS
  const spawnSplashParticles = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y: y - 2,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 3.5 - 1,
        size: Math.random() * 2.5 + 1.5,
        color: 'rgba(0, 240, 255, 0.75)',
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 12 + 8)
      });
    }
  };

  const spawnCoinSparkles = (x: number, y: number) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: Math.random() * 3 + 2,
        color: '#FFD700',
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 15 + 10)
      });
    }
  };

  const spawnDeathExplosion = (x: number, y: number) => {
    const skinColor = skinRef.current === 'FLAME' ? '#FF5500' : skinRef.current === 'MATRIX' ? '#39FF14' : skinRef.current === 'STRIPE' ? '#E0115F' : skinRef.current === 'GOLD' ? '#FFD700' : skinRef.current === 'OVERLORD' ? '#8A2BE2' : skinRef.current === 'GLITCH' ? '#FF0055' : '#00FFCC';
    for (let i = 0; i < 35; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        size: Math.random() * 6 + 3,
        color: Math.random() > 0.4 ? skinColor : '#FFFFFF',
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 30 + 20),
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.15
      });
    }
  };

  const spawnTrailParticle = (x: number, y: number) => {
    const activeTrail = trailRef.current;
    const currentSpeed = speedRef.current;

    if (activeTrail === 'FIRE') {
      const size = Math.random() * 8 + 4;
      const rColors = ['rgba(255, 30, 0, 0.7)', 'rgba(255, 120, 0, 0.7)', 'rgba(255, 200, 0, 0.7)'];
      const color = rColors[Math.floor(Math.random() * rColors.length)];
      particlesRef.current.push({
        x,
        y: y + (Math.random() - 0.5) * 8,
        vx: -(currentSpeed * 0.45) - Math.random() * 2,
        vy: -Math.random() * 2.5 + 0.5,
        size,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 12 + 10)
      });
    } else if (activeTrail === 'RAINBOW') {
      const h = (Date.now() / 10) % 360;
      const color = `hsla(${h}, 100%, 50%, 0.85)`;
      const size = Math.random() * 6 + 3;
      particlesRef.current.push({
        x,
        y,
        vx: -(currentSpeed * 0.4) - Math.random() * 1.5,
        vy: (Math.random() - 0.5) * 3,
        size,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 20 + 15)
      });
    } else if (activeTrail === 'CHRONO_PORTAL') {
      const size = Math.random() * 8 + 4;
      const color = Math.random() > 0.5 ? 'rgba(255, 0, 234, 0.8)' : 'rgba(157, 0, 255, 0.8)';
      particlesRef.current.push({
        x,
        y: y + (Math.random() - 0.5) * 14,
        vx: -(currentSpeed * 0.4) - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        size,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 15 + 15),
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    } else if (activeTrail === 'VOID_EMISSION') {
      const size = Math.random() * 10 + 6;
      const color = Math.random() > 0.5 ? 'rgba(15, 0, 30, 0.9)' : 'rgba(138, 43, 226, 0.7)';
      particlesRef.current.push({
        x,
        y: y + (Math.random() - 0.5) * 10,
        vx: -(currentSpeed * 0.3) - Math.random() * 1,
        vy: -Math.random() * 1.5 - 0.5, 
        size,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 20)
      });
    } else {
      const size = Math.random() * 5 + 2.5;
      const activeSkin = skinRef.current;
      let color = `rgba(0, 240, 255, ${Math.random() * 0.4 + 0.4})`;
      if (activeSkin === 'FLAME') {
        color = `rgba(255, 85, 0, ${Math.random() * 0.4 + 0.4})`;
      } else if (activeSkin === 'MATRIX') {
        color = `rgba(57, 255, 20, ${Math.random() * 0.4 + 0.4})`;
      } else if (activeSkin === 'STRIPE') {
        color = `rgba(224, 17, 95, ${Math.random() * 0.4 + 0.4})`;
      } else if (activeSkin === 'GOLD') {
        color = `rgba(255, 215, 0, ${Math.random() * 0.4 + 0.4})`;
      } else if (activeSkin === 'OVERLORD') {
        color = `rgba(138, 43, 226, ${Math.random() * 0.5 + 0.4})`;
      } else if (activeSkin === 'GLITCH') {
        color = Math.random() > 0.5 
          ? `rgba(255, 0, 85, ${Math.random() * 0.5 + 0.4})` 
          : `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.4})`;
      } else if (activeSkin === 'VOID_LORD') {
        color = `rgba(255, 0, 122, ${Math.random() * 0.5 + 0.5})`;
      } else if (activeSkin === 'CHRONO_SHIFT') {
        color = Math.random() > 0.5 
          ? `rgba(0, 240, 255, ${Math.random() * 0.5 + 0.5})` 
          : `rgba(255, 0, 234, ${Math.random() * 0.5 + 0.5})`;
      }
      particlesRef.current.push({
        x,
        y: y + (Math.random() - 0.5) * 5,
        vx: -(currentSpeed * 0.35) - Math.random() * 1,
        vy: -Math.random() * 0.8,
        size,
        color,
        alpha: 0.85,
        life: 0,
        maxLife: Math.floor(Math.random() * 16 + 10)
      });
    }
  };

  // CORE HIGH-EFFICIENCY CANVAS LOOP
  let localFrame = 0;
  useEffect(() => {
    let localFrameNo = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      localFrameNo++;
      localFrame = localFrameNo;

      const W = viewportWidthRef.current;
      const H = viewportHeightRef.current;
      const floorY = H - 100;

      ctx.save();
      
      // Perform screen-shake transformations 
      if (screenShakeRef.current > 0.1) {
        const dx = (Math.random() - 0.5) * screenShakeRef.current;
        const dy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(dx, dy);
        screenShakeRef.current *= 0.9;
      }

      const isPlaying = gameStateRef.current === 'PLAYING';
      const isCountdown = countdownActiveRef.current;

      // 1. PHYSICAL ACCELERATIONS & CORE TRIGGERS
      if (isPlaying) {
        if (!isCountdown) {
          updatePhysics();
          checkCollisions();
          checkCoinCollisions();

          // Tick distance metrics
          distanceTraveledRef.current += speedRef.current * 0.055;
          const potentialScore = Math.floor(distanceTraveledRef.current * 0.1);
          if (potentialScore > scoreRef.current) {
            scoreRef.current = potentialScore;
            setCurrentScore(potentialScore);
            onScoreUpdate(potentialScore);
          }

          // Chrome Dino and user-specified formula: gameSpeed = Math.min(baseSpeed + (score * 0.2), maxSpeed)
          const baseSpeedValue = 4.5;
          const maxSpeedValue = 11.5;
          const currentNormalizedSpeed = Math.min(baseSpeedValue + (scoreRef.current * 0.2), maxSpeedValue);
          
          // Fluid responsive layout: scale speed proportionally with canvas width W
          speedRef.current = W * (currentNormalizedSpeed / 1000);

          lastSpawnRef.current -= speedRef.current;
          lastCoinSpawnRef.current -= speedRef.current;

          // Spawn items
          if (obstaclesRef.current.length === 0 || lastSpawnRef.current < W) {
            if (Math.random() < 0.015) {
              spawnObstacle();
            }
          }
          if (coinsRef.current.length === 0 || lastCoinSpawnRef.current < W) {
            if (Math.random() < 0.003) {
              spawnCoin();
            }
          }
        } else {
          // Slide decorative countdown dust trails
          const player = playerRef.current;
          player.trailTimer++;
          if (player.trailTimer >= 4) {
            spawnTrailParticle(player.x + 4, floorY - 2);
            player.trailTimer = 0;
          }
        }
      }

      updateBackgroundAndParticles();

      // 2. STAGE RENDERS IN REAL-TIME
      drawBackground(ctx);
      drawCoins(ctx);
      drawObstacles(ctx);
      drawFloor(ctx);
      drawParticles(ctx);

      if (gameStateRef.current !== 'GAME_OVER' || screenShakeRef.current > 3.0) {
        drawPlayer(ctx);
      }

      ctx.restore();
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    // PHYSICAL COMPUTATIONS APPLIED TO ACTIVE PLAYER BOX
    const updatePhysics = () => {
      const player = playerRef.current;
      const H = viewportHeightRef.current;
      const floorY = H - 100;
      const gravity = H * 0.0016;
      const jumpForce = -Math.sqrt(2 * gravity * (H * 0.28));

      if (player.jumpBuffered) {
        player.bufferTimer--;
        if (player.bufferTimer <= 0) {
          player.jumpBuffered = false;
        }
      }

      player.vy += gravity;
      player.y += player.vy;

      // Lock on ground alignment limits
      const playerFloorLimit = floorY - player.height;
      if (player.y >= playerFloorLimit) {
        player.y = playerFloorLimit;
        player.vy = 0;

        if (!player.onGround) {
          player.onGround = true;
          const targetRotDegrees = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
          player.rotation = targetRotDegrees % (Math.PI * 2);
          player.targetRotation = player.rotation;
          player.rotationSpeed = 0;
          spawnSplashParticles(player.x + player.width / 2, floorY, 6);
        }

        // Dequeuebuffered jumps instantly
        if (player.jumpBuffered) {
          player.vy = jumpForce;
          player.onGround = false;
          player.targetRotation = player.rotation + Math.PI / 2;
          player.rotationSpeed = Math.PI / 2 / 24;
          player.jumpBuffered = false;
          player.bufferTimer = 0;
          gameAudio.playJump();

          setTotalJumps(prev => {
            const u = prev + 1;
            try { localStorage.setItem('rhythm_dash_total_jumps', u.toString()); } catch {}
            return u;
          });

          spawnSplashParticles(player.x + player.width / 2, floorY, 8);
        }
      }

      if (!player.onGround) {
        player.rotation += player.rotationSpeed;
      } else {
        player.trailTimer++;
        if (player.trailTimer >= 3) {
          spawnTrailParticle(player.x + 4, floorY - 2);
          player.trailTimer = 0;
        }
      }
    };

    const updateBackgroundAndParticles = () => {
      const W = viewportWidthRef.current;
      const isPlaying = gameStateRef.current === 'PLAYING';
      const isCountdown = countdownActiveRef.current;
      
      const scrollSpeed = isPlaying ? speedRef.current * 0.15 : 0.4;
      for (const s of starsRef.current) {
        s.x -= scrollSpeed * s.speed;
        if (s.x < -10) s.x = W + 10;
      }

      if (isPlaying && !isCountdown) {
        const obsList = obstaclesRef.current;
        const playerX = playerRef.current.x;

        for (let i = obsList.length - 1; i >= 0; i--) {
          const obs = obsList[i];
          obs.x -= speedRef.current;
          
          if (obs.x + obs.width < playerX && !obs.passed) {
            obs.passed = true;
            setComboCount(prev => prev + 1);
            spawnSplashParticles(obs.x + obs.width, obs.y, 4);
          }
          if (obs.x + obs.width < -60) {
            obsList.splice(i, 1);
          }
        }

        const coinList = coinsRef.current;
        for (let i = coinList.length - 1; i >= 0; i--) {
          const coin = coinList[i];
          coin.x -= speedRef.current;
          if (coin.x + coin.width < -60) {
            coinList.splice(i, 1);
          }
        }
      }

      // Combo expiration triggers on player failure/ground
      if (isPlaying && !isCountdown) {
        const p = playerRef.current;
        if (p.onGround && comboRef.current > 0) {
          // Fade combo gradually
          if (localFrame % 90 === 0) {
            setComboCount(prev => Math.max(0, prev - 1));
          }
        }
      }

      // Decapsulate particle entities life pools
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }
    };

    // DIRECT CONTROLLER RENDER PIPELINE HANDLES
    const drawBackground = (ctx: CanvasRenderingContext2D) => {
      const currentCombo = comboRef.current;
      const comboMultiplier = currentCombo >= 20 ? 5 : currentCombo >= 15 ? 4 : currentCombo >= 10 ? 3 : currentCombo >= 5 ? 2 : 1;
      
      const W = viewportWidthRef.current;
      const H = viewportHeightRef.current;
      const floorY = H - 100;

      let topColor = '#0a0518';
      let midColor = '#150930';
      let bottomColor = '#0e0422';
      let gridColor = 'rgba(124, 58, 237, 0.15)';

      if (comboMultiplier === 2) {
        topColor = '#041c08';
        midColor = '#0e3a17';
        bottomColor = '#05140b';
        gridColor = 'rgba(57, 255, 20, 0.15)';
      } else if (comboMultiplier === 3) {
        topColor = '#1c1402';
        midColor = '#3d2508';
        bottomColor = '#171001';
        gridColor = 'rgba(255, 165, 0, 0.15)';
      } else if (comboMultiplier === 4) {
        topColor = '#1c020d';
        midColor = '#420822';
        bottomColor = '#17010a';
        gridColor = 'rgba(255, 0, 127, 0.16)';
      } else if (comboMultiplier === 5) {
        const hue = (localFrame * 1.5) % 360;
        topColor = `hsl(${hue}, 80%, 4%)`;
        midColor = `hsl(${hue}, 80%, 12%)`;
        bottomColor = `hsl(${hue}, 80%, 3%)`;
        gridColor = `hsla(${hue}, 100%, 50%, 0.18)`;
      }

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, topColor);
      grad.addColorStop(0.65, midColor);
      grad.addColorStop(1, bottomColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      starsRef.current.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(localFrame * 0.02 + s.x) * 0.35 + 0.65})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (s.size > 2) {
          ctx.fillStyle = comboMultiplier === 5 ? `hsla(${(localFrame * 1.5) % 360}, 100%, 50%, 0.15)` : (comboMultiplier === 2 ? 'rgba(57, 255, 20, 0.15)' : 'rgba(139, 92, 246, 0.15)');
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // City Skyline heights relative to H
      ctx.save();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const skyGridScroll = (localFrame * (gameStateRef.current === 'PLAYING' ? speedRef.current * 0.1 : 0.2)) % 60;
      for (let x = -60; x <= W + 60; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x - skyGridScroll, H * 0.35);
        ctx.lineTo(x - skyGridScroll - 100, floorY);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawFloor = (ctx: CanvasRenderingContext2D) => {
      const W = viewportWidthRef.current;
      const H = viewportHeightRef.current;
      const floorY = H - 100;
      const floorH = 100;

      const currentCombo = comboRef.current;
      const comboMultiplier = currentCombo >= 20 ? 5 : currentCombo >= 15 ? 4 : currentCombo >= 10 ? 3 : currentCombo >= 5 ? 2 : 1;

      let floorLineColor = '#00f0ff';
      let floorStripeColor = 'rgba(0, 240, 255, 0.2)';
      let floorGradStart = '#100a2d';
      let floorGradMid = '#1b0d45';

      if (comboMultiplier === 2) {
        floorLineColor = '#39FF14';
        floorStripeColor = 'rgba(57, 255, 20, 0.2)';
        floorGradStart = '#082a0d';
        floorGradMid = '#051908';
      } else if (comboMultiplier === 3) {
        floorLineColor = '#FFD700';
        floorStripeColor = 'rgba(255, 215, 0, 0.2)';
        floorGradStart = '#2b1b02';
        floorGradMid = '#170f01';
      } else if (comboMultiplier === 4) {
        floorLineColor = '#E0115F';
        floorStripeColor = 'rgba(224, 17, 95, 0.2)';
        floorGradStart = '#2d0413';
        floorGradMid = '#17020a';
      } else if (comboMultiplier === 5) {
        const hue = (localFrame * 1.5) % 360;
        floorLineColor = `hsl(${hue}, 100%, 50%)`;
        floorStripeColor = `hsla(${hue}, 100%, 50%, 0.25)`;
        floorGradStart = `hsl(${hue}, 80%, 10%)`;
        floorGradMid = `hsl(${hue}, 80%, 4%)`;
      }

      const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
      floorGrad.addColorStop(0, floorGradStart);
      floorGrad.addColorStop(0.5, floorGradMid);
      floorGrad.addColorStop(1, '#000000');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY, W, floorH);

      // Glow top deck line
      const pulseGlow = Math.sin(localFrame * 0.08) * 4 + 10;
      ctx.shadowBlur = pulseGlow;
      ctx.shadowColor = floorLineColor;
      ctx.strokeStyle = floorLineColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(W, floorY);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Scrolling grid lines
      ctx.save();
      ctx.strokeStyle = floorStripeColor;
      ctx.lineWidth = 1.5;
      const stripeOffset = (localFrame * (gameStateRef.current === 'PLAYING' ? speedRef.current : 1)) % 32;

      for (let x = -32; x < W + 60; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x - stripeOffset, floorY);
        ctx.lineTo(x - stripeOffset - 35, H);
        ctx.stroke();
      }

      for (let y = floorY; y <= H; y += 15) {
        const distRatio = (y - floorY) / floorH;
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 * (1 - distRatio)})`;
        if (comboMultiplier === 5) {
          const hue = (localFrame * 1.5) % 360;
          ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.3 * (1 - distRatio)})`;
        } else if (comboMultiplier === 2) {
          ctx.strokeStyle = `rgba(57, 255, 20, ${0.25 * (1 - distRatio)})`;
        } else if (comboMultiplier === 3) {
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.25 * (1 - distRatio)})`;
        } else if (comboMultiplier === 4) {
          ctx.strokeStyle = `rgba(224, 17, 95, ${0.25 * (1 - distRatio)})`;
        }
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawPlayer = (ctx: CanvasRenderingContext2D) => {
      const player = playerRef.current;
      const activeSkin = skinRef.current;
      ctx.save();
      
      const cx = player.x + player.width / 2;
      const cy = player.y + player.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(player.rotation);

      let primaryColor = '#00FFCC';
      let shadowColor = '#00FFCC';
      let centerFill = '#05181b';
      let innerPatternColor = 'rgba(0, 255, 204, 0.7)';
      let eyeColor = '#FFFFFF';
      let smileColor = '#FFFFFF';

      if (activeSkin === 'FLAME') {
        primaryColor = '#FF5500';
        shadowColor = '#FFCC00';
        centerFill = '#1a0800';
        innerPatternColor = 'rgba(255, 120, 0, 0.8)';
        eyeColor = '#FFCC00';
        smileColor = '#FFaa00';
      } else if (activeSkin === 'MATRIX') {
        primaryColor = '#39FF14';
        shadowColor = '#00FF00';
        centerFill = '#031405';
        innerPatternColor = 'rgba(57, 255, 20, 0.7)';
        eyeColor = '#39FF14';
        smileColor = '#39FF14';
      } else if (activeSkin === 'STRIPE') {
        primaryColor = '#E0115F';
        shadowColor = '#FF007F';
        centerFill = '#1a020b';
        innerPatternColor = 'rgba(255, 20, 147, 0.75)';
        eyeColor = '#FFFFFF';
        smileColor = '#FFFFFF';
      } else if (activeSkin === 'GOLD') {
        primaryColor = '#FFD700';
        shadowColor = '#FFA500';
        centerFill = '#1b1402';
        innerPatternColor = 'rgba(255, 223, 0, 0.8)';
        eyeColor = '#FFFFE0';
        smileColor = '#FFD700';
      } else if (activeSkin === 'OVERLORD') {
        primaryColor = '#8A2BE2';
        shadowColor = '#DA70D6';
        centerFill = '#110222';
        innerPatternColor = 'rgba(138, 43, 226, 0.85)';
        eyeColor = '#DA70D6';
        smileColor = '#DA70D6';
      } else if (activeSkin === 'GLITCH') {
        primaryColor = '#FF0055';
        shadowColor = '#00FFFF';
        centerFill = '#110008';
        innerPatternColor = 'rgba(0, 255, 255, 0.8)';
        eyeColor = '#00FFFF';
        smileColor = '#FF0055';
      } else if (activeSkin === 'VOID_LORD') {
        primaryColor = '#9D00FF';
        shadowColor = '#FF007A';
        centerFill = '#070014';
        innerPatternColor = 'rgba(255, 0, 122, 0.9)';
        eyeColor = '#FF007A';
        smileColor = '#9D00FF';
      } else if (activeSkin === 'CHRONO_SHIFT') {
        primaryColor = '#00F0FF';
        shadowColor = '#FF00EA';
        centerFill = '#000c14';
        innerPatternColor = 'rgba(255, 0, 234, 0.95)';
        eyeColor = '#FFFFFF';
        smileColor = '#00F0FF';
      }

      ctx.shadowBlur = 16;
      ctx.shadowColor = shadowColor;

      // Inner box 
      ctx.fillStyle = centerFill; 
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.rect(-player.width / 2, -player.height / 2, player.width, player.height);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Render aesthetic patterns
      if (activeSkin === 'FLAME') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-player.width / 3, 0);
        ctx.lineTo(player.width / 3, 0);
        ctx.moveTo(0, -player.height / 3);
        ctx.lineTo(0, player.height / 3);
        ctx.stroke();
        ctx.strokeRect(-player.width / 4, -player.height / 4, player.width / 2, player.height / 2);
      } else if (activeSkin === 'MATRIX') {
        ctx.fillStyle = innerPatternColor;
        ctx.fillRect(-player.width / 4, -player.height / 3, 4, player.height * 0.65);
        ctx.fillRect(4, -player.height / 4, 3, player.height * 0.5);
      } else if (activeSkin === 'STRIPE') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-player.width / 2 + 5, player.height / 2 - 5);
        ctx.lineTo(player.width / 2 - 5, -player.height / 2 + 5);
        ctx.stroke();
      } else if (activeSkin === 'GOLD') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-player.width / 3, -player.height / 3, (player.width * 2) / 3, (player.height * 2) / 3);
        ctx.fillStyle = innerPatternColor;
        ctx.fillRect(-2, -2, 4, 4);
      } else if (activeSkin === 'VOID_LORD') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -player.height / 3);
        ctx.lineTo(player.width / 3, 0);
        ctx.lineTo(0, player.height / 3);
        ctx.lineTo(-player.width / 3, 0);
        ctx.closePath();
        ctx.stroke();
      } else if (activeSkin === 'CHRONO_SHIFT') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-player.width / 3, -player.height / 3);
        ctx.lineTo(player.width / 3, -player.height / 3);
        ctx.lineTo(-player.width / 4, player.height / 3);
        ctx.lineTo(player.width / 4, player.height / 3);
        ctx.closePath();
        ctx.stroke();
      } else if (activeSkin === 'OVERLORD') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, player.width / 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeSkin === 'GLITCH') {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-player.width / 2 + 5, -5);
        ctx.lineTo(player.width / 2 - 5, -5);
        ctx.stroke();
      } else {
        ctx.strokeStyle = innerPatternColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-player.width / 3, -player.height / 3, (player.width * 2) / 3, (player.height * 2) / 3);
      }

      // Facemoji indicators
      ctx.fillStyle = eyeColor;
      const eyeSize = 6;
      ctx.fillRect(-player.width / 4 - eyeSize / 2, -player.height / 4, eyeSize, eyeSize);
      ctx.fillRect(player.width / 4 - eyeSize / 2, -player.height / 4, eyeSize, eyeSize);

      ctx.strokeStyle = smileColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (activeSkin === 'FLAME') {
        ctx.moveTo(-6, 4);
        ctx.lineTo(0, 7);
        ctx.lineTo(6, 4);
      } else {
        ctx.moveTo(-6, 6);
        ctx.lineTo(6, 6);
      }
      ctx.stroke();

      ctx.restore();
    };

    const drawObstacles = (ctx: CanvasRenderingContext2D) => {
      const obstacles = obstaclesRef.current;
      obstacles.forEach(obs => {
        ctx.save();

        if (obs.type === 'BLOCK') {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#E63946';
          ctx.fillStyle = '#1D0D15';
          ctx.strokeStyle = '#E63946';
          ctx.lineWidth = 3;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height - 8);
          ctx.lineTo(obs.x + obs.width - 8, obs.y);
          ctx.stroke();
          
        } else if (obs.type === 'SPIKE_SINGLE') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FF0055';
          const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
          grad.addColorStop(0, '#FF0055');
          grad.addColorStop(1, '#3b001a');
          
          ctx.fillStyle = grad;
          ctx.strokeStyle = '#FF0055';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
          ctx.stroke();

        } else if (obs.type === 'SPIKE_DOUBLE') {
          const halfW = obs.width / 2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FF0055';

          // Spike 1
          let grad1 = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
          grad1.addColorStop(0, '#FF0055');
          grad1.addColorStop(1, '#3b001a');
          ctx.fillStyle = grad1;
          ctx.strokeStyle = '#FF0055';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + halfW / 2, obs.y);
          ctx.lineTo(obs.x + halfW, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Spike 2
          let grad2 = ctx.createLinearGradient(obs.x + halfW, obs.y, obs.x + halfW, obs.y + obs.height);
          grad2.addColorStop(0, '#FF0055');
          grad2.addColorStop(1, '#3b001a');
          ctx.fillStyle = grad2;

          ctx.beginPath();
          ctx.moveTo(obs.x + halfW, obs.y + obs.height);
          ctx.lineTo(obs.x + halfW + halfW / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

        } else if (obs.type === 'SPIKE_TRIPLE') {
          const thirdW = obs.width / 3;
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#FF3300'; 

          for (let i = 0; i < 3; i++) {
            const startX = obs.x + thirdW * i;
            let gradSpike = ctx.createLinearGradient(startX, obs.y, startX, obs.y + obs.height);
            gradSpike.addColorStop(0, '#FF3300');
            gradSpike.addColorStop(1, '#470a00');
            ctx.fillStyle = gradSpike;
            ctx.strokeStyle = '#FF3300';
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.moveTo(startX, obs.y + obs.height);
            ctx.lineTo(startX + thirdW / 2, obs.y);
            ctx.lineTo(startX + thirdW, obs.y + obs.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

        } else if (obs.type === 'HANGING_PILLAR') {
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#8B5CF6';
          ctx.fillStyle = '#110c22';
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 3;

          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let offset = 20; offset < obs.height - 10; offset += 30) {
            ctx.moveTo(obs.x, obs.y + offset);
            ctx.lineTo(obs.x + obs.width, obs.y + offset + 15);
          }
          ctx.stroke();
        }
        
        ctx.restore();
      });
    };

    const drawCoins = (ctx: CanvasRenderingContext2D) => {
      const coins = coinsRef.current;
      coins.forEach(coin => {
        ctx.save();
        
        const floatOffset = Math.sin(localFrame * 0.1 + coin.pulseOffset) * 4;
        const cy = coin.y + floatOffset;
        const radius = coin.width / 2;

        ctx.shadowBlur = 14;
        ctx.shadowColor = '#FFD700';

        const spinRatio = Math.abs(Math.sin(localFrame * 0.08 + coin.pulseOffset));
        const currentWidth = coin.width * spinRatio;
        
        const goldGrad = ctx.createRadialGradient(
          coin.x + radius, cy + radius, 2,
          coin.x + radius, cy + radius, radius
        );
        goldGrad.addColorStop(0, '#FFF59D'); 
        goldGrad.addColorStop(0.5, '#FBC02D'); 
        goldGrad.addColorStop(1, '#F57F17'); 

        ctx.fillStyle = goldGrad;
        ctx.strokeStyle = '#FFF590';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(
          coin.x + radius,
          cy + radius,
          currentWidth / 2,
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        if (spinRatio > 0.45) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.floor(10 * spinRatio)}px "Inter", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('D', coin.x + radius, cy + radius);
        }

        ctx.restore();
      });
    };

    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      const particles = particlesRef.current;
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.rotation !== undefined) {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    };

    gameLoop();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#030305] flex items-center justify-center overflow-hidden cursor-pointer"
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
      id="game-viewport-container"
    >
      {/* 100% FLUID RESPONSIVE GAME CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block bg-[#0c0c0c]"
        id="rhythm-dash-canvas"
      />

      {/* GAME INTERACTIVE HUD BAR */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/85 border border-white/10 px-5 py-2 sm:px-6 sm:py-2.5 rounded-sm shadow-2xl pointer-events-none z-30 font-mono" id="live-score-badge">
          <div className="flex items-baseline gap-1.5">
            <span className="text-white/40 text-[9px] sm:text-[10px] tracking-widest uppercase">JARAK:</span>
            <span className="text-cyan-400 text-sm sm:text-base font-black tracking-wider">{currentScore}M</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-white/40 text-[9px] sm:text-[10px] tracking-widest uppercase">TOKEN RUN:</span>
            <span className="text-amber-400 text-sm sm:text-base font-black tracking-wider">{tokensCollectedThisRun}</span>
          </div>
          {comboCount > 0 && (
            <>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-baseline gap-1.5 animate-bounce">
                <span className="text-pink-500 text-xs sm:text-sm font-black tracking-widest">COMBO x{comboCount}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* AUDIO AND HIGH SCORE CONTROL BAR (FLOATING TOP) */}
      {gameState !== 'PLAYING' && (
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-40 pointer-events-auto select-none font-mono">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute?.();
            }}
            className={`px-3 py-1.5 bg-black/80 border rounded-sm text-[9px] sm:text-xs font-bold uppercase transition-all tracking-widest flex items-center gap-2 cursor-pointer hover:border-cyan-400/50 hover:text-cyan-400 active:scale-95 ${
              isMuted 
                ? 'border-rose-500/30 text-rose-400' 
                : 'border-white/10 text-white/50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isMuted ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            {isMuted ? 'MUTED' : 'AUDIO ON'}
          </button>

          <div className="bg-black/80 border border-white/10 px-3 py-1.5 rounded-sm text-[9px] sm:text-xs flex items-center gap-1.5 uppercase tracking-widest text-zinc-300">
            <span className="text-zinc-500">TERBAIK:</span>
            <span className="text-cyan-400 font-bold">{highScore}M</span>
          </div>
        </div>
      )}

      {/* COUNTDOWN NUMERICAL GRAPHICAL OVERLAY */}
      {isCountdownActive && countdownVal !== null && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-30 pointer-events-none select-none font-sans" id="countdown-overlay">
          <div className="text-center animate-ping text-5xl sm:text-8xl font-black text-cyan-400 tracking-widest uppercase filter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            {countdownVal}
          </div>
        </div>
      )}

      {/* MODULAR OVERLAYS SELECTOR GATE */}
      {gameState === 'HOME_SCREEN' && (
        <HomeScreenOverlay
          isElectron={isElectron}
          dashTokens={dashTokens}
          highScore={highScore}
          totalJumps={totalJumps}
          jumpsClaimed={jumpsClaimed}
          scoreClaimed={scoreClaimed}
          comboClaimed={comboClaimed}
          hasAchievedMaxCombo={hasAchievedMaxCombo}
          lastDailyClaim={lastDailyClaim}
          claimDaily={claimDaily}
          claimJumps={claimJumps}
          claimScore={claimScore}
          claimCombo={claimCombo}
          onGameStateChange={onGameStateChange}
        />
      )}

      {gameState === 'SHOP_SCREEN' && (
        <ShopOverlay
          dashTokens={dashTokens}
          addDashTokens={addDashTokens}
          activeSkin={equippedSkin}
          setActiveSkin={setEquippedSkin}
          activeTrail={equippedTrail}
          setActiveTrail={setEquippedTrail}
          purchasedSkins={unlockedSkins}
          setPurchasedSkins={setUnlockedSkins}
          purchasedTrails={unlockedTrails}
          setPurchasedTrails={setUnlockedTrails}
          onGameStateChange={onGameStateChange}
        />
      )}

      {gameState === 'TOPUP_SCREEN' && (
        <TopupOverlay
          dashTokens={dashTokens}
          addDashTokens={addDashTokens}
          onGameStateChange={onGameStateChange}
          spawnExplosionAtCenter={() => {
            const W = viewportWidthRef.current;
            const H = viewportHeightRef.current;
            spawnCoinSparkles(W / 2, H / 2);
          }}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverOverlay
          score={currentScore}
          highScore={highScore}
          tokensCollectedThisRun={tokensCollectedThisRun}
          maxComboThisRun={maxComboThisRun}
          activeSkin={equippedSkin}
          onGameStateChange={onGameStateChange}
          resetGame={resetGame}
        />
      )}
    </div>
  );
};
