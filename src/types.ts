/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'HOME_SCREEN' | 'SHOP_SCREEN' | 'TOPUP_SCREEN' | 'PLAYING' | 'GAME_OVER';

export type ObstacleType = 'SPIKE_SINGLE' | 'SPIKE_DOUBLE' | 'SPIKE_TRIPLE' | 'BLOCK' | 'HANGING_PILLAR';

export type SkinType = 'CYAN' | 'FLAME' | 'MATRIX' | 'STRIPE' | 'GOLD' | 'OVERLORD' | 'GLITCH' | 'VOID_LORD' | 'CHRONO_SHIFT';

export interface Coin {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  pulseOffset: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  onGround: boolean;
  rotation: number;         // Current drawing rotation in radians or degrees
  targetRotation: number;   // Visual target for rotation snapping
  rotationSpeed: number;    // Speed of active rotation in air
  jumpBuffered: boolean;    // Buffer jump active flag
  bufferTimer: number;      // How long the buffer jump is valid
  trailTimer: number;       // Particle trail spawn rate regulator
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean; // For score accounting
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
}

export interface GameSettings {
  gravity: number;
  jumpForce: number;
  baseSpeed: number;
  speedIncrement: number; // Speed multiplier over score/time
  canvasWidth: number;
  canvasHeight: number;
  floorY: number; // Y coordinate of the floor
}
