/**
 * BioGuessr Lab v3.0 — Scena 3D Interattiva del Bancone di Laboratorio (Three.js)
 * Attiva esclusivamente in "Modalità Realistica: ON":
 * - Microscopio Ottico Binoculare 3D completo (stativo, revolver 4 obiettivi ISO, tavolino X/Y, vetrino illuminato, viti macro/micro)
 * - Piastra Petri 3D posizionata davanti al microscopio con agar e colonie 3D reali del ceppo corrente
 * - Taccuino a spirale con penna sul bancone (aggiornato in tempo reale coi test eseguiti)
 * - Volume rilegato "Atlante dei Batteri" sul bancone
 * - Portaprovette in acciaio inox, flacone H₂O₂ con pipetta e becher di anse sterili (stile Cappa BSL-2)
 */
(function () {
  class LabBench3D {
    constructor(container, canvas, callbacks) {
      this.container = container;
      this.canvas = canvas;
      this.callbacks = callbacks || {};

      this.enabled = false;
      this.paused = false; // in pausa quando una schermata ravvicinata a tutto schermo è aperta
      this.bacterium = null;
      this.sampleCode = 'ISOLATO #01';
      this.performedSummary = [];
      this.activeStainTint = null;
      this.secondaryAgars = [];

      this.hoveredKey = null;
      this.pointerNDC = { x: 0, y: 0 };
      this.smoothLook = { x: 0, y: 0 };
      this.animFrame = null;
      this.clockStart = performance.now();

      // Animazione camera dolly quando si clicca uno strumento sul bancone
      this.camAnim = {
        active: false,
        startTime: 0,
        duration: 340,
        fromPos: null,
        toPos: null,
        fromTarget: null,
        toTarget: null,
        onDone: null
      };

      this.interactables = [];
      this.groupMap = {};
      this.colonyMeshes = [];
      this.secondaryPlateGroup = null;

      // Stato Cappa Chimico-Biologica 3D BSL-2 + Controllo Camera Schermo Intero
      this.hoodAirOn = true;
      this.hoodLightOn = true;
      this.hoodAirStreaks = [];
      this.userOrbitX = 0;
      this.userOrbitY = 0;
      this.userZoom = 0;
      this.isDraggingBench = false;
      this.dragMoved = false;
      this.dragStart = { x: 0, y: 0 };

      if (typeof window.THREE === 'undefined') {
        this.supported = false;
        return;
      }

      this.supported = true;
      this.initScene();
      this.buildEnvironment();
      this.buildBiosafetyHood3D();
      this.buildMicroscope();
      this.buildFrontPetriDish();
      this.buildSpiralNotepad();
      this.buildAtlasBook();
      this.buildReagentAndLoopStation();
      this.bindEvents();
      this.resize();
    }

    initScene() {
      const THREE = window.THREE;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xdceaf7);
      this.scene.fog = new THREE.Fog(0xdceaf7, 9.0, 17.5);

      this.defaultCamPos = new THREE.Vector3(0.12, 3.38, 4.48);
      this.defaultLookTarget = new THREE.Vector3(0.05, 0.94, -0.05);
      this.currentLookTarget = this.defaultLookTarget.clone();

      this.camera = new THREE.PerspectiveCamera(37, 16 / 10, 0.1, 30);
      this.camera.position.copy(this.defaultCamPos);
      this.camera.lookAt(this.currentLookTarget);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping !== undefined) {
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.06;
      }
      if (THREE.sRGBEncoding !== undefined) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      this.envTexture = this.createProceduralLabEnvMap();
      this.scene.environment = this.envTexture;

      // Illuminazione da laboratorio clinico cleanroom + luce interna Cappa BSL-2
      this.hemiLight = new THREE.HemisphereLight(0xf4f9ff, 0x8fa6bc, 0.72);
      this.scene.add(this.hemiLight);

      this.keyLight = new THREE.DirectionalLight(0xffffff, 0.88);
      this.keyLight.position.set(2.8, 6.2, 3.8);
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 1.0;
      this.keyLight.shadow.camera.far = 14;
      this.keyLight.shadow.camera.left = -4.4;
      this.keyLight.shadow.camera.right = 4.4;
      this.keyLight.shadow.camera.top = 3.6;
      this.keyLight.shadow.camera.bottom = -3.2;
      this.keyLight.shadow.bias = -0.0008;
      this.scene.add(this.keyLight);

      this.rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.42);
      this.rimLight.position.set(-4.0, 3.6, -2.4);
      this.scene.add(this.rimLight);

      this.fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.28);
      this.fillLight.position.set(-2.2, 2.5, 4.0);
      this.scene.add(this.fillLight);

      this.raycaster = new THREE.Raycaster();
      this.mouseVec = new THREE.Vector2();
    }

    createProceduralLabEnvMap() {
      const THREE = window.THREE;
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');

      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#f8fbff');
      g.addColorStop(0.42, '#d8ecfc');
      g.addColorStop(0.52, '#94a3b8');
      g.addColorStop(1, '#334155');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 256);

      // Plafoniere LED cleanroom per riflessi realistici sul vetro e metallo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(60, 24, 150, 22);
      ctx.fillRect(290, 20, 165, 24);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(20, 90, 90, 40);
      ctx.fillRect(390, 86, 95, 44);

      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      return tex;
    }

    buildEnvironment() {
      const THREE = window.THREE;

      // Texture micro-granulare del bancone tecnico da laboratorio (Trespa / Resina Epossidica)
      const benchCanvas = document.createElement('canvas');
      benchCanvas.width = 512;
      benchCanvas.height = 512;
      const bctx = benchCanvas.getContext('2d');
      const bg = bctx.createLinearGradient(0, 0, 0, 512);
      bg.addColorStop(0, '#cad9e8');
      bg.addColorStop(0.55, '#dce8f4');
      bg.addColorStop(1, '#c3d5e6');
      bctx.fillStyle = bg;
      bctx.fillRect(0, 0, 512, 512);

      // Griglia tecnica sottilissima da banco sterile + micro-speckle
      bctx.strokeStyle = 'rgba(15, 41, 66, 0.05)';
      bctx.lineWidth = 1;
      for (let i = 0; i <= 512; i += 64) {
        bctx.beginPath();
        bctx.moveTo(i, 0);
        bctx.lineTo(i, 512);
        bctx.stroke();
        bctx.beginPath();
        bctx.moveTo(0, i);
        bctx.lineTo(512, i);
        bctx.stroke();
      }
      for (let i = 0; i < 1800; i++) {
        bctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(30,41,59,0.04)';
        bctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      const benchTex = new THREE.CanvasTexture(benchCanvas);
      benchTex.wrapS = THREE.RepeatWrapping;
      benchTex.wrapT = THREE.RepeatWrapping;
      benchTex.repeat.set(2.5, 1.6);

      // Piano del Bancone
      const topGeo = new THREE.BoxGeometry(9.6, 0.22, 5.2);
      const topMat = new THREE.MeshStandardMaterial({
        map: benchTex,
        roughness: 0.34,
        metalness: 0.06,
        envMap: this.envTexture,
        envMapIntensity: 0.45
      });
      const countertop = new THREE.Mesh(topGeo, topMat);
      countertop.position.set(0, -0.11, 0.3);
      countertop.receiveShadow = true;
      this.scene.add(countertop);

      // Bordo frontale anticaduta liquidi in alluminio satinato blu-zaffiro
      const edgeGeo = new THREE.BoxGeometry(9.62, 0.24, 0.14);
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a5f,
        roughness: 0.28,
        metalness: 0.45,
        envMap: this.envTexture
      });
      const frontEdge = new THREE.Mesh(edgeGeo, edgeMat);
      frontEdge.position.set(0, -0.105, 2.92);
      this.scene.add(frontEdge);

      // Parete piastrellata sterile di fondo + mensola inox
      const wallCanvas = document.createElement('canvas');
      wallCanvas.width = 512;
      wallCanvas.height = 256;
      const wctx = wallCanvas.getContext('2d');
      const wg = wctx.createLinearGradient(0, 0, 0, 256);
      wg.addColorStop(0, '#cbe1f5');
      wg.addColorStop(1, '#e8f3fc');
      wctx.fillStyle = wg;
      wctx.fillRect(0, 0, 512, 256);
      wctx.strokeStyle = 'rgba(2, 132, 199, 0.11)';
      wctx.lineWidth = 2;
      for (let x = 0; x <= 512; x += 64) {
        wctx.beginPath();
        wctx.moveTo(x, 0);
        wctx.lineTo(x, 256);
        wctx.stroke();
      }
      for (let y = 0; y <= 256; y += 32) {
        wctx.beginPath();
        wctx.moveTo(0, y);
        wctx.lineTo(512, y);
        wctx.stroke();
      }
      const wallTex = new THREE.CanvasTexture(wallCanvas);
      wallTex.wrapS = THREE.RepeatWrapping;
      wallTex.wrapT = THREE.RepeatWrapping;
      wallTex.repeat.set(3, 1.5);

      const wallMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(13, 5.5),
        new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.55, metalness: 0.02 })
      );
      wallMesh.position.set(0, 2.5, -2.28);
      wallMesh.receiveShadow = true;
      this.scene.add(wallMesh);

      // Alzatina inox tra bancone e parete
      const backTrim = new THREE.Mesh(
        new THREE.BoxGeometry(9.6, 0.26, 0.14),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.25,
          metalness: 0.78,
          envMap: this.envTexture
        })
      );
      backTrim.position.set(0, 0.12, -2.2);
      this.scene.add(backTrim);

      // Tappetino operativo azzurro sterile sotto la zona centrale di lavoro
      const matGeo = new THREE.BoxGeometry(3.25, 0.018, 2.65);
      const matMat = new THREE.MeshStandardMaterial({
        color: 0x0f3b68,
        roughness: 0.62,
        metalness: 0.05
      });
      const workMat = new THREE.Mesh(matGeo, matMat);
      workMat.position.set(-0.2, 0.009, 0.35);
      workMat.receiveShadow = true;
      this.scene.add(workMat);

      const matBorder = new THREE.Mesh(
        new THREE.BoxGeometry(3.31, 0.012, 2.71),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35, metalness: 0.2 })
      );
      matBorder.position.set(-0.2, 0.005, 0.35);
      this.scene.add(matBorder);
    }

    // =========================================================================
    // 0. CAPPA MICROBIOLOGICA 3D (BSL-2) CON LUCE LED, FLUSSO HEPA & PULSANTI 3D
    // =========================================================================
    buildBiosafetyHood3D() {
      const THREE = window.THREE;
      const hoodGroup = new THREE.Group();

      // Pannello posteriore inox AISI 316L con griglia di aspirazione HEPA forata (ispirato a FIGURA 19)
      const backCanvas = document.createElement('canvas');
      backCanvas.width = 512;
      backCanvas.height = 256;
      const bctx = backCanvas.getContext('2d');
      const sg = bctx.createLinearGradient(0, 0, 0, 256);
      sg.addColorStop(0, '#b9cadb');
      sg.addColorStop(0.5, '#dce7f2');
      sg.addColorStop(1, '#aebfd1');
      bctx.fillStyle = sg;
      bctx.fillRect(0, 0, 512, 256);

      // Fessure di aspirazione laminare in alto e in basso
      bctx.fillStyle = '#334155';
      for (let row = 0; row < 3; row++) {
        for (let x = 18; x < 494; x += 22) {
          bctx.fillRect(x, 22 + row * 11, 14, 5);
          bctx.fillRect(x, 206 + row * 11, 14, 5);
        }
      }
      const steelTex = new THREE.CanvasTexture(backCanvas);

      const steelMat = new THREE.MeshStandardMaterial({
        map: steelTex,
        roughness: 0.28,
        metalness: 0.72,
        envMap: this.envTexture,
        envMapIntensity: 0.85
      });

      const brushedFrameMat = new THREE.MeshStandardMaterial({
        color: 0xd8e4f0,
        roughness: 0.26,
        metalness: 0.62,
        envMap: this.envTexture
      });

      const backPlenum = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.55, 0.12), steelMat);
      backPlenum.position.set(0, 1.32, -2.12);
      backPlenum.receiveShadow = true;
      hoodGroup.add(backPlenum);

      // Montanti laterali inclinati della Cappa BSL-2
      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.68, 1.55), brushedFrameMat);
      leftPillar.position.set(-3.78, 1.34, -1.42);
      hoodGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.68, 1.55), brushedFrameMat);
      rightPillar.position.set(3.78, 1.34, -1.42);
      hoodGroup.add(rightPillar);

      // Tetto/Cielino superiore della Cappa con plafoniera LED integrata
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(7.74, 0.22, 1.85), brushedFrameMat);
      canopy.position.set(0, 2.62, -1.32);
      hoodGroup.add(canopy);

      // Fascia frontale inclinata con Display Digitale BSL-2
      this.hoodPanelCanvas = document.createElement('canvas');
      this.hoodPanelCanvas.width = 1024;
      this.hoodPanelCanvas.height = 160;
      this.hoodPanelTexture = new THREE.CanvasTexture(this.hoodPanelCanvas);

      const fasciaMesh = new THREE.Mesh(
        new THREE.BoxGeometry(7.42, 0.36, 0.08),
        new THREE.MeshStandardMaterial({
          map: this.hoodPanelTexture,
          roughness: 0.22,
          metalness: 0.25,
          emissive: 0x0b2756,
          emissiveIntensity: 0.22
        })
      );
      fasciaMesh.position.set(0, 2.48, -0.42);
      fasciaMesh.rotation.x = 0.22;
      hoodGroup.add(fasciaMesh);

      // Pulsanti 3D cliccabili direttamente sulla fascia della Cappa (Flusso Aria & Luce LED)
      const airBtnGroup = new THREE.Group();
      airBtnGroup.position.set(1.92, 2.48, -0.36);
      airBtnGroup.rotation.x = 0.22;
      this.airSwitchMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.65,
        roughness: 0.2
      });
      const airBtnMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.06), this.airSwitchMat);
      airBtnGroup.add(airBtnMesh);
      hoodGroup.add(airBtnGroup);
      this.registerInteractable(
        airBtnGroup,
        'hood_air_toggle',
        '🌬️ Interruttore Flusso Cappa BSL-2',
        'Clicca per accendere o spegnere l’aspirazione laminare HEPA',
        this.defaultCamPos.clone(),
        this.defaultLookTarget.clone()
      );

      const lightBtnGroup = new THREE.Group();
      lightBtnGroup.position.set(2.84, 2.48, -0.36);
      lightBtnGroup.rotation.x = 0.22;
      this.lightSwitchMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.65,
        roughness: 0.2
      });
      const lightBtnMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.06), this.lightSwitchMat);
      lightBtnGroup.add(lightBtnMesh);
      hoodGroup.add(lightBtnGroup);
      this.registerInteractable(
        lightBtnGroup,
        'hood_light_toggle',
        '💡 Interruttore Luce Cappa LED',
        'Clicca per accendere o spegnere l’illuminazione sul bancone',
        this.defaultCamPos.clone(),
        this.defaultLookTarget.clone()
      );

      // Visiera superiore in vetro temperato trasparente (Sash superiore non bloccante per il raycast)
      const sashGlass = new THREE.Mesh(
        new THREE.BoxGeometry(7.36, 0.42, 0.025),
        new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.18,
          roughness: 0.05,
          metalness: 0.1,
          envMap: this.envTexture
        })
      );
      sashGlass.position.set(0, 2.14, -0.36);
      sashGlass.rotation.x = 0.14;
      hoodGroup.add(sashGlass);

      const sashBottomBar = new THREE.Mesh(
        new THREE.BoxGeometry(7.4, 0.032, 0.045),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.6 })
      );
      sashBottomBar.position.set(0, 1.93, -0.33);
      hoodGroup.add(sashBottomBar);

      // Tubo Neon LED 5500K sotto il cielino della Cappa + Luce PointLight reale sul banco
      this.hoodTubeMat = new THREE.MeshBasicMaterial({ color: 0xf0f9ff });
      const ledTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 6.2, 16),
        this.hoodTubeMat
      );
      ledTube.rotation.z = Math.PI / 2;
      ledTube.position.set(0, 2.48, -1.15);
      hoodGroup.add(ledTube);

      this.hoodWorkLight = new THREE.PointLight(0xf0f9ff, 0.72, 9.5, 1.5);
      this.hoodWorkLight.position.set(0, 2.38, -0.35);
      this.scene.add(this.hoodWorkLight);

      // Filetti fluidodinamici 3D del flusso d'aria laminare verticale sterile
      this.hoodAirGroup = new THREE.Group();
      const airLineMat = new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.22
      });
      const airGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.34, 6);
      for (let i = 0; i < 22; i++) {
        const streak = new THREE.Mesh(airGeo, airLineMat);
        streak.position.set(
          (Math.random() - 0.5) * 6.2,
          0.3 + Math.random() * 1.9,
          -1.6 + Math.random() * 2.1
        );
        streak.userData.speed = 0.55 + Math.random() * 0.45;
        this.hoodAirStreaks.push(streak);
        this.hoodAirGroup.add(streak);
      }
      this.scene.add(this.hoodAirGroup);

      this.scene.add(hoodGroup);
      this.refreshHoodPanelTexture();
    }

    refreshHoodPanelTexture() {
      if (!this.hoodPanelCanvas || !this.hoodPanelTexture) return;
      const ctx = this.hoodPanelCanvas.getContext('2d');
      const W = 1024;
      const H = 160;

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0b2244');
      bg.addColorStop(0.5, '#123566');
      bg.addColorStop(1, '#0b2244');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, W - 8, H - 8);

      // Display stato flusso laminare HEPA a sinistra
      ctx.fillStyle = this.hoodAirOn ? '#34d399' : '#fb7185';
      ctx.beginPath();
      ctx.arc(46, 80, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 30px "JetBrains Mono", monospace';
      ctx.fillText(
        this.hoodAirOn
          ? 'CAPPA BIOHAZARD BSL-2 · HEPA 0.45 m/s [ON]'
          : 'CAPPA BIOHAZARD BSL-2 · ASPIRAZIONE [OFF]',
        78,
        74
      );

      ctx.fillStyle = '#bae6fd';
      ctx.font = '600 21px "Inter", sans-serif';
      ctx.fillText(
        `Luce Cappa LED: ${this.hoodLightOn ? 'ACCESA (5500K)' : 'SPENTA'}  ·  Pressione: ${
          this.hoodAirOn ? '-25 Pa Sterile' : '0 Pa Standby'
        }`,
        78,
        114
      );

      // Etichette sopra i 2 interruttori 3D a destra
      ctx.fillStyle = '#e0f2fe';
      ctx.font = '800 20px "Inter", sans-serif';
      ctx.fillText('FLUSSO', 726, 42);
      ctx.fillText('LUCE LED', 852, 42);

      this.hoodPanelTexture.needsUpdate = true;
    }

    setHoodState(airOn, lightOn) {
      this.hoodAirOn = !!airOn;
      this.hoodLightOn = !!lightOn;
      if (!this.supported) return;

      if (this.hoodAirGroup) {
        this.hoodAirGroup.visible = this.hoodAirOn;
      }
      if (this.airSwitchMat) {
        this.airSwitchMat.color.setHex(this.hoodAirOn ? 0x10b981 : 0x64748b);
        this.airSwitchMat.emissive.setHex(this.hoodAirOn ? 0x059669 : 0x334155);
        this.airSwitchMat.emissiveIntensity = this.hoodAirOn ? 0.72 : 0.15;
      }

      if (this.hoodWorkLight) {
        this.hoodWorkLight.intensity = this.hoodLightOn ? 0.72 : 0.0;
      }
      if (this.hoodTubeMat) {
        this.hoodTubeMat.color.setHex(this.hoodLightOn ? 0xf0f9ff : 0x334155);
      }
      if (this.keyLight) {
        this.keyLight.intensity = this.hoodLightOn ? 0.88 : 0.26;
      }
      if (this.hemiLight) {
        this.hemiLight.intensity = this.hoodLightOn ? 0.72 : 0.32;
      }
      if (this.scene && this.scene.background) {
        this.scene.background.setHex(this.hoodLightOn ? 0xdceaf7 : 0x8ea6bf);
        if (this.scene.fog) {
          this.scene.fog.color.setHex(this.hoodLightOn ? 0xdceaf7 : 0x8ea6bf);
        }
      }
      if (this.lightSwitchMat) {
        this.lightSwitchMat.color.setHex(this.hoodLightOn ? 0x38bdf8 : 0x64748b);
        this.lightSwitchMat.emissive.setHex(this.hoodLightOn ? 0x0284c7 : 0x334155);
        this.lightSwitchMat.emissiveIntensity = this.hoodLightOn ? 0.72 : 0.15;
      }

      this.refreshHoodPanelTexture();
      this.renderOnce();
    }

    registerInteractable(group, key, label, sublabel, focusPos, focusTarget) {
      group.userData.interactKey = key;
      group.traverse((child) => {
        if (child.isMesh) {
          child.userData.interactKey = key;
          this.interactables.push(child);
        }
      });
      this.groupMap[key] = {
        group,
        key,
        label,
        sublabel,
        baseY: group.position.y,
        focusPos,
        focusTarget
      };
    }

    // =========================================================================
    // 1. MICROSCOPIO OTTICO BINOCULARE 3D REALISTICO
    // =========================================================================
    buildMicroscope() {
      const THREE = window.THREE;
      const g = new THREE.Group();
      g.position.set(-0.22, 0, -0.52);

      const enamelMat = new THREE.MeshStandardMaterial({
        color: 0xf4f7fb,
        roughness: 0.24,
        metalness: 0.08,
        envMap: this.envTexture,
        envMapIntensity: 0.6
      });
      const darkAnodized = new THREE.MeshStandardMaterial({
        color: 0x1b2533,
        roughness: 0.38,
        metalness: 0.45,
        envMap: this.envTexture
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.14,
        metalness: 0.92,
        envMap: this.envTexture,
        envMapIntensity: 1.1
      });
      const sapphireAccent = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.25,
        metalness: 0.35,
        envMap: this.envTexture
      });

      // Base pesante sagomata dello stativo
      const baseMain = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.2, 1.62), enamelMat);
      baseMain.position.set(0, 0.11, 0);
      baseMain.castShadow = true;
      baseMain.receiveShadow = true;
      g.add(baseMain);

      const baseFrontSlope = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.2, 32), enamelMat);
      baseFrontSlope.position.set(0, 0.11, 0.62);
      baseFrontSlope.scale.set(1.04, 1, 0.55);
      baseFrontSlope.castShadow = true;
      g.add(baseFrontSlope);

      // Piedini antivibrazione in gomma nera
      [
        [-0.55, 0.02, -0.68],
        [0.55, 0.02, -0.68],
        [-0.52, 0.02, 0.72],
        [0.52, 0.02, 0.72]
      ].forEach(([fx, fy, fz]) => {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), darkAnodized);
        foot.position.set(fx, fy, fz);
        g.add(foot);
      });

      // Interruttore luminoso verde sul fianco della base
      const ledSwitch = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.07, 0.12),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      ledSwitch.position.set(0.67, 0.13, 0.28);
      g.add(ledSwitch);

      // Collettore luminoso LED di Koehler sulla base (sotto il condensatore)
      const collectorHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.3, 0.12, 28),
        darkAnodized
      );
      collectorHousing.position.set(0, 0.26, 0.24);
      g.add(collectorHousing);

      this.substageGlowMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.03, 28),
        new THREE.MeshBasicMaterial({ color: 0xfff8d6 })
      );
      this.substageGlowMesh.position.set(0, 0.325, 0.24);
      g.add(this.substageGlowMesh);

      this.substageLight = new THREE.PointLight(0xfff2b2, 0.85, 2.2);
      this.substageLight.position.set(0, 0.55, 0.24);
      g.add(this.substageLight);

      // Cono ottico soffice di luce che attraversa il vetrino
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      });
      this.lightConeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.16, 0.82, 24, 1, true), beamMat);
      this.lightConeMesh.position.set(0, 0.74, 0.24);
      g.add(this.lightConeMesh);

      // Colonna / Braccio ergonomico curvo a C (Stativo posteriore)
      const lowerPillar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.38, 0.44), enamelMat);
      lowerPillar.position.set(0, 0.85, -0.54);
      lowerPillar.rotation.x = 0.08;
      lowerPillar.castShadow = true;
      g.add(lowerPillar);

      // Inserto laterale blu-zaffiro da laboratorio
      const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.85, 0.12), sapphireAccent);
      sideStripe.position.set(0, 0.92, -0.5);
      sideStripe.rotation.x = 0.08;
      g.add(sideStripe);

      const upperNeck = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.76, 0.48), enamelMat);
      upperNeck.position.set(0, 1.78, -0.34);
      upperNeck.rotation.x = -0.35;
      upperNeck.castShadow = true;
      g.add(upperNeck);

      const topArmCantilever = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.92), enamelMat);
      topArmCantilever.position.set(0, 2.08, 0.02);
      topArmCantilever.castShadow = true;
      g.add(topArmCantilever);

      // Manopole Coassiali Macrometrica e Micrometrica (destra e sinistra)
      this.focusKnobsGroup = new THREE.Group();
      this.focusKnobsGroup.position.set(0, 0.62, -0.48);
      [-1, 1].forEach((side) => {
        const macroKnob = new THREE.Mesh(
          new THREE.CylinderGeometry(0.21, 0.21, 0.16, 28),
          darkAnodized
        );
        macroKnob.rotation.z = Math.PI / 2;
        macroKnob.position.x = side * 0.31;
        macroKnob.castShadow = true;
        this.focusKnobsGroup.add(macroKnob);

        const microKnob = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.14, 24),
          chromeMat
        );
        microKnob.rotation.z = Math.PI / 2;
        microKnob.position.x = side * 0.43;
        this.focusKnobsGroup.add(microKnob);

        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.03, 20),
          sapphireAccent
        );
        cap.rotation.z = Math.PI / 2;
        cap.position.x = side * 0.505;
        this.focusKnobsGroup.add(cap);
      });
      g.add(this.focusKnobsGroup);

      // Supporto Condensatore di Abbe + Tavolino Traslatore Meccanico X/Y
      const stageBracket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.62), darkAnodized);
      stageBracket.position.set(0, 0.98, -0.16);
      g.add(stageBracket);

      const condenserBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.14, 0.22, 24),
        darkAnodized
      );
      condenserBody.position.set(0, 0.96, 0.24);
      g.add(condenserBody);

      const stagePlate = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.075, 1.08), darkAnodized);
      stagePlate.position.set(0, 1.13, 0.22);
      stagePlate.castShadow = true;
      stagePlate.receiveShadow = true;
      g.add(stagePlate);

      // Righelli cromati del verniero X/Y sul tavolino
      const vernierX = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.015, 0.05), chromeMat);
      vernierX.position.set(0, 1.172, -0.22);
      g.add(vernierX);

      // Comando coassiale verticale del tavolino traslatore (a destra sotto il piatto)
      const xyDropRod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 16), chromeMat);
      xyDropRod.position.set(0.54, 0.94, 0.42);
      g.add(xyDropRod);
      const xyKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 18), darkAnodized);
      xyKnob.position.set(0.54, 0.78, 0.42);
      g.add(xyKnob);

      // Vetrino Portaoggetti in vetro + Macchia del preparato colorato + Pinzetta fermavetrino
      const slideGlassMat = new THREE.MeshPhysicalMaterial
        ? new THREE.MeshPhysicalMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.62,
            roughness: 0.08,
            metalness: 0.05,
            envMap: this.envTexture
          })
        : new THREE.MeshStandardMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.62,
            roughness: 0.1
          });
      const slideMesh = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.018, 0.28), slideGlassMat);
      slideMesh.position.set(0, 1.18, 0.24);
      g.add(slideMesh);

      const slideLabel = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.02, 0.26),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 })
      );
      slideLabel.position.set(-0.31, 1.182, 0.24);
      g.add(slideLabel);

      this.slideSmearMat = new THREE.MeshBasicMaterial({
        color: 0x6d28d9,
        transparent: true,
        opacity: 0.72
      });
      this.slideSmearMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.008, 24),
        this.slideSmearMat
      );
      this.slideSmearMesh.position.set(0.03, 1.192, 0.24);
      g.add(this.slideSmearMesh);

      // Pinzette metalliche fermavetrino
      const clipL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.34), chromeMat);
      clipL.position.set(-0.43, 1.185, 0.14);
      g.add(clipL);
      const clipR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.035), chromeMat);
      clipR.position.set(0.32, 1.185, 0.08);
      g.add(clipR);

      // Revolver Portaobiettivi Rotante a 4 Obiettivi ISO (4x Rosso, 10x Giallo, 40x Blu, 100x Bianco Olio)
      this.nosepieceTurret = new THREE.Group();
      this.nosepieceTurret.position.set(0, 1.84, 0.24);
      this.nosepieceTurret.rotation.x = 0.16;

      const turretDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.11, 32),
        darkAnodized
      );
      this.nosepieceTurret.add(turretDisc);

      const turretRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.305, 0.022, 12, 32),
        chromeMat
      );
      turretRim.rotation.x = Math.PI / 2;
      this.nosepieceTurret.add(turretRim);

      const objectivesSpec = [
        { ang: 0, len: 0.42, ringColor: 0xffffff, name: '100x' }, // 100x Olio in posizione frontale attiva
        { ang: Math.PI / 2, len: 0.36, ringColor: 0x2563eb, name: '40x' },
        { ang: Math.PI, len: 0.28, ringColor: 0xeab308, name: '10x' },
        { ang: (Math.PI * 3) / 2, len: 0.21, ringColor: 0xef4444, name: '4x' }
      ];

      objectivesSpec.forEach((o) => {
        const objHolder = new THREE.Group();
        objHolder.rotation.y = o.ang;

        const barrel = new THREE.Group();
        barrel.position.set(0, -0.05, 0.19);
        barrel.rotation.x = 0.24;

        const bodyCyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.052, o.len, 22),
          chromeMat
        );
        bodyCyl.position.y = -o.len / 2;
        bodyCyl.castShadow = true;
        barrel.add(bodyCyl);

        const isoRing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.071, 0.071, 0.042, 22),
          new THREE.MeshStandardMaterial({ color: o.ringColor, roughness: 0.25, metalness: 0.2 })
        );
        isoRing.position.y = -o.len * 0.56;
        barrel.add(isoRing);

        const tip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.046, 0.028, 0.07, 20),
          darkAnodized
        );
        tip.position.y = -o.len - 0.03;
        barrel.add(tip);

        objHolder.add(barrel);
        this.nosepieceTurret.add(objHolder);
      });
      g.add(this.nosepieceTurret);

      // Testata Binoculare Siedentopf Inclinata a 45° con Doppio Oculare
      const prismHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.27, 0.26, 28),
        enamelMat
      );
      prismHead.position.set(0, 2.28, 0.22);
      prismHead.castShadow = true;
      g.add(prismHead);

      const binoBridge = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.28), darkAnodized);
      binoBridge.position.set(0, 2.42, 0.34);
      binoBridge.rotation.x = 0.62;
      binoBridge.castShadow = true;
      g.add(binoBridge);

      const lensCoatMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0c4a6e,
        emissiveIntensity: 0.45,
        roughness: 0.05,
        metalness: 0.85,
        envMap: this.envTexture
      });

      [-0.17, 0.17].forEach((ox) => {
        const ocularGroup = new THREE.Group();
        ocularGroup.position.set(ox, 2.46, 0.38);
        ocularGroup.rotation.x = 0.68; // inclinato verso l'operatore!

        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.082, 0.078, 0.44, 24),
          darkAnodized
        );
        tube.position.y = 0.22;
        tube.castShadow = true;
        ocularGroup.add(tube);

        const silverCollar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.086, 0.086, 0.05, 24),
          chromeMat
        );
        silverCollar.position.y = 0.36;
        ocularGroup.add(silverCollar);

        const eyecup = new THREE.Mesh(
          new THREE.CylinderGeometry(0.095, 0.085, 0.07, 24),
          darkAnodized
        );
        eyecup.position.y = 0.44;
        ocularGroup.add(eyecup);

        const glassLens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.068, 0.015, 22),
          lensCoatMat
        );
        glassLens.position.y = 0.472;
        ocularGroup.add(glassLens);

        g.add(ocularGroup);
      });

      // Anello luminoso di selezione al passaggio del mouse
      this.microscopeHighlight = this.createHoverRing(0.86);
      this.microscopeHighlight.position.set(0, 0.02, 0.05);
      g.add(this.microscopeHighlight);

      this.scene.add(g);
      this.registerInteractable(
        g,
        'microscope',
        '🔬 Microscopio Ottico 3D',
        'Clicca per aprire l’Oculare e osservare i preparati reali (1000× Olio)',
        new THREE.Vector3(-0.22, 2.75, 1.45),
        new THREE.Vector3(-0.22, 2.25, 0.18)
      );
    }

    // =========================================================================
    // 2. PIASTRA PETRI 3D PROPRIO DAVANTI AL MICROSCOPIO
    // =========================================================================
    buildFrontPetriDish() {
      const THREE = window.THREE;
      const g = new THREE.Group();
      // Esattamente davanti al microscopio sul bancone!
      g.position.set(-0.22, 0.02, 1.18);

      this.petriCanvas = document.createElement('canvas');
      this.petriCanvas.width = 512;
      this.petriCanvas.height = 512;
      this.petriTexture = new THREE.CanvasTexture(this.petriCanvas);
      if (THREE.sRGBEncoding !== undefined) {
        this.petriTexture.encoding = THREE.sRGBEncoding;
      }

      const dishRadius = 0.56;
      const dishHeight = 0.14;

      // Disco di Agar interno
      const agarTopMat = new THREE.MeshStandardMaterial({
        map: this.petriTexture,
        roughness: 0.26,
        metalness: 0.04,
        envMap: this.envTexture,
        envMapIntensity: 0.45
      });
      this.agarSideMat = new THREE.MeshStandardMaterial({
        color: 0xc2a869,
        roughness: 0.38,
        metalness: 0.02,
        transparent: true,
        opacity: 0.92
      });
      const agarGeo = new THREE.CylinderGeometry(dishRadius - 0.02, dishRadius - 0.02, 0.075, 48);
      this.agarMesh = new THREE.Mesh(agarGeo, [this.agarSideMat, agarTopMat, this.agarSideMat]);
      this.agarMesh.position.y = 0.045;
      this.agarMesh.receiveShadow = true;
      g.add(this.agarMesh);

      // Gruppo colonie 3D in rilievo sopra l'agar
      this.colonyGroup3D = new THREE.Group();
      this.colonyGroup3D.position.y = 0.083;
      g.add(this.colonyGroup3D);

      // Parete cilindrica in vetro/polistirene cristallino della Piastra Petri
      const glassWallMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.36,
        roughness: 0.06,
        metalness: 0.15,
        envMap: this.envTexture,
        envMapIntensity: 1.25,
        side: THREE.DoubleSide
      });

      const dishWall = new THREE.Mesh(
        new THREE.CylinderGeometry(dishRadius, dishRadius, dishHeight, 48, 1, true),
        glassWallMat
      );
      dishWall.position.y = dishHeight / 2;
      dishWall.castShadow = true;
      g.add(dishWall);

      const dishRim = new THREE.Mesh(
        new THREE.TorusGeometry(dishRadius, 0.014, 12, 48),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          transparent: true,
          opacity: 0.78,
          roughness: 0.1,
          metalness: 0.25,
          envMap: this.envTexture
        })
      );
      dishRim.rotation.x = Math.PI / 2;
      dishRim.position.y = dishHeight;
      g.add(dishRim);

      // Coperchio trasparente appoggiato leggermente socchiuso di lato per mostrare il rilievo realistico!
      const lidGroup = new THREE.Group();
      lidGroup.position.set(0.18, dishHeight + 0.02, -0.14);
      lidGroup.rotation.z = -0.08;
      lidGroup.rotation.x = 0.05;

      const lidTop = new THREE.Mesh(
        new THREE.CylinderGeometry(dishRadius + 0.025, dishRadius + 0.025, 0.012, 48),
        new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.22,
          roughness: 0.05,
          metalness: 0.2,
          envMap: this.envTexture,
          envMapIntensity: 1.3
        })
      );
      lidGroup.add(lidTop);

      const lidSkirt = new THREE.Mesh(
        new THREE.CylinderGeometry(dishRadius + 0.025, dishRadius + 0.025, 0.075, 48, 1, true),
        glassWallMat
      );
      lidSkirt.position.y = -0.035;
      lidGroup.add(lidSkirt);

      // Etichetta bianca codice campione sul coperchio
      const tagMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.36, 0.11),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 })
      );
      tagMesh.rotation.x = -Math.PI / 2;
      tagMesh.position.set(0, 0.008, -0.34);
      lidGroup.add(tagMesh);

      g.add(lidGroup);

      // Pila secondaria di piastre selettive inoculate (a sinistra della piastra primaria)
      this.secondaryPlateGroup = new THREE.Group();
      this.secondaryPlateGroup.position.set(-0.92, 0, -0.1);
      g.add(this.secondaryPlateGroup);

      this.petriHighlight = this.createHoverRing(0.68);
      this.petriHighlight.position.set(0, 0.005, 0);
      g.add(this.petriHighlight);

      this.scene.add(g);
      this.registerInteractable(
        g,
        'petri',
        '🧫 Piastra Petri del Campione',
        'Clicca per ispezionare da vicino le colonie con Lente 5× o eseguire test sotto cappa',
        new THREE.Vector3(-0.22, 1.55, 2.25),
        new THREE.Vector3(-0.22, 0.1, 1.15)
      );
    }

    // =========================================================================
    // 3. TACCUINO A SPIRALE CON PENNA SUL BANCONE (DESTRA ANTERIORE)
    // =========================================================================
    buildSpiralNotepad() {
      const THREE = window.THREE;
      const g = new THREE.Group();
      g.position.set(1.58, 0.01, 0.88);
      g.rotation.y = -0.26;

      this.notepadCanvas = document.createElement('canvas');
      this.notepadCanvas.width = 512;
      this.notepadCanvas.height = 640;
      this.notepadTexture = new THREE.CanvasTexture(this.notepadCanvas);
      if (THREE.sRGBEncoding !== undefined) {
        this.notepadTexture.encoding = THREE.sRGBEncoding;
      }

      // Base rigida in cartoncino + blocco fogli a righe
      const cardboard = new THREE.Mesh(
        new THREE.BoxGeometry(1.16, 0.03, 1.48),
        new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.65 })
      );
      cardboard.position.y = 0.015;
      cardboard.castShadow = true;
      cardboard.receiveShadow = true;
      g.add(cardboard);

      const sidePaperMat = new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.75 });
      const topPageMat = new THREE.MeshStandardMaterial({
        map: this.notepadTexture,
        roughness: 0.58,
        metalness: 0.02
      });
      const pagesBlock = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.065, 1.42), [
        sidePaperMat,
        sidePaperMat,
        topPageMat,
        sidePaperMat,
        sidePaperMat,
        sidePaperMat
      ]);
      pagesBlock.position.y = 0.062;
      pagesBlock.castShadow = true;
      pagesBlock.receiveShadow = true;
      g.add(pagesBlock);

      // Anelli metallici della rilegatura a spirale superiore
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.18,
        metalness: 0.9,
        envMap: this.envTexture
      });
      for (let i = 0; i < 10; i++) {
        const rx = -0.46 + (i / 9) * 0.92;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.009, 10, 20), ringMat);
        ring.position.set(rx, 0.1, -0.71);
        ring.rotation.y = Math.PI / 2;
        g.add(ring);
      }

      // Penna a sfera blu zaffiro da laboratorio appoggiata sul taccuino
      const penGroup = new THREE.Group();
      penGroup.position.set(0.18, 0.125, 0.1);
      penGroup.rotation.y = 0.52;
      penGroup.rotation.z = Math.PI / 2;

      const penBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.026, 0.96, 18),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.22,
          metalness: 0.45,
          envMap: this.envTexture
        })
      );
      penBody.castShadow = true;
      penGroup.add(penBody);

      const penTip = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.12, 16), ringMat);
      penTip.position.y = -0.54;
      penTip.rotation.x = Math.PI;
      penGroup.add(penTip);

      const penClip = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.26, 0.022), ringMat);
      penClip.position.set(0, 0.28, 0.032);
      penGroup.add(penClip);

      g.add(penGroup);

      this.notepadHighlight = this.createHoverRing(0.88);
      this.notepadHighlight.position.set(0, 0.005, 0);
      g.add(this.notepadHighlight);

      this.refreshNotepadTexture();
      this.scene.add(g);
      this.registerInteractable(
        g,
        'notepad',
        '📒 Taccuino del Microbiologo',
        'Clicca per aprire gli appunti, i risultati registrati e la checklist delle 20 specie',
        new THREE.Vector3(1.42, 1.85, 2.15),
        new THREE.Vector3(1.55, 0.1, 0.85)
      );
    }

    // =========================================================================
    // 4. VOLUME RILEGATO "ATLANTE DEI BATTERI" SUL BANCONE (DESTRA POSTERIORE)
    // =========================================================================
    buildAtlasBook() {
      const THREE = window.THREE;
      const g = new THREE.Group();
      g.position.set(1.92, 0.01, -0.68);
      g.rotation.y = -0.42;

      const coverCanvas = document.createElement('canvas');
      coverCanvas.width = 512;
      coverCanvas.height = 640;
      const ctx = coverCanvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 512, 640);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.55, '#0f766e');
      grad.addColorStop(1, '#0b3b59');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 640);

      // Dorso e cornice oro/ciano scientifica sulla copertina
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(0, 0, 56, 640);
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 6;
      ctx.strokeRect(78, 36, 396, 568);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = '700 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MANUALE DIAGNOSTICO', 276, 130);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 42px sans-serif';
      ctx.fillText('ATLANTE DEI', 276, 215);
      ctx.fillText('BATTERI', 276, 268);

      // Illustrazione stilizzata piastra sulla copertina
      ctx.strokeStyle = '#99f6e4';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(276, 405, 86, 0, Math.PI * 2);
      ctx.stroke();
      [
        [248, 385, '#fde047', 12],
        [296, 378, '#f472b6', 10],
        [265, 428, '#38bdf8', 11],
        [312, 422, '#6ee7b7', 9]
      ].forEach(([cx, cy, col, r]) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#ccfbf1';
      ctx.font = '700 20px monospace';
      ctx.fillText('20 SPECIE · CHIAVI BERGEY', 276, 555);

      const coverTex = new THREE.CanvasTexture(coverCanvas);
      if (THREE.sRGBEncoding !== undefined) coverTex.encoding = THREE.sRGBEncoding;

      const tealCoverMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.38 });
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 });
      const topCoverMat = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.32 });

      const bookBlock = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.19, 1.52), [
        pagesMat,
        tealCoverMat,
        topCoverMat,
        tealCoverMat,
        pagesMat,
        pagesMat
      ]);
      bookBlock.position.y = 0.095;
      bookBlock.castShadow = true;
      bookBlock.receiveShadow = true;
      g.add(bookBlock);

      // Segnalibri colorati che spuntano dalle pagine
      [0x38bdf8, 0xf59e0b, 0xf43f5e].forEach((col, idx) => {
        const tab = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.012, 0.14),
          new THREE.MeshBasicMaterial({ color: col })
        );
        tab.position.set(0.61, 0.11 - idx * 0.02, -0.35 + idx * 0.34);
        g.add(tab);
      });

      this.atlasHighlight = this.createHoverRing(0.9);
      this.atlasHighlight.position.set(0, 0.005, 0);
      g.add(this.atlasHighlight);

      this.scene.add(g);
      this.registerInteractable(
        g,
        'atlas',
        '📘 L’Atlante dei Batteri',
        'Clicca per sfogliare l’enciclopedia illustrata delle 20 specie e le chiavi dicotomiche',
        new THREE.Vector3(1.65, 1.95, 0.75),
        new THREE.Vector3(1.9, 0.12, -0.68)
      );
    }

    // =========================================================================
    // 5. PORTAPROVETTE INOX, PIPETTA H₂O₂ & BECHER DI ANSE STERILI (SINISTRA)
    // =========================================================================
    buildReagentAndLoopStation() {
      const THREE = window.THREE;
      const g = new THREE.Group();
      g.position.set(-1.98, 0.01, 0.28);
      g.rotation.y = 0.28;

      const steelMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.22,
        metalness: 0.85,
        envMap: this.envTexture
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.42,
        roughness: 0.08,
        metalness: 0.18,
        envMap: this.envTexture
      });

      // Vassoio rettangolare sterile in acciaio inox AISI 316
      const tray = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.035, 1.56), steelMat);
      tray.position.y = 0.018;
      tray.receiveShadow = true;
      tray.castShadow = true;
      g.add(tray);

      // Portaprovette inox con 4 provette diagnostiche (Ureasi, Coagulasi, Indolo, Tioglicolato)
      const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.03, 0.34), steelMat);
      rackBase.position.set(-0.08, 0.05, -0.36);
      g.add(rackBase);
      const rackUpper = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.025, 0.34), steelMat);
      rackUpper.position.set(-0.08, 0.46, -0.36);
      g.add(rackUpper);

      [-0.52, 0.36].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.44, 12), steelMat);
        post.position.set(px, 0.25, -0.36);
        g.add(post);
      });

      const tubeColors = [0xf43f8e, 0xfbbf24, 0xd4b46a, 0xe5cf8e];
      const capColors = [0x0284c7, 0xef4444, 0x0f766e, 0x334155];
      tubeColors.forEach((liqCol, idx) => {
        const tx = -0.38 + idx * 0.21;
        const tz = -0.36;
        const tubeGlass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.062, 0.062, 0.72, 18),
          glassMat
        );
        tubeGlass.position.set(tx, 0.43, tz);
        tubeGlass.castShadow = true;
        g.add(tubeGlass);

        const liquid = new THREE.Mesh(
          new THREE.CylinderGeometry(0.052, 0.052, 0.42, 16),
          new THREE.MeshStandardMaterial({ color: liqCol, roughness: 0.25 })
        );
        liquid.position.set(tx, 0.28, tz);
        g.add(liquid);

        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.068, 0.09, 18),
          new THREE.MeshStandardMaterial({ color: capColors[idx], roughness: 0.4 })
        );
        cap.position.set(tx, 0.81, tz);
        g.add(cap);
      });

      // Flacone contagocce ambrato H₂O₂ 3% (Perossidasi/Catalasi) con pipetta azzurra
      const bottleGroup = new THREE.Group();
      bottleGroup.position.set(-0.28, 0.035, 0.34);

      const amberGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.18, 0.46, 24),
        new THREE.MeshStandardMaterial({
          color: 0x78350f,
          roughness: 0.16,
          metalness: 0.12,
          envMap: this.envTexture
        })
      );
      amberGlass.position.y = 0.23;
      amberGlass.castShadow = true;
      bottleGroup.add(amberGlass);

      const bottleLabel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.176, 0.182, 0.22, 24, 1, true, -0.9, 1.8),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide })
      );
      bottleLabel.position.y = 0.23;
      bottleGroup.add(bottleLabel);

      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.11, 0.1, 20),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      );
      collar.position.y = 0.5;
      bottleGroup.add(collar);

      const rubberBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 20, 18),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.32 })
      );
      rubberBulb.scale.set(0.85, 1.45, 0.85);
      rubberBulb.position.y = 0.64;
      bottleGroup.add(rubberBulb);
      g.add(bottleGroup);

      // Becher in vetro con Anse Batteriologiche Sterili bianche e gialle (come in FIGURA 19!)
      const beakerGroup = new THREE.Group();
      beakerGroup.position.set(0.28, 0.035, 0.3);

      const beakerGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.19, 0.52, 26, 1, true),
        glassMat
      );
      beakerGlass.position.y = 0.26;
      beakerGroup.add(beakerGlass);

      const ethanolLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.185, 0.18, 0.24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.35,
          roughness: 0.1
        })
      );
      ethanolLiquid.position.y = 0.13;
      beakerGroup.add(ethanolLiquid);

      const loopColors = [0xfef08a, 0xffffff, 0xfde047, 0xf8fafc, 0xfef08a, 0xffffff, 0x38bdf8];
      loopColors.forEach((lcol, idx) => {
        const ang = (idx / loopColors.length) * Math.PI * 2;
        const stick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.012, 0.86, 8),
          new THREE.MeshStandardMaterial({ color: lcol, roughness: 0.35 })
        );
        stick.position.set(Math.cos(ang) * 0.07, 0.45, Math.sin(ang) * 0.07);
        stick.rotation.z = Math.cos(ang) * 0.22;
        stick.rotation.x = Math.sin(ang) * 0.22;
        beakerGroup.add(stick);
      });
      g.add(beakerGroup);

      this.hoodHighlight = this.createHoverRing(0.85);
      this.hoodHighlight.position.set(0, 0.005, 0);
      g.add(this.hoodHighlight);

      this.scene.add(g);
      this.registerInteractable(
        g,
        'hood',
        '🛡️ Stazione Reagenti, Pipetta H₂O₂ & Anse (Cappa BSL-2)',
        'Clicca per aprire la postazione sotto cappa e lavorare con pipetta o terreni selettivi',
        new THREE.Vector3(-1.65, 1.85, 1.9),
        new THREE.Vector3(-1.95, 0.35, 0.25)
      );
    }

    createHoverRing(radius) {
      const THREE = window.THREE;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.045, radius, 48),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide
        })
      );
      ring.rotation.x = -Math.PI / 2;
      return ring;
    }

    // =========================================================================
    // AGGIORNAMENTO DINAMICO DEL CAMPIONE E DEI TEST SUL BANCONE 3D
    // =========================================================================
    updateBenchState({ bacterium, sampleCode, performedList, activeObjective, activeStainMode }) {
      if (!this.supported) return;
      if (bacterium) this.bacterium = bacterium;
      if (sampleCode) this.sampleCode = sampleCode;
      if (Array.isArray(performedList)) this.performedSummary = performedList;

      // Ruota fisicamente il revolver portaobiettivi 3D in base all'obiettivo selezionato!
      if (activeObjective && this.nosepieceTurret) {
        const targetRot =
          activeObjective === '100x'
            ? 0
            : activeObjective === '40x'
            ? -Math.PI / 2
            : -Math.PI;
        this.nosepieceTurret.rotation.y = targetRot;
      }

      // Colora la goccia sul vetrino del microscopio 3D in base alla colorazione attiva
      if (this.slideSmearMat && this.bacterium) {
        if (activeStainMode === 'ziehl') {
          this.slideSmearMat.color.setHex(this.bacterium.microscopy.acidFast ? 0xe11d48 : 0x2563eb);
        } else if (activeStainMode === 'spores') {
          this.slideSmearMat.color.setHex(0x10b981);
        } else if (activeStainMode === 'capsule') {
          this.slideSmearMat.color.setHex(0x334155);
        } else {
          this.slideSmearMat.color.setHex(
            this.bacterium.microscopy.gram === 'pos' ? 0x5b21b6 : 0xe11d68
          );
        }
      }

      this.refreshFrontPetriDish();
      this.refreshSecondaryPlates();
      this.refreshNotepadTexture();
      this.renderOnce();
    }

    refreshFrontPetriDish() {
      if (!this.bacterium || !this.petriCanvas) return;
      const THREE = window.THREE;
      const ctx = this.petriCanvas.getContext('2d');
      const S = 512;
      const cx = S / 2;
      const cy = S / 2;
      const R = S * 0.48;

      const pp = this.bacterium.primaryPlate;
      const agarHex = '#dec88a';
      this.agarSideMat.color.setStyle('#b99f58');

      ctx.clearRect(0, 0, S, S);
      const g = ctx.createRadialGradient(cx - 40, cy - 40, 18, cx, cy, R);
      g.addColorStop(0, '#ead8a2');
      g.addColorStop(0.78, agarHex);
      g.addColorStop(1, '#a98e47');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);

      if (pp.agarTint) {
        const tg = ctx.createRadialGradient(cx, cy, 12, cx, cy, R * 0.92);
        tg.addColorStop(0, pp.agarTint);
        tg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tg;
        ctx.fillRect(0, 0, S, S);
      }

      if (pp.texture === 'swarming') {
        for (let w = 1; w <= 7; w++) {
          ctx.strokeStyle = 'rgba(245, 242, 232, 0.32)';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.arc(cx - 50, cy - 50, w * 46, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Striscio a quadranti + colonie sulla texture 512x512
      ctx.strokeStyle = this.withAlpha(pp.colonyColor || '#f1f5f9', 0.65);
      ctx.lineCap = 'round';
      ctx.lineWidth = 9;
      for (let i = 0; i < 8; i++) {
        const y = cy - 155 + i * 20;
        ctx.beginPath();
        ctx.moveTo(cx - 145 + (i % 2) * 14, y);
        ctx.lineTo(cx - 10, y - 22);
        ctx.stroke();
      }
      ctx.lineWidth = 5.5;
      for (let i = 0; i < 6; i++) {
        const x = cx + 15 + i * 24;
        ctx.beginPath();
        ctx.moveTo(x, cy - 140 + i * 10);
        ctx.lineTo(x + 22, cy + 5);
        ctx.stroke();
      }

      // Ricostruisci anche le vere micro-colonie 3D in rilievo!
      while (this.colonyGroup3D.children.length > 0) {
        this.colonyGroup3D.remove(this.colonyGroup3D.children[0]);
      }

      const colMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pp.colonyColor || '#f1f5f9'),
        roughness: pp.texture === 'mucoid' ? 0.08 : pp.texture === 'rough' ? 0.82 : 0.28,
        metalness: 0.04,
        envMap: this.envTexture
      });

      const baseColR = Math.max(0.012, (pp.colonyRadius || 3.8) * 0.0044);
      const colGeo = new THREE.SphereGeometry(baseColR, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);

      let seed = 1337;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      for (let i = 0; i < 34; i++) {
        const ang = rand() * Math.PI * 2;
        const rad = (0.14 + rand() * 0.72) * 0.46;
        const mx = Math.cos(ang) * rad;
        const mz = Math.sin(ang) * rad;

        // Disegna alone e colonia anche sulla texture
        const tx = cx + (mx / 0.54) * (S * 0.48);
        const ty = cy + (mz / 0.54) * (S * 0.48);
        ctx.fillStyle = pp.colonyColor || '#f1f5f9';
        ctx.beginPath();
        ctx.arc(tx, ty, (pp.colonyRadius || 3.8) * 1.9, 0, Math.PI * 2);
        ctx.fill();

        const m = new THREE.Mesh(colGeo, colMat);
        const s = 0.75 + rand() * 0.55;
        m.scale.set(s, pp.texture === 'mucoid' ? s * 1.25 : s * 0.75, s);
        m.position.set(mx, 0, mz);
        this.colonyGroup3D.add(m);
      }

      this.petriTexture.needsUpdate = true;
    }

    refreshSecondaryPlates() {
      if (!this.secondaryPlateGroup) return;
      const THREE = window.THREE;
      while (this.secondaryPlateGroup.children.length > 0) {
        this.secondaryPlateGroup.remove(this.secondaryPlateGroup.children[0]);
      }

      const mediaEntries = this.performedSummary.filter((e) => e.agarColor).slice(-4);
      mediaEntries.forEach((entry, idx) => {
        const p = new THREE.Group();
        p.position.set((idx % 2) * 0.04, idx * 0.088, (idx % 2) * -0.04);

        const agar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.05, 32),
          new THREE.MeshStandardMaterial({ color: entry.agarColor, roughness: 0.32 })
        );
        agar.position.y = 0.03;
        p.add(agar);

        const glass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.34, 0.082, 32),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.34,
            roughness: 0.08,
            envMap: this.envTexture
          })
        );
        glass.position.y = 0.042;
        glass.castShadow = true;
        p.add(glass);

        this.secondaryPlateGroup.add(p);
      });
    }

    refreshNotepadTexture() {
      if (!this.notepadCanvas) return;
      const ctx = this.notepadCanvas.getContext('2d');
      const W = 512;
      const H = 640;

      ctx.fillStyle = '#fffef7';
      ctx.fillRect(0, 0, W, H);

      // Righe azzurre del blocchetto e margine rosso verticale
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2;
      for (let y = 110; y < H; y += 38) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(62, 0);
      ctx.lineTo(62, H);
      ctx.stroke();

      ctx.fillStyle = '#0f2942';
      ctx.font = '800 26px sans-serif';
      ctx.fillText(this.sampleCode || 'ISOLATO #01', 78, 72);

      ctx.fillStyle = '#0284c7';
      ctx.font = '700 18px monospace';
      ctx.fillText(`TEST REGISTRATI: ${this.performedSummary.length}`, 78, 102);

      ctx.fillStyle = '#1e293b';
      ctx.font = '700 23px "Caveat", cursive, sans-serif';

      if (this.performedSummary.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.fillText('• Clicca il taccuino per annotare', 78, 142);
        ctx.fillText('  i risultati e depennare specie...', 78, 180);
      } else {
        const recent = this.performedSummary.slice(-11);
        recent.forEach((item, idx) => {
          const y = 142 + idx * 38;
          ctx.fillStyle = '#0f2942';
          const line = `✓ ${item.shortName}: ${item.badge}`;
          ctx.fillText(line.slice(0, 36), 76, y);
        });
      }

      this.notepadTexture.needsUpdate = true;
    }

    withAlpha(hex, alpha) {
      if (!hex || !hex.startsWith('#')) return `rgba(241, 245, 249, ${alpha})`;
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }

    // =========================================================================
    // EVENTI PUNTATORE, RAYCASTING 3D & TRANSIZIONE CAMERA DOLLY
    // =========================================================================
    bindEvents() {
      const updateRayFromClient = (clientX, clientY) => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;
        const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.pointerNDC.x = nx;
        this.pointerNDC.y = ny;
        this.mouseVec.set(nx, ny);
        this.raycaster.setFromCamera(this.mouseVec, this.camera);
        const hits = this.raycaster.intersectObjects(this.interactables, false);
        return hits.length > 0 ? hits[0].object.userData.interactKey : null;
      };

      this.canvas.addEventListener('mousedown', (e) => {
        if (!this.enabled || this.paused || e.button !== 0) return;
        this.isDraggingBench = true;
        this.dragMoved = false;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
      });

      window.addEventListener('mouseup', () => {
        if (this.isDraggingBench) {
          this.isDraggingBench = false;
          this.canvas.style.cursor = this.hoveredKey ? 'pointer' : 'grab';
        }
      });

      this.canvas.addEventListener('mousemove', (e) => {
        if (!this.enabled || this.paused) return;
        if (this.isDraggingBench) {
          const dx = e.clientX - this.dragStart.x;
          const dy = e.clientY - this.dragStart.y;
          if (Math.hypot(dx, dy) > 6) {
            this.dragMoved = true;
          }
          if (this.dragMoved) {
            this.userOrbitX = Math.max(-1.45, Math.min(1.45, this.userOrbitX - dx * 0.0045));
            this.userOrbitY = Math.max(-0.55, Math.min(0.65, this.userOrbitY + dy * 0.0032));
            this.dragStart = { x: e.clientX, y: e.clientY };
            return;
          }
        }
        const key = updateRayFromClient(e.clientX, e.clientY);
        this.setHoveredKey(key, e.clientX, e.clientY);
      });

      this.canvas.addEventListener(
        'wheel',
        (e) => {
          if (!this.enabled || this.paused) return;
          // In schermo intero (o col cursore sul banco) consente uno zoom fluido sul bancone 3D
          if (document.body.classList.contains('bench-fullscreen-mode')) {
            e.preventDefault();
            this.userZoom = Math.max(-1.35, Math.min(0.95, this.userZoom + e.deltaY * 0.0018));
          }
        },
        { passive: false }
      );

      this.canvas.addEventListener('dblclick', (e) => {
        if (!this.enabled || this.paused) return;
        const key = updateRayFromClient(e.clientX, e.clientY);
        if (!key) {
          this.userOrbitX = 0;
          this.userOrbitY = 0;
          this.userZoom = 0;
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.pointerNDC.x = 0;
        this.pointerNDC.y = 0;
        this.setHoveredKey(null);
      });

      this.canvas.addEventListener('click', (e) => {
        if (!this.enabled || this.paused || this.camAnim.active) return;
        if (this.dragMoved) {
          this.dragMoved = false;
          return;
        }
        const key = updateRayFromClient(e.clientX, e.clientY);
        if (key) {
          this.zoomToStationAndTrigger(key);
        }
      });

      this.canvas.addEventListener(
        'touchstart',
        (e) => {
          if (!this.enabled || this.paused || this.camAnim.active) return;
          if (e.touches.length > 0) {
            const t = e.touches[0];
            const key = updateRayFromClient(t.clientX, t.clientY);
            if (key) {
              this.zoomToStationAndTrigger(key);
            }
          }
        },
        { passive: true }
      );

      window.addEventListener('resize', () => this.resize());
      if (typeof ResizeObserver !== 'undefined' && this.container) {
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(this.container);
      }
    }

    setHoveredKey(key) {
      if (this.hoveredKey === key) return;
      this.hoveredKey = key;
      if (!this.isDraggingBench) {
        this.canvas.style.cursor = key ? 'pointer' : 'grab';
      }

      const rings = {
        microscope: this.microscopeHighlight,
        petri: this.petriHighlight,
        notepad: this.notepadHighlight,
        atlas: this.atlasHighlight,
        hood: this.hoodHighlight
      };

      Object.keys(rings).forEach((k) => {
        if (rings[k]) {
          rings[k].material.opacity = k === key ? 0.78 : 0.0;
        }
      });

      if (this.callbacks.onHoverChange) {
        const info = key ? this.groupMap[key] : null;
        this.callbacks.onHoverChange(info);
      }
    }

    zoomToStationAndTrigger(key) {
      // Interruttori fisici 3D sulla fascia della Cappa BSL-2: commutazione istantanea senza cambio vista!
      if (key === 'hood_air_toggle') {
        if (this.callbacks.onToggleHood) this.callbacks.onToggleHood('air');
        return;
      }
      if (key === 'hood_light_toggle') {
        if (this.callbacks.onToggleHood) this.callbacks.onToggleHood('light');
        return;
      }

      const info = this.groupMap[key];
      if (!info) return;
      if (window.labAudio) window.labAudio.playClick();

      this.camAnim = {
        active: true,
        startTime: performance.now(),
        duration: 310,
        fromPos: this.camera.position.clone(),
        toPos: info.focusPos.clone(),
        fromTarget: this.currentLookTarget.clone(),
        toTarget: info.focusTarget.clone(),
        onDone: () => {
          if (this.callbacks.onSelectStation) {
            this.callbacks.onSelectStation(key);
          }
        }
      };
      this.ensureLoop();
    }

    resetCameraSmooth() {
      if (!this.supported) return;
      this.paused = false;
      this.userOrbitX = 0;
      this.userOrbitY = 0;
      this.userZoom = 0;
      this.camAnim = {
        active: true,
        startTime: performance.now(),
        duration: 340,
        fromPos: this.camera.position.clone(),
        toPos: this.defaultCamPos.clone(),
        fromTarget: this.currentLookTarget.clone(),
        toTarget: this.defaultLookTarget.clone(),
        onDone: null
      };
      this.ensureLoop();
    }

    setEnabled(flag) {
      if (!this.supported) return;
      this.enabled = !!flag;
      if (this.enabled) {
        this.paused = false;
        this.camera.position.copy(this.defaultCamPos);
        this.currentLookTarget.copy(this.defaultLookTarget);
        this.resize();
        this.ensureLoop();
      } else {
        this.stopLoop();
      }
    }

    setPaused(flag) {
      this.paused = !!flag;
      if (!this.paused && this.enabled) {
        this.ensureLoop();
      }
    }

    resize() {
      if (!this.supported || !this.container) return;
      const cw = this.container.clientWidth || this.container.getBoundingClientRect().width;
      const ch = this.container.clientHeight || this.container.getBoundingClientRect().height;
      const w = Math.max(320, Math.floor(cw));
      const h = Math.max(350, Math.floor(ch));
      const aspect = w / h;
      this.camera.aspect = aspect;
      this.camera.fov = aspect < 1.25 ? 43 : aspect > 1.85 ? 35 : 37;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
      this.renderOnce();
    }

    ensureLoop() {
      if (!this.supported || !this.enabled || this.animFrame) return;
      this.lastFrameAt = performance.now();
      const tick = (now) => {
        if (!this.enabled || (this.paused && !this.camAnim.active)) {
          this.animFrame = null;
          return;
        }
        const dt = Math.min(0.05, (now - (this.lastFrameAt || now)) * 0.001);
        this.lastFrameAt = now;
        this.updateFrame(now, dt);
        this.renderer.render(this.scene, this.camera);
        this.animFrame = requestAnimationFrame(tick);
      };
      this.animFrame = requestAnimationFrame(tick);
    }

    stopLoop() {
      if (this.animFrame) {
        cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
      }
    }

    updateFrame(now, dt = 0.016) {
      const t = (now - this.clockStart) * 0.001;

      // Lieve pulsazione realistica del condensatore LED del microscopio
      if (this.substageLight) {
        this.substageLight.intensity = 0.82 + Math.sin(t * 2.4) * 0.05;
      }

      // Flusso d'aria laminare verticale 3D dentro la Cappa BSL-2 quando attiva
      if (this.hoodAirOn && this.hoodAirStreaks.length > 0) {
        for (let i = 0; i < this.hoodAirStreaks.length; i++) {
          const s = this.hoodAirStreaks[i];
          s.position.y -= s.userData.speed * dt;
          if (s.position.y < 0.22) {
            s.position.y = 2.26;
          }
        }
      }

      // Sollevamento millimetrico morbido dell'oggetto 3D sotto il cursore
      Object.keys(this.groupMap).forEach((k) => {
        if (k === 'hood_air_toggle' || k === 'hood_light_toggle') return;
        const entry = this.groupMap[k];
        const targetY = entry.baseY + (this.hoveredKey === k ? 0.035 : 0);
        entry.group.position.y += (targetY - entry.group.position.y) * 0.18;
      });

      if (this.camAnim.active) {
        const u = Math.min(1, (now - this.camAnim.startTime) / this.camAnim.duration);
        const eased = 1 - Math.pow(1 - u, 3);
        this.camera.position.lerpVectors(this.camAnim.fromPos, this.camAnim.toPos, eased);
        this.currentLookTarget.lerpVectors(this.camAnim.fromTarget, this.camAnim.toTarget, eased);
        this.camera.lookAt(this.currentLookTarget);
        if (u >= 1) {
          this.camAnim.active = false;
          const cb = this.camAnim.onDone;
          this.camAnim.onDone = null;
          if (cb) cb();
        }
      } else {
        // Parallasse + rotazione/zoom fluido manuale sul bancone 3D (perfetto a Schermo Intero!)
        this.smoothLook.x += (this.pointerNDC.x * 0.2 + this.userOrbitX - this.smoothLook.x) * 0.09;
        this.smoothLook.y += (this.pointerNDC.y * 0.11 + this.userOrbitY - this.smoothLook.y) * 0.09;

        this.camera.position.set(
          this.defaultCamPos.x + this.smoothLook.x,
          this.defaultCamPos.y + this.smoothLook.y * 0.65 + this.userZoom * 0.35,
          this.defaultCamPos.z + this.userZoom
        );
        this.currentLookTarget.set(
          this.defaultLookTarget.x + this.smoothLook.x * 0.32,
          this.defaultLookTarget.y + this.smoothLook.y * 0.22,
          this.defaultLookTarget.z
        );
        this.camera.lookAt(this.currentLookTarget);
      }
    }

    renderOnce() {
      if (!this.supported || !this.renderer) return;
      this.renderer.render(this.scene, this.camera);
    }
  }

  window.LabBench3D = LabBench3D;
})();
