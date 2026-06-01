/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const generateStandaloneHTML = (): string => {
  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rhythm Dash 2D - Standalone</title>
    <!-- Tailwind CSS CDN for lightweight styling inside Electron / standalone browser -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: #03000a;
            margin: 0;
            padding: 0;
            overflow: hidden;
            user-select: none;
            -webkit-user-select: none;
        }
        .mono-font {
            font-family: 'JetBrains Mono', monospace;
        }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen text-white bg-slate-950">

    <!-- Container Utama -->
    <div class="relative flex flex-col items-center justify-center w-full max-w-4xl p-4">
        
        <!-- Header Game -->
        <div class="w-full flex items-center justify-between mb-3 text-sm">
            <div class="flex items-center gap-2">
                <span class="inline-block w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
                <span class="font-bold tracking-widest text-[#00ffcc] uppercase text-xs">ELECTRON READY</span>
            </div>
            <div class="flex gap-4 mono-font text-slate-400 text-xs">
                <div>SKOR TERTINGGI: <span id="high-score-display" class="text-amber-400 font-bold">0</span></div>
            </div>
        </div>

        <!-- Canvas Wrapper Viewport -->
        <div id="canvas-container" class="relative w-full h-[320px] sm:h-[450px] bg-slate-950 flex items-center justify-center overflow-hidden border-2 border-indigo-500/30 rounded-xl cursor-pointer shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <canvas id="game-canvas" width="800" height="450" class="block w-full h-full bg-slate-950"></canvas>

            <!-- Main Menu Overlay -->
            <div id="menu-overlay" class="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-6">
                <div class="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-1">
                    2D RITME PLATFORMER
                </div>
                <h1 class="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4">
                    Rhythm <span class="text-cyan-400">Dash 2D</span>
                </h1>
                <p class="text-slate-300 text-sm max-w-sm mb-6 leading-relaxed font-normal">
                    Lompati barisan duri tajam dan rintangan balok mengikuti alunan ketukan ritme elektronik.
                </p>
                
                <button id="start-button" class="px-8 py-3 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/30 transform active:scale-95 transition-all text-base tracking-wide">
                    Mulai Bermain
                </button>

                <div class="absolute bottom-4 text-xs text-slate-500 mono-font">
                    Tekan <span class="text-slate-300 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">Space</span>, <span class="text-slate-300 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">X</span>, atau Klik Layar untuk Melompat
                </div>
            </div>

            <!-- Game Over Overlay -->
            <div id="gameover-overlay" class="absolute inset-0 bg-rose-950/85 flex flex-col items-center justify-center text-center p-6 hidden">
                <div class="text-rose-500 text-xs tracking-widest uppercase mb-1">
                    CRASH BERBAHAYA!
                </div>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-widest mb-3">
                    GAME OVER
                </h1>
                
                <div class="mb-5">
                    <span class="text-slate-400 text-xs block">Skor Akhir</span>
                    <span id="final-score-value" class="text-3xl font-black text-amber-400 mono-font">0</span>
                </div>

                <button id="retry-button" class="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg shadow-lg shadow-emerald-500/20 transform active:scale-95 transition-all uppercase text-sm">
                    Main Lagi
                </button>
            </div>

            <!-- Scoring Banner during Play -->
            <div id="live-score-badge" class="absolute top-4 left-1/2 -translate-x-1/2 flex items-baseline gap-2 bg-slate-950/80 px-4 py-1 rounded-full border border-cyan-500/20 shadow-lg pointer-events-none hidden">
                <span class="text-slate-400 text-[10px] mono-font tracking-widest">SKOR:</span>
                <span id="live-score-value" class="text-cyan-400 text-lg font-black mono-font">0</span>
            </div>
            
            <!-- Floating Volume Toggle -->
            <button id="mute-button" class="absolute bottom-4 right-4 z-50 p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors pointer-pointer text-slate-300">
                <svg id="volume-icon-unmuted" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                <svg id="volume-icon-muted" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            </button>
        </div>

        <div class="text-slate-500 text-xs mt-3 mono-font flex items-center justify-between w-full">
            <span>Rhythm Dash v1.0.0 (Standalone Electron Ready)</span>
            <span>Gunakan tombol Space untuk Melompat</span>
        </div>
    </div>

    <!-- SCRIPT ENGINE -->
    <script>
        // 1. Audio Engine via Web Audio API 
        class StandaloneAudio {
            constructor() {
                this.ctx = null;
                this.masterGain = null;
                this.bgmPlaying = false;
                this.bgmIntervalId = null;
                this.isMuted = false;
            }

            init() {
                if (this.ctx) return;
                try {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContextClass();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.connect(this.ctx.destination);
                    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
                } catch (e) {
                    console.log("Audio contexts not supported", e);
                }
            }

            setMute(muted) {
                this.isMuted = muted;
                if (this.masterGain && this.ctx) {
                    this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
                }
            }

            playJump() {
                this.init();
                if (!this.ctx || this.isMuted) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);

                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now);
                osc.stop(now + 0.17);
            }

            playDeath() {
                this.init();
                if (!this.ctx || this.isMuted) return;
                const now = this.ctx.currentTime;
                
                // Deep shock sound
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now);
                osc.stop(now + 0.51);

                // Noise crunch
                try {
                    const bufferSize = this.ctx.sampleRate * 0.35;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }

                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;

                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(900, now);
                    filter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

                    const noiseGain = this.ctx.createGain();
                    noiseGain.gain.setValueAtTime(0.25, now);
                    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

                    noise.connect(filter);
                    filter.connect(noiseGain);
                    noiseGain.connect(this.masterGain);

                    noise.start(now);
                    noise.stop(now + 0.35);
                } catch (e) {}
            }

            startBGM() {
                this.init();
                if (this.bgmPlaying) return;
                this.bgmPlaying = true;
                
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }

                let stepCount = 0;
                const stepDuration = 0.22; // Beats timing

                const melody = [220, 220, 330, 220, 174, 174, 261, 174, 196, 196, 293, 196, 165, 165, 247, 165];

                const scheduleNext = () => {
                    if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
                    const now = this.ctx.currentTime;
                    const freq = melody[stepCount % melody.length];

                    // Bass Synth pluck
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq / 2, now);
                    
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration * 0.9);

                    osc.connect(gain);
                    gain.connect(this.masterGain);

                    osc.start(now);
                    osc.stop(now + stepDuration);

                    // HiHat rhythm ticks
                    if (stepCount % 2 === 1) {
                        const hOsc = this.ctx.createOscillator();
                        const hGain = this.ctx.createGain();
                        hOsc.type = 'sine';
                        hOsc.frequency.setValueAtTime(10000, now);
                        hGain.gain.setValueAtTime(0.012, now);
                        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                        hOsc.connect(hGain);
                        hGain.connect(this.masterGain);
                        hOsc.start(now);
                        hOsc.stop(now + 0.04);
                    }

                    // Synth Kick
                    if (stepCount % 4 === 0) {
                        const kOsc = this.ctx.createOscillator();
                        const kGain = this.ctx.createGain();
                        kOsc.type = 'sine';
                        kOsc.frequency.setValueAtTime(130, now);
                        kOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

                        kGain.gain.setValueAtTime(0.2, now);
                        kGain.gain.exponentialRampToValueAtTime(0.002, now + 0.13);

                        kOsc.connect(kGain);
                        kGain.connect(this.masterGain);

                        kOsc.start(now);
                        kOsc.stop(now + 0.14);
                    }

                    stepCount++;
                    this.bgmIntervalId = setTimeout(scheduleNext, stepDuration * 1000 - 10);
                };

                scheduleNext();
            }

            stopBGM() {
                this.bgmPlaying = false;
                if (this.bgmIntervalId) {
                    clearTimeout(this.bgmIntervalId);
                    this.bgmIntervalId = null;
                }
            }
        }

        const sAudio = new StandaloneAudio();

        // 2. Game Setup Variables
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('canvas-container');

        const menuOverlay = document.getElementById('menu-overlay');
        const gameoverOverlay = document.getElementById('gameover-overlay');
        const liveScoreBadge = document.getElementById('live-score-badge');
        const liveScoreValue = document.getElementById('live-score-value');
        const finalScoreValue = document.getElementById('final-score-value');
        const highScoreDisplay = document.getElementById('high-score-display');
        const muteButton = document.getElementById('mute-button');
        const volumeIconUnmuted = document.getElementById('volume-icon-unmuted');
        const volumeIconMuted = document.getElementById('volume-icon-muted');

        // High Score Loading
        let highScore = 0;
        try {
            const lsValue = localStorage.getItem('stand_high_score');
            highScore = lsValue ? parseInt(lsValue, 10) : 0;
        } catch(e){}
        highScoreDisplay.textContent = highScore;

        let gameState = 'MAIN_MENU'; // MAIN_MENU, PLAYING, GAME_OVER
        let currentScore = 0;
        let speed = 6.2;
        let distanceTraveled = 0;
        let screenShake = 0;
        let lastSpawn = 800;
        let isMuted = false;

        const config = {
            gravity: 0.8,
            jumpForce: -13.5,
            baseSpeed: 6.2,
            speedIncrement: 0.05,
            canvasWidth: 800,
            canvasHeight: 450,
            floorY: 370
        };

        const player = {
            x: 120,
            y: config.floorY - 40,
            width: 40,
            height: 40,
            vy: 0,
            onGround: true,
            rotation: 0,
            targetRotation: 0,
            rotationSpeed: 0,
            jumpBuffered: false,
            bufferTimer: 0,
            trailTimer: 0
        };

        let obstacles = [];
        let particles = [];
        let stars = [];

        // Stars generator
        for(let i=0; i<40; i++) {
            stars.push({
                x: Math.random() * config.canvasWidth,
                y: Math.random() * (config.floorY - 50),
                size: Math.random() * 2 + 1,
                speed: (Math.random() * 0.5 + 0.1) * 0.7
            });
        }

        // Base frame counting
        let frame = 0;

        // Reset game model
        function resetGame() {
            currentScore = 0;
            liveScoreValue.textContent = "0";
            speed = config.baseSpeed;
            distanceTraveled = 0;
            screenShake = 0;
            obstacles = [];
            particles = [];
            lastSpawn = config.canvasWidth;
            
            player.x = 120;
            player.y = config.floorY - 40;
            player.vy = 0;
            player.onGround = true;
            player.rotation = 0;
            player.targetRotation = 0;
            player.rotationSpeed = 0;
            player.jumpBuffered = false;
            player.bufferTimer = 0;
            player.trailTimer = 0;
        }

        // JUMP TRIGGERING
        function triggerJump() {
            if (gameState === 'MAIN_MENU') {
                gameState = 'PLAYING';
                resetGame();
                menuOverlay.classList.add('hidden');
                liveScoreBadge.classList.remove('hidden');
                sAudio.startBGM();
                sAudio.playJump();
                return;
            }

            if (gameState === 'GAME_OVER') {
                gameState = 'PLAYING';
                resetGame();
                gameoverOverlay.classList.add('hidden');
                liveScoreBadge.classList.remove('hidden');
                sAudio.startBGM();
                sAudio.playJump();
                return;
            }

            if (player.onGround) {
                player.vy = config.jumpForce;
                player.onGround = false;
                player.targetRotation = player.rotation + Math.PI / 2;
                player.rotationSpeed = Math.PI / 2 / 24;
                player.jumpBuffered = false;
                player.bufferTimer = 0;
                sAudio.playJump();
                spawnSplashParticles(player.x + player.width/2, config.floorY, 12);
            } else {
                player.jumpBuffered = true;
                player.bufferTimer = 12;
            }
        }

        // EVENT LISTENERS FOR CONTROLS
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'x' || e.key === 'X') {
                e.preventDefault();
                triggerJump();
            }
        });

        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('#mute-button')) return;
            e.preventDefault();
            triggerJump();
        });

        container.addEventListener('touchstart', (e) => {
            if (e.target.closest('#mute-button')) return;
            e.preventDefault();
            triggerJump();
        });

        // Mute button click handler
        muteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            sAudio.setMute(isMuted);
            if (isMuted) {
                volumeIconUnmuted.classList.add('hidden');
                volumeIconMuted.classList.remove('hidden');
            } else {
                volumeIconUnmuted.classList.remove('hidden');
                volumeIconMuted.classList.add('hidden');
                sAudio.init(); // reinitialize safely
            }
        });

        // procedural obstacles
        function spawnObstacles() {
            const airFrames = Math.abs(config.jumpForce / config.gravity) * 2;
            const minSafeGap = speed * airFrames * 1.35;
            
            if (config.canvasWidth - lastSpawn < minSafeGap) {
                return;
            }

            const rand = Math.random();
            let type = 'SPIKE_SINGLE';
            let width = 36;
            let height = 36;

            if (rand < 0.4) {
                type = 'SPIKE_SINGLE';
                width = 36;
                height = 36;
            } else if (rand < 0.72) {
                type = 'SPIKE_DOUBLE';
                width = 72;
                height = 36;
            } else {
                type = 'BLOCK';
                width = 38;
                height = 38;
            }

            obstacles.push({
                x: config.canvasWidth + 50,
                y: config.floorY - height,
                width,
                height,
                type
            });

            lastSpawn = config.canvasWidth + 50;
        }

        // SAT Collision Mathematics
        function getRotatedPoint(px, py, cx, cy, rad) {
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const dx = px - cx;
            const dy = py - cy;
            return {
                x: cx + (dx * cos - dy * sin),
                y: cy + (dx * sin + dy * cos)
            };
        }

        function checkCollisions() {
            const cx = player.x + player.width / 2;
            const cy = player.y + player.height / 2;

            const p0 = getRotatedPoint(player.x, player.y, cx, cy, player.rotation);
            const p1 = getRotatedPoint(player.x + player.width, player.y, cx, cy, player.rotation);
            const p2 = getRotatedPoint(player.x + player.width, player.y + player.height, cx, cy, player.rotation);
            const p3 = getRotatedPoint(player.x, player.y + player.height, cx, cy, player.rotation);
            const playerPoly = [p0, p1, p2, p3];

            for (const obs of obstacles) {
                let obsPoly = [];

                if (obs.type === 'BLOCK') {
                    obsPoly = [
                        { x: obs.x, y: obs.y },
                        { x: obs.x + obs.width, y: obs.y },
                        { x: obs.x + obs.width, y: obs.y + obs.height },
                        { x: obs.x, y: obs.y + obs.height }
                    ];
                    if (satCheck(playerPoly, obsPoly)) {
                        triggerCrash();
                        return;
                    }
                } else if (obs.type === 'SPIKE_SINGLE') {
                    obsPoly = [
                        { x: obs.x, y: obs.y + obs.height },
                        { x: obs.x + obs.width / 2, y: obs.y + 1 },
                        { x: obs.x + obs.width, y: obs.y + obs.height }
                    ];
                    if (satCheck(playerPoly, obsPoly)) {
                        triggerCrash();
                        return;
                    }
                } else if (obs.type === 'SPIKE_DOUBLE') {
                    const hw = obs.width / 2;
                    const tri1 = [
                        { x: obs.x, y: obs.y + obs.height },
                        { x: obs.x + hw / 2, y: obs.y + 1 },
                        { x: obs.x + hw, y: obs.y + obs.height }
                    ];
                    const tri2 = [
                        { x: obs.x + hw, y: obs.y + obs.height },
                        { x: obs.x + hw + hw / 2, y: obs.y + 1 },
                        { x: obs.x + obs.width, y: obs.y + obs.height }
                    ];
                    if (satCheck(playerPoly, tri1) || satCheck(playerPoly, tri2)) {
                        triggerCrash();
                        return;
                    }
                }
            }
        }

        function satCheck(polyA, polyB) {
            function getNormals(poly) {
                const normals = [];
                for (let i = 0; i < poly.length; i++) {
                    const p1 = poly[i];
                    const p2 = poly[(i + 1) % poly.length];
                    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
                    const normal = { x: -edge.y, y: edge.x };
                    const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
                    normals.push({ x: normal.x / len, y: normal.y / len });
                }
                return normals;
            }

            function project(poly, axis) {
                let min = Infinity;
                let max = -Infinity;
                for (const p of poly) {
                    const dot = p.x * axis.x + p.y * axis.y;
                    if (dot < min) min = dot;
                    if (dot > max) max = dot;
                }
                return { min, max };
            }

            const axes = [...getNormals(polyA), ...getNormals(polyB)];

            for (const axis of axes) {
                const projA = project(polyA, axis);
                const projB = project(polyB, axis);

                if (projA.max < projB.min || projB.max < projA.min) {
                    return false; // gap exists
                }
            }
            return true;
        }

        // CRASH GAME OVER GAME STATE
        function triggerCrash() {
            gameState = 'GAME_OVER';
            sAudio.stopBGM();
            sAudio.playDeath();
            
            screenShake = 18;
            spawnDeathExplosion(player.x + player.width/2, player.y + player.height/2);

            if (currentScore > highScore) {
                highScore = currentScore;
                try {
                    localStorage.setItem('stand_high_score', highScore.toString());
                } catch(e){}
                highScoreDisplay.textContent = highScore;
            }

            liveScoreBadge.classList.add('hidden');
            finalScoreValue.textContent = currentScore;
            gameoverOverlay.classList.remove('hidden');
        }

        // PARTICLES ENGINES
        function spawnTrailParticle(x, y) {
            particles.push({
                x,
                y,
                vx: -(speed * 0.4) - Math.random() * 1.5,
                vy: -Math.random() * 1.5,
                size: Math.random() * 6 + 3,
                color: 'rgba(0, 240, 255, ' + (Math.random() * 0.4 + 0.4) + ')',
                alpha: 1,
                life: 0,
                maxLife: Math.floor(Math.random() * 15 + 15)
            });
        }

        function spawnSplashParticles(x, y, count) {
            for (let i = 0; i < count; i++) {
                particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 5 - speed * 0.2,
                    vy: -Math.random() * 3 - 1,
                    size: Math.random() * 4 + 2,
                    color: 'rgba(255, 255, 255, ' + (Math.random() * 0.5 + 0.5) + ')',
                    alpha: 1,
                    life: 0,
                    maxLife: Math.floor(Math.random() * 20 + 10)
                });
            }
        }

        function spawnDeathExplosion(x, y) {
            const colors = ['#FF0055', '#00FFCC', '#FFCC00', '#FFFFFF'];
            for (let i = 0; i < 55; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 8 + 3;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    life: 0,
                    maxLife: Math.floor(Math.random() * 40 + 30),
                    rotation: Math.random() * Math.PI,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                });
            }
        }

        // MASTER LOOP update PHYSICS + DRAWING
        function mainLoop() {
            frame++;
            ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

            // Camera shake math offset
            let shakeX = 0, shakeY = 0;
            if (screenShake > 0) {
                shakeX = (Math.random() - 0.5) * screenShake * 1.5;
                shakeY = (Math.random() - 0.5) * screenShake * 1.5;
                screenShake -= 0.6;
            }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            if (gameState === 'PLAYING') {
                // physics logic
                if (player.jumpBuffered) {
                    player.bufferTimer--;
                    if (player.bufferTimer <= 0) player.jumpBuffered = false;
                }

                player.vy += config.gravity;
                player.y += player.vy;

                const limit = config.floorY - player.height;
                if (player.y >= limit) {
                    player.y = limit;
                    player.vy = 0;

                    if (!player.onGround) {
                        player.onGround = true;
                        player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
                        player.targetRotation = player.rotation;
                        player.rotationSpeed = 0;
                        spawnSplashParticles(player.x + player.width/2, config.floorY, 6);
                    }

                    if (player.jumpBuffered) {
                        player.vy = config.jumpForce;
                        player.onGround = false;
                        player.targetRotation = player.rotation + Math.PI / 2;
                        player.rotationSpeed = Math.PI / 2 / 24;
                        player.jumpBuffered = false;
                        player.bufferTimer = 0;
                        sAudio.playJump();
                        spawnSplashParticles(player.x + player.width/2, config.floorY, 8);
                    }
                }

                // rotation rotation Speed
                if (!player.onGround) {
                    player.rotation += player.rotationSpeed;
                } else {
                    player.trailTimer++;
                    if (player.trailTimer >= 3) {
                        spawnTrailParticle(player.x + 4, config.floorY - 2);
                        player.trailTimer = 0;
                    }
                }

                checkCollisions();

                // distance increments
                distanceTraveled += speed;
                const calcScore = Math.floor(distanceTraveled / 450);
                if (calcScore > currentScore) {
                    currentScore = calcScore;
                    liveScoreValue.textContent = currentScore;
                    speed = config.baseSpeed + currentScore * config.speedIncrement;
                }

                lastSpawn -= speed;

                if (obstacles.length === 0 || lastSpawn < config.canvasWidth) {
                    if (Math.random() < 0.08) {
                        spawnObstacles();
                    }
                }
            }

            // Move stars and backgrounds
            const scSpd = gameState === 'PLAYING' ? speed * 0.15 : 0.4;
            stars.forEach(s => {
                s.x -= scSpd * s.speed;
                if (s.x < -10) s.x = config.canvasWidth + 10;
            });

            if (gameState === 'PLAYING') {
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    obstacles[i].x -= speed;
                    if (obstacles[i].x + obstacles[i].width < -100) {
                        obstacles.splice(i, 1);
                    }
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.vy !== 0 && Math.abs(p.vx) > 0.5) p.vy += 0.08;
                if (p.rotation !== undefined) p.rotation += p.rotationSpeed;
                p.life++;
                p.alpha = 1 - (p.life / p.maxLife);
                if (p.life >= p.maxLife || p.alpha <= 0) {
                    particles.splice(i, 1);
                }
            }

            // RENDERS STAGES
            // Background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, config.canvasHeight);
            bgGrad.addColorStop(0, '#0a0518');
            bgGrad.addColorStop(0.65, '#150930');
            bgGrad.addColorStop(1, '#0e0422');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

            stars.forEach(s => {
                ctx.fillStyle = \`rgba(255, 255, 255, \${Math.sin(frame * 0.02 + s.x) * 0.35 + 0.65})\`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Grid Parallax
            ctx.save();
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.15)';
            ctx.lineWidth = 1;
            const gridScl = (frame * (gameState === 'PLAYING' ? speed * 0.1 : 0.2)) % 60;
            for (let x = -60; x <= config.canvasWidth + 60; x += 60) {
                ctx.beginPath();
                ctx.moveTo(x - gridScl, 160);
                ctx.lineTo(x - gridScl - 100, config.floorY);
                ctx.stroke();
            }
            ctx.restore();

            // Obstacles
            obstacles.forEach(obs => {
                ctx.save();
                if (obs.type === 'BLOCK') {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = '#E63946';
                    ctx.fillStyle = '#1D0D15';
                    ctx.strokeStyle = '#E63946';
                    ctx.lineWidth = 3;
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
                    
                    ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(obs.x, obs.y + obs.height - 8);
                    ctx.lineTo(obs.x + obs.width - 8, obs.y);
                    ctx.moveTo(obs.x + 8, obs.y + obs.height);
                    ctx.lineTo(obs.x + obs.width, obs.y + 8);
                    ctx.stroke();
                } else if (obs.type === 'SPIKE_SINGLE') {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#FF0055';
                    const sg = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
                    sg.addColorStop(0, '#FF0055');
                    sg.addColorStop(1, '#3b001a');
                    ctx.fillStyle = sg;
                    ctx.strokeStyle = '#FF0055';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(obs.x, obs.y + obs.height);
                    ctx.lineTo(obs.x + obs.width / 2, obs.y);
                    ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else if (obs.type === 'SPIKE_DOUBLE') {
                    const hw = obs.width / 2;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#FF0055';

                    // first
                    const g1 = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
                    g1.addColorStop(0, '#FF0055');
                    g1.addColorStop(1, '#3b001a');
                    ctx.fillStyle = g1;
                    ctx.strokeStyle = '#FF0055';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(obs.x, obs.y + obs.height);
                    ctx.lineTo(obs.x + hw / 2, obs.y);
                    ctx.lineTo(obs.x + hw, obs.y + obs.height);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // second
                    const g2 = ctx.createLinearGradient(obs.x + hw, obs.y, obs.x + hw, obs.y + obs.height);
                    g2.addColorStop(0, '#FF0055');
                    g2.addColorStop(1, '#3b001a');
                    ctx.fillStyle = g2;
                    ctx.beginPath();
                    ctx.moveTo(obs.x + hw, obs.y + obs.height);
                    ctx.lineTo(obs.x + hw + hw / 2, obs.y);
                    ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.restore();
            });

            // Floor
            const floorH = config.canvasHeight - config.floorY;
            const fg = ctx.createLinearGradient(0, config.floorY, 0, config.canvasHeight);
            fg.addColorStop(0, '#100a2d');
            fg.addColorStop(0.1, '#1b0d45');
            fg.addColorStop(1, '#060212');
            ctx.fillStyle = fg;
            ctx.fillRect(0, config.floorY, config.canvasWidth, floorH);

            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f0ff';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, config.floorY);
            ctx.lineTo(config.canvasWidth, config.floorY);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.save();
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.lineWidth = 1.5;
            const stOff = (frame * (gameState === 'PLAYING' ? speed : 1)) % 32;
            for(let x = -32; x < config.canvasWidth + 60; x += 32) {
                ctx.beginPath();
                ctx.moveTo(x - stOff, config.floorY);
                ctx.lineTo(x - stOff - 50, config.canvasHeight);
                ctx.stroke();
            }
            ctx.restore();

            // Particles
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

            // Player cube
            if (gameState !== 'GAME_OVER' || screenShake > 10) {
                ctx.save();
                const plCx = player.x + player.width / 2;
                const plCy = player.y + player.height / 2;
                ctx.translate(plCx, plCy);
                ctx.rotate(player.rotation);

                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00FFCC';
                ctx.fillStyle = '#05181b';
                ctx.strokeStyle = '#00FFCC';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.rect(-player.width / 2, -player.height / 2, player.width, player.height);
                ctx.fill();
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.strokeStyle = 'rgba(0, 255, 204, 0.7)';
                ctx.lineWidth = 2;
                ctx.strokeRect(-player.width/3, -player.height/3, (player.width*2)/3, (player.height*2)/3);

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(-player.width/4 - 3, -player.height/4, 6, 6);
                ctx.fillRect(player.width/4 - 3, -player.height/4, 6, 6);

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-6, 6);
                ctx.lineTo(6, 6);
                ctx.stroke();

                ctx.restore();
            }

            ctx.restore();

            requestAnimationFrame(mainLoop);
        }

        // Handle scaling aspect ratio
        function scaleLayout() {
            const containerW = container.clientWidth;
            const containerH = container.clientHeight;
            const aspect = config.canvasWidth / config.canvasHeight;

            let finalW = containerW;
            let finalH = containerW / aspect;

            if (finalH > containerH) {
                finalH = containerH;
                finalW = containerH * aspect;
            }

            canvas.style.width = finalW + 'px';
            canvas.style.height = finalH + 'px';
        }

        const runResize = new ResizeObserver(() => scaleLayout());
        runResize.observe(container);
        scaleLayout();

        // start overlay triggers
        const startBtn = document.getElementById('start-button');
        const retryBtn = document.getElementById('retry-button');

        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerJump();
        });

        retryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerJump();
        });

        // Run Loop
        mainLoop();

    </script>
</body>
</html>`;
};
