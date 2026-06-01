/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameState } from './types';

// Deteksi apakah game dibuka lewat aplikasi Electron (.exe) atau Browser biasa
const isElectron = typeof window !== 'undefined' && /electron/i.test(navigator.userAgent);

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME_SCREEN');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Load HighScore on init
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('rhythm_dash_highscore');
      if (persisted) {
        setHighScore(parseInt(persisted, 10));
      }
    } catch {}
  }, []);

  const handleScoreUpdate = (currentScore: number) => {
    setScore(currentScore);
  };

  const handleHighScoreUpdate = (newHighScore: number) => {
    setHighScore(newHighScore);
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-[#020204] text-[#f5f5f5] overflow-hidden select-none font-sans relative flex items-center justify-center" id="main-container-fullscreen">
      {/* Immersive Subtle Background Glowing/Ambiance Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      
      {/* Absolute background visual ambient glow */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-950/20 rounded-full filter blur-[150px] pointer-events-none -translate-y-1/2 -translate-x-1/2 top-1/2 left-1/2 z-0" />

      {/* Main Fullscreen Game Canvas wrapper occupies 100% of parent */}
      <div className="w-full h-full relative z-10 flex items-center justify-center" id="fullscreen-game-root">
        <GameCanvas
          gameState={gameState}
          isMuted={isMuted}
          isElectron={isElectron} // <-- SUNTIKKAN PROPS BARU DI SINI
          onScoreUpdate={handleScoreUpdate}
          onHighScoreUpdate={handleHighScoreUpdate}
          onGameStateChange={setGameState}
          toggleMute={() => setIsMuted(prev => !prev)}
        />
      </div>
    </div>
  );
}