import React from 'react';
import { GameState, SkinType } from '../types';

interface GameOverOverlayProps {
  score: number;
  highScore: number;
  tokensCollectedThisRun: number;
  maxComboThisRun: number;
  activeSkin: SkinType;
  onGameStateChange: (state: GameState) => void;
  resetGame: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  highScore,
  tokensCollectedThisRun,
  maxComboThisRun,
  activeSkin,
  onGameStateChange,
  resetGame,
}) => {
  const isNewRecord = score >= highScore && score > 0;

  return (
    <div 
      className="absolute inset-0 bg-black/95 backdrop-blur-sm flex flex-col justify-between p-6 sm:p-8 z-25 overflow-y-auto pointer-events-auto select-none"
      id="game-over-screen-overlay"
    >
      {/* Top Section */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 bg-rose-600 animate-pulse rounded-full"></span>
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">
            CONNECTION INTERRUPTED // PLAYER DESTROYED
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black">
          SKIN AKTIF: {activeSkin}
        </div>
      </div>

      {/* Center Game Statistics Board (Flexible layout) */}
      <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-8 max-w-lg mx-auto w-full">
        <div className="text-center font-sans mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-rose-500 tracking-widest uppercase leading-none drop-shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse">
            GAME OVER
          </h1>
          <p className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1.5 font-bold">
            KUBUS ENERGI LABIL RETAK AKIBAT TABRAKAN HAZARD
          </p>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="grid grid-cols-2 gap-3 w-full font-mono mb-8">
          
          {/* Distance Run */}
          <div className="bg-[#0b0b0f] border border-white/5 px-4 py-3 rounded-sm flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9.5px] text-zinc-500 uppercase font-black tracking-wider leading-none">
              JARAK TEMPUH
            </span>
            <span className="text-cyan-400 font-extrabold text-lg sm:text-2xl mt-1.5 tracking-wider">
              {score}M
            </span>
            {isNewRecord && (
              <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] uppercase tracking-wider mt-1 animate-bounce">
                🎉 REKOR BARU!
              </span>
            )}
          </div>

          {/* Tokens Collected */}
          <div className="bg-[#0b0b0f] border border-white/5 px-4 py-3 rounded-[#3px] flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9.5px] text-zinc-500 uppercase font-black tracking-wider leading-none">
              TOKEN RUN
            </span>
            <span className="text-amber-400 font-extrabold text-lg sm:text-2xl mt-1.5 tracking-wider">
              +{tokensCollectedThisRun} DT
            </span>
            <span className="text-zinc-600 text-[8px] sm:text-[9px] uppercase mt-1">
              DITAMBAHKAN KE DOMPET
            </span>
          </div>

          {/* High Score Stats */}
          <div className="bg-[#0b0b0f] border border-white/5 px-4 py-3 rounded-sm flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9.5px] text-zinc-500 uppercase font-black tracking-wider leading-none">
              REKOR TERBAIK
            </span>
            <span className="text-cyan-600 font-extrabold text-base sm:text-xl mt-1.5 tracking-wider">
              {highScore}M
            </span>
          </div>

          {/* Peak Max Combo achieved */}
          <div className="bg-[#0b0b0f] border border-white/5 px-4 py-3 rounded-[#3px] flex flex-col justify-center">
            <span className="text-[8px] sm:text-[9.5px] text-zinc-500 uppercase font-black tracking-wider leading-none">
              MAX COMBO RUN
            </span>
            <span className="text-pink-500 font-extrabold text-base sm:text-xl mt-1.5 tracking-wider">
              x{maxComboThisRun}
            </span>
          </div>
        </div>

        {/* CTA Button Block */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full">
          <button
            onClick={() => {
              resetGame();
              onGameStateChange('PLAYING');
            }}
            className="px-6 py-4 bg-rose-500 hover:bg-rose-400 text-black font-extrabold tracking-[0.2em] text-xs uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:scale-105 active:scale-95 border-0 rounded-sm cursor-pointer font-sans"
            id="replay-button-main"
          >
            MAIN LAGI
          </button>

          <button
            onClick={() => onGameStateChange('HOME_SCREEN')}
            className="px-6 py-4 bg-[#111] hover:bg-zinc-900 text-white border border-white/10 hover:border-white/40 font-extrabold tracking-[0.2em] text-xs uppercase transition-all hover:scale-105 active:scale-95 rounded-sm cursor-pointer"
            id="return-home-button-gameover"
          >
            MENU UTAMA
          </button>
        </div>
      </div>

      {/* Footer System Line */}
      <div className="border-t border-white/5 pt-3 flex justify-center text-center">
        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
          SYSTEM COMPONENT HEALTH: 100% // RESURRECTION CORES READY
        </span>
      </div>
    </div>
  );
};
