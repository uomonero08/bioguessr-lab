/**
 * BioGuessr Lab v3.0 - Controller Principale, Bancone 3D, Schermate Ravvicinate & Doppio Quaderno
 */
(function () {
  const { TESTS_CATALOG, BACTERIA_DB, evaluateTest } = window.BioGuessrData;
  const MAX_ERRORS = 5;
  const BASE_ROUND_SCORE = 1000;
  const MIN_WIN_SCORE = 100;
  const WRONG_GUESS_PENALTY = 80;

  const state = {
    deck: [],
    sampleNumber: 0,
    currentBacterium: null,
    roundSeed: 0,
    potentialScore: BASE_ROUND_SCORE,
    totalScore: 0,
    solvedIds: new Set(),
    errors: 0,
    wrongGuesses: [],

    // Modalità Dispositivo (Auto / Smartphone / Desktop) & Navigazione Mobile
    deviceModePref: 'auto',
    isMobileLayout: false,
    activeMobileTab: 'microscope',

    // Start Screen & Transizione Chimica
    gameStarted: false,
    masterVolume: 0.8,

    // Modalità Realistica, Bancone 3D, Schermo Intero & Schermata Ravvicinata
    realisticMode: false,
    benchFullscreen: false,
    fsTestsOpen: false,
    fsGuessOpen: false,
    inspectionOpen: false,
    hoodAirOn: true,
    hoodLightOn: true,

    // Test completati vs procedura interattiva/automatica in corso
    performedTests: new Map(), // testId -> evalResult
    pendingTests: new Map(), // testId -> evalResult (pagato, in esecuzione nella schermata dedicata)
    ruledOutIds: new Set(),
    userNotes: '',

    activeCategory: 'stains',
    activeViewKey: 'primary',
    atlasFilter: 'all',
    atlasQuery: '',
    atlasChipFilter: 'all',
    treeQuery: '',
    treeSelectedSpeciesId: null,
    selectedDetailSpeciesId: null,

    roundEnded: false,
    roundWon: false,
    highlightedSuggestionIdx: -1,
    currentFilteredSuggestions: []
  };

  const els = {};
  let renderer = null;
  let bench3d = null;

  function cacheDom() {
    // Start Screen & Menu Apertura
    els.startScreen = document.getElementById('startScreen');
    els.startPlayBtn = document.getElementById('startPlayBtn');
    els.startSettingsBtn = document.getElementById('startSettingsBtn');
    els.startSettingsDrawer = document.getElementById('startSettingsDrawer');
    els.startAtlasQuickBtn = document.getElementById('startAtlasQuickBtn');
    els.masterVolumeSlider = document.getElementById('masterVolumeSlider');
    els.masterVolumeVal = document.getElementById('masterVolumeVal');
    els.startSoundToggleBtn = document.getElementById('startSoundToggleBtn');
    els.startSoundIcon = document.getElementById('startSoundIcon');
    els.startRealisticToggle = document.getElementById('startRealisticToggle');
    els.startHoodAirToggle = document.getElementById('startHoodAirToggle');
    els.chemTransitionCurtain = document.getElementById('chemTransitionCurtain');
    els.chemBubblesContainer = document.getElementById('chemBubblesContainer');

    els.realisticModeBtn = document.getElementById('realisticModeBtn');
    els.realisticKnob = document.getElementById('realisticKnob');
    els.realisticModeLabel = document.getElementById('realisticModeLabel');

    els.potentialScoreEl = document.getElementById('potentialScoreEl');
    els.scoreDeltaAnchor = document.getElementById('scoreDeltaAnchor');
    els.errorCountText = document.getElementById('errorCountText');
    els.lifeVials = document.getElementById('lifeVials');
    els.totalScoreEl = document.getElementById('totalScoreEl');
    els.solvedCounterEl = document.getElementById('solvedCounterEl');

    els.openNotepadBtn = document.getElementById('openNotepadBtn');
    els.openNotepadDeskBtn = document.getElementById('openNotepadDeskBtn');
    els.notepadBadgeCount = document.getElementById('notepadBadgeCount');
    els.openAtlasBtn = document.getElementById('openAtlasBtn');
    els.openAtlasDeskBtn = document.getElementById('openAtlasDeskBtn');
    els.soundToggleBtn = document.getElementById('soundToggleBtn');
    els.soundIcon = document.getElementById('soundIcon');
    els.skipSampleBtn = document.getElementById('skipSampleBtn');
    els.shareAppBtn = document.getElementById('shareAppBtn');
    els.startShareBtn = document.getElementById('startShareBtn');
    els.shareResultBtn = document.getElementById('shareResultBtn');
    els.labToast = document.getElementById('labToast');
    els.labToastMsg = document.getElementById('labToastMsg');

    els.sampleCodeEl = document.getElementById('sampleCodeEl');
    els.hoodControlsBar = document.getElementById('hoodControlsBar');
    els.hoodAirBtn = document.getElementById('hoodAirBtn');
    els.hoodAirLabel = document.getElementById('hoodAirLabel');
    els.hoodLightBtn = document.getElementById('hoodLightBtn');
    els.hoodLightLabel = document.getElementById('hoodLightLabel');
    els.benchFullscreenBtn = document.getElementById('benchFullscreenBtn');
    els.inlineViewportControls = document.getElementById('inlineViewportControls');
    els.backlightBtn = document.getElementById('backlightBtn');
    els.backlightState = document.getElementById('backlightState');

    els.unlockedViewsBar = document.getElementById('unlockedViewsBar');

    // Bancone 3D & HUD Schermo Intero (Modalità Realistica: ON)
    els.bench3dWrapper = document.getElementById('bench3dWrapper');
    els.bench3dStage = document.getElementById('bench3dStage');
    els.bench3dCanvas = document.getElementById('bench3dCanvas');
    els.benchFsTopBar = document.getElementById('benchFsTopBar');
    els.fsSampleCodeEl = document.getElementById('fsSampleCodeEl');
    els.fsScoreEl = document.getElementById('fsScoreEl');
    els.fsErrorsEl = document.getElementById('fsErrorsEl');
    els.fsHoodAirBtn = document.getElementById('fsHoodAirBtn');
    els.fsHoodAirLabel = document.getElementById('fsHoodAirLabel');
    els.fsHoodLightBtn = document.getElementById('fsHoodLightBtn');
    els.fsHoodLightLabel = document.getElementById('fsHoodLightLabel');
    els.fsToggleTestsBtn = document.getElementById('fsToggleTestsBtn');
    els.fsToggleGuessBtn = document.getElementById('fsToggleGuessBtn');
    els.fsOpenNotepadBtn = document.getElementById('fsOpenNotepadBtn');
    els.fsOpenAtlasBtn = document.getElementById('fsOpenAtlasBtn');
    els.fsExitFullscreenBtn = document.getElementById('fsExitFullscreenBtn');
    els.benchStandardBadge = document.getElementById('benchStandardBadge');
    els.bench3dTooltip = document.getElementById('bench3dTooltip');
    els.bench3dTooltipTitle = document.getElementById('bench3dTooltipTitle');
    els.bench3dTooltipSub = document.getElementById('bench3dTooltipSub');
    els.benchOpenMicroscopeBtn = document.getElementById('benchOpenMicroscopeBtn');
    els.benchOpenPetriBtn = document.getElementById('benchOpenPetriBtn');
    els.benchOpenNotepadBtn = document.getElementById('benchOpenNotepadBtn');
    els.benchOpenAtlasBtn = document.getElementById('benchOpenAtlasBtn');

    // Palcoscenico 2D Classico (Modalità Realistica: OFF)
    els.classicStageWrapper = document.getElementById('classicStageWrapper');
    els.microscopeConsole = document.getElementById('microscopeConsole');
    els.macroFocusSlider = document.getElementById('macroFocusSlider');
    els.microFocusSlider = document.getElementById('microFocusSlider');
    els.condenserSlider = document.getElementById('condenserSlider');
    els.centerStageBtn = document.getElementById('centerStageBtn');

    els.interactivePromptBubble = document.getElementById('interactivePromptBubble');
    els.interactivePromptText = document.getElementById('interactivePromptText');
    els.completeStepFastBtn = document.getElementById('completeStepFastBtn');

    els.labCanvas = document.getElementById('labCanvas');
    els.canvasHintPill = document.getElementById('canvasHintPill');
    els.labActionOverlay = document.getElementById('labActionOverlay');
    els.labActionText = document.getElementById('labActionText');

    els.obsTitle = document.getElementById('obsTitle');
    els.obsBadge = document.getElementById('obsBadge');
    els.obsDetail = document.getElementById('obsDetail');

    // Schermata Ravvicinata Dedicata (Modalità Realistica: ON)
    els.realisticInspectionModal = document.getElementById('realisticInspectionModal');
    els.inspectionStationKicker = document.getElementById('inspectionStationKicker');
    els.inspectionStationTitle = document.getElementById('inspectionStationTitle');
    els.modalHoodControlsBar = document.getElementById('modalHoodControlsBar');
    els.modalHoodAirBtn = document.getElementById('modalHoodAirBtn');
    els.modalHoodAirLabel = document.getElementById('modalHoodAirLabel');
    els.modalHoodLightBtn = document.getElementById('modalHoodLightBtn');
    els.modalHoodLightLabel = document.getElementById('modalHoodLightLabel');
    els.modalReplayStreakBtn = document.getElementById('modalReplayStreakBtn');
    els.modalBacklightBtn = document.getElementById('modalBacklightBtn');
    els.modalBacklightState = document.getElementById('modalBacklightState');
    els.modalOpenNotepadBtn = document.getElementById('modalOpenNotepadBtn');
    els.closeInspectionModalBtn = document.getElementById('closeInspectionModalBtn');
    els.modalUnlockedViewsBar = document.getElementById('modalUnlockedViewsBar');
    els.modalStainQuickBar = document.getElementById('modalStainQuickBar');
    els.modalStainButtons = document.getElementById('modalStainButtons');
    els.modalMicroscopeConsole = document.getElementById('modalMicroscopeConsole');
    els.modalMacroFocusSlider = document.getElementById('modalMacroFocusSlider');
    els.modalMicroFocusSlider = document.getElementById('modalMicroFocusSlider');
    els.modalCondenserSlider = document.getElementById('modalCondenserSlider');
    els.modalCenterStageBtn = document.getElementById('modalCenterStageBtn');
    els.modalPromptBubble = document.getElementById('modalPromptBubble');
    els.modalPromptText = document.getElementById('modalPromptText');
    els.modalCompleteFastBtn = document.getElementById('modalCompleteFastBtn');
    els.inspectionCanvas = document.getElementById('inspectionCanvas');
    els.micrographCreditPill = document.getElementById('micrographCreditPill');
    els.modalCanvasHintPill = document.getElementById('modalCanvasHintPill');
    els.modalObsTitle = document.getElementById('modalObsTitle');
    els.modalObsBadge = document.getElementById('modalObsBadge');
    els.modalObsDetail = document.getElementById('modalObsDetail');

    els.guessCard = document.getElementById('guessCard');
    els.errorsSummaryPill = document.getElementById('errorsSummaryPill');
    els.closeFsGuessBtn = document.getElementById('closeFsGuessBtn');
    els.guessForm = document.getElementById('guessForm');
    els.speciesInput = document.getElementById('speciesInput');
    els.clearInputBtn = document.getElementById('clearInputBtn');
    els.suggestionsDropdown = document.getElementById('suggestionsDropdown');
    els.submitGuessBtn = document.getElementById('submitGuessBtn');
    els.quickChipsContainer = document.getElementById('quickChipsContainer');
    els.attemptsLog = document.getElementById('attemptsLog');

    els.workbenchColumn = document.getElementById('workbenchColumn');
    els.testsUsedBadge = document.getElementById('testsUsedBadge');
    els.closeFsTestsBtn = document.getElementById('closeFsTestsBtn');
    els.testsListContainer = document.getElementById('testsListContainer');
    els.recentResultsStrip = document.getElementById('recentResultsStrip');
    els.emptyRecentState = document.getElementById('emptyRecentState');

    // Quaderno 1: Blocchetto Note
    els.notepadModal = document.getElementById('notepadModal');
    els.closeNotepadBtn = document.getElementById('closeNotepadBtn');
    els.reportCountEl = document.getElementById('reportCountEl');
    els.emptyReportState = document.getElementById('emptyReportState');
    els.reportItemsList = document.getElementById('reportItemsList');
    els.npResultsPage = document.getElementById('npResultsPage');
    els.npNotesPage = document.getElementById('npNotesPage');
    els.npChecklistPage = document.getElementById('npChecklistPage');
    els.userLabNotesArea = document.getElementById('userLabNotesArea');
    els.clearNotesBtn = document.getElementById('clearNotesBtn');
    els.suspectsGrid = document.getElementById('suspectsGrid');

    // Quaderno 2: Atlante dei Batteri (100 Specie, Filtri Avanzati, Albero Genealogico & Dossier)
    els.atlasModal = document.getElementById('atlasModal');
    els.closeAtlasBtn = document.getElementById('closeAtlasBtn');
    els.atlasSearchWrap = document.getElementById('atlasSearchWrap');
    els.atlasSearchInput = document.getElementById('atlasSearchInput');
    els.atlasChipsBar = document.getElementById('atlasChipsBar');
    els.atlasSearchCountPill = document.getElementById('atlasSearchCountPill');
    els.atlasSpeciesTab = document.getElementById('atlasSpeciesTab');
    els.atlasFlowchartTab = document.getElementById('atlasFlowchartTab');
    els.atlasTreeTab = document.getElementById('atlasTreeTab');
    els.atlasSpeciesContainer = document.getElementById('atlasSpeciesContainer');

    // Albero Genealogico Tassonomico & Side Inspector
    els.atlasTreeRoot = document.getElementById('atlasTreeRoot');
    els.atlasTreeSearch = document.getElementById('atlasTreeSearch');
    els.atlasTreeExpandBtn = document.getElementById('atlasTreeExpandBtn');
    els.atlasTreeCollapseBtn = document.getElementById('atlasTreeCollapseBtn');
    els.atlasTreeInspector = document.getElementById('atlasTreeInspector');
    els.treeEmptyInspector = document.getElementById('treeEmptyInspector');
    els.treeSpecDetails = document.getElementById('treeSpecDetails');

    // Modale Scheda Dettaglio Specie Completa & Letteratura Scientifica
    els.speciesDetailModal = document.getElementById('speciesDetailModal');
    els.detailTaxonomyLineage = document.getElementById('detailTaxonomyLineage');
    els.detailSpeciesTitle = document.getElementById('detailSpeciesTitle');
    els.detailSpeciesAliases = document.getElementById('detailSpeciesAliases');
    els.detailBslBadge = document.getElementById('detailBslBadge');
    els.closeSpeciesDetailBtn = document.getElementById('closeSpeciesDetailBtn');
    els.detailMicrographCanvas = document.getElementById('detailMicrographCanvas');
    els.detailMicroCaption = document.getElementById('detailMicroCaption');
    els.detailPlateDesc = document.getElementById('detailPlateDesc');
    els.detailGoldStandardBox = document.getElementById('detailGoldStandardBox');
    els.detailMarkersGrid = document.getElementById('detailMarkersGrid');
    els.detailMediaChips = document.getElementById('detailMediaChips');
    els.detailClinicalOverview = document.getElementById('detailClinicalOverview');
    els.detailDiseasesTags = document.getElementById('detailDiseasesTags');
    els.detailLiteratureList = document.getElementById('detailLiteratureList');
    els.detailCloseBottomBtn = document.getElementById('detailCloseBottomBtn');
    els.detailSelectForLabBtn = document.getElementById('detailSelectForLabBtn');

    // Modale Risultato
    els.resultModal = document.getElementById('resultModal');
    els.modalResultBanner = document.getElementById('modalResultBanner');
    els.modalResultIcon = document.getElementById('modalResultIcon');
    els.modalResultKicker = document.getElementById('modalResultKicker');
    els.modalResultTitle = document.getElementById('modalResultTitle');
    els.modalResultTaxonomy = document.getElementById('modalResultTaxonomy');
    els.modalScoreEarned = document.getElementById('modalScoreEarned');
    els.modalTestsCount = document.getElementById('modalTestsCount');
    els.modalErrorsCount = document.getElementById('modalErrorsCount');
    els.modalGoldStandard = document.getElementById('modalGoldStandard');
    els.modalClinicalOverview = document.getElementById('modalClinicalOverview');
    els.inspectPlateAfterBtn = document.getElementById('inspectPlateAfterBtn');
    els.nextSampleModalBtn = document.getElementById('nextSampleModalBtn');

    // Modalità Dispositivo (Auto / Smartphone / Desktop)
    els.startDeviceModeCard = document.querySelector('.start-device-mode-card');
    els.deviceModeBadge = document.getElementById('deviceModeBadge');
    els.deviceModeCaption = document.getElementById('deviceModeCaption');
    els.devModeAuto = document.getElementById('devModeAuto');
    els.devModeMobile = document.getElementById('devModeMobile');
    els.devModeDesktop = document.getElementById('devModeDesktop');
    els.settDevAuto = document.getElementById('settDevAuto');
    els.settDevMobile = document.getElementById('settDevMobile');
    els.settDevDesktop = document.getElementById('settDevDesktop');
    els.deviceModeHeaderBtn = document.getElementById('deviceModeHeaderBtn');
    els.deviceModeHeaderIcon = document.getElementById('deviceModeHeaderIcon');
    els.deviceModeHeaderLabel = document.getElementById('deviceModeHeaderLabel');

    // Barra Navigazione Mobile Inferiore & Componenti Smartphone
    els.mobileBottomNav = document.getElementById('mobileBottomNav');
    els.mobTabMicroscope = document.getElementById('mobTabMicroscope');
    els.mobTabTests = document.getElementById('mobTabTests');
    els.mobTabGuess = document.getElementById('mobTabGuess');
    els.mobTabNotebooks = document.getElementById('mobTabNotebooks');
    els.mobTestsCountBadge = document.getElementById('mobTestsCountBadge');
    els.mobErrorsBadge = document.getElementById('mobErrorsBadge');
    els.mobNotesBadge = document.getElementById('mobNotesBadge');

    // Focus Touch Steppers
    els.macroStepDown = document.getElementById('macroStepDown');
    els.macroStepUp = document.getElementById('macroStepUp');
    els.microStepDown = document.getElementById('microStepDown');
    els.microStepUp = document.getElementById('microStepUp');

    // Scorciatoie Mobile
    els.mobQuickGoTestsBtn = document.getElementById('mobQuickGoTestsBtn');
    els.mobQuickGoGuessBtn = document.getElementById('mobQuickGoGuessBtn');
    els.mobQuickBackScopeBtn = document.getElementById('mobQuickBackScopeBtn');
    els.mobQuickTestsGoGuessBtn = document.getElementById('mobQuickTestsGoGuessBtn');

    // Notifica Mobile & Hub Quaderni
    els.mobileTestAlert = document.getElementById('mobileTestAlert');
    els.mobileTestAlertText = document.getElementById('mobileTestAlertText');
    els.mobileViewMicroscopeActionBtn = document.getElementById('mobileViewMicroscopeActionBtn');
    els.mobileDismissAlertBtn = document.getElementById('mobileDismissAlertBtn');
    els.mobileNotebooksHub = document.getElementById('mobileNotebooksHub');
    els.closeMobNotebooksHubBtn = document.getElementById('closeMobNotebooksHubBtn');
    els.mobOpenNotepadCard = document.getElementById('mobOpenNotepadCard');
    els.mobOpenAtlasCard = document.getElementById('mobOpenAtlasCard');
  }

  function init() {
    cacheDom();
    loadPersistedStats();

    renderer = new window.LabRenderer(els.labCanvas, {
      onProcedureProgress: (msg) => {
        els.interactivePromptText.textContent = msg;
        els.modalPromptText.textContent = msg;
      },
      onHoodWarning: () => {
        const warnMsg =
          '⚠️ Allarme BSL-2: attiva prima "Flusso Cappa: ON" in alto per lavorare in sicurezza!';
        els.interactivePromptBubble.classList.remove('hidden');
        els.interactivePromptText.textContent = warnMsg;
        els.modalPromptBubble.classList.remove('hidden');
        els.modalPromptText.textContent = warnMsg;
        window.labAudio.playWrong();
      },
      onRequestEnableHood: () => {
        setHoodAir(true);
      },
      onProcedureComplete: () => {
        finalizeActivePendingTest();
      }
    });

    if (typeof window.LabBench3D !== 'undefined' && els.bench3dStage && els.bench3dCanvas) {
      bench3d = new window.LabBench3D(els.bench3dStage, els.bench3dCanvas, {
        onHoverChange: (info) => {
          if (!info) {
            els.bench3dTooltip.classList.add('hidden');
          } else {
            els.bench3dTooltipTitle.textContent = info.label;
            els.bench3dTooltipSub.textContent = info.sublabel;
            els.bench3dTooltip.classList.remove('hidden');
          }
        },
        onSelectStation: (stationKey) => {
          handleBenchStationSelected(stationKey);
        },
        onToggleHood: (which) => {
          if (which === 'air') toggleHoodAir();
          else toggleHoodLight();
        }
      });
    }

    renderer.setRealisticMode(state.realisticMode);
    renderer.setHoodState(state.hoodAirOn, state.hoodLightOn);
    if (bench3d && bench3d.supported) {
      bench3d.setHoodState(state.hoodAirOn, state.hoodLightOn);
    }
    syncRealisticUI();
    updateDeviceModeUIElements();
    applyDeviceMode(resolveEffectiveIsMobile(), false);
    renderAtlasCards();
    bindEvents();
    startNewRound();
  }

  function loadPersistedStats() {
    try {
      const raw = localStorage.getItem('bioguessr_stats_v2');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object' && saved !== null) {
          state.totalScore = Math.max(0, Math.min(10000000, Number(saved.totalScore) || 0));
          if (Array.isArray(saved.solvedIds)) {
            const validIds = new Set(BACTERIA_DB.map((b) => b.id));
            state.solvedIds = new Set(
              saved.solvedIds.filter((id) => typeof id === 'string' && validIds.has(id))
            );
          }
          if (typeof saved.realisticMode === 'boolean') {
            state.realisticMode = saved.realisticMode;
          }
          if (typeof saved.masterVolume === 'number' && !isNaN(saved.masterVolume)) {
            state.masterVolume = Math.max(0, Math.min(1, saved.masterVolume));
          }
          if (saved.deviceModePref && ['auto', 'mobile', 'desktop'].includes(saved.deviceModePref)) {
            state.deviceModePref = saved.deviceModePref;
          }
        }
      }
      const directDevMode = localStorage.getItem('bioguessr_device_mode');
      if (directDevMode && ['auto', 'mobile', 'desktop'].includes(directDevMode)) {
        state.deviceModePref = directDevMode;
      }
    } catch (_) {}
  }

  function savePersistedStats() {
    try {
      localStorage.setItem(
        'bioguessr_stats_v2',
        JSON.stringify({
          totalScore: state.totalScore,
          solvedIds: Array.from(state.solvedIds),
          realisticMode: state.realisticMode,
          masterVolume: state.masterVolume,
          deviceModePref: state.deviceModePref
        })
      );
      localStorage.setItem('bioguessr_device_mode', state.deviceModePref);
    } catch (_) {}
  }

  // =========================================================================
  // GESTIONE SMARTPHONE FLUIDO, DETECTION TOUCH & COMMUTATORE DISPOSITIVO
  // =========================================================================
  function detectIsMobileDevice() {
    const isSmallWidth = window.innerWidth <= 840;
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return (isSmallWidth && hasTouch) || isMobileUA || isSmallWidth;
  }

  function resolveEffectiveIsMobile() {
    if (state.deviceModePref === 'mobile') return true;
    if (state.deviceModePref === 'desktop') return false;
    return detectIsMobileDevice();
  }

  function setDeviceModePreference(mode, triggerResize = true) {
    if (!['auto', 'mobile', 'desktop'].includes(mode)) mode = 'auto';
    state.deviceModePref = mode;

    try {
      localStorage.setItem('bioguessr_device_mode', mode);
    } catch (_) {}
    savePersistedStats();

    updateDeviceModeUIElements();
    const effectiveMobile = resolveEffectiveIsMobile();
    applyDeviceMode(effectiveMobile, triggerResize);
  }

  function toggleDeviceMode() {
    const currentlyMobile = state.isMobileLayout;
    setDeviceModePreference(currentlyMobile ? 'desktop' : 'mobile');
    showToast(
      currentlyMobile ? '💻 Passato a modalità Desktop' : '📱 Passato a modalità Smartphone touch',
      currentlyMobile ? '💻' : '📱'
    );
  }

  function updateDeviceModeUIElements() {
    const isDetectedMobile = detectIsMobileDevice();
    const currentMode = state.deviceModePref;

    const pills = [
      { el: els.devModeAuto, mode: 'auto' },
      { el: els.devModeMobile, mode: 'mobile' },
      { el: els.devModeDesktop, mode: 'desktop' },
      { el: els.settDevAuto, mode: 'auto' },
      { el: els.settDevMobile, mode: 'mobile' },
      { el: els.settDevDesktop, mode: 'desktop' }
    ];

    pills.forEach(({ el, mode }) => {
      if (!el) return;
      el.classList.toggle('active', currentMode === mode);
    });

    if (els.deviceModeBadge) {
      if (currentMode === 'auto') {
        els.deviceModeBadge.textContent = isDetectedMobile ? '⚡ Auto: Smartphone' : '⚡ Auto: Desktop';
      } else if (currentMode === 'mobile') {
        els.deviceModeBadge.textContent = '📱 Smartphone (Forzato)';
      } else {
        els.deviceModeBadge.textContent = '💻 Desktop (Forzato)';
      }
    }

    if (els.deviceModeCaption) {
      if (currentMode === 'auto') {
        els.deviceModeCaption.textContent = isDetectedMobile
          ? '⚡ Rilevamento automatico: touch rilevato, interfaccia Smartphone fluida attiva.'
          : '⚡ Rilevamento automatico: schermo ampio rilevato, interfaccia Desktop a 2 colonne attiva.';
      } else if (currentMode === 'mobile') {
        els.deviceModeCaption.textContent =
          '📱 Modalità Smartphone forzata: barra di navigazione inferiore a 4 schede attiva.';
      } else {
        els.deviceModeCaption.textContent =
          '💻 Modalità Desktop forzata: visualizzazione a schermo intero senza schede inferiori.';
      }
    }
  }

  function applyDeviceMode(effectiveIsMobile, triggerResize = true) {
    state.isMobileLayout = effectiveIsMobile;
    document.body.classList.toggle('ui-smartphone', effectiveIsMobile);
    document.body.classList.toggle('ui-desktop', !effectiveIsMobile);

    if (els.deviceModeHeaderIcon) {
      els.deviceModeHeaderIcon.textContent = effectiveIsMobile ? '📱' : '💻';
    }
    if (els.deviceModeHeaderLabel) {
      els.deviceModeHeaderLabel.textContent = effectiveIsMobile ? 'Mobile' : 'Desktop';
    }

    if (effectiveIsMobile) {
      setMobileTab(state.activeMobileTab || 'microscope');
    } else {
      document.body.classList.remove('tab-microscope', 'tab-tests', 'tab-guess', 'tab-notebooks');
      if (els.mobileNotebooksHub) {
        els.mobileNotebooksHub.classList.add('hidden');
      }
    }

    if (triggerResize) {
      setTimeout(() => {
        if (renderer && typeof renderer.resize === 'function') renderer.resize();
        if (bench3d && typeof bench3d.resize === 'function') bench3d.resize();
      }, 60);
    }
  }

  function setMobileTab(tabKey) {
    if (!['microscope', 'tests', 'guess', 'notebooks'].includes(tabKey)) tabKey = 'microscope';
    state.activeMobileTab = tabKey;

    document.body.classList.remove('tab-microscope', 'tab-tests', 'tab-guess', 'tab-notebooks');
    document.body.classList.add(`tab-${tabKey}`);

    const tabs = [
      { el: els.mobTabMicroscope, key: 'microscope' },
      { el: els.mobTabTests, key: 'tests' },
      { el: els.mobTabGuess, key: 'guess' },
      { el: els.mobTabNotebooks, key: 'notebooks' }
    ];

    tabs.forEach(({ el, key }) => {
      if (!el) return;
      el.classList.toggle('active', key === tabKey);
    });

    if (tabKey === 'notebooks') {
      if (els.mobileNotebooksHub) {
        els.mobileNotebooksHub.classList.remove('hidden');
      }
    } else {
      if (els.mobileNotebooksHub) {
        els.mobileNotebooksHub.classList.add('hidden');
      }
    }

    if (tabKey === 'microscope') {
      setTimeout(() => {
        if (renderer && typeof renderer.resize === 'function') renderer.resize();
        if (bench3d && typeof bench3d.resize === 'function') bench3d.resize();
      }, 40);
    }
  }

  let mobileAlertTimer = null;
  function showMobileTestAlert(testName, cost, testId) {
    if (!state.isMobileLayout || !els.mobileTestAlert) return;
    if (els.mobileTestAlertText) {
      els.mobileTestAlertText.textContent = `Test "${testName}" completato (-${cost} pt)!`;
    }
    els.mobileTestAlert.classList.remove('hidden');

    if (mobileAlertTimer) clearTimeout(mobileAlertTimer);
    mobileAlertTimer = setTimeout(() => {
      if (els.mobileTestAlert) els.mobileTestAlert.classList.add('hidden');
    }, 5500);
  }

  function refillDeck() {
    let pool = BACTERIA_DB.filter((b) => !state.solvedIds.has(b.id));
    if (pool.length === 0) {
      pool = [...BACTERIA_DB];
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    state.deck = pool;
  }

  function startNewRound() {
    if (state.deck.length === 0) refillDeck();
    let nextBact = state.deck.pop();

    // Supporto sfida condivisa da URL (es. ?sample=staphylococcus_aureus)
    if (state.sampleNumber === 0) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('sample') || urlParams.get('ceppo') || urlParams.get('bacterium');
        if (targetId) {
          const matched = BACTERIA_DB.find(
            (b) => b.id === targetId || b.id.toLowerCase() === targetId.toLowerCase()
          );
          if (matched) {
            nextBact = matched;
            setTimeout(() => {
              showToast(`🎯 Sfida avviata sul ceppo: ${matched.name}`, '🧪');
            }, 500);
          }
        }
      } catch (_) {}
    }

    state.sampleNumber += 1;
    state.currentBacterium = nextBact;
    state.roundSeed = Math.floor(Math.random() * 0x7fffffff);
    state.potentialScore = BASE_ROUND_SCORE;
    state.errors = 0;
    state.wrongGuesses = [];
    state.performedTests.clear();
    state.pendingTests.clear();
    state.ruledOutIds.clear();
    state.userNotes = '';
    els.userLabNotesArea.value = '';
    state.activeViewKey = 'primary';
    state.roundEnded = false;
    state.roundWon = false;

    if (state.inspectionOpen) {
      closeInspectionModal(true);
    }

    els.resultModal.classList.add('hidden');
    els.interactivePromptBubble.classList.add('hidden');
    els.modalPromptBubble.classList.add('hidden');
    els.speciesInput.value = '';
    els.speciesInput.disabled = false;
    els.clearInputBtn.classList.add('hidden');
    els.submitGuessBtn.disabled = false;
    els.submitGuessBtn.innerHTML = '<span>Conferma Specie</span><span class="submit-arrow">→</span>';
    hideSuggestions();

    const codeNum = String(state.sampleNumber).padStart(2, '0');
    els.sampleCodeEl.textContent = `ISOLATO CLINICO #${codeNum}`;
    if (els.fsSampleCodeEl) {
      els.fsSampleCodeEl.textContent = `ISOLATO #${codeNum}`;
    }

    const use3DBench = !!(state.realisticMode && bench3d && bench3d.supported);
    renderer.useCanvas(use3DBench ? els.inspectionCanvas : els.labCanvas);
    renderer.setSample(nextBact, state.roundSeed);
    updateBacklightUI(false);
    switchLabView('primary', false);
    if (use3DBench && !state.inspectionOpen) {
      renderer.stopAnimation();
    }
    syncBench3DState();

    renderHUD();
    renderCategoryTests();
    renderNotepadAndRecent();
    renderSuspectsGrid();
    renderAttemptsLog();
    renderQuickChips();
  }

  // =========================================================================
  // MODALITÀ REALISTICA, BANCONE 3D, SCHERMO INTERO & CAPPA BSL-2
  // =========================================================================
  function setHoodAir(on) {
    state.hoodAirOn = !!on;
    window.labAudio.playClick();
    if (renderer) renderer.setHoodState(state.hoodAirOn, state.hoodLightOn);
    if (bench3d && bench3d.supported) bench3d.setHoodState(state.hoodAirOn, state.hoodLightOn);
    syncRealisticUI();
    updateEnvironmentControlsForView();
  }

  function toggleHoodAir() {
    setHoodAir(!state.hoodAirOn);
  }

  function toggleHoodLight() {
    state.hoodLightOn = !state.hoodLightOn;
    window.labAudio.playClick();
    if (renderer) renderer.setHoodState(state.hoodAirOn, state.hoodLightOn);
    if (bench3d && bench3d.supported) bench3d.setHoodState(state.hoodAirOn, state.hoodLightOn);
    syncRealisticUI();
    updateEnvironmentControlsForView();
  }

  function setFsDrawers(testsOpen, guessOpen) {
    state.fsTestsOpen = !!(state.benchFullscreen && testsOpen);
    state.fsGuessOpen = !!(state.benchFullscreen && guessOpen);
    document.body.classList.toggle('fs-tests-open', state.fsTestsOpen);
    document.body.classList.toggle('fs-guess-open', state.fsGuessOpen);
    if (els.fsToggleTestsBtn) {
      els.fsToggleTestsBtn.classList.toggle('active-drawer', state.fsTestsOpen);
    }
    if (els.fsToggleGuessBtn) {
      els.fsToggleGuessBtn.classList.toggle('active-drawer', state.fsGuessOpen);
    }
    if (state.fsGuessOpen && !state.roundEnded) {
      requestAnimationFrame(() => {
        els.speciesInput.focus();
      });
    }
  }

  function setBenchFullscreen(enable, skipBrowserApi) {
    const use3DBench = !!(state.realisticMode && bench3d && bench3d.supported);
    const next = !!(enable && use3DBench);
    state.benchFullscreen = next;
    document.body.classList.toggle('bench-fullscreen-mode', next);

    if (!next) {
      setFsDrawers(false, false);
    }

    if (els.benchFullscreenBtn) {
      els.benchFullscreenBtn.classList.toggle('active', next);
      els.benchFullscreenBtn.textContent = next ? '🗗 Esci Schermo Intero' : '⛶ Schermo Intero';
    }

    if (!skipBrowserApi) {
      try {
        if (next && !document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (!next && document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (_) {}
    }

    if (bench3d && bench3d.supported) {
      requestAnimationFrame(() => {
        bench3d.resize();
        setTimeout(() => bench3d.resize(), 140);
      });
    }
  }

  function toggleBenchFullscreen() {
    window.labAudio.playClick();
    setBenchFullscreen(!state.benchFullscreen, false);
  }

  function toggleRealisticMode() {
    state.realisticMode = !state.realisticMode;
    window.labAudio.playClick();

    const use3DBench = !!(state.realisticMode && bench3d && bench3d.supported);

    if (state.realisticMode) {
      state.hoodAirOn = true;
      state.hoodLightOn = true;
      state.inspectionOpen = false;
      els.realisticInspectionModal.classList.add('hidden');
      renderer.useCanvas(use3DBench ? els.inspectionCanvas : els.labCanvas);
    } else {
      if (state.benchFullscreen) {
        setBenchFullscreen(false, false);
      }
      if (state.inspectionOpen) {
        closeInspectionModal(true);
      }
      if (state.pendingTests.size > 0) {
        for (const [k, v] of state.pendingTests.entries()) {
          state.performedTests.set(k, v);
        }
        state.pendingTests.clear();
        renderer.completeCurrentProcedure();
        renderCategoryTests();
        renderNotepadAndRecent();
        renderHUD();
      }
      if (state.activeViewKey === 'microscope_empty') {
        state.activeViewKey = 'primary';
      }
      renderer.useCanvas(els.labCanvas);
    }

    renderer.setRealisticMode(state.realisticMode);
    renderer.setHoodState(state.hoodAirOn, state.hoodLightOn);
    if (bench3d && bench3d.supported) {
      bench3d.setHoodState(state.hoodAirOn, state.hoodLightOn);
    }
    savePersistedStats();
    syncRealisticUI();
    syncBench3DState();
    switchLabView(state.activeViewKey, state.pendingTests.has(state.activeViewKey));
    if (use3DBench && !state.inspectionOpen) {
      renderer.stopAnimation();
    }
  }

  function syncRealisticUI() {
    const use3DBench = !!(state.realisticMode && bench3d && bench3d.supported);

    document.body.classList.toggle('realistic-active', state.realisticMode);
    els.realisticModeBtn.classList.toggle('active', state.realisticMode);
    els.realisticModeBtn.setAttribute('aria-pressed', String(state.realisticMode));
    els.realisticKnob.textContent = state.realisticMode ? '🔬' : '⚡';
    els.realisticModeLabel.textContent = state.realisticMode
      ? 'Modalità Realistica: ON'
      : 'Modalità Realistica: OFF';

    if (!use3DBench && state.benchFullscreen) {
      setBenchFullscreen(false, false);
    }

    // Mostra Bancone 3D in Modalità Realistica, Palcoscenico 2D rapido in Modalità OFF
    els.bench3dWrapper.classList.toggle('hidden', !use3DBench);
    els.classicStageWrapper.classList.toggle('hidden', use3DBench);
    if (els.inlineViewportControls) {
      els.inlineViewportControls.classList.toggle('hidden', use3DBench);
    }
    if (els.benchFullscreenBtn) {
      els.benchFullscreenBtn.classList.toggle('hidden', !use3DBench);
    }

    if (bench3d && bench3d.supported) {
      bench3d.setEnabled(use3DBench);
      bench3d.setHoodState(state.hoodAirOn, state.hoodLightOn);
      bench3d.setPaused(state.inspectionOpen);
    }

    // Sincronizza pulsanti Cappa su Bancone, Schermo Intero e Finestra Ravvicinata
    els.hoodAirBtn.classList.toggle('active', state.hoodAirOn);
    els.hoodAirLabel.textContent = state.hoodAirOn ? 'ON' : 'OFF';
    els.hoodLightBtn.classList.toggle('active', state.hoodLightOn);
    els.hoodLightLabel.textContent = state.hoodLightOn ? 'ON' : 'OFF';

    if (els.fsHoodAirBtn) {
      els.fsHoodAirBtn.classList.toggle('active', state.hoodAirOn);
      els.fsHoodAirLabel.textContent = state.hoodAirOn ? 'ON' : 'OFF';
      els.fsHoodLightBtn.classList.toggle('active', state.hoodLightOn);
      els.fsHoodLightLabel.textContent = state.hoodLightOn ? 'ON' : 'OFF';
    }

    els.modalHoodAirBtn.classList.toggle('active', state.hoodAirOn);
    els.modalHoodAirLabel.textContent = state.hoodAirOn ? 'ON' : 'OFF';
    els.modalHoodLightBtn.classList.toggle('active', state.hoodLightOn);
    els.modalHoodLightLabel.textContent = state.hoodLightOn ? 'ON' : 'OFF';
  }

  function syncBench3DState() {
    if (!bench3d || !bench3d.supported || !state.currentBacterium) return;
    const performedList = [];
    for (const [testId, res] of state.performedTests.entries()) {
      const meta = TESTS_CATALOG.find((t) => t.id === testId);
      if (!meta) continue;
      performedList.push({
        id: testId,
        shortName: meta.shortName,
        badge: res.badge,
        agarColor: res.petriSpec ? res.petriSpec.agarColor : null
      });
    }

    let activeStainMode = null;
    if (state.activeViewKey && state.activeViewKey !== 'primary') {
      const r =
        state.performedTests.get(state.activeViewKey) || state.pendingTests.get(state.activeViewKey);
      if (r && r.stainMode) activeStainMode = r.stainMode;
    }

    bench3d.updateBenchState({
      bacterium: state.currentBacterium,
      sampleCode: els.sampleCodeEl.textContent,
      performedList,
      activeObjective: renderer ? renderer.objective : '100x',
      activeStainMode
    });
  }

  function findBestMicroscopeViewKey() {
    if (
      state.activeViewKey !== 'primary' &&
      state.activeViewKey !== 'microscope_empty' &&
      TESTS_CATALOG.find((t) => t.id === state.activeViewKey)?.category === 'stains'
    ) {
      return state.activeViewKey;
    }
    const allKeys = [...state.pendingTests.keys(), ...Array.from(state.performedTests.keys()).reverse()];
    for (const k of allKeys) {
      const meta = TESTS_CATALOG.find((t) => t.id === k);
      if (meta && meta.category === 'stains') return k;
    }
    return 'microscope_empty';
  }

  function handleBenchStationSelected(stationKey) {
    if (stationKey === 'notepad') {
      window.labAudio.playPageFlip();
      if (bench3d) bench3d.resetCameraSmooth();
      els.notepadModal.classList.remove('hidden');
      return;
    }
    if (stationKey === 'atlas') {
      window.labAudio.playPageFlip();
      if (bench3d) bench3d.resetCameraSmooth();
      els.atlasModal.classList.remove('hidden');
      return;
    }
    if (stationKey === 'microscope') {
      const targetKey = findBestMicroscopeViewKey();
      openInspectionModal(targetKey, state.pendingTests.has(targetKey));
      return;
    }
    if (stationKey === 'hood') {
      // Cerca se c'è un test sotto cappa in corso o recente, altrimenti apri la piastra primaria sotto cappa
      const hoodKeys = [...state.pendingTests.keys(), ...Array.from(state.performedTests.keys()).reverse()];
      const latestHood = hoodKeys.find((k) => {
        const m = TESTS_CATALOG.find((t) => t.id === k);
        return m && m.category !== 'stains';
      });
      const target = latestHood || 'primary';
      openInspectionModal(target, state.pendingTests.has(target));
      return;
    }
    // Default ('petri'): apri l'ispezione ravvicinata della Piastra Petri Primaria
    openInspectionModal('primary', false);
  }

  function openInspectionModal(viewKey, startInteractive) {
    if (!state.realisticMode || !bench3d || !bench3d.supported) {
      switchLabView(viewKey, startInteractive);
      return;
    }
    state.inspectionOpen = true;
    if (bench3d && bench3d.supported) {
      bench3d.setPaused(true);
    }
    els.realisticInspectionModal.classList.remove('hidden');
    renderer.useCanvas(els.inspectionCanvas);
    switchLabView(viewKey, startInteractive);
    requestAnimationFrame(() => {
      renderer.resize();
    });
  }

  function closeInspectionModal(silent) {
    if (!silent) window.labAudio.playClick();
    state.inspectionOpen = false;
    els.realisticInspectionModal.classList.add('hidden');
    renderer.stopAnimation();
    window.labAudio.setHoodHum(false);

    if (state.realisticMode && bench3d && bench3d.supported) {
      syncBench3DState();
      bench3d.resetCameraSmooth();
    }
    updateEnvironmentControlsForView();
  }

  function renderStainQuickPicker() {
    if (!els.modalStainButtons) return;
    els.modalStainButtons.innerHTML = '';
    const stains = TESTS_CATALOG.filter((t) => t.category === 'stains');
    for (const st of stains) {
      const isDone = state.performedTests.has(st.id);
      const isPending = state.pendingTests.has(st.id);
      const isActive = state.activeViewKey === st.id;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'stain-pick-chip' +
        (isActive ? ' active' : '') +
        (isDone ? ' done' : '');

      const suffix = isDone
        ? '✓ Pronto'
        : isPending
        ? '⏳'
        : state.roundEnded
        ? 'GRATIS'
        : `−${st.cost} pt`;

      btn.innerHTML = `<span>${st.icon}</span><span>${escapeHtml(st.shortName)}</span><small>(${suffix})</small>`;
      btn.addEventListener('click', () => {
        runDiagnosticTest(st);
      });
      els.modalStainButtons.appendChild(btn);
    }
  }

  function updateEnvironmentControlsForView() {
    const isMicroscope =
      state.activeViewKey === 'microscope_empty' ||
      (state.activeViewKey !== 'primary' &&
        TESTS_CATALOG.find((t) => t.id === state.activeViewKey)?.category === 'stains');

    if (state.realisticMode) {
      // Sul bancone 3D mostriamo sempre i pulsanti per accendere/spegnere la Cappa + Schermo Intero
      els.hoodControlsBar.classList.remove('hidden');
      const showModalHood = state.inspectionOpen && !isMicroscope;
      els.modalHoodControlsBar.classList.toggle('hidden', !showModalHood);
      const shouldHum = !state.roundEnded && state.hoodAirOn && (!state.inspectionOpen || !isMicroscope);
      window.labAudio.setHoodHum(shouldHum);
    } else {
      els.hoodControlsBar.classList.add('hidden');
      els.modalHoodControlsBar.classList.add('hidden');
      window.labAudio.setHoodHum(false);
    }
  }

  // =========================================================================
  // HUD & CAMBIO VISTA
  // =========================================================================
  function renderHUD() {
    const totalUsed = state.performedTests.size + state.pendingTests.size;
    els.potentialScoreEl.textContent = state.potentialScore;
    els.totalScoreEl.textContent = state.totalScore;
    els.solvedCounterEl.textContent = `${state.solvedIds.size}/${BACTERIA_DB.length}`;
    els.errorCountText.textContent = `${state.errors}/${MAX_ERRORS}`;
    els.errorsSummaryPill.innerHTML = `Errori: <strong>${state.errors} / ${MAX_ERRORS}</strong>`;
    els.testsUsedBadge.textContent = `${totalUsed} test`;
    els.notepadBadgeCount.textContent = state.performedTests.size;

    // Badges Barra Mobile
    if (els.mobTestsCountBadge) {
      els.mobTestsCountBadge.textContent = 20 - state.performedTests.size;
    }
    if (els.mobErrorsBadge) {
      els.mobErrorsBadge.textContent = `${state.errors}/${MAX_ERRORS}`;
    }
    if (els.mobNotesBadge) {
      els.mobNotesBadge.textContent = state.performedTests.size;
    }

    if (els.fsScoreEl) els.fsScoreEl.textContent = state.potentialScore;
    if (els.fsErrorsEl) els.fsErrorsEl.textContent = `${state.errors}/${MAX_ERRORS}`;

    els.lifeVials.innerHTML = '';
    for (let i = 0; i < MAX_ERRORS; i++) {
      const vial = document.createElement('span');
      vial.className = 'life-vial' + (i >= MAX_ERRORS - state.errors ? ' lost' : '');
      els.lifeVials.appendChild(vial);
    }
  }

  function spawnScoreDelta(amount) {
    const span = document.createElement('span');
    span.className = 'floating-delta';
    span.textContent = `${amount > 0 ? '+' : ''}${amount} pt`;
    els.scoreDeltaAnchor.appendChild(span);
    setTimeout(() => span.remove(), 1150);
  }

  function deductPoints(cost) {
    if (state.roundEnded) return;
    const prev = state.potentialScore;
    state.potentialScore = Math.max(MIN_WIN_SCORE, state.potentialScore - cost);
    const diff = state.potentialScore - prev;
    if (diff < 0) spawnScoreDelta(diff);
    renderHUD();
  }

  function updateBacklightUI(on) {
    renderer.setBacklight(on);
    els.backlightState.textContent = on ? 'ON' : 'OFF';
    els.backlightBtn.classList.toggle('active', on);
    if (els.modalBacklightState) {
      els.modalBacklightState.textContent = on ? 'ON' : 'OFF';
      els.modalBacklightBtn.classList.toggle('active', on);
    }
  }

  function populateViewTabsBar(container, openModalOnClick) {
    if (!container) return;
    container.innerHTML = '';

    const primaryBtn = document.createElement('button');
    primaryBtn.type = 'button';
    primaryBtn.className = 'view-pill' + (state.activeViewKey === 'primary' ? ' active' : '');
    primaryBtn.innerHTML = '🧫 Piastra Primaria';
    primaryBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      if (openModalOnClick && state.realisticMode) {
        openInspectionModal('primary', false);
      } else {
        switchLabView('primary', false);
      }
    });
    container.appendChild(primaryBtn);

    const allKeys = new Set([...state.performedTests.keys(), ...state.pendingTests.keys()]);
    for (const testId of allKeys) {
      const meta = TESTS_CATALOG.find((t) => t.id === testId);
      if (!meta) continue;
      const isPending = state.pendingTests.has(testId);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'view-pill' + (state.activeViewKey === testId ? ' active' : '');
      btn.innerHTML = `${meta.icon} ${meta.shortName}${isPending ? ' ⏳' : ''}`;
      btn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (openModalOnClick && state.realisticMode) {
          openInspectionModal(testId, isPending);
        } else {
          switchLabView(testId, isPending);
        }
      });
      container.appendChild(btn);
    }
  }

  function renderUnlockedViewTabs() {
    populateViewTabsBar(els.unlockedViewsBar, true);
    populateViewTabsBar(els.modalUnlockedViewsBar, false);
  }

  function getRealisticInstruction(testId) {
    switch (testId) {
      case 'peroxidase':
        return '💧 Pipetta pronta sotto cappa: clicca 3 volte sullo striscio batterico per versare le gocce di H₂O₂ al 3%!';
      case 'oxidase':
        return '🟣 Usa la pipetta: clicca 2 volte sulla zona reattiva della striscia per applicare il reattivo di Kovacs!';
      case 'coagulase':
        return '🩸 Aggiungi 2 gocce di plasma citratato nella provetta con la pipetta per avviare il test della coagulasi!';
      case 'urease':
        return '🩷 Usa la pipetta per inoculare 2 gocce nel brodo all’urea di Christensen!';
      case 'indole_oxygen':
        return '🌡️ Versa 2 gocce di reattivo di Kovacs nella provetta di sinistra per ricercare l’anello rosso dell’indolo!';
      case 'disks':
        return '⚪ Con la pinzetta sterile clicca sui 3 cerchi tratteggiati per deporre Optochina (P), Bacitracina (A) e Novobiocina (NV)!';
      case 'gram':
      case 'ziehl':
      case 'spores':
      case 'capsule_motility':
        return '🔬 Seleziona l’obiettivo "100× Olio" e ruota la Vite Macrometrica / Micrometrica finché la micrografia reale è perfettamente a fuoco!';
      default:
        return '➰ Semina automatica sotto cappa BSL-2 in corso: osserva lo striscio a 4 quadranti e l’incubazione delle colonie a 37°C!';
    }
  }

  function syncMicroscopeConsoleUI(startUnfocused) {
    const obj = startUnfocused && state.realisticMode ? '10x' : '100x';
    document.querySelectorAll('.obj-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.obj === obj);
    });
    els.macroFocusSlider.value = '50';
    els.microFocusSlider.value = '0';
    els.condenserSlider.value = '100';
    if (els.modalMacroFocusSlider) {
      els.modalMacroFocusSlider.value = '50';
      els.modalMicroFocusSlider.value = '0';
      els.modalCondenserSlider.value = '100';
    }
  }

  function setObservationBanners(titleText, badgeClass, badgeText, detailText) {
    els.obsTitle.textContent = titleText;
    els.obsBadge.className = badgeClass;
    els.obsBadge.textContent = badgeText;
    els.obsDetail.textContent = detailText;

    if (els.modalObsTitle) {
      els.modalObsTitle.textContent = titleText;
      els.modalObsBadge.className = badgeClass;
      els.modalObsBadge.textContent = badgeText;
      els.modalObsDetail.textContent = detailText;
    }
  }

  function switchLabView(viewKey, startInteractive) {
    state.activeViewKey = viewKey;
    renderUnlockedViewTabs();
    updateEnvironmentControlsForView();

    // Caso 0: Microscopio 3D aperto prima di preparare qualsiasi vetrino colorato
    if (viewKey === 'microscope_empty') {
      els.backlightBtn.classList.add('hidden');
      els.modalBacklightBtn.classList.add('hidden');
      if (els.modalReplayStreakBtn) els.modalReplayStreakBtn.classList.add('hidden');
      els.microscopeConsole.classList.remove('hidden');
      els.modalMicroscopeConsole.classList.remove('hidden');
      els.interactivePromptBubble.classList.add('hidden');
      els.modalPromptBubble.classList.add('hidden');
      els.micrographCreditPill.classList.add('hidden');
      els.modalStainQuickBar.classList.remove('hidden');
      renderStainQuickPicker();
      syncMicroscopeConsoleUI(true);

      els.inspectionStationKicker.textContent = 'POSTAZIONE OTTICA · MICROSCOPIO BINOCULARE 3D';
      els.inspectionStationTitle.textContent = '🔬 Visore Oculare del Microscopio Ottico';
      els.modalCanvasHintPill.textContent = '🔬 Scegli una colorazione qui sopra per montare il vetrino';
      els.modalCanvasHintPill.classList.remove('hidden');

      renderer.setView({ type: 'microscope', stainMode: 'none' }, false);

      setObservationBanners(
        '🔬 Microscopio Ottico pronto sul Bancone',
        'obs-badge tone-info',
        'SELEZIONA UN VETRINO',
        'Nessun preparato ancora montato sul tavolino traslatore. Scegli una colorazione (es. Gram, Ziehl-Neelsen, Endospore o Capsula) per osservare la micrografia reale del batterio.'
      );
      return;
    }

    // Caso 1: Piastra Petri Primaria d'isolamento
    if (viewKey === 'primary') {
      els.backlightBtn.classList.remove('hidden');
      els.modalBacklightBtn.classList.remove('hidden');
      if (els.modalReplayStreakBtn) {
        els.modalReplayStreakBtn.classList.toggle('hidden', !state.realisticMode);
      }
      els.microscopeConsole.classList.add('hidden');
      els.modalMicroscopeConsole.classList.add('hidden');
      els.interactivePromptBubble.classList.add('hidden');
      els.modalPromptBubble.classList.add('hidden');
      els.micrographCreditPill.classList.add('hidden');
      els.modalStainQuickBar.classList.add('hidden');

      els.inspectionStationKicker.textContent = 'ISPEZIONE RAVVICINATA SOTTO CAPPA BIOHAZARD BSL-2';
      els.inspectionStationTitle.textContent = '🧫 Piastra Petri Primaria del Campione (37°C)';

      const hint = state.realisticMode
        ? '🛡️ Cappa BSL-2 attiva · Muovi il cursore sulla piastra per la Lente 5×'
        : '🔍 Muovi il cursore sulla piastra per la Lente 5×';
      els.canvasHintPill.textContent = hint;
      els.canvasHintPill.classList.remove('hidden');
      els.modalCanvasHintPill.textContent = hint;
      els.modalCanvasHintPill.classList.remove('hidden');

      renderer.setView({ type: 'primary' }, false);

      setObservationBanners(
        '🧫 Piastra Petri Primaria (Isolamento a 37°C)',
        'obs-badge tone-info',
        'OSSERVAZIONE GRATUITA (0 PT)',
        state.currentBacterium.primaryPlate.macroSummary
      );
      syncBench3DState();
      return;
    }

    const isPending = state.pendingTests.has(viewKey);
    const res = state.performedTests.get(viewKey) || state.pendingTests.get(viewKey);
    const meta = TESTS_CATALOG.find((t) => t.id === viewKey);
    if (!res || !meta) return;

    const launchInteractive = !!(startInteractive && isPending && state.realisticMode);

    if (res.viewType === 'petri') {
      els.backlightBtn.classList.remove('hidden');
      els.modalBacklightBtn.classList.remove('hidden');
      if (els.modalReplayStreakBtn) {
        els.modalReplayStreakBtn.classList.toggle('hidden', !state.realisticMode);
      }
      els.microscopeConsole.classList.add('hidden');
      els.modalMicroscopeConsole.classList.add('hidden');
      els.micrographCreditPill.classList.add('hidden');
      els.modalStainQuickBar.classList.add('hidden');

      els.inspectionStationKicker.textContent = 'CAPPA DI SICUREZZA MICROBIOLOGICA CLASSE II (BSL-2)';
      els.inspectionStationTitle.textContent = `${meta.icon} ${meta.name}`;

      const hint = launchInteractive
        ? '➰ Semina automatica con ansa sterile e incubazione 24h in corso...'
        : res.petriSpec.requiresBacklightHint
        ? '🔦 Suggerimento: attiva "Luce Trasmessa" per risaltare gli aloni di emolisi!'
        : '🔍 Muovi il cursore sulla piastra per la Lente 5×';
      els.canvasHintPill.textContent = hint;
      els.canvasHintPill.classList.remove('hidden');
      els.modalCanvasHintPill.textContent = hint;
      els.modalCanvasHintPill.classList.remove('hidden');

      renderer.setView(
        {
          type: 'petri',
          testId: viewKey,
          mediumId: res.mediumId,
          petriSpec: res.petriSpec
        },
        launchInteractive
      );
    } else if (res.viewType === 'microscope') {
      els.backlightBtn.classList.add('hidden');
      els.modalBacklightBtn.classList.add('hidden');
      if (els.modalReplayStreakBtn) els.modalReplayStreakBtn.classList.add('hidden');
      els.microscopeConsole.classList.remove('hidden');
      els.modalMicroscopeConsole.classList.remove('hidden');
      els.modalStainQuickBar.classList.toggle('hidden', !state.realisticMode);
      if (state.realisticMode) renderStainQuickPicker();
      syncMicroscopeConsoleUI(launchInteractive);

      els.inspectionStationKicker.textContent =
        'POSTAZIONE OTTICA · MICROGRAFIA REALE DA LETTERATURA SCIENTIFICA';
      els.inspectionStationTitle.textContent = `${meta.icon} ${meta.name} — Visore Oculare`;

      const creditLabel =
        res.stainMode === 'capsule'
          ? '📷 Micrografia Ottica Reale + Esame a Fresco Vivo (Goccia Pendente)'
          : '📷 Micrografia Ottica Reale da Pubblicazioni Scientifiche / CDC PHIL';
      els.micrographCreditPill.textContent = creditLabel;
      els.micrographCreditPill.classList.toggle('hidden', !state.realisticMode);

      const hint = '🖱️ Trascina dentro l’oculare per esplorare il vetrino reale (Tavolino X/Y)';
      els.canvasHintPill.textContent = hint;
      els.canvasHintPill.classList.remove('hidden');
      els.modalCanvasHintPill.textContent = hint;
      els.modalCanvasHintPill.classList.remove('hidden');

      renderer.setView(
        {
          type: 'microscope',
          testId: viewKey,
          stainMode: res.stainMode
        },
        launchInteractive
      );
    } else if (res.viewType === 'biochem') {
      els.backlightBtn.classList.add('hidden');
      els.modalBacklightBtn.classList.add('hidden');
      if (els.modalReplayStreakBtn) els.modalReplayStreakBtn.classList.add('hidden');
      els.microscopeConsole.classList.add('hidden');
      els.modalMicroscopeConsole.classList.add('hidden');
      els.micrographCreditPill.classList.add('hidden');
      els.modalStainQuickBar.classList.add('hidden');

      els.inspectionStationKicker.textContent = 'CAPPA DI SICUREZZA MICROBIOLOGICA · ANALISI BIOCHIMICA';
      els.inspectionStationTitle.textContent = `${meta.icon} ${meta.name}`;

      const showCoagHint = res.biochemMode === 'coagulase' && !launchInteractive;
      els.canvasHintPill.classList.toggle('hidden', !showCoagHint);
      els.modalCanvasHintPill.classList.toggle('hidden', !showCoagHint);
      if (showCoagHint) {
        const ch = '🔄 Clicca sulla provetta per inclinarla e verificare il coagulo!';
        els.canvasHintPill.textContent = ch;
        els.modalCanvasHintPill.textContent = ch;
      }

      renderer.setView(
        {
          type: 'biochem',
          testId: viewKey,
          biochemMode: res.biochemMode,
          pos: res.pos,
          ureaseState: res.ureaseState,
          indole: res.indole,
          oxygen: res.oxygen,
          disks: res.disks
        },
        launchInteractive
      );
    }

    if (launchInteractive) {
      const instr = getRealisticInstruction(viewKey);
      els.interactivePromptText.textContent = instr;
      els.interactivePromptBubble.classList.remove('hidden');
      els.modalPromptText.textContent = instr;
      els.modalPromptBubble.classList.remove('hidden');

      const procLabel =
        meta.category === 'media'
          ? 'SEMINA AUTOMATICA IN CORSO'
          : 'ESEGUI IL TEST NELLA POSTAZIONE';
      setObservationBanners(
        `${meta.icon} ${meta.name} — Procedura di Laboratorio in Corso`,
        'obs-badge tone-amber',
        procLabel,
        meta.category === 'media'
          ? 'Semina automatica a 4 quadranti sotto cappa BSL-2 e incubazione termostatica a 37°C in corso...'
          : 'Completa l’operazione qui sopra per sviluppare la reazione e registrare il risultato nel Taccuino.'
      );
    } else {
      els.interactivePromptBubble.classList.add('hidden');
      els.modalPromptBubble.classList.add('hidden');
      setObservationBanners(
        `${meta.icon} ${meta.name}`,
        `obs-badge tone-${res.tone || 'info'}`,
        res.badge,
        res.detail
      );
    }

    syncBench3DState();
  }

  function finalizeActivePendingTest() {
    const key = state.activeViewKey;
    els.interactivePromptBubble.classList.add('hidden');
    els.modalPromptBubble.classList.add('hidden');

    if (!state.pendingTests.has(key)) {
      // Caso "Ripeti Semina" su Piastra Primaria o terreno già completato
      if (key === 'primary') {
        const hint = state.realisticMode
          ? '🛡️ Cappa BSL-2 attiva · Muovi il cursore sulla piastra per la Lente 5×'
          : '🔍 Muovi il cursore sulla piastra per la Lente 5×';
        els.canvasHintPill.textContent = hint;
        els.modalCanvasHintPill.textContent = hint;
      } else {
        const doneRes = state.performedTests.get(key);
        if (doneRes && doneRes.viewType === 'petri') {
          const hint =
            doneRes.petriSpec && doneRes.petriSpec.requiresBacklightHint
              ? '🔦 Suggerimento: attiva "Luce Trasmessa" per risaltare gli aloni di emolisi!'
              : '🔍 Muovi il cursore sulla piastra per la Lente 5×';
          els.canvasHintPill.textContent = hint;
          els.modalCanvasHintPill.textContent = hint;
        }
      }
      return;
    }

    const res = state.pendingTests.get(key);
    state.pendingTests.delete(key);
    state.performedTests.set(key, res);

    if (key === 'blood_agar' && res.petriSpec && res.petriSpec.requiresBacklightHint) {
      updateBacklightUI(true);
    }

    const meta = TESTS_CATALOG.find((t) => t.id === key);
    if (meta) {
      setObservationBanners(
        `${meta.icon} ${meta.name}`,
        `obs-badge tone-${res.tone || 'info'}`,
        res.badge,
        res.detail
      );
    }

    if (res.viewType === 'petri') {
      const hint =
        res.petriSpec && res.petriSpec.requiresBacklightHint
          ? '🔦 Suggerimento: attiva "Luce Trasmessa" per risaltare gli aloni di emolisi!'
          : '🔍 Muovi il cursore sulla piastra per la Lente 5×';
      els.canvasHintPill.textContent = hint;
      els.modalCanvasHintPill.textContent = hint;
    }

    if (res.viewType === 'microscope') {
      document.querySelectorAll('.obj-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.obj === renderer.objective);
      });
      els.macroFocusSlider.value = String(renderer.macroFocus);
      els.microFocusSlider.value = String(renderer.microFocus);
      els.modalMacroFocusSlider.value = String(renderer.macroFocus);
      els.modalMicroFocusSlider.value = String(renderer.microFocus);
      renderStainQuickPicker();
    }

    if (res.biochemMode === 'coagulase') {
      const ch = '🔄 Clicca sulla provetta per inclinarla e verificare il coagulo!';
      els.canvasHintPill.textContent = ch;
      els.canvasHintPill.classList.remove('hidden');
      els.modalCanvasHintPill.textContent = ch;
      els.modalCanvasHintPill.classList.remove('hidden');
    }

    syncBench3DState();
    renderUnlockedViewTabs();
    renderCategoryTests();
    renderNotepadAndRecent();
    renderHUD();
  }

  // =========================================================================
  // ESECUZIONE TEST (RAPIDA VS REALISTICA CON SCHERMATE DEDICATE)
  // =========================================================================
  function renderCategoryTests() {
    els.testsListContainer.innerHTML = '';
    const tests = TESTS_CATALOG.filter((t) => t.category === state.activeCategory);

    for (const t of tests) {
      const doneRes = state.performedTests.get(t.id);
      const pendingRes = state.pendingTests.get(t.id);

      const card = document.createElement('button');
      card.type = 'button';
      card.className =
        'test-card-btn' + (doneRes ? ' done' : pendingRes ? ' in-progress' : '');

      const topRow = document.createElement('div');
      topRow.className = 'test-card-top';

      const nameWrap = document.createElement('div');
      nameWrap.className = 'test-name-wrap';
      nameWrap.innerHTML = `<span>${t.icon}</span><span>${escapeHtml(t.name)}</span>`;

      const rightPill = document.createElement('span');
      if (doneRes) {
        rightPill.className = `obs-badge tone-${doneRes.tone || 'success'}`;
        rightPill.textContent = doneRes.badge;
      } else if (pendingRes) {
        rightPill.className = 'obs-badge tone-amber';
        rightPill.textContent = 'IN CORSO ⏳';
      } else {
        rightPill.className = 'test-cost-pill';
        rightPill.textContent = state.roundEnded ? 'GRATIS' : `−${t.cost} pt`;
      }

      topRow.appendChild(nameWrap);
      topRow.appendChild(rightPill);

      const desc = document.createElement('p');
      desc.className = 'test-desc';
      desc.textContent = doneRes
        ? doneRes.detail
        : pendingRes
        ? 'Clicca per riaprire la postazione e completare questo test.'
        : t.principle;

      card.appendChild(topRow);
      card.appendChild(desc);

      card.addEventListener('click', () => runDiagnosticTest(t));
      els.testsListContainer.appendChild(card);
    }
  }

  function runDiagnosticTest(testMeta) {
    if (state.benchFullscreen && state.fsTestsOpen && state.realisticMode) {
      setFsDrawers(false, false);
    }

    if (state.performedTests.has(testMeta.id)) {
      window.labAudio.playClick();
      if (state.realisticMode) {
        openInspectionModal(testMeta.id, false);
      } else {
        switchLabView(testMeta.id, false);
      }
      return;
    }

    if (state.pendingTests.has(testMeta.id)) {
      window.labAudio.playClick();
      if (state.realisticMode) {
        openInspectionModal(testMeta.id, true);
      } else {
        switchLabView(testMeta.id, true);
      }
      return;
    }

    const result = evaluateTest(state.currentBacterium, testMeta.id);
    if (!result) return;

    deductPoints(testMeta.cost);

    // MODALITÀ REALISTICA: apre subito la schermata ravvicinata (Microscopio con foto reale o Cappa con semina automatica / pipetta)!
    if (state.realisticMode) {
      window.labAudio.playClick();
      state.pendingTests.set(testMeta.id, result);
      openInspectionModal(testMeta.id, true);
      renderCategoryTests();
      renderHUD();
      return;
    }

    // MODALITÀ RAPIDA: animazione veloce inline e risultato immediato
    const actionLabels = {
      stains: 'Colorazione vetrino e messa a fuoco 1000×...',
      biochem: 'Esecuzione test enzimatico rapido...',
      media: `Inoculo e incubazione su ${testMeta.shortName}...`
    };
    els.labActionText.textContent = actionLabels[testMeta.category];
    els.labActionOverlay.classList.remove('hidden');

    if (testMeta.id === 'peroxidase') {
      if (result.pos) window.labAudio.playBubbles();
      else window.labAudio.playPipetteDrop();
    } else if (testMeta.category === 'stains') {
      window.labAudio.playMicroscopeClick();
    } else if (testMeta.category === 'media') {
      window.labAudio.playStreak(false);
    } else {
      window.labAudio.playPipetteDrop();
    }

    state.performedTests.set(testMeta.id, result);

    setTimeout(() => {
      els.labActionOverlay.classList.add('hidden');
      if (testMeta.id === 'blood_agar' && result.petriSpec && result.petriSpec.requiresBacklightHint) {
        updateBacklightUI(true);
      }
      switchLabView(testMeta.id, false);
      renderCategoryTests();
      renderNotepadAndRecent();
      renderHUD();
      showMobileTestAlert(testMeta.shortName, testMeta.cost, testMeta.id);
    }, 220);
  }

  // =========================================================================
  // BLOCCHETTO NOTE (#1) & STRISCIA ULTIMI RISULTATI
  // =========================================================================
  function renderNotepadAndRecent() {
    const entries = Array.from(state.performedTests.entries());
    els.reportCountEl.textContent = entries.length;
    els.emptyReportState.classList.toggle('hidden', entries.length > 0);
    els.emptyRecentState.classList.toggle('hidden', entries.length > 0);

    els.reportItemsList.innerHTML = '';
    // Rimuove solo le righe dinamiche lasciando emptyRecentState
    Array.from(els.recentResultsStrip.querySelectorAll('.mini-result-row')).forEach((n) => n.remove());

    for (let i = entries.length - 1; i >= 0; i--) {
      const [testId, res] = entries[i];
      const meta = TESTS_CATALOG.find((t) => t.id === testId);
      if (!meta) continue;

      // 1. Scheda completa dentro il Blocchetto Note a Spirale
      const div = document.createElement('div');
      div.className = 'report-entry';
      div.innerHTML = `
        <div class="report-entry-head">
          <span class="report-entry-name">${meta.icon} ${escapeHtml(meta.name)}</span>
          <span class="obs-badge tone-${res.tone || 'info'}">${escapeHtml(res.badge)}</span>
        </div>
        <p class="report-entry-text">${escapeHtml(res.detail)}</p>
      `;
      div.addEventListener('click', () => {
        window.labAudio.playClick();
        els.notepadModal.classList.add('hidden');
        if (state.realisticMode) {
          openInspectionModal(testId, false);
        } else {
          switchLabView(testId, false);
        }
      });
      els.reportItemsList.appendChild(div);

      // 2. Riga compatta sul banco destro
      const mini = document.createElement('div');
      mini.className = 'mini-result-row';
      mini.innerHTML = `
        <span>${meta.icon} ${escapeHtml(meta.shortName)}</span>
        <span class="obs-badge tone-${res.tone || 'info'}">${escapeHtml(res.badge)}</span>
      `;
      mini.addEventListener('click', () => {
        window.labAudio.playClick();
        if (state.realisticMode) {
          openInspectionModal(testId, false);
        } else {
          switchLabView(testId, false);
        }
      });
      els.recentResultsStrip.appendChild(mini);
    }
  }

  function renderSuspectsGrid() {
    els.suspectsGrid.innerHTML = '';
    const sorted = [...BACTERIA_DB].sort((a, b) => a.name.localeCompare(b.name));

    for (const sp of sorted) {
      const triedWrong = state.wrongGuesses.some((w) => w.bacterium.id === sp.id);
      const isRuledOut = triedWrong || state.ruledOutIds.has(sp.id);

      const pill = document.createElement('div');
      pill.className = 'suspect-pill' + (isRuledOut ? ' ruled-out' : '');

      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'suspect-select-btn';
      selectBtn.textContent = sp.name;
      selectBtn.disabled = triedWrong || state.roundEnded;
      selectBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        els.notepadModal.classList.add('hidden');
        selectSpeciesIntoInput(sp.name);
      });

      const toggleX = document.createElement('button');
      toggleX.type = 'button';
      toggleX.className = 'suspect-toggle-x';
      toggleX.textContent = isRuledOut ? '↺' : '✗';
      toggleX.disabled = triedWrong;
      toggleX.addEventListener('click', (e) => {
        e.stopPropagation();
        window.labAudio.playClick();
        if (state.ruledOutIds.has(sp.id)) state.ruledOutIds.delete(sp.id);
        else state.ruledOutIds.add(sp.id);
        renderSuspectsGrid();
        renderQuickChips();
      });

      pill.appendChild(selectBtn);
      pill.appendChild(toggleX);
      els.suspectsGrid.appendChild(pill);
    }
  }

  // =========================================================================
  // QUADERNO #2: L'ATLANTE DEI BATTERI (100 SPECIE, FILTRI, ALBERO & LETTERATURA)
  // =========================================================================
  function matchesAtlasGroup(sp, filter) {
    if (filter === 'all') return true;
    if (filter === 'gpos_cocci') {
      return sp.microscopy.gram === 'pos' && sp.microscopy.shape.includes('cocci');
    }
    if (filter === 'gpos_rods') {
      return (
        (sp.microscopy.gram === 'pos' && !sp.microscopy.shape.includes('cocci')) ||
        sp.microscopy.acidFast
      );
    }
    if (filter === 'enterics') {
      return sp.microscopy.gram === 'neg' && !sp.biochem.oxidase;
    }
    if (filter === 'ox_pos') {
      return sp.microscopy.gram === 'neg' && sp.biochem.oxidase;
    }
    if (filter === 'anaerobes') {
      const oxy = sp.biochem.oxygen || '';
      return (
        oxy.includes('anaerobe') ||
        oxy === 'microaerophile' ||
        sp.id.includes('clostridium') ||
        sp.id.includes('bacteroides') ||
        sp.id.includes('fusobacterium') ||
        sp.id.includes('cutibacterium') ||
        sp.id.includes('peptostreptococcus')
      );
    }
    return true;
  }

  function matchesAtlasChip(sp, chip) {
    if (!chip || chip === 'all') return true;
    if (chip === 'gram_pos') return sp.microscopy.gram === 'pos';
    if (chip === 'gram_neg') return sp.microscopy.gram === 'neg';
    if (chip === 'acid_fast') return !!sp.microscopy.acidFast;
    if (chip === 'cocci') {
      const shape = sp.microscopy.shape || '';
      return shape.includes('cocci') || shape.includes('cocco');
    }
    if (chip === 'bacilli') {
      const shape = sp.microscopy.shape || '';
      return shape.includes('bacill') || shape.includes('bastoncell') || shape.includes('coccobacill');
    }
    if (chip === 'spores') {
      return Boolean(sp.microscopy.spores && (sp.microscopy.spores.present === true || sp.microscopy.spores === true));
    }
    if (chip === 'capsule') return !!sp.microscopy.capsule;
    if (chip === 'catalase') return !!sp.biochem.peroxidase;
    if (chip === 'oxidase') return !!sp.biochem.oxidase;
    if (chip === 'urease') {
      return Boolean(sp.biochem.urease && sp.biochem.urease !== 'neg' && sp.biochem.urease !== false);
    }
    if (chip === 'motile') return sp.microscopy.motility !== 'immobile';
    if (chip === 'anaerobe') {
      const oxy = sp.biochem.oxygen || '';
      return oxy === 'obligate_anaerobe' || oxy === 'anaerobe';
    }
    return true;
  }

  function renderAtlasCards() {
    if (!els.atlasSpeciesContainer) return;
    els.atlasSpeciesContainer.innerHTML = '';
    const q = state.atlasQuery.trim().toLowerCase();
    const sorted = [...BACTERIA_DB].sort((a, b) => a.name.localeCompare(b.name));

    const filtered = sorted.filter((sp) => {
      if (!matchesAtlasGroup(sp, state.atlasFilter)) return false;
      if (!matchesAtlasChip(sp, state.atlasChipFilter)) return false;
      if (!q) return true;
      const tax = sp.taxonomy || {};
      const hay = [
        sp.name,
        sp.taxonomyGroup,
        sp.clinical.goldStandard,
        sp.clinical.overview,
        (sp.aliases || []).join(' '),
        tax.domain,
        tax.phylum,
        tax.class,
        tax.order,
        tax.family,
        tax.genus,
        (sp.clinical.associatedDiseases || []).join(' ')
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });

    if (els.atlasSearchCountPill) {
      els.atlasSearchCountPill.textContent = `${filtered.length} / ${BACTERIA_DB.length} Specie`;
    }

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-notepad-msg';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = 'Nessuna specie batterica corrisponde alla ricerca o ai filtri selezionati.';
      els.atlasSpeciesContainer.appendChild(empty);
      return;
    }

    for (const sp of filtered) {
      const card = document.createElement('div');
      card.className = 'atlas-sp-card';

      const head = document.createElement('div');
      head.className = 'atlas-card-head';

      const miniCanvas = document.createElement('canvas');
      miniCanvas.className = 'atlas-mini-canvas';
      miniCanvas.width = 176;
      miniCanvas.height = 92;
      window.LabRenderer.renderAtlasPreview(miniCanvas, sp);

      const titleBox = document.createElement('div');
      const famName = sp.taxonomy ? sp.taxonomy.family : '';
      titleBox.innerHTML = `
        <h4><em>${escapeHtml(sp.name)}</em></h4>
        <div class="atlas-sp-group">${escapeHtml(sp.taxonomyGroup)}${famName ? ` · <small>${escapeHtml(famName)}</small>` : ''}</div>
      `;

      head.appendChild(miniCanvas);
      head.appendChild(titleBox);

      const gramLabel =
        sp.microscopy.gram === 'pos'
          ? 'Gram +'
          : sp.microscopy.gram === 'neg'
          ? 'Gram −'
          : 'BAAR (Ziehl+)';

      const isUreasePos = Boolean(sp.biochem.urease && sp.biochem.urease !== 'neg' && sp.biochem.urease !== false);
      const badges = document.createElement('div');
      badges.className = 'atlas-badges-row';
      badges.innerHTML = `
        <span class="atlas-mini-pill">${gramLabel}</span>
        <span class="atlas-mini-pill">H₂O₂: ${sp.biochem.peroxidase ? '+' : '−'}</span>
        <span class="atlas-mini-pill">Ossidasi: ${sp.biochem.oxidase ? '+' : '−'}</span>
        <span class="atlas-mini-pill">Ureasi: ${isUreasePos ? '+' : '−'}</span>
        <span class="atlas-mini-pill">${sp.microscopy.motility === 'immobile' ? 'Immobile' : 'Mobile +'}</span>
      `;

      const pGold = document.createElement('p');
      pGold.innerHTML = `<strong>Metodo Gold Standard:</strong> ${escapeHtml(sp.clinical.goldStandard)}`;

      const pClin = document.createElement('p');
      pClin.innerHTML = `<strong>Clinica:</strong> ${escapeHtml(sp.clinical.overview)}`;

      const actionsRow = document.createElement('div');
      actionsRow.style.display = 'flex';
      actionsRow.style.gap = '8px';
      actionsRow.style.marginTop = '10px';

      const detailBtn = document.createElement('button');
      detailBtn.type = 'button';
      detailBtn.className = 'atlas-view-detail-btn';
      detailBtn.innerHTML = '📖 Scheda &amp; Letteratura';
      detailBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSpeciesDetail(sp.id);
      });

      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'atlas-view-detail-btn';
      selectBtn.style.background = '#0f766e';
      selectBtn.style.color = '#ffffff';
      selectBtn.style.borderColor = '#0f766e';
      selectBtn.innerHTML = '🎯 Seleziona';
      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.labAudio.playClick();
        selectSpeciesIntoInput(sp.name);
        els.atlasModal.classList.add('hidden');
      });

      actionsRow.appendChild(detailBtn);
      actionsRow.appendChild(selectBtn);

      card.appendChild(head);
      card.appendChild(badges);
      card.appendChild(pGold);
      card.appendChild(pClin);
      card.appendChild(actionsRow);

      card.addEventListener('click', () => {
        openSpeciesDetail(sp.id);
      });

      els.atlasSpeciesContainer.appendChild(card);
    }
  }

  // =========================================================================
  // ALBERO GENEALOGICO DEI BATTERI (FILOGENESI E CLASSIFICAZIONE COMPLETA)
  // =========================================================================
  function buildTaxonomyHierarchy() {
    const root = {
      name: 'Bacteria',
      rank: 'Dominio',
      children: new Map(),
      speciesList: []
    };

    for (const sp of BACTERIA_DB) {
      root.speciesList.push(sp);
      const tax = sp.taxonomy || {};
      const phylum = tax.phylum || 'Altro';
      const cls = tax.class || 'Classe non definita';
      const order = tax.order || 'Ordine non definito';
      const family = tax.family || 'Famiglia non definita';
      const genus = tax.genus || sp.genus || 'Genere';

      if (!root.children.has(phylum)) {
        root.children.set(phylum, { name: phylum, rank: 'Phylum', children: new Map(), speciesList: [] });
      }
      const phylumNode = root.children.get(phylum);
      phylumNode.speciesList.push(sp);

      if (!phylumNode.children.has(cls)) {
        phylumNode.children.set(cls, { name: cls, rank: 'Classe', children: new Map(), speciesList: [] });
      }
      const classNode = phylumNode.children.get(cls);
      classNode.speciesList.push(sp);

      if (!classNode.children.has(order)) {
        classNode.children.set(order, { name: order, rank: 'Ordine', children: new Map(), speciesList: [] });
      }
      const orderNode = classNode.children.get(order);
      orderNode.speciesList.push(sp);

      if (!orderNode.children.has(family)) {
        orderNode.children.set(family, { name: family, rank: 'Famiglia', children: new Map(), speciesList: [] });
      }
      const familyNode = orderNode.children.get(family);
      familyNode.speciesList.push(sp);

      if (!familyNode.children.has(genus)) {
        familyNode.children.set(genus, { name: genus, rank: 'Genere', children: new Map(), speciesList: [] });
      }
      const genusNode = familyNode.children.get(genus);
      genusNode.speciesList.push(sp);
    }

    return root;
  }

  function renderTaxonomyTree() {
    if (!els.atlasTreeRoot) return;
    els.atlasTreeRoot.innerHTML = '';
    const root = buildTaxonomyHierarchy();
    const query = (state.treeQuery || '').trim().toLowerCase();

    function nodeMatches(node) {
      if (!query) return true;
      if (node.name.toLowerCase().includes(query)) return true;
      return node.speciesList.some((sp) => {
        return (
          sp.name.toLowerCase().includes(query) ||
          (sp.aliases || []).some((al) => al.toLowerCase().includes(query)) ||
          sp.taxonomy.family.toLowerCase().includes(query)
        );
      });
    }

    function renderBranch(node, level = 0) {
      if (!nodeMatches(node)) return null;

      const item = document.createElement('div');
      item.className = 'tree-node-item';

      const row = document.createElement('div');
      row.className = 'tree-node-row';
      // Default: Domain & Phylum aperti, livelli inferiori chiusi a meno che non ci sia ricerca attiva
      const isOpen = Boolean(query) || level <= 1;
      if (isOpen) row.classList.add('open');

      const caret = document.createElement('span');
      caret.className = 'tree-caret';
      caret.textContent = '▶';

      const rankTag = document.createElement('span');
      rankTag.className = 'tree-rank-tag';
      rankTag.textContent = node.rank;

      const label = document.createElement('span');
      label.className = 'tree-node-label';
      label.textContent = node.name;

      const countPill = document.createElement('span');
      countPill.className = 'tree-count-pill';
      countPill.textContent = `${node.speciesList.length} sp.`;

      row.appendChild(caret);
      row.appendChild(rankTag);
      row.appendChild(label);
      row.appendChild(countPill);

      const subBranch = document.createElement('div');
      subBranch.className = 'tree-sub-branch' + (isOpen ? '' : ' collapsed');

      // Click sul nodo per espandere / comprimere
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentlyOpen = row.classList.toggle('open');
        subBranch.classList.toggle('collapsed', !currentlyOpen);
      });

      // Se il nodo ha nodi figli di rango inferiore
      if (node.children && node.children.size > 0) {
        for (const childNode of node.children.values()) {
          const childEl = renderBranch(childNode, level + 1);
          if (childEl) subBranch.appendChild(childEl);
        }
      } else {
        // Rango Genere: elenca le foglie delle specie
        const sortedSpecies = [...node.speciesList].sort((a, b) => a.name.localeCompare(b.name));
        for (const sp of sortedSpecies) {
          if (query) {
            const hit =
              sp.name.toLowerCase().includes(query) ||
              (sp.aliases || []).some((al) => al.toLowerCase().includes(query)) ||
              sp.taxonomy.family.toLowerCase().includes(query);
            if (!hit) continue;
          }

          const leaf = document.createElement('div');
          leaf.className = 'tree-species-leaf';
          if (state.treeSelectedSpeciesId === sp.id) leaf.classList.add('selected');

          const gramBadge = document.createElement('span');
          const gramClass = sp.microscopy.gram === 'pos' ? 'pos' : sp.microscopy.gram === 'neg' ? 'neg' : 'acidfast';
          const gramText = sp.microscopy.gram === 'pos' ? 'G+' : sp.microscopy.gram === 'neg' ? 'G−' : 'BAAR';
          gramBadge.className = `tree-gram-badge ${gramClass}`;
          gramBadge.textContent = gramText;

          const spName = document.createElement('span');
          spName.className = 'tree-species-name';
          spName.textContent = sp.name;

          leaf.appendChild(gramBadge);
          leaf.appendChild(spName);

          leaf.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.tree-species-leaf').forEach((l) => l.classList.remove('selected'));
            leaf.classList.add('selected');
            updateTreeInspector(sp);
          });

          subBranch.appendChild(leaf);
        }
      }

      item.appendChild(row);
      item.appendChild(subBranch);
      return item;
    }

    const treeDom = renderBranch(root, 0);
    if (treeDom) {
      els.atlasTreeRoot.appendChild(treeDom);
    } else {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'tree-empty-inspector';
      emptyMsg.innerHTML = '<p>Nessun ramo tassonomico corrisponde al filtro cercato.</p>';
      els.atlasTreeRoot.appendChild(emptyMsg);
    }

    // Se c'è già una specie selezionata, aggiorna l'ispettore, altrimenti mostra placeholder
    if (state.treeSelectedSpeciesId) {
      const selectedSp = BACTERIA_DB.find((b) => b.id === state.treeSelectedSpeciesId);
      if (selectedSp) updateTreeInspector(selectedSp);
      else updateTreeInspector(null);
    } else {
      updateTreeInspector(null);
    }
  }

  function updateTreeInspector(sp) {
    if (!els.treeEmptyInspector || !els.treeSpecDetails) return;
    if (!sp) {
      els.treeEmptyInspector.classList.remove('hidden');
      els.treeSpecDetails.classList.add('hidden');
      return;
    }
    state.treeSelectedSpeciesId = sp.id;
    els.treeEmptyInspector.classList.add('hidden');
    els.treeSpecDetails.classList.remove('hidden');

    const tax = sp.taxonomy || {};
    const gramTag =
      sp.microscopy.gram === 'pos'
        ? 'Gram-positivo (viola)'
        : sp.microscopy.gram === 'neg'
        ? 'Gram-negativo (rosa)'
        : 'Acido-alcol resistente (Ziehl+)';
    const gramClass = sp.microscopy.gram === 'pos' ? 'pos' : sp.microscopy.gram === 'neg' ? 'neg' : 'acidfast';

    els.treeSpecDetails.innerHTML = `
      <div class="tree-spec-quick-head">
        <canvas class="tree-spec-quick-canvas" width="90" height="52" id="treeInspectorCanvas"></canvas>
        <div>
          <h4 style="margin:0 0 2px 0;"><em>${escapeHtml(sp.name)}</em></h4>
          <div class="tree-spec-quick-lineage">${escapeHtml(tax.phylum || '')} ➔ ${escapeHtml(tax.family || '')}</div>
          <span class="tree-gram-badge ${gramClass}">${gramTag}</span>
        </div>
      </div>
      <div class="tree-spec-quick-gold">
        <strong>Gold Standard:</strong> ${escapeHtml(sp.clinical.goldStandard)}
      </div>
      <div style="font-size:0.77rem; color:#334155; margin:8px 0; line-height:1.4;">
        <strong>Microscopia:</strong> ${escapeHtml(sp.microscopy.shape)}, ${escapeHtml(sp.microscopy.arrangement || '')}, ${sp.microscopy.motility === 'immobile' ? 'Immobile' : 'Mobile +'}, Catalasi ${sp.biochem.peroxidase ? '+' : '−'}, Ossidasi ${sp.biochem.oxidase ? '+' : '−'}.
      </div>
      <p style="font-size:0.75rem; color:#64748b; line-height:1.35; margin-bottom:10px;">
        ${escapeHtml(sp.clinical.overview)}
      </p>
      <button type="button" class="tree-inspect-full-btn" id="treeInspectDossierBtn">
        📖 Scheda Completa &amp; Letteratura (${((sp.clinical && sp.clinical.literature) || sp.literature || []).length} Articoli)
      </button>
      <button type="button" class="tree-ctrl-btn" style="width:100%; margin-top:8px; background:#f0fdf4; border-color:#86efac; color:#166534;" id="treeSelectForGuessBtn">
        🎯 Seleziona per la Diagnosi
      </button>
    `;

    const miniCanvas = document.getElementById('treeInspectorCanvas');
    if (miniCanvas) {
      window.LabRenderer.renderAtlasPreview(miniCanvas, sp);
    }

    const dossierBtn = document.getElementById('treeInspectDossierBtn');
    if (dossierBtn) {
      dossierBtn.addEventListener('click', () => openSpeciesDetail(sp.id));
    }
    const selectBtn = document.getElementById('treeSelectForGuessBtn');
    if (selectBtn) {
      selectBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        selectSpeciesIntoInput(sp.name);
        els.atlasModal.classList.add('hidden');
      });
    }
  }

  // =========================================================================
  // SCHEDA DOSSIER SCIENTIFICO COMPLETO & LETTERATURA DELLA SPECIE
  // =========================================================================
  function renderDetailMicrograph(canvas, sp) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Fondo nero del campo microscopico
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const m = sp.microscopy || {};
    const key = m.micrographKey || (sp.id === 'mycobacterium_tuberculosis' ? 'mycobacterium_tuberculosis_ziehl' : `${sp.id}_gram`);
    const src = `assets/micrographs/${key}.jpg`;

    const img = new Image();
    img.onload = () => {
      ctx.save();
      const radius = Math.min(w, h) * 0.44;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.clip();

      const imgAspect = img.width / img.height;
      const targetAspect = w / h;
      let dw, dh, dx, dy;
      if (imgAspect > targetAspect) {
        dh = h;
        dw = h * imgAspect;
        dx = (w - dw) / 2;
        dy = 0;
      } else {
        dw = w;
        dh = w / imgAspect;
        dx = 0;
        dy = (h - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);

      if (sp.id === 'helicobacter_pylori' || sp.id === 'campylobacter_jejuni') {
        ctx.fillStyle = 'rgba(235, 75, 120, 0.12)';
        ctx.fill();
      }
      ctx.restore();

      // Ghiera metallica blu ottica dell'oculare
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Bordo riflettente
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Scala micrometrica in basso a destra
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.fillRect(w - 92, h - 26, 82, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 10px monospace';
      ctx.fillText('10 µm (1000×)', w - 86, h - 13);
    };
    img.onerror = () => {
      window.LabRenderer.renderAtlasPreview(canvas, sp);
    };
    img.src = src;
  }

  function openSpeciesDetail(speciesId) {
    const sp = BACTERIA_DB.find((b) => b.id === speciesId);
    if (!sp || !els.speciesDetailModal) return;
    state.selectedDetailSpeciesId = sp.id;
    window.labAudio.playPageFlip();

    els.speciesDetailModal.classList.remove('hidden');

    const tax = sp.taxonomy || {};
    if (els.detailTaxonomyLineage) {
      els.detailTaxonomyLineage.textContent = `Dominio: ${tax.domain || 'Bacteria'} ➔ Phylum: ${tax.phylum} ➔ Classe: ${tax.class} ➔ Ordine: ${tax.order} ➔ Famiglia: ${tax.family}`;
    }
    if (els.detailSpeciesTitle) {
      els.detailSpeciesTitle.innerHTML = `<em>${escapeHtml(sp.name)}</em>`;
    }
    if (els.detailSpeciesAliases) {
      els.detailSpeciesAliases.textContent = sp.aliases && sp.aliases.length ? `Sinonimi / Ceppi di riferimento: ${sp.aliases.join(', ')}` : '';
    }
    if (els.detailBslBadge) {
      const bsl =
        (sp.clinical && (sp.clinical.safetyLevel || sp.clinical.biosafetyLevel)) ||
        (sp.id.includes('tuberculosis') || sp.id.includes('anthracis') || sp.id.includes('brucella') ? '3' : '2');
      els.detailBslBadge.textContent = `Livello BSL-${bsl}`;
    }

    if (els.detailMicrographCanvas) {
      renderDetailMicrograph(els.detailMicrographCanvas, sp);
    }

    if (els.detailMicroCaption) {
      const gramDesc =
        sp.microscopy.gram === 'pos'
          ? 'Gram-positivo (viola)'
          : sp.microscopy.gram === 'neg'
          ? 'Gram-negativo (rosa / rosso)'
          : 'Acido-alcol resistente (rosso fucsia Ziehl-Neelsen)';
      const arrangement = sp.microscopy.arrangement || sp.microscopy.shape;
      const hasSpores = Boolean(sp.microscopy.spores && (sp.microscopy.spores.present === true || sp.microscopy.spores === true));
      const sporesText = hasSpores ? ' · Endospore termoresistenti evidenti (+)' : '';
      const capsuleText = sp.microscopy.capsule ? ' · Capsula polisaccaridica evidente (+)' : '';
      els.detailMicroCaption.innerHTML = `Micrografia ottica ad immersione (1000×). Morfologia: <strong>${escapeHtml(arrangement)}</strong>, colorazione: <strong>${gramDesc}</strong>${sporesText}${capsuleText}.`;
    }

    if (els.detailPlateDesc) {
      const p = sp.primaryPlate || {};
      const desc = p.macroSummary || 'Colonie caratteristiche su agar primario isolato.';
      const texture = p.texture ? `Consistenza: ${p.texture}` : '';
      const size = p.colonyRadius ? `Raggio medio: ~${p.colonyRadius} mm` : '';
      const extra = [texture, size].filter(Boolean).join(', ');
      els.detailPlateDesc.textContent = `${desc}${extra ? ` (${extra})` : ''}`;
    }

    if (els.detailGoldStandardBox) {
      els.detailGoldStandardBox.innerHTML = `<strong>Identificazione Diagnostica Definitiva:</strong> ${escapeHtml(sp.clinical.goldStandard)}`;
    }

    if (els.detailMarkersGrid) {
      const hasSpores = Boolean(sp.microscopy.spores && (sp.microscopy.spores.present === true || sp.microscopy.spores === true));
      const isUreasePos = Boolean(sp.biochem.urease && sp.biochem.urease !== 'neg' && sp.biochem.urease !== false);
      els.detailMarkersGrid.innerHTML = `
        <div class="detail-marker-pill"><span>Gram:</span> <strong>${sp.microscopy.gram === 'pos' ? 'Positivo (+)' : sp.microscopy.gram === 'neg' ? 'Negativo (−)' : 'Ziehl+'}</strong></div>
        <div class="detail-marker-pill"><span>Forma:</span> <strong>${escapeHtml(sp.microscopy.shape)}</strong></div>
        <div class="detail-marker-pill"><span>Catalasi (H₂O₂):</span> <strong>${sp.biochem.peroxidase ? 'Positiva (+)' : 'Negativa (−)'}</strong></div>
        <div class="detail-marker-pill"><span>Ossidasi:</span> <strong>${sp.biochem.oxidase ? 'Positiva (+)' : 'Negativa (−)'}</strong></div>
        <div class="detail-marker-pill"><span>Ureasi:</span> <strong>${isUreasePos ? 'Positiva (+)' : 'Negativa (−)'}</strong></div>
        <div class="detail-marker-pill"><span>Mobilità:</span> <strong>${sp.microscopy.motility === 'immobile' ? 'Immobile' : 'Mobile (+)'}</strong></div>
        <div class="detail-marker-pill"><span>Endospore:</span> <strong>${hasSpores ? 'Presenti (+)' : 'Assenti (−)'}</strong></div>
        <div class="detail-marker-pill"><span>Capsula:</span> <strong>${sp.microscopy.capsule ? 'Presente (+)' : 'Assente (−)'}</strong></div>
        <div class="detail-marker-pill"><span>Respirazione:</span> <strong>${escapeHtml(sp.biochem.oxygen || 'Facoltativo')}</strong></div>
      `;
    }

    if (els.detailMediaChips) {
      els.detailMediaChips.innerHTML = '';
      const mediaTests = TESTS_CATALOG.filter((t) => t.category === 'media');
      for (const testMeta of mediaTests) {
        const res = evaluateTest(sp, testMeta.id);
        const isGrowth = res.petriSpec ? res.petriSpec.growth : !res.badge.toLowerCase().includes('nessuna') && !res.badge.toLowerCase().includes('inibita');
        const chip = document.createElement('span');
        chip.className = `detail-media-chip ${isGrowth ? 'growth-pos' : 'growth-neg'}`;
        chip.innerHTML = `${isGrowth ? '✓' : '✗'} <strong>${escapeHtml(testMeta.name)}:</strong> ${escapeHtml(res.badge)}`;
        chip.title = res.detail;
        els.detailMediaChips.appendChild(chip);
      }
    }

    if (els.detailClinicalOverview) {
      els.detailClinicalOverview.textContent = sp.clinical.overview;
    }

    if (els.detailDiseasesTags) {
      const diseases = sp.clinical.diseases || sp.clinical.associatedDiseases || [];
      els.detailDiseasesTags.innerHTML = diseases
        .map((d) => `<span class="disease-tag">${escapeHtml(d)}</span>`)
        .join('');
    }

    if (els.detailLiteratureList) {
      els.detailLiteratureList.innerHTML = '';
      const lits = (sp.clinical && sp.clinical.literature) || sp.literature || [];
      if (lits.length === 0) {
        els.detailLiteratureList.innerHTML = '<p class="lit-finding">Nessuna voce bibliografica indicizzata.</p>';
      } else {
        for (const lit of lits) {
          const card = document.createElement('div');
          card.className = 'lit-card';
          const citation = lit.citation || (lit.authors ? `${lit.authors} (${lit.year}). ${lit.journal}` : 'Articolo scientifico');
          const sourceTag = lit.source ? ` · Fonte: <strong>${escapeHtml(lit.source)}</strong>` : '';
          const pmidTag = lit.pmid ? ` · PMID: <strong>${escapeHtml(lit.pmid)}</strong>` : '';
          card.innerHTML = `
            <div class="lit-title">${escapeHtml(lit.title)}</div>
            <div class="lit-citation">📄 ${escapeHtml(citation)}${sourceTag}${pmidTag}</div>
            <div class="lit-finding">💡 <strong>Evidenza microbiologica:</strong> ${escapeHtml(lit.keyFinding)}</div>
          `;
          els.detailLiteratureList.appendChild(card);
        }
      }
    }
  }

  // =========================================================================
  // AUTOCOMPLETAMENTO & LOGICA 5 ERRORI MASSIMI
  // =========================================================================
  function getMatchingSpecies(query) {
    const q = (query || '').trim().toLowerCase();
    const sorted = [...BACTERIA_DB].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;

    return sorted
      .map((sp) => {
        const lowerName = sp.name.toLowerCase();
        const abbrev = `${sp.genus[0].toLowerCase()}. ${sp.species.toLowerCase()}`;
        const abbrevNoSpace = `${sp.genus[0].toLowerCase()}.${sp.species.toLowerCase()}`;
        let score = 0;

        if (lowerName === q || abbrev === q) score = 100;
        else if (lowerName.startsWith(q) || sp.species.toLowerCase().startsWith(q)) score = 85;
        else if (abbrev.startsWith(q) || abbrevNoSpace.startsWith(q)) score = 80;
        else if (lowerName.includes(q)) score = 65;
        else if (sp.aliases.some((al) => al.toLowerCase().includes(q))) score = 50;

        return { sp, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.sp.name.localeCompare(b.sp.name))
      .map((item) => item.sp);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[ch];
    });
  }

  function highlightMatchSafe(text, query) {
    const q = (query || '').trim();
    if (!q) return escapeHtml(text);
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return `${escapeHtml(text.slice(0, idx))}<mark>${escapeHtml(
      text.slice(idx, idx + q.length)
    )}</mark>${escapeHtml(text.slice(idx + q.length))}`;
  }

  function updateSuggestionsDropdown() {
    if (state.roundEnded) {
      hideSuggestions();
      return;
    }
    const query = els.speciesInput.value;
    els.clearInputBtn.classList.toggle('hidden', query.length === 0);

    const matches = getMatchingSpecies(query);
    state.currentFilteredSuggestions = matches;
    state.highlightedSuggestionIdx = matches.length > 0 ? 0 : -1;

    els.suggestionsDropdown.innerHTML = '';
    if (matches.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'suggestion-item already-tried';
      emptyLi.innerHTML = `<span class="sug-name">Nessun batterio trovato per "${escapeHtml(query)}"</span>`;
      els.suggestionsDropdown.appendChild(emptyLi);
      els.suggestionsDropdown.classList.remove('hidden');
      return;
    }

    matches.forEach((sp, idx) => {
      const alreadyTried = state.wrongGuesses.some((w) => w.bacterium.id === sp.id);
      const isRuledOut = state.ruledOutIds.has(sp.id);

      const li = document.createElement('li');
      li.className =
        'suggestion-item' +
        (idx === state.highlightedSuggestionIdx ? ' highlighted' : '') +
        (alreadyTried ? ' already-tried' : '');

      let metaTag = `Genere: ${sp.genus}`;
      if (alreadyTried) metaTag = '✗ Già errato';
      else if (isRuledOut) metaTag = 'Depennato nel Blocchetto';

      li.innerHTML = `
        <span class="sug-name">${highlightMatchSafe(sp.name, query)}</span>
        <span class="sug-meta">${escapeHtml(metaTag)}</span>
      `;

      if (!alreadyTried) {
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          window.labAudio.playClick();
          selectSpeciesIntoInput(sp.name);
        });
      }
      els.suggestionsDropdown.appendChild(li);
    });

    els.suggestionsDropdown.classList.remove('hidden');
    renderQuickChips();
  }

  function hideSuggestions() {
    els.suggestionsDropdown.classList.add('hidden');
    state.highlightedSuggestionIdx = -1;
  }

  function selectSpeciesIntoInput(speciesName) {
    els.speciesInput.value = speciesName;
    els.clearInputBtn.classList.remove('hidden');
    hideSuggestions();
    els.speciesInput.focus();
  }

  function renderQuickChips() {
    els.quickChipsContainer.innerHTML = '';
    const query = els.speciesInput.value.trim();

    let candidates = getMatchingSpecies(query).filter(
      (sp) =>
        !state.wrongGuesses.some((w) => w.bacterium.id === sp.id) &&
        !state.ruledOutIds.has(sp.id)
    );

    if (candidates.length === 0) {
      candidates = BACTERIA_DB.filter(
        (sp) => !state.wrongGuesses.some((w) => w.bacterium.id === sp.id)
      );
    }

    if (!query && candidates.length > 5) {
      const step = Math.max(1, Math.floor(candidates.length / 5));
      const offset = state.roundSeed % candidates.length;
      const picked = [];
      for (let i = 0; i < candidates.length && picked.length < 5; i++) {
        const item = candidates[(offset + i * step) % candidates.length];
        if (!picked.includes(item)) picked.push(item);
      }
      candidates = picked;
    } else {
      candidates = candidates.slice(0, 5);
    }

    for (const sp of candidates) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-chip';
      chip.textContent = sp.name;
      chip.disabled = state.roundEnded;
      chip.addEventListener('click', () => {
        window.labAudio.playClick();
        selectSpeciesIntoInput(sp.name);
      });
      els.quickChipsContainer.appendChild(chip);
    }
  }

  function handleGuessSubmit(e) {
    e.preventDefault();
    if (state.roundEnded) {
      startNewRound();
      return;
    }

    const raw = els.speciesInput.value.trim();
    if (!raw) {
      updateSuggestionsDropdown();
      els.speciesInput.focus();
      return;
    }

    const exact = BACTERIA_DB.find(
      (sp) =>
        sp.name.toLowerCase() === raw.toLowerCase() ||
        `${sp.genus[0].toLowerCase()}. ${sp.species.toLowerCase()}` === raw.toLowerCase()
    );

    let chosen = exact;
    if (!chosen) {
      const matches = getMatchingSpecies(raw);
      if (matches.length === 1) chosen = matches[0];
      else {
        updateSuggestionsDropdown();
        return;
      }
    }

    if (state.wrongGuesses.some((w) => w.bacterium.id === chosen.id)) {
      shakeGuessCard();
      hideSuggestions();
      return;
    }

    hideSuggestions();

    if (chosen.id === state.currentBacterium.id) {
      endRound(true);
    } else {
      state.errors += 1;
      const sameGenus = chosen.genus === state.currentBacterium.genus;
      state.wrongGuesses.push({ bacterium: chosen, sameGenus });

      window.labAudio.playWrong();
      shakeGuessCard();
      deductPoints(WRONG_GUESS_PENALTY);

      els.speciesInput.value = '';
      els.clearInputBtn.classList.add('hidden');

      renderHUD();
      renderAttemptsLog();
      renderSuspectsGrid();
      renderQuickChips();

      if (state.errors >= MAX_ERRORS) {
        endRound(false);
      }
    }
  }

  function shakeGuessCard() {
    els.guessCard.classList.remove('shake');
    void els.guessCard.offsetWidth;
    els.guessCard.classList.add('shake');
  }

  function renderAttemptsLog() {
    els.attemptsLog.innerHTML = '';
    for (let i = state.wrongGuesses.length - 1; i >= 0; i--) {
      const item = state.wrongGuesses[i];
      const row = document.createElement('div');
      row.className = 'attempt-row' + (item.sameGenus ? ' same-genus' : '');
      row.innerHTML = `
        <span>✗ <em>${escapeHtml(item.bacterium.name)}</em></span>
        <span class="attempt-hint">${
          item.sameGenus
            ? `⚡ Genere "${escapeHtml(item.bacterium.genus)}" CORRETTO, ma specie diversa!`
            : `Errore ${i + 1}/${MAX_ERRORS} (−${WRONG_GUESS_PENALTY} pt)`
        }</span>
      `;
      els.attemptsLog.appendChild(row);
    }
  }

  function endRound(won) {
    state.roundEnded = true;
    state.roundWon = won;
    window.labAudio.setHoodHum(false);

    if (state.benchFullscreen) {
      setFsDrawers(false, false);
    }
    if (state.inspectionOpen) {
      closeInspectionModal(true);
    }

    const earned = won ? state.potentialScore : 0;
    if (won) {
      state.totalScore += earned;
      state.solvedIds.add(state.currentBacterium.id);
      savePersistedStats();
      window.labAudio.playWin();
    } else {
      window.labAudio.playGameOver();
    }

    renderHUD();
    renderCategoryTests();

    els.speciesInput.value = state.currentBacterium.name;
    els.speciesInput.disabled = true;
    els.clearInputBtn.classList.add('hidden');
    els.submitGuessBtn.innerHTML = '<span>Prossimo Ceppo Misterioso</span><span>→</span>';

    const completedAll100 = won && state.solvedIds.size === BACTERIA_DB.length;
    els.modalResultBanner.classList.toggle('lost', !won);
    els.modalResultIcon.textContent = completedAll100 ? '👑' : won ? '🏆' : '☣️';
    els.modalResultKicker.textContent = completedAll100
      ? 'COLLEZIONE COMPLETA: TUTTE LE 100 SPECIE IDENTIFICATE!'
      : won
      ? 'IDENTIFICAZIONE BATTERIOLOGICA RIUSCITA!'
      : 'LIMITE DI 5 ERRORI RAGGIUNTO — DIAGNOSI MANCATA';
    els.modalResultTitle.innerHTML = `<em>${escapeHtml(state.currentBacterium.name)}</em>`;
    els.modalResultTaxonomy.textContent = state.currentBacterium.taxonomyGroup;

    els.modalScoreEarned.textContent = won ? `+${earned} pt` : '0 pt';
    els.modalTestsCount.textContent = `${state.performedTests.size + state.pendingTests.size} test`;
    els.modalErrorsCount.textContent = `${state.errors} / ${MAX_ERRORS}`;

    els.modalGoldStandard.textContent = state.currentBacterium.clinical.goldStandard;
    els.modalClinicalOverview.textContent = state.currentBacterium.clinical.overview;

    setTimeout(() => {
      els.resultModal.classList.remove('hidden');
    }, won ? 220 : 420);
  }

  // =========================================================================
  // EVENTI INTERATTIVI UI (CLASSICA + BANCONE 3D + SCHERMATE RAVVICINATE)
  // =========================================================================
  function bindEvents() {
    els.realisticModeBtn.addEventListener('click', toggleRealisticMode);

    // Controlli Cappa Biohazard BSL-2 (condivisi tra Bancone, Schermo Intero, Cappa 3D e Modale)
    const toggleBacklight = () => {
      window.labAudio.playClick();
      updateBacklightUI(!renderer.backlight);
    };

    els.hoodAirBtn.addEventListener('click', toggleHoodAir);
    els.hoodLightBtn.addEventListener('click', toggleHoodLight);
    els.backlightBtn.addEventListener('click', toggleBacklight);

    if (els.fsHoodAirBtn) els.fsHoodAirBtn.addEventListener('click', toggleHoodAir);
    if (els.fsHoodLightBtn) els.fsHoodLightBtn.addEventListener('click', toggleHoodLight);

    if (els.modalHoodAirBtn) els.modalHoodAirBtn.addEventListener('click', toggleHoodAir);
    if (els.modalHoodLightBtn) els.modalHoodLightBtn.addEventListener('click', toggleHoodLight);
    if (els.modalBacklightBtn) els.modalBacklightBtn.addEventListener('click', toggleBacklight);

    // Pulsante "Ripeti Semina" per rivedere l'animazione automatica continua a 4 quadranti
    if (els.modalReplayStreakBtn) {
      els.modalReplayStreakBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        const msg =
          '➰ Semina automatica sotto cappa BSL-2 in corso: osserva lo striscio continuo a 4 quadranti e l’incubazione 24h!';
        els.modalPromptText.textContent = msg;
        els.modalPromptBubble.classList.remove('hidden');
        els.modalCanvasHintPill.textContent =
          '➰ Semina automatica con ansa sterile e incubazione 24h in corso...';
        els.modalCanvasHintPill.classList.remove('hidden');
        renderer.replayAutoStreak();
      });
    }

    // Controlli Bancone 3D a Schermo Intero e cassetti flottanti
    if (els.benchFullscreenBtn) {
      els.benchFullscreenBtn.addEventListener('click', toggleBenchFullscreen);
    }
    if (els.fsExitFullscreenBtn) {
      els.fsExitFullscreenBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setBenchFullscreen(false, false);
      });
    }
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && state.benchFullscreen) {
        setBenchFullscreen(false, true);
      } else if (bench3d && bench3d.supported) {
        bench3d.resize();
      }
    });

    if (els.fsToggleTestsBtn) {
      els.fsToggleTestsBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setFsDrawers(!state.fsTestsOpen, false);
      });
    }
    if (els.fsToggleGuessBtn) {
      els.fsToggleGuessBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setFsDrawers(false, !state.fsGuessOpen);
      });
    }
    if (els.closeFsTestsBtn) {
      els.closeFsTestsBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setFsDrawers(false, false);
      });
    }
    if (els.closeFsGuessBtn) {
      els.closeFsGuessBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setFsDrawers(false, false);
      });
    }

    // Console Microscopio (Obiettivi, Macrometrica, Micrometrica, Diaframma, Centra)
    document.querySelectorAll('.obj-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.labAudio.playMicroscopeClick();
        const targetObj = btn.dataset.obj;
        document.querySelectorAll('.obj-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.obj === targetObj);
        });
        renderer.setMicroscopeParams({ objective: targetObj });
        syncBench3DState();
      });
    });

    const handleMacroInput = (val) => {
      els.macroFocusSlider.value = String(val);
      if (els.modalMacroFocusSlider) els.modalMacroFocusSlider.value = String(val);
      renderer.setMicroscopeParams({ macro: val });
    };

    const handleMicroInput = (val) => {
      els.microFocusSlider.value = String(val);
      if (els.modalMicroFocusSlider) els.modalMicroFocusSlider.value = String(val);
      renderer.setMicroscopeParams({ micro: val });
    };

    const handleCondenserInput = (val) => {
      els.condenserSlider.value = String(val);
      if (els.modalCondenserSlider) els.modalCondenserSlider.value = String(val);
      renderer.setMicroscopeParams({ condenser: val });
    };

    els.macroFocusSlider.addEventListener('input', () => {
      handleMacroInput(parseFloat(els.macroFocusSlider.value));
    });
    if (els.modalMacroFocusSlider) {
      els.modalMacroFocusSlider.addEventListener('input', () => {
        handleMacroInput(parseFloat(els.modalMacroFocusSlider.value));
      });
    }

    els.microFocusSlider.addEventListener('input', () => {
      handleMicroInput(parseFloat(els.microFocusSlider.value));
    });
    if (els.modalMicroFocusSlider) {
      els.modalMicroFocusSlider.addEventListener('input', () => {
        handleMicroInput(parseFloat(els.modalMicroFocusSlider.value));
      });
    }

    els.condenserSlider.addEventListener('input', () => {
      handleCondenserInput(parseFloat(els.condenserSlider.value));
    });
    if (els.modalCondenserSlider) {
      els.modalCondenserSlider.addEventListener('input', () => {
        handleCondenserInput(parseFloat(els.modalCondenserSlider.value));
      });
    }

    const handleCenterStage = () => {
      window.labAudio.playClick();
      renderer.setMicroscopeParams({ resetPan: true });
    };
    els.centerStageBtn.addEventListener('click', handleCenterStage);
    if (els.modalCenterStageBtn) {
      els.modalCenterStageBtn.addEventListener('click', handleCenterStage);
    }

    // Bottone "Completa subito" sul fumetto realistico (inline + modale)
    const handleFastComplete = () => {
      renderer.completeCurrentProcedure();
    };
    els.completeStepFastBtn.addEventListener('click', handleFastComplete);
    if (els.modalCompleteFastBtn) {
      els.modalCompleteFastBtn.addEventListener('click', handleFastComplete);
    }

    // Chiusura Schermata Ravvicinata (Modalità Realistica: ON)
    if (els.closeInspectionModalBtn) {
      els.closeInspectionModalBtn.addEventListener('click', () => {
        closeInspectionModal(false);
      });
    }
    if (els.realisticInspectionModal) {
      els.realisticInspectionModal.addEventListener('click', (e) => {
        if (e.target === els.realisticInspectionModal) {
          closeInspectionModal(false);
        }
      });
    }

    // Categorie test
    document.querySelectorAll('.cat-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.labAudio.playClick();
        document.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.dataset.category;
        renderCategoryTests();
      });
    });

    // Apertura/chiusura Quaderno 1: Blocchetto Note
    const openNotepad = () => {
      window.labAudio.playPageFlip();
      els.notepadModal.classList.remove('hidden');
    };
    els.openNotepadBtn.addEventListener('click', openNotepad);
    els.openNotepadDeskBtn.addEventListener('click', openNotepad);
    if (els.benchOpenNotepadBtn) els.benchOpenNotepadBtn.addEventListener('click', openNotepad);
    if (els.fsOpenNotepadBtn) els.fsOpenNotepadBtn.addEventListener('click', openNotepad);
    if (els.modalOpenNotepadBtn) els.modalOpenNotepadBtn.addEventListener('click', openNotepad);

    els.closeNotepadBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      els.notepadModal.classList.add('hidden');
      if (state.isMobileLayout && state.activeMobileTab === 'notebooks') {
        setMobileTab('microscope');
      }
    });
    els.notepadModal.addEventListener('click', (e) => {
      if (e.target === els.notepadModal) {
        els.notepadModal.classList.add('hidden');
        if (state.isMobileLayout && state.activeMobileTab === 'notebooks') {
          setMobileTab('microscope');
        }
      }
    });

    document.querySelectorAll('.np-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        window.labAudio.playPageFlip();
        document.querySelectorAll('.np-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.dataset.nptab;
        els.npResultsPage.classList.toggle('hidden', key !== 'all_results');
        els.npNotesPage.classList.toggle('hidden', key !== 'notes');
        els.npChecklistPage.classList.toggle('hidden', key !== 'checklist');
      });
    });

    els.userLabNotesArea.addEventListener('input', () => {
      state.userNotes = els.userLabNotesArea.value;
    });

    document.querySelectorAll('.qtag-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.labAudio.playClick();
        const tag = btn.dataset.note;
        const cur = els.userLabNotesArea.value;
        els.userLabNotesArea.value = cur + (cur && !cur.endsWith('\n') ? '\n' : '') + tag;
        state.userNotes = els.userLabNotesArea.value;
        els.userLabNotesArea.focus();
      });
    });

    els.clearNotesBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      els.userLabNotesArea.value = '';
      state.userNotes = '';
    });

    // Apertura/chiusura Quaderno 2: L'Atlante dei Batteri
    const openAtlas = () => {
      window.labAudio.playPageFlip();
      els.atlasModal.classList.remove('hidden');
    };
    els.openAtlasBtn.addEventListener('click', openAtlas);
    els.openAtlasDeskBtn.addEventListener('click', openAtlas);
    if (els.benchOpenAtlasBtn) els.benchOpenAtlasBtn.addEventListener('click', openAtlas);
    if (els.fsOpenAtlasBtn) els.fsOpenAtlasBtn.addEventListener('click', openAtlas);

    els.closeAtlasBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      els.atlasModal.classList.add('hidden');
      if (state.isMobileLayout && state.activeMobileTab === 'notebooks') {
        setMobileTab('microscope');
      }
    });
    els.atlasModal.addEventListener('click', (e) => {
      if (e.target === els.atlasModal) {
        els.atlasModal.classList.add('hidden');
        if (state.isMobileLayout && state.activeMobileTab === 'notebooks') {
          setMobileTab('microscope');
        }
      }
    });

    // Pulsanti rapidi sul Bancone 3D (Microscopio 3D & Piastra Petri 3D)
    if (els.benchOpenMicroscopeBtn) {
      els.benchOpenMicroscopeBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (bench3d && bench3d.supported) {
          bench3d.zoomToStationAndTrigger('microscope');
        } else {
          handleBenchStationSelected('microscope');
        }
      });
    }
    if (els.benchOpenPetriBtn) {
      els.benchOpenPetriBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (bench3d && bench3d.supported) {
          bench3d.zoomToStationAndTrigger('petri');
        } else {
          handleBenchStationSelected('petri');
        }
      });
    }

    // Scorciatoia tasto Escape per chiudere a cascata Modali, Quaderni, Schermata Ravvicinata o Schermo Intero
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (els.speciesDetailModal && !els.speciesDetailModal.classList.contains('hidden')) {
        els.speciesDetailModal.classList.add('hidden');
        return;
      }
      if (!els.notepadModal.classList.contains('hidden')) {
        els.notepadModal.classList.add('hidden');
        return;
      }
      if (!els.atlasModal.classList.contains('hidden')) {
        els.atlasModal.classList.add('hidden');
        return;
      }
      if (state.inspectionOpen) {
        closeInspectionModal(false);
        return;
      }
      if (state.fsTestsOpen || state.fsGuessOpen) {
        setFsDrawers(false, false);
        return;
      }
      if (state.benchFullscreen) {
        setBenchFullscreen(false, false);
      }
    });

    // Navigazione Segnalibri Atlante (Tutte le Specie, Albero Genealogico, Gruppi, Schemi)
    document.querySelectorAll('.bookmark-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        window.labAudio.playPageFlip();
        document.querySelectorAll('.bookmark-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const f = tab.dataset.atlasfilter;
        const isTree = f === 'tree';
        const isFlow = f === 'flowchart';

        if (els.atlasFlowchartTab) els.atlasFlowchartTab.classList.toggle('hidden', !isFlow);
        if (els.atlasTreeTab) els.atlasTreeTab.classList.toggle('hidden', !isTree);
        if (els.atlasSpeciesTab) els.atlasSpeciesTab.classList.toggle('hidden', isFlow || isTree);
        if (els.atlasSearchWrap) els.atlasSearchWrap.classList.toggle('hidden', isFlow || isTree);
        if (els.atlasChipsBar) els.atlasChipsBar.classList.toggle('hidden', isFlow || isTree);

        if (isTree) {
          renderTaxonomyTree();
        } else if (!isFlow) {
          state.atlasFilter = f;
          renderAtlasCards();
        }
      });
    });

    // Filtri Rapidi Proprietà Batteriologiche (Chip Bar)
    if (els.atlasChipsBar) {
      els.atlasChipsBar.querySelectorAll('.atlas-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          window.labAudio.playClick();
          els.atlasChipsBar.querySelectorAll('.atlas-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          state.atlasChipFilter = chip.dataset.chip || 'all';
          renderAtlasCards();
        });
      });
    }

    // Ricerca testuale nell'Atlante delle 100 Specie
    if (els.atlasSearchInput) {
      els.atlasSearchInput.addEventListener('input', () => {
        state.atlasQuery = els.atlasSearchInput.value;
        renderAtlasCards();
      });
    }

    // Ricerca e controlli espansione nell'Albero Genealogico Tassonomico
    if (els.atlasTreeSearch) {
      els.atlasTreeSearch.addEventListener('input', () => {
        state.treeQuery = els.atlasTreeSearch.value;
        renderTaxonomyTree();
      });
    }

    if (els.atlasTreeExpandBtn) {
      els.atlasTreeExpandBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (els.atlasTreeRoot) {
          els.atlasTreeRoot.querySelectorAll('.tree-node-row').forEach((r) => r.classList.add('open'));
          els.atlasTreeRoot.querySelectorAll('.tree-sub-branch').forEach((b) => b.classList.remove('collapsed'));
        }
      });
    }

    if (els.atlasTreeCollapseBtn) {
      els.atlasTreeCollapseBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (els.atlasTreeRoot) {
          const rows = els.atlasTreeRoot.querySelectorAll('.tree-node-row');
          const branches = els.atlasTreeRoot.querySelectorAll('.tree-sub-branch');
          rows.forEach((r, idx) => {
            if (idx > 0) r.classList.remove('open');
          });
          branches.forEach((b, idx) => {
            if (idx > 0) b.classList.add('collapsed');
          });
        }
      });
    }

    // Gestione chiusura e selezione nel Modale Dossier & Letteratura
    if (els.closeSpeciesDetailBtn) {
      els.closeSpeciesDetailBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        els.speciesDetailModal.classList.add('hidden');
      });
    }

    if (els.detailCloseBottomBtn) {
      els.detailCloseBottomBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        els.speciesDetailModal.classList.add('hidden');
      });
    }

    if (els.speciesDetailModal) {
      els.speciesDetailModal.addEventListener('click', (e) => {
        if (e.target === els.speciesDetailModal) {
          els.speciesDetailModal.classList.add('hidden');
        }
      });
    }

    if (els.detailSelectForLabBtn) {
      els.detailSelectForLabBtn.addEventListener('click', () => {
        if (!state.selectedDetailSpeciesId) return;
        const sp = BACTERIA_DB.find((b) => b.id === state.selectedDetailSpeciesId);
        if (!sp) return;
        window.labAudio.playClick();
        selectSpeciesIntoInput(sp.name);
        els.speciesDetailModal.classList.add('hidden');
        els.atlasModal.classList.add('hidden');
      });
    }

    // Autocompletamento barra di risposta
    els.speciesInput.addEventListener('input', () => updateSuggestionsDropdown());
    els.speciesInput.addEventListener('focus', () => updateSuggestionsDropdown());

    els.speciesInput.addEventListener('keydown', (e) => {
      const dropdownOpen = !els.suggestionsDropdown.classList.contains('hidden');
      const list = state.currentFilteredSuggestions;

      if (e.key === 'ArrowDown' && dropdownOpen && list.length > 0) {
        e.preventDefault();
        state.highlightedSuggestionIdx = (state.highlightedSuggestionIdx + 1) % list.length;
        refreshDropdownHighlight();
      } else if (e.key === 'ArrowUp' && dropdownOpen && list.length > 0) {
        e.preventDefault();
        state.highlightedSuggestionIdx =
          (state.highlightedSuggestionIdx - 1 + list.length) % list.length;
        refreshDropdownHighlight();
      } else if (e.key === 'Enter' && dropdownOpen && state.highlightedSuggestionIdx >= 0) {
        const candidate = list[state.highlightedSuggestionIdx];
        const currentText = els.speciesInput.value.trim().toLowerCase();
        if (candidate && currentText !== candidate.name.toLowerCase()) {
          e.preventDefault();
          const alreadyTried = state.wrongGuesses.some((w) => w.bacterium.id === candidate.id);
          if (!alreadyTried) {
            window.labAudio.playClick();
            selectSpeciesIntoInput(candidate.name);
          }
        }
      } else if (e.key === 'Escape') {
        hideSuggestions();
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-wrapper')) {
        hideSuggestions();
      }
    });

    els.clearInputBtn.addEventListener('click', () => {
      els.speciesInput.value = '';
      els.clearInputBtn.classList.add('hidden');
      updateSuggestionsDropdown();
      els.speciesInput.focus();
    });

    els.guessForm.addEventListener('submit', handleGuessSubmit);

    // Gestione Menu di Apertura (Start Screen) & Impostazioni
    if (els.masterVolumeSlider) {
      const volPct = Math.round(state.masterVolume * 100);
      els.masterVolumeSlider.value = volPct;
      if (els.masterVolumeVal) els.masterVolumeVal.textContent = volPct + '%';
      window.labAudio.setVolume(state.masterVolume);

      els.masterVolumeSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        state.masterVolume = val / 100;
        if (els.masterVolumeVal) els.masterVolumeVal.textContent = val + '%';
        window.labAudio.setVolume(state.masterVolume);
        savePersistedStats();
      });
    }

    if (els.startRealisticToggle) {
      els.startRealisticToggle.checked = state.realisticMode;
      els.startRealisticToggle.addEventListener('change', (e) => {
        setRealisticMode(e.target.checked);
      });
    }

    if (els.startHoodAirToggle) {
      els.startHoodAirToggle.checked = state.hoodAirOn;
      els.startHoodAirToggle.addEventListener('change', (e) => {
        setHoodAir(e.target.checked);
      });
    }

    if (els.startSettingsBtn && els.startSettingsDrawer) {
      els.startSettingsBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        els.startSettingsDrawer.classList.toggle('hidden');
      });
    }

    if (els.startSoundToggleBtn) {
      els.startSoundToggleBtn.addEventListener('click', () => {
        const on = window.labAudio.toggle();
        els.startSoundIcon.textContent = on ? '🔊 Attivo' : '🔇 Disattivato';
        els.soundIcon.textContent = on ? '🔊' : '🔇';
      });
    }

    if (els.startAtlasQuickBtn) {
      els.startAtlasQuickBtn.addEventListener('click', () => {
        window.labAudio.playPageFlip();
        els.atlasModal.classList.remove('hidden');
      });
    }

    // Trigger Play con Transizione Chimica e Microbiologica
    if (els.startPlayBtn) {
      els.startPlayBtn.addEventListener('click', () => {
        triggerChemicalTransitionAndStart();
      });
    }

    // Controlli generali
    els.soundToggleBtn.addEventListener('click', () => {
      const on = window.labAudio.toggle();
      els.soundIcon.textContent = on ? '🔊' : '🔇';
      if (on) updateEnvironmentControlsForView();
    });

    els.skipSampleBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      startNewRound();
    });

    els.nextSampleModalBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      startNewRound();
    });

    els.inspectPlateAfterBtn.addEventListener('click', () => {
      window.labAudio.playClick();
      els.resultModal.classList.add('hidden');
      if (state.realisticMode) {
        openInspectionModal('primary', false);
      }
    });

    // Condivisione con chiunque (Web Share API o Copia Link con Toast)
    if (els.shareAppBtn) {
      els.shareAppBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        shareLaboratory(false);
      });
    }

    if (els.startShareBtn) {
      els.startShareBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        shareLaboratory(false);
      });
    }

    if (els.shareResultBtn) {
      els.shareResultBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        shareLaboratory(true);
      });
    }

    // Selettori Modalità Dispositivo (Menu Iniziale & Impostazioni)
    const modePillMap = [
      { el: els.devModeAuto, mode: 'auto' },
      { el: els.devModeMobile, mode: 'mobile' },
      { el: els.devModeDesktop, mode: 'desktop' },
      { el: els.settDevAuto, mode: 'auto' },
      { el: els.settDevMobile, mode: 'mobile' },
      { el: els.settDevDesktop, mode: 'desktop' }
    ];

    modePillMap.forEach(({ el, mode }) => {
      if (!el) return;
      el.addEventListener('click', () => {
        window.labAudio.playClick();
        setDeviceModePreference(mode);
      });
    });

    // Pulsante Rapido Header Commutatore Dispositivo
    if (els.deviceModeHeaderBtn) {
      els.deviceModeHeaderBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        toggleDeviceMode();
      });
    }

    // Barra Navigazione Inferiore Mobile (4 Schede)
    const mobileTabsMap = [
      { el: els.mobTabMicroscope, key: 'microscope' },
      { el: els.mobTabTests, key: 'tests' },
      { el: els.mobTabGuess, key: 'guess' },
      { el: els.mobTabNotebooks, key: 'notebooks' }
    ];

    mobileTabsMap.forEach(({ el, key }) => {
      if (!el) return;
      el.addEventListener('click', () => {
        window.labAudio.playClick();
        setMobileTab(key);
      });
    });

    // Focus Touch Steppers (per smartphone: aggiusta senza combattere con gli slider)
    if (els.macroStepDown && els.macroFocusSlider) {
      els.macroStepDown.addEventListener('click', () => {
        const cur = parseFloat(els.macroFocusSlider.value);
        els.macroFocusSlider.value = Math.max(10, cur - 4);
        els.macroFocusSlider.dispatchEvent(new Event('input'));
      });
    }
    if (els.macroStepUp && els.macroFocusSlider) {
      els.macroStepUp.addEventListener('click', () => {
        const cur = parseFloat(els.macroFocusSlider.value);
        els.macroFocusSlider.value = Math.min(90, cur + 4);
        els.macroFocusSlider.dispatchEvent(new Event('input'));
      });
    }
    if (els.microStepDown && els.microFocusSlider) {
      els.microStepDown.addEventListener('click', () => {
        const cur = parseFloat(els.microFocusSlider.value);
        els.microFocusSlider.value = Math.max(-15, cur - 1.5);
        els.microFocusSlider.dispatchEvent(new Event('input'));
      });
    }
    if (els.microStepUp && els.microFocusSlider) {
      els.microStepUp.addEventListener('click', () => {
        const cur = parseFloat(els.microFocusSlider.value);
        els.microFocusSlider.value = Math.min(15, cur + 1.5);
        els.microFocusSlider.dispatchEvent(new Event('input'));
      });
    }

    // Scorciatoie veloci Smartphone
    if (els.mobQuickGoTestsBtn) {
      els.mobQuickGoTestsBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setMobileTab('tests');
      });
    }
    if (els.mobQuickGoGuessBtn) {
      els.mobQuickGoGuessBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setMobileTab('guess');
      });
    }
    if (els.mobQuickBackScopeBtn) {
      els.mobQuickBackScopeBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setMobileTab('microscope');
      });
    }
    if (els.mobQuickTestsGoGuessBtn) {
      els.mobQuickTestsGoGuessBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        setMobileTab('guess');
      });
    }

    // Alert Notifica Test Mobile
    if (els.mobileViewMicroscopeActionBtn) {
      els.mobileViewMicroscopeActionBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (els.mobileTestAlert) els.mobileTestAlert.classList.add('hidden');
        setMobileTab('microscope');
      });
    }
    if (els.mobileDismissAlertBtn) {
      els.mobileDismissAlertBtn.addEventListener('click', () => {
        if (els.mobileTestAlert) els.mobileTestAlert.classList.add('hidden');
      });
    }

    // Hub Quaderni Mobile
    if (els.closeMobNotebooksHubBtn) {
      els.closeMobNotebooksHubBtn.addEventListener('click', () => {
        window.labAudio.playClick();
        if (els.mobileNotebooksHub) els.mobileNotebooksHub.classList.add('hidden');
        setMobileTab('microscope');
      });
    }
    if (els.mobOpenNotepadCard) {
      els.mobOpenNotepadCard.addEventListener('click', () => {
        window.labAudio.playClick();
        if (els.mobileNotebooksHub) els.mobileNotebooksHub.classList.add('hidden');
        openNotepad();
      });
    }
    if (els.mobOpenAtlasCard) {
      els.mobOpenAtlasCard.addEventListener('click', () => {
        window.labAudio.playClick();
        if (els.mobileNotebooksHub) els.mobileNotebooksHub.classList.add('hidden');
        openAtlas();
      });
    }

    // Listener Ridimensionamento Finestra per Auto-Detection Dinamica
    window.addEventListener('resize', () => {
      if (state.deviceModePref === 'auto') {
        const eff = resolveEffectiveIsMobile();
        if (eff !== state.isMobileLayout) {
          applyDeviceMode(eff);
          updateDeviceModeUIElements();
        }
      }
    });
  }

  function showToast(msg, icon = '🔗') {
    if (!els.labToast) return;
    if (els.labToastMsg) els.labToastMsg.textContent = msg;
    const iconEl = els.labToast.querySelector('.toast-icon');
    if (iconEl) iconEl.textContent = icon;
    els.labToast.classList.remove('hidden');
    // Trigger reflow for CSS transition
    void els.labToast.offsetWidth;
    els.labToast.classList.add('visible');
    clearTimeout(els.labToast._timer);
    els.labToast._timer = setTimeout(() => {
      els.labToast.classList.remove('visible');
      setTimeout(() => els.labToast.classList.add('hidden'), 280);
    }, 3200);
  }

  async function shareLaboratory(includeScore = false) {
    let url = window.location.href;
    let title = 'BioGuessr Lab — Simulatore di Diagnostica Microbiologica';
    let text =
      'Mettiti alla prova come microbiologo! Riesci a identificare 100 specie batteriche misteriose usando microscopia a 1000×, colorazioni di Gram e prove biochimiche?';

    if (includeScore && state.roundEnded && state.currentBacterium) {
      if (state.roundWon) {
        text = `🏆 Ho identificato con successo ${state.currentBacterium.name} su BioGuessr Lab (+${state.potentialScore} pt)! Riesci a diagnosticarlo anche tu?`;
      } else {
        text = `☣️ Il ceppo misterioso di BioGuessr Lab mi ha messo in difficoltà (${state.currentBacterium.name}). Prova a battere la diagnosi!`;
      }
      try {
        const shareUrl = new URL(window.location.href);
        shareUrl.searchParams.set('sample', state.currentBacterium.id);
        url = shareUrl.toString();
      } catch (_) {}
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        showToast('Laboratorio condiviso con successo!', '✨');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('Link copiato negli appunti! Condividilo con chiunque.', '📋');
    } catch (_) {
      showToast(url, '🔗');
    }
  }

  function triggerChemicalTransitionAndStart() {
    if (state.gameStarted) return;
    state.gameStarted = true;

    // Suono reazione chimica, effervescenza ed espansione oculare
    if (window.labAudio && typeof window.labAudio.playTransitionSwoosh === 'function') {
      window.labAudio.playTransitionSwoosh();
    } else {
      window.labAudio.playBubbles();
    }

    // Genera bolle effervescenti nel container particellare
    if (els.chemBubblesContainer) {
      els.chemBubblesContainer.innerHTML = '';
      for (let i = 0; i < 26; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'chem-bubble-particle';
        const size = Math.floor(12 + Math.random() * 38);
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.floor(10 + Math.random() * 80) + '%';
        bubble.style.bottom = Math.floor(10 + Math.random() * 50) + '%';
        bubble.style.animationDelay = (Math.random() * 0.45) + 's';
        els.chemBubblesContainer.appendChild(bubble);
      }
    }

    // Attiva la tendina di reazione
    if (els.chemTransitionCurtain) {
      els.chemTransitionCurtain.classList.add('active');
    }

    // Dissolvenza e ingresso in laboratorio
    setTimeout(() => {
      if (els.startScreen) {
        els.startScreen.classList.add('fade-out');
      }
    }, 700);

    setTimeout(() => {
      if (els.startScreen) {
        els.startScreen.classList.add('hidden');
      }
      if (els.chemTransitionCurtain) {
        els.chemTransitionCurtain.classList.remove('active');
      }
      // Avvia suono ambiente cappa se abilitata
      updateEnvironmentControlsForView();
    }, 1450);
  }

  function refreshDropdownHighlight() {
    const items = els.suggestionsDropdown.querySelectorAll('.suggestion-item');
    items.forEach((el, idx) => {
      const active = idx === state.highlightedSuggestionIdx;
      el.classList.toggle('highlighted', active);
      if (active) el.scrollIntoView({ block: 'nearest' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
