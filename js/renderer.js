/**
 * BioGuessr - Motore Grafico Interattivo & Ottico Reale v3.0 (HTML5 Canvas)
 * Supporta:
 * - Modalità Rapida (2D procedurale immediata su #labCanvas)
 * - Modalità Realistica (Schermate ravvicinate dedicate su #inspectionCanvas):
 *   • Cappa Biohazard BSL-2 in acciaio inox AISI 316L (ispirata a FIGURA 19) con anse sterili e piastre impilate
 *   • Semina automatica animata a 4 quadranti con mano guantata e ansa sterile + time-lapse incubazione 37°C (0h → 24h)
 *   • Microscopio Ottico con VERE micrografie scientifiche (CDC PHIL / letteratura peer-reviewed) + ottica reale e motilità viva a fresco
 *   • Pipetta Pasteur contagocce animata per H₂O₂ (Perossidasi/Catalasi), Ossidasi, Kovacs, Ureasi e Pinzetta Dischetti P · A · NV
 */
(function () {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  class LabRenderer {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.offscreen = document.createElement('canvas');
      this.offCtx = this.offscreen.getContext('2d');
      this.callbacks = callbacks || {};

      this.boundCanvases = new WeakSet();
      this.micrographCache = new Map();
      this.liveClock = 0;

      this.bacterium = null;
      this.roundSeed = 12345;
      this.activeView = { type: 'primary' };

      // Impostazioni Laboratorio & Modalità Realistica
      this.realisticMode = false;
      this.hoodAirOn = true;
      this.hoodLightOn = true;
      this.backlight = false;

      // Stato Microscopio Avanzato
      this.objective = '100x'; // '10x' | '40x' | '100x'
      this.targetFocus = 50;
      this.macroFocus = 50;
      this.microFocus = 0; // -15 .. +15
      this.condenser = 100; // 45 .. 135 (%)
      this.panX = 0;
      this.panY = 0;
      this.isPanningSlide = false;
      this.panStart = { x: 0, y: 0 };
      this.oilApplied = true;

      // Stato Procedure Interattive & Automatiche (Modalità Realistica)
      this.proc = {
        active: false,
        completed: true,
        kind: null, // 'auto_streak' | 'streak' | 'pipette' | 'forceps' | 'microscope_focus'
        autoStreakTime: 0,
        autoStreakDuration: 2.35,
        autoLoopPos: null,
        hoodWarnedOnce: false,
        streakPoints: [],
        streakProgress: 100,
        growthProgress: 1,
        incubating: false,
        dropsAdded: 0,
        dropsRequired: 3,
        fallingDrops: [],
        bulbSqueeze: 0,
        reactionProgress: 1,
        disksPlaced: 3,
        tubeTilt: -0.35 // radianti per coagulasi
      };

      this.hoverPos = null;
      this.isPointerDown = false;
      this.lastStreakSoundAt = 0;

      // Particelle animate (bolle H2O2, cellule mobili in modalità classica, flusso laminare cappa)
      this.animFrame = null;
      this.bubbles = [];
      this.motileCells = [];
      this.hoodParticles = [];
      this.lastTime = 0;

      this.initHoodParticles();
      this.bindCanvasEvents(canvas);
      window.addEventListener('mouseup', () => {
        this.isPointerDown = false;
        this.isPanningSlide = false;
      });
      this.resize();
      window.addEventListener('resize', () => this.resize());
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        if (this.canvas.parentElement) {
          this.resizeObserver.observe(this.canvas.parentElement);
        }
      }
    }

    useCanvas(targetCanvas) {
      if (!targetCanvas || this.canvas === targetCanvas) {
        this.resize();
        return;
      }
      this.hoverPos = null;
      this.isPointerDown = false;
      this.isPanningSlide = false;
      this.bindCanvasEvents(targetCanvas);
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        if (targetCanvas.parentElement) {
          this.resizeObserver.observe(targetCanvas.parentElement);
        }
      }
      this.canvas = targetCanvas;
      this.ctx = targetCanvas.getContext('2d');
      this.resize();
      this.ensureLoop();
    }

    initHoodParticles() {
      this.hoodParticles = [];
      for (let i = 0; i < 28; i++) {
        this.hoodParticles.push({
          xFrac: Math.random(),
          yFrac: Math.random(),
          speed: 0.18 + Math.random() * 0.24,
          len: 14 + Math.random() * 22
        });
      }
    }

    getCanvasCoords(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    bindCanvasEvents(c) {
      if (!c || this.boundCanvases.has(c)) return;
      this.boundCanvases.add(c);

      c.addEventListener('mousemove', (e) => {
        if (this.canvas !== c) return;
        const pos = this.getCanvasCoords(e.clientX, e.clientY);
        this.hoverPos = pos;
        this.handlePointerMove(pos);
      });

      c.addEventListener('mousedown', (e) => {
        if (this.canvas !== c || e.button !== 0) return;
        const pos = this.getCanvasCoords(e.clientX, e.clientY);
        this.hoverPos = pos;
        this.isPointerDown = true;
        this.handlePointerDown(pos);
      });

      c.addEventListener('mouseleave', () => {
        if (this.canvas !== c) return;
        this.hoverPos = null;
        this.isPanningSlide = false;
        if (!this.needsAnimationLoop()) {
          this.render();
        }
      });

      // Supporto Touch per tablet/smartphone
      c.addEventListener(
        'touchstart',
        (e) => {
          if (this.canvas !== c) return;
          if (e.touches.length > 0) {
            const pos = this.getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
            this.hoverPos = pos;
            this.isPointerDown = true;
            this.handlePointerDown(pos);
          }
        },
        { passive: true }
      );

      c.addEventListener(
        'touchmove',
        (e) => {
          if (this.canvas !== c) return;
          if (e.touches.length > 0) {
            const pos = this.getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
            this.hoverPos = pos;
            this.handlePointerMove(pos);
          }
        },
        { passive: true }
      );

      c.addEventListener('touchend', () => {
        if (this.canvas !== c) return;
        this.isPointerDown = false;
        this.isPanningSlide = false;
      });
    }

    handlePointerDown(pos) {
      // 1. Se siamo al microscopio: avvia trascinamento vetrino sul tavolino traslatore X/Y
      if (this.activeView.type === 'microscope') {
        this.isPanningSlide = true;
        this.panStart = { x: pos.x - this.panX, y: pos.y - this.panY };
        return;
      }

      // 2. Se c'è una procedura realistica sotto cappa ma il flusso laminare è spento -> riattiva su clic o avvisa!
      if (this.realisticMode && this.proc.active && !this.proc.completed && !this.hoodAirOn) {
        if (this.proc.kind === 'auto_streak' && this.callbacks.onRequestEnableHood) {
          this.callbacks.onRequestEnableHood();
          return;
        }
        if (this.callbacks.onHoodWarning) {
          this.callbacks.onHoodWarning();
        }
        return;
      }

      // 3. Pipetta Contagocce (Test Biochimici)
      if (this.proc.active && !this.proc.completed && this.proc.kind === 'pipette') {
        this.triggerPipetteDrop(pos);
        return;
      }

      // 4. Pinzetta Dischetti Diagnostici (P, A, NV)
      if (this.proc.active && !this.proc.completed && this.proc.kind === 'forceps') {
        this.triggerPlaceDisk();
        return;
      }

      // 5. Inclinazione provetta Coagulasi dopo il completamento
      if (
        this.activeView.type === 'biochem' &&
        this.activeView.biochemMode === 'coagulase' &&
        this.proc.completed
      ) {
        this.proc.tubeTilt = this.proc.tubeTilt < -0.5 ? -0.12 : -0.78;
        window.labAudio.playClick();
        this.render();
      }
    }

    handlePointerMove(pos) {
      if (this.isPanningSlide && this.activeView.type === 'microscope') {
        const limit = 95;
        this.panX = Math.max(-limit, Math.min(limit, pos.x - this.panStart.x));
        this.panY = Math.max(-limit, Math.min(limit, pos.y - this.panStart.y));
        if (this.callbacks.onStagePan) {
          this.callbacks.onStagePan(this.panX, this.panY);
        }
        if (!this.needsAnimationLoop()) this.render();
        return;
      }

      // Striscio con Ansa Batteriologica sulla piastra Petri
      if (
        this.isPointerDown &&
        this.proc.active &&
        !this.proc.completed &&
        this.proc.kind === 'streak' &&
        !this.proc.incubating
      ) {
        if (!this.hoodAirOn) {
          if (this.callbacks.onHoodWarning) this.callbacks.onHoodWarning();
          return;
        }
        const cx = this.width / 2;
        const cy = this.height / 2 + 4;
        const R = Math.min(this.width, this.height) * 0.39;
        if (Math.hypot(pos.x - cx, pos.y - cy) <= R * 0.94) {
          const pts = this.proc.streakPoints;
          const last = pts[pts.length - 1];
          if (!last || Math.hypot(pos.x - last.x, pos.y - last.y) > 5) {
            pts.push({ x: pos.x, y: pos.y });
            this.proc.streakProgress = Math.min(100, this.proc.streakProgress + 3.2);
            const now = performance.now();
            if (now - this.lastStreakSoundAt > 95) {
              window.labAudio.playStreak(true);
              this.lastStreakSoundAt = now;
            }
            if (this.callbacks.onProcedureProgress) {
              this.callbacks.onProcedureProgress(
                `➰ Semina ad ansa sull’agar: ${Math.floor(this.proc.streakProgress)}%`
              );
            }
            if (this.proc.streakProgress >= 100) {
              this.startIncubationTimeLapse();
            }
          }
        }
      }

      if (!this.needsAnimationLoop()) {
        this.render();
      }
    }

    triggerPipetteDrop(pos) {
      if (this.proc.dropsAdded >= this.proc.dropsRequired) return;
      window.labAudio.playPipetteDrop();
      this.proc.bulbSqueeze = 1.0;

      const targetX =
        this.activeView.biochemMode === 'indole_oxygen'
          ? this.width / 2 - 78
          : this.activeView.biochemMode === 'oxidase'
          ? this.width / 2 + 66
          : this.width / 2 + 16;
      const targetY = this.height / 2 + 8;

      this.proc.fallingDrops.push({
        x: pos ? pos.x : targetX,
        y: pos ? Math.min(pos.y + 18, targetY - 34) : targetY - 56,
        targetY,
        vy: 240
      });

      this.proc.dropsAdded += 1;
      const rem = this.proc.dropsRequired - this.proc.dropsAdded;

      if (this.callbacks.onProcedureProgress) {
        if (rem > 0) {
          this.callbacks.onProcedureProgress(
            `💧 Goccia ${this.proc.dropsAdded}/${this.proc.dropsRequired} aggiunta — clicca ancora (${rem} rimaste)`
          );
        } else {
          this.callbacks.onProcedureProgress('⏳ Reazione biochimica in sviluppo...');
        }
      }

      if (this.activeView.biochemMode === 'peroxidase' && this.activeView.pos) {
        window.labAudio.playBubbles();
        if (this.bubbles.length === 0) this.initBubbles();
      }

      this.ensureLoop();
    }

    triggerPlaceDisk() {
      if (this.proc.disksPlaced >= 3) return;
      window.labAudio.playClick();
      this.proc.disksPlaced += 1;
      const names = ['Optochina (P)', 'Bacitracina (A)', 'Novobiocina (NV)'];
      if (this.proc.disksPlaced < 3) {
        if (this.callbacks.onProcedureProgress) {
          this.callbacks.onProcedureProgress(
            `⚪ Posiziona con la pinzetta il dischetto ${this.proc.disksPlaced + 1}/3: ${names[this.proc.disksPlaced]}`
          );
        }
      } else {
        this.startIncubationTimeLapse();
      }
      this.ensureLoop();
    }

    startIncubationTimeLapse() {
      this.proc.incubating = true;
      this.proc.growthProgress = 0.02;
      if (this.callbacks.onProcedureProgress) {
        this.callbacks.onProcedureProgress('🌡️ Incubazione termostatica a 37°C in corso (0h → 24h)...');
      }
      this.ensureLoop();
    }

    completeCurrentProcedure() {
      if (this.proc.completed) return;
      this.proc.completed = true;
      this.proc.active = false;
      this.proc.incubating = false;
      this.proc.streakProgress = 100;
      this.proc.growthProgress = 1;
      this.proc.reactionProgress = 1;
      this.proc.disksPlaced = 3;
      this.proc.dropsAdded = this.proc.dropsRequired;

      if (this.activeView.type === 'microscope') {
        this.objective = '100x';
        this.oilApplied = true;
        this.macroFocus = this.targetFocus;
        this.microFocus = 0;
      }

      if (this.activeView.biochemMode === 'peroxidase' && this.activeView.pos && this.bubbles.length === 0) {
        this.initBubbles();
      }

      window.labAudio.playIncubatorChime();
      if (this.callbacks.onProcedureComplete) {
        this.callbacks.onProcedureComplete(this.activeView);
      }
      this.ensureLoop();
      this.render();
    }

    resize() {
      const parent = this.canvas.parentElement;
      if (!parent) return;
      const cw = parent.clientWidth || parent.getBoundingClientRect().width;
      const ch = parent.clientHeight || parent.getBoundingClientRect().height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = Math.max(320, Math.floor(cw));
      this.height = Math.max(340, Math.floor(ch));

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.offscreen.width = this.width * dpr;
      this.offscreen.height = this.height * dpr;
      this.offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.dpr = dpr;

      if (this.activeView && this.activeView.stainMode === 'capsule') {
        this.initMotileCells();
      }
      this.render();
    }

    replayAutoStreak() {
      if (!this.activeView || (this.activeView.type !== 'petri' && this.activeView.type !== 'primary')) {
        return;
      }
      this.stopAnimation();
      this.proc = {
        active: true,
        completed: false,
        kind: 'auto_streak',
        autoStreakTime: 0,
        autoStreakDuration: 3.35,
        autoLoopPos: null,
        hoodWarnedOnce: false,
        streakPoints: [],
        streakProgress: 0,
        growthProgress: 0,
        incubating: false,
        dropsAdded: 0,
        dropsRequired: 0,
        fallingDrops: [],
        bulbSqueeze: 0,
        reactionProgress: 0,
        disksPlaced: 0,
        tubeTilt: -0.35
      };
      this.lastTime = performance.now();
      this.ensureLoop();
      this.render();
    }

    setRealisticMode(enabled) {
      this.realisticMode = !!enabled;
      this.ensureLoop();
      this.render();
    }

    setHoodState(airOn, lightOn) {
      this.hoodAirOn = !!airOn;
      this.hoodLightOn = !!lightOn;
      this.ensureLoop();
      this.render();
    }

    setSample(bacterium, seed) {
      this.bacterium = bacterium;
      this.roundSeed = seed || Date.now();
      this.backlight = false;
      this.panX = 0;
      this.panY = 0;
      this.setView({ type: 'primary' }, false);
    }

    setBacklight(enabled) {
      this.backlight = !!enabled;
      this.render();
    }

    setMicroscopeParams({ objective, macro, micro, condenser, resetPan }) {
      if (objective) {
        this.objective = objective;
        if (objective === '100x') this.oilApplied = true;
      }
      if (typeof macro === 'number') this.macroFocus = macro;
      if (typeof micro === 'number') this.microFocus = micro;
      if (typeof condenser === 'number') this.condenser = condenser;
      if (resetPan) {
        this.panX = 0;
        this.panY = 0;
      }

      // Verifica se l'utente in Modalità Realistica ha messo a fuoco a 100x Olio!
      if (
        this.proc.active &&
        !this.proc.completed &&
        this.proc.kind === 'microscope_focus' &&
        this.objective === '100x' &&
        this.getEffectiveBlur() < 0.55
      ) {
        this.completeCurrentProcedure();
        return;
      }

      if (!this.needsAnimationLoop()) {
        this.render();
      }
    }

    setCoagulaseTilt(deg) {
      this.proc.tubeTilt = (deg * Math.PI) / 180;
      this.render();
    }

    getEffectiveBlur() {
      const combined = this.macroFocus + this.microFocus * 0.35;
      const diff = Math.abs(combined - this.targetFocus);
      const magFactor = this.objective === '100x' ? 0.24 : this.objective === '40x' ? 0.15 : 0.08;
      return diff * magFactor;
    }

    setView(viewSpec, startInteractive) {
      this.stopAnimation();
      this.activeView = viewSpec;
      this.panX = 0;
      this.panY = 0;

      if (startInteractive && this.realisticMode) {
        this.setupRealisticProcedure(viewSpec);
      } else {
        this.proc = {
          active: false,
          completed: true,
          kind: null,
          streakPoints: [],
          streakProgress: 100,
          growthProgress: 1,
          incubating: false,
          dropsAdded: 3,
          dropsRequired: 3,
          fallingDrops: [],
          bulbSqueeze: 0,
          reactionProgress: 1,
          disksPlaced: 3,
          tubeTilt: -0.35
        };

        if (viewSpec.type === 'microscope') {
          this.objective = '100x';
          this.oilApplied = true;
          this.targetFocus = 50;
          this.macroFocus = 72;
          this.microFocus = 0;
          this.condenser = 100;
          this.animateRapidFocusIntro();
          if (viewSpec.stainMode === 'capsule') {
            this.initMotileCells();
          }
        } else if (
          viewSpec.type === 'biochem' &&
          viewSpec.biochemMode === 'peroxidase' &&
          viewSpec.pos
        ) {
          this.initBubbles();
        }
      }

      this.ensureLoop();
      this.render();
    }

    setupRealisticProcedure(viewSpec) {
      this.bubbles = [];
      if (viewSpec.type === 'petri') {
        // Semina automatica continua a 4 quadranti sotto cappa BSL-2 (FIGURA 19) + incubazione 0h->24h!
        this.proc = {
          active: true,
          completed: false,
          kind: 'auto_streak',
          autoStreakTime: 0,
          autoStreakDuration: 3.35,
          autoLoopPos: null,
          hoodWarnedOnce: false,
          streakPoints: [],
          streakProgress: 0,
          growthProgress: 0,
          incubating: false,
          dropsAdded: 0,
          dropsRequired: 0,
          fallingDrops: [],
          bulbSqueeze: 0,
          reactionProgress: 0,
          disksPlaced: 0,
          tubeTilt: -0.35
        };
      } else if (viewSpec.type === 'biochem') {
        if (viewSpec.biochemMode === 'disks') {
          this.proc = {
            active: true,
            completed: false,
            kind: 'forceps',
            autoStreakTime: 0,
            autoStreakDuration: 2.3,
            autoLoopPos: null,
            hoodWarnedOnce: false,
            streakPoints: [],
            streakProgress: 0,
            growthProgress: 0,
            incubating: false,
            dropsAdded: 0,
            dropsRequired: 0,
            fallingDrops: [],
            bulbSqueeze: 0,
            reactionProgress: 0,
            disksPlaced: 0,
            tubeTilt: -0.35
          };
        } else {
          const req = viewSpec.biochemMode === 'peroxidase' ? 3 : 2;
          this.proc = {
            active: true,
            completed: false,
            kind: 'pipette',
            autoStreakTime: 0,
            autoStreakDuration: 2.3,
            autoLoopPos: null,
            hoodWarnedOnce: false,
            streakPoints: [],
            streakProgress: 0,
            growthProgress: 0,
            incubating: false,
            dropsAdded: 0,
            dropsRequired: req,
            fallingDrops: [],
            bulbSqueeze: 0,
            reactionProgress: 0,
            disksPlaced: 0,
            tubeTilt: -0.1
          };
        }
      } else if (viewSpec.type === 'microscope') {
        if (!viewSpec.stainMode || viewSpec.stainMode === 'none') {
          this.objective = '10x';
          this.oilApplied = false;
          this.targetFocus = 50;
          this.macroFocus = 50;
          this.microFocus = 0;
          this.condenser = 100;
          this.proc = {
            active: false,
            completed: true,
            kind: null,
            streakPoints: [],
            streakProgress: 100,
            growthProgress: 1,
            incubating: false,
            dropsAdded: 0,
            dropsRequired: 0,
            fallingDrops: [],
            bulbSqueeze: 0,
            reactionProgress: 1,
            disksPlaced: 3,
            tubeTilt: -0.35
          };
          return;
        }
        // In modalità standard (non realistica), il microscopio è subito a fuoco nitido a 1000× (100x a immersione)
        if (!this.realisticMode) {
          this.objective = '100x';
          this.oilApplied = true;
          this.targetFocus = 50;
          this.macroFocus = 50;
          this.microFocus = 0;
          this.condenser = 100;
          if (viewSpec.stainMode === 'capsule') {
            this.initMotileCells();
          }
          this.proc = {
            active: false,
            completed: true,
            kind: null,
            autoStreakTime: 0,
            autoStreakDuration: 2.3,
            autoLoopPos: null,
            hoodWarnedOnce: false,
            streakPoints: [],
            streakProgress: 100,
            growthProgress: 1,
            incubating: false,
            dropsAdded: 0,
            dropsRequired: 0,
            fallingDrops: [],
            bulbSqueeze: 0,
            reactionProgress: 1,
            disksPlaced: 3,
            tubeTilt: -0.35
          };
          return;
        }

        // In modalità realistica: piano focale casuale diverso da 50 così l'utente deve mettere a fuoco con macro/micrometrica
        const rng = mulberry32(this.roundSeed ^ hashString(viewSpec.stainMode || 'gram'));
        this.targetFocus = Math.round(28 + rng() * 44);
        if (Math.abs(this.targetFocus - 50) < 9) {
          this.targetFocus = this.targetFocus < 50 ? 33 : 68;
        }
        this.objective = '10x';
        this.oilApplied = false;
        this.macroFocus = 50;
        this.microFocus = 0;
        this.condenser = 95;
        this.proc = {
          active: true,
          completed: false,
          kind: 'microscope_focus',
          autoStreakTime: 0,
          autoStreakDuration: 2.3,
          autoLoopPos: null,
          hoodWarnedOnce: false,
          streakPoints: [],
          streakProgress: 0,
          growthProgress: 1,
          incubating: false,
          dropsAdded: 0,
          dropsRequired: 0,
          fallingDrops: [],
          bulbSqueeze: 0,
          reactionProgress: 1,
          disksPlaced: 3,
          tubeTilt: -0.35
        };
      }
    }

    animateRapidFocusIntro() {
      const startTime = performance.now();
      const duration = 380;
      const step = (now) => {
        if (this.realisticMode && this.proc.active) return;
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        this.macroFocus = 70 - 20 * eased;
        if (!this.needsAnimationLoop()) this.render();
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    needsAnimationLoop() {
      if (!this.activeView) return false;
      // Sotto cappa con flusso laminare attivo
      if (this.isUnderHood() && this.hoodAirOn) return true;
      // Procedura interattiva o semina automatica attiva
      if (this.proc.active && !this.proc.completed) return true;
      // In Modalità Realistica al microscopio: dinamica viva fluido/immersione/motilità su micrografie reali
      if (
        this.realisticMode &&
        this.activeView.type === 'microscope' &&
        this.activeView.stainMode &&
        this.activeView.stainMode !== 'none'
      ) {
        return true;
      }
      // Motilità a fresco (Modalità Rapida)
      if (this.activeView.type === 'microscope' && this.activeView.stainMode === 'capsule') return true;
      // Bollicine H2O2
      if (
        this.activeView.type === 'biochem' &&
        this.activeView.biochemMode === 'peroxidase' &&
        this.activeView.pos &&
        (this.proc.completed || this.proc.dropsAdded > 0)
      ) {
        return true;
      }
      return false;
    }

    isUnderHood() {
      return (
        this.realisticMode &&
        this.activeView &&
        (this.activeView.type === 'primary' ||
          this.activeView.type === 'petri' ||
          this.activeView.type === 'biochem')
      );
    }

    ensureLoop() {
      if (this.needsAnimationLoop()) {
        if (!this.animFrame) {
          this.lastTime = performance.now();
          const loop = (now) => {
            const dt = Math.min(0.05, (now - this.lastTime) / 1000);
            this.lastTime = now;
            this.updateAnimation(dt);
            this.render();
            if (this.needsAnimationLoop()) {
              this.animFrame = requestAnimationFrame(loop);
            } else {
              this.animFrame = null;
            }
          };
          this.animFrame = requestAnimationFrame(loop);
        }
      } else {
        this.stopAnimation();
      }
    }

    stopAnimation() {
      if (this.animFrame) {
        cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
      }
    }

    initBubbles() {
      this.bubbles = [];
      for (let i = 0; i < 40; i++) {
        this.bubbles.push(this.createBubble(true));
      }
    }

    createBubble(randomLife) {
      const cx = this.width / 2;
      const cy = this.height / 2 + 8;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 52;
      return {
        x: cx + Math.cos(angle) * dist * 1.32,
        y: cy + Math.sin(angle) * dist * 0.7,
        r: 1.8 + Math.random() * 5.0,
        vy: 15 + Math.random() * 28,
        life: randomLife ? Math.random() : 0,
        maxLife: 0.7 + Math.random() * 0.8
      };
    }

    initMotileCells() {
      if (!this.bacterium) return;
      const rng = mulberry32(this.roundSeed ^ 0x9e3779b9);
      const cx = this.width / 2;
      const cy = this.height / 2;
      const maxR = Math.min(this.width, this.height) * 0.48;
      this.motileCells = [];
      for (let i = 0; i < 42; i++) {
        const ang = rng() * Math.PI * 2;
        const rad = Math.sqrt(rng()) * maxR;
        this.motileCells.push({
          x: cx + Math.cos(ang) * rad,
          y: cy + Math.sin(ang) * rad,
          angle: rng() * Math.PI * 2,
          spin: (rng() - 0.5) * 8,
          speed: 22 + rng() * 36,
          turnTimer: rng() * 1.5
        });
      }
    }

    updateAnimation(dt) {
      this.liveClock += dt;

      // 1. Flusso d'aria laminare verticale sotto cappa BSL-2
      if (this.isUnderHood() && this.hoodAirOn) {
        this.proc.hoodWarnedOnce = false;
        for (const p of this.hoodParticles) {
          p.yFrac += p.speed * dt;
          if (p.yFrac > 1.05) {
            p.yFrac = -0.05;
            p.xFrac = Math.random();
          }
        }
      }

      // 1b. Semina Automatica Continua a 4 Quadranti sotto Cappa BSL-2!
      if (
        this.proc.active &&
        !this.proc.completed &&
        this.proc.kind === 'auto_streak' &&
        !this.proc.incubating
      ) {
        if (!this.hoodAirOn) {
          if (!this.proc.hoodWarnedOnce && this.callbacks.onHoodWarning) {
            this.proc.hoodWarnedOnce = true;
            this.callbacks.onHoodWarning();
          }
        } else {
          this.proc.autoStreakTime = Math.min(
            this.proc.autoStreakDuration,
            (this.proc.autoStreakTime || 0) + dt
          );
          const u = this.proc.autoStreakTime / this.proc.autoStreakDuration;
          this.proc.streakProgress = Math.round(u * 100);

          if (u >= 0.11 && u <= 0.92) {
            const su = (u - 0.11) / 0.81;
            const quad = Math.min(4, Math.floor(su * 4) + 1);
            const now = performance.now();
            if (now - this.lastStreakSoundAt > 125) {
              window.labAudio.playStreak(true);
              this.lastStreakSoundAt = now;
            }
            if (this.callbacks.onProcedureProgress) {
              this.callbacks.onProcedureProgress(
                `➰ Semina automatica a 4 quadranti sotto cappa BSL-2: Quadrante ${quad}/4 (${Math.min(100, Math.round(su * 100))}%)...`
              );
            }
          } else if (u < 0.11) {
            if (this.callbacks.onProcedureProgress) {
              this.callbacks.onProcedureProgress(
                '➰ Prelievo inoculo con ansa monouso sterile da 10 µL sotto cappa BSL-2...'
              );
            }
          } else if (this.callbacks.onProcedureProgress) {
            this.callbacks.onProcedureProgress(
              '➰ Chiusura piastra sterile e trasferimento in termostato a 37°C...'
            );
          }

          if (u >= 1) {
            this.startIncubationTimeLapse();
          }
        }
      }

      // 2. Rilascio pressione bulbo pipetta e caduta gocce
      if (this.proc.bulbSqueeze > 0) {
        this.proc.bulbSqueeze = Math.max(0, this.proc.bulbSqueeze - dt * 3.5);
      }

      if (this.proc.fallingDrops.length > 0) {
        for (let i = this.proc.fallingDrops.length - 1; i >= 0; i--) {
          const d = this.proc.fallingDrops[i];
          d.y += d.vy * dt;
          d.vy += 420 * dt;
          if (d.y >= d.targetY) {
            this.proc.fallingDrops.splice(i, 1);
          }
        }
      }

      // 3. Sviluppo reazione biochimica dopo l'aggiunta di tutte le gocce
      if (
        this.proc.active &&
        !this.proc.completed &&
        this.proc.kind === 'pipette' &&
        this.proc.dropsAdded >= this.proc.dropsRequired &&
        this.proc.fallingDrops.length === 0
      ) {
        this.proc.reactionProgress = Math.min(1, this.proc.reactionProgress + dt * 1.15);
        if (this.proc.reactionProgress >= 1) {
          this.proc.tubeTilt = -0.45;
          this.completeCurrentProcedure();
        }
      }

      // 4. Time-lapse Incubazione 37°C (Piastre Petri e Dischetti Diagnostici)
      if (this.proc.active && !this.proc.completed && this.proc.incubating) {
        this.proc.growthProgress = Math.min(1, this.proc.growthProgress + dt * 0.56);
        const hours = Math.min(24, Math.floor(this.proc.growthProgress * 24));
        if (this.callbacks.onProcedureProgress) {
          this.callbacks.onProcedureProgress(`🌡️ Incubazione termostatica a 37°C: ${hours}h / 24h`);
        }
        if (this.proc.growthProgress >= 1) {
          this.completeCurrentProcedure();
        }
      }

      // 5. Bollicine H2O2 (Perossidasi / Catalasi)
      if (
        this.activeView.type === 'biochem' &&
        this.activeView.biochemMode === 'peroxidase' &&
        this.activeView.pos &&
        this.bubbles.length > 0
      ) {
        for (let i = 0; i < this.bubbles.length; i++) {
          const b = this.bubbles[i];
          b.life += dt;
          b.y -= b.vy * dt * 0.45;
          b.r += dt * 1.5;
          if (b.life >= b.maxLife) {
            this.bubbles[i] = this.createBubble(false);
          }
        }
      }

      // 6. Motilità cellulare procedurale (USATA SOLO CON MODALITÀ REALISTICA: OFF!)
      if (
        !this.realisticMode &&
        this.activeView.type === 'microscope' &&
        this.activeView.stainMode === 'capsule'
      ) {
        const mot = this.bacterium.microscopy.motility;
        const cx = this.width / 2;
        const cy = this.height / 2;
        const maxR = Math.min(this.width, this.height) * 0.5;

        for (const c of this.motileCells) {
          if (mot === 'immobile') {
            c.x += (Math.random() - 0.5) * 0.85;
            c.y += (Math.random() - 0.5) * 0.85;
          } else if (mot === 'darting') {
            c.turnTimer -= dt;
            if (c.turnTimer <= 0) {
              c.angle += (Math.random() - 0.5) * 2.6;
              c.turnTimer = 0.25 + Math.random() * 0.5;
            }
            c.x += Math.cos(c.angle) * c.speed * 3.0 * dt;
            c.y += Math.sin(c.angle) * c.speed * 3.0 * dt;
          } else if (mot === 'tumbling') {
            c.angle += c.spin * dt * 1.9;
            c.x += Math.cos(c.angle * 0.5) * c.speed * 0.95 * dt;
            c.y += Math.sin(c.angle * 0.5) * c.speed * 0.95 * dt;
          } else if (mot === 'swarming') {
            c.angle += (Math.random() - 0.5) * 1.2 * dt;
            c.x += Math.cos(c.angle) * c.speed * 2.1 * dt;
            c.y += Math.sin(c.angle) * c.speed * 2.1 * dt;
          } else {
            c.turnTimer -= dt;
            if (c.turnTimer <= 0) {
              c.angle += (Math.random() - 0.5) * 1.3;
              c.turnTimer = 0.6 + Math.random() * 1.2;
            }
            c.x += Math.cos(c.angle) * c.speed * 1.35 * dt;
            c.y += Math.sin(c.angle) * c.speed * 1.35 * dt;
          }

          const dx = c.x - cx;
          const dy = c.y - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > maxR) {
            const normAngle = Math.atan2(dy, dx);
            c.x = cx + Math.cos(normAngle) * (maxR - 2);
            c.y = cy + Math.sin(normAngle) * (maxR - 2);
            c.angle = normAngle + Math.PI + (Math.random() - 0.5) * 0.6;
          }
        }
      }
    }

    render() {
      if (!this.ctx || !this.bacterium) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      if (this.activeView.type === 'primary' || this.activeView.type === 'petri') {
        this.offCtx.clearRect(0, 0, this.width, this.height);
        this.drawLabSurface(this.offCtx);
        this.drawPetriScene(this.offCtx);
        ctx.drawImage(this.offscreen, 0, 0, this.width, this.height);

        // Durante la semina automatica sotto cappa, mostra mani guantate + ansa sterile animata (FIGURA 19)
        if (
          this.proc.active &&
          !this.proc.completed &&
          this.proc.kind === 'auto_streak' &&
          !this.proc.incubating
        ) {
          this.drawAutoStreakHandAndLoop(ctx);
        }

        // Sovrapposizioni Cappa BSL-2 (vetro frontale + flusso d'aria)
        if (this.isUnderHood()) {
          this.drawBiosafetyHoodOverlay(ctx);
        }

        // Banner interattivo se il flusso laminare è spento durante la semina automatica
        if (
          this.proc.active &&
          !this.proc.completed &&
          this.proc.kind === 'auto_streak' &&
          !this.proc.incubating &&
          !this.hoodAirOn
        ) {
          this.drawHoodPauseInterlockBanner(ctx);
        }

        // Badge Termostato 37°C durante il time-lapse di incubazione 0h -> 24h
        if (this.proc.active && !this.proc.completed && this.proc.incubating) {
          this.drawIncubatorThermostatHUD(ctx);
        }

        if (this.proc.active && !this.proc.completed && this.proc.kind === 'streak') {
          this.drawInoculationLoopCursor(ctx);
        } else if (
          !(this.proc.active && !this.proc.completed && (this.proc.kind === 'auto_streak' || this.proc.incubating))
        ) {
          this.drawPetriLoupe(ctx);
        }
      } else if (this.activeView.type === 'microscope') {
        this.drawMicroscopeScene(ctx);
      } else if (this.activeView.type === 'biochem') {
        this.drawLabSurface(ctx);
        this.drawBiochemScene(ctx);
        if (this.isUnderHood()) {
          this.drawBiosafetyHoodOverlay(ctx);
        }
        if (this.proc.active && !this.proc.completed && this.proc.incubating) {
          this.drawIncubatorThermostatHUD(ctx);
        }
        if (this.proc.active && !this.proc.completed) {
          if (this.proc.kind === 'pipette') {
            this.drawPipetteCursor(ctx);
          } else if (this.proc.kind === 'forceps' && !this.proc.incubating) {
            this.drawForcepsCursor(ctx);
          }
        }
      }
    }

    // =========================================================================
    // BANCO CLINICO STERILE & CAPPA BIOHAZARD BSL-2 IN ACCIAIO INOX
    // =========================================================================
    drawLabSurface(ctx) {
      const w = this.width;
      const h = this.height;

      if (this.isUnderHood()) {
        // Piano di lavoro in Acciaio Inox AISI 316L spazzolato della Cappa Biologica!
        const steelGrad = ctx.createLinearGradient(0, 0, w, h);
        if (this.hoodLightOn) {
          steelGrad.addColorStop(0, '#cfdbe6');
          steelGrad.addColorStop(0.35, '#e8f1f8');
          steelGrad.addColorStop(0.68, '#bfd0df');
          steelGrad.addColorStop(1, '#9cb3c9');
        } else {
          steelGrad.addColorStop(0, '#64748b');
          steelGrad.addColorStop(0.5, '#7c8ea3');
          steelGrad.addColorStop(1, '#475569');
        }
        ctx.fillStyle = steelGrad;
        ctx.fillRect(0, 0, w, h);

        // Linee sottili orizzontali di satinatura dell'acciaio inox
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        for (let y = 36; y < h - 36; y += 9) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Griglia di aspirazione HEPA posteriore (in alto) e frontale (in basso)
        this.drawPerforatedGrille(ctx, 10, w);
        this.drawPerforatedGrille(ctx, h - 26, w);

        // Strumentazione laterale autentica sotto cappa (ispirata a FIGURA 19: piastre impilate e becher con anse sterili)
        if (w >= 580) {
          this.drawHoodPropsBackdrop(ctx, w, h);
        }
      } else {
        // Superficie di laboratorio clinico ceramica azzurro-ghiaccio pulita
        const grad = ctx.createRadialGradient(w / 2, h / 2, 15, w / 2, h / 2, Math.max(w, h) * 0.72);
        if (this.backlight && (this.activeView.type === 'primary' || this.activeView.type === 'petri')) {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.48, '#dbeafe');
          grad.addColorStop(1, '#93c5fd');
        } else {
          grad.addColorStop(0, '#eef6fc');
          grad.addColorStop(0.65, '#d5e6f5');
          grad.addColorStop(1, '#b6d0e8');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Griglia di precisione contacolonie da laboratorio
        ctx.strokeStyle = 'rgba(14, 116, 144, 0.09)';
        ctx.lineWidth = 1;
        const step = 28;
        for (let x = (w / 2) % step; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = (h / 2) % step; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }
    }

    drawPerforatedGrille(ctx, startY, w) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.fillRect(0, startY - 3, w, 19);

      ctx.fillStyle = '#334155';
      for (let x = 18; x < w - 18; x += 22) {
        this.roundRect(ctx, x, startY, 13, 4.5, 2.2);
        ctx.fill();
        this.roundRect(ctx, x, startY + 8, 13, 4.5, 2.2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawHoodPropsBackdrop(ctx, w, h) {
      ctx.save();
      const leftX = 88;
      const rightX = w - 96;

      // SINISTRA: Pila di piastre Petri sterili etichettate sotto cappa (come in FIGURA 19)
      for (let i = 0; i < 3; i++) {
        const px = leftX + i * 8;
        const py = h * 0.64 - i * 15;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.ellipse(px, py + 7, 50, 27, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = i === 1 ? '#8f292f' : '#a86438';
        ctx.beginPath();
        ctx.ellipse(px, py, 47, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py - 2, 49, 25.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Etichetta bianca con codice a barre sul coperchio
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.roundRect(ctx, px - 22, py - 9, 44, 15, 3);
        ctx.fill();
        ctx.fillStyle = '#334155';
        for (let b = -16; b <= 14; b += 4) {
          ctx.fillRect(px + b, py - 6, b % 8 === 0 ? 2 : 1, 9);
        }
      }

      // DESTRA: Becher in vetro con anse batteriologiche sterili bianche e gialle (come in FIGURA 19)
      const bx = rightX;
      const by = h * 0.56;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.beginPath();
      ctx.ellipse(bx, by + 62, 40, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Anse monouso sterili (bianche e gialle) che spuntano dal becher
      const sticks = [
        [-22, -74, '#fef08a'],
        [-12, -82, '#ffffff'],
        [-3, -78, '#fde047'],
        [7, -84, '#f8fafc'],
        [16, -76, '#fde047'],
        [24, -70, '#ffffff']
      ];
      for (const [dx, dy, col] of sticks) {
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx + dx * 0.35, by + 44);
        ctx.lineTo(bx + dx, by + dy);
        ctx.stroke();

        ctx.strokeStyle = col;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(bx + dx, by + dy - 4, 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Corpo trasparente del becher + liquido disinfettante sul fondo
      ctx.fillStyle = 'rgba(186, 230, 253, 0.34)';
      this.roundRect(ctx, bx - 34, by + 10, 68, 50, 10);
      ctx.fill();

      const bkGrad = ctx.createLinearGradient(bx - 36, by - 26, bx + 36, by + 60);
      bkGrad.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
      bkGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.22)');
      bkGrad.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
      ctx.fillStyle = bkGrad;
      this.roundRect(ctx, bx - 36, by - 26, 72, 88, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      this.roundRect(ctx, bx - 16, by + 16, 32, 22, 4);
      ctx.fill();

      ctx.restore();
    }

    drawAutoStreakHandAndLoop(ctx) {
      const lp = this.proc.autoLoopPos;
      if (!lp) return;

      ctx.save();

      // 1. MANO SINISTRA CON GUANTO IN NITRILE STERILE + POLSINO CAMICE (regge la piastra come in FIGURA 19)
      const rimX = lp.cx - lp.R;
      const rimY = lp.cy + 8;

      // Manica camice bianco da laboratorio in basso a sinistra
      ctx.save();
      const cuffGradL = ctx.createLinearGradient(rimX - 165, rimY + 150, rimX - 45, rimY + 35);
      cuffGradL.addColorStop(0, '#cbd5e1');
      cuffGradL.addColorStop(0.55, '#f1f5f9');
      cuffGradL.addColorStop(1, '#ffffff');
      ctx.fillStyle = cuffGradL;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(rimX - 185, this.height + 16);
      ctx.quadraticCurveTo(rimX - 115, rimY + 72, rimX - 54, rimY + 46);
      ctx.lineTo(rimX - 24, rimY + 86);
      ctx.quadraticCurveTo(rimX - 82, rimY + 132, rimX - 118, this.height + 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Palmo/polso sinistro guantato
      const gloveGradL = ctx.createRadialGradient(rimX - 30, rimY + 18, 6, rimX - 38, rimY + 26, 68);
      gloveGradL.addColorStop(0, '#ffffff');
      gloveGradL.addColorStop(0.6, '#eef6fc');
      gloveGradL.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = gloveGradL;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.58)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.ellipse(rimX - 36, rimY + 32, 38, 25, -0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pollice sinistro guantato appoggiato sul bordo superiore-sinistro della piastra Petri
      ctx.beginPath();
      ctx.ellipse(rimX - 10, rimY - 24, 29, 11.5, -0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Indice e medio che sostengono il bordo inferiore-sinistro della piastra
      ctx.beginPath();
      ctx.ellipse(rimX - 6, rimY + 34, 30, 11.5, 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 2. MANO DESTRA GUANTATA + ANSA STERILE MONOUSO DA 10 µL (movimento fluido sui 4 quadranti)
      const liftPx = lp.lifted ? 7 : 0;
      const handleAngle = typeof lp.angle === 'number' ? lp.angle : 0.72;
      const cosA = Math.cos(handleAngle);
      const sinA = Math.sin(handleAngle);
      const stemLen = 114;
      const gripX = lp.x + cosA * stemLen;
      const gripY = lp.y - liftPx + sinA * stemLen;

      // Ombra proiettata sull'agar (più ampia e morbida quando l'ansa si solleva tra un quadrante e l'altro)
      ctx.save();
      ctx.strokeStyle = lp.lifted ? 'rgba(15, 23, 42, 0.13)' : 'rgba(15, 23, 42, 0.24)';
      ctx.lineWidth = lp.lifted ? 5.5 : 3.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lp.x + (lp.lifted ? 5 : 2), lp.y + (lp.lifted ? 9 : 4));
      ctx.lineTo(gripX + 6, gripY + 12);
      ctx.stroke();
      ctx.restore();

      // Punta ad anello calibrato (10 µL) sul punto di contatto (lp.x, lp.y - liftPx)
      const tipX = lp.x;
      const tipY = lp.y - liftPx;

      ctx.save();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(tipX, tipY, 5.4, 4.2, handleAngle, 0, Math.PI * 2);
      ctx.stroke();

      // Film liquido iridescente di sospensione batterica dentro l'anellino
      ctx.fillStyle = 'rgba(254, 240, 138, 0.76)';
      ctx.beginPath();
      ctx.ellipse(tipX, tipY, 3.6, 2.7, handleAngle, 0, Math.PI * 2);
      ctx.fill();

      // Collo sottile flessibile bianco dell'ansa sterile
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tipX + cosA * 4.5, tipY + sinA * 4.5);
      ctx.lineTo(tipX + cosA * 56, tipY + sinA * 56);
      ctx.stroke();

      // Impugnatura zigrinata gialla da laboratorio (stile ansa sterile da 10 µL in FIGURA 19)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 7.4;
      ctx.beginPath();
      ctx.moveTo(tipX + cosA * 52, tipY + sinA * 52);
      ctx.lineTo(gripX + cosA * 22, gripY + sinA * 22);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(tipX + cosA * 53, tipY + sinA * 53);
      ctx.lineTo(gripX + cosA * 20, gripY + sinA * 20);
      ctx.stroke();

      // Manica camice + Mano destra guantata che impugna l'ansa a penna
      const handGradR = ctx.createRadialGradient(gripX - 6, gripY - 6, 6, gripX + 28, gripY + 28, 78);
      handGradR.addColorStop(0, '#ffffff');
      handGradR.addColorStop(0.58, '#eef6fc');
      handGradR.addColorStop(1, '#cbd5e1');

      // Avambraccio / Polsino destro verso l'angolo inferiore destro della cappa
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(gripX + 20, gripY + 34);
      ctx.lineTo(gripX + 72, gripY + 2);
      ctx.lineTo(this.width + 24, this.height + 18);
      ctx.lineTo(gripX + 86, this.height + 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = handGradR;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.62)';
      ctx.lineWidth = 1.5;

      // Dorso mano destra guantata
      ctx.beginPath();
      ctx.ellipse(gripX + 34, gripY + 24, 44, 30, 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dito indice e pollice guantati a presa di precisione sull'impugnatura dell'ansa
      ctx.beginPath();
      ctx.ellipse(gripX + 4, gripY - 3, 25, 11, handleAngle - 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(gripX + 10, gripY + 12, 23, 10.5, handleAngle + 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    }

    drawHoodPauseInterlockBanner(ctx) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      const pulse = 0.88 + Math.sin((this.liveClock || 0) * 5) * 0.12;

      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${0.84 * pulse})`;
      const bw = Math.min(this.width - 36, 430);
      const bh = 74;
      this.roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 20);
      ctx.fill();

      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.font = '800 12px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ BLOCCO SICUREZZA CAPPA BIOHAZARD BSL-2', cx, cy - 11);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 11.5px "Inter", sans-serif';
      ctx.fillText('Clicca qui (o su "Flusso Cappa: ON") per avviare la semina automatica!', cx, cy + 14);
      ctx.restore();
    }

    drawIncubatorThermostatHUD(ctx) {
      const prog = Math.max(0, Math.min(1, this.proc.growthProgress || 0));
      const hours = Math.min(24, Math.floor(prog * 24));
      const bx = this.width - 196;
      const by = 46;
      const bw = 182;
      const bh = 54;

      ctx.save();
      ctx.fillStyle = 'rgba(11, 39, 86, 0.88)';
      this.roundRect(ctx, bx, by, bw, bh, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.78)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Anello circolare progresso 24h
      const rx = bx + 26;
      const ry = by + 27;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(rx, ry, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(rx, ry, 14, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.font = '800 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TERMOSTATO 37.0°C', bx + 48, by + 21);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12.5px "JetBrains Mono", monospace';
      ctx.fillText(`⏱️ ${String(hours).padStart(2, '0')}h / 24h`, bx + 48, by + 39);
      ctx.restore();
    }

    drawBiosafetyHoodOverlay(ctx) {
      const w = this.width;
      const h = this.height;
      ctx.save();

      // Flusso d'aria laminare sterile (filetti fluidodinamici verticali delicati)
      if (this.hoodAirOn) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        for (const p of this.hoodParticles) {
          const px = p.xFrac * w;
          const py = p.yFrac * h;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + p.len);
          ctx.stroke();
        }
      }

      // Bordo inferiore del saliscendi in vetro temperato della Cappa (Sash)
      const sashY = 34;
      const sashGrad = ctx.createLinearGradient(0, 0, 0, sashY);
      sashGrad.addColorStop(0, 'rgba(186, 230, 253, 0.35)');
      sashGrad.addColorStop(1, 'rgba(255, 255, 255, 0.16)');
      ctx.fillStyle = sashGrad;
      ctx.fillRect(0, 0, w, sashY);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, sashY);
      ctx.lineTo(w, sashY);
      ctx.stroke();

      // Etichetta tecnica sul vetro della cappa
      ctx.fillStyle = this.hoodAirOn ? '#0369a1' : '#be123c';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        this.hoodAirOn
          ? '🛡️ CAPPA BIOHAZARD CLASSE II · FLUSSO HEPA 0.45 m/s · -25 Pa'
          : '⚠️ ALLARME CAPPA: FLUSSO LAMINARE DISATTIVATO!',
        14,
        21
      );

      ctx.restore();
    }

    // =========================================================================
    // CURSORE STRUMENTI REALISTICI (ANSA, PIPETTA PASTEUR, PINZETTA)
    // =========================================================================
    drawInoculationLoopCursor(ctx) {
      const pos = this.hoverPos || { x: this.width * 0.68, y: this.height * 0.36 };
      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Filo metallico al nichel-cromo con anellino sulla punta (0,0)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Gocciolina lucida di inoculo batterico nell'anello
      ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(3.5, -3.2);
      ctx.lineTo(36, -34);
      ctx.stroke();

      // Manico isolante azzurro anodizzato dell'ansa
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(36, -34);
      ctx.lineTo(94, -88);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(38, -37);
      ctx.lineTo(90, -86);
      ctx.stroke();

      ctx.restore();
    }

    drawPipetteCursor(ctx) {
      // Le gocce in caduta libera
      ctx.save();
      for (const d of this.proc.fallingDrops) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(d.x - 1.3, d.y - 1.3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const pos = this.hoverPos || { x: this.width / 2 + 18, y: this.height / 2 - 42 };
      ctx.save();
      ctx.translate(pos.x, pos.y - 12);
      ctx.rotate(0.26);

      // Cannula in vetro trasparente della Pipetta Pasteur
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-2, 12);
      ctx.lineTo(-6, -38);
      ctx.lineTo(6, -38);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Liquido reagente dentro la pipetta
      ctx.fillStyle = 'rgba(56, 189, 248, 0.52)';
      ctx.beginPath();
      ctx.moveTo(-1.8, 10);
      ctx.lineTo(-4.5, -22);
      ctx.lineTo(4.5, -22);
      ctx.lineTo(1.8, 10);
      ctx.closePath();
      ctx.fill();

      // Tettarella / Bulbo in gomma siliconica azzurra (si schiaccia al clic!)
      const sq = 1 - this.proc.bulbSqueeze * 0.28;
      const bulbGrad = ctx.createRadialGradient(-3, -55, 2, 0, -54, 18);
      bulbGrad.addColorStop(0, '#7dd3fc');
      bulbGrad.addColorStop(0.6, '#0284c7');
      bulbGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = bulbGrad;
      ctx.beginPath();
      ctx.ellipse(0, -54, 11 * sq, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawForcepsCursor(ctx) {
      const pos = this.hoverPos || { x: this.width / 2 + 30, y: this.height / 2 - 20 };
      const codes = ['P', 'A', 'NV'];
      const code = codes[Math.min(2, this.proc.disksPlaced)];

      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Dischetto tenuto in punta
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(code, 0, 0);

      // Bracci della pinzetta inox
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(44, -68);
      ctx.moveTo(5, -5);
      ctx.lineTo(44, -68);
      ctx.stroke();

      ctx.restore();
    }

    // =========================================================================
    // PIASTRA PETRI (PRIMARIA, SELETTIVA & SEMINA INTERATTIVA)
    // =========================================================================
    getSterileAgarColors(mediumId, spec) {
      const map = {
        primary: { agar: '#dec88a', rim: '#a38945' },
        blood_agar: { agar: '#8d191e', rim: '#570c10' },
        macconkey: { agar: '#a84c68', rim: '#6e283f' },
        msa: { agar: '#c94a63', rim: '#85273a' },
        emb: { agar: '#4c1d4b', rim: '#2b0d2a' },
        xld: { agar: '#bf3b3b', rim: '#7a1f1f' },
        chocolate: { agar: '#5c331e', rim: '#3b1e10' },
        tcbs: { agar: '#1b6b63', rim: '#0e423d' },
        bile_esculin: { agar: '#9c7c44', rim: '#634d26' },
        cetrimide: { agar: '#cfd8cc', rim: '#8d998a' },
        lowenstein: { agar: '#4c956c', rim: '#2c5e43' }
      };
      return map[mediumId] || { agar: spec.agarColor, rim: spec.agarRimColor };
    }

    lerpHexColor(hexA, hexB, t) {
      if (!hexA || !hexB || !hexA.startsWith('#') || !hexB.startsWith('#')) return hexB || hexA;
      const u = Math.max(0, Math.min(1, t));
      const a = parseInt(hexA.slice(1), 16);
      const b = parseInt(hexB.slice(1), 16);
      const r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * u);
      const g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * u);
      const bl = Math.round((a & 255) + ((b & 255) - (a & 255)) * u);
      return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
    }

    drawPetriScene(ctx) {
      const cx = this.width / 2;
      const cy = this.height / 2 + (this.isUnderHood() ? 6 : 0);
      const R = Math.min(this.width, this.height) * 0.39;

      const isPrimary = this.activeView.type === 'primary';
      const spec = isPrimary
        ? {
            agarColor: '#dec88a',
            agarRimColor: '#a38945',
            growth: true,
            colonyColor: this.bacterium.primaryPlate.colonyColor,
            colonyHighlight: this.bacterium.primaryPlate.colonyHighlight,
            agarTint: this.bacterium.primaryPlate.agarTint,
            swarming: this.bacterium.primaryPlate.texture === 'swarming'
          }
        : this.activeView.petriSpec;

      const growthFactor =
        this.proc.active && !this.proc.completed ? this.proc.growthProgress : 1;

      const seedKey = isPrimary ? 'primary' : this.activeView.mediumId;
      const rng = mulberry32(this.roundSeed ^ hashString(seedKey));

      ctx.save();

      // Luce trasmessa dal transilluminatore oppure ombra realistica sul piano
      if (this.backlight) {
        const glow = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R * 1.2);
        glow.addColorStop(0, 'rgba(255, 252, 230, 0.95)');
        glow.addColorStop(0.75, 'rgba(125, 211, 252, 0.45)');
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.shadowColor = 'rgba(15, 23, 42, 0.36)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 9;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = 'transparent';
      }

      // Bordo esterno cristallino della piastra Petri
      const rimGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      rimGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.45)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 7, 0, Math.PI * 2);
      ctx.fill();

      // Area interna di Agar
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Interpolazione realistica: a 0h l'agar è nel suo colore sterile, e durante 0h->24h vira gradualmente!
      const sterilePair = this.getSterileAgarColors(seedKey, spec);
      const agarBase = this.lerpHexColor(sterilePair.agar, spec.agarColor, growthFactor);
      const agarRim = this.lerpHexColor(sterilePair.rim, spec.agarRimColor, growthFactor);

      const agarGrad = ctx.createRadialGradient(cx - R * 0.22, cy - R * 0.22, R * 0.08, cx, cy, R);
      agarGrad.addColorStop(0, this.brightenHex(agarBase, this.backlight ? 34 : 14));
      agarGrad.addColorStop(0.8, agarBase);
      agarGrad.addColorStop(1, agarRim);
      ctx.fillStyle = agarGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      if (spec.agarTint && growthFactor > 0.1) {
        ctx.save();
        ctx.globalAlpha = growthFactor;
        const pGrad = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.15, 10, cx, cy, R * 0.95);
        pGrad.addColorStop(0, spec.agarTint);
        pGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pGrad;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        ctx.restore();
      }

      const streakData = this.generateQuadrantStreaks(cx, cy, R * 0.84, rng);

      // Se è in corso la semina automatica o manuale sotto cappa BSL-2!
      if (this.proc.active && !this.proc.completed && !this.proc.incubating) {
        if (this.proc.kind === 'auto_streak') {
          const segs = streakData.lines;
          const totalLen = streakData.totalLen || 1;
          const u = Math.min(
            1,
            (this.proc.autoStreakTime || 0) / Math.max(0.1, this.proc.autoStreakDuration || 3.35)
          );

          const quadAngles = { 1: 0.72, 2: 0.56, 3: 0.84, 4: 0.68 };
          const firstSeg = segs[0] || { x1: cx - R * 0.5, y1: cy - R * 0.5, quad: 1 };
          const lastSeg = segs[segs.length - 1] || firstSeg;

          // FASE 1 (0.00 -> 0.11): Ingresso fluido dell'ansa sterile dal becher destro verso il Quadrante 1
          if (u < 0.11) {
            const eu = u / 0.11;
            const eased = 1 - Math.pow(1 - eu, 2.4);
            const startX = cx + R * 1.42;
            const startY = cy + R * 0.36;
            const curX = startX + (firstSeg.x1 - startX) * eased;
            const curY = startY + (firstSeg.y1 - startY) * eased;
            this.proc.autoLoopPos = {
              x: curX,
              y: curY,
              cx,
              cy,
              R,
              lifted: eu < 0.92,
              angle: 0.62 + 0.1 * eased
            };
          } else {
            // FASE 2 (0.11 -> 0.91): Striscio continuo a velocità fisica costante (arc-length) sui 4 quadranti
            const su = Math.min(1, (u - 0.11) / 0.8);
            const targetDist = su * totalLen;

            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            let tipPos = {
              x: lastSeg.x2,
              y: lastSeg.y2,
              lifted: false,
              quad: lastSeg.quad || 4
            };

            for (let i = 0; i < segs.length; i++) {
              const seg = segs[i];
              if (targetDist <= seg.cumStart) break;

              const segDone = Math.min(
                1,
                (targetDist - seg.cumStart) / Math.max(0.001, seg.len)
              );
              const ex = seg.x1 + (seg.x2 - seg.x1) * segDone;
              const ey = seg.y1 + (seg.y2 - seg.y1) * segDone;

              if (!seg.lifted) {
                // Solco micro-inciso e film lucido di inoculo lasciato dall'ansa sull'agar
                ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
                ctx.lineWidth = 3.8;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1 + 0.8);
                ctx.lineTo(ex, ey + 0.8);
                ctx.stroke();

                const wetAlpha = 0.34 + seg.density * 0.32;
                ctx.strokeStyle = `rgba(255, 255, 255, ${wetAlpha.toFixed(2)})`;
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(ex, ey);
                ctx.stroke();
              }

              if (segDone < 1 || i === segs.length - 1) {
                tipPos = {
                  x: ex,
                  y: ey,
                  lifted: !!seg.lifted,
                  quad: seg.quad || 1
                };
                if (segDone < 1) break;
              }
            }
            ctx.restore();

            // FASE 3 (0.91 -> 1.00): Uscita fluida della mano destra mentre la piastra resta seminata
            if (u > 0.91) {
              const xu = (u - 0.91) / 0.09;
              const easedOut = xu * xu;
              const outX = cx + R * 1.48;
              const outY = cy + R * 0.48;
              this.proc.autoLoopPos = {
                x: lastSeg.x2 + (outX - lastSeg.x2) * easedOut,
                y: lastSeg.y2 + (outY - lastSeg.y2) * easedOut,
                cx,
                cy,
                R,
                lifted: true,
                angle: 0.68
              };
            } else {
              const prevAngle =
                this.proc.autoLoopPos && typeof this.proc.autoLoopPos.angle === 'number'
                  ? this.proc.autoLoopPos.angle
                  : quadAngles[tipPos.quad] || 0.72;
              const desiredAngle = quadAngles[tipPos.quad] || 0.72;
              this.proc.autoLoopPos = {
                x: tipPos.x,
                y: tipPos.y,
                cx,
                cy,
                R,
                lifted: tipPos.lifted,
                angle: prevAngle + (desiredAngle - prevAngle) * 0.16
              };
            }
          }
        } else {
          // Fallback striscio manuale
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1.4;
          for (let i = 0; i < streakData.lines.length; i += 2) {
            const seg = streakData.lines[i];
            if (seg.lifted) continue;
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
          }
          ctx.restore();

          if (this.proc.streakPoints.length > 1) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(this.proc.streakPoints[0].x, this.proc.streakPoints[0].y);
            for (let i = 1; i < this.proc.streakPoints.length; i++) {
              ctx.lineTo(this.proc.streakPoints[i].x, this.proc.streakPoints[i].y);
            }
            ctx.stroke();
            ctx.restore();
          }
        }
      } else {
        // Tracce dell'ansa sull'agar: ben visibili a inizio incubazione (0h) e via via integrate a 24h
        const furrowAlpha = this.proc.incubating ? Math.max(0.16, 0.44 - growthFactor * 0.26) : 0.15;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${furrowAlpha.toFixed(2)})`;
        ctx.lineWidth = this.proc.incubating ? 2.1 : 1.4;
        ctx.lineCap = 'round';
        for (const seg of streakData.lines) {
          if (seg.lifted) continue;
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        }
        ctx.restore();

        if (spec.growth && growthFactor > 0.02) {
          ctx.save();
          if (spec.swarming) {
            ctx.save();
            ctx.globalAlpha = growthFactor;
            this.drawSwarmingWaves(ctx, cx - R * 0.35, cy - R * 0.35, R * growthFactor);
            ctx.restore();
          }

          if (spec.agarHaloColor) {
            ctx.save();
            ctx.globalAlpha = growthFactor;
            for (const col of streakData.colonies) {
              const hRad = col.r * 4.3 * growthFactor;
              const hg = ctx.createRadialGradient(col.x, col.y, col.r * 0.3, col.x, col.y, hRad);
              hg.addColorStop(0, spec.agarHaloColor);
              hg.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = hg;
              ctx.beginPath();
              ctx.arc(col.x, col.y, hRad, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          if (spec.hemolysis && spec.hemolysis !== 'gamma') {
            const haloMult = spec.narrowHalo ? 1.55 : spec.wideHalo ? 3.2 : 2.35;
            for (const col of streakData.colonies) {
              const hRad = Math.max(col.r + 2, col.r * haloMult) * growthFactor;
              const hg = ctx.createRadialGradient(col.x, col.y, col.r * 0.4 * growthFactor, col.x, col.y, hRad);
              if (spec.hemolysis === 'beta') {
                const alpha = (this.backlight ? 0.94 : 0.68) * growthFactor;
                hg.addColorStop(0, `rgba(248, 204, 112, ${alpha})`);
                hg.addColorStop(0.65, `rgba(232, 170, 75, ${alpha * 0.65})`);
                hg.addColorStop(1, 'rgba(141, 25, 30, 0)');
              } else if (spec.hemolysis === 'alpha') {
                const alpha = (this.backlight ? 0.9 : 0.74) * growthFactor;
                hg.addColorStop(0, `rgba(82, 130, 62, ${alpha})`);
                hg.addColorStop(0.7, `rgba(65, 105, 48, ${alpha * 0.55})`);
                hg.addColorStop(1, 'rgba(141, 25, 30, 0)');
              }
              ctx.fillStyle = hg;
              ctx.beginPath();
              ctx.arc(col.x, col.y, hRad, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          this.drawConfluentStreaks(ctx, streakData.lines, spec, growthFactor);

          for (const col of streakData.colonies) {
            this.drawSingleColony(
              ctx,
              { x: col.x, y: col.y, r: col.r * growthFactor },
              spec,
              rng
            );
          }
          ctx.restore();
        } else if (!spec.growth && growthFactor >= 1) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.76)';
          const bw = 264;
          const bh = 42;
          this.roundRect(ctx, cx - bw / 2, cy - bh / 2, bw, bh, 21);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 11.5px "Inter", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('∅ NESSUNA CRESCITA A 24h (CEPPO INIBITO)', cx, cy);
        }
      }

      // Riflesso bombato lucido "a bolla" del vetro Petri
      const glassShine = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.45, cy + R * 0.45);
      glassShine.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
      glassShine.addColorStop(0.28, 'rgba(255, 255, 255, 0.06)');
      glassShine.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glassShine;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 6.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    generateQuadrantStreaks(cx, cy, radius, rng) {
      const lines = [];
      const colonies = [];
      const baseR = this.bacterium.primaryPlate.colonyRadius || 3.8;

      const appendQuadrantZigZag = (passes, density, quad) => {
        let prevEnd = null;
        for (let i = 0; i < passes.length; i++) {
          const p = passes[i];
          const sx = i % 2 === 0 ? p.ax : p.bx;
          const sy = i % 2 === 0 ? p.ay : p.by;
          const ex = i % 2 === 0 ? p.bx : p.ax;
          const ey = i % 2 === 0 ? p.by : p.ay;

          if (prevEnd) {
            lines.push({
              x1: prevEnd.x,
              y1: prevEnd.y,
              x2: sx,
              y2: sy,
              density: density * 0.85,
              lifted: false,
              turnaround: true,
              quad
            });
          } else if (lines.length > 0) {
            const last = lines[lines.length - 1];
            lines.push({
              x1: last.x2,
              y1: last.y2,
              x2: sx,
              y2: sy,
              density: 0,
              lifted: true,
              turnaround: false,
              quad
            });
          }

          lines.push({
            x1: sx,
            y1: sy,
            x2: ex,
            y2: ey,
            density,
            lifted: false,
            turnaround: false,
            quad
          });
          prevEnd = { x: ex, y: ey };
        }
      };

      // QUADRANTE 1 (Alto-Sinistra, zig-zag serrato ad alta densità)
      const q1Passes = [];
      const q1Count = 9;
      for (let i = 0; i < q1Count; i++) {
        const t = i / (q1Count - 1);
        const ay = cy - radius * 0.78 + t * radius * 0.56;
        const ax = cx - radius * 0.66 + Math.sin(t * Math.PI) * -8 + (rng() - 0.5) * 6;
        const by = ay - radius * 0.15;
        const bx = cx - radius * 0.04 + (rng() - 0.5) * 12;
        q1Passes.push({ ax, ay, bx, by });

        for (let s = 0; s <= 6; s++) {
          if (rng() < 0.78) {
            const u = s / 6;
            colonies.push({
              x: ax + (bx - ax) * u + (rng() - 0.5) * 5,
              y: ay + (by - ay) * u + (rng() - 0.5) * 5,
              r: baseR * (0.62 + rng() * 0.3)
            });
          }
        }
      }
      appendQuadrantZigZag(q1Passes, 1.0, 1);

      // QUADRANTE 2 (Alto-Destra, intercetta il margine di Q1 per diluire la carica)
      const q2Passes = [];
      const q2Count = 7;
      for (let i = 0; i < q2Count; i++) {
        const t = i / (q2Count - 1);
        const ax = cx - (i < 2 ? radius * 0.08 : -radius * 0.06) + t * radius * 0.56;
        const ay = cy - radius * 0.72 + t * radius * 0.18;
        const bx = cx + radius * 0.18 + t * radius * 0.54;
        const by = cy - radius * 0.02 + (rng() - 0.5) * 14;
        q2Passes.push({ ax, ay, bx, by });

        for (let s = 0; s <= 5; s++) {
          if (rng() < 0.58) {
            const u = s / 5;
            colonies.push({
              x: ax + (bx - ax) * u + (rng() - 0.5) * 6,
              y: ay + (by - ay) * u + (rng() - 0.5) * 6,
              r: baseR * (0.75 + rng() * 0.32)
            });
          }
        }
      }
      appendQuadrantZigZag(q2Passes, 0.62, 2);

      // QUADRANTE 3 (Basso-Destra, striscio medio-largo)
      const q3Passes = [];
      const q3Count = 6;
      for (let i = 0; i < q3Count; i++) {
        const t = i / (q3Count - 1);
        const ax = cx + radius * 0.68 - t * radius * 0.22;
        const ay = cy + radius * 0.06 + t * radius * 0.56;
        const bx = cx + radius * 0.02 + (rng() - 0.5) * 10;
        const by = ay + radius * 0.06 + (rng() - 0.5) * 12;
        q3Passes.push({ ax, ay, bx, by });

        for (let s = 0; s < 3; s++) {
          if (rng() < 0.68) {
            const u = (s + 0.3) / 3;
            colonies.push({
              x: ax + (bx - ax) * u + (rng() - 0.5) * 7,
              y: ay + (by - ay) * u + (rng() - 0.5) * 7,
              r: baseR * (0.9 + rng() * 0.32)
            });
          }
        }
      }
      appendQuadrantZigZag(q3Passes, 0.28, 3);

      // QUADRANTE 4 (Basso-Sinistra -> Centro, serpentina ampia per singole colonie isolate!)
      const q4Passes = [];
      const q4Count = 5;
      for (let i = 0; i < q4Count; i++) {
        const t = i / (q4Count - 1);
        const ax = cx + (i === 0 ? radius * 0.06 : -radius * 0.1) - t * radius * 0.44;
        const ay = cy + radius * 0.64 - t * radius * 0.24;
        const bx = cx - radius * 0.58 + t * radius * 0.38;
        const by = cy + radius * 0.04 - t * radius * 0.14;
        q4Passes.push({ ax, ay, bx, by });

        const slots = 4;
        for (let s = 0; s < slots; s++) {
          if (rng() < 0.76) {
            const u = (s + 0.2 + rng() * 0.55) / slots;
            const ix = ax + (bx - ax) * u + (rng() - 0.5) * 7;
            const iy = ay + (by - ay) * u + (rng() - 0.5) * 7;
            let ok = true;
            for (const c of colonies) {
              if (Math.hypot(c.x - ix, c.y - iy) < baseR * 2.45) {
                ok = false;
                break;
              }
            }
            if (ok) {
              colonies.push({ x: ix, y: iy, r: baseR * (0.98 + rng() * 0.36) });
            }
          }
        }
      }
      appendQuadrantZigZag(q4Passes, 0.14, 4);

      // Parametrizzazione per lunghezza d'arco (velocità fisica uniforme senza scatti)
      let cum = 0;
      for (const seg of lines) {
        const d = Math.max(1, Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1));
        seg.cumStart = cum;
        seg.len = d;
        cum += d;
      }

      return { lines, colonies, totalLen: cum };
    }

    drawSwarmingWaves(ctx, ox, oy, plateR) {
      ctx.save();
      for (let w = 1; w <= 8; w++) {
        const rad = w * (plateR * 0.22);
        ctx.strokeStyle = 'rgba(235, 232, 220, 0.24)';
        ctx.lineWidth = plateR * 0.11;
        ctx.beginPath();
        ctx.arc(ox, oy, rad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ox, oy, rad + plateR * 0.055, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawConfluentStreaks(ctx, lines, spec, growthFactor) {
      ctx.save();
      ctx.lineCap = 'round';
      for (const seg of lines) {
        if (seg.lifted || seg.density < 0.4) continue;
        ctx.strokeStyle = spec.metallicSheen
          ? `rgba(34, 197, 94, ${0.65 * growthFactor})`
          : this.hexToRgba(spec.colonyColor || '#e2e8f0', seg.density * 0.65 * growthFactor);
        ctx.lineWidth = (seg.density > 0.8 ? 4.8 : 2.8) * growthFactor;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawSingleColony(ctx, col, spec, rng) {
      if (col.r < 0.3) return;
      let texture = this.bacterium.primaryPlate.texture;
      if (spec.mucoidOverride) texture = 'mucoid';
      if (spec.roughOverride) texture = 'rough';

      const color = spec.colonyColor || this.bacterium.primaryPlate.colonyColor;
      const r = texture === 'mucoid' ? col.r * 1.25 : col.r;

      ctx.save();
      ctx.translate(col.x, col.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.arc(0.7, 1.1, r, 0, Math.PI * 2);
      ctx.fill();

      if (spec.metallicSheen) {
        const mGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        mGrad.addColorStop(0, '#bbf7d0');
        mGrad.addColorStop(0.38, '#22c55e');
        mGrad.addColorStop(0.75, '#064e3b');
        mGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (texture === 'rough' || texture === 'frosted') {
        const lobes = texture === 'rough' ? 9 : 7;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i <= lobes * 2; i++) {
          const ang = (i / (lobes * 2)) * Math.PI * 2;
          const wobble = texture === 'rough' ? 0.76 + (i % 2) * 0.34 : 0.85 + Math.sin(i * 2.1) * 0.18;
          const px = Math.cos(ang) * r * wobble;
          const py = Math.sin(ang) * r * wobble;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        if (texture === 'rough') {
          ctx.fillStyle = 'rgba(255, 250, 235, 0.48)';
          for (let k = 0; k < 4; k++) {
            ctx.beginPath();
            ctx.arc((rng() - 0.5) * r * 0.8, (rng() - 0.5) * r * 0.8, r * 0.24, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        const cGrad = ctx.createRadialGradient(-r * 0.32, -r * 0.32, r * 0.08, 0, 0, r);
        cGrad.addColorStop(0, this.brightenHex(color, 35));
        cGrad.addColorStop(0.75, color);
        cGrad.addColorStop(1, this.brightenHex(color, -22));
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        if (texture === 'umbilicate') {
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.45)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = texture === 'mucoid' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.58)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.3, r * (texture === 'mucoid' ? 0.38 : 0.24), r * 0.16, -0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (spec.blackCenter) {
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.56, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(-r * 0.16, -r * 0.16, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawPetriLoupe(ctx) {
      if (!this.hoverPos) return;
      const cx = this.width / 2;
      const cy = this.height / 2 + (this.isUnderHood() ? 6 : 0);
      const R = Math.min(this.width, this.height) * 0.39;
      if (Math.hypot(this.hoverPos.x - cx, this.hoverPos.y - cy) > R + 8) return;

      const loupeR = 58;
      const zoom = 2.45;
      const lx = this.hoverPos.x;
      const ly = this.hoverPos.y;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.55)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(lx, ly, loupeR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.beginPath();
      ctx.arc(lx, ly, loupeR, 0, Math.PI * 2);
      ctx.clip();

      const srcW = (loupeR * 2) / zoom;
      const srcH = (loupeR * 2) / zoom;
      const srcX = (lx - srcW / 2) * this.dpr;
      const srcY = (ly - srcH / 2) * this.dpr;

      ctx.drawImage(
        this.offscreen,
        srcX,
        srcY,
        srcW * this.dpr,
        srcH * this.dpr,
        lx - loupeR,
        ly - loupeR,
        loupeR * 2,
        loupeR * 2
      );

      ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx - 12, ly);
      ctx.lineTo(lx + 12, ly);
      ctx.moveTo(lx, ly - 12);
      ctx.lineTo(lx, ly + 12);
      ctx.stroke();
      ctx.restore();

      // Ghiera lucida a bolla della lente 5×
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(lx, ly, loupeR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(lx, ly, loupeR + 1.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#0369a1';
      this.roundRect(ctx, lx - 26, ly + loupeR - 11, 52, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LENTE 5×', lx, ly + loupeR - 2);
      ctx.restore();
    }

    // =========================================================================
    // MICROSCOPIO OTTICO (MICROGRAFIE SCIENTIFICHE REALI IN MODALITÀ REALISTICA!)
    // =========================================================================
    getMicrographEntry(src) {
      if (!src) return null;
      if (this.micrographCache.has(src)) {
        return this.micrographCache.get(src);
      }
      const img = new Image();
      const entry = { img, loaded: false, error: false, src };
      img.onload = () => {
        entry.loaded = true;
        if (!this.needsAnimationLoop()) {
          this.render();
        }
      };
      img.onerror = () => {
        entry.error = true;
        if (!this.needsAnimationLoop()) {
          this.render();
        }
      };
      img.src = src;
      this.micrographCache.set(src, entry);
      return entry;
    }

    resolveRealMicrographSpec(bacterium, mode) {
      const id = bacterium.id;
      const m = bacterium.microscopy || {};
      const key = m.micrographKey || (id === 'mycobacterium_tuberculosis' ? 'mycobacterium_tuberculosis_ziehl' : `${id}_gram`);
      const baseGramSrc = `assets/micrographs/${key}.jpg`;

      if (mode === 'gram') {
        if (id === 'mycobacterium_tuberculosis' || id === 'mycobacterium_avium' || id === 'mycobacterium_kansasii') {
          return {
            src: 'assets/micrographs/mycobacterium_tuberculosis_ziehl.jpg',
            stainFilter: 'saturate(0.22) brightness(1.16) contrast(0.76)',
            washColor: 'rgba(248, 246, 242, 0.22)',
            darkField: false
          };
        }
        if (id === 'helicobacter_pylori' || id === 'campylobacter_jejuni') {
          return {
            src: baseGramSrc,
            stainFilter: 'hue-rotate(128deg) saturate(1.18) contrast(1.06)',
            washColor: null,
            darkField: false
          };
        }
        return {
          src: baseGramSrc,
          stainFilter: '',
          washColor: null,
          darkField: false
        };
      }

      if (mode === 'ziehl') {
        if (m.acidFast) {
          return {
            src: 'assets/micrographs/mycobacterium_tuberculosis_ziehl.jpg',
            stainFilter: 'saturate(1.12) contrast(1.05)',
            washColor: null,
            darkField: false
          };
        }
        return {
          src: 'assets/micrographs/ziehl_neg_blue.jpg',
          stainFilter: '',
          washColor: 'rgba(37, 99, 235, 0.08)',
          darkField: false
        };
      }

      if (mode === 'spores') {
        if (m.spores && m.spores.present) {
          if (bacterium.genus === 'Clostridium' || id.includes('clostridium')) {
            return {
              src: 'assets/micrographs/spores_clostridium_pos.png',
              stainFilter: 'saturate(1.08) contrast(1.05)',
              washColor: null,
              darkField: false
            };
          }
          return {
            src: 'assets/micrographs/spores_schaeffer_pos.jpg',
            stainFilter: 'saturate(1.12) contrast(1.05)',
            washColor: null,
            darkField: false
          };
        }
        // Specie asporigene: sole forme vegetative reali colorate dalla safranina di contrasto
        let sFilter = 'saturate(1.06)';
        if (m.acidFast) {
          sFilter = 'saturate(0.55) brightness(1.06)';
        } else if (id === 'helicobacter_pylori' || id === 'campylobacter_jejuni') {
          sFilter = 'hue-rotate(128deg) saturate(1.16)';
        } else if (m.gram === 'pos') {
          sFilter = 'hue-rotate(68deg) saturate(1.15)';
        }
        return {
          src: baseGramSrc,
          stainFilter: sFilter,
          washColor: 'rgba(244, 63, 94, 0.05)',
          darkField: false
        };
      }

      // mode === 'capsule': Capsula & Esame a Fresco in Goccia Pendente
      if (m.capsule) {
        if (id.includes('klebsiella') || id === 'streptococcus_pneumoniae') {
          return {
            src: 'assets/micrographs/capsule_india_ink.jpg',
            stainFilter: 'contrast(1.08)',
            washColor: null,
            darkField: true
          };
        }
        return {
          src: 'assets/micrographs/capsule_stain_pos.jpg',
          stainFilter: 'contrast(1.06)',
          washColor: null,
          darkField: false
        };
      }

      // Specie acapsulate a fresco: ottica reale a contrasto di fase (stile FIGURA 25)
      return {
        src: baseGramSrc,
        stainFilter: 'grayscale(0.88) contrast(1.2) brightness(0.95)',
        washColor: 'rgba(186, 230, 253, 0.14)',
        darkField: false
      };
    }

    drawRealMicrographField(ctx, cx, cy, R, mode, blurPx, brightPct) {
      const spec = this.resolveRealMicrographSpec(this.bacterium, mode);
      const entry = this.getMicrographEntry(spec.src);

      if (!entry || (!entry.loaded && !entry.error)) {
        ctx.fillStyle = '#334155';
        ctx.font = '700 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Caricamento preparato microscopico reale...', cx, cy);
        return spec.darkField;
      }

      if (entry.error || !entry.img.naturalWidth) {
        ctx.fillStyle = '#be123c';
        ctx.font = '700 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Impossibile leggere il vetrino ottico.', cx, cy);
        return false;
      }

      const img = entry.img;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      // Ingrandimento reale sugli obiettivi ISO (10x panoramico -> 40x -> 100x immersione ad olio)
      const photoZoom =
        this.objective === '100x' ? 2.28 : this.objective === '40x' ? 1.56 : 1.04;
      const extraLowNA = this.objective === '10x' ? 0.45 : this.objective === '40x' ? 0.15 : 0;
      const totalBlur = blurPx + extraLowNA;

      const baseBox = (R + 122) * 2;
      const coverScale = Math.max(baseBox / iw, baseBox / ih) * photoZoom;
      const drawW = iw * coverScale;
      const drawH = ih * coverScale;

      const t = this.liveClock || 0;
      const mot = this.bacterium.microscopy.motility;
      const isWetMount = mode === 'capsule';

      let dx1 = 0;
      let dy1 = 0;
      let rot1 = 0;
      let dx2 = 0;
      let dy2 = 0;
      let rot2 = Math.PI;

      if (isWetMount) {
        // Dinamica biologica reale in goccia pendente (senza disegnare alcun batterio sintetico!)
        if (mot === 'immobile') {
          // Moto browniano termico puro sul posto + lenta convezione del menisco liquido
          dx1 = Math.sin(t * 18.5) * 0.85 + Math.cos(t * 26.3) * 0.5 + Math.sin(t * 0.55) * 2.2;
          dy1 = Math.cos(t * 20.9) * 0.85 + Math.sin(t * 23.7) * 0.5 + Math.cos(t * 0.48) * 1.9;
          dx2 = Math.cos(t * 17.1) * 0.9 - Math.sin(t * 0.62) * 2.6;
          dy2 = Math.sin(t * 19.4) * 0.9 + Math.cos(t * 0.52) * 2.4;
        } else if (mot === 'darting') {
          // Motilità rapida "a freccia" (Vibrio, Helicobacter, Pseudomonas)
          dx1 = Math.sin(t * 3.3) * 14.5 + Math.sin(t * 7.7) * 5.2;
          dy1 = Math.cos(t * 2.8) * 12.0 + Math.cos(t * 8.1) * 5.0;
          dx2 = Math.cos(t * 2.9) * 16.0 - Math.sin(t * 6.9) * 5.8;
          dy2 = -Math.sin(t * 3.5) * 13.5 + Math.cos(t * 7.3) * 4.8;
        } else if (mot === 'tumbling') {
          // Motilità "a capriola" caratteristica di Listeria monocytogenes
          rot1 = Math.sin(t * 2.5) * 0.065;
          dx1 = Math.sin(t * 1.85) * 9.5;
          dy1 = Math.cos(t * 2.25) * 8.5;
          rot2 = Math.PI - Math.cos(t * 2.3) * 0.075;
          dx2 = -Math.cos(t * 1.95) * 10.5;
          dy2 = Math.sin(t * 2.1) * 9.0;
        } else if (mot === 'swarming') {
          // Sciamatura vigorosa coordinata (Proteus mirabilis)
          dx1 = Math.sin(t * 2.4) * 13.5;
          dy1 = Math.sin(t * 1.75) * 10.0;
          dx2 = -Math.sin(t * 2.15) * 14.0;
          dy2 = Math.cos(t * 1.9) * 11.0;
        } else {
          // Motilità flagellare peritrica (E. coli, Salmonella, Serratia, Bacillus, Clostridium)
          dx1 = Math.sin(t * 2.05) * 10.8 + Math.cos(t * 4.6) * 3.4;
          dy1 = Math.cos(t * 1.7) * 9.6 + Math.sin(t * 4.2) * 3.2;
          dx2 = -Math.cos(t * 1.9) * 11.5 + Math.sin(t * 4.1) * 3.6;
          dy2 = -Math.sin(t * 2.2) * 10.2 + Math.cos(t * 3.9) * 3.4;
        }
      } else if (this.objective === '100x') {
        // Lievissimo respiro fluido dell'olio da immersione Cedro ad alto ingrandimento 1000x
        dx1 = Math.sin(t * 1.1) * 0.55;
        dy1 = Math.cos(t * 0.85) * 0.48;
      }

      const buildFilterStr = (bPx) => {
        const parts = [];
        if (spec.stainFilter) parts.push(spec.stainFilter);
        if (bPx > 0.12) parts.push(`blur(${Math.min(12, bPx).toFixed(2)}px)`);
        if (Math.abs(brightPct - 100) > 1.5) parts.push(`brightness(${brightPct}%)`);
        return parts.length > 0 ? parts.join(' ') : 'none';
      };

      // Piano focale primario del preparato reale
      ctx.save();
      ctx.filter = buildFilterStr(totalBlur);
      ctx.translate(cx + this.panX + dx1, cy + this.panY + dy1);
      if (rot1 !== 0) ctx.rotate(rot1);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Secondo piano focale ottico reale (profondità di campo viva nella goccia pendente)
      if (isWetMount) {
        ctx.save();
        ctx.globalCompositeOperation = spec.darkField ? 'lighter' : 'multiply';
        ctx.globalAlpha = mot === 'immobile' ? 0.18 : 0.3;
        ctx.filter = buildFilterStr(totalBlur + 1.5);
        ctx.translate(cx + this.panX * 1.08 + dx2, cy + this.panY * 1.08 + dy2);
        ctx.rotate(rot2);
        ctx.drawImage(img, -drawW * 0.52, -drawH * 0.52, drawW * 1.04, drawH * 1.04);
        ctx.restore();
      } else if (totalBlur > 1.8) {
        // Lieve dispersione cromatica di Abbe quando il vetrino è fuori fuoco
        ctx.save();
        ctx.globalAlpha = Math.min(0.2, totalBlur * 0.022);
        ctx.filter = buildFilterStr(totalBlur + 1.2);
        ctx.translate(cx + this.panX + 2.4, cy + this.panY - 1.8);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      ctx.filter = 'none';

      // Velatura ottica del controcolorante / condensatore a contrasto di fase
      if (spec.washColor) {
        ctx.save();
        ctx.fillStyle = spec.washColor;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        ctx.restore();
      }

      // Micro-rifrazione del menisco liquido / olio da immersione
      if (this.objective === '100x' || isWetMount) {
        const oilGlow = ctx.createRadialGradient(
          cx - R * 0.28 + Math.sin(t * 0.8) * 6,
          cy - R * 0.28 + Math.cos(t * 0.7) * 6,
          R * 0.05,
          cx,
          cy,
          R
        );
        oilGlow.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
        oilGlow.addColorStop(0.65, 'rgba(255, 255, 255, 0)');
        oilGlow.addColorStop(1, 'rgba(14, 116, 144, 0.08)');
        ctx.fillStyle = oilGlow;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      }

      return spec.darkField;
    }

    drawMicroscopeScene(ctx) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      const R = Math.min(this.width, this.height) * 0.42;
      const mode = this.activeView.stainMode;
      const m = this.bacterium.microscopy;

      // Corpo scuro dello stativo binoculare attorno all'oculare
      const bodyGrad = ctx.createRadialGradient(
        cx,
        cy,
        R * 0.85,
        cx,
        cy,
        Math.max(this.width, this.height) * 0.72
      );
      bodyGrad.addColorStop(0, '#1e293b');
      bodyGrad.addColorStop(1, '#09101d');
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Caso vetrino ancora non selezionato (apertura diretta del Microscopio 3D prima di una colorazione)
      if (!mode || mode === 'none') {
        const emptyGrad = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R);
        emptyGrad.addColorStop(0, '#f8fafc');
        emptyGrad.addColorStop(0.82, '#e2e8f0');
        emptyGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = emptyGrad;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

        // Reticolo ottico di centratura sul vetrino neutro
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - R * 0.65, cy);
        ctx.lineTo(cx + R * 0.65, cy);
        ctx.moveTo(cx, cy - R * 0.65);
        ctx.lineTo(cx, cy + R * 0.65);
        ctx.stroke();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        this.roundRect(ctx, cx - 150, cy - 32, 300, 64, 18);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔬 Nessun vetrino colorato sul tavolino', cx, cy - 9);
        ctx.fillStyle = '#bae6fd';
        ctx.font = '600 10.5px "Inter", sans-serif';
        ctx.fillText('Scegli una colorazione nella barra qui sopra!', cx, cy + 12);

        ctx.restore();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 2.5, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      let bgCenter = '#f8f6f2';
      let bgEdge = '#dedad0';
      if (mode === 'ziehl') {
        bgCenter = '#eff6ff';
        bgEdge = '#cfe2ff';
      } else if (mode === 'capsule' && !this.realisticMode) {
        bgCenter = '#232733';
        bgEdge = '#10131a';
      }

      const fieldGrad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
      fieldGrad.addColorStop(0, bgCenter);
      fieldGrad.addColorStop(0.85, bgCenter);
      fieldGrad.addColorStop(1, bgEdge);
      ctx.fillStyle = fieldGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      const blurPx = this.getEffectiveBlur();
      const brightPct = this.condenser;
      let isDarkFieldHUD = mode === 'capsule' && !this.realisticMode;

      // =====================================================================
      // SCELTA RIGOROSA:
      // - MODALITÀ REALISTICA ON  -> VERE MICROGRAFIE SCIENTIFICHE + OTTICA VIVA (ZERO BATTERI ARTIFICIALI!)
      // - MODALITÀ REALISTICA OFF -> DISEGNO PROCEDURALE VELOCE CLASSICO
      // =====================================================================
      if (this.realisticMode) {
        isDarkFieldHUD = this.drawRealMicrographField(ctx, cx, cy, R, mode, blurPx, brightPct);
      } else {
        const filters = [];
        if (blurPx > 0.14) filters.push(`blur(${Math.min(11, blurPx).toFixed(2)}px)`);
        if (Math.abs(brightPct - 100) > 2) filters.push(`brightness(${brightPct}%)`);
        if (filters.length > 0) {
          ctx.filter = filters.join(' ');
        }

        const magScale = this.objective === '100x' ? 1.0 : this.objective === '40x' ? 0.44 : 0.18;

        ctx.save();
        ctx.translate(cx + this.panX, cy + this.panY);
        ctx.scale(magScale, magScale);
        ctx.translate(-cx, -cy);

        const rng = mulberry32(this.roundSeed ^ hashString(mode));
        if (mode === 'capsule') {
          this.drawCapsuleWetMountCells(ctx, m);
        } else {
          this.drawFixedStainedCells(ctx, cx, cy, R * 1.45, m, mode, rng);
        }
        ctx.restore();
        ctx.filter = 'none';
      }

      // Vignettatura ottica naturale della lente dell'oculare
      const vig = ctx.createRadialGradient(cx, cy, R * 0.76, cx, cy, R);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = vig;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Reticolo micrometrico e informazioni ottiche nell'oculare
      const hudColor = isDarkFieldHUD ? '#f8fafc' : '#0f172a';
      const hudBg = isDarkFieldHUD ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.68)';
      const totalMag =
        this.objective === '100x' ? '1000× Olio' : this.objective === '40x' ? '400×' : '100×';
      const barW = 48;
      const bx = cx - barW / 2;
      const by = cy + R * 0.73;

      ctx.fillStyle = hudBg;
      this.roundRect(ctx, cx - 76, by - 8, 152, 29, 10);
      ctx.fill();

      ctx.strokeStyle = hudColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + barW, by);
      ctx.moveTo(bx, by - 3.5);
      ctx.lineTo(bx, by + 3.5);
      ctx.moveTo(bx + barW, by - 3.5);
      ctx.lineTo(bx + barW, by + 3.5);
      ctx.stroke();

      ctx.fillStyle = hudColor;
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${this.objective === '100x' ? '10 µm' : this.objective === '40x' ? '25 µm' : '100 µm'} · ${totalMag}`,
        cx,
        by + 14
      );

      // Coordinate verniero del tavolino traslatore X/Y
      const mmX = (14.0 - this.panX * 0.04).toFixed(1);
      const mmY = (8.5 - this.panY * 0.04).toFixed(1);
      ctx.fillStyle = hudBg;
      this.roundRect(ctx, cx - 58, cy - R * 0.87, 116, 18, 9);
      ctx.fill();
      ctx.fillStyle = hudColor;
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      ctx.fillText(`X:${mmX} Y:${mmY} mm`, cx, cy - R * 0.87 + 12);

      ctx.restore();

      // Anello cromato esterno dell'oculare con indicatore di messa a fuoco
      const inFocus = blurPx < 0.55 && this.objective === '100x';
      ctx.strokeStyle = inFocus ? '#10b981' : '#64748b';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    getStainCellColor(m, mode) {
      if (mode === 'gram') {
        if (m.gram === 'pos') return '#4c1d95';
        if (m.gram === 'neg') return '#e11d68';
        return '#8b5ca6';
      }
      if (mode === 'ziehl') {
        return m.acidFast ? '#dc004e' : '#2563eb';
      }
      if (mode === 'spores') {
        return '#e04f6d';
      }
      return '#f8fafc';
    }

    drawFixedStainedCells(ctx, cx, cy, maxR, m, mode, rng) {
      const cellColor = this.getStainCellColor(m, mode);

      if (mode === 'ziehl') {
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.14)';
        ctx.lineWidth = 6;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          const sx = cx + (rng() - 0.5) * maxR;
          const sy = cy + (rng() - 0.5) * maxR;
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(sx + 40, sy - 25, sx + 80, sy + 15);
          ctx.stroke();
        }
      }

      if (m.arrangement === 'clusters') {
        for (let g = 0; g < 18; g++) {
          const ang = rng() * Math.PI * 2;
          const dist = Math.sqrt(rng()) * (maxR - 26);
          const gx = cx + Math.cos(ang) * dist;
          const gy = cy + Math.sin(ang) * dist;
          const count = 8 + Math.floor(rng() * 11);
          for (let k = 0; k < count; k++) {
            this.drawSingleBacteriumBody(
              ctx,
              gx + (rng() - 0.5) * 24,
              gy + (rng() - 0.5) * 24,
              0,
              m,
              mode,
              cellColor
            );
          }
        }
      } else if (m.arrangement === 'chains') {
        for (let c = 0; c < 15; c++) {
          let x = cx + (rng() - 0.5) * maxR * 1.2;
          let y = cy + (rng() - 0.5) * maxR * 1.2;
          let dir = rng() * Math.PI * 2;
          const len = 8 + Math.floor(rng() * 7);
          for (let k = 0; k < len; k++) {
            this.drawSingleBacteriumBody(ctx, x, y, dir, m, mode, cellColor);
            dir += (rng() - 0.5) * 0.58;
            x += Math.cos(dir) * 7.8;
            y += Math.sin(dir) * 7.8;
          }
        }
      } else if (m.arrangement === 'chains_rods') {
        for (let c = 0; c < 13; c++) {
          let x = cx + (rng() - 0.5) * maxR * 1.15;
          let y = cy + (rng() - 0.5) * maxR * 1.15;
          let dir = rng() * Math.PI * 2;
          const len = 3 + Math.floor(rng() * 4);
          for (let k = 0; k < len; k++) {
            this.drawSingleBacteriumBody(ctx, x, y, dir, m, mode, cellColor);
            dir += (rng() - 0.5) * 0.24;
            x += Math.cos(dir) * 21;
            y += Math.sin(dir) * 21;
          }
        }
      } else if (m.arrangement === 'cords') {
        for (let c = 0; c < 15; c++) {
          const bx = cx + (rng() - 0.5) * maxR * 1.2;
          const by = cy + (rng() - 0.5) * maxR * 1.2;
          const baseDir = rng() * Math.PI * 2;
          for (let k = 0; k < 7; k++) {
            const px = bx + Math.cos(baseDir) * (k - 3) * 8 + (rng() - 0.5) * 5;
            const py = by + Math.sin(baseDir) * (k - 3) * 8 + (rng() - 0.5) * 5;
            this.drawSingleBacteriumBody(ctx, px, py, baseDir + (rng() - 0.5) * 0.2, m, mode, cellColor);
          }
        }
      } else {
        const total = m.arrangement === 'pairs' ? 46 : 64;
        for (let i = 0; i < total; i++) {
          const ang = rng() * Math.PI * 2;
          const dist = Math.sqrt(rng()) * (maxR - 16);
          this.drawSingleBacteriumBody(
            ctx,
            cx + Math.cos(ang) * dist,
            cy + Math.sin(ang) * dist,
            rng() * Math.PI * 2,
            m,
            mode,
            cellColor
          );
        }
      }
    }

    drawCapsuleWetMountCells(ctx, m) {
      for (const c of this.motileCells) {
        if (m.capsule) {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.angle);
          const haloW = (m.shape && (m.shape.includes('rods') || m.shape.includes('bacill'))) ? 17 : 13;
          const hg = ctx.createRadialGradient(0, 0, 2, 0, 0, haloW);
          hg.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
          hg.addColorStop(0.68, 'rgba(226, 232, 240, 0.85)');
          hg.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.ellipse(0, 0, haloW, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        this.drawSingleBacteriumBody(ctx, c.x, c.y, c.angle, m, 'capsule', '#94a3b8');
      }
    }

    drawSingleBacteriumBody(ctx, x, y, angle, m, mode, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      const hasSpores = Boolean(m.spores && (m.spores.present === true || m.spores === true));
      const sporePos = (m.spores && m.spores.position) || 'central';

      switch (m.shape) {
        case 'cocci':
          if (m.arrangement === 'pairs') {
            ctx.beginPath();
            ctx.arc(-3.6, 0, 3.6, 0, Math.PI * 2);
            ctx.arc(3.6, 0, 3.6, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;

        case 'diplococci_lancet':
          [-4.3, 4.3].forEach((ox, idx) => {
            ctx.beginPath();
            ctx.ellipse(ox, 0, 4.3, 2.9, idx === 0 ? 0.12 : -0.12, 0, Math.PI * 2);
            ctx.fill();
          });
          break;

        case 'diplococci':
        case 'diplococci_bean':
          ctx.beginPath();
          ctx.ellipse(-2.9, 0, 2.5, 4.2, 0, 0, Math.PI * 2);
          ctx.ellipse(2.9, 0, 2.5, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'coccobacilli':
          this.roundRect(ctx, -4.5, -2.8, 9, 5.6, 2.8);
          ctx.fill();
          break;

        case 'rods':
        case 'bacilli':
          this.roundRect(ctx, -7.5, -2.7, 15, 5.4, 2.7);
          ctx.fill();
          if (mode === 'spores' && hasSpores) {
            const sx = sporePos === 'subterminal' ? 4.2 : sporePos === 'terminal' ? 5.2 : 0;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.ellipse(sx, 0, 3.6, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ecfdf5';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
          break;

        case 'large_rods':
          this.roundRect(ctx, -9.5, -3.3, 19, 6.6, 1.6);
          ctx.fill();
          if (mode === 'spores' && hasSpores) {
            const sx = sporePos === 'subterminal' ? 4.5 : sporePos === 'terminal' ? 6.0 : 0;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.ellipse(sx, 0, 3.8, 2.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ecfdf5';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
          break;

        case 'curved_comma':
          ctx.lineWidth = 4.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, 6.5, 8.5, -Math.PI * 0.78, -Math.PI * 0.22);
          ctx.stroke();
          break;

        case 'spiral':
        case 'spirals':
          ctx.lineWidth = 3.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-9, 2);
          ctx.bezierCurveTo(-3, -6, 3, 6, 9, -2);
          ctx.stroke();
          break;

        case 'filamentous':
          ctx.lineWidth = 2.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-13, 3);
          ctx.quadraticCurveTo(-3, -5, 6, 2);
          ctx.lineTo(13, -1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-1, -1);
          ctx.lineTo(4, -7);
          ctx.stroke();
          break;

        default:
          if (m.shape && (m.shape.includes('cocc') || m.shape.includes('glob'))) {
            ctx.beginPath();
            ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            this.roundRect(ctx, -7.5, -2.7, 15, 5.4, 2.7);
            ctx.fill();
          }
          break;
      }
      ctx.restore();
    }

    // =========================================================================
    // TEST BIOCHIMICI SU VETRINO E PROVETTA (INTERATTIVI & STANDARD)
    // =========================================================================
    drawBiochemScene(ctx) {
      const mode = this.activeView.biochemMode;
      const cx = this.width / 2;
      const cy = this.height / 2 + (this.isUnderHood() ? 8 : 0);

      if (mode === 'peroxidase') {
        this.drawPeroxidaseSlide(ctx, cx, cy, this.activeView.pos);
      } else if (mode === 'oxidase') {
        this.drawOxidaseStrip(ctx, cx, cy, this.activeView.pos);
      } else if (mode === 'coagulase') {
        this.drawCoagulaseTube(ctx, cx, cy, this.activeView.pos);
      } else if (mode === 'urease') {
        this.drawUreaseTube(ctx, cx, cy, this.activeView.ureaseState);
      } else if (mode === 'indole_oxygen') {
        this.drawIndoleAndOxygenTubes(ctx, cx, cy, this.activeView.indole, this.activeView.oxygen);
      } else if (mode === 'disks') {
        this.drawDiagnosticDisks(ctx, cx, cy, this.activeView.disks);
      }
    }

    drawPeroxidaseSlide(ctx, cx, cy, pos) {
      const sw = Math.min(340, this.width * 0.8);
      const sh = 126;
      const dropsRatio = this.proc.completed ? 1 : this.proc.dropsAdded / Math.max(1, this.proc.dropsRequired);

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 7;
      const glassGrad = ctx.createLinearGradient(cx - sw / 2, cy - sh / 2, cx + sw / 2, cy + sh / 2);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
      glassGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.55)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.82)');
      ctx.fillStyle = glassGrad;
      this.roundRect(ctx, cx - sw / 2, cy - sh / 2, sw, sh, 12);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etichetta smerigliata
      ctx.fillStyle = '#0284c7';
      this.roundRect(ctx, cx - sw / 2 + 10, cy - sh / 2 + 10, 58, sh - 20, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('H₂O₂', cx - sw / 2 + 39, cy - 6);
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText('3%', cx - sw / 2 + 39, cy + 12);

      const dropX = cx + 22;

      // Patina batterica spalmata sul vetrino
      ctx.fillStyle = 'rgba(248, 250, 252, 0.88)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(dropX, cy + 2, 30, 16, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Goccia di perossido di idrogeno (cresce ad ogni goccia versata con la pipetta!)
      if (dropsRatio > 0) {
        const rx = 28 + 48 * dropsRatio;
        const ry = 18 + 26 * dropsRatio;
        const dropGrad = ctx.createRadialGradient(dropX - 12, cy - 8, 4, dropX, cy, rx);
        dropGrad.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
        dropGrad.addColorStop(0.65, 'rgba(125, 211, 252, 0.42)');
        dropGrad.addColorStop(1, 'rgba(2, 132, 199, 0.16)');
        ctx.fillStyle = dropGrad;
        ctx.beginPath();
        ctx.ellipse(dropX, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (pos && dropsRatio > 0) {
        const visibleCount = Math.floor(this.bubbles.length * dropsRatio);
        for (let i = 0; i < visibleCount; i++) {
          const b = this.bubbles[i];
          const alpha = Math.max(0, 1 - b.life / b.maxLife);
          ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.85})`;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(b.x + 22, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      if (this.proc.completed) {
        this.drawCanvasStatusPill(
          ctx,
          cx,
          cy + sh / 2 + 28,
          pos
            ? '🫧 Effervescenza immediata O₂ — PEROSSIDASI / CATALASI (+)'
            : 'Nessuna bolla rilevata — PEROSSIDASI / CATALASI (−)',
          pos ? '#059669' : '#475569'
        );
      }
      ctx.restore();
    }

    drawOxidaseStrip(ctx, cx, cy, pos) {
      const sw = 276;
      const sh = 68;
      const prog = this.proc.completed ? 1 : this.proc.reactionProgress;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, cx - sw / 2, cy - sh / 2, sw, sh, 12);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      this.roundRect(ctx, cx + 18, cy - sh / 2 + 8, 98, sh - 16, 8);
      ctx.fill();

      const spotX = cx + 67;
      if (this.proc.completed || this.proc.dropsAdded > 0) {
        const rg = ctx.createRadialGradient(spotX, cy, 3, spotX, cy, 28);
        if (pos && prog > 0.05) {
          rg.addColorStop(0, `rgba(59, 7, 100, ${prog})`);
          rg.addColorStop(0.55, `rgba(109, 40, 217, ${prog * 0.9})`);
          rg.addColorStop(1, 'rgba(139, 92, 246, 0)');
        } else {
          rg.addColorStop(0, 'rgba(148, 163, 184, 0.55)');
          rg.addColorStop(1, 'rgba(226, 232, 240, 0)');
        }
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(spotX, cy, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#0f2942';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('OXIDASE STRIP', cx - sw / 2 + 18, cy - 4);
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('TMPD Reattivo Kovacs', cx - sw / 2 + 18, cy + 13);

      if (this.proc.completed) {
        this.drawCanvasStatusPill(
          ctx,
          cx,
          cy + sh / 2 + 32,
          pos ? '🟣 Viraggio viola indofenolo (<10 s) — OSSIDASI (+)' : 'Assenza di viraggio — OSSIDASI (−)',
          pos ? '#6d28d9' : '#475569'
        );
      }
      ctx.restore();
    }

    drawCoagulaseTube(ctx, cx, cy, pos) {
      const tilt = this.proc.completed ? this.proc.tubeTilt : -0.06;
      ctx.save();
      ctx.translate(cx, cy - 8);
      ctx.rotate(tilt);

      const tw = 216;
      const th = 48;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      this.roundRect(ctx, -tw / 2, -th / 2, tw, th, 24);
      ctx.fill();

      ctx.save();
      this.roundRect(ctx, -tw / 2 + 3, -th / 2 + 3, tw - 6, th - 6, 21);
      ctx.clip();

      if (pos && this.proc.completed) {
        const g = ctx.createLinearGradient(-tw / 2, 0, 18, 0);
        g.addColorStop(0, '#d97706');
        g.addColorStop(0.85, '#fbbf24');
        g.addColorStop(1, '#fef3c7');
        ctx.fillStyle = g;
        ctx.fillRect(-tw / 2, -th / 2, tw * 0.56, th);
      } else {
        ctx.rotate(-tilt);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.62)';
        ctx.fillRect(-160, 4, 320, 90);
      }
      ctx.restore();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4;
      this.roundRect(ctx, -tw / 2, -th / 2, tw, th, 24);
      ctx.stroke();
      ctx.restore();

      if (this.proc.completed) {
        this.drawCanvasStatusPill(
          ctx,
          cx,
          cy + 74,
          pos
            ? '🩸 Coagulo solido di fibrina (clicca per inclinare la provetta!) — COAGULASI (+)'
            : 'Plasma liquido scorrevole (clicca per inclinare la provetta!) — COAGULASI (−)',
          pos ? '#b45309' : '#475569'
        );
      }
    }

    drawUreaseTube(ctx, cx, cy, state) {
      const prog = this.proc.completed ? 1 : this.proc.reactionProgress;
      let color = '#e59838';
      if (prog > 0.2 && state !== 'neg') {
        color = state === 'strong_pos' ? '#ec007c' : '#f43f8e';
      }
      this.drawVerticalTube(ctx, cx, cy - 12, 58, 174, color, null, 'Brodo Urea di Christensen');

      if (this.proc.completed) {
        this.drawCanvasStatusPill(
          ctx,
          cx,
          cy + 104,
          state === 'strong_pos'
            ? '🩷 Viraggio lampo FUCSIA INTENSO — Ureasi (+++)'
            : state === 'pos'
            ? '🩷 Viraggio rosa-fucsia alcalino — Ureasi (+)'
            : 'Giallo-pesca invariato — Ureasi (−)',
          state !== 'neg' ? '#be185d' : '#475569'
        );
      }
    }

    drawIndoleAndOxygenTubes(ctx, cx, cy, indolePos, oxygenMode) {
      const showRing = this.proc.completed || this.proc.reactionProgress > 0.35;
      this.drawVerticalTube(
        ctx,
        cx - 82,
        cy - 12,
        52,
        166,
        '#d4b46a',
        showRing ? (indolePos ? '#dc2626' : '#facc15') : null,
        'Indolo (Kovacs)'
      );
      this.drawThioglycollateTube(ctx, cx + 82, cy - 12, 52, 166, oxygenMode);
    }

    drawVerticalTube(ctx, x, y, w, h, brothColor, ringColor, label) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
      this.roundRect(ctx, x - w / 2, y - h / 2, w, h, w / 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.save();
      this.roundRect(ctx, x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, (w - 6) / 2);
      ctx.clip();

      const liquidTop = y - h * 0.16;
      ctx.fillStyle = brothColor;
      ctx.fillRect(x - w / 2, liquidTop, w, h);

      if (ringColor) {
        ctx.fillStyle = ringColor;
        ctx.fillRect(x - w / 2, liquidTop - 10, w, 12);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(x - w / 2 + 7, y - h / 2 + 10, 7, h - 24);
      ctx.restore();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      this.roundRect(ctx, x - w / 2, y - h / 2, w, h, w / 2);
      ctx.stroke();

      ctx.fillStyle = '#0f2942';
      ctx.font = '700 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + h / 2 + 19);
      ctx.restore();
    }

    drawThioglycollateTube(ctx, x, y, w, h, oxygenMode) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
      this.roundRect(ctx, x - w / 2, y - h / 2, w, h, w / 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.save();
      this.roundRect(ctx, x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, (w - 6) / 2);
      ctx.clip();

      const topY = y - h * 0.22;
      const botY = y + h / 2;
      const liqH = botY - topY;

      ctx.fillStyle = '#e5cf8e';
      ctx.fillRect(x - w / 2, topY, w, liqH);
      ctx.fillStyle = 'rgba(244, 114, 182, 0.3)';
      ctx.fillRect(x - w / 2, topY, w, 16);

      if (this.proc.completed || this.proc.reactionProgress > 0.2) {
        ctx.fillStyle = 'rgba(255, 253, 245, 0.88)';
        const rng = mulberry32(hashString(oxygenMode));
        for (let i = 0; i < 65; i++) {
          let py = topY;
          if (oxygenMode === 'obligate_aerobe') py = topY + 3 + rng() * 18;
          else if (oxygenMode === 'obligate_anaerobe') py = botY - 8 - rng() * (liqH * 0.38);
          else if (oxygenMode === 'microaerophile') py = topY + 20 + rng() * 14;
          else py = topY + 4 + rng() * (liqH - 12);

          const px = x + (rng() - 0.5) * (w - 14);
          ctx.beginPath();
          ctx.arc(px, py, 1.6 + rng() * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(x - w / 2 + 7, y - h / 2 + 10, 7, h - 24);
      ctx.restore();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      this.roundRect(ctx, x - w / 2, y - h / 2, w, h, w / 2);
      ctx.stroke();

      ctx.fillStyle = '#0f2942';
      ctx.font = '700 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Gradiente O₂ (Tioglicolato)', x, y + h / 2 + 19);
      ctx.restore();
    }

    drawDiagnosticDisks(ctx, cx, cy, disks) {
      const R = Math.min(this.width, this.height) * 0.38;
      const placed = this.proc.completed ? 3 : this.proc.disksPlaced;
      const haloGrow = this.proc.completed ? 1 : this.proc.incubating ? this.proc.growthProgress : 0;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.3)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = '#9f2a2f';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.beginPath();
      ctx.arc(cx, cy, R - 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226, 232, 240, ${0.14 + haloGrow * 0.24})`;
      ctx.fill();

      const items = [
        { code: 'P', name: 'Optochina', s: disks.optochin === 'S', ang: -Math.PI / 2 },
        { code: 'A', name: 'Bacitracina', s: disks.bacitracin === 'S', ang: Math.PI / 6 },
        { code: 'NV', name: 'Novobiocina', s: disks.novobiocin === 'S', ang: (Math.PI * 5) / 6 }
      ];

      items.forEach((item, idx) => {
        const dx = cx + Math.cos(item.ang) * (R * 0.5);
        const dy = cy + Math.sin(item.ang) * (R * 0.5);

        if (idx < placed) {
          if (item.s && haloGrow > 0.05) {
            ctx.beginPath();
            ctx.arc(dx, dy, 12.5 + 22 * haloGrow, 0, Math.PI * 2);
            ctx.fillStyle = '#881b20';
            ctx.fill();
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.9)';
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.beginPath();
          ctx.arc(dx, dy, 12.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.code, dx, dy);

          if (this.proc.completed) {
            ctx.fillStyle = item.s ? '#a7f3d0' : '#fecdd3';
            ctx.font = '700 10.5px "Inter", sans-serif';
            ctx.fillText(`${item.name} (${item.s ? 'S' : 'R'})`, dx, dy + (item.s ? 44 : 23));
          }
        } else {
          // Cerchio guida per posizionare il dischetto con la pinzetta
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
          ctx.setLineDash([4, 3]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(dx, dy, 13, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawCanvasStatusPill(ctx, x, y, text, bgColor) {
      ctx.save();
      ctx.font = '700 11.5px "Inter", system-ui, sans-serif';
      const tw = Math.min(this.width - 28, ctx.measureText(text).width + 28);
      const th = 28;
      ctx.fillStyle = bgColor;
      this.roundRect(ctx, x - tw / 2, y - th / 2, tw, th, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // =========================================================================
    // MINI-ANTEPRIMA ILLUSTRATA PER IL QUADERNO "ATLANTE DEI BATTERI"
    // =========================================================================
    static renderAtlasPreview(canvas, bacterium) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Metà sinistra: colonia su Agar
      ctx.fillStyle = '#dec88a';
      ctx.fillRect(0, 0, w / 2, h);
      const colColor = bacterium.primaryPlate.colonyColor || '#f1f5f9';
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.arc(w * 0.25 + 1, h * 0.5 + 1.5, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colColor;
      ctx.beginPath();
      ctx.arc(w * 0.25, h * 0.5, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.ellipse(w * 0.25 - 4, h * 0.5 - 4, 4, 2.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Metà destra: campo microscopico Gram
      ctx.fillStyle = '#f8f6f2';
      ctx.fillRect(w / 2, 0, w / 2, h);
      const m = bacterium.microscopy;
      const gramColor =
        m.gram === 'pos' ? '#4c1d95' : m.gram === 'neg' ? '#e11d68' : 'rgba(139, 92, 166, 0.55)';
      ctx.fillStyle = gramColor;
      ctx.strokeStyle = gramColor;

      const mx = w * 0.75;
      const my = h * 0.5;
      if (m.shape.includes('cocci') || m.shape.includes('diplococci')) {
        const pts =
          m.arrangement === 'chains'
            ? [
                [-12, -6],
                [-6, -2],
                [0, 1],
                [6, 4],
                [12, 6]
              ]
            : m.arrangement === 'pairs'
            ? [
                [-8, -5],
                [-2, -5],
                [5, 6],
                [11, 6]
              ]
            : [
                [-6, -5],
                [1, -6],
                [-2, 1],
                [5, 0],
                [0, 7],
                [-7, 3]
              ];
        for (const [dx, dy] of pts) {
          ctx.beginPath();
          ctx.arc(mx + dx, my + dy, 3.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (m.shape === 'curved_comma') {
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(mx - 4, my + 5, 8, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mx + 6, my - 2, 8, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      } else if (m.shape === 'spiral') {
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(mx - 12, my + 2);
        ctx.bezierCurveTo(mx - 4, my - 7, mx + 4, my + 7, mx + 12, my - 2);
        ctx.stroke();
      } else {
        // Bacilli / Coccobacilli
        [
          [-7, -6, 0.25],
          [5, 4, -0.3],
          [-4, 7, 0.1]
        ].forEach(([dx, dy, rot]) => {
          ctx.save();
          ctx.translate(mx + dx, my + dy);
          ctx.rotate(rot);
          ctx.fillRect(-7, -2.5, 14, 5);
          ctx.restore();
        });
      }

      // Divisorio centrale
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
    }

    // =========================================================================
    // UTILITY
    // =========================================================================
    roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    brightenHex(hex, amount) {
      if (!hex || !hex.startsWith('#')) return hex || '#ffffff';
      const num = parseInt(hex.slice(1), 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + amount));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
      const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
      return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    }

    hexToRgba(hex, alpha) {
      if (!hex || !hex.startsWith('#')) return `rgba(226, 232, 240, ${alpha})`;
      const num = parseInt(hex.slice(1), 16);
      return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }
  }

  window.LabRenderer = LabRenderer;
})();
