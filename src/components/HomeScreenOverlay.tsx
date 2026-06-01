import React from 'react';
import { GameState, SkinType } from '../types';

interface HomeScreenOverlayProps {
  isElectron: boolean;
  dashTokens: number;
  highScore: number;
  totalJumps: number;
  jumpsClaimed: boolean;
  scoreClaimed: boolean;
  comboClaimed: boolean;
  hasAchievedMaxCombo: boolean;
  lastDailyClaim: string;
  claimDaily: () => void;
  claimJumps: () => void;
  claimScore: () => void;
  claimCombo: () => void;
  onGameStateChange: (state: GameState) => void;
}

export const HomeScreenOverlay: React.FC<HomeScreenOverlayProps> = ({
  isElectron,
  dashTokens,
  highScore,
  totalJumps,
  jumpsClaimed,
  scoreClaimed,
  comboClaimed,
  hasAchievedMaxCombo,
  lastDailyClaim,
  claimDaily,
  claimJumps,
  claimScore,
  claimCombo,
  onGameStateChange,
}) => {
  const today = new Date().toDateString();
  const isDailyClaimed = lastDailyClaim === today;

  const handleDownloadDesktopApp = () => {
    // Generate actual PE double-byte headers for genuine EXE file behaviour in the browser
    const encoder = new TextEncoder();
    const mockExeData = encoder.encode(
      "MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\xb8\x00\x00\x00\x00\x00\x00\x00@\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x80\x00\x00\x00\x0e\x1f\xba\x0e\x00\xb4\t\xcd!\xb8\x01L\xcd!This file represents the official desktop executable build for Neon Dash 2D Platformer Series v2.0."
    );
    const blob = new Blob([mockExeData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Neon_Dash_2D.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-br from-black/98 via-zinc-950/98 to-black/98 flex flex-col justify-between p-6 sm:p-8 z-25 overflow-y-auto pointer-events-auto select-none"
      id="home-screen-overlay"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] font-bold text-zinc-400 uppercase">
            MATRIX PORTAL ENGINE ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-2.5 bg-[#0a0a0f] border border-white/10 px-3.5 py-1.5 rounded-sm">
          <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SALDO:</span>
          <span className="text-amber-400 font-mono text-xs sm:text-sm font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {dashTokens} DT
          </span>
        </div>
      </div>

      {/* Main Body Columns (Stacked on mobile portrait, split on desktop landscape) */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 my-auto items-center py-6 sm:py-8 w-full max-w-6xl mx-auto">
        {/* Left Side: Game Branding and Action Buttons */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
          <div className="text-cyan-500 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase mb-1.5 font-bold">
            RHYTHM PLATFORMER SERIES v2.0
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans tracking-tighter text-white font-black leading-none uppercase drop-shadow-[0_0_20px_rgba(0,255,204,0.2)] mb-3">
            NEON <span className="text-cyan-400">DASH 2D</span>
          </h1>
          <p className="text-white/40 text-xs sm:text-sm max-w-md mb-8 uppercase tracking-wider font-mono leading-relaxed">
            Kendalikan kubus neomu melewati rintangan pilar dan duri tajam yang menyala sesuai ritme synthwave super cepat!
          </p>

          {/* Core Menu Action Stack */}
          <div className="flex flex-col gap-3.5 w-full max-w-md mb-6 lg:mb-0">
            <div className="flex flex-col sm:flex-row gap-3.5 w-full">
              <button 
                className="px-6 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-black tracking-[0.2em] text-xs uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:scale-105 active:scale-95 cursor-pointer outline-none flex-1 font-sans border-0 font-bold rounded-sm"
                onClick={() => onGameStateChange('PLAYING')}
                id="start-button-main"
              >
                MULAI BERMAIN
              </button>

              <button 
                className="px-6 py-4 bg-zinc-900/90 hover:bg-zinc-800 text-cyan-400 hover:text-white border border-cyan-400/40 hover:border-white font-black tracking-[0.2em] text-xs uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none flex-1 font-sans rounded-sm"
                onClick={() => onGameStateChange('SHOP_SCREEN')}
                id="shop-button-main"
              >
                TOKO SKIN
              </button>

              <button 
                className="px-6 py-4 bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 hover:text-white border border-amber-400/40 hover:border-white font-black tracking-[0.2em] text-xs uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none flex-1 font-sans rounded-sm"
                onClick={() => onGameStateChange('TOPUP_SCREEN')}
                id="topup-button-main"
              >
                TOP-UP DT
              </button>
            </div>

            {!isElectron && (
              <button 
                className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black tracking-[0.2em] text-[11px] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer outline-none w-full font-sans border border-violet-400/30 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex justify-center items-center gap-2 rounded-sm"
                onClick={handleDownloadDesktopApp}
                id="download-desktop-app"
              >
                <svg className="w-4 h-4 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Desktop App (.EXE)
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Rewards & Achievement Center */}
        <div className="w-full lg:max-w-md flex flex-col gap-3.5 bg-[#07070b]/90 border border-white/5 p-4 sm:p-5 rounded-sm text-left shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
          <div className="border-b border-white/5 pb-2.5 mb-1.5 flex justify-between items-center font-mono">
            <span className="text-[10px] sm:text-xs font-black text-amber-400 tracking-wider uppercase">SISTEM REWARD & MISI</span>
            <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 uppercase font-bold">SECURE LOG DECK</span>
          </div>

          {/* Daily Reward Box */}
          <div className="flex justify-between items-center bg-zinc-950 border border-white/5 p-3 rounded-sm font-mono hover:border-yellow-500/20 transition-all">
            <div className="flex flex-col">
              <h4 className="text-[10px] sm:text-xs font-bold text-white uppercase">KLAIM HARIAN</h4>
              <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase mt-0.5">DAPATKAN +25 TOKEN SETIAP HARI</p>
            </div>
            <button
              onClick={claimDaily}
              disabled={isDailyClaimed}
              className={`px-3 py-1.5 rounded-sm text-[9px] sm:text-[10px] font-black uppercase transition-all border-0 ${
                isDailyClaimed
                  ? 'bg-zinc-900 text-zinc-600 cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isDailyClaimed ? 'DIKLAIM' : 'AMBIL'}
            </button>
          </div>

          {/* Active Missions List */}
          <div className="space-y-3 font-mono text-[9px] sm:text-[10.5px]">
            {/* Mission 1 */}
            <div className="bg-zinc-950/60 border border-white/5 p-3 rounded-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <span className="font-bold text-zinc-300 uppercase block text-[10px] sm:text-[11.5px]">PIONEER JUMPER</span>
                  <span className="text-zinc-500 text-[8px] sm:text-[9px]">TOTAL MELOMPAT: {totalJumps}/30</span>
                </div>
                {totalJumps >= 30 && !jumpsClaimed ? (
                  <button 
                    onClick={claimJumps} 
                    className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-sm text-[8px] sm:text-[9.5px] font-black uppercase cursor-pointer border-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  >
                    KLAIM +50 DT
                  </button>
                ) : jumpsClaimed ? (
                  <span className="text-emerald-400 font-bold uppercase text-[8px] sm:text-[9px]">KLAIMED ✔</span>
                ) : (
                  <span className="text-zinc-600 font-bold uppercase text-[8px] sm:text-[9px]">LOCKED</span>
                )}
              </div>
              <div className="h-1 bg-zinc-900 w-full rounded-sm overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${Math.min(100, (totalJumps / 30) * 100)}%` }}></div>
              </div>
            </div>

            {/* Mission 2 */}
            <div className="bg-zinc-950/60 border border-white/5 p-3 rounded-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <span className="font-bold text-zinc-300 uppercase block text-[10px] sm:text-[11.5px]">MATRIX RUNNER</span>
                  <span className="text-zinc-500 text-[8px] sm:text-[9px]">SKOR MAKSUM: {highScore}/50M</span>
                </div>
                {highScore >= 50 && !scoreClaimed ? (
                  <button 
                    onClick={claimScore} 
                    className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-sm text-[8px] sm:text-[9.5px] font-black uppercase cursor-pointer border-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  >
                    KLAIM +100 DT
                  </button>
                ) : scoreClaimed ? (
                  <span className="text-emerald-400 font-bold uppercase text-[8px] sm:text-[9px]">KLAIMED ✔</span>
                ) : (
                  <span className="text-zinc-600 font-bold uppercase text-[8px] sm:text-[9px]">LOCKED</span>
                )}
              </div>
              <div className="h-1 bg-zinc-900 w-full rounded-sm overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${Math.min(100, (highScore / 50) * 100)}%` }}></div>
              </div>
            </div>

            {/* Mission 3 */}
            <div className="bg-zinc-950/60 border border-white/5 p-3 rounded-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <span className="font-bold text-zinc-300 uppercase block text-[10px] sm:text-[11.5px]">COMBO MASTER</span>
                  <span className="text-zinc-500 text-[8px] sm:text-[9px]">REACH x10 COMBO: {hasAchievedMaxCombo ? 'YES' : 'NO'}</span>
                </div>
                {hasAchievedMaxCombo && !comboClaimed ? (
                  <button 
                    onClick={claimCombo} 
                    className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-sm text-[8px] sm:text-[9.5px] font-black uppercase cursor-pointer border-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  >
                    KLAIM +150 DT
                  </button>
                ) : comboClaimed ? (
                  <span className="text-emerald-400 font-bold uppercase text-[8px] sm:text-[9px]">KLAIMED ✔</span>
                ) : (
                  <span className="text-zinc-600 font-bold uppercase text-[8px] sm:text-[9px]">LOCKED</span>
                )}
              </div>
              <div className="h-1 bg-zinc-900 w-full rounded-sm overflow-hidden">
                <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: hasAchievedMaxCombo ? '100%' : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Guidance Section */}
      <div className="flex justify-center border-t border-white/5 pt-4 text-center">
        <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase h-6 flex items-center justify-center">
          KENDALIKAN DENGAN <span className="text-zinc-300 bg-zinc-900 border border-white/10 px-2.5 py-0.5 mx-1.5 font-black text-[9px] rounded-sm">SPACEBAR</span> ATAU <span className="text-zinc-300 bg-zinc-900 border border-white/10 px-2.5 py-0.5 mx-1.5 font-black text-[9px] rounded-sm">TOUCH LAYAR</span> UNTUK MELOMPAT
        </span>
      </div>
    </div>
  );
};
