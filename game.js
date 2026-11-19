// game.js - Animal Crossing Style Cozy Puzzle Dash Engine with 3-Player Support & Live Mini-Rival Monitors
(function() {
    'use strict';

    // Game Constants & Configuration
    const TIME_ATTACK_TOTAL = 60.0;
    const RECORD_KEY = 'cozy_dash_record_v1';

    const POWERUP_TYPES = [
        { id: 'FREEZE',  name: 'SIESTA',        icon: '💤', desc: 'Duerme al rival 2.5s' },
        { id: 'REVERSE', name: 'MARIPOSA',      icon: '🦋', desc: 'Invierte controles 4s' },
        { id: 'ROCK',    name: 'MACETA',        icon: '🪴', desc: 'Pone una macetita estorbo' },
        { id: 'INK',     name: 'TÉ TIBIO',      icon: '☕', desc: 'Cubre pantalla con té' },
        { id: 'TURBO',   name: 'MIEL DULCE',    icon: '🍯', desc: 'Paso ligero por 5s' },
        { id: 'SHIELD',  name: 'ESCUDO FLORAL', icon: '🛡️', desc: 'Bloquea el prox. ataque' },
        { id: 'WIND',    name: 'RÁFAGA VIENTO', icon: '🌪️', desc: 'Descoloca una caja rival' }
    ];

    // Characters without fictional names - pure avatars/emojis
    const CHARACTERS = {
        mochi:  { id: 'mochi',  avatar: '🐱', color: '#f07b65', earColor: '#f07b65', earType: 'cat' },
        matcha: { id: 'matcha', avatar: '🐶', color: '#5ea848', earColor: '#438230', earType: 'dog' },
        boba:   { id: 'boba',   avatar: '🐰', color: '#9d72b8', earColor: '#8456a0', earType: 'bunny' },
        kuma:   { id: 'kuma',   avatar: '🐻', color: '#c68642', earColor: '#a76527', earType: 'bear' }
    };

    // DOM Elements - Lobby
    const lobbyScreen = document.getElementById('lobby-screen');
    const gameScreen = document.getElementById('game-screen');
    const charPicker = document.getElementById('char-picker');
    const tabModePvp = document.getElementById('tab-mode-pvp');
    const tabModeTime = document.getElementById('tab-mode-time');
    const tabCount2 = document.getElementById('tab-count-2');
    const tabCount3 = document.getElementById('tab-count-3');
    const roundTargetRow = document.getElementById('round-target-row');
    const targetBtns = document.querySelectorAll('.target-chip-btn');
    const localBannerTitle = document.getElementById('local-banner-title');
    const localBannerDesc = document.getElementById('local-banner-desc');
    const btnCreateRoom = document.getElementById('btn-create-room');
    const btnJoinRoom = document.getElementById('btn-join-room');
    const btnLocalBattle = document.getElementById('btn-local-battle');
    const inputRoomCode = document.getElementById('input-room-code');
    const inputPlayerName = document.getElementById('input-player-name');
    const waitingBox = document.getElementById('waiting-box');
    const displayRoomCode = document.getElementById('display-room-code');
    const waitingTitle = document.getElementById('waiting-title');
    const waitingSubtitle = document.getElementById('waiting-subtitle');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const btnStartOnlineNow = document.getElementById('btn-start-online-now');
    const btnCancelWaiting = document.getElementById('btn-cancel-waiting');
    const toastBanner = document.getElementById('toast-banner');

    // Lobby Waiting Slots
    const waitRow1 = document.getElementById('wait-row-1');
    const waitName1 = document.getElementById('wait-name-1');
    const waitRow2 = document.getElementById('wait-row-2');
    const waitName2 = document.getElementById('wait-name-2');
    const waitRow3 = document.getElementById('wait-row-3');
    const waitName3 = document.getElementById('wait-name-3');

    // DOM Elements - HUD
    const hudModeMeta = document.getElementById('hud-mode-meta');
    const hudCenterBox = document.getElementById('hud-center-box');
    const pillP1 = document.getElementById('pill-p1');
    const pillP2 = document.getElementById('pill-p2');
    const pillP3 = document.getElementById('pill-p3');
    const avatarP1 = document.getElementById('avatar-p1');
    const avatarP2 = document.getElementById('avatar-p2');
    const avatarP3 = document.getElementById('avatar-p3');
    const scoreP1Elem = document.getElementById('score-p1');
    const scoreP2Elem = document.getElementById('score-p2');
    const scoreP3Elem = document.getElementById('score-p3');

    // Inventory Trays
    const slotsP1 = [
        document.getElementById('slot-p1-0'),
        document.getElementById('slot-p1-1'),
        document.getElementById('slot-p1-2')
    ];
    const slotsP2 = [
        document.getElementById('slot-p2-0'),
        document.getElementById('slot-p2-1'),
        document.getElementById('slot-p2-2')
    ];
    const slotsP3 = [
        document.getElementById('slot-p3-0'),
        document.getElementById('slot-p3-1'),
        document.getElementById('slot-p3-2')
    ];

    // Round History Bar
    const roundHistoryChips = document.getElementById('round-history-chips');

    // Rivals Monitor Strip (Live Mini-Canvases Up Top)
    const rivalsMonitorStrip = document.getElementById('rivals-monitor-strip');
    const rivalCard1 = document.getElementById('rival-card-1');
    const rivalCard2 = document.getElementById('rival-card-2');
    const miniCanvas1 = document.getElementById('mini-canvas-1');
    const miniCanvas2 = document.getElementById('mini-canvas-2');
    const ctxMini1 = miniCanvas1 ? miniCanvas1.getContext('2d') : null;
    const ctxMini2 = miniCanvas2 ? miniCanvas2.getContext('2d') : null;
    const rivalMiniAvatar1 = document.getElementById('rival-mini-avatar-1');
    const rivalMiniAvatar2 = document.getElementById('rival-mini-avatar-2');
    const rivalMiniScore1 = document.getElementById('rival-mini-score-1');
    const rivalMiniScore2 = document.getElementById('rival-mini-score-2');
    const targetInd1 = document.getElementById('target-ind-1');
    const targetInd2 = document.getElementById('target-ind-2');
    const miniStatus1 = document.getElementById('mini-status-1');
    const miniStatus2 = document.getElementById('mini-status-2');

    // Main Arena (Dedicated to Active Local Player)
    const mainArenaBox = document.getElementById('main-arena-box');
    const mainArenaTag = document.getElementById('main-arena-tag');
    const mainCanvas = document.getElementById('main-canvas');
    const mainCtx = mainCanvas.getContext('2d');
    const freezeOverlayMain = document.getElementById('freeze-overlay-main');
    const inkOverlayMain = document.getElementById('ink-overlay-main');
    const debuffBannerMain = document.getElementById('debuff-banner-main');

    // Action Buttons
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnExitGame = document.getElementById('btn-exit-game');
    const btnTouchPower = document.getElementById('btn-touch-power');
    const btnTouchPowerIcon = document.getElementById('btn-touch-power-icon');
    const btnTouchPowerLabel = document.getElementById('btn-touch-power-label');
    const btnTouchReset = document.getElementById('btn-touch-reset');
    const footerP2Hint = document.getElementById('footer-p2-hint');
    const footerP3Hint = document.getElementById('footer-p3-hint');

    // Round Winner Announcement Modal
    const roundWinModal = document.getElementById('round-win-modal');
    const roundWinTitle = document.getElementById('round-win-title');
    const roundWinAvatar = document.getElementById('round-win-avatar');
    const roundWinName = document.getElementById('round-win-name');
    const roundWinScoreboard = document.getElementById('round-win-scoreboard');

    // Match Win Modal
    const winModal = document.getElementById('win-modal');
    const winTitle = document.getElementById('win-title');
    const winDesc = document.getElementById('win-desc');
    const btnRematch = document.getElementById('btn-rematch');
    const btnWinExit = document.getElementById('btn-win-exit');

    // Game Mode & Match State
    let selectedGameType = 'pvp'; // 'pvp' or 'time_attack'
    let maxPlayers = 2;           // 2 or 3 players
    let targetScore = 5;          // Configurable rounds to win (3, 5, 7, 10)
    let matchSessionMode = 'local'; // 'local', 'online_host', 'online_client'
    let localPlayerId = 1;        // 1 (host), 2 (client 1), 3 (client 2)
    let currentLevelIndex = 0;
    let currentRoundNumber = 1;
    let isMatchOver = false;
    let isRoundTransitioning = false;
    let roundTransitionTimeout = null;
    let levelStartTime = 0;

    // Time Attack Engine State
    let timeAttackRemaining = TIME_ATTACK_TOTAL;
    let timeAttackTimerId = null;
    let lastTickedSecond = 60;
    let personalRecord = parseInt(localStorage.getItem(RECORD_KEY) || '0', 10);

    // Round History Array: [ { round: 1, winnerChar: char, winnerId: 1 } ]
    let roundHistory = [];

    // Targeting in 3-Player Matches: Holds rival player ID currently targeted
    let targetedRivalId = null;

    // Selected Character & Name in Lobby
    let selectedCharId = 'mochi';
    let localPlayerName = localStorage.getItem('cozy_dash_name') || 'Aldeano';
    let currentBaseTemplate = null;

    // Networking (PeerJS)
    let peer = null;
    let netConnections = []; // Array of active client connections for Host
    let clientConn = null;   // Single connection for Client to Host
    let isHost = false;
    let nextSynchronizedSeed = null;

    // Particles System
    let particles = [];

    // Players Array (P1, P2, P3)
    const players = [
        createPlayerState(1, 'mochi'),
        createPlayerState(2, 'matcha'),
        createPlayerState(3, 'boba')
    ];

    function createPlayerState(id, defaultCharId) {
        return {
            id,
            name: `J${id}`,
            char: CHARACTERS[defaultCharId],
            score: 0,
            x: 2,
            y: 2,
            px: 2 * 50,
            py: 2 * 50,
            angle: 0,
            inventory: [], // Stackable inventory (max 3 items)
            shieldActive: false,
            shieldUntil: 0,
            frozenUntil: 0,
            reversedUntil: 0,
            turboUntil: 0,
            inkUntil: 0,
            board: null,
            isBot: false,
            lastBotActionTime: 0
        };
    }

    // Discrete Touch Swipe: Moves EXACTLY ONE tile per swipe gesture
    let touchTrack = {
        active: false,
        startX: 0,
        startY: 0,
        swipeHandled: false
    };

    // -------------------------------------------------------------
    // Initialization & Anti-Zoom System
    // -------------------------------------------------------------
    function init() {
        disableAllBrowserZoom();

        // Unlock Web Audio on first user interaction
        const unlockAudio = () => {
            window.sounds.init();
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('pointerdown', unlockAudio);
        };
        document.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('pointerdown', unlockAudio, { passive: true });

        window.addEventListener('keydown', handleKeyDown);

        setupCharacterPicker();
        setupModeTabs();
        setupPlayerCountTabs();
        setupTargetScoreSelector();
        setupDiscreteTouchSwipe();
        setupRivalTargetingClicks();
        setupRoundWinModalSkip();

        if (inputPlayerName) {
            inputPlayerName.value = localPlayerName;
            inputPlayerName.addEventListener('input', () => {
                const val = inputPlayerName.value.trim();
                localPlayerName = val || 'Aldeano';
                localStorage.setItem('cozy_dash_name', localPlayerName);
                if (players[localPlayerId - 1]) {
                    players[localPlayerId - 1].name = localPlayerName;
                }
                if (isHost && waitName1) {
                    waitName1.textContent = `J1 (${localPlayerName} - ${players[0].char.avatar})`;
                }
                updateHUDNames();
                sendNetworkMessage({
                    type: 'PLAYER_NAME_UPDATE',
                    playerId: localPlayerId,
                    name: localPlayerName
                });
            });
        }

        btnCreateRoom.addEventListener('click', startOnlineHost);
        btnJoinRoom.addEventListener('click', startOnlineClient);
        btnLocalBattle.addEventListener('click', () => startBattle('local'));
        btnCopyLink.addEventListener('click', copyDirectLink);
        btnStartOnlineNow.addEventListener('click', () => {
            if (isHost) {
                const initialSeed = Math.floor(Math.random() * 1000000000);
                broadcast({
                    type: 'HOST_START_NOW',
                    seed: initialSeed,
                    gameType: selectedGameType,
                    targetScore: targetScore
                });
                startBattle('online_host', initialSeed);
            }
        });

        btnSoundToggle.addEventListener('click', () => {
            const muted = window.sounds.toggleMute();
            btnSoundToggle.textContent = muted ? '🔇' : '🔊';
        });

        btnExitGame.addEventListener('click', returnToLobby);
        btnWinExit.addEventListener('click', returnToLobby);
        if (btnCancelWaiting) btnCancelWaiting.addEventListener('click', returnToLobby);
        btnRematch.addEventListener('click', () => {
            if (isHost) {
                const nextSeed = Math.floor(Math.random() * 1000000000);
                broadcast({ type: 'MATCH_RESTART', targetScore, seed: nextSeed });
                resetMatch(nextSeed);
            } else if (matchSessionMode === 'local') {
                resetMatch();
            } else {
                sendNetworkMessage({ type: 'REQUEST_REMATCH' });
                showToast("Solicitud de revancha enviada...", 2000);
            }
        });

        btnTouchPower.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const user = getLocalPlayer();
            const target = getTargetPlayerFor(user);
            usePowerup(user, target);
        });

        btnTouchReset.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const user = getLocalPlayer();
            resetCurrentPlayerBoard(user);
        });

        updateLobbyRecordDisplay();
        checkUrlHash();

        requestAnimationFrame(gameLoop);
    }

    // Completely disable all mobile browser zoom, pinch, and pull gestures
    function disableAllBrowserZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey) e.preventDefault();
        }, { passive: false });

        document.body.addEventListener('touchmove', (e) => {
            if (gameScreen.style.display === 'flex') {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // -------------------------------------------------------------
    // Skip Round Winner Modal on Any Touch / Click
    // -------------------------------------------------------------
    function setupRoundWinModalSkip() {
        // Tapping or clicking directly on the modal or anywhere on screen skips it immediately
        roundWinModal.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            skipRoundWinCelebration();
        });

        window.addEventListener('pointerdown', () => {
            if (isRoundTransitioning && roundWinModal.style.display === 'flex') {
                skipRoundWinCelebration();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (isRoundTransitioning && roundWinModal.style.display === 'flex') {
                skipRoundWinCelebration();
            }
        });
    }

    function skipRoundWinCelebration() {
        if (!isRoundTransitioning || roundWinModal.style.display !== 'flex') return;

        if (!isHost && matchSessionMode === 'online_client') {
            sendNetworkMessage({ type: 'REQUEST_SKIP_MODAL' });
            return;
        }

        if (roundTransitionTimeout) {
            clearTimeout(roundTransitionTimeout);
            roundTransitionTimeout = null;
        }

        roundWinModal.style.display = 'none';
        isRoundTransitioning = false;
        currentRoundNumber++;

        if (isHost && matchSessionMode === 'online_host') {
            broadcast({
                type: 'SKIP_ROUND_MODAL',
                nextSeed: nextSynchronizedSeed,
                roundNumber: currentRoundNumber
            });
        }

        loadRoundLevel(currentLevelIndex + 1, nextSynchronizedSeed);
    }

    // -------------------------------------------------------------
    // Mode, Player Count & Target Rounds Selectors
    // -------------------------------------------------------------
    function setupModeTabs() {
        tabModePvp.addEventListener('click', () => {
            selectedGameType = 'pvp';
            tabModePvp.classList.add('active');
            tabModeTime.classList.remove('active');
            roundTargetRow.style.display = 'flex';
            updateLobbyRecordDisplay();
            window.sounds.playMove();
        });

        tabModeTime.addEventListener('click', () => {
            selectedGameType = 'time_attack';
            tabModeTime.classList.add('active');
            tabModePvp.classList.remove('active');
            roundTargetRow.style.display = 'none';
            updateLobbyRecordDisplay();
            window.sounds.playMove();
        });
    }

    function setupPlayerCountTabs() {
        tabCount2.addEventListener('click', () => {
            maxPlayers = 2;
            tabCount2.classList.add('active');
            tabCount3.classList.remove('active');
            updateLobbyPlayerSlots();
            window.sounds.playMove();
        });

        tabCount3.addEventListener('click', () => {
            maxPlayers = 3;
            tabCount3.classList.add('active');
            tabCount2.classList.remove('active');
            updateLobbyPlayerSlots();
            window.sounds.playMove();
        });
    }

    function setupTargetScoreSelector() {
        targetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                targetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                targetScore = parseInt(btn.getAttribute('data-target'), 10) || 5;
                updateLobbyRecordDisplay();
                window.sounds.playMove();
            });
        });
    }

    function updateLobbyPlayerSlots() {
        if (maxPlayers === 3) {
            waitRow3.style.display = 'flex';
        } else {
            waitRow3.style.display = 'none';
        }
        updateLobbyRecordDisplay();
    }

    function updateLobbyRecordDisplay() {
        personalRecord = parseInt(localStorage.getItem(RECORD_KEY) || '0', 10);
        if (selectedGameType === 'pvp') {
            localBannerTitle.textContent = `🌿 MODO LOCAL (PROCEDURAL - ${maxPlayers} JUGADORES)`;
            localBannerDesc.textContent = `Puzles 100% procedurales. Carrera al primero a ${targetScore} rondas.`;
            hudModeMeta.textContent = `META: ${targetScore} RONDAS`;
        } else {
            localBannerTitle.textContent = `⏱️ CONTRARRELOJ 60s (Récord: ${personalRecord} 🏆)`;
            localBannerDesc.textContent = `¿Cuántos puzles puedes resolver en 1 minuto? ¡Puzles procedurables infinitos!`;
            hudModeMeta.textContent = '⏱️ CONTRARRELOJ 60s';
        }
    }

    // -------------------------------------------------------------
    // Character Selector (Avatares limpios sin nombres)
    // -------------------------------------------------------------
    function setupCharacterPicker() {
        const cards = charPicker.querySelectorAll('.char-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                selectedCharId = card.getAttribute('data-char');
                players[0].char = CHARACTERS[selectedCharId];
                waitName1.textContent = `J1 (Tú - ${players[0].char.avatar})`;
                window.sounds.playMove();
            });
        });
    }

    // -------------------------------------------------------------
    // Discrete Touch Swipe (Moves EXACTLY ONE Grid Tile Per Swipe)
    // -------------------------------------------------------------
    function setupDiscreteTouchSwipe() {
        const SWIPE_THRESHOLD = 20;

        mainArenaBox.addEventListener('pointerdown', (e) => {
            touchTrack.active = true;
            touchTrack.startX = e.clientX;
            touchTrack.startY = e.clientY;
            touchTrack.swipeHandled = false;
        }, { passive: false });

        window.addEventListener('pointermove', (e) => {
            if (!touchTrack.active || touchTrack.swipeHandled || isMatchOver || isRoundTransitioning) return;

            const deltaX = e.clientX - touchTrack.startX;
            const deltaY = e.clientY - touchTrack.startY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (Math.max(absX, absY) >= SWIPE_THRESHOLD) {
                let dx = 0, dy = 0;
                if (absX > absY) {
                    dx = deltaX > 0 ? 1 : -1;
                } else {
                    dy = deltaY > 0 ? 1 : -1;
                }

                const user = getLocalPlayer();
                executePlayerSwipe(user, dx, dy);
                touchTrack.swipeHandled = true; // Lock swipe until finger lifts!
            }
        }, { passive: false });

        const handlePointerUp = () => {
            touchTrack.active = false;
            touchTrack.swipeHandled = false;
        };
        window.addEventListener('pointerup', handlePointerUp, { passive: true });
        window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    }

    function executePlayerSwipe(player, dx, dy) {
        if (isMatchOver || isRoundTransitioning) return;
        const now = Date.now();

        if (now < player.reversedUntil) {
            dx = -dx;
            dy = -dy;
        }

        if (now >= player.frozenUntil) {
            movePlayer(player, dx, dy);
            if (navigator.vibrate) navigator.vibrate(12);
        }
    }

    function getLocalPlayer() {
        return players[localPlayerId - 1] || players[0];
    }

    function getTargetPlayerFor(user) {
        const activeRivals = players.slice(0, maxPlayers).filter(p => p.id !== user.id);
        if (activeRivals.length === 0) return players[0];
        if (activeRivals.length === 1) return activeRivals[0];

        if (targetedRivalId) {
            const chosen = activeRivals.find(p => p.id === targetedRivalId);
            if (chosen) return chosen;
        }

        // Default: Target the rival in 1st place (with most points)
        activeRivals.sort((a, b) => b.score - a.score);
        return activeRivals[0];
    }

    function setupRivalTargetingClicks() {
        if (rivalCard1) {
            rivalCard1.addEventListener('click', () => {
                const rivals = getRivalsForLocalPlayer();
                if (rivals[0]) {
                    targetedRivalId = rivals[0].id;
                    updateTargetVisuals();
                    window.sounds.playMove();
                    showToast(`🎯 Objetivo: ${rivals[0].char.avatar}`, 1200);
                }
            });
        }
        if (rivalCard2) {
            rivalCard2.addEventListener('click', () => {
                const rivals = getRivalsForLocalPlayer();
                if (rivals[1]) {
                    targetedRivalId = rivals[1].id;
                    updateTargetVisuals();
                    window.sounds.playMove();
                    showToast(`🎯 Objetivo: ${rivals[1].char.avatar}`, 1200);
                }
            });
        }
    }

    function updateTargetVisuals() {
        const rivals = getRivalsForLocalPlayer();
        if (rivalCard1) {
            if (rivals[0] && targetedRivalId === rivals[0].id) {
                rivalCard1.classList.add('targeted');
            } else {
                rivalCard1.classList.remove('targeted');
            }
        }
        if (rivalCard2) {
            if (rivals[1] && targetedRivalId === rivals[1].id) {
                rivalCard2.classList.add('targeted');
            } else {
                rivalCard2.classList.remove('targeted');
            }
        }
    }

    function getRivalsForLocalPlayer() {
        return players.slice(0, maxPlayers).filter(p => p.id !== localPlayerId);
    }

    function checkUrlHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#room=')) {
            const code = hash.replace('#room=', '').toUpperCase();
            if (code) {
                inputRoomCode.value = code;
                showToast(`Código ${code} listo. ¡Haz clic en Unirse!`, 3500);
            }
        }
    }

    function showToast(msg, duration = 2500) {
        toastBanner.textContent = msg;
        toastBanner.style.display = 'block';
        setTimeout(() => {
            toastBanner.style.display = 'none';
        }, duration);
    }

    // -------------------------------------------------------------
    // Match Flow & Setup
    // -------------------------------------------------------------
    function startBattle(sessionMode, syncSeed = null) {
        matchSessionMode = sessionMode;
        lobbyScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        winModal.style.display = 'none';
        roundWinModal.style.display = 'none';

        isMatchOver = false;
        isRoundTransitioning = false;
        currentRoundNumber = 1;
        currentLevelIndex = 0;
        roundHistory = [];

        // Clear player states
        players.forEach(p => {
            p.score = 0;
            p.inventory = [];
            p.shieldActive = false;
            p.shieldUntil = 0;
            clearPlayerDebuffs(p);
        });

        // Setup characters and names
        if (sessionMode === 'local' || sessionMode === 'online_host') {
            players[0].name = localPlayerName;
            players[0].char = CHARACTERS[selectedCharId];
            const remainingChars = Object.keys(CHARACTERS).filter(k => k !== selectedCharId);
            if (sessionMode === 'local') {
                players[1].name = 'Bot 1';
                players[1].char = CHARACTERS[remainingChars[0] || 'matcha'];
                players[2].name = 'Bot 2';
                players[2].char = CHARACTERS[remainingChars[1] || 'boba'];
            }
        } else if (sessionMode === 'online_client') {
            if (players[localPlayerId - 1]) {
                players[localPlayerId - 1].name = localPlayerName;
                players[localPlayerId - 1].char = CHARACTERS[selectedCharId];
            }
        }

        // Assign bot flag for local matches
        if (sessionMode === 'local') {
            players[1].isBot = true;
            players[2].isBot = true;
        } else {
            players.forEach(p => p.isBot = false);
        }

        // Configure HUD visibility for 2 vs 3 players
        if (maxPlayers === 3) {
            pillP3.style.display = 'flex';
            rivalCard2.style.display = 'flex';
            if (footerP3Hint) footerP3Hint.style.display = 'inline-block';
        } else {
            pillP3.style.display = 'none';
            rivalCard2.style.display = 'none';
            if (footerP3Hint) footerP3Hint.style.display = 'none';
        }

        // Set default targeted rival
        const rivals = getRivalsForLocalPlayer();
        targetedRivalId = rivals[0] ? rivals[0].id : null;
        updateTargetVisuals();

        updateHUDNames();
        updateScoreboard();
        updateInventoryHUD();
        renderRoundHistory();

        if (selectedGameType === 'time_attack') {
            hudModeMeta.textContent = '⏱️ CONTRARRELOJ 60s';
            startTimeAttackTimer();
        } else {
            hudModeMeta.textContent = `META: ${targetScore} RONDAS`;
            stopTimeAttackTimer();
        }

        loadRoundLevel(0, syncSeed);
    }

    function updateHUDNames() {
        const local = getLocalPlayer();
        mainArenaTag.textContent = `${local.name.toUpperCase()} ${local.char.avatar}`;
        mainArenaTag.style.color = local.char.color;

        avatarP1.textContent = players[0].char.avatar;
        avatarP2.textContent = players[1].char.avatar;
        avatarP3.textContent = players[2].char.avatar;

        const rivals = getRivalsForLocalPlayer();
        if (rivals[0]) {
            rivalMiniAvatar1.textContent = `${rivals[0].char.avatar} ${rivals[0].name}`;
            rivalMiniScore1.textContent = `⭐ ${rivals[0].score}`;
        }
        if (rivals[1] && maxPlayers === 3) {
            rivalMiniAvatar2.textContent = `${rivals[1].char.avatar} ${rivals[1].name}`;
            rivalMiniScore2.textContent = `⭐ ${rivals[1].score}`;
        }
    }

    function resetMatch(syncSeed = null) {
        winModal.style.display = 'none';
        roundWinModal.style.display = 'none';
        isMatchOver = false;
        isRoundTransitioning = false;
        currentRoundNumber = 1;
        currentLevelIndex = 0;
        roundHistory = [];

        players.forEach(p => {
            p.score = 0;
            p.inventory = [];
            p.shieldActive = false;
            clearPlayerDebuffs(p);
        });

        updateScoreboard();
        updateInventoryHUD();
        renderRoundHistory();

        if (selectedGameType === 'time_attack') {
            startTimeAttackTimer();
        } else {
            hudModeMeta.textContent = `META: ${targetScore} RONDAS`;
        }

        loadRoundLevel(0, syncSeed);
    }

    // -------------------------------------------------------------
    // Time Attack Timer System
    // -------------------------------------------------------------
    function startTimeAttackTimer() {
        stopTimeAttackTimer();
        timeAttackRemaining = TIME_ATTACK_TOTAL;
        lastTickedSecond = 60;

        hudCenterBox.innerHTML = `<div class="time-attack-countdown" id="time-attack-clock">60.0s</div>`;
        const clockElem = document.getElementById('time-attack-clock');

        timeAttackTimerId = setInterval(() => {
            if (isMatchOver) return;

            timeAttackRemaining = Math.max(0, timeAttackRemaining - 0.1);
            if (clockElem) {
                clockElem.textContent = timeAttackRemaining.toFixed(1) + 's';
                if (timeAttackRemaining <= 10.0) {
                    clockElem.classList.add('urgent');
                    const wholeSec = Math.ceil(timeAttackRemaining);
                    if (wholeSec !== lastTickedSecond) {
                        window.sounds.playTick();
                        lastTickedSecond = wholeSec;
                    }
                } else {
                    clockElem.classList.remove('urgent');
                }
            }

            if (timeAttackRemaining <= 0) {
                stopTimeAttackTimer();
                triggerTimeAttackOver();
            }
        }, 100);
    }

    function stopTimeAttackTimer() {
        if (timeAttackTimerId) {
            clearInterval(timeAttackTimerId);
            timeAttackTimerId = null;
        }
        if (selectedGameType === 'pvp') {
            hudCenterBox.innerHTML = `<span id="hud-round-label" style="font-family: var(--font-heading); font-weight: 900; font-size: 1.1rem; color: var(--ac-wood-dark);">Ronda ${currentRoundNumber}</span>`;
        }
    }

    function triggerTimeAttackOver() {
        isMatchOver = true;
        window.sounds.playMatchWin();

        const activePlayers = players.slice(0, maxPlayers);
        activePlayers.sort((a, b) => b.score - a.score);
        const winner = activePlayers[0];

        const isNewRecord = winner.score > personalRecord;
        if (isNewRecord) {
            personalRecord = winner.score;
            localStorage.setItem(RECORD_KEY, personalRecord.toString());
            winTitle.textContent = `🏆 ¡NUEVO RÉCORD CONTRARRELOJ! 🏆`;
            winTitle.className = 'win-title p1-color';
            winDesc.textContent = `¡Fabuloso! ${winner.char.avatar} resolvió ${winner.score} puzles en 1 minuto.`;
        } else {
            winTitle.textContent = `⏱️ ¡TIEMPO CUMPLIDO! ⏱️`;
            winTitle.className = 'win-title p1-color';
            winDesc.textContent = `Ganador: ${winner.char.avatar} con ${winner.score} puzles resueltos. (Récord: ${personalRecord})`;
        }

        winModal.style.display = 'flex';

        if (isHost) {
            broadcast({
                type: 'TIME_ATTACK_OVER',
                winnerId: winner.id,
                record: personalRecord
            });
        }
    }

    // -------------------------------------------------------------
    // Level Loading (100% Procedural Generator for Both Normal & Time Attack!)
    // -------------------------------------------------------------
    function loadRoundLevel(levelIdx, syncSeed = null) {
        currentLevelIndex = levelIdx;
        levelStartTime = Date.now();

        // GUARANTEED PROCEDURAL LEVEL: 100% solvable, infinite unique layouts!
        const seed = syncSeed || (Date.now() + levelIdx * 1337 + currentRoundNumber * 97);
        const baseTemplate = generateProceduralLevel(seed);
        currentBaseTemplate = cloneLevelData(baseTemplate);

        // Initialize all active players with identical procedural puzzle boards
        players.slice(0, maxPlayers).forEach(p => {
            p.board = cloneLevelData(baseTemplate);
            p.x = p.board.playerSpawn.x;
            p.y = p.board.playerSpawn.y;
            p.px = p.x * getTileSize(p.board);
            p.py = p.y * getTileSize(p.board);
            cacheBoardBackground(p.board);
            clearPlayerDebuffs(p);
        });

        const roundLabel = document.getElementById('hud-round-label');
        if (roundLabel) {
            roundLabel.textContent = `Ronda ${currentRoundNumber}`;
        }

        const toastMsg = selectedGameType === 'time_attack' 
            ? `⏱️ Puzle ${currentRoundNumber} 🍃` 
            : `🍃 ¡Ronda ${currentRoundNumber} (Procedural)! 🍃`;
        showToast(toastMsg, 1600);
        window.sounds.playSpeed();
    }

    function cloneLevelData(template) {
        return {
            width: template.width,
            height: template.height,
            walls: JSON.parse(JSON.stringify(template.walls)),
            boxes: template.boxes.map(b => ({ x: b.x, y: b.y, px: b.x * 50, py: b.y * 50 })),
            targets: JSON.parse(JSON.stringify(template.targets)),
            powerup: template.powerup ? { ...template.powerup } : null,
            trashRocks: [],
            playerSpawn: { ...template.playerSpawn },
            bgCanvas: null
        };
    }

    function cacheBoardBackground(board) {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 460;
        bgCanvas.height = 460;
        const bctx = bgCanvas.getContext('2d');
        const tileSize = getTileSize(board);

        // 1. Warm Wooden Parquet Floor
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                bctx.fillStyle = (x + y) % 2 === 0 ? '#eddcc4' : '#e4d0b5';
                bctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                bctx.strokeStyle = '#d7c0a2';
                bctx.lineWidth = 1;
                bctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }

        // 2. Cedar Log Fence Walls
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                if (board.walls[y][x] === 1) {
                    const wx = x * tileSize;
                    const wy = y * tileSize;

                    bctx.fillStyle = '#6b4024';
                    bctx.beginPath();
                    bctx.roundRect(wx + 2, wy + 2, tileSize - 4, tileSize - 4, 10);
                    bctx.fill();

                    bctx.strokeStyle = '#4e2d17';
                    bctx.lineWidth = 2.5;
                    bctx.stroke();

                    bctx.strokeStyle = '#8d5733';
                    bctx.lineWidth = 1.5;
                    bctx.beginPath();
                    bctx.arc(wx + tileSize / 2, wy + tileSize / 2, tileSize * 0.24, 0, Math.PI * 2);
                    bctx.stroke();
                }
            }
        }

        board.bgCanvas = bgCanvas;
    }

    function resetCurrentPlayerBoard(p, isRemote = false) {
        if (!currentBaseTemplate) return;

        p.board = cloneLevelData(currentBaseTemplate);
        cacheBoardBackground(p.board);
        p.x = p.board.playerSpawn.x;
        p.y = p.board.playerSpawn.y;
        p.px = p.x * getTileSize(p.board);
        p.py = p.y * getTileSize(p.board);
        clearPlayerDebuffs(p);

        if (!isRemote) {
            window.sounds.playMove();
            showToast(`Tablero reiniciado ✨`, 1200);
            sendNetworkMessage({ type: 'BOARD_RESET', playerId: p.id });
        }
    }

    function clearPlayerDebuffs(p) {
        p.frozenUntil = 0;
        p.reversedUntil = 0;
        p.turboUntil = 0;
        p.inkUntil = 0;
        updateDebuffVisuals();
    }

    function getTileSize(board) {
        return Math.floor(460 / Math.max(board.width, board.height));
    }

    // -------------------------------------------------------------
    // Keyboard Controls (Desktop - Supports up to 3 Local Players)
    // -------------------------------------------------------------
    function handleKeyDown(e) {
        if (isMatchOver || isRoundTransitioning) return;

        // Player 1 Controls (WASD / Space / R)
        if (localPlayerId === 1 || matchSessionMode === 'local') {
            let dx = 0, dy = 0;
            if (e.key === 'w' || e.key === 'W') dy = -1;
            if (e.key === 's' || e.key === 'S') dy = 1;
            if (e.key === 'a' || e.key === 'A') dx = -1;
            if (e.key === 'd' || e.key === 'D') dx = 1;

            if (dx !== 0 || dy !== 0) executePlayerSwipe(players[0], dx, dy);
            if (e.key === ' ' || e.key === 'Spacebar') usePowerup(players[0], getTargetPlayerFor(players[0]));
            if (e.key === 'r' || e.key === 'R') resetCurrentPlayerBoard(players[0]);
        }

        // Player 2 Controls (Arrows / Enter / P)
        if (localPlayerId === 2) {
            let dx = 0, dy = 0;
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') dy = -1;
            if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') dy = 1;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') dx = -1;
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') dx = 1;

            if (dx !== 0 || dy !== 0) executePlayerSwipe(players[1], dx, dy);
            if (e.key === ' ' || e.key === 'Enter') usePowerup(players[1], getTargetPlayerFor(players[1]));
            if (e.key === 'r' || e.key === 'R') resetCurrentPlayerBoard(players[1]);
        } else if (matchSessionMode === 'local' && maxPlayers >= 2 && !players[1].isBot) {
            let dx = 0, dy = 0;
            if (e.key === 'ArrowUp') dy = -1;
            if (e.key === 'ArrowDown') dy = 1;
            if (e.key === 'ArrowLeft') dx = -1;
            if (e.key === 'ArrowRight') dx = 1;

            if (dx !== 0 || dy !== 0) executePlayerSwipe(players[1], dx, dy);
            if (e.key === 'Enter') usePowerup(players[1], getTargetPlayerFor(players[1]));
            if (e.key === 'p' || e.key === 'P') resetCurrentPlayerBoard(players[1]);
        }

        // Player 3 Controls (IJKL / U / O)
        if (localPlayerId === 3) {
            let dx = 0, dy = 0;
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') dy = -1;
            if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') dy = 1;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') dx = -1;
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') dx = 1;

            if (dx !== 0 || dy !== 0) executePlayerSwipe(players[2], dx, dy);
            if (e.key === ' ' || e.key === 'Enter') usePowerup(players[2], getTargetPlayerFor(players[2]));
            if (e.key === 'r' || e.key === 'R') resetCurrentPlayerBoard(players[2]);
        } else if (matchSessionMode === 'local' && maxPlayers === 3 && !players[2].isBot) {
            let dx = 0, dy = 0;
            if (e.key === 'i' || e.key === 'I') dy = -1;
            if (e.key === 'k' || e.key === 'K') dy = 1;
            if (e.key === 'j' || e.key === 'J') dx = -1;
            if (e.key === 'l' || e.key === 'L') dx = 1;

            if (dx !== 0 || dy !== 0) executePlayerSwipe(players[2], dx, dy);
            if (e.key === 'u' || e.key === 'U') usePowerup(players[2], getTargetPlayerFor(players[2]));
            if (e.key === 'o' || e.key === 'O') resetCurrentPlayerBoard(players[2]);
        }
    }

    // -------------------------------------------------------------
    // Player Movement & Box Pushing (Sokoban Logic)
    // -------------------------------------------------------------
    function movePlayer(player, dx, dy) {
        const board = player.board;
        if (!board) return;

        const targetX = player.x + dx;
        const targetY = player.y + dy;

        if (targetX < 0 || targetX >= board.width || targetY < 0 || targetY >= board.height) return;
        if (board.walls[targetY][targetX] === 1) return;

        const box = board.boxes.find(b => b.x === targetX && b.y === targetY);
        const rock = board.trashRocks.find(r => r.x === targetX && r.y === targetY);

        if (box) {
            const nextX = targetX + dx;
            const nextY = targetY + dy;

            if (nextX < 0 || nextX >= board.width || nextY < 0 || nextY >= board.height) return;
            if (board.walls[nextY][nextX] === 1) return;
            if (board.boxes.some(b => b.x === nextX && b.y === nextY)) return;
            if (board.trashRocks.some(r => r.x === nextX && r.y === nextY)) return;

            box.x = nextX;
            box.y = nextY;
            if (player.id === localPlayerId) window.sounds.playPush();

            const onTarget = board.targets.some(t => t.x === box.x && t.y === box.y);
            if (onTarget) {
                if (player.id === localPlayerId) window.sounds.playBoxLock();
                spawnBurstParticles(player, box.x, box.y, '#5ea848', 'leaf', 8);
            }
        } else if (rock) {
            const nextX = targetX + dx;
            const nextY = targetY + dy;
            if (nextX < 0 || nextX >= board.width || nextY < 0 || nextY >= board.height) return;
            if (board.walls[nextY][nextX] === 1 || board.boxes.some(b => b.x === nextX && b.y === nextY)) return;

            rock.x = nextX;
            rock.y = nextY;
            if (player.id === localPlayerId) window.sounds.playTrashRock();
        } else {
            if (player.id === localPlayerId) window.sounds.playMove();
        }

        player.x = targetX;
        player.y = targetY;
        player.angle = Math.atan2(dy, dx);

        // Power-Up Balloon Present Collection (Stackable up to 3)
        if (board.powerup && !board.powerup.collected && board.powerup.x === player.x && board.powerup.y === player.y) {
            board.powerup.collected = true;
            if (player.inventory.length < 3) {
                const randomPower = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                player.inventory.push(randomPower);
                if (player.id === localPlayerId) {
                    window.sounds.playPowerupGet();
                    showToast(`¡Regalito: ${randomPower.name}! (${player.inventory.length}/3) ${randomPower.icon}`, 1800);
                }
            } else if (player.id === localPlayerId) {
                showToast(`¡Bolsillo lleno (3/3)! Usa un objeto con Espacio/Tocar`, 1800);
            }
            updateInventoryHUD();
        }

        sendNetworkMessage({
            type: 'PLAYER_MOVE',
            playerId: player.id,
            x: player.x,
            y: player.y,
            boxes: board.boxes.map(b => ({ x: b.x, y: b.y })),
            trashRocks: board.trashRocks
        });

        checkRoundWin(player);
    }

    // -------------------------------------------------------------
    // Round Win & Round History Presentation
    // -------------------------------------------------------------
    function checkRoundWin(player) {
        const board = player.board;
        if (!board) return;

        const allTargetsCovered = board.targets.length > 0 &&
                                  board.targets.every(t => board.boxes.some(b => b.x === t.x && b.y === t.y));

        if (allTargetsCovered && !isMatchOver && !isRoundTransitioning) {
            isRoundTransitioning = true;

            if (matchSessionMode === 'online_client') {
                sendNetworkMessage({
                    type: 'CLAIM_ROUND_WIN',
                    winnerId: player.id
                });
                return;
            }

            player.score++;
            updateScoreboard();
            window.sounds.playLevelWin();

            spawnBurstParticles(player, player.x, player.y, player.char.color, 'heart', 25);

            // Record round winner in history
            roundHistory.push({
                round: currentRoundNumber,
                winnerId: player.id,
                winnerChar: player.char
            });
            renderRoundHistory();

            // Time Attack Mode logic
            if (selectedGameType === 'time_attack') {
                const solveDuration = Date.now() - levelStartTime;
                if (solveDuration < 6000) {
                    timeAttackRemaining = Math.min(TIME_ATTACK_TOTAL, timeAttackRemaining + 2.5);
                    showToast(`⚡ ¡COMBO VELOZ! +2.5s ⏱️`, 1800);
                    window.sounds.playSpeed();
                } else {
                    showToast(`¡Puzle superado por ${player.char.avatar}!`, 1400);
                }

                currentRoundNumber++;
                setTimeout(() => {
                    isRoundTransitioning = false;
                    loadRoundLevel(currentLevelIndex + 1);
                }, 400);

            } else {
                // PvP Mode: Show Round Win Celebration Modal
                const nextSeed = Math.floor(Math.random() * 1000000000);
                nextSynchronizedSeed = nextSeed;

                showRoundWinCelebration(player);

                if (isHost) {
                    broadcast({
                        type: 'ROUND_WIN',
                        winnerId: player.id,
                        scores: players.map(p => p.score),
                        roundNumber: currentRoundNumber,
                        nextSeed: nextSeed
                    });
                }

                // Check if match won
                if (player.score >= targetScore) {
                    roundTransitionTimeout = setTimeout(() => {
                        triggerMatchWin(player);
                    }, 2400);
                } else {
                    roundTransitionTimeout = setTimeout(() => {
                        skipRoundWinCelebration();
                    }, 2400);
                }
            }
        }
    }

    function showRoundWinCelebration(winner) {
        roundWinTitle.textContent = `¡RONDA ${currentRoundNumber} COMPLETADA!`;
        roundWinAvatar.textContent = winner.char.avatar;
        roundWinName.textContent = `¡Ronda ganada por ${winner.name} (${winner.char.avatar})! 🌻`;

        // Render scores of all active players
        const activePlayers = players.slice(0, maxPlayers);
        roundWinScoreboard.innerHTML = activePlayers
            .map(p => `<span>${p.name} ${p.char.avatar}: <strong>${p.score}</strong></span>`)
            .join(' • ');

        roundWinModal.style.display = 'flex';
    }

    function renderRoundHistory() {
        if (!roundHistoryChips) return;
        if (roundHistory.length === 0) {
            roundHistoryChips.innerHTML = `<span class="round-chip">Ronda 1 en curso... 🍃</span>`;
            return;
        }

        roundHistoryChips.innerHTML = roundHistory.map(r => `
            <span class="round-chip win-chip">
                R${r.round}: ${r.winnerChar.avatar}
            </span>
        `).join('');
    }

    function triggerMatchWin(winner) {
        isMatchOver = true;
        roundWinModal.style.display = 'none';
        window.sounds.playMatchWin();

        const activePlayers = players.slice(0, maxPlayers);
        activePlayers.sort((a, b) => b.score - a.score);

        winTitle.textContent = `🎉 ¡EL GANADOR ES ${winner.name.toUpperCase()} (${winner.char.avatar})! 🎉`;
        winTitle.className = 'win-title p1-color';

        const podiumText = activePlayers.map((p, idx) => {
            const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉');
            return `${medal} ${p.name} (${p.char.avatar}): ${p.score} rondas`;
        }).join('<br>');

        winDesc.innerHTML = `<strong>¡Podio Campestre!</strong><br>${podiumText}`;
        winModal.style.display = 'flex';

        if (isHost) {
            broadcast({
                type: 'MATCH_WIN',
                winnerId: winner.id,
                scores: players.map(p => p.score)
            });
        }
    }

    // -------------------------------------------------------------
    // Stackable Power-Up System (Inventory of Up to 3 Items)
    // -------------------------------------------------------------
    function usePowerup(user, target) {
        if (!user.inventory || user.inventory.length === 0) {
            if (user.id === localPlayerId) showToast("No tienes objetos en la mochila 🎒", 1200);
            return;
        }

        const power = user.inventory.shift();
        updateInventoryHUD();

        const now = Date.now();

        // Self Power-Ups
        if (power.id === 'TURBO') {
            user.turboUntil = now + 5000;
            if (user.id === localPlayerId) {
                window.sounds.playSpeed();
                showToast(`🍯 ¡Miel dulce para paso ligero! (5s)`, 1800);
            }
            spawnBurstParticles(user, user.x, user.y, '#e59d35', 'leaf', 12);
        } else if (power.id === 'SHIELD') {
            user.shieldActive = true;
            user.shieldUntil = now + 12000;
            if (user.id === localPlayerId) {
                window.sounds.playShield();
                showToast(`🛡️ ¡Escudo Floral activado!`, 2000);
            }
            spawnBurstParticles(user, user.x, user.y, '#5ea848', 'leaf', 14);
        } else {
            // Offensive Power-Ups against chosen Target
            if (target.shieldActive) {
                target.shieldActive = false;
                window.sounds.playShield();
                showToast(`🛡️ ¡El Escudo Floral de ${target.char.avatar} bloqueó ${power.name}!`, 2500);
                spawnBurstParticles(target, target.x, target.y, '#5ea848', 'leaf', 18);

                sendNetworkMessage({
                    type: 'POWERUP_SHIELD_DEFLECT',
                    targetId: target.id,
                    powerId: power.id
                });
                return;
            }

            if (power.id === 'FREEZE') {
                target.frozenUntil = now + 2500;
                window.sounds.playFreeze();
                showToast(`💤 ¡Hora de la siesta para ${target.char.avatar}! (2.5s)`, 2200);
            } else if (power.id === 'REVERSE') {
                target.reversedUntil = now + 4000;
                window.sounds.playReverse();
                showToast(`🦋 ¡Mariposas despistaron a ${target.char.avatar}! (4s)`, 2200);
            } else if (power.id === 'ROCK') {
                spawnTrashRockOnTarget(target);
                window.sounds.playTrashRock();
                showToast(`🪴 ¡Macetita plantada para ${target.char.avatar}!`, 1800);
            } else if (power.id === 'INK') {
                target.inkUntil = now + 3500;
                window.sounds.playInk();
                showToast(`☕ ¡Té tibio derramado en la pantalla de ${target.char.avatar}!`, 2200);
            } else if (power.id === 'WIND') {
                executeWindGust(target);
                window.sounds.playWind();
                showToast(`🌪️ ¡Ráfaga de viento descolocó una caja de ${target.char.avatar}!`, 2000);
            }
        }

        updateDebuffVisuals();

        sendNetworkMessage({
            type: 'POWERUP_USED',
            userId: user.id,
            targetId: target.id,
            powerId: power.id
        });
    }

    function executeWindGust(target) {
        const board = target.board;
        if (!board) return;
        const unplacedBoxes = board.boxes.filter(b => !board.targets.some(t => t.x === b.x && t.y === b.y));
        const boxToNudge = unplacedBoxes[0] || board.boxes[0];

        if (boxToNudge) {
            const dirs = [{ dx: 0, dy: 1 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: -1, dy: 0 }];
            const valid = dirs.filter(d => {
                const nx = boxToNudge.x + d.dx;
                const ny = boxToNudge.y + d.dy;
                if (nx <= 0 || nx >= board.width - 1 || ny <= 0 || ny >= board.height - 1) return false;
                if (board.walls[ny][nx] === 1) return false;
                if (board.boxes.some(b => b.x === nx && b.y === ny)) return false;
                return true;
            });

            if (valid.length > 0) {
                const d = valid[Math.floor(Math.random() * valid.length)];
                boxToNudge.x += d.dx;
                boxToNudge.y += d.dy;
                spawnBurstParticles(target, boxToNudge.x, boxToNudge.y, '#5fb1d4', 'leaf', 12);
            }
        }
    }

    function spawnTrashRockOnTarget(target) {
        const board = target.board;
        if (!board) return;
        const candidates = [];

        for (let y = 1; y < board.height - 1; y++) {
            for (let x = 1; x < board.width - 1; x++) {
                if (board.walls[y][x] === 0 &&
                    !board.boxes.some(b => b.x === x && b.y === y) &&
                    !board.targets.some(t => t.x === x && t.y === y) &&
                    !board.trashRocks.some(r => r.x === x && r.y === y) &&
                    (x !== target.x || y !== target.y)) {

                    const nearBox = board.boxes.some(b => Math.abs(b.x - x) + Math.abs(b.y - y) <= 1);
                    const nearTarget = board.targets.some(t => Math.abs(t.x - x) + Math.abs(t.y - y) <= 1);

                    if (!nearBox && !nearTarget) {
                        candidates.push({ x, y });
                    }
                }
            }
        }

        if (candidates.length > 0) {
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            board.trashRocks.push({ x: chosen.x, y: chosen.y, px: chosen.x * 50, py: chosen.y * 50 });
            spawnBurstParticles(target, chosen.x, chosen.y, '#915a36', 'leaf', 10);
        }
    }

    // -------------------------------------------------------------
    // HUD & Inventory Updates
    // -------------------------------------------------------------
    function updateInventoryHUD() {
        const slotGroups = [slotsP1, slotsP2, slotsP3];

        players.slice(0, maxPlayers).forEach((p, pIdx) => {
            const slots = slotGroups[pIdx];
            if (!slots) return;

            slots.forEach((slot, idx) => {
                if (p.inventory && p.inventory[idx]) {
                    slot.innerHTML = `<span>${p.inventory[idx].icon}</span>`;
                    slot.classList.remove('empty');
                    if (idx === 0) slot.classList.add('active-slot');
                    else slot.classList.remove('active-slot');
                } else {
                    slot.innerHTML = `<span>-</span>`;
                    slot.classList.add('empty');
                    slot.classList.remove('active-slot');
                }
            });
        });

        // Mobile Quick Action Button for Local Player
        const local = getLocalPlayer();
        const count = local.inventory ? local.inventory.length : 0;
        if (count > 0) {
            const firstPower = local.inventory[0];
            btnTouchPowerIcon.textContent = firstPower.icon;
            btnTouchPowerLabel.textContent = `USAR (${count})`;
            btnTouchPower.style.borderColor = 'var(--ac-honey)';
            btnTouchPower.style.boxShadow = '0 4px 14px rgba(229, 157, 53, 0.45)';
        } else {
            btnTouchPowerIcon.textContent = '🍃';
            btnTouchPowerLabel.textContent = 'VACÍO (0)';
            btnTouchPower.style.borderColor = 'var(--ac-border)';
            btnTouchPower.style.boxShadow = 'none';
        }
    }

    function updateDebuffVisuals() {
        const now = Date.now();
        const local = getLocalPlayer();

        // Main player debuff overlays
        freezeOverlayMain.style.display = now < local.frozenUntil ? 'flex' : 'none';
        inkOverlayMain.style.display = now < local.inkUntil ? 'block' : 'none';
        debuffBannerMain.style.display = now < local.reversedUntil ? 'block' : 'none';

        // Rivals mini status badges
        const rivals = getRivalsForLocalPlayer();
        if (miniStatus1) {
            if (rivals[0]) {
                if (now < rivals[0].frozenUntil) {
                    miniStatus1.textContent = '💤';
                    miniStatus1.style.display = 'block';
                } else if (now < rivals[0].inkUntil) {
                    miniStatus1.textContent = '☕';
                    miniStatus1.style.display = 'block';
                } else if (rivals[0].shieldActive) {
                    miniStatus1.textContent = '🛡️';
                    miniStatus1.style.display = 'block';
                } else {
                    miniStatus1.style.display = 'none';
                }
            } else {
                miniStatus1.style.display = 'none';
            }
        }

        if (miniStatus2 && maxPlayers === 3) {
            if (rivals[1]) {
                if (now < rivals[1].frozenUntil) {
                    miniStatus2.textContent = '💤';
                    miniStatus2.style.display = 'block';
                } else if (now < rivals[1].inkUntil) {
                    miniStatus2.textContent = '☕';
                    miniStatus2.style.display = 'block';
                } else if (rivals[1].shieldActive) {
                    miniStatus2.textContent = '🛡️';
                    miniStatus2.style.display = 'block';
                } else {
                    miniStatus2.style.display = 'none';
                }
            } else {
                miniStatus2.style.display = 'none';
            }
        }
    }

    function updateScoreboard() {
        if (scoreP1Elem) scoreP1Elem.textContent = `⭐ ${players[0].score}`;
        if (scoreP2Elem) scoreP2Elem.textContent = `⭐ ${players[1].score}`;
        if (scoreP3Elem) scoreP3Elem.textContent = `⭐ ${players[2].score}`;

        const rivals = getRivalsForLocalPlayer();
        if (rivals[0] && rivalMiniScore1) rivalMiniScore1.textContent = `⭐ ${rivals[0].score}`;
        if (rivals[1] && rivalMiniScore2) rivalMiniScore2.textContent = `⭐ ${rivals[1].score}`;
    }

    // -------------------------------------------------------------
    // Cute Local Bot AI (For immediate 3-player practice)
    // -------------------------------------------------------------
    function updateBotPlayers() {
        if (matchSessionMode !== 'local' || isMatchOver || isRoundTransitioning) return;
        const now = Date.now();

        players.slice(0, maxPlayers).forEach(p => {
            if (!p.isBot || !p.board) return;
            if (now < p.frozenUntil) return;
            if (now - p.lastBotActionTime < 550) return; // Action interval
            p.lastBotActionTime = now;

            const unplacedBox = p.board.boxes.find(b => !p.board.targets.some(t => t.x === b.x && t.y === b.y));
            if (!unplacedBox) return;

            const dx = Math.sign(unplacedBox.x - p.x);
            const dy = Math.sign(unplacedBox.y - p.y);

            let moveX = 0, moveY = 0;
            if (dx !== 0 && Math.random() > 0.4) moveX = dx;
            else if (dy !== 0) moveY = dy;
            else moveX = Math.random() > 0.5 ? 1 : -1;

            executePlayerSwipe(p, moveX, moveY);
        });
    }

    // -------------------------------------------------------------
    // Particles System
    // -------------------------------------------------------------
    function spawnBurstParticles(player, gridX, gridY, color, shape = 'leaf', count = 10) {
        if (particles.length > 30) return;
        const board = player.board;
        if (!board) return;

        const tileSize = getTileSize(board);
        const originX = gridX * tileSize + tileSize / 2;
        const originY = gridY * tileSize + tileSize / 2;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2;
            particles.push({
                playerId: player.id,
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                shape: shape,
                size: 4 + Math.random() * 3,
                life: 1.0,
                decay: 0.04 + Math.random() * 0.03
            });
        }
    }

    // -------------------------------------------------------------
    // Game Loop & Canvas Rendering (Main + Live Rivals Mini-Canvases)
    // -------------------------------------------------------------
    function gameLoop() {
        updateDebuffVisuals();
        updateBotPlayers();

        // 1. Render Main Board for Local Player
        const local = getLocalPlayer();
        if (local.board) {
            renderArena(mainCtx, local);
        }

        // 2. Render Rivals in Top Mini-Canvases
        const rivals = getRivalsForLocalPlayer();
        if (rivals[0] && rivals[0].board && ctxMini1) {
            renderArenaScaled(ctxMini1, rivals[0], 160, 160);
        }
        if (rivals[1] && rivals[1].board && ctxMini2 && maxPlayers === 3) {
            renderArenaScaled(ctxMini2, rivals[1], 160, 160);
        }

        // Update particle physics
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) particles.splice(i, 1);
        }

        requestAnimationFrame(gameLoop);
    }

    function renderArenaScaled(ctx, player, width, height) {
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        const scale = width / 460;
        ctx.scale(scale, scale);
        renderArena(ctx, player);
        ctx.restore();
    }

    function renderArena(ctx, player) {
        const board = player.board;
        if (!board) return;
        const tileSize = getTileSize(board);

        // Pre-cached Background
        if (board.bgCanvas) {
            ctx.drawImage(board.bgCanvas, 0, 0);
        }

        const lerpSpeed = Date.now() < player.turboUntil ? 0.6 : 0.35;
        player.px += (player.x * tileSize - player.px) * lerpSpeed;
        player.py += (player.y * tileSize - player.py) * lerpSpeed;

        board.boxes.forEach(b => {
            b.px += (b.x * tileSize - b.px) * lerpSpeed;
            b.py += (b.y * tileSize - b.py) * lerpSpeed;
        });

        board.trashRocks.forEach(r => {
            r.px += (r.x * tileSize - r.px) * lerpSpeed;
            r.py += (r.y * tileSize - r.py) * lerpSpeed;
        });

        // Targets
        board.targets.forEach(t => {
            const cx = t.x * tileSize + tileSize / 2;
            const cy = t.y * tileSize + tileSize / 2;
            const r = tileSize * 0.36;

            ctx.fillStyle = '#b7db93';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#5ea848';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#438230';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 6, 3, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Balloon Present
        if (board.powerup && !board.powerup.collected) {
            const px = board.powerup.x * tileSize + tileSize / 2;
            const py = board.powerup.y * tileSize + tileSize / 2;
            const bob = Math.sin(Date.now() / 200) * 3;

            ctx.fillStyle = '#dc5844';
            ctx.beginPath();
            ctx.arc(px, py - 6 + bob, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, py + 4 + bob);
            ctx.lineTo(px, py + 9 + bob);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 5, py + 9 + bob, 10, 10);
            ctx.strokeStyle = '#dc5844';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px - 5, py + 9 + bob, 10, 10);
        }

        // Crates
        board.boxes.forEach(b => {
            const bx = b.px;
            const by = b.py;
            const isLocked = board.targets.some(t => t.x === b.x && t.y === b.y);

            ctx.fillStyle = isLocked ? '#95d5b2' : '#c99b66';
            ctx.beginPath();
            ctx.roundRect(bx + 4, by + 4, tileSize - 8, tileSize - 8, 8);
            ctx.fill();

            ctx.strokeStyle = isLocked ? '#40916c' : '#8c5828';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            if (isLocked) {
                ctx.fillStyle = '#2d6a4f';
                ctx.beginPath();
                ctx.arc(bx + tileSize / 2, by + tileSize / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = '#9e6e3c';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(bx + 6, by + 6);
                ctx.lineTo(bx + tileSize - 6, by + tileSize - 6);
                ctx.stroke();

                ctx.fillStyle = '#5ea848';
                ctx.beginPath();
                ctx.ellipse(bx + tileSize / 2, by + tileSize / 2, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Flower Pots
        board.trashRocks.forEach(r => {
            const rx = r.px;
            const ry = r.py;
            const cx = rx + tileSize / 2;
            const cy = ry + tileSize / 2;

            ctx.fillStyle = '#b8623d';
            ctx.beginPath();
            ctx.roundRect(cx - 12, cy - 6, 24, 18, 4);
            ctx.fill();

            ctx.strokeStyle = '#7c381c';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#5ea848';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 9, 4, 0, Math.PI * 2);
            ctx.arc(cx + 3, cy - 9, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Player Avatar & Shield Aura
        renderPlayerAvatar(ctx, player, tileSize);

        // Particles
        particles.forEach(p => {
            if (p.playerId === player.id) {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    function renderPlayerAvatar(ctx, player, tileSize) {
        const cx = player.px + tileSize / 2;
        const cy = player.py + tileSize / 2;
        const char = player.char || CHARACTERS.mochi;

        if (player.shieldActive) {
            ctx.save();
            const pulse = Math.sin(Date.now() / 150) * 2;
            ctx.strokeStyle = '#5ea848';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, tileSize * 0.44 + pulse, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(94, 168, 72, 0.2)';
            ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = char.color;
        ctx.beginPath();
        ctx.arc(cx, cy, tileSize * 0.35, 0, Math.PI * 2);
        ctx.fill();

        if (char.earType === 'cat') {
            ctx.fillStyle = char.earColor;
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy - 10);
            ctx.lineTo(cx - 16, cy - 22);
            ctx.lineTo(cx - 4, cy - 14);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx + 12, cy - 10);
            ctx.lineTo(cx + 16, cy - 22);
            ctx.lineTo(cx + 4, cy - 14);
            ctx.fill();
        } else if (char.earType === 'dog') {
            ctx.fillStyle = char.earColor;
            ctx.beginPath();
            ctx.arc(cx - 13, cy - 3, 6, 0, Math.PI * 2);
            ctx.arc(cx + 13, cy - 3, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (char.earType === 'bunny') {
            ctx.fillStyle = char.earColor;
            ctx.beginPath();
            ctx.ellipse(cx - 7, cy - 20, 4, 11, -0.1, 0, Math.PI * 2);
            ctx.ellipse(cx + 7, cy - 20, 4, 11, 0.1, 0, Math.PI * 2);
            ctx.fill();
        } else if (char.earType === 'bear') {
            ctx.fillStyle = char.earColor;
            ctx.beginPath();
            ctx.arc(cx - 12, cy - 14, 6, 0, Math.PI * 2);
            ctx.arc(cx + 12, cy - 14, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#fbb6ce';
        ctx.beginPath();
        ctx.arc(cx - 8, cy + 3, 3, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy + 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2c2825';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 2, 2, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + Math.cos(player.angle) * 7, cy + Math.sin(player.angle) * 7 + 1, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // -------------------------------------------------------------
    // Multiplayer WebRTC (PeerJS - Up to 3 Players)
    // -------------------------------------------------------------
    const PEER_CONFIG = {
        debug: 1,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject@gmail.com',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject@gmail.com',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject@gmail.com',
                    credential: 'openrelayproject'
                }
            ],
            iceCandidatePoolSize: 10
        }
    };

    function generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    function startOnlineHost() {
        const roomCode = generateRoomCode();
        const peerId = `sdash-${roomCode}`;

        displayRoomCode.textContent = roomCode;
        if (waitingTitle) waitingTitle.textContent = "SALA CREADA: ESPERANDO JUGADORES...";
        if (waitingSubtitle) waitingSubtitle.textContent = "Pásale este código o link a tus amigos:";
        if (btnCopyLink) btnCopyLink.style.display = 'inline-block';
        if (btnStartOnlineNow) btnStartOnlineNow.style.display = 'block';
        players[0].name = localPlayerName;
        if (waitName1) waitName1.textContent = `J1 (${localPlayerName} - ${players[0].char.avatar})`;
        if (waitRow1) waitRow1.className = 'waiting-player-row ready';
        if (waitRow2) {
            waitRow2.className = 'waiting-player-row waiting';
            waitName2.textContent = 'J2 (Esperando...)';
        }
        if (waitRow3) {
            waitRow3.style.display = maxPlayers === 3 ? 'flex' : 'none';
            waitRow3.className = 'waiting-player-row waiting';
            waitName3.textContent = 'J3 (Esperando...)';
        }
        waitingBox.style.display = 'block';
        showToast("Conectando con el servidor PeerJS...", 2000);

        if (peer) {
            try { peer.destroy(); } catch(e) {}
            peer = null;
        }

        peer = new Peer(peerId, PEER_CONFIG);
        netConnections = [];

        peer.on('open', () => {
            isHost = true;
            localPlayerId = 1;
            showToast(`¡Sala ${roomCode} lista! Invita hasta ${maxPlayers - 1} amigos.`, 4000);
        });

        peer.on('connection', conn => {
            if (netConnections.length >= maxPlayers - 1) {
                conn.send({ type: 'ROOM_FULL' });
                conn.close();
                return;
            }

            netConnections.push(conn);
            const assignedPlayerId = netConnections.length + 1;

            const setupHostConnection = () => {
                showToast(`¡Amigo conectado como Jugador ${assignedPlayerId}!`, 2500);

                if (assignedPlayerId === 2) {
                    waitRow2.className = 'waiting-player-row ready';
                    waitName2.textContent = `J2 (${players[1].name} - ${players[1].char.avatar} Conectado)`;
                } else if (assignedPlayerId === 3) {
                    waitRow3.className = 'waiting-player-row ready';
                    waitName3.textContent = `J3 (${players[2].name} - ${players[2].char.avatar} Conectado)`;
                }

                const sendInit = () => {
                    try {
                        if (conn.open) {
                            conn.send({
                                type: 'INIT_ROOM_JOIN',
                                assignedPlayerId,
                                maxPlayers,
                                gameType: selectedGameType,
                                targetScore,
                                hostCharId: selectedCharId,
                                hostName: localPlayerName,
                                roomCode: roomCode
                            });
                        }
                    } catch(e) {
                        console.error("Error sending init:", e);
                    }
                };
                sendInit();
                setTimeout(sendInit, 250);

                if (netConnections.length === maxPlayers - 1) {
                    setTimeout(() => {
                        const initialSeed = Math.floor(Math.random() * 1000000000);
                        broadcast({
                            type: 'HOST_START_NOW',
                            seed: initialSeed,
                            gameType: selectedGameType,
                            targetScore
                        });
                        startBattle('online_host', initialSeed);
                    }, 1200);
                }
            };

            if (conn.open) {
                setupHostConnection();
            } else {
                conn.on('open', setupHostConnection);
            }

            conn.on('data', data => {
                netConnections.forEach(c => {
                    if (c !== conn && c.open) c.send(data);
                });
                handleNetworkMessage(data);
            });

            conn.on('close', () => {
                netConnections = netConnections.filter(c => c !== conn);
                showToast(`Un jugador se ha desconectado.`, 3000);
                if (assignedPlayerId === 2 && waitName2) {
                    waitRow2.className = 'waiting-player-row waiting';
                    waitName2.textContent = 'J2 (Desconectado)';
                } else if (assignedPlayerId === 3 && waitName3) {
                    waitRow3.className = 'waiting-player-row waiting';
                    waitName3.textContent = 'J3 (Desconectado)';
                }
            });

            conn.on('error', err => {
                console.error("Host conn error:", err);
            });
        });

        peer.on('error', err => {
            console.error("Peer error:", err);
            if (err.type === 'unavailable-id') {
                showToast("Código en uso, reintentando...", 2000);
                setTimeout(startOnlineHost, 400);
            } else {
                showToast("Error de conexión PeerJS: " + (err.message || err.type || err), 4000);
            }
        });
    }

    function startOnlineClient() {
        const rawCode = inputRoomCode.value.trim().toUpperCase();
        const roomCode = rawCode.replace(/[^A-Z0-9]/g, '');
        if (!roomCode || roomCode.length < 4) {
            alert("Por favor ingresa un código de sala válido (ej: K7L9X).");
            return;
        }

        const hostPeerId = `sdash-${roomCode}`;
        const clientPeerId = `sdash-c-${roomCode}-${Math.floor(1000 + Math.random() * 9000)}`;

        showToast(`Buscando la sala ${roomCode}...`, 5000);

        // Immediate Visual Feedback in Lobby
        displayRoomCode.textContent = roomCode;
        if (waitingTitle) waitingTitle.textContent = `BUSCANDO SALA ${roomCode}...`;
        if (waitingSubtitle) waitingSubtitle.textContent = "Estableciendo conexión P2P con el anfitrión...";
        if (btnCopyLink) btnCopyLink.style.display = 'none';
        if (btnStartOnlineNow) btnStartOnlineNow.style.display = 'none';
        if (waitName1) waitName1.textContent = 'J1 (Anfitrión - Conectando...)';
        if (waitRow1) waitRow1.className = 'waiting-player-row waiting';
        if (waitName2) waitName2.textContent = `J2 (${localPlayerName} - ${CHARACTERS[selectedCharId].avatar})`;
        if (waitRow2) waitRow2.className = 'waiting-player-row ready';
        if (waitRow3) waitRow3.style.display = 'none';
        waitingBox.style.display = 'block';

        if (peer) {
            try { peer.destroy(); } catch(e) {}
            peer = null;
        }

        // Provide explicit client ID so PeerJS skips _retrieveId HTTP GET round-trip!
        peer = new Peer(clientPeerId, PEER_CONFIG);

        let connectionEstablished = false;
        const connectTimeout = setTimeout(() => {
            if (!connectionEstablished) {
                showToast(`⏳ No se pudo conectar con la sala ${roomCode}. Verifica que el anfitrión siga en la sala y el código sea correcto.`, 6000);
                if (waitingSubtitle) waitingSubtitle.textContent = `⚠️ No hubo respuesta de la sala ${roomCode}. Revisa el código.`;
            }
        }, 12000);

        peer.on('open', () => {
            isHost = false;
            clientConn = peer.connect(hostPeerId, { reliable: true });

            const setupClientConn = () => {
                connectionEstablished = true;
                clearTimeout(connectTimeout);
                showToast("¡Conectado con éxito a la sala!", 2500);

                if (waitingTitle) waitingTitle.textContent = "¡CONECTADO A LA SALA ONLINE!";
                if (waitingSubtitle) waitingSubtitle.textContent = "Esperando a que el anfitrión inicie la partida... 🍃";
                if (waitRow1) waitRow1.className = 'waiting-player-row ready';

                const sendChar = () => {
                    try {
                        if (clientConn.open) {
                            clientConn.send({
                                type: 'CHAR_SELECT',
                                playerId: localPlayerId || 2,
                                charId: selectedCharId,
                                name: localPlayerName
                            });
                        }
                    } catch(e) {}
                };
                sendChar();
                setTimeout(sendChar, 250);
            };

            if (clientConn.open) {
                setupClientConn();
            } else {
                clientConn.on('open', setupClientConn);
            }

            clientConn.on('data', data => {
                connectionEstablished = true;
                clearTimeout(connectTimeout);
                handleNetworkMessage(data);
            });

            clientConn.on('error', err => {
                console.error("Client conn error:", err);
                connectionEstablished = true;
                clearTimeout(connectTimeout);
                showToast("Error de conexión con el anfitrión: " + (err.message || err.type || err), 4000);
            });

            clientConn.on('close', () => {
                showToast("Se perdió la conexión con el anfitrión.", 4000);
                returnToLobby();
            });
        });

        peer.on('error', err => {
            console.error("Peer error:", err);
            clearTimeout(connectTimeout);
            if (err.type === 'peer-unavailable') {
                showToast(`No se encontró la sala ${roomCode}. Verifica que el código esté bien escrito y la sala siga abierta.`, 5000);
                if (waitingSubtitle) waitingSubtitle.textContent = `❌ La sala ${roomCode} no existe o ya se cerró.`;
            } else if (err.type === 'network' || err.type === 'server-error') {
                showToast("Error de red con el servidor PeerJS. Revisa tu conexión a internet.", 4000);
            } else {
                showToast("Error PeerJS: " + (err.message || err.type || err), 4000);
            }
        });
    }

    function broadcast(data) {
        netConnections.forEach(c => {
            if (c.open) c.send(data);
        });
    }

    function sendNetworkMessage(data) {
        if (isHost) {
            broadcast(data);
        } else if (clientConn && clientConn.open) {
            clientConn.send(data);
        }
    }

    function handleNetworkMessage(data) {
        if (data.type === 'INIT_ROOM_JOIN') {
            localPlayerId = data.assignedPlayerId;
            maxPlayers = data.maxPlayers;
            selectedGameType = data.gameType;
            if (data.targetScore) targetScore = data.targetScore;
            if (data.hostName && players[0]) players[0].name = data.hostName;
            if (data.hostCharId && players[0]) {
                players[0].char = CHARACTERS[data.hostCharId] || players[0].char;
            }
            if (players[localPlayerId - 1]) {
                players[localPlayerId - 1].name = localPlayerName;
                players[localPlayerId - 1].char = CHARACTERS[selectedCharId] || players[localPlayerId - 1].char;
            }

            if (waitingTitle) waitingTitle.textContent = "¡CONECTADO A LA SALA ONLINE!";
            if (waitingSubtitle) waitingSubtitle.textContent = "Esperando a que el anfitrión inicie la partida... 🍃";
            if (waitName1) waitName1.textContent = `J1 (${players[0].name} - ${players[0].char.avatar})`;
            if (waitRow1) waitRow1.className = 'waiting-player-row ready';
            if (waitName2) waitName2.textContent = `J2 (${players[1].name} - ${players[1].char.avatar})`;
            if (waitRow2) waitRow2.className = 'waiting-player-row ready';
            if (maxPlayers === 3) {
                if (waitRow3) {
                    waitRow3.style.display = 'flex';
                    waitName3.textContent = `J3 (${players[2].name} - ${players[2].char.avatar})`;
                    if (localPlayerId === 3) waitRow3.className = 'waiting-player-row ready';
                }
            } else if (waitRow3) {
                waitRow3.style.display = 'none';
            }
            showToast(`¡Unido como Jugador ${localPlayerId}!`, 2500);

            sendNetworkMessage({
                type: 'CHAR_SELECT',
                playerId: localPlayerId,
                charId: selectedCharId,
                name: localPlayerName
            });
        } else if (data.type === 'CHAR_SELECT') {
            const char = CHARACTERS[data.charId];
            const pIdx = (data.playerId || 2) - 1;
            if (players[pIdx]) {
                if (char) players[pIdx].char = char;
                if (data.name) players[pIdx].name = data.name;
                if (pIdx === 1 && waitName2) waitName2.textContent = `J2 (${players[1].name} - ${players[1].char.avatar} Conectado)`;
                if (pIdx === 2 && waitName3) waitName3.textContent = `J3 (${players[2].name} - ${players[2].char.avatar} Conectado)`;
                updateHUDNames();
            }
        } else if (data.type === 'PLAYER_NAME_UPDATE') {
            const p = players[data.playerId - 1];
            if (p && data.name) {
                p.name = data.name;
                if (data.playerId === 1 && waitName1) waitName1.textContent = `J1 (${p.name} - ${p.char.avatar})`;
                if (data.playerId === 2 && waitName2) waitName2.textContent = `J2 (${p.name} - ${p.char.avatar} Conectado)`;
                if (data.playerId === 3 && waitName3) waitName3.textContent = `J3 (${p.name} - ${p.char.avatar} Conectado)`;
                updateHUDNames();
            }
        } else if (data.type === 'HOST_START_NOW') {
            if (data.gameType) selectedGameType = data.gameType;
            if (data.targetScore) targetScore = data.targetScore;
            startBattle('online_client', data.seed);
        } else if (data.type === 'CLAIM_ROUND_WIN') {
            if (isHost && !isRoundTransitioning && !isMatchOver) {
                const winner = players[data.winnerId - 1];
                if (winner) {
                    isRoundTransitioning = true;
                    winner.score++;
                    updateScoreboard();
                    window.sounds.playLevelWin();

                    const nextSeed = Math.floor(Math.random() * 1000000000);
                    nextSynchronizedSeed = nextSeed;

                    roundHistory.push({
                        round: currentRoundNumber,
                        winnerId: winner.id,
                        winnerChar: winner.char
                    });
                    renderRoundHistory();
                    showRoundWinCelebration(winner);

                    broadcast({
                        type: 'ROUND_WIN',
                        winnerId: winner.id,
                        scores: players.map(p => p.score),
                        roundNumber: currentRoundNumber,
                        nextSeed: nextSeed
                    });

                    if (winner.score >= targetScore) {
                        roundTransitionTimeout = setTimeout(() => {
                            triggerMatchWin(winner);
                        }, 2400);
                    } else {
                        roundTransitionTimeout = setTimeout(() => {
                            skipRoundWinCelebration();
                        }, 2400);
                    }
                }
            }
        } else if (data.type === 'REQUEST_SKIP_MODAL') {
            if (isHost && isRoundTransitioning) {
                skipRoundWinCelebration();
            }
        } else if (data.type === 'SKIP_ROUND_MODAL') {
            if (roundTransitionTimeout) {
                clearTimeout(roundTransitionTimeout);
                roundTransitionTimeout = null;
            }
            roundWinModal.style.display = 'none';
            isRoundTransitioning = false;
            currentRoundNumber = data.roundNumber || (currentRoundNumber + 1);
            loadRoundLevel(currentLevelIndex + 1, data.nextSeed);
        } else if (data.type === 'REQUEST_REMATCH') {
            if (isHost) {
                const nextSeed = Math.floor(Math.random() * 1000000000);
                broadcast({ type: 'MATCH_RESTART', targetScore, seed: nextSeed });
                resetMatch(nextSeed);
            }
        } else if (data.type === 'PLAYER_MOVE') {
            const p = players[data.playerId - 1];
            if (p) {
                p.x = data.x;
                p.y = data.y;
                if (p.board && data.boxes) {
                    data.boxes.forEach((b, idx) => {
                        if (p.board.boxes[idx]) {
                            p.board.boxes[idx].x = b.x;
                            p.board.boxes[idx].y = b.y;
                        }
                    });
                }
                if (p.board && data.trashRocks) {
                    p.board.trashRocks = data.trashRocks;
                }
            }
        } else if (data.type === 'POWERUP_USED') {
            const user = players[data.userId - 1];
            const target = players[data.targetId - 1];
            const power = POWERUP_TYPES.find(pw => pw.id === data.powerId);
            if (user && target && power) {
                user.inventory.unshift(power);
                usePowerup(user, target);
            }
        } else if (data.type === 'POWERUP_SHIELD_DEFLECT') {
            showToast("🛡️ ¡El ataque fue repelido por el Escudo Floral!", 2000);
            window.sounds.playShield();
        } else if (data.type === 'ROUND_WIN') {
            const winner = players[data.winnerId - 1];
            nextSynchronizedSeed = data.nextSeed;
            if (data.scores) {
                data.scores.forEach((s, idx) => {
                    if (players[idx]) players[idx].score = s;
                });
            }
            updateScoreboard();
            window.sounds.playLevelWin();

            roundHistory.push({
                round: currentRoundNumber,
                winnerId: winner.id,
                winnerChar: winner.char
            });
            renderRoundHistory();
            showRoundWinCelebration(winner);

            roundTransitionTimeout = setTimeout(() => {
                skipRoundWinCelebration();
            }, 2400);
        } else if (data.type === 'MATCH_WIN') {
            const winner = players[data.winnerId - 1];
            triggerMatchWin(winner);
        } else if (data.type === 'TIME_ATTACK_OVER') {
            triggerTimeAttackOver();
        } else if (data.type === 'MATCH_RESTART') {
            if (data.targetScore) targetScore = data.targetScore;
            resetMatch(data.seed);
        } else if (data.type === 'BOARD_RESET') {
            const p = players[data.playerId - 1];
            if (p) resetCurrentPlayerBoard(p, true);
        }
    }

    function copyDirectLink() {
        const code = displayRoomCode.textContent;
        if (window.location.protocol === 'file:') {
            navigator.clipboard.writeText(code).then(() => {
                showToast(`Código: ${code} copiado. (En file:// tus amigos deben ingresar este código de 5 letras)`, 4000);
            }).catch(() => {
                showToast(`Código de sala: ${code}`, 3000);
            });
            return;
        }
        const url = `${window.location.origin}${window.location.pathname}#room=${code}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast("¡Enlace directo copiado! Pásaselo a tus amigos.");
        }).catch(() => {
            showToast(`Código de sala: ${code}`);
        });
    }

    function returnToLobby() {
        stopTimeAttackTimer();
        if (roundTransitionTimeout) {
            clearTimeout(roundTransitionTimeout);
            roundTransitionTimeout = null;
        }
        gameScreen.style.display = 'none';
        lobbyScreen.style.display = 'block';
        waitingBox.style.display = 'none';
        winModal.style.display = 'none';
        roundWinModal.style.display = 'none';
        updateLobbyRecordDisplay();

        if (clientConn) {
            try { clientConn.close(); } catch(e) {}
            clientConn = null;
        }
        if (netConnections.length > 0) {
            netConnections.forEach(c => { try { c.close(); } catch(e) {} });
            netConnections = [];
        }
        if (peer) {
            try { peer.destroy(); } catch(e) {}
            peer = null;
        }
        isHost = false;
        localPlayerId = 1;
    }

    window.addEventListener('DOMContentLoaded', init);
})();
