import React, { useState } from 'react';
import { GameState } from '../types';
import { gameAudio } from '../audio';

interface TopupOverlayProps {
  dashTokens: number;
  addDashTokens: (amount: number) => void;
  onGameStateChange: (state: GameState) => void;
  spawnExplosionAtCenter?: () => void;
}

export const TopupOverlay: React.FC<TopupOverlayProps> = ({
  dashTokens,
  addDashTokens,
  onGameStateChange,
  spawnExplosionAtCenter,
}) => {
  const topUpPacks = [
    { id: 'pack_1', name: 'NOVICE PACK', tokens: 500, priceIDR: 'Rp 15.000', badge: 'MULAILAH' },
    { id: 'pack_2', name: 'CYBER ENFORCER', tokens: 1500, priceIDR: 'Rp 35.000', badge: 'POPULER' },
    { id: 'pack_3', name: 'MAINFRAME KING', tokens: 5000, priceIDR: 'Rp 80.000', badge: 'REKOMENDASI' },
    { id: 'pack_4', name: 'OVERLORD NUCLEUS', tokens: 15000, priceIDR: 'Rp 150.000', badge: 'TERBAIK' },
    { id: 'pack_5', name: 'SINGULARITY INFINITY', tokens: 50000, priceIDR: 'Rp 300.000', badge: 'SULTAN' },
  ];

  const paymentGateways = [
    { id: 'GOPAY', name: 'GOPAY INSTANT', slogan: 'Verifikasi Instan 1-Klik', color: 'bg-emerald-500 hover:border-emerald-400' },
    { id: 'DANA', name: 'DANA WALLET', slogan: 'Saku Dompet Digital Aman', color: 'bg-sky-500 hover:border-sky-400' },
    { id: 'OVO', name: 'OVO POINT', slogan: 'Ovo Cash & Points GPN', color: 'bg-purple-600 hover:border-purple-500' },
    { id: 'QRIS', name: 'QRIS NASIONAL', slogan: 'Scan QR Code Standar Indonesia', color: 'bg-pink-600 hover:border-pink-500' },
  ];

  type PaymentStep = 'SELECT_PACK' | 'SELECT_GATEWAY' | 'PROCESSING' | 'SUCCESS';
  
  const [currentStep, setCurrentStep] = useState<PaymentStep>('SELECT_PACK');
  const [selectedPack, setSelectedPack] = useState<typeof topUpPacks[0] | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<typeof paymentGateways[0] | null>(null);
  const [pipelineLog, setPipelineLog] = useState<string>('');
  const [pipelinePercent, setPipelinePercent] = useState<number>(0);

  const startAuthorizationCycle = (gateway: typeof paymentGateways[0]) => {
    setSelectedGateway(gateway);
    setCurrentStep('PROCESSING');
    setPipelinePercent(10);
    setPipelineLog('MEMBUKA KONEKSI KE SERVER GATEWAY KEAMANAN BANK INDONESIA (BI-FAST)...');

    setTimeout(() => {
      setPipelinePercent(35);
      setPipelineLog(`MENGHUBUNGKAN SALURAN SSL BERENKRIPSI 256-BIT DENGAN GATEWAY ${gateway.name}...`);
    }, 450);

    setTimeout(() => {
      setPipelinePercent(60);
      setPipelineLog('MENGAUTENTIKASI SIGNATURE TRANSAKSI DIGITAL PADA DOMPET REKENING...');
    }, 950);

    setTimeout(() => {
      setPipelinePercent(85);
      setPipelineLog(`VERIFIKASI SUKSES! SEDANG MENYETOR +${selectedPack?.tokens} TOKEN KE AKUN GAME...`);
    }, 1500);

    setTimeout(() => {
      setPipelinePercent(100);
      if (selectedPack) {
        addDashTokens(selectedPack.tokens);
      }
      setCurrentStep('SUCCESS');
      gameAudio.playCoin();
      if (spawnExplosionAtCenter) {
        spawnExplosionAtCenter();
      }
    }, 2000);
  };

  const selectPackToBuy = (pack: typeof topUpPacks[0]) => {
    setSelectedPack(pack);
    setCurrentStep('SELECT_GATEWAY');
    gameAudio.playJump();
  };

  const handleResetOrBack = () => {
    if (currentStep === 'SELECT_GATEWAY') {
      setCurrentStep('SELECT_PACK');
    } else {
      onGameStateChange('HOME_SCREEN');
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-[#040407]/99 backdrop-blur-md flex flex-col justify-between p-5 sm:p-8 z-25 overflow-y-auto pointer-events-auto select-none"
      id="topup-screen-overlay"
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            PORTAL TOP-UP TOKENS
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">SECURE TRANSACTION CENTER</p>
        </div>

        {/* Current State Indicator */}
        <div className="bg-[#0b0b10] border border-white/10 px-4 py-1.5 rounded-sm flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 uppercase">SALDO SEKARANG:</span>
          <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
            {dashTokens} DT
          </span>
        </div>
      </div>

      {/* Main Payment Pipeline Body */}
      <div className="flex-1 my-6 flex flex-col justify-center items-center">
        
        {/* Step 1: Select Pack */}
        {currentStep === 'SELECT_PACK' && (
          <div className="w-full max-w-5xl">
            <p className="text-center text-zinc-400 text-xs sm:text-sm uppercase tracking-wide mb-6 font-mono">
              PILIH PAKET TOKEN DASH YANG INGIN ANDA ISI ULANG SECARA INSTAN
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {topUpPacks.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => selectPackToBuy(pack)}
                  className="bg-[#09090d] border border-white/5 hover:border-amber-400/50 p-4 rounded-sm flex flex-col justify-between cursor-pointer transition-all hover:scale-103 group hover:bg-[#0c0c14]/40"
                >
                  <div className="text-center relative">
                    <span className="text-[8px] sm:text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/20 uppercase font-black tracking-widest absolute -top-2 left-1/2 -translate-x-1/2">
                      {pack.badge}
                    </span>

                    {/* Gold Token Circle preview */}
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto mt-4 mb-3 group-hover:scale-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                      <span className="text-amber-400 font-black text-xs font-mono">DT</span>
                    </div>

                    <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider">{pack.name}</h3>
                  </div>

                  <div className="text-center mt-5 font-mono">
                    <div className="text-amber-400 text-base sm:text-lg font-black tracking-wider">
                      +{pack.tokens} DT
                    </div>
                    <div className="text-zinc-500 text-[10px] sm:text-xs tracking-wider mt-1.5 border-t border-white/5 pt-2">
                      Harga: <span className="text-white font-bold">{pack.priceIDR}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Gateway */}
        {currentStep === 'SELECT_GATEWAY' && selectedPack && (
          <div className="w-full max-w-xl bg-[#09090c]/90 border border-white/10 p-5 sm:p-6 rounded-sm shadow-2xl font-mono">
            <h3 className="text-sm font-black text-white text-center uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
              METODE PEMBAYARAN ELEKTRONIK
            </h3>

            <div className="bg-zinc-950 border border-white/5 p-3 rounded-sm mb-4 text-xs flex justify-between tracking-wide">
              <span className="text-zinc-500">PAKET PILIHAN:</span>
              <span className="text-amber-400 font-bold uppercase">{selectedPack.name} (+{selectedPack.tokens} DT)</span>
            </div>

            <div className="bg-zinc-950 border border-white/5 p-3 rounded-sm mb-5 text-xs flex justify-between tracking-wide">
              <span className="text-zinc-500">TOTAL TAGIHAN:</span>
              <span className="text-white font-heavy text-sm">{selectedPack.priceIDR}</span>
            </div>

            <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mb-3">Pilihlah salah satu E-Wallet untuk otentikasi:</p>

            <div className="space-y-3">
              {paymentGateways.map((gw) => (
                <button
                  key={gw.id}
                  onClick={() => startAuthorizationCycle(gw)}
                  className="w-full p-4 bg-zinc-950 border border-white/5 rounded-sm flex items-center justify-between text-left hover:border-cyan-400/50 hover:bg-[#0c0c14] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon tag placeholder resembling actual e-wallet color keys */}
                    <span className={`w-3.5 h-3.5 rounded-full ${gw.color.split(' ')[0]} animate-pulse`} />
                    <div>
                      <span className="text-xs font-black text-white uppercase block leading-none">{gw.name}</span>
                      <span className="text-[9px] text-zinc-500 uppercase mt-0.5 block">{gw.slogan}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-bold group-hover:translate-x-1 transition-all">BAYAR &gt;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Server Handshake Processing */}
        {currentStep === 'PROCESSING' && selectedPack && selectedGateway && (
          <div className="w-full max-w-md bg-[#09090c] border border-white/10 p-6 rounded-sm text-center font-mono">
            {/* Spinning Neon Core Indicator */}
            <div className="w-12 h-12 border-3 border-t-amber-400 border-r-transparent border-l-transparent border-b-amber-400 rounded-full animate-spin mx-auto mb-4" />

            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">OTENTIKASI TRANSAKSI AMAN</h3>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest mb-4">MENGHUBUNGKAN SALURAN {selectedGateway.name}</p>

            {/* Dynamic Handshake Console Output */}
            <div className="bg-black/90 rounded-sm border border-white/5 p-4 text-left h-24 overflow-y-auto mb-4 font-mono text-[9px] text-emerald-400 leading-normal uppercase">
              <div className="text-[8px] text-zinc-500 tracking-wider mb-1.5 border-b border-white/5 pb-1">CONSOLE PIPELINE LOGS:</div>
              <div>{pipelineLog}</div>
            </div>

            {/* Loading status bar indicator */}
            <div className="h-1 bg-zinc-900 w-full rounded-sm overflow-hidden mb-1.5">
              <div className="h-full bg-amber-400 transition-all duration-150" style={{ width: `${pipelinePercent}%` }}></div>
            </div>
            <div className="text-[9px] text-zinc-500 text-right uppercase tracking-widest">{pipelinePercent}% SELESAI</div>
          </div>
        )}

        {/* Step 4: Verification Success Response */}
        {currentStep === 'SUCCESS' && selectedPack && (
          <div className="w-full max-w-sm bg-[#09090c] border border-emerald-500/30 p-6 rounded-sm text-center font-mono animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            {/* Success Glowing Mark */}
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)] progress-pulse scale-up-pulse">
              <span className="text-emerald-400 font-extrabold text-xl">✔</span>
            </div>

            <h3 className="text-base font-black text-white uppercase tracking-widest">TRANSAKSI SELESAI</h3>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mt-1 mb-5">VERIFIKASI TELEMETRI STATUS: BERHASIL</p>

            <div className="bg-zinc-950 border border-white/5 p-4 rounded-sm text-xs font-mono select-text text-left space-y-2.5 mb-5 text-zinc-400">
              <div className="flex justify-between border-b border-white/5 pb-1.5 font-bold">
                <span>FAKTUR RECEIPT:</span>
                <span className="text-emerald-500">SUCCESS</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>PRODUK:</span>
                <span className="text-white">{selectedPack.name}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>PENDIDIKAN DT:</span>
                <span className="text-amber-400 font-bold">+{selectedPack.tokens} DASH TOKENS</span>
              </div>
              <div className="flex justify-between text-[11px] border-t border-white/5 pt-1.5">
                <span>HASH TRANSAKSI:</span>
                <span className="text-zinc-600 font-mono text-[9px]">TX_{Math.floor(Math.random() * 900000 + 100000)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedPack(null);
                setSelectedGateway(null);
                setCurrentStep('SELECT_PACK');
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black border-0 rounded-sm font-black text-xs uppercase tracking-widest cursor-pointer transition-all hover:scale-105"
            >
              KEMBALI KE METODE
            </button>
          </div>
        )}
      </div>

      {/* Back control navigation buttons footer */}
      <div className="border-t border-white/5 pt-4 flex justify-between items-center mt-auto font-mono text-xs">
        {currentStep === 'SELECT_GATEWAY' ? (
          <button
            onClick={() => setCurrentStep('SELECT_PACK')}
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded-sm font-bold uppercase transition-all tracking-widest cursor-pointer"
          >
            &lt; KEMBALI
          </button>
        ) : (
          <div className="w-[1px] h-1 bg-transparent block" />
        )}

        {currentStep !== 'PROCESSING' && currentStep !== 'SUCCESS' && (
          <button
            onClick={handleResetOrBack}
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-heavy border border-white/10 rounded-sm uppercase tracking-widest transition-all hover:scale-103 cursor-pointer"
          >
            KEMBALI KE MENU
          </button>
        )}
      </div>
    </div>
  );
};
