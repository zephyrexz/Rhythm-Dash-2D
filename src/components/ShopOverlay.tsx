import React, { useState } from 'react';
import { GameState, SkinType } from '../types';
import { gameAudio } from '../audio';

interface ShopOverlayProps {
  dashTokens: number;
  addDashTokens: (amount: number) => void;
  activeSkin: SkinType;
  setActiveSkin: (skin: SkinType) => void;
  activeTrail: string;
  setActiveTrail: (trail: string) => void;
  purchasedSkins: SkinType[];
  setPurchasedSkins: React.Dispatch<React.SetStateAction<SkinType[]>>;
  purchasedTrails: string[];
  setPurchasedTrails: React.Dispatch<React.SetStateAction<string[]>>;
  onGameStateChange: (state: GameState) => void;
}

export const ShopOverlay: React.FC<ShopOverlayProps> = ({
  dashTokens,
  addDashTokens,
  activeSkin,
  setActiveSkin,
  activeTrail,
  setActiveTrail,
  purchasedSkins,
  setPurchasedSkins,
  purchasedTrails,
  setPurchasedTrails,
  onGameStateChange,
}) => {
  const [shopTab, setShopTab] = useState<'SKINS' | 'TRAILS'>('SKINS');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  const skinsMetadata = [
    { id: 'CYAN' as SkinType, name: 'Neon-Cyan', styleName: 'Standard Glow', price: 0, color: '#00FFCC', shadowColor: '#00FFCC', desc: 'Standard cockpit issue neon container.' },
    { id: 'FLAME' as SkinType, name: 'Solar Flame', styleName: 'Solar Flare', price: 1500, color: '#FF5500', shadowColor: '#FFCC00', desc: 'Charged thermal particles with blazing trails.' },
    { id: 'MATRIX' as SkinType, name: 'Digital Matrix', styleName: 'Green Code', price: 2500, color: '#39FF14', shadowColor: '#00FF00', desc: 'Matrix grid pattern synced with mainframe calculations.' },
    { id: 'STRIPE' as SkinType, name: 'Apex Stripe', styleName: 'Fuchsia Aero', price: 4000, color: '#E0115F', shadowColor: '#FF007F', desc: 'Streamlined diagonal speed stripes.' },
    { id: 'GOLD' as SkinType, name: 'Aureum Gold', styleName: 'Champion Gilt', price: 6000, color: '#FFD700', shadowColor: '#FFA500', desc: 'Stellar fusion gold coating with extra shining flakes.' },
    { id: 'OVERLORD' as SkinType, name: 'Mythic Overlord', styleName: 'Purpurea Void', price: 12000, color: '#8A2BE2', shadowColor: '#DA70D6', desc: 'Deep space cosmic over-authority container emitting purple dark matter.' },
    { id: 'GLITCH' as SkinType, name: 'Glitch Matrix', styleName: 'Chrono Glitch', price: 20000, color: '#FF0055', shadowColor: '#00FFFF', desc: 'Mainframe unstable code-folding glitch emitting flickering cyan & neon pink streams.' },
    { id: 'VOID_LORD' as SkinType, name: 'Void Lord Spectrum', styleName: 'Gothic Obsidian', price: 35000, color: '#9D00FF', shadowColor: '#FF007A', desc: 'Prestige Obsidian void-spewer emitting dark matter and superheated pink flares.' },
    { id: 'CHRONO_SHIFT' as SkinType, name: 'Chrono Rift Shift', styleName: 'Time Loop Engine', price: 50000, color: '#00F0FF', shadowColor: '#FF00EA', desc: 'The ultimate reality-bending customizable box that shifts and warps time dimensions.' }
  ];

  const trailsMetadata = [
    { id: 'DEFAULT', name: 'Default Trail', styleName: 'Exhaust Sync', price: 0, desc: 'Interactive exhaust matches color theme of currently equipped box skin.' },
    { id: 'FIRE', name: 'Fire Trail', styleName: 'Thermonuclear Flare', price: 5000, desc: 'Unleashes roaring thermal plasma and red/orange flares in your wake.' },
    { id: 'RAINBOW', name: 'Rainbow Plasma', styleName: 'Spectrum Phase Map', price: 10000, desc: 'Color-cycling polychromatic trail transitioning dynamically across active spectrum.' },
    { id: 'CHRONO_PORTAL', name: 'Chrono Portal Wave', styleName: 'Temporal Tear', price: 25000, desc: 'Generates beautiful chronomantic energy ripples in fuchsia and purple.' },
    { id: 'VOID_EMISSION', name: 'Void Emission Gas', styleName: 'Nebula Stream', price: 45000, desc: 'Unleashes dark-matter nebula fields floating in anti-gravity loops.' }
  ];

  const handleBuySkin = (skin: typeof skinsMetadata[0]) => {
    if (purchasedSkins.includes(skin.id)) {
      setActiveSkin(skin.id);
      try { localStorage.setItem('rhythm_dash_equipped_skin', skin.id); } catch {}
      gameAudio.playJump();
      showNotification(`Equipped ${skin.name}!`);
      return;
    }

    if (dashTokens >= skin.price) {
      const nextBalance = dashTokens - skin.price;
      addDashTokens(-skin.price);
      const nextSkins = [...purchasedSkins, skin.id];
      setPurchasedSkins(nextSkins);
      setActiveSkin(skin.id);
      try {
        localStorage.setItem('rhythm_dash_unlocked_skins', JSON.stringify(nextSkins));
        localStorage.setItem('rhythm_dash_equipped_skin', skin.id);
        localStorage.setItem('rhythm_dash_tokens', nextBalance.toString());
      } catch {}
      gameAudio.playCoin();
      showNotification(`Sukses membeli & memakai ${skin.name}!`);
    } else {
      gameAudio.playDeath();
      showNotification(`Token Dash tidak cukup untuk ${skin.name}!`);
    }
  };

  const handleBuyTrail = (trail: typeof trailsMetadata[0]) => {
    if (purchasedTrails.includes(trail.id)) {
      setActiveTrail(trail.id);
      try { localStorage.setItem('rhythm_dash_equipped_trail', trail.id); } catch {}
      gameAudio.playJump();
      showNotification(`Equipped ${trail.name}!`);
      return;
    }

    if (dashTokens >= trail.price) {
      const nextBalance = dashTokens - trail.price;
      addDashTokens(-trail.price);
      const nextTrails = [...purchasedTrails, trail.id];
      setPurchasedTrails(nextTrails);
      setActiveTrail(trail.id);
      try {
        localStorage.setItem('rhythm_dash_unlocked_trails', JSON.stringify(nextTrails));
        localStorage.setItem('rhythm_dash_equipped_trail', trail.id);
        localStorage.setItem('rhythm_dash_tokens', nextBalance.toString());
      } catch {}
      gameAudio.playCoin();
      showNotification(`Sukses membeli & memakai ${trail.name}!`);
    } else {
      gameAudio.playDeath();
      showNotification(`Token Dash tidak cukup untuk ${trail.name}!`);
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-[#06060a]/98 backdrop-blur-md flex flex-col justify-between p-5 sm:p-8 z-25 overflow-y-auto pointer-events-auto select-none"
      id="shop-overlay-screen"
    >
      {/* HUD Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 rotate-45 inline-block"></span>
            KUSTOMISASI TOKO
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">MATRIX CUSTOMS & PREMIUM GARAGE</p>
        </div>

        {/* Balance Display */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0b0b10] border border-white/10 px-4 py-1.5 rounded-sm flex items-center gap-2 font-mono">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">SALDO AKSI:</span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1 text-sm">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
              {dashTokens} DT
            </span>
          </div>

          <button
            onClick={() => onGameStateChange('TOPUP_SCREEN')}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black tracking-widest text-[10px] sm:text-xs uppercase transition-all hover:scale-105 active:scale-95 border-0 rounded-sm cursor-pointer"
          >
            + TOP-UP
          </button>
        </div>
      </div>

      {/* Persistent Status Notification Toast */}
      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-cyan-950/95 border border-cyan-400 text-cyan-400 text-xs font-mono px-6 py-2.5 rounded-sm shadow-[0_0_15px_rgba(0,255,204,0.3)] animate-pulse z-40">
          {notification}
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex gap-2.5 mt-5 font-mono text-[10px] sm:text-xs border-b border-white/5 pb-3">
        <button
          onClick={() => setShopTab('SKINS')}
          className={`px-4 py-2 font-bold uppercase transition-all tracking-widest cursor-pointer border-0 rounded-sm ${
            shopTab === 'SKINS'
              ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          SKINS KUBUS ({skinsMetadata.length})
        </button>
        <button
          onClick={() => setShopTab('TRAILS')}
          className={`px-4 py-2 font-bold uppercase transition-all tracking-widest cursor-pointer border-0 rounded-sm ${
            shopTab === 'TRAILS'
              ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          EFEK TRAILS ({trailsMetadata.length})
        </button>
      </div>

      {/* Items Showcase Frame (Fully Fluid Grid) */}
      <div className="flex-1 my-5 overflow-y-visible">
        {shopTab === 'SKINS' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {skinsMetadata.map((skin) => {
              const isLocked = !purchasedSkins.includes(skin.id);
              const isActive = activeSkin === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => handleBuySkin(skin)}
                  className={`flex flex-col justify-between p-4 bg-[#0a0a0e] border rounded-sm transition-all relative overflow-hidden group cursor-pointer ${
                    isActive 
                      ? 'border-cyan-400 ring-1 ring-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-cyan-950/10' 
                      : isLocked 
                        ? 'border-white/5 hover:border-white/20' 
                        : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Decorative color indicator background strip */}
                  <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: skin.color }} />

                  <div>
                    {/* Visual Cube Mockup */}
                    <div className="h-16 flex items-center justify-center my-3 relative">
                      <div
                        className="w-10 h-10 border-2 rounded-sm transition-all duration-300 relative group-hover:scale-110 flex items-center justify-center"
                        style={{
                          borderColor: skin.color,
                          boxShadow: `0 0 12px ${skin.shadowColor}`,
                          backgroundColor: '#050508',
                        }}
                      >
                        {/* Smile Face inside preview cube */}
                        <div className="flex flex-col justify-between w-6 h-5 absolute">
                          <div className="flex justify-between">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          </div>
                          <span className="w-3.5 h-[2px] bg-white rounded-full self-center"></span>
                        </div>
                      </div>
                    </div>

                    {/* Skin Labels */}
                    <div className="text-center font-mono">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{skin.name}</h4>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">{skin.styleName}</p>
                      <p className="text-[9px] text-zinc-400 leading-normal font-mono uppercase mt-2 font-normal h-10 overflow-hidden line-clamp-3">
                        {skin.desc}
                      </p>
                    </div>
                  </div>

                  {/* Purchase/Equip Button */}
                  <div className="mt-4 font-mono text-[10px]">
                    {isActive ? (
                      <div className="w-full py-1.5 text-center bg-cyan-400 text-black font-black uppercase tracking-widest rounded-sm text-[9px]">
                        AKTIF MENGINJAK
                      </div>
                    ) : isLocked ? (
                      <div className="w-full py-2 flex justify-between items-center px-2 bg-zinc-950 border border-white/10 rounded-sm hover:border-amber-400 transition-all text-[9.5px]">
                        <span className="text-zinc-500 font-bold uppercase">BELI</span>
                        <span className="text-amber-500 font-black">{skin.price} DT</span>
                      </div>
                    ) : (
                      <div className="w-full py-1.5 text-center bg-zinc-900 border border-white/20 text-zinc-300 hover:text-white hover:border-white font-heavy uppercase tracking-widest rounded-sm text-[9px]">
                        PAKAI SKIN
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {trailsMetadata.map((trail) => {
              const isLocked = !purchasedTrails.includes(trail.id);
              const isActive = activeTrail === trail.id;

              return (
                <div
                  key={trail.id}
                  onClick={() => handleBuyTrail(trail)}
                  className={`flex flex-col justify-between p-4 bg-[#0a0a0e] border rounded-sm transition-all relative overflow-hidden group cursor-pointer ${
                    isActive 
                      ? 'border-cyan-400 ring-1 ring-cyan-400/30 bg-cyan-950/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                      : isLocked 
                        ? 'border-white/5 hover:border-white/20' 
                        : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div>
                    {/* Visual representation of trail particles */}
                    <div className="h-10 flex items-center justify-center gap-1.5 my-3">
                      {trail.id === 'FIRE' ? (
                        <>
                          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce"></span>
                          <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                        </>
                      ) : trail.id === 'RAINBOW' ? (
                        <>
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-sm animate-pulse"></span>
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-sm animate-pulse delay-100"></span>
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm animate-pulse delay-200"></span>
                        </>
                      ) : trail.id === 'CHRONO_PORTAL' ? (
                        <>
                          <span className="w-3 h-3 border border-pink-500 rounded-full animate-ping"></span>
                          <span className="w-2 h-2 bg-violet-600 rounded-full"></span>
                        </>
                      ) : trail.id === 'VOID_EMISSION' ? (
                        <>
                          <span className="w-3.5 h-2 bg-purple-950 rounded-full border border-purple-500 animate-pulse"></span>
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                          <span className="w-1.5 h-1.5 bg-cyan-400/55 rounded-full animate-pulse delay-75"></span>
                        </>
                      )}
                    </div>

                    <div className="text-center font-mono">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{trail.name}</h4>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">{trail.styleName}</p>
                      <p className="text-[9px] text-zinc-400 font-mono uppercase mt-2 h-10 overflow-hidden line-clamp-3">
                        {trail.desc}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-4 font-mono text-[10px]">
                    {isActive ? (
                      <div className="w-full py-1.5 text-center bg-cyan-400 text-black font-black uppercase tracking-widest rounded-sm text-[9px]">
                        AKTIF MENGALIR
                      </div>
                    ) : isLocked ? (
                      <div className="w-full py-2 flex justify-between items-center px-2 bg-zinc-950 border border-white/10 rounded-sm hover:border-amber-400 transition-all text-[9.5px]">
                        <span className="text-zinc-500 font-bold uppercase">BELI</span>
                        <span className="text-amber-500 font-black">{trail.price} DT</span>
                      </div>
                    ) : (
                      <div className="w-full py-1.5 text-center bg-zinc-900 border border-white/20 text-zinc-300 hover:text-white hover:border-white font-heavy uppercase tracking-widest rounded-sm text-[9px]">
                        PAKAI TRAIL
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return footer block */}
      <div className="border-t border-white/5 pt-4 mt-auto flex justify-end">
        <button
          onClick={() => onGameStateChange('HOME_SCREEN')}
          className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold tracking-widest text-xs uppercase transition-all rounded-sm hover:scale-103 cursor-pointer border border-white/10"
        >
          KEMBALI KE MENU
        </button>
      </div>
    </div>
  );
};
