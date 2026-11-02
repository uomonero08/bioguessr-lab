/**
 * BioGuessr - Database Microbiologico Scientifico (20 Specie + 20 Test Diagnostici)
 * Basato su letteratura standard di microbiologia clinica:
 * - Bergey's Manual of Systematic Bacteriology
 * - Murray, Rosenthal, Pfaller - Medical Microbiology
 * - Bailey & Scott's Diagnostic Microbiology
 */
(function () {
  const TESTS_CATALOG = [
    // ================= COLORAZIONI & MICROSCOPIA (4) =================
    {
      id: 'gram',
      category: 'stains',
      name: 'Colorazione di Gram',
      shortName: 'Gram (1000×)',
      cost: 60,
      icon: '🔬',
      subtitle: 'Parete cellulare, forma e disposizione',
      principle:
        'Distingue i batteri con spesso peptidoglicano (Gram+, viola cristallo di genziana) da quelli con membrana esterna lipopolisaccaridica (Gram-, rosa safranina), rivelando morfologia e aggregazione a 1000×.'
    },
    {
      id: 'ziehl',
      category: 'stains',
      name: 'Colorazione di Ziehl-Neelsen',
      shortName: 'Ziehl-Neelsen',
      cost: 75,
      icon: '🧪',
      subtitle: 'Alcol-acido resistenza (BAAR)',
      principle:
        'Usa carbolfucsina a caldo e decolorazione acido-alcolica: i micobatteri ricchi di acidi micolici trattengono il rosso fucsina brillante su sfondo blu di metilene.'
    },
    {
      id: 'spores',
      category: 'stains',
      name: 'Colorazione di Schaeffer-Fulton',
      shortName: 'Endospore',
      cost: 75,
      icon: '🟢',
      subtitle: 'Ricerca endospore batteriche',
      principle:
        'Il verde malachite a caldo penetra le endospore resistenti colorandole in verde smeraldo, mentre le cellule vegetative appaiono rosa-rosse con safranina.'
    },
    {
      id: 'capsule_motility',
      category: 'stains',
      name: 'Inchiostro di China & Goccia Pendente',
      shortName: 'Capsula & Mobilità',
      cost: 70,
      icon: '💧',
      subtitle: 'Alone capsulare e motilità a fresco',
      principle:
        'Colorazione negativa che evidenzia la capsula polisaccaridica come alone rifrangente chiaro su sfondo scuro e permette di osservare il movimento flagellare in vivo.'
    },

    // ================= TEST BIOCHIMICI ED ENZIMATICI (6) =================
    {
      id: 'peroxidase',
      category: 'biochem',
      name: 'Test Perossidasi / Catalasi (H₂O₂)',
      shortName: 'Perossidasi / H₂O₂',
      cost: 50,
      icon: '🫧',
      subtitle: 'Scissione enzimatica di H₂O₂ al 3%',
      principle:
        'Rileva gli enzimi emoproteici (catalasi/idroperossidasi) che decompongono il perossido di idrogeno con immediata effervescenza di bollicine di O₂. Separa Stafilococchi (+) da Streptococchi (-) e Bacillus (+) da Clostridium (-).'
    },
    {
      id: 'oxidase',
      category: 'biochem',
      name: 'Test Citocromo Ossidasi',
      shortName: 'Ossidasi',
      cost: 55,
      icon: '🟣',
      subtitle: 'Catena respiratoria (Citocromo c)',
      principle:
        'Il reattivo cromogeno di Kovacs (TMPD) viene ossidato in indofenolo viola scuro entro 10–15 secondi. Separa Pseudomonas, Vibrio, Neisseria ed Helicobacter (+) dagli Enterobacterales (-).'
    },
    {
      id: 'coagulase',
      category: 'biochem',
      name: 'Test della Coagulasi',
      shortName: 'Coagulasi',
      cost: 75,
      icon: '🩸',
      subtitle: 'Conversione fibrinogeno in fibrina',
      principle:
        'Incubazione con plasma citratato/EDTA: la coagulasi libera e legata forma un coagulo solido di fibrina. Test cardine per identificare Staphylococcus aureus rispetto agli stafilococchi coagulasi-negativi.'
    },
    {
      id: 'urease',
      category: 'biochem',
      name: 'Test dell’Ureasi (Christensen)',
      shortName: 'Ureasi',
      cost: 65,
      icon: '🩷',
      subtitle: 'Idrolisi dell’urea in ammoniaca',
      principle:
        'L’enzima ureasi scinde l’urea liberando NH₃, innalzando il pH e facendo virare il rosso fenolo dal giallo-ambra al fucsia intenso. Tipico di Helicobacter pylori, Proteus mirabilis e Klebsiella.'
    },
    {
      id: 'indole_oxygen',
      category: 'biochem',
      name: 'Test Indolo (Kovacs) & Tioglicolato O₂',
      shortName: 'Indolo & Ossigeno',
      cost: 65,
      icon: '🌡️',
      subtitle: 'Triptofanasi + esigenza respiratoria O₂',
      principle:
        'Rileva la produzione di indolo dal triptofano (anello rosso ciliegia superficiale) abbinata al profilo di crescita in gradiente di ossigeno (aerobio stretto, facoltativo, microaerofilo o anaerobio obbligato).'
    },
    {
      id: 'disks',
      category: 'biochem',
      name: 'Dischetti Diagnostici (Opt / Bac / Nov)',
      shortName: 'Dischetti P · A · NV',
      cost: 85,
      icon: '⚪',
      subtitle: 'Optochina (P), Bacitracina (A), Novobiocina (NV)',
      principle:
        'Saggio di inibizione tassonomica su agar: Optochina identifica S. pneumoniae, Bacitracina identifica S. pyogenes, Novobiocina conferma la sensibilità tipica di S. epidermidis/S. aureus.'
    },

    // ================= TERRENI SPECIFICI SELETTIVI & DIFFERENZIALI (10) =================
    {
      id: 'blood_agar',
      category: 'media',
      name: 'Agar Sangue (5% Montone)',
      shortName: 'Agar Sangue',
      cost: 80,
      icon: '🔴',
      subtitle: ' Terreno arricchito — Emolisi α, β, γ',
      principle:
        'Supporta la maggior parte dei patogeni (eccetto batteri strettamente dipendenti da NAD libero come H. influenzae) e differenzia la β-emolisi trasparente, l’α-emolisi verdastra e la γ-emolisi.'
    },
    {
      id: 'macconkey',
      category: 'media',
      name: 'Agar MacConkey',
      shortName: 'MacConkey',
      cost: 85,
      icon: '🌸',
      subtitle: 'Selettivo Gram- & Fermentazione Lattosio',
      principle:
        'Sali biliari e cristalvioletto inibiscono i Gram-positivi. Il rosso neutro colora in rosa-rosso acceso le colonie che fermentano il lattosio (E. coli, Klebsiella), lasciando incolori i non-fermentanti.'
    },
    {
      id: 'msa',
      category: 'media',
      name: 'Agar Sale Mannitolo (MSA 7.5% NaCl)',
      shortName: 'Agar MSA',
      cost: 90,
      icon: '🟡',
      subtitle: 'Selettivo Stafilococchi & Mannitolo',
      principle:
        'L’elevata salinità (7.5% NaCl) inibisce quasi tutti i batteri tranne gli Stafilococchi. La fermentazione del mannitolo acidifica il rosso fenolo virando l’agar al giallo oro (S. aureus).'
    },
    {
      id: 'emb',
      category: 'media',
      name: 'Agar EMB di Levine',
      shortName: 'Agar EMB',
      cost: 90,
      icon: '✨',
      subtitle: 'Selettivo Gram- & Riflesso Verde Metallico',
      principle:
        'Eosina Y e blu di metilene inibiscono i Gram+. La fermentazione acida vigorosa del lattosio precipita i coloranti producendo l’iconico riflesso verde metallico di Escherichia coli.'
    },
    {
      id: 'xld',
      category: 'media',
      name: 'Agar XLD (Enterici & H₂S)',
      shortName: 'Agar XLD',
      cost: 90,
      icon: '⚫',
      subtitle: 'Xilosio, Lisina e precipitati neri H₂S',
      principle:
        'Differenzia i patogeni enterici: Salmonella produce colonie rosse con centro nero (H₂S+), Shigella colonie rosse traslucide senza centro nero (H₂S-), i coliformi colonie gialle acidificanti.'
    },
    {
      id: 'chocolate',
      category: 'media',
      name: 'Agar Cioccolato Arricchito (Fattori X + V)',
      shortName: 'Agar Cioccolato',
      cost: 95,
      icon: '🍫',
      subtitle: 'Eritrociti lisati al calore (Emina + NAD)',
      principle:
        'La lisi termica dei globuli rossi libera sia il Fattore X (emina) sia il Fattore V (NAD), consentendo la crescita dei batteri esigenti come Haemophilus influenzae e Neisseria meningitidis.'
    },
    {
      id: 'tcbs',
      category: 'media',
      name: 'Agar TCBS (Selettivo Vibrioni)',
      shortName: 'Agar TCBS',
      cost: 95,
      icon: '🍋',
      subtitle: 'Tiosolfato-Citrato-Bile-Saccarosio (pH 8.6)',
      principle:
        'Terreno alcalino e salino altamente selettivo per Vibrio spp. La fermentazione del saccarosio da parte di Vibrio cholerae produce grandi colonie giallo oro su fondo verde-azzurro.'
    },
    {
      id: 'bile_esculin',
      category: 'media',
      name: 'Agar Bile-Esculina',
      shortName: 'Bile-Esculina',
      cost: 95,
      icon: '🖤',
      subtitle: 'Tolleranza alla bile 40% & idrolisi esculina',
      principle:
        'I batteri capaci di crescere in bile e idrolizzare l’esculina formano esculetina che reagisce con il citrato ferrico annerendo intensamente il terreno (tipico di Enterococcus faecalis e Listeria).'
    },
    {
      id: 'cetrimide',
      category: 'media',
      name: 'Agar Cetrimide',
      shortName: 'Agar Cetrimide',
      cost: 95,
      icon: '🧪',
      subtitle: 'Selettivo per Pseudomonas & Piocianina',
      principle:
        'La cetrimide (detergente d’ammonio quaternario) inibisce la flora accompagnante ed esalta la sintesi dei pigmenti idrosolubili blu-verdi (piocianina e pioverdina fluorescente) di P. aeruginosa.'
    },
    {
      id: 'lowenstein',
      category: 'media',
      name: 'Terreno di Löwenstein-Jensen',
      shortName: 'Löwenstein-Jensen',
      cost: 95,
      icon: '🌿',
      subtitle: 'Terreno all’uovo + Verde Malachite',
      principle:
        'Ricco di lipidi d’uovo coagulato e glicerolo con verde malachite per inibire i contaminanti rapidi; specifico per l’isolamento lento di Mycobacterium tuberculosis (colonie rugose a cavolfiore).'
    }
  ];

  // ================= 20 SPECIE BATTERICHE PIÙ COMUNI E RILEVANTI =================
  const BACTERIA_DB = [
  {
    "id": "staphylococcus_aureus",
    "name": "Staphylococcus aureus",
    "genus": "Staphylococcus",
    "species": "aureus",
    "aliases": [
      "stafilococco aureo",
      "s. aureus",
      "mrsa",
      "aureus"
    ],
    "taxonomyGroup": "Cocco Gram-positivo Catalasi-positivo (Staphylococcaceae)",
    "primaryPlate": {
      "colonyColor": "#f3c352",
      "colonyHighlight": "#fff3c4",
      "colonyRadius": 4.3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie circolari medie (2–3 mm), convesse, lisce, butirrose, opache con caratteristica sfumatura crema-dorata."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram-positivi (viola) sferici disposti in ammassi irregolari \"a grappolo d’uva\".",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": true,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#f4c95d",
        "note": "Colonie dorate circondate da netto alone chiaro di β-emolisi completa."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": true,
        "mannitol": true,
        "note": "Crescita rigogliosa con viraggio del terreno al GIALLO ORO brillante (Mannitolo +)."
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#f2c45a",
        "note": "Buona crescita di colonie lisce giallo-crema."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Commensale di cute e mucose nasali ma importante patogeno opportunista umano; causa infezioni cutanee, ascessi, endocarditi, polmoniti, osteomieliti e intossicazioni alimentari.",
      "goldStandard": "Gram (cocchi Gram+ a grappolo) → Perossidasi/Catalasi (+) → Coagulasi (+) e Agar Sale Mannitolo MSA con viraggio giallo oro + β-emolisi su Agar Sangue.",
      "literature": [
        {
          "title": "Bergey’s Manual of Systematic Bacteriology: Volume 3: The Firmicutes",
          "citation": "De Vos P. et al., Springer-Verlag, 2009.",
          "source": "Bergey’s Trust",
          "keyFinding": "Caratterizzazione tassonomica cardine di S. aureus: coagulasi positiva, fermentazione mannitolo su MSA e differenziazione filogenetica dai CoNS."
        },
        {
          "title": "CDC Methicillin-Resistant Staphylococcus aureus (MRSA)",
          "citation": "CDC Public Health Surveillance Guidelines, MMWR, 2023.",
          "source": "CDC PHIL",
          "keyFinding": "Epidemiologia dei ceppi ospedalieri e comunitari; resistenza alla meticillina codificata dal gene mecA."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Staphylococcaceae",
      "genus": "Staphylococcus",
      "species": "Staphylococcus aureus"
    }
  },
  {
    "id": "staphylococcus_epidermidis",
    "name": "Staphylococcus epidermidis",
    "genus": "Staphylococcus",
    "species": "epidermidis",
    "aliases": [
      "stafilococco epidermidis",
      "s. epidermidis",
      "cons"
    ],
    "taxonomyGroup": "Cocco Gram-positivo Coagulasi-negativo (CoNS)",
    "primaryPlate": {
      "colonyColor": "#f1f5f9",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole-medie (1–2 mm), circolari, convesse, lucide, colore bianco porcellana privo di pigmento giallo."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram-positivi (viola) sferici aggregati in grappoli irregolari e tetradi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Colonie bianco porcellana senza alone emolitico (γ-emolisi)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": true,
        "mannitol": false,
        "note": "Crescita di piccole colonie bianco-rosate; il terreno resta ROSSO-ROSA (Mannitolo -)."
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#f1f5f9",
        "note": "Crescita regolare di colonie bianche non pigmentate."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Principale componente del microbiota cutaneo umano; forma biofilm tenaci su cateteri intravascolari, valvole protesiche e protesi articolari.",
      "goldStandard": "Gram (cocchi Gram+ a grappolo) → Perossidasi/Catalasi (+) → Coagulasi (-), γ-emolisi su Agar Sangue, crescita su MSA senza fermentazione del mannitolo (terreno rosa) e Novobiocina Sensibile.",
      "literature": [
        {
          "title": "Staphylococcus epidermidis — the 'accidental' pathogen",
          "citation": "Otto M. Nature Reviews Microbiology 7:555–567, 2009.",
          "source": "Nature Rev Microbiol",
          "keyFinding": "Fattori di virulenza biofilm-associati (polisaccaride intercellulare PIA) nelle infezioni da catetere e protesi."
        },
        {
          "title": "Manual of Clinical Microbiology, 12th Edition",
          "citation": "Carroll KC et al., ASM Press, 2019.",
          "source": "ASM Press",
          "keyFinding": "Identificazione biochimica di routine: CoNS novobiocina-sensibile, mancata fermentazione del mannitolo su MSA."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Staphylococcaceae",
      "genus": "Staphylococcus",
      "species": "Staphylococcus epidermidis"
    }
  },
  {
    "id": "streptococcus_pyogenes",
    "name": "Streptococcus pyogenes",
    "genus": "Streptococcus",
    "species": "pyogenes",
    "aliases": [
      "streptococco beta emolitico gruppo a",
      "s. pyogenes",
      "gas",
      "streptococco piogene"
    ],
    "taxonomyGroup": "Streptococco β-emolitico di Gruppo A (Lancefield)",
    "primaryPlate": {
      "colonyColor": "#dce4ee",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.3,
      "texture": "pinpoint",
      "agarTint": null,
      "macroSummary": "Colonie puntiformi molto piccole (0.5–1 mm), circolari, traslucide/grigiastre a cupola con margine regolare."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram-positivi (viola) disposti in lunghe catenelle flessuose.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "S",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "wideHalo": true,
        "colonyColor": "#e2e8f0",
        "note": "Colonie puntiformi circondate da un AMPIO e nitido alone di β-emolisi completa (streptolisina O/S)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita di minute colonie grigio-traslucide."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Agente eziologico di faringotonsillite streptococcica, scarlattina, impetigine, erisipela, fascite necrotizzante e sequele post-infettive (febbre reumatica, glomerulonefrite).",
      "goldStandard": "Gram (cocchi Gram+ a catenella) → Perossidasi/Catalasi (-) → Ampia β-emolisi su Agar Sangue → Sensibilità specifica alla Bacitracina (dischetto A).",
      "literature": [
        {
          "title": "Group A Streptococcal Infections: Pathophysiology and Clinical Management",
          "citation": "Stevens DL, Bryant AE. N Engl J Med 383:2559, 2020.",
          "source": "NEJM",
          "keyFinding": "Patogenesi della fascite necrotizzante e discriminazione mediante suscettibilità alla Bacitracina (dischetto A)."
        },
        {
          "title": "Bergey’s Manual of Systematic Bacteriology: The Firmicutes",
          "citation": "Whitman WB et al., Springer, 2009.",
          "source": "Bergey’s Trust",
          "keyFinding": "Inquadramento del gruppo sierologico A di Lancefield con ampia beta-emolisi completa."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus pyogenes"
    }
  },
  {
    "id": "streptococcus_pneumoniae",
    "name": "Streptococcus pneumoniae",
    "genus": "Streptococcus",
    "species": "pneumoniae",
    "aliases": [
      "pneumococco",
      "s. pneumoniae",
      "diplococco"
    ],
    "taxonomyGroup": "Diplococco Gram-positivo α-emolitico capsulato",
    "primaryPlate": {
      "colonyColor": "#cfd8e3",
      "colonyHighlight": "#f8fafc",
      "colonyRadius": 2.8,
      "texture": "umbilicate",
      "agarTint": null,
      "macroSummary": "Colonie piccole, umide e traslucide con caratteristica depressione centrale ombelicata (\"a pedina di dama\" per autolisi)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "diplococci_lancet",
      "arrangement": "pairs",
      "gramSummary": "Diplococchi Gram-positivi (viola) di forma ovalare/lanceolata (\"a fiamma di candela\") appaiati.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "S",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "alpha",
        "colonyColor": "#cbd5e1",
        "note": "Colonie ombelicate circondate da alone verdastro di α-emolisi parziale."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#b8c4b8",
        "note": "Crescita rigogliosa con leggero viraggio verdastro-oliva attorno alle colonie."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Principale causa batterica di polmonite acquisita in comunità (CAP), otite media acuta, sinusite e meningite purulenta nell’adulto.",
      "goldStandard": "Gram (diplococchi Gram+ lanceolati) + Capsula (+) all’Inchiostro di China → Perossidasi/Catalasi (-) → α-emolisi verde su Agar Sangue → Sensibilità all’Optochina (dischetto P).",
      "literature": [
        {
          "title": "Mechanisms of Pneumococcal Colonization and Disease",
          "citation": "Weiser JN et al. Nat Rev Microbiol 16:355, 2018.",
          "source": "Nature",
          "keyFinding": "Ruolo della capsula polisaccaridica; lisi da deossicolato (solubilità in bile) e sensibilità all’Optochina (≥14 mm)."
        },
        {
          "title": "Clinical Microbiology Reviews: Pneumococcal Diagnostics",
          "citation": "Musher DM. Clin Microbiol Rev 27:412, 2014.",
          "source": "ASM CMR",
          "keyFinding": "Morfologia delle colonie ombelicate per autolisina LytA e reazione di Neufeld (Quellung)."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus pneumoniae"
    }
  },
  {
    "id": "enterococcus_faecalis",
    "name": "Enterococcus faecalis",
    "genus": "Enterococcus",
    "species": "faecalis",
    "aliases": [
      "enterococco",
      "e. faecalis",
      "streptococco gruppo d"
    ],
    "taxonomyGroup": "Cocco Gram-positivo enterico tollerante alla bile (Enterococcaceae)",
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole-medie (1–2 mm), circolari, lisce, convesse, di colore bianco-grigiastro burroso."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "pairs",
      "gramSummary": "Cocchi Gram-positivi (viola) leggermente ovoidali disposti in coppie e corte catenelle.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Colonie grigio-bianche lisce tipicamente non emolitiche (γ-emolisi)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#e2e8f0",
        "note": "Buona crescita di colonie grigio-crema."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": true,
        "note": "POSITIVO NETTO: crescita rigogliosa con intenso ANNERIMENTO NERO diffuso del terreno (idrolisi esculina in bile 40%)."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Commensale del tratto gastrointestinale umano; importante agente di infezioni nosocomiali delle vie urinarie, batteriemie, endocarditi e infezioni addominali.",
      "goldStandard": "Gram (cocchi Gram+ in coppie/corte catene) → Perossidasi/Catalasi (-) → γ-emolisi su Agar Sangue → Agar Bile-Esculina fortemente POSITIVO (nero) e resistenza a Optochina/Bacitracina.",
      "literature": [
        {
          "title": "Enterococcal Infection-Treatment and Antibiotic Resistance",
          "citation": "Guzman Prieto AM et al. Clin Microbiol Infect 22:11, 2016.",
          "source": "ESCMID CMI",
          "keyFinding": "Idrolisi dell’esculina in presenza di bile al 40%, tolleranza al 6.5% NaCl e test PYR positivo."
        },
        {
          "title": "Bergey’s Manual of Systematic Bacteriology",
          "citation": "Ludwig W et al., Springer, 2009.",
          "source": "Bergey’s Trust",
          "keyFinding": "Divergenza filogenetica del genere Enterococcus da Streptococcus (Lancefield gruppo D)."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Enterococcaceae",
      "genus": "Enterococcus",
      "species": "Enterococcus faecalis"
    }
  },
  {
    "id": "bacillus_cereus",
    "name": "Bacillus cereus",
    "genus": "Bacillus",
    "species": "cereus",
    "aliases": [
      "b. cereus",
      "bacillo cereo",
      "bacillus"
    ],
    "taxonomyGroup": "Grande Bacillo Gram-positivo sporigeno aerobio/facoltativo",
    "primaryPlate": {
      "colonyColor": "#dfd9c8",
      "colonyHighlight": "#f5f2eb",
      "colonyRadius": 6.2,
      "texture": "frosted",
      "agarTint": null,
      "macroSummary": "Colonie grandi (4–6 mm), piatte, opache, aspetto granulare \"a vetro smerigliato / cera fusa\" con margini ondulati."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "large_rods",
      "arrangement": "chains_rods",
      "gramSummary": "Grandi bacilli Gram-positivi (viola) ad estremità squadrate, spesso disposti in catene.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "central"
      },
      "capsule": false,
      "motility": "peritrichous"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "wideHalo": true,
        "colonyColor": "#d6d3c4",
        "note": "Colonie grandi irregolari grigio-verdastre circondate da marcata β-emolisi (distingue da B. anthracis γ-emolitico)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#dcd7c9",
        "note": "Crescita estesa di colonie piatte opache."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Batterio ambientale ubiquitario sporigeno responsabile di tossinfezioni alimentari (forma emetica rapida legata al riso cotto conservato male e forma diarroica) e infezioni oculari.",
      "goldStandard": "Gram (grandi bacilli Gram+ a estremità squadrate) → Schaeffer-Fulton Endospore (+) centrali → Perossidasi/Catalasi (+), Mobile (+) e forte β-emolisi su Agar Sangue.",
      "literature": [
        {
          "title": "Bacillus cereus, a Volatile Human Pathogen",
          "citation": "Stenfors Arnesen LP et al. Clin Microbiol Rev 21:346, 2008.",
          "source": "ASM CMR",
          "keyFinding": "Differenziazione tra sindrome emetica (cereulide) e diarroica; motilità e beta-emolisi marcata."
        },
        {
          "title": "FDA Bacteriological Analytical Manual (BAM): Bacillus cereus",
          "citation": "Tallent SM et al., FDA USA, Chapter 14, 2021.",
          "source": "FDA BAM",
          "keyFinding": "Isolamento colturale su agar MYP e colorazione delle endospore con Schaeffer-Fulton."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Bacillaceae",
      "genus": "Bacillus",
      "species": "Bacillus cereus"
    }
  },
  {
    "id": "clostridium_difficile",
    "name": "Clostridium difficile",
    "genus": "Clostridium",
    "species": "difficile",
    "aliases": [
      "clostridioides difficile",
      "c. difficile",
      "clostridio"
    ],
    "taxonomyGroup": "Bacillo Gram-positivo sporigeno anaerobio obbligato",
    "primaryPlate": {
      "colonyColor": "#dad7cd",
      "colonyHighlight": "#f3f1ea",
      "colonyRadius": 4.8,
      "texture": "frosted",
      "agarTint": null,
      "macroSummary": "Colonie circolari-irregolari (3–5 mm) su piastra priva di O₂, piatte, grigio-giallastre opache con aspetto a vetro smerigliato."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "large_rods",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-positivi (viola) dritti e allungati, singoli o in piccole coppie.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "subterminal"
      },
      "capsule": false,
      "motility": "peritrichous"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#d9d6c7",
        "note": "Crescita solo in anaerobiosi: colonie grigio-opache a vetro smerigliato non emolitiche (γ-emolisi)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": false,
        "note": "Nessuna crescita in incubatore aerobio/5% CO₂ (letale per gli anaerobi obbligati)."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Principale causa di diarrea associata ad antibiotici e colite pseudomembranosa nosocomiale mediata dalle tossine A (enterotossina) e B (citotossina).",
      "goldStandard": "Gram (bacilli Gram+) → Endospore subterminali (+) → Perossidasi/Catalasi (-) e crescita esclusivamente nel fondo anaerobio del tubo al Tioglicolato (Anaerobio obbligato).",
      "literature": [
        {
          "title": "Clostridioides difficile Infection",
          "citation": "Leffler DA, Lamont JT. N Engl J Med 372:1539, 2015.",
          "source": "NEJM",
          "keyFinding": "Colite pseudomembranosa mediata da tossina A (enterotossina) e tossina B (citotossina); endospore subterminali resistenti."
        },
        {
          "title": "Clinical Practice Guidelines for Clostridium difficile Infection",
          "citation": "McDonald LC et al. Clin Infect Dis 66:e1, 2018.",
          "source": "IDSA",
          "keyFinding": "Algoritmo diagnostico in due fasi: GDH + test molecolare NAAT o dosaggio immunoenzimatico delle tossine."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Clostridia",
      "order": "Eubacteriales",
      "family": "Clostridiaceae",
      "genus": "Clostridium",
      "species": "Clostridium difficile"
    }
  },
  {
    "id": "listeria_monocytogenes",
    "name": "Listeria monocytogenes",
    "genus": "Listeria",
    "species": "monocytogenes",
    "aliases": [
      "listeria",
      "l. monocytogenes"
    ],
    "taxonomyGroup": "Piccolo Bacillo Gram-positivo non sporigeno psicrotrofo",
    "primaryPlate": {
      "colonyColor": "#dbe4ee",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.9,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole (1–2 mm), circolari, lisce, convesse, traslucide con tenue riflesso grigio-azzurrognolo."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "coccobacilli",
      "arrangement": "single",
      "gramSummary": "Piccoli bacilli regolari / coccobacilli Gram-positivi (viola) singoli o disposti a V / palizzata.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "tumbling"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "narrowHalo": true,
        "colonyColor": "#e2e8f0",
        "note": "Colonie piccole con caratteristico ALONE STRETTO di β-emolisi appena oltre il bordo della colonia."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#e2e8f0",
        "note": "Buona crescita di piccole colonie grigio-traslucide."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": true,
        "note": "POSITIVO: crescita con netto annerimento nero del terreno per idrolisi dell’esculina."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Patogeno intracellulare facoltativo a trasmissione alimentare (formaggi molli, salumi, cibi refrigerati); pericoloso in gravidanza, neonati e immunodepressi (sepsi, meningite).",
      "goldStandard": "Gram (piccoli coccobacilli Gram+) → Endospore (-) + Perossidasi/Catalasi (+) → Caratteristica mobilità \"a capriola\" (tumbling), stretta β-emolisi su Agar Sangue e Bile-Esculina (+).",
      "literature": [
        {
          "title": "The Cell Biology of Listeria monocytogenes Infection",
          "citation": "Cossart P. Annu Rev Pathol 6:155, 2011.",
          "source": "Ann Rev",
          "keyFinding": "Motilità intracellulare actino-mediata (ActA) ed evasione dal fagosoma via listeriolisina O."
        },
        {
          "title": "CDC Listeria (Listeriosis) Clinical Guidance",
          "citation": "CDC Surveillance Reports, 2022.",
          "source": "CDC PHIL",
          "keyFinding": "Motilità a capriola a 20-25°C, idrolisi dell’esculina e test di CAMP positivo con S. aureus."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Listeriaceae",
      "genus": "Listeria",
      "species": "Listeria monocytogenes"
    }
  },
  {
    "id": "mycobacterium_tuberculosis",
    "name": "Mycobacterium tuberculosis",
    "genus": "Mycobacterium",
    "species": "tuberculosis",
    "aliases": [
      "bacillo di koch",
      "m. tuberculosis",
      "tubercolosi",
      "tbc",
      "micobatterio"
    ],
    "taxonomyGroup": "Bacillo Alcol-Acido Resistente (BAAR - Mycobacteriaceae)",
    "primaryPlate": {
      "colonyColor": "#e5d4b1",
      "colonyHighlight": "#f7eed9",
      "colonyRadius": 4.5,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie a crescita lenta, secche, friabili, verrucose/rugose con caratteristico aspetto \"a cavolfiore o briciole di pane\" color crema-camozza."
    },
    "microscopy": {
      "gram": "poor",
      "shape": "rods",
      "arrangement": "cords",
      "gramSummary": "Colorazione di Gram molto debole / \"fantasma\" (parete cerosa ricca di acidi micolici impermeabile ai coloranti acquosi): bacilli sottili disposti a fasci (\"fattore cordale\").",
      "acidFast": true,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "note": "Nessuna crescita visibile nell’incubazione standard su Agar Sangue."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": false,
        "note": "Nessuna crescita standard: richiede terreni specifici all’uovo o Middlebrook."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": true,
        "note": "POSITIVO PATOGNOMONICO: colonie eugoniche secche, rugose \"a cavolfiore\" color crema su sfondo verde malachite!"
      }
    },
    "clinical": {
      "overview": "Agente eziologico della tubercolosi umana (Bacillo di Koch), trasmesso per via aerogena con formazione di granulomi caseosi polmonari ed extrapolmonari.",
      "goldStandard": "Colorazione di Ziehl-Neelsen POSITIVA (bacilli rosso fucsina brillante su fondo blu, fattore cordale) + Aerobio stretto + crescita caratteristica su terreno di Löwenstein-Jensen.",
      "literature": [
        {
          "title": "WHO Global Tuberculosis Report 2023",
          "citation": "World Health Organization, Geneva, 2023.",
          "source": "WHO",
          "keyFinding": "Patogenesi della tubercolosi cavitaria e miliare; alcol-acido resistenza da acidi micolici parietali."
        },
        {
          "title": "Diagnosis of Tuberculosis by Sputum Microscopy",
          "citation": "Rieder HL et al. IUATLD, 2018.",
          "source": "IUATLD",
          "keyFinding": "Sensibilità e specificità della microscopia a fluorescenza con auramina e colorazione di Ziehl-Neelsen."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Mycobacteriaceae",
      "genus": "Mycobacterium",
      "species": "Mycobacterium tuberculosis"
    }
  },
  {
    "id": "neisseria_meningitidis",
    "name": "Neisseria meningitidis",
    "genus": "Neisseria",
    "species": "meningitidis",
    "aliases": [
      "meningococco",
      "n. meningitidis",
      "neisseria"
    ],
    "taxonomyGroup": "Diplococco Gram-negativo Ossidasi-positivo (Neisseriaceae)",
    "primaryPlate": {
      "colonyColor": "#d5dde8",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.1,
      "texture": "mucoid",
      "agarTint": null,
      "macroSummary": "Colonie piccole-medie (1–2 mm), rotonde, convesse, lisce, umide/mucoidi e semitrasparenti grigio-bluastre."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "diplococci_bean",
      "arrangement": "pairs",
      "gramSummary": "Diplococchi Gram-negativi (rosa-rosso) appaiati con facce adiacenti appiattite \"a chicco di caffè\".",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Colonie grigio-traslucide lisce e umide senza emolisi (γ-emolisi)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#dce4ef",
        "note": "Crescita rigogliosa ottimale su Agar Cioccolato in 5% CO₂ (colonie lucide mucoidi)."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Ospite del rinofaringe umano capace di causare meningite cerebrospinale epidemica fulminante e sepsi meningococcica con porpora petecchiale.",
      "goldStandard": "Gram (diplococchi Gram- \"a chicco di caffè\") → Citocromo Ossidasi (+) e Catalasi (+) → Capsula (+), immobile, crescita sia su Agar Cioccolato sia su Agar Sangue (a differenza di H. influenzae).",
      "literature": [
        {
          "title": "Meningococcal Disease: Clinical Manifestations",
          "citation": "Stephens DS et al. Lancet 369:2196, 2007.",
          "source": "The Lancet",
          "keyFinding": "Porpora fulminante e sindrome di Waterhouse-Friderichsen mediata da massiva endotossiemia da LOS."
        },
        {
          "title": "Manual of Clinical Microbiology: Neisseria",
          "citation": "Elias J et al. ASM Press, 2019.",
          "source": "ASM Press",
          "keyFinding": "Diplococchi a chicco di caffè; ossidasi positivo, ossida maltosio e glucosio (differenzia da N. gonorrhoeae)."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Neisseriales",
      "family": "Neisseriaceae",
      "genus": "Neisseria",
      "species": "Neisseria meningitidis"
    }
  },
  {
    "id": "haemophilus_influenzae",
    "name": "Haemophilus influenzae",
    "genus": "Haemophilus",
    "species": "influenzae",
    "aliases": [
      "emofilo",
      "h. influenzae",
      "bacillo di pfeiffer",
      "hib"
    ],
    "taxonomyGroup": "Coccobacillo Gram-negativo esigente (Pasteurellaceae)",
    "primaryPlate": {
      "colonyColor": "#d8e2eb",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "pinpoint",
      "agarTint": null,
      "macroSummary": "Colonie piccole (1 mm), convesse, lisce, grigiastre-traslucide simili a minute \"gocce di rugiada\"."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "single",
      "gramSummary": "Piccoli coccobacilli Gram-negativi (rosa) pleomorfi, singoli o in brevi filamenti.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "note": "NESSUNA CRESCITA su Agar Sangue integro: gli eritrociti non lisati non rilasciano il Fattore V (NAD) libero!"
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#dbe5ef",
        "note": "CRESCITA RIGOGLIOSA DIAGNOSTICA: presenza simultanea di Fattore X (emina) e Fattore V (NAD) liberati dal sangue cotto!"
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Colonizzatore delle alte vie respiratorie; i ceppi capsulati (tipo b) causano meningite pediatrica ed epiglottite, i ceppi non capsulati otiti, sinusiti e riacutizzazioni di BPCO.",
      "goldStandard": "Gram (coccobacilli Gram- pleomorfi) → ASSENZA di crescita su Agar Sangue e MacConkey ma CRESCITA RIGOGLIOSA su Agar Cioccolato (dipendenza da Fattori X + V).",
      "literature": [
        {
          "title": "Haemophilus influenzae: Pathogenicity and Prevention",
          "citation": "Tristram S et al. Clin Microbiol Rev 20:368, 2007.",
          "source": "ASM CMR",
          "keyFinding": "Fattori X (emina) e V (NAD) essenziali per la crescita; satellitismo attorno a S. aureus; capsula PRP sierotipo b."
        },
        {
          "title": "CDC Laboratory Methods for Meningitis Diagnosis",
          "citation": "CDC Meningitis Guidelines, 2020.",
          "source": "CDC PHIL",
          "keyFinding": "Coccobacilli pleomorfi Gram-negativi liquorali; crescita rigogliosa su agar cioccolato in 5% CO2."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pasteurellales",
      "family": "Pasteurellaceae",
      "genus": "Haemophilus",
      "species": "Haemophilus influenzae"
    }
  },
  {
    "id": "escherichia_coli",
    "name": "Escherichia coli",
    "genus": "Escherichia",
    "species": "coli",
    "aliases": [
      "e. coli",
      "coli",
      "colibacillo"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo enterico fermentante il lattosio (Enterobacteriaceae)",
    "primaryPlate": {
      "colonyColor": "#e6e4dc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4.4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie medie (2–3 mm), circolari, lisce, lievemente convesse, umide, bianco-grigiastre traslucide."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa-rosso) corti e regolari ad estremità arrotondate, disposti singolarmente.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Colonie grigio-bianche umide rigogliose (alcuni ceppi uropatogeni mostrano debole emolisi, classicamente γ)."
      },
      "macconkey": {
        "growth": true,
        "lactose": "strong",
        "note": "Colonie ROSA-ROSSO ACCESO asciutte con alone torbido di precipitazione dei sali biliari (Lattosio ++)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": true,
        "colonyColor": "#1a4d2e",
        "note": "PATOGNOMONICO: colonie scure con brillante RIFLESSO VERDE METALLICO!"
      },
      "xld": {
        "growth": true,
        "xldType": "yellow",
        "h2s": false,
        "note": "Colonie gialle opache per forte fermentazione acida degli zuccheri; H₂S assente."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#e5e7eb",
        "note": "Crescita abbondante non selettiva."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Tollera la bile ma NON annerisce il terreno (Esculina -)."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Organismo modello della biologia e commensale intestinale; causa oltre l’80% delle infezioni delle vie urinarie (IVU), sepsi neonatali e gastroenteriti (ceppi ETEC, EHEC O157:H7, EPEC).",
      "goldStandard": "Gram (bacilli Gram-) → Ossidasi (-) → MacConkey Rosa acceso (Lattosio +) → Agar EMB con riflesso verde metallico brillante + Test Indolo POSITIVO (+).",
      "literature": [
        {
          "title": "Pathogenic Escherichia coli",
          "citation": "Croxen MA et al. Clin Microbiol Rev 26:822, 2013.",
          "source": "ASM CMR",
          "keyFinding": "Classificazione dei patotipi (UPEC, EHEC/STEC, ETEC); riflesso verde metallico distintivo su agar EMB."
        },
        {
          "title": "Bergey’s Manual of Systematic Bacteriology: The Proteobacteria",
          "citation": "Brenner DJ et al., Springer, 2005.",
          "source": "Bergey’s Trust",
          "keyFinding": "Profilo biochimico IMViC classico (++--): Indolo +, Rosso Metile +, Voges-Proskauer -, Citrato -."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Escherichia",
      "species": "Escherichia coli"
    }
  },
  {
    "id": "klebsiella_pneumoniae",
    "name": "Klebsiella pneumoniae",
    "genus": "Klebsiella",
    "species": "pneumoniae",
    "aliases": [
      "klebsiella",
      "k. pneumoniae",
      "bacillo di friedlander"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo enterico capsulato immobile (Enterobacteriaceae)",
    "primaryPlate": {
      "colonyColor": "#ece9e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 5.8,
      "texture": "mucoid",
      "agarTint": null,
      "macroSummary": "Colonie grandi (3–5 mm), molto rilevate a cupola, estremamente LUCIDE, VISCOSE e MUCOIDI (tendenza a confluire)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa) tozzi e diritti, singoli o in coppie, circondati da spazio chiaro.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e5e7eb",
        "note": "Grandi colonie grigio-bianche lucide e mucoidi senza emolisi (γ-emolisi)."
      },
      "macconkey": {
        "growth": true,
        "lactose": "mucoid_pink",
        "note": "Grandi colonie ROSA MUCOIDI lucide e viscose (Lattosio +)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": false,
        "colonyColor": "#c06c9b",
        "note": "Grandi colonie rosa-violacee mucoidi (\"a occhio di pesce\") SENZA riflesso verde metallico."
      },
      "xld": {
        "growth": true,
        "xldType": "yellow",
        "h2s": false,
        "note": "Colonie gialle grandi e mucoidi (fermentazione zuccheri +, H₂S -)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#ebeef2",
        "note": "Crescita abbondante mucoide."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Crescita mucoide su bile senza il quadro tipico degli enterococchi."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Importante patogeno ospedaliero (spesso produttore di carbapenemasi KPC/ESBL); causa polmoniti lobari necrotizzanti, infezioni urinarie da catetere e sepsi.",
      "goldStandard": "Gram (bacilli Gram-) + Enorme Capsula (+) e Immobile (-) → MacConkey grandi colonie rosa mucoidi (Lattosio +) → Indolo (-), Ureasi (+) e assenza di riflesso verde metallico su EMB.",
      "literature": [
        {
          "title": "Hypervirulent and Multidrug-Resistant Klebsiella pneumoniae",
          "citation": "Russo TA, Marr CM. Clin Microbiol Rev 32:e00001, 2019.",
          "source": "ASM CMR",
          "keyFinding": "Capsula mucoide prominente; carbapenemasi KPC e metallo-beta-lattamasi NDM."
        },
        {
          "title": "Clinical Microbiology Procedures Handbook, 4th Edition",
          "citation": "Leber AL, ASM Press, 2016.",
          "source": "ASM Press",
          "keyFinding": "Colonie rosa mucoidi su MacConkey, immobilità, ureasi positiva lenta e indolo negativo."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Klebsiella",
      "species": "Klebsiella pneumoniae"
    }
  },
  {
    "id": "salmonella_enterica",
    "name": "Salmonella enterica",
    "genus": "Salmonella",
    "species": "enterica",
    "aliases": [
      "salmonella",
      "s. enterica",
      "salmonella typhi",
      "salmonella typhimurium"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo enterico Lattosio-negativo H₂S+ (Enterobacteriaceae)",
    "primaryPlate": {
      "colonyColor": "#e4e6e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4.1,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie medie (2–3 mm), circolari, lisce, a margine intero, grigio-biancastre semitraslucide."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa) regolari singoli, indistinguibili al solo Gram dagli altri enterobatteri.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Colonie grigio-bianche umide non emolitiche (γ-emolisi)."
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie INCOLORI / traslucide giallognole (Lattosio NEGATIVO)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": false,
        "colonyColor": "#d6ccc2",
        "note": "Colonie incolori/trasparenti ambrate (non fermenta il lattosio)."
      },
      "xld": {
        "growth": true,
        "xldType": "red_black",
        "h2s": true,
        "note": "DIAGNOSTICO: colonie rosse con netto CENTRO NERO brillante per produzione di H₂S!"
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#e5e7eb",
        "note": "Crescita regolare."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Tollera i sali biliari senza annerimento da esculina."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Patogeno enterico zoonotico e umano trasmesso da uova, pollame o acqua contaminata; causa salmonellosi gastroenteriche e febbre tifoide (sierotipo Typhi).",
      "goldStandard": "Gram (bacilli Gram-) → Ossidasi (-) → MacConkey incolore (Lattosio -) → Mobile (+) → Agar XLD colonie rosse con CENTRO NERO (H₂S +) e Ureasi (-) (che la distingue da Proteus).",
      "literature": [
        {
          "title": "Salmonella enterica Infections: Pathogenesis",
          "citation": "Gal-Mor O et al. Pathogens 3:866, 2014.",
          "source": "Pathogens",
          "keyFinding": "Invasione enterocitaria via isole di patogenicità SPI-1 e SPI-2; febbre enterica e gastroenterite."
        },
        {
          "title": "Ewing’s Identification of Enterobacteriaceae",
          "citation": "Farmer JJ, ASM Press, 2015.",
          "source": "ASM Press",
          "keyFinding": "Colonie rosse con centro nero su XLD (decarbossilazione lisina e H2S); motilità positiva."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Salmonella",
      "species": "Salmonella enterica"
    }
  },
  {
    "id": "shigella_flexneri",
    "name": "Shigella flexneri",
    "genus": "Shigella",
    "species": "flexneri",
    "aliases": [
      "shigella",
      "s. flexneri",
      "shigella dysenteriae",
      "shigella sonnei",
      "dissenteria"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo enterico immobile Lattosio-negativo H₂S-",
    "primaryPlate": {
      "colonyColor": "#e1e5ea",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.6,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie circolari piccole-medie (1.5–2 mm), convesse, lisce, traslucide grigio-biancastre."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Bacilli corti Gram-negativi (rosa) singoli non sporigeni.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Colonie grigio-bianche lisce non emolitiche (γ-emolisi)."
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie INCOLORI traslucide (Lattosio NEGATIVO)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": false,
        "colonyColor": "#d8cfc6",
        "note": "Colonie incolori trasparenti (Lattosio -)."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "DIAGNOSTICO: colonie rosse/rosa delicate SENZA centro nero (Xilosio -, Lattosio -, H₂S NEGATIVO)!"
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#e5e7eb",
        "note": "Crescita regolare."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Crescita in presenza di bile senza annerimento."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Agente della dissenteria bacillare umana (shigellosi) a bassissima carica infettante; invade la mucosa colica causando diarrea muco-sanguinolenta.",
      "goldStandard": "Gram (bacilli Gram-) → Ossidasi (-) → MacConkey incolore (Lattosio -) → IMMOBILE (-) alla goccia pendente e Agar XLD colonie rosse SENZA centro nero (H₂S -, Ureasi -).",
      "literature": [
        {
          "title": "Pathogenesis of Shigella flexneri",
          "citation": "Schroeder GN, Hilbi H. Clin Microbiol Rev 21:134, 2008.",
          "source": "ASM CMR",
          "keyFinding": "Bassissima carica infettante (10–100 bacilli); motilità intracellulare actino-mediata IcsA."
        },
        {
          "title": "CDC Shigella Laboratory Guidance",
          "citation": "CDC Dysentery Guidelines, 2021.",
          "source": "CDC PHIL",
          "keyFinding": "Mancata produzione di gas dal glucosio, H2S negativo su XLD, lattosio non fermentato, totale immobilità."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Shigella",
      "species": "Shigella flexneri"
    }
  },
  {
    "id": "proteus_mirabilis",
    "name": "Proteus mirabilis",
    "genus": "Proteus",
    "species": "mirabilis",
    "aliases": [
      "proteus",
      "p. mirabilis"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo iper-mobile Ureasi-positivo (Morganellaceae)",
    "primaryPlate": {
      "colonyColor": "#dfd9cc",
      "colonyHighlight": "#f5f2eb",
      "colonyRadius": 4.2,
      "texture": "swarming",
      "agarTint": null,
      "macroSummary": " Crescita caratteristica con aloni terrazzati concentrici di migrazione superficiale (\"sciame / swarming\") su tutta la piastra."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa) pleomorfi: forme corte miste a forme allungate filamentose da sciame.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "swarming"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "strong_pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "swarming": true,
        "colonyColor": "#cbd5e1",
        "note": "Spettacolare SWARMING in onde concentriche sulla superficie dell’Agar Sangue (γ-emolisi)."
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie isolate INCOLORI (Lattosio -; i sali biliari inibiscono lo swarming)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": false,
        "colonyColor": "#d5cbbd",
        "note": "Colonie incolori (Lattosio -)."
      },
      "xld": {
        "growth": true,
        "xldType": "red_black",
        "h2s": true,
        "note": "Colonie traslucide/ambrate con CENTRO NERO per produzione di H₂S (+)."
      },
      "chocolate": {
        "growth": true,
        "swarming": true,
        "colonyColor": "#d6d3c9",
        "note": "Crescita rapida con pellicola di swarming."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Crescita senza idrolisi nera dell’esculina."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Frequente causa di infezioni delle vie urinarie complicate da calcoli renali a stampo di struvite: la potentissima ureasi alcalinizza le urine facendo precipitare fosfato ammonio-magnesiaco.",
      "goldStandard": "Onde concentriche di SWARMING su piastra primaria e Agar Sangue + Bacilli Gram- Ossidasi (-) Lattosio (-) + Test dell’Ureasi FORTEMENTE POSITIVO (fucsia rapido) + H₂S (+) e Indolo (-).",
      "literature": [
        {
          "title": "Proteus mirabilis and Urinary Tract Infections",
          "citation": "Schaffer JN, Pearson MM. Microb Spectr 3:UTI-0017, 2015.",
          "source": "ASM",
          "keyFinding": "Formazione di calcoli a stampo di struvite per massiva secrezione di ureasi; swarming concentrico."
        },
        {
          "title": "Bergey’s Manual of Systematic Bacteriology",
          "citation": "Brenner DJ et al., Springer, 2005.",
          "source": "Bergey’s Trust",
          "keyFinding": "Ureasi fulminea (fucsia in pochi minuti), H2S positivo, indolo negativo (differenzia da P. vulgaris)."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Morganellaceae",
      "genus": "Proteus",
      "species": "Proteus mirabilis"
    }
  },
  {
    "id": "serratia_marcescens",
    "name": "Serratia marcescens",
    "genus": "Serratia",
    "species": "marcescens",
    "aliases": [
      "serratia",
      "s. marcescens",
      "prodigiosina"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo pigmentato opportunista (Yersiniaceae)",
    "primaryPlate": {
      "colonyColor": "#e05347",
      "colonyHighlight": "#ffaba3",
      "colonyRadius": 4.1,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie circolari lisce, convesse, cremose con distintiva pigmentazione rosso corallo / arancio-magenta (prodigiosina)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Corti bacilli / coccobacilli Gram-negativi (rosa) ad estremità arrotondate.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e06358",
        "note": "Colonie lisce rosate-corallo prive di alone emolitico netto."
      },
      "macconkey": {
        "growth": true,
        "lactose": "late",
        "note": "Fermentatore lento/debole del lattosio: colonie pallide con sfumatura rosata-arancio propria."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": false,
        "colonyColor": "#d9777f",
        "note": "Colonie traslucide-rosate senza riflesso verde metallico."
      },
      "xld": {
        "growth": true,
        "xldType": "yellow",
        "h2s": false,
        "note": "Colonie giallastre-arancio SENZA centro nero (H₂S -)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#df6055",
        "note": "Crescita rigogliosa di colonie pigmentate."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Tollera la bile senza annerimento intenso precoce."
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Batterio ambientale umido (spesso visibile come biofilm rosato nei sanitari) e patogeno nosocomiale responsabile di polmoniti da ventilatore, infezioni urinarie e batteriemie.",
      "goldStandard": "Colonie pigmentate rosso corallo (prodigiosina) + Bacillo Gram- Ossidasi (-), Mobile (+), Indolo (-), Ureasi (-), H₂S (-) su XLD.",
      "literature": [
        {
          "title": "Serratia marcescens: An Outbreak-Prone Pathogen",
          "citation": "Khanna A et al. Curr Microbiol 68:237, 2014.",
          "source": "Springer",
          "keyFinding": "Produzione di prodigiosina (pigmento rosso corallo a 20-30°C); DNasi e gelatinasi positive."
        },
        {
          "title": "Nosocomial Serratia marcescens Infections",
          "citation": "Hejazi A, Falkiner FR. J Med Microbiol 46:903, 1997.",
          "source": "JMM",
          "keyFinding": "Contaminazione di disinfettanti e fluidi di infusione; resistenza intrinseca a colistina."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Yersiniaceae",
      "genus": "Serratia",
      "species": "Serratia marcescens"
    }
  },
  {
    "id": "pseudomonas_aeruginosa",
    "name": "Pseudomonas aeruginosa",
    "genus": "Pseudomonas",
    "species": "aeruginosa",
    "aliases": [
      "pseudomonas",
      "p. aeruginosa",
      "bacillo piocianeo"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo aerobio non-fermentante (Pseudomonadaceae)",
    "primaryPlate": {
      "colonyColor": "#8eb8a5",
      "colonyHighlight": "#d9f2e6",
      "colonyRadius": 4.9,
      "texture": "frosted",
      "agarTint": "rgba(45, 190, 160, 0.22)",
      "macroSummary": "Colonie medie-grandi piatte a bordi espansi con lucentezza metallica/iridescente e diffusione di pigmento verdastro-azzurro nell’agar."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "rods",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa) sottili e dritti, singoli o in corte coppie.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "lophotrichous"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#7ca998",
        "note": "Colonie grigio-verdi piatte con riflesso metallico e β-emolisi."
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie INCOLORI-verdastre piatte (non fermenta il lattosio)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": true,
        "metallicSheen": false,
        "colonyColor": "#9ab5a8",
        "note": "Colonie incolori (Lattosio -)."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse-ambrate piatte non fermentanti, H₂S (-)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#8fb8a6",
        "note": "Crescita rapida con aroma fruttato caratteristico."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": true,
        "black": false,
        "note": "Crescita senza idrolisi dell’esculina."
      },
      "cetrimide": {
        "growth": true,
        "note": "POSITIVO SPECIFICO: crescita rigogliosa con intenso pigmento BLU-VERDE (piocianina) e fluorescenza giallo-verde!"
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Patogeno opportunista nosocomiale intrinsecamente multiresistente; causa infezioni polmonari croniche nella fibrosi cistica, infezioni di ustioni, otite esterna maligna e polmoniti da ventilazione.",
      "goldStandard": "Gram (bacilli Gram-) → Citocromo Ossidasi POSITIVO (+) → Aerobio stretto, Lattosio (-) su MacConkey → Crescita specifica su Agar Cetrimide con pigmento blu-verde piocianina.",
      "literature": [
        {
          "title": "Pseudomonas aeruginosa: Pathogenesis and Therapeutics",
          "citation": "Moradali MF et al. Nat Rev Microbiol 15:336, 2017.",
          "source": "Nature",
          "keyFinding": "Piocianina blu e pioverdina fluorescente; alginato mucoso in fibrosi cistica; resistenza intrinseca multipla."
        },
        {
          "title": "Clinical Microbiology Manual: Nonfermenters",
          "citation": "Gilligan PH, ASM Press, 2019.",
          "source": "ASM Press",
          "keyFinding": "Crescita su agar cetrimide, ossidasi positivo entro 5 secondi, aerobio stretto con odore di uva/tortilla."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pseudomonadales",
      "family": "Pseudomonadaceae",
      "genus": "Pseudomonas",
      "species": "Pseudomonas aeruginosa"
    }
  },
  {
    "id": "vibrio_cholerae",
    "name": "Vibrio cholerae",
    "genus": "Vibrio",
    "species": "cholerae",
    "aliases": [
      "vibrione del colera",
      "v. cholerae",
      "colera",
      "vibrione"
    ],
    "taxonomyGroup": "Vibrione Gram-negativo curvo alofilo/alcalofilo (Vibrionaceae)",
    "primaryPlate": {
      "colonyColor": "#dfe7dc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.9,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie circolari medie (2 mm), convesse, lisce, traslucide con lieve sfumatura giallo-verdastra alla luce trasmessa."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "curved_comma",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa) caratteristicamente CURVI \"a virgola\" (vibrioni).",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "darting"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#cbd5c0",
        "note": "Colonie lisce con zona di emodigestione verdastra/β-emolisi (biotipo El Tor)."
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Crescita scarsa di colonie piccole incolori (non fermentatore rapido del lattosio)."
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#e2e8f0",
        "note": "Crescita regolare."
      },
      "tcbs": {
        "growth": true,
        "sucroseYellow": true,
        "note": "PATOGNOMONICO: grandi colonie GIALLO ORO BRILLANTE su fondo verde-blu per fermentazione del saccarosio!"
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Agente eziologico del colera epidemico trasmesso da acqua contaminata; la tossina colerica attiva l’adenilato ciclasi intestinale causando diarrea acquosa profusa \" ad acqua di riso\".",
      "goldStandard": "Gram (bacilli Gram- curvi \"a virgola\") → Citocromo Ossidasi (+) + Indolo (+) + Mobilità rapidissima \"a dardo\" → Agar TCBS con colonie giallo brillante (Saccarosio +).",
      "literature": [
        {
          "title": "Cholera: Mechanism and Management",
          "citation": "Harris JB et al. Lancet 379:2466, 2012.",
          "source": "The Lancet",
          "keyFinding": "Tossina colerica (CtxAB) che iper-attiva l’adenilato ciclasi inducendo massiva diarrea ad acqua di riso."
        },
        {
          "title": "CDC Laboratory Diagnosis of Cholera",
          "citation": "CDC Guidelines, 2019.",
          "source": "CDC PHIL",
          "keyFinding": "Viraggio al giallo brillante su agar selettivo TCBS (saccarosio +), string test positivo con desossicolato."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Vibrionales",
      "family": "Vibrionaceae",
      "genus": "Vibrio",
      "species": "Vibrio cholerae"
    }
  },
  {
    "id": "helicobacter_pylori",
    "name": "Helicobacter pylori",
    "genus": "Helicobacter",
    "species": "pylori",
    "aliases": [
      "helicobacter",
      "h. pylori",
      "elicobatterio"
    ],
    "taxonomyGroup": "Bacillo Gram-negativo elicoidale microaerofilo (Helicobacteraceae)",
    "primaryPlate": {
      "colonyColor": "#d7e3ec",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "pinpoint",
      "agarTint": null,
      "macroSummary": "Colonie molto piccole puntiformi (0.5–1 mm), circolari, traslucide \"a gocciolina d’acqua\"."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "spiral",
      "arrangement": "single",
      "gramSummary": "Bacilli Gram-negativi (rosa) incurvati a S, a spirale o \"ad ali di gabbiano\".",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "lophotrichous"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "strong_pos",
      "indole": false,
      "oxygen": "microaerophile",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "note": "Nessuna crescita in incubazione aerobia standard di 24h (richiede atmosfera microaerofila prolungata)."
      },
      "macconkey": {
        "growth": false
      },
      "msa": {
        "growth": false,
        "mannitol": false
      },
      "emb": {
        "growth": false
      },
      "xld": {
        "growth": false
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#dce6ef",
        "note": "Crescita lenta di minute colonie traslucide brillanti (in microaerofilia)."
      },
      "tcbs": {
        "growth": false
      },
      "bileEsculin": {
        "growth": false,
        "black": false
      },
      "cetrimide": {
        "growth": false
      },
      "lowenstein": {
        "growth": false
      }
    },
    "clinical": {
      "overview": "Colonizza la mucosa gastrica umana neutralizzando l’HCl grazie a un’ureasi potentissima; causa gastrite cronica attiva, ulcera peptica gastroduodenale e aumenta il rischio di adenocarcinoma gastrico/linfoma MALT.",
      "goldStandard": "Gram (bacilli Gram- elicoidali/a spirale) → Microaerofilo + Catalasi (+) + Ossidasi (+) + Test dell’Ureasi IMMEDIATAMENTE POSITIVO (viraggio fucsia istantaneo).",
      "literature": [
        {
          "title": "Management of Helicobacter pylori: Maastricht VI",
          "citation": "Malfertheiner P et al. Gut 71:1724, 2022.",
          "source": "Gut / BMJ",
          "keyFinding": "Associazione causale con ulcera peptica e adenocarcinoma gastrico; rapido test dell’ureasi (RUT) gastrico."
        },
        {
          "title": "Bergey’s Manual: The Epsilonproteobacteria",
          "citation": "On SLW et al., Springer, 2005.",
          "source": "Bergey’s Trust",
          "keyFinding": "Morfologia a spirale/ali di gabbiano in vivo; microaerofilia obbligata a 37°C."
        }
      ]
    },
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Campylobacterota",
      "class": "Campylobacteria",
      "order": "Campylobacterales",
      "family": "Helicobacteraceae",
      "genus": "Helicobacter",
      "species": "Helicobacter pylori"
    }
  },
  {
    "id": "staphylococcus_saprophyticus",
    "name": "Staphylococcus saprophyticus",
    "genus": "Staphylococcus",
    "species": "saprophyticus",
    "aliases": [
      "s. saprophyticus",
      "stafilococco saprofitico",
      "cistite luna di miele"
    ],
    "taxonomyGroup": "Cocco Gram+ CoNS Novobiocina-resistente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Staphylococcaceae",
      "genus": "Staphylococcus",
      "species": "Staphylococcus saprophyticus"
    },
    "primaryPlate": {
      "colonyColor": "#ffffff",
      "colonyHighlight": "#f8fafc",
      "colonyRadius": 3.4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie convesse, lisce, bianco-opache, prive di pigmento dorato."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram+ sferici in grappoli irregolari.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_epidermidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "R"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#ffffff",
        "note": "Colonie bianco-porcellana gamma-emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": true,
        "mannitol": false,
        "note": "Cresce su 7.5% NaCl senza viraggio del mannitolo (terreno resta rosa)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Seconda causa più comune di cistite acuta nelle giovani donne sessualmente attive.",
      "goldStandard": "Gram (cocchi Gram+ a grappolo) → Catalasi (+) → Coagulasi (-) → Test Novobiocina: RESISTENTE (diametro < 16 mm).",
      "transmission": "Autoinfezione ascendente periuretrale.",
      "diseases": [
        "Cistite acuta",
        "Uretrite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Staphylococcus saprophyticus: Clinical Review",
          "citation": "Raz R et al. Clin Infect Dis 40:896-899, 2005.",
          "source": "CID",
          "keyFinding": "Adesina UafA e intrinseca resistenza alla novobiocina."
        }
      ]
    }
  },
  {
    "id": "staphylococcus_lugdunensis",
    "name": "Staphylococcus lugdunensis",
    "genus": "Staphylococcus",
    "species": "lugdunensis",
    "aliases": [
      "s. lugdunensis",
      "stafilococco lugdunensis",
      "cons ipervirulento"
    ],
    "taxonomyGroup": "Cocco Gram+ CoNS ipervirulento (PYR +)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Staphylococcaceae",
      "genus": "Staphylococcus",
      "species": "Staphylococcus lugdunensis"
    },
    "primaryPlate": {
      "colonyColor": "#fef3c7",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.6,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce bianco-crema con netto aroma di legno di cedro."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram+ sferici in ammassi e tetradi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_aureus_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#fef3c7",
        "note": "Marcata beta-emolisi completa e aroma di legno di cedro.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": true,
        "mannitol": false,
        "note": "Crescita senza viraggio giallo (terreno resta rosa)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "CoNS ipervirulento responsabile di endocarditi distruttive acute su valvole native simili a S. aureus.",
      "goldStandard": "Gram (cocchi Gram+ a grappolo) → Catalasi (+) → Coagulasi provetta (-) → Test PYR POSITIVO e ornitina decarbossilasi (+).",
      "transmission": "Flora cutanea perineale.",
      "diseases": [
        "Endocardite infettiva acuta severa",
        "Infezioni protesiche"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Staphylococcus lugdunensis Virulence",
          "citation": "Frank KL et al. Clin Microbiol Rev 21:111-133, 2008.",
          "source": "ASM CMR",
          "keyFinding": "Adesine endoteliali ad alta affinità e sintesi di lugdunina."
        }
      ]
    }
  },
  {
    "id": "staphylococcus_haemolyticus",
    "name": "Staphylococcus haemolyticus",
    "genus": "Staphylococcus",
    "species": "haemolyticus",
    "aliases": [
      "s. haemolyticus",
      "stafilococco emolitico"
    ],
    "taxonomyGroup": "Cocco Gram+ CoNS multiresistente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Staphylococcaceae",
      "genus": "Staphylococcus",
      "species": "Staphylococcus haemolyticus"
    },
    "primaryPlate": {
      "colonyColor": "#f1f5f9",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce grigio-bianche circondate da evidente beta-emolisi zonale."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram+ sferici in grappoli.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_epidermidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#f8fafc",
        "note": "Netta beta-emolisi zonale.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": true,
        "mannitol": true,
        "note": "Fermenta il mannitolo (terreno giallo)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Secondo CoNS per isolamento nosocomiale; frequente etero-resistenza ai glicopeptidi.",
      "goldStandard": "Gram → Catalasi (+) → Coagulasi (-) → Beta-emolisi marcata, mannitolo (+) e Novobiocina SENSIBILE.",
      "transmission": "Infezioni nosocomiali crociate e da dispositivi intravascolari.",
      "diseases": [
        "Sepsi da catetere venoso centrale",
        "Endoftalmite post-chirurgica"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Staphylococcus haemolyticus: Healthcare Impact",
          "citation": "Czekaj T et al. Folia Microbiol 60:525-535, 2015.",
          "source": "Springer",
          "keyFinding": "Genoma plastico ricco di elementi IS che guidano la multiresistenza."
        }
      ]
    }
  },
  {
    "id": "staphylococcus_hominis",
    "name": "Staphylococcus hominis",
    "genus": "Staphylococcus",
    "species": "hominis",
    "aliases": [
      "s. hominis",
      "stafilococco hominis"
    ],
    "taxonomyGroup": "Cocco Gram+ CoNS commensale",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Staphylococcaceae",
      "genus": "Staphylococcus",
      "species": "Staphylococcus hominis"
    },
    "primaryPlate": {
      "colonyColor": "#fff8e7",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole, circolari, lisce, bianco-giallastre chiare."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram+ sferici in piccoli grappoli.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_epidermidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#fff8e7",
        "note": "Colonie bianco-avorio gamma-emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": true,
        "mannitol": false,
        "note": "Crescita senza viraggio giallo (terreno resta rosa)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Microbiota cutaneo umano; produce composti solforati ascellari; opportunista in neutropenici.",
      "goldStandard": "Gram → Catalasi (+) → Coagulasi (-) → Ureasi (-) e Novobiocina SENSIBILE.",
      "transmission": "Contaminazione cutanea linee vascolari.",
      "diseases": [
        "Batteriemia in prematuri",
        "Endocardite tardiva su protesi"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Odorant Biosynthesis by S. hominis",
          "citation": "Bawdon D et al. Sci Rep 5:11499, 2015.",
          "source": "Nature",
          "keyFinding": "C-S liasi attiva su precursori apocrini."
        }
      ]
    }
  },
  {
    "id": "streptococcus_agalactiae",
    "name": "Streptococcus agalactiae",
    "genus": "Streptococcus",
    "species": "agalactiae",
    "aliases": [
      "s. agalactiae",
      "gbs",
      "streptococco gruppo b"
    ],
    "taxonomyGroup": "Streptococco β-emolitico di Gruppo B (Lancefield)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus agalactiae"
    },
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie grigio-traslucide con stretto alone di debole beta-emolisi."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ in catenelle corte e medie.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "streptococcus_pyogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#e2e8f0",
        "note": "Stretto alone di debole beta-emolisi; test di CAMP positivo con S. aureus.",
        "swarming": false,
        "narrowHalo": true,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa primaria di sepsi, polmonite e meningite neonatale precoce; colonizza il tratto genito-rettale gravido.",
      "goldStandard": "Gram (cocchi Gram+ a catenella) → Catalasi (-) → Stretto alone di beta-emolisi → Test di CAMP positivo e idrolisi dell'ippurato (+).",
      "transmission": "Verticale durante il parto.",
      "diseases": [
        "Sepsi neonatale precoce",
        "Meningite neonatale",
        "Endometrite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Group B Streptococcal Disease Prevention",
          "citation": "ACOG Opinion 797, 2020.",
          "source": "ACOG",
          "keyFinding": "Screening tampone vagino-rettale a 36-37 settimane."
        }
      ]
    }
  },
  {
    "id": "streptococcus_mutans",
    "name": "Streptococcus mutans",
    "genus": "Streptococcus",
    "species": "mutans",
    "aliases": [
      "s. mutans",
      "streptococco mutans",
      "carie dentale"
    ],
    "taxonomyGroup": "Streptococco Viridans cariogeno",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus mutans"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie minute rugose fortemente adese all'agar come gocce di vetro smerigliato."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ ovalari in catene.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "streptococcus_pyogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Colonie minute fortemente adese con debole viraggio verdastro o gamma-emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente cardine della carie dentale; sintetizza glucani insolubili extracellulari da saccarosio per la placca.",
      "goldStandard": "Gram → Catalasi (-) → Optochina RESISTENTE → Crescita fortemente aderente e produzione glucani.",
      "transmission": "Saliva durante la prima infanzia.",
      "diseases": [
        "Carie dentale",
        "Pulpite",
        "Endocardite subacuta"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Streptococcus mutans and Caries",
          "citation": "Lemos JA et al. Microb Spectr 7:GPP3, 2019.",
          "source": "ASM",
          "keyFinding": "Fermentazione acidogenica con rapido crollo del pH sotto 5.5."
        }
      ]
    }
  },
  {
    "id": "streptococcus_mitis",
    "name": "Streptococcus mitis",
    "genus": "Streptococcus",
    "species": "mitis",
    "aliases": [
      "s. mitis",
      "streptococco mitis",
      "viridans"
    ],
    "taxonomyGroup": "Streptococco α-emolitico gruppo Viridans",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus mitis"
    },
    "primaryPlate": {
      "colonyColor": "#cfd8e3",
      "colonyHighlight": "#f8fafc",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie minute traslucide con netto alone verde di alfa-emolisi."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ sferici in catene flessuose.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "streptococcus_pneumoniae_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "alpha",
        "colonyColor": "#cbd5e1",
        "note": "Alone verdastro di alfa-emolisi; insolubile in bile, optochina resistente.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Flora orofaringea; causa classica di endocardite batterica subacuta su valvole cardiache lesionate.",
      "goldStandard": "Gram → Catalasi (-) → Alfa-emolisi verdastra → Test Optochina: RESISTENTE (differenzia da S. pneumoniae).",
      "transmission": "Batteriemia transitoria odontoiatrica.",
      "diseases": [
        "Endocardite batterica subacuta",
        "Batteriemia post-chemioterapia"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Viridans Streptococci Diagnostics",
          "citation": "Doern CD et al. J Clin Microbiol 48:3829, 2010.",
          "source": "JCM",
          "keyFinding": "Identificazione differenziale fenotipica e MALDI-TOF dal pneumococco."
        }
      ]
    }
  },
  {
    "id": "streptococcus_sanguinis",
    "name": "Streptococcus sanguinis",
    "genus": "Streptococcus",
    "species": "sanguinis",
    "aliases": [
      "s. sanguinis",
      "s. sanguis",
      "streptococco sanguis"
    ],
    "taxonomyGroup": "Streptococco α-emolitico gruppo Viridans",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus sanguinis"
    },
    "primaryPlate": {
      "colonyColor": "#cfd8e3",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole convesse con alone verdastro di alfa-emolisi."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ in catene medie.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "streptococcus_pyogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "alpha",
        "colonyColor": "#cbd5e1",
        "note": "Alfa-emolisi; Optochina R, bile insolubile.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Colonizzatore precoce dello smalto; lega piastrine e fibrina sulle vegetazioni cardiache.",
      "goldStandard": "Gram → Catalasi (-) → Alfa-emolisi → Optochina R, idrolisi arginina (+).",
      "transmission": "Disseminazione ematica odontoiatrica.",
      "diseases": [
        "Endocardite infettiva subacuta",
        "Ascessi dentari"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "S. sanguinis in Endocarditis",
          "citation": "Paik S et al. Infect Immun 73:3956, 2005.",
          "source": "IAI",
          "keyFinding": "Adesina FimA mediatrice del legame ai complessi piastrine-fibrina."
        }
      ]
    }
  },
  {
    "id": "streptococcus_gallolyticus",
    "name": "Streptococcus gallolyticus",
    "genus": "Streptococcus",
    "species": "gallolyticus",
    "aliases": [
      "s. gallolyticus",
      "streptococcus bovis",
      "marcatore cancro colon"
    ],
    "taxonomyGroup": "Streptococco Gruppo D non-enterococcico",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus gallolyticus"
    },
    "primaryPlate": {
      "colonyColor": "#f1f5f9",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.6,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie grigio-biancastre piccole gamma o debolmente alfa-emolitiche."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ in coppie e corte catene.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "streptococcus_pyogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Colonie gamma-emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": true,
        "black": true,
        "note": "Idrolizza l'esculina (nero) ma NON cresce in 6.5% NaCl e PYR (-) differenziandosi da Enterococcus."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Forte associazione clinica con adenomi e adenocarcinoma del colon-retto; endocardite in anziani.",
      "goldStandard": "Gram → Catalasi (-) → Bile-Esculina NERO (+) ma 6.5% NaCl (-) e PYR (-) (differenziazione netta da Enterococcus).",
      "transmission": "Traslocazione mucosa intestinale neoplastica.",
      "diseases": [
        "Endocardite sentinella per neoplasia del colon-retto",
        "Batteriemia"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "S. gallolyticus and Colorectal Cancer",
          "citation": "Boleij A et al. Nat Rev Microbiol 10:658, 2012.",
          "source": "Nature",
          "keyFinding": "Colonizzazione mucosa tumorale e stimolazione infiammatoria pro-oncogena."
        }
      ]
    }
  },
  {
    "id": "streptococcus_dysgalactiae",
    "name": "Streptococcus dysgalactiae",
    "genus": "Streptococcus",
    "species": "dysgalactiae",
    "aliases": [
      "s. dysgalactiae",
      "streptococco gruppo c",
      "streptococco gruppo g"
    ],
    "taxonomyGroup": "Streptococco β-emolitico Gruppo C/G (Lancefield)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus dysgalactiae"
    },
    "primaryPlate": {
      "colonyColor": "#dce4ee",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole con ampio alone limpido di beta-emolisi completa."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ in catene medie e lunghe.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "streptococcus_pyogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#e2e8f0",
        "note": "Ampia beta-emolisi; Bacitracina RESISTENTE (differenzia da S. pyogenes).",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": true
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa faringite severa, cellulite, fascite necrotizzante ed erisipela in anziani e diabetici.",
      "goldStandard": "Gram → Catalasi (-) → Ampia beta-emolisi → Bacitracina RESISTENTE e agglutinazione Lancefield C o G.",
      "transmission": "Contatto con goccioline respiratorie o lesioni cutanee.",
      "diseases": [
        "Faringite acuta",
        "Cellulite severa",
        "Sepsi streptococcica"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "S. dysgalactiae subsp. equisimilis",
          "citation": "Rantala S. Clin Microbiol Infect 20:746, 2014.",
          "source": "CMI",
          "keyFinding": "Esprime geni di virulenza analoghi a S. pyogenes inclusa streptolisina O."
        }
      ]
    }
  },
  {
    "id": "streptococcus_anginosus",
    "name": "Streptococcus anginosus",
    "genus": "Streptococcus",
    "species": "anginosus",
    "aliases": [
      "s. anginosus",
      "gruppo milleri",
      "s. milleri"
    ],
    "taxonomyGroup": "Streptococco gruppo Milleri/Anginosus",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Streptococcaceae",
      "genus": "Streptococcus",
      "species": "Streptococcus anginosus"
    },
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 1.8,
      "texture": "pinpoint",
      "agarTint": null,
      "macroSummary": "Colonie minute puntiformi con inconfondibile e intenso odore di caramello (butterscotch)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "chains",
      "gramSummary": "Cocchi Gram+ in coppie e catenelle.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "streptococcus_pyogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "alpha",
        "colonyColor": "#e2e8f0",
        "note": "Colonie puntiformi alfa-emolitiche con aroma dolce di caramello bruciato.",
        "swarming": false,
        "narrowHalo": true,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Propensione spiccata alla formazione di ascessi viscerali profondi (epatici, cerebrali, polmonari).",
      "goldStandard": "Gram → Catalasi (-) → Colonie puntiformi con profumo di caramello (diacetile) → Voges-Proskauer (+).",
      "transmission": "Disseminazione endogena odontogena o digestiva.",
      "diseases": [
        "Ascesso epatico piogenico",
        "Ascesso cerebrale",
        "Empiema"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Streptococcus anginosus Group",
          "citation": "Asam D et al. Future Microbiol 9:979, 2014.",
          "source": "Future Med",
          "keyFinding": "Produzione di intermedilisina e abbondante diacetile volatile."
        }
      ]
    }
  },
  {
    "id": "enterococcus_faecium",
    "name": "Enterococcus faecium",
    "genus": "Enterococcus",
    "species": "faecium",
    "aliases": [
      "e. faecium",
      "vre",
      "enterococco vancomicina-resistente"
    ],
    "taxonomyGroup": "Cocco Gram+ nosocomiale VRE (Enterococcaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Enterococcaceae",
      "genus": "Enterococcus",
      "species": "Enterococcus faecium"
    },
    "primaryPlate": {
      "colonyColor": "#f8fafc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.6,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole, circolari, intere, grigio-bianche gamma-emolitiche."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "pairs",
      "gramSummary": "Cocchi Gram+ ovalari appaiati o in corte catene.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "enterococcus_faecalis_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Colonie gamma-emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": true,
        "black": true,
        "note": "Idrolisi massiva dell'esculina (nero); cresce in 6.5% NaCl e PYR (+)."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Patogeno nosocomiale prioritario OMS; ceppi VRE multiresistenti a vancomicina e ampicillina; sepsi in terapia intensiva.",
      "goldStandard": "Gram → Catalasi (-) → Bile-Esculina NERO (+) → Crescita in NaCl 6.5% (+) e PYR (+); resistenza vancomicina.",
      "transmission": "Trasmissione orizzontale nosocomiale tramite mani o superfici.",
      "diseases": [
        "Sepsi nosocomiale VRE",
        "UTI complicata",
        "Endocardite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "E. faecium Evolution",
          "citation": "Gao W et al. Clin Microbiol Rev 31:e00078, 2018.",
          "source": "ASM CMR",
          "keyFinding": "Subclonato ospedaliero CC17 adattato alla colonizzazione antibiotico-guidata."
        }
      ]
    }
  },
  {
    "id": "bacillus_anthracis",
    "name": "Bacillus anthracis",
    "genus": "Bacillus",
    "species": "anthracis",
    "aliases": [
      "b. anthracis",
      "antrace",
      "carbonchio"
    ],
    "taxonomyGroup": "Bacillo Gram+ sporigeno capsulato immobile (Bacillaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Bacillaceae",
      "genus": "Bacillus",
      "species": "Bacillus anthracis"
    },
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4.5,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Grandi colonie piatte rugose tenaci con bordi filamentosi a 'testa di medusa' e consistenza di albume montato a neve."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "chains",
      "gramSummary": "Grandi bacilli Gram+ a canna di bambù rettangolari in lunghe catene con spora centrale.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "central"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "bacillus_cereus_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "NON-EMOLITICO (differenza chiave da B. cereus), colonie tenaci a testa di medusa.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente eziologico del carbonchio (cutaneo con escara nera, inalatorio, gastrointestinale); potenziale agente di bioterrorismo BSL-3.",
      "goldStandard": "Gram (bacilli grandi rettangolari) → Catalasi (+) → NON-EMOLITICO su agar sangue, IMMOBILE, capsula di poli-D-glutammato evidente al blu di metilene di M'Fadyean.",
      "transmission": "Contatto con spore da animali, lana, suolo o aerosol intenzionale.",
      "diseases": [
        "Carbonchio cutaneo (escara nera indolente)",
        "Carbonchio inalatorio letale",
        "Gastrointestinale"
      ],
      "safetyLevel": "BSL-3",
      "literature": [
        {
          "title": "Bacillus anthracis Pathogenesis",
          "citation": "Moayeri M et al. Nat Rev Microbiol 13:410, 2015.",
          "source": "Nature",
          "keyFinding": "Tossine dell'antrace (fattore letale e fattore edematogeno) e capsula poliglutammica."
        }
      ]
    }
  },
  {
    "id": "bacillus_subtilis",
    "name": "Bacillus subtilis",
    "genus": "Bacillus",
    "species": "subtilis",
    "aliases": [
      "b. subtilis",
      "bacillo del fieno"
    ],
    "taxonomyGroup": "Bacillo Gram+ sporigeno modello (Bacillaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Bacillaceae",
      "genus": "Bacillus",
      "species": "Bacillus subtilis"
    },
    "primaryPlate": {
      "colonyColor": "#eae3d2",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 5,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Grandi colonie rugose, opache, asciutte, finemente corrugate con margini lobati."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "chains",
      "gramSummary": "Bacilli Gram+ con endospora ovale centrale non deformante.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "central"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "bacillus_cereus_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#eae3d2",
        "note": "Colonie rugose espanse con debole beta-emolisi.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Organismo modello da laboratorio, ampiamente presente nel suolo; comune contaminante aerodisperso innocuo di piastre colturali.",
      "goldStandard": "Gram (grandi bacilli Gram+) → Catalasi (+) → Endospore centrali verdi a Schaeffer-Fulton → Aerobio stretto, mobile, colonie rugose.",
      "transmission": "Polvere del suolo e fieno.",
      "diseases": [
        "Contaminante ambientale non patogeno",
        "Rarissima batteriemia in immunodepressi"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Bacillus subtilis as a Model",
          "citation": "Errington J. Microbiol Mol Biol Rev 67:52, 2003.",
          "source": "MMBR",
          "keyFinding": "Meccanismi regolatori della differenziazione e della sporulazione asimmetrica."
        }
      ]
    }
  },
  {
    "id": "bacillus_thuringiensis",
    "name": "Bacillus thuringiensis",
    "genus": "Bacillus",
    "species": "thuringiensis",
    "aliases": [
      "b. thuringiensis",
      "bt",
      "insetticida biologico"
    ],
    "taxonomyGroup": "Bacillo Gram+ con cristallo parasporale (Bacillaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Bacillales",
      "family": "Bacillaceae",
      "genus": "Bacillus",
      "species": "Bacillus thuringiensis"
    },
    "primaryPlate": {
      "colonyColor": "#d1d5db",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4.5,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie grandi grigio-bianche smerigliate simili a B. cereus."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "chains",
      "gramSummary": "Grandi bacilli Gram+ con endospora subterminale e cristallo proteico bipiramidale parasporale (delta-endotossina).",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "subterminal"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "bacillus_cereus_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#d1d5db",
        "note": "Beta-emolitico su agar sangue simile a B. cereus.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Produce cristalli proteici parasporali tossici per le larve degli insetti (Cry/Cyt); cardine del bio-controllo agricolo; rarissimo opportunista in traumi agricoli.",
      "goldStandard": "Gram (grandi bacilli con spore) → Catalasi (+) → Evidenziazione al microscopio ottico a contrasto del cristallo proteico parasporale adiacente alla spora.",
      "transmission": "Polveri agricole e fitofarmaci biologici.",
      "diseases": [
        "Infezioni cutanee da contaminazione di ferite agricole"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Bacillus thuringiensis Toxins",
          "citation": "Palma L et al. Toxins 6:3296, 2014.",
          "source": "Toxins",
          "keyFinding": "Attivazione delle endotossine Cry nel pH alcalino del mesentero dei lepidotteri."
        }
      ]
    }
  },
  {
    "id": "clostridium_perfringens",
    "name": "Clostridium perfringens",
    "genus": "Clostridium",
    "species": "perfringens",
    "aliases": [
      "c. perfringens",
      "bacillus welchii",
      "gangrena gassosa"
    ],
    "taxonomyGroup": "Bacillo Gram+ anaerobio a doppia emolisi (Clostridiaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Clostridia",
      "order": "Eubacteriales",
      "family": "Clostridiaceae",
      "genus": "Clostridium",
      "species": "Clostridium perfringens"
    },
    "primaryPlate": {
      "colonyColor": "#d1d5db",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce espanse rapidamente circondate da una spettacolare doppia zona concentrica di emolisi."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Grossi bacilli Gram+ tozzi rettangolari 'a vagoncino'; spore subterminali raramente visibili in campioni clinici.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "subterminal"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "clostridium_difficile_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#d1d5db",
        "note": "Caratteristica DOPPIA ZONA di emolisi: interna completa (teta-tossina) ed esterna parziale (alfa-tossina lecitinasi); crescita anaerobia fulminea.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": true
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente principe della mionecrosi clostridiale (gangrena gassosa con crepitio tissutale) e di tossinfezioni alimentari carne-derivate.",
      "goldStandard": "Gram (grossi bacilli tozzi rettangolari) → Catalasi (-) → Doppia zona concentrica di beta-emolisi anaerobia → Reazione di Nagler positiva su tuorlo d'uovo (lecitinasi neutralizzata da antitossina).",
      "transmission": "Contaminazione di ferite traumatiche con terriccio; cibi cotti conservati a temperatura ambiente.",
      "diseases": [
        "Gangrena gassosa",
        "Cellulite anaerobia necrotizzante",
        "Tossinfezione alimentare da enterotossina CPE"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Clostridium perfringens Pathogenesis",
          "citation": "Rood JI et al. Microbiol Mol Biol Rev 82:e00040, 2018.",
          "source": "MMBR",
          "keyFinding": "Alfa-tossina fosfolipasi C e teta-tossina citolisina colesterolo-dipendente."
        }
      ]
    }
  },
  {
    "id": "clostridium_tetani",
    "name": "Clostridium tetani",
    "genus": "Clostridium",
    "species": "tetani",
    "aliases": [
      "c. tetani",
      "bacillo del tetano",
      "bacchetta di tamburo"
    ],
    "taxonomyGroup": "Bacillo Gram+ anaerobio a spora terminale sferica",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Clostridia",
      "order": "Eubacteriales",
      "family": "Clostridiaceae",
      "genus": "Clostridium",
      "species": "Clostridium tetani"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Cresce in anaerobiosi formando un velo sottilissimo ramificato e diffuso a sciame (swarming anaerobio)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram+ sottili allungati con inconfondibile endospora terminale sferica deformativa ('a bacchetta di tamburo').",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "terminal"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "clostridium_difficile_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#cbd5e1",
        "note": "Swarming anaerobio sottile velato con debole emolisi.",
        "swarming": true,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": true
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente del tetano; la potente neurotossina tetanospasmina migra per via assonale retrograda bloccando il rilascio di GABA e glicina inducendo spasmi spastici continui (trisma, riso sardonico, opistotono).",
      "goldStandard": "Diagnosi primariamente clinica; conferma microscopica con bacilli a 'bacchetta di tamburo' con spora sferica terminale e coltura anaerobia con swarming velato.",
      "transmission": "Inoculazione accidentale di spore terrose in ferite lacero-contuse profonde o punture da chiodi arrugginiti.",
      "diseases": [
        "Tetano generalizzato con trisma e opistotono",
        "Tetano neonatale",
        "Tetano localizzato"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Tetanus: Neurobiology and Management",
          "citation": "Yen LM, Thwaites CL. Lancet 394:1229, 2019.",
          "source": "The Lancet",
          "keyFinding": "Cleavage della sinaptobrevina VAMP mediato dalla catena leggera zinco-endopeptidasica."
        }
      ]
    }
  },
  {
    "id": "clostridium_botulinum",
    "name": "Clostridium botulinum",
    "genus": "Clostridium",
    "species": "botulinum",
    "aliases": [
      "c. botulinum",
      "botulismo",
      "tossina botulinica"
    ],
    "taxonomyGroup": "Bacillo Gram+ anaerobio neurotossigeno (Clostridiaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Clostridia",
      "order": "Eubacteriales",
      "family": "Clostridiaceae",
      "genus": "Clostridium",
      "species": "Clostridium botulinum"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce semi-trasparenti con margini irregolari e riflesso iridescente su tuorlo d'uovo."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram+ con endospora ovale subterminale deformativa.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "subterminal"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "clostridium_difficile_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#cbd5e1",
        "note": "Crescita anaerobia obbligata con beta-emolisi e lipasi positiva su tuorlo.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Botulismo; la tossina botulinica (la più letale sostanza naturale) inibisce il rilascio di acetilcolina alla placca neuromuscolare provocando paralisi flaccida discendente simmetrica.",
      "goldStandard": "Rilevazione della neurotossina libera nel siero, feci o residui alimentari mediante saggio biologico di neutralizzazione murina o PCR/MALDI-TOF.",
      "transmission": "Consumo di conserve alimentari anaerobiche contaminate (sottolio casalinghi) o miele nei neonati.",
      "diseases": [
        "Botulismo alimentare",
        "Botulismo infantile (sindrome del floppy baby)",
        "Botulismo da ferita"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Botulinum Neurotoxins: Mode of Action",
          "citation": "Rossetto O et al. Nat Rev Microbiol 12:535, 2014.",
          "source": "Nature",
          "keyFinding": "Proteolisi selettiva del complesso SNARE (SNAP-25, sintaxina e VAMP)."
        }
      ]
    }
  },
  {
    "id": "lactobacillus_acidophilus",
    "name": "Lactobacillus acidophilus",
    "genus": "Lactobacillus",
    "species": "acidophilus",
    "aliases": [
      "l. acidophilus",
      "bacillo di doderlein",
      "lattobacillo"
    ],
    "taxonomyGroup": "Bacillo Gram+ lattico commensale (Lactobacillaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Lactobacillaceae",
      "genus": "Lactobacillus",
      "species": "Lactobacillus acidophilus"
    },
    "primaryPlate": {
      "colonyColor": "#f8fafc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie minute puntiformi grigio-biancastre opache o traslucide."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "chains",
      "gramSummary": "Bacilli Gram+ allungati e snelli in catenelle parallele.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Colonie minute gamma-emolitiche; cresce preferenzialmente su agar selettivo MRS a pH acido.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Pilastro del normale microbiota vaginale (bacilli di Döderlein) e intestinale; produce acido lattico mantenendo il pH < 4.5 e prevenendo infezioni.",
      "goldStandard": "Gram (bacilli Gram+ lunghi e snelli) → Catalasi (-) → Ossidasi (-) → Crescita su agar MRS a pH acido con produzione di acido lattico.",
      "transmission": "Commensale fisiologico umano.",
      "diseases": [
        "Microbiota benefico non patogeno",
        "Rarissima batteriemia opportunistica"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Lactobacillus acidophilus: Functional Properties",
          "citation": "Bullock LK et al. Int J Food Microbiol 148:1, 2011.",
          "source": "Elsevier",
          "keyFinding": "Fermentazione omofermentativa con conversione quantitativa del lattosio in acido lattico L(+)."
        }
      ]
    }
  },
  {
    "id": "lactobacillus_rhamnosus",
    "name": "Lactobacillus rhamnosus",
    "genus": "Lactobacillus",
    "species": "rhamnosus",
    "aliases": [
      "l. rhamnosus",
      "lgg",
      "probiotico"
    ],
    "taxonomyGroup": "Bacillo Gram+ lattico probiotico (Lactobacillaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Lactobacillaceae",
      "genus": "Lactobacillus",
      "species": "Lactobacillus rhamnosus"
    },
    "primaryPlate": {
      "colonyColor": "#f1f5f9",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce biancastre convesse intere."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "chains",
      "gramSummary": "Bacilli Gram+ in corte catenelle con estremità arrotondate.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f1f5f9",
        "note": "Colonie gamma-emolitiche su agar sangue; ottima crescita su terreno MRS.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Ceppo probiotico ampiamente somministrato (LGG); raro patogeno opportunista causa di batteriemia ed endocardite in pazienti con grave barriera mucosale compromessa.",
      "goldStandard": "Gram → Catalasi (-) → Ossidasi (-) → Fermentazione del ramnosio positiva e profilo proteomico MALDI-TOF.",
      "transmission": "Commensale e integratori probiotici.",
      "diseases": [
        "Rara batteriemia in pazienti oncologici o con intestino corto"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Lactobacillus rhamnosus GG Genomics",
          "citation": "Kankainen M et al. PNAS 106:17193, 2009.",
          "source": "PNAS",
          "keyFinding": "Pili superficiali SpaCBA che mediano l'adesione persistente al muco enterocitario."
        }
      ]
    }
  },
  {
    "id": "pediococcus_acidilactici",
    "name": "Pediococcus acidilactici",
    "genus": "Pediococcus",
    "species": "acidilactici",
    "aliases": [
      "p. acidilactici",
      "pediococco",
      "cocchi a tetradi"
    ],
    "taxonomyGroup": "Cocco Gram+ a tetradi Vancomicina-resistente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Lactobacillaceae",
      "genus": "Pediococcus",
      "species": "Pediococcus acidilactici"
    },
    "primaryPlate": {
      "colonyColor": "#ffffff",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole, circolari, lisce, biancastre prive di emolisi."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram+ sferici disposti in caratteristiche tetradi e coppie.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_epidermidis_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#ffffff",
        "note": "Colonie gamma-emolitiche; vancomicina intrinsecamente resistente.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Batterio dell'acido lattico; clinicamente rilevante per la sua intrinseca resistenza ad alto livello alla Vancomicina.",
      "goldStandard": "Gram (cocchi Gram+ in tetradi regolari) → Catalasi (-) → Resistenza intrinseca alla Vancomicina (terminazione parietale D-Ala-D-Lattato).",
      "transmission": "Alimenti fermentati e flora enterica opportunistica.",
      "diseases": [
        "Rara batteriemia ed infezioni di catetere in immunocompromessi"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Pediococcus Infections",
          "citation": "Mastro TD et al. Ann Intern Med 113:38, 1990.",
          "source": "AIM",
          "keyFinding": "Resistenza intrinseca alla vancomicina non trasmissibile mediata da sintesi di precursori D-lattato."
        }
      ]
    }
  },
  {
    "id": "leuconostoc_mesenteroides",
    "name": "Leuconostoc mesenteroides",
    "genus": "Leuconostoc",
    "species": "mesenteroides",
    "aliases": [
      "l. mesenteroides",
      "leuconostoc",
      "produzione destrano"
    ],
    "taxonomyGroup": "Cocco/coccobacillo Gram+ Vancomicina-resistente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Bacilli",
      "order": "Lactobacillales",
      "family": "Lactobacillaceae",
      "genus": "Leuconostoc",
      "species": "Leuconostoc mesenteroides"
    },
    "primaryPlate": {
      "colonyColor": "#f8fafc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce, mucoidi se coltivate in presenza di saccarosio (sintesi di destrano)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "pairs",
      "gramSummary": "Cocchi o corti coccobacilli Gram+ ovalari in coppie e catenelle.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "streptococcus_pneumoniae_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Colonie gamma-emolitiche; intrinsecamente resistente a vancomicina.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Batterio lattico eterofermentante usato nell'industria alimentare; intrinsecamente resistente alla Vancomicina; opportunista in nutrizione parenterale.",
      "goldStandard": "Gram (coccobacilli Gram+ in coppie) → Catalasi (-) → Produzione di gas da glucosio (eterofermentante) e resistenza intrinseca a Vancomicina.",
      "transmission": "Contaminazione cateteri e soluzioni parenterali ricche di lipidi.",
      "diseases": [
        "Batteriemia da catetere centrale"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Leuconostoc Species in Clinical Practice",
          "citation": "Handwerger S et al. Rev Infect Dis 12:602, 1990.",
          "source": "Oxford",
          "keyFinding": "Sostituzione del dipeptide terminale D-Ala-D-Ala con D-Ala-D-Lac che impedisce il legame della vancomicina."
        }
      ]
    }
  },
  {
    "id": "finegoldia_magna",
    "name": "Finegoldia magna",
    "genus": "Finegoldia",
    "species": "magna",
    "aliases": [
      "f. magna",
      "peptostreptococcus magnus",
      "cocco anaerobio"
    ],
    "taxonomyGroup": "Cocco Gram+ anaerobio obbligato",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Clostridia",
      "order": "Eubacteriales",
      "family": "Peptostreptococcaceae",
      "genus": "Finegoldia",
      "species": "Finegoldia magna"
    },
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie minute traslucide grigiastre a lenta crescita anaerobia."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "clusters",
      "gramSummary": "Cocchi Gram+ grandi (>1 µm) disposti in coppie, tetradi e grappoli.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_epidermidis_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Crescita anaerobia obbligata lenta di piccole colonie gamma-emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Il cocco Gram-positivo anaerobio più frequentemente isolato da campioni clinici umani: infezioni cutanee, ascessi profondi e infezioni di protesi articolari.",
      "goldStandard": "Gram (cocchi grandi Gram+) → Catalasi (-) → Anaerobio obbligato stretto → Cromatografia gas-liquida (acidi grassi volatili) o MALDI-TOF.",
      "transmission": "Flora commensale cutanea e mucosale.",
      "diseases": [
        "Infezioni periprotesiche ortopediche",
        "Ascessi tessuti molli",
        "Ulcere del piede diabetico"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Finegoldia magna: An Overlooked Pathogen",
          "citation": "Murphy EC, Frick IM. Anaerobe 20:1, 2013.",
          "source": "Elsevier",
          "keyFinding": "Proteina L adesina che lega specificamente le catene leggere kappa delle immunoglobuline."
        }
      ]
    }
  },
  {
    "id": "peptoniphilus_harei",
    "name": "Peptoniphilus harei",
    "genus": "Peptoniphilus",
    "species": "harei",
    "aliases": [
      "p. harei",
      "peptococco anaerobio"
    ],
    "taxonomyGroup": "Cocco Gram+ anaerobio obbligato",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacillota",
      "class": "Clostridia",
      "order": "Eubacteriales",
      "family": "Peptostreptococcaceae",
      "genus": "Peptoniphilus",
      "species": "Peptoniphilus harei"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole, convesse, opache, grigiastre con odore butirrico acre."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "cocci",
      "arrangement": "pairs",
      "gramSummary": "Cocchi Gram+ sferici appaiati o in piccoli ammassi irregolari.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "staphylococcus_epidermidis_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita anaerobia obbligata con produzione di acido butirrico.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Cocco anaerobio obbligato isolato da infezioni polimicrobiche di ulcere diabetiche croniche, piaghe da decubito e ascessi pelvici.",
      "goldStandard": "Gram → Anaerobio stretto, catalasi (-) → Fermentazione peptonolitica con rilascio di acido butirrico rilevato mediante GLC o spettrometria di massa.",
      "transmission": "Disseminazione opportunistica dalla flora urogenitale ed enterica.",
      "diseases": [
        "Ulcere diabetiche del piede",
        "Ascessi perianali",
        "Fascite necrotizzante polimicrobica"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Peptoniphilus harei in Chronic Wounds",
          "citation": "Murdoch DA. Clin Microbiol Rev 11:81, 1998.",
          "source": "ASM CMR",
          "keyFinding": "Isolamento frequente in consorzi sinergici polimicrobici con anaerobi Gram-negativi."
        }
      ]
    }
  },
  {
    "id": "cutibacterium_acnes",
    "name": "Cutibacterium acnes",
    "genus": "Cutibacterium",
    "species": "acnes",
    "aliases": [
      "c. acnes",
      "propionibacterium acnes",
      "p. acnes",
      "acne volgare"
    ],
    "taxonomyGroup": "Bacillo Gram+ difteroide anaerobio/microaerofilo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Propionibacteriales",
      "family": "Propionibacteriaceae",
      "genus": "Cutibacterium",
      "species": "Cutibacterium acnes"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole, convesse, bianco-crema o giallo pallido a crescita anaerobia lenta (3-5 giorni)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "pleomorphic",
      "gramSummary": "Bacilli Gram+ pleomorfi difteroidi con estremità clavati disposti a lettere cinesi o a palizzata.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#fef08a",
        "note": "Crescita anaerobia preferenziale di piccole colonie crema-giallastre; produce acido propionico.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Coinvolto nella fisiopatologia dell'acne volgare; causa primaria di infezioni indolenti subacute tardive di protesi di spalla e corpi estranei ortopedici.",
      "goldStandard": "Gram (difteroidi Gram+) → Catalasi (+) → Indolo (+) → Anaerobio aerotollerante a crescita prolungata (≥7-14 giorni nelle colture ortopediche).",
      "transmission": "Commensale delle ghiandole sebacee e dei follicoli piliferi.",
      "diseases": [
        "Infezioni periprotesiche di spalla",
        "Acne volgare",
        "Endocardite tardiva su elettrocatetere"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Cutibacterium acnes: The Skin Commensal and Pathogen",
          "citation": "Achermann Y et al. Clin Microbiol Rev 27:419, 2014.",
          "source": "ASM CMR",
          "keyFinding": "Formazione di biofilm tenaci su titanio e secrezione di lipasi idrolizzanti trigliceridi."
        }
      ]
    }
  },
  {
    "id": "actinomyces_israelii",
    "name": "Actinomyces israelii",
    "genus": "Actinomyces",
    "species": "israelii",
    "aliases": [
      "a. israelii",
      "actinomicosi",
      "granuli di zolfo",
      "dente molare"
    ],
    "taxonomyGroup": "Bacillo Gram+ filamentoso ramificato anaerobio (Actinomycetaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Actinomycetales",
      "family": "Actinomycetaceae",
      "genus": "Actinomyces",
      "species": "Actinomyces israelii"
    },
    "primaryPlate": {
      "colonyColor": "#f8fafc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.2,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie cerebriformi a forma di 'dente molare' (molar tooth), biancastre, opache, rugose, tenacemente adese all'agar."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "filamentous",
      "arrangement": "filaments",
      "gramSummary": "Sottili filamenti Gram+ ramificati a rete (simili a ife fungine) con frammentazione bacillare; non alcol-acido resistente.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Colonie a dente molare anaerobie tipiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Actinomicosi cervico-facciale ('mascella di legno'), toracica e pelvica (IUD spirale); tragitti fistolosi con espulsione di caratteristici 'granuli di zolfo' macroscopici.",
      "goldStandard": "Esame a fresco del pus con rilevazione dei granuli di zolfo (masse di filamenti ramificati bordati da clavae eosinofile) → Coltura anaerobia con colonie a dente molare.",
      "transmission": "Disseminazione endogena da traumi della mucosa orale o estrazioni dentarie.",
      "diseases": [
        "Actinomicosi cervico-facciale",
        "Actinomicosi toracica",
        "Actinomicosi pelvica da IUD"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Actinomycosis: Diagnosis and Management",
          "citation": "Valour F et al. Clin Microbiol Infect 20:295, 2014.",
          "source": "ESCMID",
          "keyFinding": "Patologia granulomatosa cronica suppurativa non contagiosa che oltrepassa i piani fasciali."
        }
      ]
    }
  },
  {
    "id": "bifidobacterium_bifidum",
    "name": "Bifidobacterium bifidum",
    "genus": "Bifidobacterium",
    "species": "bifidum",
    "aliases": [
      "b. bifidum",
      "bifidobatterio",
      "probiotico neonatale"
    ],
    "taxonomyGroup": "Bacillo Gram+ anaerobio biforcuto a Y",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Bifidobacteriales",
      "family": "Bifidobacteriaceae",
      "genus": "Bifidobacterium",
      "species": "Bifidobacterium bifidum"
    },
    "primaryPlate": {
      "colonyColor": "#f8fafc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce bianco-lucide a crescita anaerobia lenta."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "pleomorphic",
      "gramSummary": "Bacilli Gram+ con caratteristiche biforcazioni terminali ad Y o a V.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Anaerobio obbligato non emolitico; fermenta via fruttosio-6-fosfato fosfochetolasi.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Batterio dominante nel microbiota intestinale dei neonati allattati al seno; sintetizza acido acetico e lattico proteggendo dalla disbiosi enterica.",
      "goldStandard": "Gram (morfologia tipica biforcuta a Y) → Anaerobio stretto → Enzima marcatore fruttosio-6-fosfato fosfochetolasi (F6PPK) positivo.",
      "transmission": "Microbiota fisiologico benefico.",
      "diseases": [
        "Batterio simbiotico non patogeno"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Bifidobacteria and Human Gut Health",
          "citation": "O'Callaghan A, van Sinderen D. Front Microbiol 7:925, 2016.",
          "source": "Frontiers",
          "keyFinding": "Degradazione specializzata degli oligosaccaridi del latte materno (HMO)."
        }
      ]
    }
  },
  {
    "id": "gardnerella_vaginalis",
    "name": "Gardnerella vaginalis",
    "genus": "Gardnerella",
    "species": "vaginalis",
    "aliases": [
      "g. vaginalis",
      "gardnerella",
      "vaginosi batterica",
      "clue cells"
    ],
    "taxonomyGroup": "Coccobacillo Gram-variabile (Bifidobacteriaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Bifidobacteriales",
      "family": "Bifidobacteriaceae",
      "genus": "Gardnerella",
      "species": "Gardnerella vaginalis"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 1.5,
      "texture": "pinpoint",
      "agarTint": null,
      "macroSummary": "Colonie minute traslucide puntiformi con beta-emolisi diffusa su agar sangue umano (V-agar)."
    },
    "microscopy": {
      "gram": "variable",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Piccoli coccobacilli Gram-variabili (spesso Gram-negativi o debolmente positivi) che tappezzano le cellule epiteliali ('clue cells').",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#cbd5e1",
        "note": "Beta-emolisi diffusa su sangue umano (V-agar) ma non su sangue ovino; inibito su MacConkey.",
        "swarming": false,
        "narrowHalo": true,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Vaginosi batterica (BV) con perdita di lattobacilli, leucorrea fluida bianco-grigiastra e test dell'odore al KOH positivo (Whiff test con odore di pesce).",
      "goldStandard": "Esame a fresco / colorazione di Gram: punteggio di Nugent ≥ 7 con presenza patognomonica di 'clue cells' (cellule guida epiteliali cosparse di batteri).",
      "transmission": "Disbiosi endogena del microbiota vaginale.",
      "diseases": [
        "Vaginosi batterica",
        "Complicanze ostetriche (parto pretermine)",
        "Endometrite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Gardnerella vaginalis and Bacterial Vaginosis",
          "citation": "Schwebke JR et al. J Infect Dis 210:338, 2014.",
          "source": "JID",
          "keyFinding": "Vagolisina citolisina colesterolo-dipendente e biofilm multispecie persistente."
        }
      ]
    }
  },
  {
    "id": "streptomyces_griseus",
    "name": "Streptomyces griseus",
    "genus": "Streptomyces",
    "species": "griseus",
    "aliases": [
      "s. griseus",
      "streptomicete",
      "produttore streptomicina"
    ],
    "taxonomyGroup": "Attinomicete filamentoso sporigeno terroso (Streptomycetaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Streptomycetales",
      "family": "Streptomycetaceae",
      "genus": "Streptomyces",
      "species": "Streptomyces griseus"
    },
    "primaryPlate": {
      "colonyColor": "#94a3b8",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 6,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie rugose polverose con micelio aereo gessoso grigio-cenere e forte aroma terroso di geosmina."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "filamentous",
      "arrangement": "filaments",
      "gramSummary": "Ife batteriche Gram+ lunghe, ampiamente ramificate con catene di artrospore a maturità.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "terminal"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#94a3b8",
        "note": "Colonie gessose opache con forte profumo di terra bagnata (geosmina).",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Storico microrganismo del suolo isolato da Selman Waksman, produttore della streptomicina (primo antibiotico anti-TBC, Premio Nobel 1952); non patogeno.",
      "goldStandard": "Morfologia coloniale polverosa con micelio aereo, colorazione di Gram con filamenti ramificati e odore pungente di geosmina.",
      "transmission": "Suolo, compost e polvere tellurica.",
      "diseases": [
        "Organismo industriale non patogeno"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Streptomyces in Nature and Medicine",
          "citation": "Hopwood DA. Oxford University Press, 2007.",
          "source": "Oxford",
          "keyFinding": "Biosintesi di metaboliti secondari bioattivi e catene di sporangiospore aeree."
        }
      ]
    }
  },
  {
    "id": "corynebacterium_diphtheriae",
    "name": "Corynebacterium diphtheriae",
    "genus": "Corynebacterium",
    "species": "diphtheriae",
    "aliases": [
      "c. diphtheriae",
      "bacillo di klebs-loffler",
      "difterite"
    ],
    "taxonomyGroup": "Bacillo Gram+ pleomorfo difterite (Corynebacteriaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Corynebacteriaceae",
      "genus": "Corynebacterium",
      "species": "Corynebacterium diphtheriae"
    },
    "primaryPlate": {
      "colonyColor": "#334155",
      "colonyHighlight": "#64748b",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie convesse grigio-nere con alone bruno su agar selettivo di Tinsdale (riduzione del tellurito)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "pleomorphic",
      "gramSummary": "Bacilli Gram+ a clava/cuneiformi disposti 'a lettere cinesi' con caratteristici granuli metacromatici (Babes-Ernst) al blu di toluidina.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#334155",
        "note": "Colonie nere circondate da alone marrone su agar Tinsdale/tellurito; Loeffler positivo.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente della difterite; la tossina difterica AB (inibitore del fattore di allungamento EF-2) provoca pseudomembrane faringee asfissianti, miocardite e polineuropatia.",
      "goldStandard": "Isolamento di colonie nere su terreno di Tinsdale/tellurito → Ureasi NEGATIVA → Test di tossigenicità di Elek positivo (immunoprecipitazione della tossina).",
      "transmission": "Goccioline respiratorie o contatto con lesioni cutanee difteriche.",
      "diseases": [
        "Difterite faringea con pseudomembrane",
        "Miocardite tossica",
        "Difterite cutanea"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Diphtheria",
          "citation": "Hadfield TL et al. J Clin Microbiol 49:S27, 2011.",
          "source": "JCM",
          "keyFinding": "Conferma della tossinogenicità mediante test di Elek e PCR per subunità A/B della tossina tox."
        }
      ]
    }
  },
  {
    "id": "corynebacterium_jeikeium",
    "name": "Corynebacterium jeikeium",
    "genus": "Corynebacterium",
    "species": "jeikeium",
    "aliases": [
      "c. jeikeium",
      "corynebacterium gruppo jk",
      "difteroide multiresistente"
    ],
    "taxonomyGroup": "Bacillo Gram+ nosocomiale multiresistente (Corynebacteriaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Corynebacteriaceae",
      "genus": "Corynebacterium",
      "species": "Corynebacterium jeikeium"
    },
    "primaryPlate": {
      "colonyColor": "#f1f5f9",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie minute, puntiformi grigio-biancastre a crescita lenta (48-72 ore)."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "pleomorphic",
      "gramSummary": "Piccoli bacilli Gram+ difteroidi clavati in palizzata.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#f1f5f9",
        "note": "Crescita lenta di minute colonie grigie non emolitiche; lipofilo.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Importante patogeno nosocomiale opportunista in pazienti ematologici neutropenici con catetere venoso; multiresistente a tutti gli antibiotici eccetto vancomicina.",
      "goldStandard": "Gram (difteroidi Gram+) → Catalasi (+) → Ureasi (-) → Multiresistenza fenotipica e profilo lipofilo dipendente da lipidi.",
      "transmission": "Contaminazione cateteri vascolari da flora cutanea ospedaliera.",
      "diseases": [
        "Sepsi da catetere in neutropenici",
        "Endocardite su valvola protesica"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Corynebacterium jeikeium Nosocomial Infections",
          "citation": "Riegel P. Clin Microbiol Rev 11:380, 1998.",
          "source": "ASM CMR",
          "keyFinding": "Genoma compatto con determinanti multipli di resistenza antibiotica su plasmide pAP1."
        }
      ]
    }
  },
  {
    "id": "corynebacterium_pseudodiphtheriticum",
    "name": "Corynebacterium pseudodiphtheriticum",
    "genus": "Corynebacterium",
    "species": "pseudodiphtheriticum",
    "aliases": [
      "c. pseudodiphtheriticum",
      "bacillo di hofmann"
    ],
    "taxonomyGroup": "Bacillo Gram+ ureasi-positivo commensale",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Corynebacteriaceae",
      "genus": "Corynebacterium",
      "species": "Corynebacterium pseudodiphtheriticum"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce, convesse, colore bianco-giallastro burroso."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "pleomorphic",
      "gramSummary": "Bacilli Gram+ diritti e regolari con colorazione uniforme privi di granuli metacromatici.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "strong_pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#fef08a",
        "note": "Colonie giallo-crema non emolitiche.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Normale commensale del rinofaringe; causa infezioni respiratorie basse opportunistiche (tracheobronchite, polmonite) in pazienti con BPCO.",
      "goldStandard": "Gram → Catalasi (+) → Ureasi FORTEMENTE POSITIVA (rapido viraggio fucsia, differenziazione immediata da C. diphtheriae).",
      "transmission": "Aspirazione endogena da secrezioni nasofaringee.",
      "diseases": [
        "Bronchite acuta in BPCO",
        "Polmonite nosocomiale opportunistica"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "C. pseudodiphtheriticum Respiratory Infections",
          "citation": "Bittar F et al. Emerg Infect Dis 16:123, 2010.",
          "source": "CDC EID",
          "keyFinding": "Forte attività ureasi e mancata fermentazione del glucosio/maltosio."
        }
      ]
    }
  },
  {
    "id": "corynebacterium_striatum",
    "name": "Corynebacterium striatum",
    "genus": "Corynebacterium",
    "species": "striatum",
    "aliases": [
      "c. striatum",
      "difteroide respiratorio nosocomiale"
    ],
    "taxonomyGroup": "Bacillo Gram+ opportunista polmonare",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Corynebacteriaceae",
      "genus": "Corynebacterium",
      "species": "Corynebacterium striatum"
    },
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie circolari lisce lucide grigiastre o crema chiaro."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "bacilli",
      "arrangement": "pleomorphic",
      "gramSummary": "Bacilli Gram+ pleomorfi striati a palizzata.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "listeria_monocytogenes_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Colonie grigie lucide senza emolisi.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Patogeno nosocomiale emergente in terapia intensiva; responsabile di polmonite associata a ventilazione meccanica (VAP) ed infezioni da catetere.",
      "goldStandard": "Gram → Catalasi (+) → Ureasi (-) → Fermentazione di glucosio e saccarosio positiva, resistenza a fluorochinoloni.",
      "transmission": "Contaminazione crociata ospedaliera e tubi endotracheali.",
      "diseases": [
        "Polmonite associata a ventilatore",
        "Batteriemia da CVC"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Corynebacterium striatum Emerging Outbreaks",
          "citation": "McMullen KM et al. J Clin Microbiol 55:189, 2017.",
          "source": "JCM",
          "keyFinding": "Trasmissione clonale nosocomiale con profilo di multiresistenza emergente."
        }
      ]
    }
  },
  {
    "id": "nocardia_asteroides",
    "name": "Nocardia asteroides",
    "genus": "Nocardia",
    "species": "asteroides",
    "aliases": [
      "n. asteroides",
      "nocardiosi",
      "batterio parzialmente acido resistente"
    ],
    "taxonomyGroup": "Bacillo Gram+ filamentoso parzialmente alcol-acido resistente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Nocardiaceae",
      "genus": "Nocardia",
      "species": "Nocardia asteroides"
    },
    "primaryPlate": {
      "colonyColor": "#fed7aa",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.5,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie corrugate gessose aranciate o giallo-ocra con micelio aereo vellutato bianco e intenso odore terroso."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "filamentous",
      "arrangement": "filaments",
      "gramSummary": "Sottili filamenti Gram+ fittamente ramificati ad angolo retto con perlinatura; parzialmente acido-resistente a Kinyoun modificato.",
      "acidFast": true,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "mycobacterium_tuberculosis_ziehl"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#fed7aa",
        "note": "Colonie gessose aranciate rugose con odore di terra bagnata; aerobio stretto.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Nocardiosi polmonare invasiva cavitaria e disseminazione cerebrale metastatica con ascessi a stampo in immunodepressi (trapiantati, terapia steroidea).",
      "goldStandard": "Filamenti Gram+ ramificati → Colorazione di Kinyoun modificata (decolorazione debole con H2SO4 all'1%) POSITIVA (rosso) → Colonie gessose aranciate.",
      "transmission": "Inalazione di polveri telluriche ambientali.",
      "diseases": [
        "Nocardiosi polmonare cavitaria",
        "Ascesso cerebrale secondario",
        "Nocardiosi cutanea"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Nocardia Infections in Solid Organ Transplantation",
          "citation": "Lebeaux D et al. Am J Transplant 13:209, 2013.",
          "source": "AJT",
          "keyFinding": "Sensibilità elettiva al trimetoprim-sulfametossazolo (TMP-SMX)."
        }
      ]
    }
  },
  {
    "id": "nocardia_brasiliensis",
    "name": "Nocardia brasiliensis",
    "genus": "Nocardia",
    "species": "brasiliensis",
    "aliases": [
      "n. brasiliensis",
      "micetoma actinomicetico",
      "piede di madura"
    ],
    "taxonomyGroup": "Attinomicete parzialmente acido-resistente cutaneo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Nocardiaceae",
      "genus": "Nocardia",
      "species": "Nocardia brasiliensis"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.2,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie rugose crema-giallastre corrugate con debole micelio aereo."
    },
    "microscopy": {
      "gram": "pos",
      "shape": "filamentous",
      "arrangement": "filaments",
      "gramSummary": "Filamenti sottili ramificati parzialmente acido-resistenti.",
      "acidFast": true,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "mycobacterium_tuberculosis_ziehl"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#fef08a",
        "note": "Colonie rugose a crescita lenta tellurica.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa principale di actinomicetoma cutaneo primario (piede di Madura): tumefazione cronica indolente, deformante con tragitti fistolosi ed emissione di granuli biancastri.",
      "goldStandard": "Biopsia/aspirato fistoloso: granuli con filamenti ramificati Kinyoun modificato positivi → Idrolisi della caseina e tirosina positiva.",
      "transmission": "Inoculazione traumatica transcutanea da spine vegetali.",
      "diseases": [
        "Micetoma cutaneo (piede di Madura)",
        "Linfoadenite sporotricoide"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Actinomycetoma: Pathogenesis and Clinical Aspects",
          "citation": "Salinas-Carmona MC. Rev Infect Dis 11:S1438, 1989.",
          "source": "Oxford",
          "keyFinding": "Proteasi tissutali neutre mediatrici dell'invasione ossea e fasciale profonda."
        }
      ]
    }
  },
  {
    "id": "mycobacterium_avium",
    "name": "Mycobacterium avium",
    "genus": "Mycobacterium",
    "species": "avium",
    "aliases": [
      "m. avium",
      "mac",
      "mycobacterium avium complex"
    ],
    "taxonomyGroup": "Bacillo alcol-acido resistente atipico (MAC)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Mycobacteriaceae",
      "genus": "Mycobacterium",
      "species": "Mycobacterium avium"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide non fotocromogene a crescita lenta (2-4 settimane) su Lowenstein-Jensen."
    },
    "microscopy": {
      "gram": "variable",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli sottili uniformi intensamente alcol-acido resistenti alla colorazione di Ziehl-Neelsen.",
      "acidFast": true,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "mycobacterium_tuberculosis_ziehl"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": true,
        "note": "Crescita lenta su Lowenstein-Jensen (2-4 settimane); colonie lisce opaline non fotocromogene (Gruppo III Runyon)."
      }
    },
    "clinical": {
      "overview": "Micobatterio atipico opportunista; causa infezione disseminata sistemica in pazienti con AIDS avanzato (CD4 < 50/µL) e pneumopatia cavitaria cronica in anziani.",
      "goldStandard": "Ziehl-Neelsen POSITIVO (rosso su blu) → Crescita lenta non fotocromogena su Lowenstein-Jensen → Niacina NEGATIVA (differenzia da M. tuberculosis).",
      "transmission": "Ingestione di acqua o inalazione di aerosol ambientale.",
      "diseases": [
        "Infezione disseminata MAC nell'AIDS",
        "Polmonite cavitaria cronica",
        "Sindrome di Lady Windermere"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Mycobacterium avium Complex Infection",
          "citation": "Daley CL et al. Eur Respir J 56:2000535, 2020.",
          "source": "ATS/ERS",
          "keyFinding": "Trattamento cardine combinato con macrolidi (azitromicina/claritromicina), rifampicina ed etambutolo."
        }
      ]
    }
  },
  {
    "id": "mycobacterium_kansasii",
    "name": "Mycobacterium kansasii",
    "genus": "Mycobacterium",
    "species": "kansasii",
    "aliases": [
      "m. kansasii",
      "micobatterio fotocromogeno"
    ],
    "taxonomyGroup": "Bacillo BAAR fotocromogeno (Gruppo I Runyon)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Mycobacteriaceae",
      "genus": "Mycobacterium",
      "species": "Mycobacterium kansasii"
    },
    "primaryPlate": {
      "colonyColor": "#f59e0b",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie inizialmente biancastre che virano ad un vivo e brillante giallo-arancione intenso dopo esposizione alla luce (fotocromogeno)."
    },
    "microscopy": {
      "gram": "variable",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli lunghi e tozzi con tipica striatura zebrata alcol-acido resistenti.",
      "acidFast": true,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "mycobacterium_tuberculosis_ziehl"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": true,
        "note": "Fotocromogeno (Gruppo I Runyon): produce pigmento giallo-arancio vivo dopo esposizione alla luce."
      }
    },
    "clinical": {
      "overview": "Secondo micobatterio non-tubercolare più frequente dopo MAC; causa patologia polmonare fibro-cavitaria cronica indistinguibile dalla tubercolosi classica.",
      "goldStandard": "Ziehl-Neelsen POSITIVO → Coltura su Lowenstein-Jensen con viraggio giallo-arancione alla luce → Catalasi termostabile a 68°C positiva.",
      "transmission": "Aerosol da reti idriche municipali e rubinetti.",
      "diseases": [
        "Pneumopatia cavitaria cronica",
        "Linfoadenite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Mycobacterium kansasii Clinical Spectrum",
          "citation": "Johnston JC et al. Ann Am Thorac Soc 14:141, 2017.",
          "source": "ATS",
          "keyFinding": "Elevata sensibilità alla rifampicina ed esito clinico favorevole rispetto ad altre NTM."
        }
      ]
    }
  },
  {
    "id": "mycobacterium_leprae",
    "name": "Mycobacterium leprae",
    "genus": "Mycobacterium",
    "species": "leprae",
    "aliases": [
      "m. leprae",
      "bacillo di hansen",
      "lebbra"
    ],
    "taxonomyGroup": "Bacillo BAAR intracellulare obbligato non coltivabile",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Actinomycetota",
      "class": "Actinomycetes",
      "order": "Mycobacteriales",
      "family": "Mycobacteriaceae",
      "genus": "Mycobacterium",
      "species": "Mycobacterium leprae"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 0,
      "texture": "none",
      "agarTint": null,
      "macroSummary": "NON COLTIVABILE IN VITRO su alcun terreno sintetico o all'uovo; replicabile solo nel cuscinetto plantare del topo o nell'armadillo."
    },
    "microscopy": {
      "gram": "variable",
      "shape": "bacilli",
      "arrangement": "clusters",
      "gramSummary": "Bacilli alcol-acido resistenti (Ziehl-Neelsen+) raggruppati in grossi ammassi paralleli intracellulari ('globi') all'interno dei macrofagi (cellule di Virchow).",
      "acidFast": true,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "mycobacterium_tuberculosis_ziehl"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": false,
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "NON CRESCE su Lowenstein-Jensen o altri terreni artificiali (parassita intracellulare obbligato)."
      }
    },
    "clinical": {
      "overview": "Agente della lebbra (morbo di Hansen); tropismo selettivo per macrofagi e cellule di Schwann dei nervi periferici cutanei con anestesia, ipopigmentazione e riassorbimento osseo.",
      "goldStandard": "Biopsia cutanea con colorazione acido-resistente di Fite-Faraco (evidenziazione dei bacilli in globi nelle cellule di Virchow) e test PCR; totale assenza di crescita su terreni colturali.",
      "transmission": "Contatto stretto e prolungato con goccioline nasali di pazienti con lebbra lepromatosa non trattata.",
      "diseases": [
        "Lebbra lepromatosa sistemica",
        "Lebbra tubercoloide paucibacillare",
        "Neuropatia periferica mutilante"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Leprosy: Pathogenesis and Clinical Forms",
          "citation": "Scollard DM et al. Clin Microbiol Rev 19:338, 2006.",
          "source": "ASM CMR",
          "keyFinding": "Degenerazione genomica massiva con oltre 1100 pseudogeni che ne spiega l'intracellularità obbligata."
        }
      ]
    }
  },
  {
    "id": "klebsiella_oxytoca",
    "name": "Klebsiella oxytoca",
    "genus": "Klebsiella",
    "species": "oxytoca",
    "aliases": [
      "k. oxytoca",
      "klebsiella indolo positiva",
      "colite da ampicillina"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico iper-mucoso (Indolo +)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Klebsiella",
      "species": "Klebsiella oxytoca"
    },
    "primaryPlate": {
      "colonyColor": "#fbcfe8",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4.8,
      "texture": "mucoid",
      "agarTint": null,
      "macroSummary": "Grandi colonie a cupola estremamente mucoidi, viscose, rosa brillante su MacConkey."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- tozzi circondati da un cospicuo alone capsulare negativo all'inchiostro di China.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "klebsiella_pneumoniae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#fbcfe8",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "mucoid_pink",
        "note": "Colonie rosa grandi iper-mucoidi (lattosio +)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa colite emorragica associata ad antibiotici (per produzione dell'enterotossina citotossica tilivallina), polmoniti e sepsi nosocomiale; simile a K. pneumoniae ma INDOLO POSITIVO.",
      "goldStandard": "Gram (bacilli Gram- capsulati) → Ossidasi (-) → MacConkey rosa mucoide → Reattivo di Kovacs: INDOLO POSITIVO (differenzia da K. pneumoniae che è indolo -).",
      "transmission": "Flora enterica opportunistica e contaminazione ospedaliera.",
      "diseases": [
        "Colite emorragica post-antibiotica",
        "Infezione urinaria complicata",
        "Sepsi"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Klebsiella oxytoca and Antibiotic-Associated Hemorrhagic Colitis",
          "citation": "Hogenauer C et al. N Engl J Med 355:2418, 2006.",
          "source": "NEJM",
          "keyFinding": "Secrezione della tossina tilivallina che induce apoptosi epiteliale colica."
        }
      ]
    }
  },
  {
    "id": "klebsiella_aerogenes",
    "name": "Klebsiella aerogenes",
    "genus": "Klebsiella",
    "species": "aerogenes",
    "aliases": [
      "k. aerogenes",
      "enterobacter aerogenes"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico mobile (Enterobacteriaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Klebsiella",
      "species": "Klebsiella aerogenes"
    },
    "primaryPlate": {
      "colonyColor": "#f472b6",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce, convesse, rosa acceso su MacConkey da attiva fermentazione del lattosio."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili con flagelli peritrichi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "escherichia_coli_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "strong",
        "note": "Colonie rosa lattosio-positive; mobile."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#d946ef",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Importante patogeno nosocomiale di terapia intensiva; produttore di beta-lattamasi inducibili AmpC e carbapenemasi; a differenza delle altre Klebsiella è MOBILE.",
      "goldStandard": "Gram → Ossidasi (-) → MacConkey rosa lattosio (+) → Mobile alla goccia pendente, ornitina decarbossilasi (+) e citrato (+).",
      "transmission": "Infezione incrociata ospedaliera e cateterismo.",
      "diseases": [
        "Polmonite nosocomiale",
        "Infezione delle vie urinarie",
        "Batteriemia da CVC"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Klebsiella aerogenes: Taxonomy and Clinical Significance",
          "citation": "Tindall BJ et al. Int J Syst Evol Microbiol 67:5028, 2017.",
          "source": "IJSEM",
          "keyFinding": "Riassegnazione filogenetica dal genere Enterobacter al genere Klebsiella basata su sequenziamento genomico."
        }
      ]
    }
  },
  {
    "id": "enterobacter_cloacae",
    "name": "Enterobacter cloacae",
    "genus": "Enterobacter",
    "species": "cloacae",
    "aliases": [
      "e. cloacae",
      "enterobacter complesso cloacae",
      "iperproduttore ampc"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico AmpC-inducibile (Enterobacteriaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Enterobacter",
      "species": "Enterobacter cloacae"
    },
    "primaryPlate": {
      "colonyColor": "#f472b6",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce circolari rosa vivo su MacConkey (lattosio positivo)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili con flagelli peritrichi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "escherichia_coli_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f1f5f9",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "strong",
        "note": "Lattosio positivo, colonie convesse."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#d946ef",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Membro cardine del gruppo di patogeni nosocomiali 'SPACE'; esprime beta-lattamasi cefalosporinasi AmpC che si dereprime durante terapia con cefalosporine di 3a generazione.",
      "goldStandard": "Gram → Ossidasi (-) → MacConkey rosa → Mobile, Indolo (-), Citrato (+), lisina decarbossilasi (-), ornitina (+).",
      "transmission": "Ambiente ospedaliero e colonizzazione gastrointestinale.",
      "diseases": [
        "Batteriemia da catetere vascolare",
        "Polmonite da ventilatore",
        "Infezioni ferita chirurgica"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Enterobacter cloacae Complex: Clinical and Molecular Biology",
          "citation": "Davin-Regli A, Pages JM. Clin Microbiol Rev 28:510, 2015.",
          "source": "ASM CMR",
          "keyFinding": "Regolazione del gene ampC mediata da ampR e derepressione mutazionale sotto pressione antibiotica."
        }
      ]
    }
  },
  {
    "id": "citrobacter_freundii",
    "name": "Citrobacter freundii",
    "genus": "Citrobacter",
    "species": "freundii",
    "aliases": [
      "c. freundii",
      "citrobacter h2s positivo"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico H2S-positivo (Enterobacteriaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Citrobacter",
      "species": "Citrobacter freundii"
    },
    "primaryPlate": {
      "colonyColor": "#f87171",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce rosa chiaro o incolori su MacConkey; rosse con centro nero su XLD (produce H2S mimando Salmonella)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "salmonella_enterica_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "late",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_black",
        "h2s": true,
        "note": "Produce H2S (centro nero su XLD) mimando Salmonella; idrolizza il citrato e fermenta tardivamente il lattosio."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Opportunista ospedaliero di vie biliari e urinarie; produce H2S mimando Salmonella sui terreni differenziali per coprocoltura.",
      "goldStandard": "Gram → Ossidasi (-) → XLD centro nero (H2S+) → Citrato (+) e Ureasi (+) (differenzia da Salmonella che è ureasi - e ONPG -).",
      "transmission": "Endogena intestinale e ospedaliera.",
      "diseases": [
        "Infezioni delle vie biliari (colangite)",
        "UTI nosocomiali",
        "Sepsi"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Citrobacter freundii: Virulence and Drug Resistance",
          "citation": "Ranjbar R et al. Microb Pathog 107:225, 2017.",
          "source": "Elsevier",
          "keyFinding": "Capacità di simulare Salmonella nei profili di fermentazione enterica con espressione di AmpC."
        }
      ]
    }
  },
  {
    "id": "citrobacter_koseri",
    "name": "Citrobacter koseri",
    "genus": "Citrobacter",
    "species": "koseri",
    "aliases": [
      "c. koseri",
      "citrobacter diversus",
      "ascesso cerebrale neonatale"
    ],
    "taxonomyGroup": "Bacillo Gram- neurotropo neonatale (Indolo +)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Citrobacter",
      "species": "Citrobacter koseri"
    },
    "primaryPlate": {
      "colonyColor": "#f87171",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce grigio-rosate su MacConkey; colonie rosse SENZA nero su XLD (H2S negativo)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "escherichia_coli_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "late",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "H2S negativo (differenzia da C. freundii)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Tristemente noto per causare meningiti neonatali devastanti con formazione di ascessi cerebrali multipli necrotizzanti (mortalità >30% e sequele neurologiche gravi).",
      "goldStandard": "Gram → Ossidasi (-) → Indolo POSITIVO e H2S NEGATIVO (differenziazione netta da C. freundii che è indolo - e H2S +).",
      "transmission": "Verticale materna o epidemie nosocomiali in terapia intensiva neonatale.",
      "diseases": [
        "Meningite neonatale",
        "Ascessi cerebrali necrotizzanti nel neonato"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Citrobacter koseri Brain Abscesses in Neonates",
          "citation": "Dorris S et al. Pediatr Neurol 27:396, 2002.",
          "source": "Elsevier",
          "keyFinding": "Tropismo peculiare per l'endotelio microvascolare della sostanza bianca cerebrale neonatale."
        }
      ]
    }
  },
  {
    "id": "proteus_vulgaris",
    "name": "Proteus vulgaris",
    "genus": "Proteus",
    "species": "vulgaris",
    "aliases": [
      "p. vulgaris",
      "proteo indolo positivo"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico con swarming (Indolo +)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Morganellaceae",
      "genus": "Proteus",
      "species": "Proteus vulgaris"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 6,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Tipico fenomeno dello sciame (swarming) ad anelli concentrici su agar sangue con penetrante odore ammoniacale/pesce."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- pleomorfi allungati iper-flagellati durante la migrazione a sciame.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "swarming",
      "micrographKey": "proteus_mirabilis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "strong_pos",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Swarming concentrico massivo a onde successive.",
        "swarming": true,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_black",
        "h2s": true,
        "note": "Colonie rosse con centro nero (H2S +)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": true
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Ureasi fulminea (+++), H2S (+) e swarming concentrico; a differenza di P. mirabilis è INDOLO POSITIVO ed intrinsecamente resistente all'ampicillina.",
      "goldStandard": "Gram → Ossidasi (-) → Swarming su agar sangue + Ureasi fulminea fucsia + Reattivo di Kovacs: INDOLO POSITIVO (differenziazione cardine da P. mirabilis).",
      "transmission": "Flora commensale gastrointestinale opportunistica.",
      "diseases": [
        "Infezioni complicate vie urinarie",
        "Calcoli di struvite",
        "Infezioni ferite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Differentiation of Proteus Species",
          "citation": "O'Hara CM et al. Clin Microbiol Rev 13:534, 2000.",
          "source": "ASM CMR",
          "keyFinding": "Indolo positivo e resistenza intrinseca ad ampicillina e cefazolina via cefalosporinasi."
        }
      ]
    }
  },
  {
    "id": "morganella_morganii",
    "name": "Morganella morganii",
    "genus": "Morganella",
    "species": "morganii",
    "aliases": [
      "m. morganii",
      "morganella"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico deaminasi-positivo (Morganellaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Morganellaceae",
      "genus": "Morganella",
      "species": "Morganella morganii"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce grigiastre convesse; NON produce swarming (a differenza di Proteus)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili con flagelli peritrichi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "proteus_mirabilis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Lattosio negativo, H2S negativo, niente swarming."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa infezioni urinarie post-cateterismo, infezioni di ferite chirurgiche e sepsi nosocomiale; possiede fenilalanina deaminasi e potente ureasi.",
      "goldStandard": "Gram → Ossidasi (-) → Assenza di swarming su agar sangue + Fenilalanina deaminasi (+) + Ureasi (+) + Indolo (+).",
      "transmission": "Tratto intestinale umano e ambiente ospedaliero.",
      "diseases": [
        "Infezioni nosocomiali vie urinarie",
        "Infezioni ferite chirurgiche",
        "Batteriemia"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Morganella morganii: Clinical and Microbiological Overview",
          "citation": "Liu H et al. Int J Infect Dis 50:10, 2016.",
          "source": "IJID",
          "keyFinding": "AmpC inducibile cromosomica e deaminazione ossidativa degli amminoacidi."
        }
      ]
    }
  },
  {
    "id": "providencia_stuartii",
    "name": "Providencia stuartii",
    "genus": "Providencia",
    "species": "stuartii",
    "aliases": [
      "p. stuartii",
      "providencia",
      "sindrome della sacca urinaria viola"
    ],
    "taxonomyGroup": "Bacillo Gram- nosocomiale multiresistente (Morganellaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Morganellaceae",
      "genus": "Providencia",
      "species": "Providencia stuartii"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce incolori o grigiastre; assenza di swarming."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "proteus_mirabilis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Principale patogeno urinario in pazienti portatori cronici di catetere a lungo termine (spesso causa della 'sindrome della sacca urinaria viola' per produzione di indirubina/indaco).",
      "goldStandard": "Gram → Ossidasi (-) → Indolo (+) → Fenilalanina deaminasi (+) → Citrato (+) e Ureasi negativa/debole.",
      "transmission": "Contaminazione cateteri a permanenza e degenza protratta.",
      "diseases": [
        "Catheter-associated UTI cronica",
        "Sindrome della sacca urinaria viola",
        "Sepsi"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Purple Urine Bag Syndrome and Providencia",
          "citation": "Dealler SF et al. Clin Microbiol Rev 4:182, 1991.",
          "source": "ASM CMR",
          "keyFinding": "Solfatasi e fosfatasi batteriche agenti sull'indicano urinario rilasciando indaco e indirubina."
        }
      ]
    }
  },
  {
    "id": "providencia_rettgeri",
    "name": "Providencia rettgeri",
    "genus": "Providencia",
    "species": "rettgeri",
    "aliases": [
      "p. rettgeri",
      "providencia ureasi positiva"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico ureasi-positivo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Morganellaceae",
      "genus": "Providencia",
      "species": "Providencia rettgeri"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide incolori su MacConkey."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "proteus_mirabilis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Patogeno nosocomiale opportunista di vie urinarie ed emocolture; si differenzia da P. stuartii per l'idrolisi attiva dell'urea (ureasi positiva).",
      "goldStandard": "Gram → Ossidasi (-) → Indolo (+) + Fenilalanina deaminasi (+) + Ureasi POSITIVA (differenzia da P. stuartii).",
      "transmission": "Contaminazione cateteri e trasmissione crociata.",
      "diseases": [
        "Infezioni urinarie nosocomiali",
        "Batteriemia"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Providencia rettgeri Outbreaks",
          "citation": "Tada T et al. Antimicrob Agents Chemother 58:6327, 2014.",
          "source": "AAC",
          "keyFinding": "Diffusione di metallo-beta-lattamasi NDM-1 su plasmidi coniugativi."
        }
      ]
    }
  },
  {
    "id": "serratia_liquefaciens",
    "name": "Serratia liquefaciens",
    "genus": "Serratia",
    "species": "liquefaciens",
    "aliases": [
      "s. liquefaciens",
      "serratia non pigmentata"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico gelatinasi-positivo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Yersiniaceae",
      "genus": "Serratia",
      "species": "Serratia liquefaciens"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce circolari bianco-grigiastre; NON produce pigmento rosso prodigiosina."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "serratia_marcescens_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Serratia priva del tipico pigmento rosso; liquefà attivamente la gelatina; associata a contaminazione di sacche di emazie per trasfusione conservate a freddo.",
      "goldStandard": "Gram → Ossidasi (-) → Assenza di prodigiosina → DNasi (+), gelatinasi rapida (+) e fermentazione dell'arabinosio positiva.",
      "transmission": "Contaminazione di fluidi ospedalieri, lenti a contatto e sacche di sangue.",
      "diseases": [
        "Shock trasfusionale acuto settico",
        "Cheratite da lenti",
        "Sepsi nosocomiale"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Serratia liquefaciens Transfusion Sepsis",
          "citation": "Roth VR et al. Transfusion 40:931, 2000.",
          "source": "Wiley",
          "keyFinding": "Replicazione attiva alle temperature di refrigerazione (+4°C) con rilascio di endotossina."
        }
      ]
    }
  },
  {
    "id": "yersinia_enterocolitica",
    "name": "Yersinia enterocolitica",
    "genus": "Yersinia",
    "species": "enterocolitica",
    "aliases": [
      "y. enterocolitica",
      "pseudoappendicite",
      "occhio di bue CIN"
    ],
    "taxonomyGroup": "Coccobacillo Gram- termo-mobile (Yersiniaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Yersiniaceae",
      "genus": "Yersinia",
      "species": "Yersinia enterocolitica"
    },
    "primaryPlate": {
      "colonyColor": "#f43f5e",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Caratteristiche colonie a 'occhio di bue' (bull's eye) con centro rosso scuro e bordo periferico traslucido su agar selettivo CIN."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Piccoli coccobacilli Gram- con motilità termo-dipendente: MOBILI a 22-25°C, IMMOBILI a 37°C.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "tumbling",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie a occhio di bue su agar CIN; ureasi positiva."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Gastroenterite ed ileite terminale con linfoadenite mesenterica acuta che mima perfettamente l'appendicite acuta ('pseudoappendicite') nei giovani; consumo di carne di maiale cruda o poco cotta.",
      "goldStandard": "Colonie tipiche a occhio di bue su agar selettivo CIN → Ureasi POSITIVA → Test di motilità termo-differenziale: mobile a 25°C e immobile a 37°C.",
      "transmission": "Consumo di carne suina poco cotta o latte crudo; arricchimento a freddo a 4°C.",
      "diseases": [
        "Pseudoappendicite (adenite mesenterica)",
        "Enterocolite infettiva",
        "Eritema nodoso reattivo"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Yersinia enterocolitica: An Overview",
          "citation": "Bottone EJ. Clin Microbiol Rev 10:268, 1997.",
          "source": "ASM CMR",
          "keyFinding": "Proteine effettrici Yop iniettate mediante sistema di secrezione di tipo III (T3SS)."
        }
      ]
    }
  },
  {
    "id": "yersinia_pestis",
    "name": "Yersinia pestis",
    "genus": "Yersinia",
    "species": "pestis",
    "aliases": [
      "y. pestis",
      "peste",
      "morte nera",
      "bacillo della peste"
    ],
    "taxonomyGroup": "Coccobacillo Gram- a colorazione bipolare (BSL-3)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Yersiniaceae",
      "genus": "Yersinia",
      "species": "Yersinia pestis"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie piccole 'a uovo fritto' con centro rilevato e margini traslucidi merlettati."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Coccobacilli Gram- con tipica e patognomonica colorazione bipolare a 'spilla di sicurezza' (safety-pin) con Giemsa o colorazione di Wayson; immobile sia a 25°C che a 37°C.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente della peste bubbonica (linfonodo tumefatto 'bubbone'), setticemica e polmonare primaria ('Morte Nera'); trasmesso dalla pulce del ratto (Xenopsylla cheopis); agente di bioterrorismo di classe A (BSL-3).",
      "goldStandard": "Striscio di aspirato bubbonico: colorazione Wayson con coccobacilli bipolari a spilla di sicurezza → Ureasi NEGATIVA (differenzia da altre Yersinia) e IMMOBILITÀ sia a 25°C che a 37°C.",
      "transmission": "Puntura di pulce del ratto infetta (bubbonica) o inalazione di droplet respiratori (peste polmonare).",
      "diseases": [
        "Peste bubbonica",
        "Peste polmonare letale",
        "Peste setticemica con gangrena acrale"
      ],
      "safetyLevel": "BSL-3",
      "literature": [
        {
          "title": "Yersinia pestis: Etiology of Plague",
          "citation": "Perry RD, Fetherston JD. Clin Microbiol Rev 10:35, 1997.",
          "source": "ASM CMR",
          "keyFinding": "Antigene capsulare F1 antifagocitario e plasminogeno-attivatore Pla mediatore della disseminazione sistemica."
        }
      ]
    }
  },
  {
    "id": "yersinia_pseudotuberculosis",
    "name": "Yersinia pseudotuberculosis",
    "genus": "Yersinia",
    "species": "pseudotuberculosis",
    "aliases": [
      "y. pseudotuberculosis",
      "pseudotubercolosi mesenterica"
    ],
    "taxonomyGroup": "Coccobacillo Gram- zoonotico ureasi-positivo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Yersiniaceae",
      "genus": "Yersinia",
      "species": "Yersinia pseudotuberculosis"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide intere."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Coccobacilli Gram- pleomorfi mobili a 25°C e immobili a 37°C.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "tumbling",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Zoonosi di roditori e uccelli; causa linfoadenite mesenterica acuta necrotizzante e febbre da scarlattina dell'Estremo Oriente (tossina YPM).",
      "goldStandard": "Gram → Ossidasi (-) → Ureasi POSITIVA (differenzia da Y. pestis che è ureasi -) e mobile a 25°C.",
      "transmission": "Ingestione di cibo o acqua contaminati da escrementi di roditori.",
      "diseases": [
        "Linfoadenite mesenterica",
        "Febbre scarlattiniforme dell'Estremo Oriente"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Yersinia pseudotuberculosis Pathogenesis",
          "citation": "Viboud GI, Bliska JB. Annu Rev Microbiol 59:69, 2005.",
          "source": "Ann Rev",
          "keyFinding": "Superantigene YPM (Y. pseudotuberculosis-derived mitogen) e geni Yop."
        }
      ]
    }
  },
  {
    "id": "salmonella_bongori",
    "name": "Salmonella bongori",
    "genus": "Salmonella",
    "species": "bongori",
    "aliases": [
      "s. bongori",
      "salmonella specie V",
      "salmonella dei rettili"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico H2S-positivo dei rettili",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Salmonella",
      "species": "Salmonella bongori"
    },
    "primaryPlate": {
      "colonyColor": "#f87171",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide incolori su MacConkey; colonie rosse con centro nero su XLD (H2S +)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili con flagelli peritrichi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "salmonella_enterica_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_black",
        "h2s": true,
        "note": "Centro nero da H2S; positiva al test ONPG (a differenza della maggior parte di S. enterica)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Specie distinta da S. enterica; associata endemicamente a rettili e anfibi poichilotermi; rara causa di enterite nell'uomo post-contatto con terrari.",
      "goldStandard": "Gram → Ossidasi (-) → XLD centro nero (H2S+) → Ureasi (-) e ONPG POSITIVO (caratteristica specifica di S. bongori).",
      "transmission": "Contatto diretto con rettili domestici (tartarughe, serpenti, iguane).",
      "diseases": [
        "Gastroenterite acuta da rettili"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Salmonella bongori: An Overview",
          "citation": "Fookes M et al. PLoS Pathog 7:e1002191, 2011.",
          "source": "PLoS",
          "keyFinding": "Isola di patogenicità ancestrale SPI-1 priva dell'isola SPI-2 di S. enterica."
        }
      ]
    }
  },
  {
    "id": "shigella_sonnei",
    "name": "Shigella sonnei",
    "genus": "Shigella",
    "species": "sonnei",
    "aliases": [
      "s. sonnei",
      "shigella gruppo d",
      "dissenteria da asilo"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico ONPG-positivo (Gruppo D)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Shigella",
      "species": "Shigella sonnei"
    },
    "primaryPlate": {
      "colonyColor": "#f87171",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide incolori su MacConkey che virano tardivamente (dopo 48 ore) a rosa tenue (fermentatore tardivo del lattosio)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti totalmente immobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "late",
        "note": "Fermentatore tardivo del lattosio (rosa pallido a 48h)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Shigella di Gruppo D, la specie nettamente più frequente nei paesi industrializzati; causa frequenti focolai di dissenteria in asili e scuole primarie.",
      "goldStandard": "Gram → Ossidasi (-) → Totalmente immobile alla goccia pendente → XLD colonie rosse SENZA H2S → ONPG POSITIVO e ornitina decarbossilasi (+) (differenzia da S. flexneri).",
      "transmission": "Feco-orale diretta tra bambini per bassissima dose infettante (10-100 bacilli).",
      "diseases": [
        "Shigellosi / dissenteria bacillare lieve-moderata"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Global Shigella sonnei Lineages",
          "citation": "Holt KE et al. Nat Genet 44:1056, 2012.",
          "source": "Nature",
          "keyFinding": "Espansione clonale globale associata ad acquisizione di resistenze antibiotiche."
        }
      ]
    }
  },
  {
    "id": "shigella_dysenteriae",
    "name": "Shigella dysenteriae",
    "genus": "Shigella",
    "species": "dysenteriae",
    "aliases": [
      "s. dysenteriae",
      "shigella gruppo a",
      "bacillo di shiga",
      "dissenteria epidemica"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico Shiga-tossigeno (Gruppo A)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Shigella",
      "species": "Shigella dysenteriae"
    },
    "primaryPlate": {
      "colonyColor": "#f87171",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce incolori traslucide su MacConkey (lattosio negativo costante)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti rigidamente immobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Shigella di Gruppo A sierotipo 1; esprime la Shiga tossina potente (Stx1); causa le forme più devastanti ed epidemiche di dissenteria bacillare con colite ulceronecrotica e sindrome emolitico-uremica (SEU).",
      "goldStandard": "Gram → Ossidasi (-) → Totalmente immobile → Catalasi NEGATIVA (nel sierotipo 1), mannitolo NEGATIVO e ONPG (-) con sierotipizzazione specifica Lancefield Gruppo A.",
      "transmission": "Feco-orale per veicoli idrici contaminati durante guerre o disastri umanitari.",
      "diseases": [
        "Dissenteria bacillare epidemica grave",
        "Sindrome emolitico-uremica (SEU)",
        "Megacolon tossico"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Shiga Toxins in Shigella dysenteriae",
          "citation": "Melton-Celsa AR. Microbiol Spectr 2:EI10, 2014.",
          "source": "ASM",
          "keyFinding": "Inibizione enzimatica della sintesi proteica mediante depurinazione del 28S rRNA."
        }
      ]
    }
  },
  {
    "id": "edwardsiella_tarda",
    "name": "Edwardsiella tarda",
    "genus": "Edwardsiella",
    "species": "tarda",
    "aliases": [
      "e. tarda",
      "edwardsiellosi",
      "zoonosi acquatica"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico H2S ed Indolo positivo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Hafniaceae",
      "genus": "Edwardsiella",
      "species": "Edwardsiella tarda"
    },
    "primaryPlate": {
      "colonyColor": "#f87171",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie incolori su MacConkey; colonie con centro nero su XLD (H2S positivo)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili con flagelli peritrichi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "salmonella_enterica_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_black",
        "h2s": true,
        "note": "Colonie rosse con centro nero (H2S +)."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Zoonosi associata all'ambiente acquatico, pesci e rettili; provoca infezioni necrotizzanti da ferita e batteriemie invasive con gastroenterite in epatopatici.",
      "goldStandard": "Gram → Ossidasi (-) → XLD centro nero (H2S+) → Indolo POSITIVO (differenzia nettamente da Salmonella che è indolo -).",
      "transmission": "Contatto con pesci, ami da pesca o acqua dolce contaminata.",
      "diseases": [
        "Infezioni necrotizzanti di ferite acquatiche",
        "Batteriemia invasiva",
        "Gastroenterite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Edwardsiella tarda: Virulence Mechanisms",
          "citation": "Leung KY et al. FEMS Microbiol Rev 36:558, 2012.",
          "source": "FEMS",
          "keyFinding": "Sistemi T3SS e T6SS necessari per la sopravvivenza intramacrofagica."
        }
      ]
    }
  },
  {
    "id": "hafnia_alvei",
    "name": "Hafnia alvei",
    "genus": "Hafnia",
    "species": "alvei",
    "aliases": [
      "h. alvei",
      "hafnia"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico mobile (Hafniaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Hafniaceae",
      "genus": "Hafnia",
      "species": "Hafnia alvei"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide incolori su MacConkey."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili con motilità più vivace a 25°C.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "escherichia_coli_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": true,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Colonie rosse senza H2S."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Enterobatterio isolato da prodotti caseari e carni; opportunista causa di infezioni urinarie, biliari e polmoniti nosocomiali.",
      "goldStandard": "Gram → Ossidasi (-) → MacConkey incoloro → Citrato (-), Ureasi (-) e lisina decarbossilasi (+).",
      "transmission": "Alimenti contaminati e flora commensale.",
      "diseases": [
        "Infezioni nosocomiali respiratorie",
        "UTI"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Hafnia alvei: Human Pathogen or Commensal?",
          "citation": "Janda JM, Abbott SL. J Clin Microbiol 44:2725, 2006.",
          "source": "JCM",
          "keyFinding": "Espressione del gene eae intimina-simile in alcuni ceppi diarroici."
        }
      ]
    }
  },
  {
    "id": "cronobacter_sakazakii",
    "name": "Cronobacter sakazakii",
    "genus": "Cronobacter",
    "species": "sakazakii",
    "aliases": [
      "c. sakazakii",
      "enterobacter sakazakii",
      "latte in polvere contaminato"
    ],
    "taxonomyGroup": "Bacillo Gram- enterico termotollerante pigmentato",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Enterobacterales",
      "family": "Enterobacteriaceae",
      "genus": "Cronobacter",
      "species": "Cronobacter sakazakii"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce circolari che sviluppano un caratteristico pigmento giallo vivo se incubate a 25°C."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "peritrichous",
      "micrographKey": "escherichia_coli_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "gamma",
        "colonyColor": "#fef08a",
        "note": "Colonie pigmentate in giallo a temperatura ambiente.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "strong",
        "note": "Crescita con colonie rosa da fermentazione del lattosio."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#d946ef",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Patogeno gravissimo associato alla contaminazione di formule di latte in polvere per lattanti; provoca meningite neonatale emorragica con ascessi cerebrali ed enterocolite necrotizzante (NEC) nei prematuri.",
      "goldStandard": "Gram → Ossidasi (-) → Colonie con pigmento giallo carotenoide a 25°C → Alfa-glucosidasi POSITIVA (differenziazione chiave da Enterobacter cloacae).",
      "transmission": "Consumo di latte artificiale in polvere ricostituito a temperature inadeguate (<70°C).",
      "diseases": [
        "Meningite neonatale emorragica",
        "Enterocolite necrotizzante (NEC)",
        "Ascessi cerebrali neonatali"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Cronobacter Species: Contaminants in Infant Formula",
          "citation": "Forsythe SJ. Curr Opin Food Sci 8:69, 2016.",
          "source": "Elsevier",
          "keyFinding": "Eccezionale resistenza all'essiccamento mediata dalla biosintesi di capsule e trealosio."
        }
      ]
    }
  },
  {
    "id": "pseudomonas_putida",
    "name": "Pseudomonas putida",
    "genus": "Pseudomonas",
    "species": "putida",
    "aliases": [
      "p. putida",
      "pseudomonas fluorescente non liquefacente"
    ],
    "taxonomyGroup": "Bacillo Gram- non-fermentante fluorescente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pseudomonadales",
      "family": "Pseudomonadaceae",
      "genus": "Pseudomonas",
      "species": "Pseudomonas putida"
    },
    "primaryPlate": {
      "colonyColor": "#a7f3d0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.4,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide che rilasciano un pigmento diffusibile giallo-verde fluorescente (pioverdina) sotto luce UV a 365 nm."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili con uno o più flagelli polari.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "pseudomonas_aeruginosa_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#a7f3d0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": true,
        "note": "Produce pioverdina ma NON piocianina blu; non cresce a 42°C (differenzia da P. aeruginosa)."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Opportunista ambientale; produce pioverdina fluorescente ma non la piocianina blu; non liquefà la gelatina e non cresce a 42°C (differenziazione netta da P. aeruginosa).",
      "goldStandard": "Gram → Ossidasi (+) → Aerobio stretto → Mancata liquefazione della gelatina e mancata crescita a 42°C.",
      "transmission": "Ambiente idrico, soluzioni disinfettanti contaminate.",
      "diseases": [
        "Batteriemia da catetere",
        "Infezioni del tratto urinario in ospedalizzati"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Pseudomonas putida: Environmental and Clinical Aspects",
          "citation": "Fernandez M et al. Environ Microbiol 14:2, 2012.",
          "source": "Wiley",
          "keyFinding": "Vie metaboliche per la degradazione di composti aromatici e tolleranza ai solventi organici."
        }
      ]
    }
  },
  {
    "id": "pseudomonas_fluorescens",
    "name": "Pseudomonas fluorescens",
    "genus": "Pseudomonas",
    "species": "fluorescens",
    "aliases": [
      "p. fluorescens",
      "pseudomonas psicrofilo trasfusionale"
    ],
    "taxonomyGroup": "Bacillo Gram- psicrofilo emotrasfusionale",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pseudomonadales",
      "family": "Pseudomonadaceae",
      "genus": "Pseudomonas",
      "species": "Pseudomonas fluorescens"
    },
    "primaryPlate": {
      "colonyColor": "#a7f3d0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide con pigmento pioverdina giallo-verde fluorescente a 4°C."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili con flagelli polari.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "pseudomonas_aeruginosa_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#a7f3d0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": true,
        "note": "Cresce attivamente a +4°C (psicrofilo); liquefà la gelatina."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Batterio psicrotrofo capace di replicare nei frigoriferi emoteca a 4°C; causa storica di shock endotossico trasfusionale acuto fulminante da sacche di globuli rossi conservate a freddo.",
      "goldStandard": "Gram → Ossidasi (+) → Crescita a 4°C (+), mancata crescita a 42°C (-) e liquefazione della gelatina POSITIVA (differenzia da P. putida).",
      "transmission": "Contaminazione di sacche di sangue trasfusionale.",
      "diseases": [
        "Shock trasfusionale settico letale"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Transfusion-Transmitted Pseudomonas fluorescens Sepsis",
          "citation": "Puckett TE et al. Transfusion 32:83, 1992.",
          "source": "Wiley",
          "keyFinding": "Replicazione esponenziale a temperatura di refrigerazione con liberazione massiva di lipopolisaccaride pirogeno."
        }
      ]
    }
  },
  {
    "id": "acinetobacter_baumannii",
    "name": "Acinetobacter baumannii",
    "genus": "Acinetobacter",
    "species": "baumannii",
    "aliases": [
      "a. baumannii",
      "crab",
      "acinetobacter resistente ai carbapenemi"
    ],
    "taxonomyGroup": "Coccobacillo Gram- nosocomiale CRAB (Moraxellaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pseudomonadales",
      "family": "Moraxellaceae",
      "genus": "Acinetobacter",
      "species": "Acinetobacter baumannii"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie convesse, lisce, opache, grigio-biancastre; su MacConkey assumono una tenue sfumatura lavanda/rosa pallido."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "pairs",
      "gramSummary": "Coccobacilli Gram- tozzi appaiati a diplobacillo; rigidamente immobili (privi di flagelli).",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "neisseria_meningitidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/lavanda lattosio-negative; cresce a 44°C."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Superbatterio nosocomiale critico OMS (ceppi CRAB resistenti ai carbapenemi e pandrug-resistant); causa polmoniti associate a ventilazione meccanica (VAP) e sepsi in terapia intensiva; resiste all'essiccamento sulle superfici per mesi.",
      "goldStandard": "Gram (coccobacilli tozzi in coppie) → Ossidasi NEGATIVA (differenzia da Pseudomonas e Moraxella) → Aerobio stretto, immobile, ossida il glucosio ed è capace di crescere a 44°C.",
      "transmission": "Superfici ospedaliere, ventilatori meccanici e mani del personale.",
      "diseases": [
        "Polmonite associata a ventilatore (VAP)",
        "Sepsi nosocomiale da catetere",
        "Infezioni ferite traumatiche"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Acinetobacter baumannii: Emergence of a Successful Pathogen",
          "citation": "Peleg AY et al. Clin Microbiol Rev 21:538, 2008.",
          "source": "ASM CMR",
          "keyFinding": "Carbapenemasi OXA-23, OXA-51-like e metallo-beta-lattamasi associate a pompe di efflusso AdeABC."
        }
      ]
    }
  },
  {
    "id": "acinetobacter_lwoffii",
    "name": "Acinetobacter lwoffii",
    "genus": "Acinetobacter",
    "species": "lwoffii",
    "aliases": [
      "a. lwoffii",
      "acinetobacter asaccaridico"
    ],
    "taxonomyGroup": "Coccobacillo Gram- asaccaridico commensale",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pseudomonadales",
      "family": "Moraxellaceae",
      "genus": "Acinetobacter",
      "species": "Acinetobacter lwoffii"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole circolari lisce incolori."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "pairs",
      "gramSummary": "Piccoli coccobacilli Gram- immobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "neisseria_meningitidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie incolori/trasparenti (lattosio negativo)."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Normale commensale della cute umana (20-25% della popolazione); asaccaridico (non ossida il glucosio); opportunista in batteriemie da catetere oncologico.",
      "goldStandard": "Gram → Ossidasi (-) → Asaccaridico nel terreno OF-glucosio (differenzia da A. baumannii che è saccarolitico).",
      "transmission": "Contaminazione cutanea linee endovenose.",
      "diseases": [
        "Batteriemia da catetere vascolare",
        "Meningite post-neurochirurgica"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Acinetobacter lwoffii Bacteremia",
          "citation": "Ku SC et al. Clin Infect Dis 31:996, 2000.",
          "source": "CID",
          "keyFinding": "Basso potenziale invasivo intrinseco ma significativo opportunista nei portatori di cateteri a lungo termine."
        }
      ]
    }
  },
  {
    "id": "moraxella_catarrhalis",
    "name": "Moraxella catarrhalis",
    "genus": "Moraxella",
    "species": "catarrhalis",
    "aliases": [
      "m. catarrhalis",
      "branhamella catarrhalis",
      "segno dischetto da hockey"
    ],
    "taxonomyGroup": "Diplococco Gram- respiratorio (Moraxellaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pseudomonadales",
      "family": "Moraxellaceae",
      "genus": "Moraxella",
      "species": "Moraxella catarrhalis"
    },
    "primaryPlate": {
      "colonyColor": "#f8fafc",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.6,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie opache grigio-rosate che possono essere spinte intatte sulla superficie dell'agar come un dischetto da hockey sul ghiaccio ('hockey puck sign')."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "diplococci",
      "arrangement": "pairs",
      "gramSummary": "Diplococchi Gram- a chicco di caffè appaiati.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "neisseria_meningitidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#f8fafc",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#f8fafc",
        "note": "Ottima crescita su agar sangue e cioccolato; inibito su MacConkey.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa frequente di otite media e sinusite nei bambini e di riacutizzazioni severe di BPCO negli adulti; produce quasi costantemente beta-lattamasi (BRO-1/BRO-2).",
      "goldStandard": "Gram (diplococchi Gram-) → Ossidasi (+) → Segno del dischetto da hockey positivo → Idrolisi della butirrato esterasi POSITIVA (disco di butirrato blu scuro in 2 minuti).",
      "transmission": "Goccioline respiratorie o espansione endogena rinofaringea.",
      "diseases": [
        "Otite media acuta",
        "Riacutizzazione di BPCO",
        "Sinusite mascellare"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Moraxella catarrhalis: A Review",
          "citation": "Verduin CM et al. Clin Microbiol Rev 15:472, 2002.",
          "source": "ASM CMR",
          "keyFinding": "Adesine UspA1/UspA2 e idrolisi del butirrato mediante saggio cromogeno rapido."
        }
      ]
    }
  },
  {
    "id": "stenotrophomonas_maltophilia",
    "name": "Stenotrophomonas maltophilia",
    "genus": "Stenotrophomonas",
    "species": "maltophilia",
    "aliases": [
      "s. maltophilia",
      "xanthomonas maltophilia",
      "resistenza a tutti i carbapenemi"
    ],
    "taxonomyGroup": "Bacillo Gram- resistente ai carbapenemi",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Xanthomonadales",
      "family": "Xanthomonadaceae",
      "genus": "Stenotrophomonas",
      "species": "Stenotrophomonas maltophilia"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce circolari giallo pallido con alone lavanda-verdastro su agar sangue e odore pungente di ammoniaca."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili con ciuffo di flagelli polari.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "pseudomonas_aeruginosa_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#fef08a",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Lattosio negativo; intrinsecamente resistente a imipenem e meropenem."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Intrinsecamente resistente a TUTTI i carbapenemi (esprime la metallo-beta-lattamasi L1 e la serina-beta-lattamasi L2); causa infezioni polmonari in fibrosi cistica e sepsi in pazienti trattati con carbapenemi; farmaco d'elezione cotrimossazolo (TMP-SMX).",
      "goldStandard": "Gram → Ossidasi NEGATIVA (differenzia da Pseudomonas) → Ossidazione del maltosio positiva ed intrinseca resistenza clinica a tutti i carbapenemi.",
      "transmission": "Ambiente ospedaliero umido, nebulizzatori e disinfettanti contaminati.",
      "diseases": [
        "Polmonite nosocomiale da ventilatore",
        "Infezioni in fibrosi cistica",
        "Batteriemia"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Stenotrophomonas maltophilia: Pathogenicity and Resistance",
          "citation": "Brooke JS. Clin Microbiol Rev 25:2, 2012.",
          "source": "ASM CMR",
          "keyFinding": "Co-espressione coordinata delle beta-lattamasi inducibili L1 e L2 e pompe di efflusso SmeABC."
        }
      ]
    }
  },
  {
    "id": "burkholderia_cepacia",
    "name": "Burkholderia cepacia",
    "genus": "Burkholderia",
    "species": "cepacia",
    "aliases": [
      "b. cepacia",
      "complesso bcc",
      "fibrosi cistica sindrome da cepacia"
    ],
    "taxonomyGroup": "Bacillo Gram- opportunista della fibrosi cistica",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Burkholderiales",
      "family": "Burkholderiaceae",
      "genus": "Burkholderia",
      "species": "Burkholderia cepacia"
    },
    "primaryPlate": {
      "colonyColor": "#fef08a",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce giallastre sul terreno selettivo BCSA (Burkholderia cepacia Selective Agar)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- diritti mobili con flagelli polari.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "pseudomonas_aeruginosa_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#fef08a",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Cresce su agar selettivo BCSA; intrinsecamente resistente a colistina/polimixine."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Patogeno temutissimo nei pazienti con fibrosi cistica (causa la fulminante 'sindrome da cepacia' con polmonite necrotizzante e rapido decesso); intrinsecamente resistente a colistina e aminoglicosidi.",
      "goldStandard": "Isolamento su terreno selettivo BCSA → Ossidasi debolmente positiva → Resistenza intrinseca alla colistina (differenzia da P. aeruginosa).",
      "transmission": "Trasmissione interumana tra pazienti con fibrosi cistica o nebulizzatori contaminati.",
      "diseases": [
        "Sindrome da cepacia in fibrosi cistica",
        "Polmonite necrotizzante",
        "Sepsi"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Burkholderia cepacia Complex in Cystic Fibrosis",
          "citation": "Mahenthiralingam E et al. Nat Rev Microbiol 3:144, 2005.",
          "source": "Nature",
          "keyFinding": "Alterazione del lipopolisaccaride con aggiunta di 4-ammino-4-deossi-L-arabinosio che blocca l'attacco della colistina."
        }
      ]
    }
  },
  {
    "id": "burkholderia_pseudomallei",
    "name": "Burkholderia pseudomallei",
    "genus": "Burkholderia",
    "species": "pseudomallei",
    "aliases": [
      "b. pseudomallei",
      "melioidosi",
      "bacillo di whitmore"
    ],
    "taxonomyGroup": "Bacillo Gram- rugoso melioidosi (BSL-3)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Burkholderiales",
      "family": "Burkholderiaceae",
      "genus": "Burkholderia",
      "species": "Burkholderia pseudomallei"
    },
    "primaryPlate": {
      "colonyColor": "#eae3d2",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 4,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie corrugate a superficie profondamente rugosa, secca, plicata con caratteristico forte odore terroso su agar Ashdown."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- con spiccata colorazione bipolare a spilla di sicurezza.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "peritrichous",
      "micrographKey": "pseudomonas_aeruginosa_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#eae3d2",
        "note": "Crescita regolare su Agar Sangue.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Colonie corrugate rugose su agar Ashdown selettivo con odore tellurico marcato."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente della melioidosi nel Sud-Est asiatico e Nord Australia; provoca polmoniti necrotizzanti e ascessi ascessualizzati sistemici cronici mimando la tubercolosi; agente di bioterrorismo BSL-3.",
      "goldStandard": "Isolamento su agar Ashdown con colonie rugose violacee e forte odore terroso → Ossidasi POSITIVA → Resistenza a colistina e penicillina ma sensibilità all'amoxicillina-clavulanato.",
      "transmission": "Inoculazione percutanea da contatto con terreno o acque alluvionali o inalazione durante tempeste tropicali.",
      "diseases": [
        "Melioidosi polmonare acuta",
        "Ascessi multipli epatici e splenici",
        "Sepsi melioidotica"
      ],
      "safetyLevel": "BSL-3",
      "literature": [
        {
          "title": "Melioidosis",
          "citation": "Wiersinga WJ et al. Nat Rev Dis Primers 4:17107, 2018.",
          "source": "Nature",
          "keyFinding": "Sopravvivenza intracellulare e mobilità actino-mediata BimA con formazione di cellule giganti multinucleate."
        }
      ]
    }
  },
  {
    "id": "alcaligenes_faecalis",
    "name": "Alcaligenes faecalis",
    "genus": "Alcaligenes",
    "species": "faecalis",
    "aliases": [
      "a. faecalis",
      "alcaligene",
      "odore di mela verde"
    ],
    "taxonomyGroup": "Bacillo Gram- asaccaridico con odore di mela",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Burkholderiales",
      "family": "Alcaligenaceae",
      "genus": "Alcaligenes",
      "species": "Alcaligenes faecalis"
    },
    "primaryPlate": {
      "colonyColor": "#f1f5f9",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 3,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide con caratteristico odore fruttato e dolce di mela verde."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- mobili con flagelli peritrichi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "pseudomonas_aeruginosa_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#f1f5f9",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": true,
        "lactose": "neg",
        "note": "Lattosio negativo; alcalinizza fortemente i terreni."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Bacillo Gram- non-fermentante dell'ambiente ospedaliero; produce alcalinizzazione dei carboidrati e tipico odore dolce di mela verde; opportunista in chemioterapia.",
      "goldStandard": "Gram → Ossidasi (+) → Asaccaridico nel terreno OF-glucosio (reazione alcalina blu) e inconfondibile odore di mela verde.",
      "transmission": "Soluzioni di dialisi, umidificatori e aerosol ospedalieri.",
      "diseases": [
        "Infezione delle vie urinarie",
        "Sepsi da catetere emodialitico"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Alcaligenes faecalis Clinical Significance",
          "citation": "Bizet J, Bizet C. J Clin Microbiol 35:2690, 1997.",
          "source": "JCM",
          "keyFinding": "Alcalinizzazione aerobica mediante utilizzo di amminoacidi come unica fonte di carbonio."
        }
      ]
    }
  },
  {
    "id": "haemophilus_parainfluenzae",
    "name": "Haemophilus parainfluenzae",
    "genus": "Haemophilus",
    "species": "parainfluenzae",
    "aliases": [
      "h. parainfluenzae",
      "haemophilus dipendente solo da v"
    ],
    "taxonomyGroup": "Coccobacillo Gram- esigente gruppo HACEK",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pasteurellales",
      "family": "Pasteurellaceae",
      "genus": "Haemophilus",
      "species": "Haemophilus parainfluenzae"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce grigio-giallastre su Agar Cioccolato."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Piccoli coccobacilli Gram- pleomorfi immobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "pos",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Cresce su cioccolato; richiede SOLO il fattore V (NAD) e NON il fattore X (emina).",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Membro del gruppo HACEK; richiede per la crescita solo il fattore V (NAD) e non il fattore X (emina) a differenza di H. influenzae; causa endocarditi subacute.",
      "goldStandard": "Test dei dischetti X e V su agar base: crescita ESCLUSIVAMENTE attorno al dischetto V (e X+V) ma ASSENTE attorno al dischetto X puro.",
      "transmission": "Flora orofaringea commensale.",
      "diseases": [
        "Endocardite infettiva HACEK",
        "Sinusite mascellare"
      ],
      "safetyLevel": "BSL-1",
      "literature": [
        {
          "title": "Haemophilus parainfluenzae Endocarditis",
          "citation": "Mitchell PD et al. J Clin Microbiol 14:489, 1981.",
          "source": "JCM",
          "keyFinding": "Saggio dei requisiti nutrizionali per emina e nicotinammide adenina dinucleotide."
        }
      ]
    }
  },
  {
    "id": "pasteurella_multocida",
    "name": "Pasteurella multocida",
    "genus": "Pasteurella",
    "species": "multocida",
    "aliases": [
      "p. multocida",
      "morso di gatto",
      "cellulite da morso animale"
    ],
    "taxonomyGroup": "Coccobacillo Gram- zoonotico sensibile a penicillina",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pasteurellales",
      "family": "Pasteurellaceae",
      "genus": "Pasteurella",
      "species": "Pasteurella multocida"
    },
    "primaryPlate": {
      "colonyColor": "#e2e8f0",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce grigio-traslucide su agar sangue con caratteristico odore di stalla/muffa (musty odor)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Piccoli coccobacilli Gram- con tipica colorazione bipolare agli apici.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Colonie grigiastre gamma-emolitiche con odore di stalla; NON CRESCE SU MACCONKEY.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Tipica cellulite locale fulminante a rapida insorgenza (< 24 ore dal trauma) con intenso dolore post-morso o graffio di gatto o cane; complicabile con tenosinovite ed osteomielite.",
      "goldStandard": "Gram (coccobacilli bipolari) → Ossidasi (+) e Indolo (+) → Mancata crescita su MacConkey (-) → Straordinaria sensibilità alla Penicillina G (alone gigante).",
      "transmission": "Morso o graffio di felini (portatori orali nel 70-90%) e canidi.",
      "diseases": [
        "Cellulite fulminante da morso animale",
        "Tenosinovite acuta purulenta",
        "Osteomielite"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Pasteurella multocida Infections",
          "citation": "Wilson BA, Ho M. Nat Rev Microbiol 11:785, 2013.",
          "source": "Nature",
          "keyFinding": "Tossina PMT che attiva le proteine G eterotrimeriche stimolando proliferazione cellulare."
        }
      ]
    }
  },
  {
    "id": "aggregatibacter_actinomycetemcomitans",
    "name": "Aggregatibacter actinomycetemcomitans",
    "genus": "Aggregatibacter",
    "species": "actinomycetemcomitans",
    "aliases": [
      "a. actinomycetemcomitans",
      "aggregatibacter",
      "parodontite giovanile",
      "hacek"
    ],
    "taxonomyGroup": "Coccobacillo Gram- esigente parodontale (HACEK)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Pasteurellales",
      "family": "Pasteurellaceae",
      "genus": "Aggregatibacter",
      "species": "Aggregatibacter actinomycetemcomitans"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 1.8,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie minute fortemente adese all'agar con caratteristico disegno interno stellato 'a stella marina' a 4-6 punte visibile al microscopio."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "clusters",
      "gramSummary": "Piccoli coccobacilli Gram- disposti in aggregati densi.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Colonie a stella interna microscopica; crescita lenta arricchita in 5% CO2.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Membro cardine del gruppo HACEK; agente primario di parodontite giovanile aggressiva localizzata ed endocardite infettiva ad emocolture a lenta crescita.",
      "goldStandard": "Colonie adese con disegno a stella interna a 4-6 punte al microscopio a basso ingrandimento → Catalasi POSITIVA ed Ossidasi NEGATIVA/debole.",
      "transmission": "Disseminazione dal solco subgengivale post-procedure odontoiatriche.",
      "diseases": [
        "Parodontite aggressiva localizzata",
        "Endocardite infettiva HACEK",
        "Ascessi cerebrali"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Aggregatibacter actinomycetemcomitans Virulence",
          "citation": "Herbert BA et al. Periodontol 2000 69:112, 2015.",
          "source": "Wiley",
          "keyFinding": "Leucotossina LtxA che lisa selettivamente i leucociti umani polimorfonucleati e monociti."
        }
      ]
    }
  },
  {
    "id": "eikenella_corrodens",
    "name": "Eikenella corrodens",
    "genus": "Eikenella",
    "species": "corrodens",
    "aliases": [
      "e. corrodens",
      "morso umano",
      "colonia che corrode agar"
    ],
    "taxonomyGroup": "Bacillo Gram- che scava l'agar (HACEK)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Neisseriales",
      "family": "Neisseriaceae",
      "genus": "Eikenella",
      "species": "Eikenella corrodens"
    },
    "primaryPlate": {
      "colonyColor": "#94a3b8",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piatte che scavano fossette e crateri microscopici nell'agar ('corrosione') emanando un pungente odore di candeggina/ipoclorito."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Piccoli bacilli Gram- snelli diritti.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#94a3b8",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#94a3b8",
        "note": "Scava crateri depressi nell'agar ed emana odore di varechina; richiede emina (fattore X).",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Membro del gruppo HACEK; tipico patogeno di infezioni da morso umano o ferite da pugno contro i denti dell'avversario ('clenched-fist injury'); colonie che corrodono l'agar con odore di varechina.",
      "goldStandard": "Corrosione/infossamento delle colonie nell'agar + Odore di candeggina → Ossidasi POSITIVA e Catalasi NEGATIVA → Ornitina decarbossilasi (+).",
      "transmission": "Saliva umana post-traumi o morsi.",
      "diseases": [
        "Tenosinovite da morso umano (clenched-fist injury)",
        "Endocardite HACEK",
        "Ascessi del collo"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Eikenella corrodens in Human Bite Wounds",
          "citation": "Goldstein EJ. Clin Infect Dis 14:633, 1992.",
          "source": "CID",
          "keyFinding": "Sensibilità alla penicillina e resistenza naturale ai macrolidi e clindamicina."
        }
      ]
    }
  },
  {
    "id": "kingella_kingae",
    "name": "Kingella kingae",
    "genus": "Kingella",
    "species": "kingae",
    "aliases": [
      "k. kingae",
      "artrite settica pediatrica",
      "hacek"
    ],
    "taxonomyGroup": "Coccobacillo Gram- pediatrico osteoarticolare (HACEK)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Neisseriales",
      "family": "Neisseriaceae",
      "genus": "Kingella",
      "species": "Kingella kingae"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie minute traslucide con stretto alone chiaro di beta-emolisi su agar sangue."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "pairs",
      "gramSummary": "Coccobacilli Gram- tozzi a coppie e catenelle con estremità squadrate.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "facultative",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#cbd5e1",
        "note": "Stretta beta-emolisi su agar sangue; inibito su MacConkey.",
        "swarming": false,
        "narrowHalo": true,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Principale agente eziologico di artrite settica ed osteomielite nei bambini di età inferiore a 4 anni; membro del gruppo HACEK; beta-emolitico.",
      "goldStandard": "Gram (coccobacilli Gram-) → Ossidasi POSITIVA e Catalasi NEGATIVA (differenzia da Moraxella e Neisseria) → Beta-emolisi su agar sangue.",
      "transmission": "Colonizzazione faringea e disseminazione ematica infantile.",
      "diseases": [
        "Artrite settica nel lattante",
        "Osteomielite",
        "Endocardite HACEK"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Kingella kingae: An Emerging Pediatric Pathogen",
          "citation": "Yagupsky P. Clin Microbiol Rev 28:54, 2015.",
          "source": "ASM CMR",
          "keyFinding": "Esotossina RTx (Kingella RTX toxin) citotossica per condrociti e sinoviociti."
        }
      ]
    }
  },
  {
    "id": "neisseria_gonorrhoeae",
    "name": "Neisseria gonorrhoeae",
    "genus": "Neisseria",
    "species": "gonorrhoeae",
    "aliases": [
      "n. gonorrhoeae",
      "gonococco",
      "gonorrea",
      "blenorragia"
    ],
    "taxonomyGroup": "Diplococco Gram- a chicco di caffè esigente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Neisseriales",
      "family": "Neisseriaceae",
      "genus": "Neisseria",
      "species": "Neisseria gonorrhoeae"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piccole, traslucide, grigiastre su agar Thayer-Martin arricchito con antibiotici (VCN) in 5% CO2."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "diplococci",
      "arrangement": "pairs",
      "gramSummary": "Diplococchi Gram- a chicco di caffè con lati adiacenti appiattiti, tipicamente intracellulari nei neutrofili polimorfonucleati.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "neisseria_meningitidis_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Cresce su Thayer-Martin / Cioccolato arricchito in atmosfera al 5% di CO2; non cresce su agar nutriente ordinario.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente della gonorrea (blenorragia): uretrite purulenta maschile, cervicite e malattia infiammatoria pelvica (PID) con sterilità tubarica; oftalmia neonatale.",
      "goldStandard": "Gram (diplococchi intracellulari nei PMN nel secreto uretrale maschile) → Ossidasi (+) → Ossidazione carboidrati: SOLO GLUCOSIO POSITIVO (maltosio negativo, differenzia da N. meningitidis).",
      "transmission": "Contatto sessuale mucoso o parto (oftalmia neonatale).",
      "diseases": [
        "Uretrite purulenta",
        "PID e sterilità femminile",
        "Infezione gonococcica disseminata con artrite settica"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Pathogenesis of Neisseria gonorrhoeae",
          "citation": "Quillin SJ, Seifert HS. Nat Rev Microbiol 16:226, 2018.",
          "source": "Nature",
          "keyFinding": "Variazione di fase e antigenica massiva dei pili di tipo IV e delle proteine Opa."
        }
      ]
    }
  },
  {
    "id": "bordetella_pertussis",
    "name": "Bordetella pertussis",
    "genus": "Bordetella",
    "species": "pertussis",
    "aliases": [
      "b. pertussis",
      "pertosse",
      "tosse asinina",
      "gocce di mercurio"
    ],
    "taxonomyGroup": "Coccobacillo Gram- esigente tossigeno",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Betaproteobacteria",
      "order": "Burkholderiales",
      "family": "Alcaligenaceae",
      "genus": "Bordetella",
      "species": "Bordetella pertussis"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 1.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Minute colonie a cupola lucide rifrangenti simili a 'gocce di mercurio' o 'perle spaccate' su terreno Bordet-Gengou o Regan-Lowe a base di carbone."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Minuscoli coccobacilli Gram- ovoidali immobili.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": true,
        "hemolysis": "beta",
        "colonyColor": "#cbd5e1",
        "note": "Cresce solo su terreni arricchiti con carbone/amido e sangue (Bordet-Gengou / Regan-Lowe).",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": false,
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Agente della pertosse ('tosse dei 100 giorni'); esprime la tossina della pertosse (PT, ADP-ribosiltransferasi) provocando paralisi ciliare, tosse accessionale parossistica e linfocitosi assoluta nel sangue.",
      "goldStandard": "Isolamento su agar Regan-Lowe con colonie a goccia di mercurio → Ossidasi POSITIVA e Ureasi NEGATIVA (differenzia da B. parapertussis che è ureasi +) → PCR IS481 patognomonica.",
      "transmission": "Goccioline respiratorie durante accessi di tosse.",
      "diseases": [
        "Pertosse accessionale",
        "Encefalopatia ipossica infantile",
        "Polmonite secondaria"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Bordetella pertussis and Whooping Cough",
          "citation": "Melvin JA et al. Nat Rev Microbiol 12:274, 2014.",
          "source": "Nature",
          "keyFinding": "Tossina della pertosse e adenilato ciclasi-emolisina ACT che disabilitano le difese fagocitarie."
        }
      ]
    }
  },
  {
    "id": "legionella_pneumophila",
    "name": "Legionella pneumophila",
    "genus": "Legionella",
    "species": "pneumophila",
    "aliases": [
      "l. pneumophila",
      "legionella",
      "morbo del legionario",
      "vetro smerigliato BCYE"
    ],
    "taxonomyGroup": "Bacillo Gram- intracellulare acquatico esigente",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Legionellales",
      "family": "Legionellaceae",
      "genus": "Legionella",
      "species": "Legionella pneumophila"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.8,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie circolari lucide con iridescenza periferica e tipica tessitura interna a 'vetro smerigliato / sfaccettato' (cut-glass) su agar BCYE."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- pleomorfi sottili debolmente colorati; colorati efficacemente con carbolfucsina modificata o impregnazione argentica.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "peritrichous",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": false,
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Malattia dei Legionari: polmonite atipica grave necrotizzante con iposodiemia, diarrea e compromissione neurologica; serbatoio in impianti idrici e torri evaporative di condizionamento.",
      "goldStandard": "Rilevazione dell'antigene solubile di Legionella nelle urine (sierogruppo 1) + Coltura su agar BCYE con colonie a vetro smerigliato che NON crescono su piastra di controllo priva di L-cisteina.",
      "transmission": "Inalazione o microaspirazione di aerosol idrico contaminato (mai trasmissione interumana).",
      "diseases": [
        "Polmonite dei Legionari grave",
        "Febbre di Pontiac (sindrome simil-influenzale autolimitante)"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Legionella pneumophila Pathogenesis",
          "citation": "Newton HJ et al. Clin Microbiol Rev 23:274, 2010.",
          "source": "ASM CMR",
          "keyFinding": "Sistema di secrezione di tipo IVB Dot/Icm che rimodella il fagosoma in un organello replicativo simile al reticolo endoplasmatico."
        }
      ]
    }
  },
  {
    "id": "coxiella_burnetii",
    "name": "Coxiella burnetii",
    "genus": "Coxiella",
    "species": "burnetii",
    "aliases": [
      "c. burnetii",
      "febbre q",
      "parassita intracellulare"
    ],
    "taxonomyGroup": "Coccobacillo Gram- intracellulare (BSL-3)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Gammaproteobacteria",
      "order": "Legionellales",
      "family": "Coxiellaceae",
      "genus": "Coxiella",
      "species": "Coxiella burnetii"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 0,
      "texture": "none",
      "agarTint": null,
      "macroSummary": "NON coltivabile sui terreni batteriologici routinari di laboratorio (parassita intracellulare obbligato)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Piccoli coccobacilli Gram- intracellulari che producono varianti a piccole cellule (SCV) condensate simili a spore resistenti all'essiccamento.",
      "acidFast": false,
      "spores": {
        "present": true,
        "position": "subterminal"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": false,
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Febbre Q acuta (sindrome febbrile sistemica, epatite granulomatosa 'a ciambella' con anello fibrinoide) e cronica (endocardite con emocolture negative); serbatoio in ovicaprini e bovini durante il parto.",
      "goldStandard": "Sierologia con immunofluorescenza indiretta (IFA): titoli anticorpali contro antigeni di fase I e fase II; test PCR su sangue o biopsia valvolare.",
      "transmission": "Inalazione di polveri contaminate da liquidi amniotici, placenta o feci di ovini e caprini infetti.",
      "diseases": [
        "Febbre Q acuta",
        "Endocardite da Febbre Q",
        "Epatite granulomatosa"
      ],
      "safetyLevel": "BSL-3",
      "literature": [
        {
          "title": "Coxiella burnetii and Q Fever",
          "citation": "Eldin C et al. Clin Microbiol Rev 30:115, 2017.",
          "source": "ASM CMR",
          "keyFinding": "Replicazione e persistenza all'interno del fagolisosoma acido (pH 4.8) via T4SS Dot/Icm."
        }
      ]
    }
  },
  {
    "id": "brucella_melitensis",
    "name": "Brucella melitensis",
    "genus": "Brucella",
    "species": "melitensis",
    "aliases": [
      "b. melitensis",
      "brucellosi",
      "febbre maltese",
      "febbre ondulante"
    ],
    "taxonomyGroup": "Coccobacillo Gram- zoonotico BSL-3 (Ureasi fulminea)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Alphaproteobacteria",
      "order": "Hyphomicrobiales",
      "family": "Brucellaceae",
      "genus": "Brucella",
      "species": "Brucella melitensis"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie minute traslucide convesse a crescita lenta (3-5 giorni) su agar sangue/cioccolato arricchito."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "coccobacilli",
      "arrangement": "singles",
      "gramSummary": "Minuscoli coccobacilli Gram- debolmente colorati, singoli o a coppie.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "strong_pos",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Cresce su agar sangue e cioccolato con incubazione prolungata (emocolture per 14-21 giorni).",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Febbre ondulante mediterranea con sudorazioni notturne profuse ad odore di paglia bagnata, sacroileite, spondilodiscite ed epatosplenomegalia; principale causa di infezioni accidentali acquisite in laboratorio per aerosol (BSL-3).",
      "goldStandard": "Isolamento a lenta crescita → Ossidasi POSITIVA → Ureasi FULMINEA (< 5 minuti) → Test di agglutinazione al siero di Wright e PCR specifica.",
      "transmission": "Ingestione di latte o formaggi crudi ovini non pastorizzati; inalazione accidentale di aerosol in laboratorio.",
      "diseases": [
        "Brucellosi / Febbre ondulante",
        "Spondilodiscite brucellare",
        "Epididimo-orchite"
      ],
      "safetyLevel": "BSL-3",
      "literature": [
        {
          "title": "Brucellosis: Clinical Review",
          "citation": "Pappas G et al. N Engl J Med 352:2325, 2005.",
          "source": "NEJM",
          "keyFinding": "Parassitismo intracellulare nei macrofagi e sinergismo antibiotico con doxiciclina e rifampicina/aminoglicoside."
        }
      ]
    }
  },
  {
    "id": "bartonella_henselae",
    "name": "Bartonella henselae",
    "genus": "Bartonella",
    "species": "henselae",
    "aliases": [
      "b. henselae",
      "malattia da graffio di gatto",
      "angiomatosi bacillare"
    ],
    "taxonomyGroup": "Bacillo Gram- esigente angioproliferativo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Pseudomonadota",
      "class": "Alphaproteobacteria",
      "order": "Hyphomicrobiales",
      "family": "Bartonellaceae",
      "genus": "Bartonella",
      "species": "Bartonella henselae"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 1.5,
      "texture": "rough",
      "agarTint": null,
      "macroSummary": "Colonie minute, cavolfioriformi rugose, tenacemente ancorate all'agar a crescita lentissima (2-4 settimane)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "clusters",
      "gramSummary": "Piccoli bacilli Gram- pleomorfi leggermente ricurvi evidenziabili nei tessuti con impregnazione argentica di Warthin-Starry.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "haemophilus_influenzae_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_aerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#e2e8f0",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita estremamente lenta (14-28 giorni) su agar sangue arricchito al 10% di sangue di coniglio.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Malattia da graffio di gatto (CSD: linfoadenite regionale subacuta benigna) negli immunocompetenti; angiomatosi bacillare vascolare e peliosi epatica nei pazienti con AIDS.",
      "goldStandard": "Sierologia con immunofluorescenza indiretta (IFA titolo ≥ 1:256) + PCR specifica + Istologia con impregnazione argentica di Warthin-Starry che colora i batteri in nero nei tessuti granulomatosi.",
      "transmission": "Graffio o morso di gatto infestato da pulci (Ctenocephalides felis).",
      "diseases": [
        "Malattia da graffio di gatto (CSD)",
        "Angiomatosi bacillare cutanea",
        "Peliosi epatica nell'AIDS"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Bartonella Infections: Beyond Cat-Scratch Disease",
          "citation": "Florin TA et al. Pediatrics 121:e1413, 2008.",
          "source": "AAP",
          "keyFinding": "Induzione della proliferazione endoteliale vascolare mediata dalla proteina BadA e T4SS VirB/VirD4."
        }
      ]
    }
  },
  {
    "id": "campylobacter_jejuni",
    "name": "Campylobacter jejuni",
    "genus": "Campylobacter",
    "species": "jejuni",
    "aliases": [
      "c. jejuni",
      "campylobacter",
      "diarrea da pollo",
      "guillain-barre"
    ],
    "taxonomyGroup": "Bacillo Gram- ricurvo ad ali di gabbiano microaerofilo",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Campylobacterota",
      "class": "Campylobacteria",
      "order": "Campylobacterales",
      "family": "Campylobacteraceae",
      "genus": "Campylobacter",
      "species": "Campylobacter jejuni"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.5,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie piatte, grigio-traslucide, umide ed espanse a velo acquoso lungo la stria su agar selettivo di Skirrow o Campy-CVA."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "spirals",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- sottili ricurvi a virgola, a S o 'ad ali di gabbiano'; vivace motilità 'a dardo' a cavatappi (flagello polare).",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "darting",
      "micrographKey": "vibrio_cholerae_gram"
    },
    "biochem": {
      "peroxidase": true,
      "oxidase": true,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "microaerophile",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Cresce solo in microaerofilia (5% O2, 10% CO2, 85% N2) a 42°C su terreni selettivi Campy-BAP; non cresce a 25°C.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": false,
        "colonyColor": "#cbd5e1",
        "note": "Assenza di crescita.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Causa principale di gastroenterite batterica acuta nel mondo occidentale; associato al consumo di carne di pollame poco cotta; principale innesco post-infettivo della sindrome di Guillain-Barré (GBS) da mimetismo molecolare gangliosidico.",
      "goldStandard": "Gram (ali di gabbiano ricurve a contrasto safranina prolungata) → Motilità a dardo alla goccia pendente → Ossidasi (+) e Catalasi (+) → Crescita a 42°C in microaerofilia e test di idrolisi dell'ippurato POSITIVO (differenzia da C. coli).",
      "transmission": "Consumo di pollame crudo o poco cotto, latte non pastorizzato e acque superficiali.",
      "diseases": [
        "Enterite acuta emorragica",
        "Sindrome di Guillain-Barré post-infettiva",
        "Artrite reattiva"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Campylobacter jejuni: Molecular Biology and Pathogenesis",
          "citation": "Young KT et al. Nat Rev Microbiol 5:665, 2007.",
          "source": "Nature",
          "keyFinding": "Sialilazione del lipooligosaccaride (LOS) che replica gli epitopi gangliosidici GM1 umani provocando autoimmunità neurale."
        }
      ]
    }
  },
  {
    "id": "bacteroides_fragilis",
    "name": "Bacteroides fragilis",
    "genus": "Bacteroides",
    "species": "fragilis",
    "aliases": [
      "b. fragilis",
      "batterioide",
      "anaerobio addominale principale"
    ],
    "taxonomyGroup": "Bacillo Gram- anaerobio obbligato bile-resistente (Bacteroidaceae)",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Bacteroidota",
      "class": "Bacteroidia",
      "order": "Bacteroidales",
      "family": "Bacteroidaceae",
      "genus": "Bacteroides",
      "species": "Bacteroides fragilis"
    },
    "primaryPlate": {
      "colonyColor": "#334155",
      "colonyHighlight": "#475569",
      "colonyRadius": 3.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce circolari grigio-scuro/nere circondate da un alone scuro su agar selettivo BBE (Bacteroides Bile Esculin)."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Bacilli Gram- pleomorfi a colorazione pallida disomogenea con estremità arrotondate.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": true,
      "motility": "immobile",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": false,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#334155",
        "note": "Assenza di crescita su agar sangue ordinario.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": true,
        "black": true,
        "note": "Cresce attivamente in presenza di bile al 20% ed idrolizza l'esculina virando il terreno a nero pece su agar BBE."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Il più frequente ed importante patogeno anaerobio obbligato umano; causa primaria di peritoniti, ascessi intra-addominali post-perforazione intestinale e batteriemie; capsula polisaccaridica zwitterionica direttamente ascessogena.",
      "goldStandard": "Gram (bacilli Gram- pleomorfi a colorazione debole) → Anaerobio obbligato → Crescita con annerimento dell'esculina in presenza di bile al 20% (agar BBE) e resistenza a kanamicina, vancomicina e colistina.",
      "transmission": "Disseminazione endogena dalla mucosa colica traumatizzata o perforata.",
      "diseases": [
        "Peritonite e ascesso intra-addominale",
        "Batteriemia anaerobia",
        "Ascesso pelvico"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Bacteroides: The Good, the Bad, and the Nitty-Gritty",
          "citation": "Wexler HM. Clin Microbiol Rev 20:593, 2007.",
          "source": "ASM CMR",
          "keyFinding": "Capsula zwitterionica PSA che stimola la risposta linfocitaria T CD4+ inducendo ascessi sterili."
        }
      ]
    }
  },
  {
    "id": "fusobacterium_nucleatum",
    "name": "Fusobacterium nucleatum",
    "genus": "Fusobacterium",
    "species": "nucleatum",
    "aliases": [
      "f. nucleatum",
      "fusobatterio",
      "angina di vincent",
      "marcatore cancro colon"
    ],
    "taxonomyGroup": "Bacillo Gram- anaerobio fusiforme affusolato",
    "taxonomy": {
      "domain": "Bacteria",
      "phylum": "Fusobacteriota",
      "class": "Fusobacteriia",
      "order": "Fusobacteriales",
      "family": "Fusobacteriaceae",
      "genus": "Fusobacterium",
      "species": "Fusobacterium nucleatum"
    },
    "primaryPlate": {
      "colonyColor": "#cbd5e1",
      "colonyHighlight": "#ffffff",
      "colonyRadius": 2.2,
      "texture": "smooth",
      "agarTint": null,
      "macroSummary": "Colonie lisce traslucide con iridescenza a goccia di rugiada o a briciola di pane; fluorescenza giallo-verde sotto UV."
    },
    "microscopy": {
      "gram": "neg",
      "shape": "bacilli",
      "arrangement": "singles",
      "gramSummary": "Inconfondibili e caratteristici lunghi bacilli Gram- sottili affusolati 'a fuso' con estremità marcatamente appuntite ad ago.",
      "acidFast": false,
      "spores": {
        "present": false,
        "position": "none"
      },
      "capsule": false,
      "motility": "immobile",
      "micrographKey": "shigella_flexneri_gram"
    },
    "biochem": {
      "peroxidase": false,
      "oxidase": false,
      "coagulase": false,
      "urease": "neg",
      "indole": true,
      "oxygen": "obligate_anaerobe",
      "disks": {
        "optochin": "R",
        "bacitracin": "R",
        "novobiocin": "S"
      }
    },
    "mediaProfile": {
      "blood": {
        "growth": false,
        "hemolysis": "gamma",
        "colonyColor": "#cbd5e1",
        "note": "Anaerobio stretto; produce acido butirrico come principale metabolita; fluorescenza chartreuse a 365 nm.",
        "swarming": false,
        "narrowHalo": false,
        "wideHalo": false
      },
      "macconkey": {
        "growth": false,
        "lactose": "neg",
        "note": "Inibito dai sali biliari."
      },
      "msa": {
        "growth": false,
        "mannitol": false,
        "note": "Inibito dall'elevata salinità (7.5% NaCl)."
      },
      "emb": {
        "growth": false,
        "metallicSheen": false,
        "colonyColor": "#cbd5e1",
        "note": "Inibito."
      },
      "xld": {
        "growth": false,
        "xldType": "red_clear",
        "h2s": false,
        "note": "Inibito."
      },
      "chocolate": {
        "growth": true,
        "colonyColor": "#cbd5e1",
        "note": "Crescita regolare di colonie lisce.",
        "swarming": false
      },
      "tcbs": {
        "growth": false,
        "note": "Inibito dal pH 8.6 e sali biliari del TCBS."
      },
      "bileEsculin": {
        "growth": false,
        "black": false,
        "note": "Inibito dalla bile al 40%."
      },
      "cetrimide": {
        "growth": false,
        "note": "Inibito dalla cetrimide."
      },
      "lowenstein": {
        "growth": false,
        "note": "Assenza di crescita micobatterica."
      }
    },
    "clinical": {
      "overview": "Anaerobio orale fusiforme del solco gengivale; implicato nella gengivite ulcero-necrotizzante acuta (angina di Vincent), ascessi cerebrali metastatici e recentemente riconosciuto come promotore dell'oncogenesi nel cancro colorettale.",
      "goldStandard": "Gram (morfologia inconfondibile di bastoncelli affusolati ad ago) → Anaerobio obbligato → Indolo POSITIVO → Picco isolato di acido butirrico alla gascromatografia (GLC).",
      "transmission": "Disseminazione dal biofilm sottogengivale.",
      "diseases": [
        "Angina di Vincent (gengivite necrotizzante)",
        "Ascessi cerebrali e polmonari",
        "Promozione del carcinoma colorettale"
      ],
      "safetyLevel": "BSL-2",
      "literature": [
        {
          "title": "Fusobacterium nucleatum and Colorectal Cancer",
          "citation": "Kostic AD et al. Cell Host Microbe 14:207, 2013.",
          "source": "Cell",
          "keyFinding": "Adesina FadA che si lega alla E-caderina promuovendo l'invasione neoplastica e la segnalazione Wnt/beta-catenina."
        }
      ]
    }
  }
];

  function evaluateTest(bacterium, testId) {
    const m = bacterium.microscopy;
    const b = bacterium.biochem;
    const mp = bacterium.mediaProfile;

    switch (testId) {
      case 'gram': {
        let badge = 'GRAM + (VIOLA)';
        let tone = 'purple';
        if (m.gram === 'neg') {
          badge = 'GRAM − (ROSA)';
          tone = 'pink';
        } else if (m.gram === 'poor') {
          badge = 'GRAM DEBOLE / GHOST';
          tone = 'amber';
        }
        return {
          testId,
          viewType: 'microscope',
          stainMode: 'gram',
          badge,
          tone,
          detail: m.gramSummary
        };
      }

      case 'ziehl': {
        const pos = m.acidFast;
        return {
          testId,
          viewType: 'microscope',
          stainMode: 'ziehl',
          badge: pos ? 'BAAR POSITIVO (+)' : 'NON ACIDO-RESISTENTE (−)',
          tone: pos ? 'danger' : 'info',
          detail: pos
            ? 'Bacilli alcol-acido resistenti (BAAR) colorati in ROSSO FUCSINA brillante su sfondo blu di metilene, disposti in fasci cordali.'
            : 'Il batterio si decolora con alcol-acido e assume il blu di metilene di contrasto (Ziehl-Neelsen negativo).'
        };
      }

      case 'spores': {
        const sp = m.spores;
        const posLabel =
          sp.position === 'central'
            ? 'centrali/ellissoidali'
            : sp.position === 'subterminal'
            ? 'subterminali ovali'
            : '';
        return {
          testId,
          viewType: 'microscope',
          stainMode: 'spores',
          badge: sp.present ? 'SPORIGENO (+)' : 'ASPORIGENO (−)',
          tone: sp.present ? 'success' : 'neutral',
          detail: sp.present
            ? `Endospore presenti (${posLabel}) colorate in verde malachite all’interno dei bacilli vegetativi rosa.`
            : 'Nessuna endospora rilevata: si osservano esclusivamente cellule vegetative rosa-rosse.'
        };
      }

      case 'capsule_motility': {
        const motMap = {
          immobile: 'Immobile (solo moto browniano)',
          peritrichous: 'Mobile + (flagelli peritrichi)',
          swarming: 'Iper-mobile ++ (migrazione a sciame / swarming)',
          darting: 'Mobile ++ "a dardo" (flagello polare singolo)',
          tumbling: 'Mobile + "a capriola / tumbling" (tipico a 22–25°C)',
          lophotrichous: 'Mobile + (flagelli polari/lofotrichi)'
        };
        const capStr = m.capsule ? 'Capsula PRESENTE (+)' : 'Capsula assente (−)';
        return {
          testId,
          viewType: 'microscope',
          stainMode: 'capsule',
          badge: `${m.capsule ? 'CAPSULA +' : 'CAPSULA −'} · ${m.motility === 'immobile' ? 'IMMOBILE' : 'MOBILE +'}`,
          tone: m.capsule || m.motility !== 'immobile' ? 'info' : 'neutral',
          detail: `${capStr} all’inchiostro di China; alla goccia pendente il ceppo risulta: ${motMap[m.motility]}.`
        };
      }

      case 'peroxidase': {
        const pos = b.peroxidase;
        return {
          testId,
          viewType: 'biochem',
          biochemMode: 'peroxidase',
          pos,
          badge: pos ? 'POSITIVO (+ Bolle O₂)' : 'NEGATIVO (− Nessuna bolla)',
          tone: pos ? 'success' : 'neutral',
          detail: pos
            ? 'Forte effervescenza immediata al contatto con H₂O₂ al 3%: rilascio attivo di bollicine di ossigeno gassoso.'
            : 'Nessuna effervescenza sul vetrino dopo aggiunta di H₂O₂ al 3% (assenza di catalasi/perossidasi attiva).'
        };
      }

      case 'oxidase': {
        const pos = b.oxidase;
        return {
          testId,
          viewType: 'biochem',
          biochemMode: 'oxidase',
          pos,
          badge: pos ? 'OSSIDASI POSITIVO (+)' : 'OSSIDASI NEGATIVO (−)',
          tone: pos ? 'purple' : 'neutral',
          detail: pos
            ? 'La striscia reattiva di Kovacs vira rapidamente al VIOLA SCURO indofenolo (< 10 s): presenza di citocromo c ossidasi.'
            : 'Nessun viraggio cromatico della striscia reattiva entro 30 secondi (citocromo ossidasi assente).'
        };
      }

      case 'coagulase': {
        const pos = b.coagulase;
        return {
          testId,
          viewType: 'biochem',
          biochemMode: 'coagulase',
          pos,
          badge: pos ? 'COAGULASI POSITIVO (+)' : 'COAGULASI NEGATIVO (−)',
          tone: pos ? 'amber' : 'neutral',
          detail: pos
            ? 'Formazione di un solido coagulo di fibrina che non scorre inclinando la provetta di plasma!'
            : 'Il plasma rimane completamente fluido e scorrevole inclinando la provetta (nessuna coagulazione).'
        };
      }

      case 'urease': {
        const st = b.urease;
        const badge =
          st === 'strong_pos'
            ? 'UREASI RAPIDA (+++)'
            : st === 'pos'
            ? 'UREASI POSITIVO (+)'
            : 'UREASI NEGATIVO (−)';
        return {
          testId,
          viewType: 'biochem',
          biochemMode: 'urease',
          ureaseState: st,
          badge,
          tone: st !== 'neg' ? 'pink' : 'neutral',
          detail:
            st === 'strong_pos'
              ? 'Viraggio lampo dell’intero brodo di Christensen al FUCSIA NEON intenso per massiva liberazione di ammoniaca!'
              : st === 'pos'
              ? 'Viraggio progressivo del terreno al rosa-fucsia alcalino (idrolisi dell’urea positiva).'
              : 'Il brodo all’urea mantiene il colore giallo-pesca originale (nessuna alcalinizzazione).'
        };
      }

      case 'indole_oxygen': {
        const oxMap = {
          obligate_aerobe: 'Aerobio Obbligato (crescita solo in superficie)',
          facultative: 'Anaerobio Facoltativo (crescita diffusa)',
          obligate_anaerobe: 'Anaerobio Obbligato (crescita solo sul fondo)',
          microaerophile: 'Microaerofilo (banda sub-superficiale a basso O₂)'
        };
        const oxShort = {
          obligate_aerobe: 'AEROBIO STRETTO',
          facultative: 'FACOLTATIVO',
          obligate_anaerobe: 'ANAEROBIO OBBL.',
          microaerophile: 'MICROAEROFILO'
        };
        return {
          testId,
          viewType: 'biochem',
          biochemMode: 'indole_oxygen',
          indole: b.indole,
          oxygen: b.oxygen,
          badge: `INDOLO ${b.indole ? '+' : '−'} · ${oxShort[b.oxygen]}`,
          tone: b.indole ? 'danger' : 'info',
          detail: `Reattivo di Kovacs: ${
            b.indole ? 'ANELLO ROSSO CILIEGIA positivo in superficie' : 'anello giallo (Indolo negativo)'
          }. Tioglicolato: ${oxMap[b.oxygen]}.`
        };
      }

      case 'disks': {
        const d = b.disks;
        return {
          testId,
          viewType: 'biochem',
          biochemMode: 'disks',
          disks: d,
          badge: `P:${d.optochin} · A:${d.bacitracin} · NV:${d.novobiocin}`,
          tone: d.optochin === 'S' || d.bacitracin === 'S' ? 'success' : 'info',
          detail: `Optochina (P): ${d.optochin === 'S' ? 'SENSIBILE (alone ≥14 mm)' : 'Resistente'} | Bacitracina (A): ${
            d.bacitracin === 'S' ? 'SENSIBILE (alone ≥15 mm)' : 'Resistente'
          } | Novobiocina (NV): ${d.novobiocin === 'S' ? 'SENSIBILE (≥16 mm)' : 'Resistente'}.`
        };
      }

      // ================= TERRENI SPECIFICI =================
      case 'blood_agar': {
        const r = mp.blood;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'blood_agar',
            badge: 'NESSUNA CRESCITA',
            tone: 'neutral',
            detail: r.note || 'Assenza di crescita su Agar Sangue di montone standard in incubazione ordinaria.',
            petriSpec: {
              agarColor: '#8d191e',
              agarRimColor: '#5c0d11',
              growth: false
            }
          };
        }
        const hemBadge =
          r.hemolysis === 'beta'
            ? r.narrowHalo
              ? 'β-EMOLISI STRETTA'
              : 'β-EMOLISI COMPLETA'
            : r.hemolysis === 'alpha'
            ? 'α-EMOLISI (VERDE)'
            : r.swarming
            ? 'γ-EMOLISI + SWARMING'
            : 'γ-EMOLISI (ASSENTE)';
        return {
          testId,
          viewType: 'petri',
          mediumId: 'blood_agar',
          badge: hemBadge,
          tone: r.hemolysis === 'beta' ? 'amber' : r.hemolysis === 'alpha' ? 'success' : 'info',
          detail: r.note,
          petriSpec: {
            agarColor: '#8d191e',
            agarRimColor: '#570c10',
            growth: true,
            colonyColor: r.colonyColor || '#e2e8f0',
            hemolysis: r.hemolysis,
            narrowHalo: !!r.narrowHalo,
            wideHalo: !!r.wideHalo,
            swarming: !!r.swarming,
            requiresBacklightHint: r.hemolysis !== 'gamma'
          }
        };
      }

      case 'macconkey': {
        const r = mp.macconkey;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'macconkey',
            badge: 'INIBITO (Nessuna crescita)',
            tone: 'neutral',
            detail: 'Crescita completamente inibita da sali biliari e cristalvioletto (tipico dei Gram-positivi ed esigenti).',
            petriSpec: {
              agarColor: '#a34865',
              agarRimColor: '#6d283f',
              growth: false
            }
          };
        }
        const isPos = r.lactose === 'strong' || r.lactose === 'mucoid_pink';
        const isLate = r.lactose === 'late';
        return {
          testId,
          viewType: 'petri',
          mediumId: 'macconkey',
          badge: isPos ? 'CRESCITA · LATTOSIO (+)' : isLate ? 'CRESCITA · LATTOSIO LENTO' : 'CRESCITA · LATTOSIO (−)',
          tone: isPos ? 'pink' : 'amber',
          detail: r.note,
          petriSpec: {
            agarColor: isPos ? '#b33968' : '#b87d65',
            agarRimColor: isPos ? '#751c3f' : '#784c3a',
            growth: true,
            colonyColor: isPos ? '#ff4d8d' : isLate ? '#f29ca3' : '#e6d5b8',
            mucoidOverride: r.lactose === 'mucoid_pink',
            agarHaloColor: r.lactose === 'strong' ? 'rgba(255, 92, 155, 0.36)' : null
          }
        };
      }

      case 'msa': {
        const r = mp.msa;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'msa',
            badge: 'INIBITO (7.5% NaCl)',
            tone: 'neutral',
            detail: 'Nessuna crescita: l’elevata concentrazione salina (7.5% NaCl) inibisce questo microrganismo.',
            petriSpec: {
              agarColor: '#c94a63',
              agarRimColor: '#85273a',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'msa',
          badge: r.mannitol ? 'CRESCITA · MANNITOLO (+ Giallo)' : 'CRESCITA · MANNITOLO (− Rosa)',
          tone: r.mannitol ? 'amber' : 'pink',
          detail: r.note,
          petriSpec: {
            agarColor: r.mannitol ? '#d49b1a' : '#c94a63',
            agarRimColor: r.mannitol ? '#8c6207' : '#85273a',
            growth: true,
            colonyColor: r.mannitol ? '#ffe066' : '#ffd6e0',
            agarHaloColor: r.mannitol ? 'rgba(255, 225, 75, 0.5)' : null
          }
        };
      }

      case 'emb': {
        const r = mp.emb;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'emb',
            badge: 'INIBITO (Nessuna crescita)',
            tone: 'neutral',
            detail: 'Crescita inibita da eosina Y e blu di metilene.',
            petriSpec: {
              agarColor: '#4c1d4b',
              agarRimColor: '#2b0d2a',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'emb',
          badge: r.metallicSheen ? 'VERDE METALLICO (+)' : 'CRESCITA SENZA RIFLESSO',
          tone: r.metallicSheen ? 'success' : 'info',
          detail: r.note,
          petriSpec: {
            agarColor: '#4c1d4b',
            agarRimColor: '#290c28',
            growth: true,
            colonyColor: r.colonyColor || '#cbbec9',
            metallicSheen: !!r.metallicSheen
          }
        };
      }

      case 'xld': {
        const r = mp.xld;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'xld',
            badge: 'INIBITO (Nessuna crescita)',
            tone: 'neutral',
            detail: 'Crescita inibita dal sodio desossicolato.',
            petriSpec: {
              agarColor: '#bf3b3b',
              agarRimColor: '#7a1f1f',
              growth: false
            }
          };
        }
        const badgeMap = {
          red_black: 'COLONIE ROSSE · H₂S NERO (+)',
          red_clear: 'COLONIE ROSSE · H₂S (−)',
          yellow: 'COLONIE GIALLE · H₂S (−)'
        };
        return {
          testId,
          viewType: 'petri',
          mediumId: 'xld',
          badge: badgeMap[r.xldType],
          tone: r.h2s ? 'danger' : r.xldType === 'yellow' ? 'amber' : 'pink',
          detail: r.note,
          petriSpec: {
            agarColor: r.xldType === 'yellow' ? '#c98a24' : '#bf3b3b',
            agarRimColor: r.xldType === 'yellow' ? '#85570d' : '#7a1f1f',
            growth: true,
            colonyColor: r.xldType === 'yellow' ? '#fde047' : '#f87171',
            blackCenter: !!r.h2s
          }
        };
      }

      case 'chocolate': {
        const r = mp.chocolate;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'chocolate',
            badge: 'NESSUNA CRESCITA',
            tone: 'neutral',
            detail: r.note || 'Nessuna crescita su Agar Cioccolato in atmosfera arricchita di CO₂.',
            petriSpec: {
              agarColor: '#5c331e',
              agarRimColor: '#3b1e10',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'chocolate',
          badge: 'CRESCITA POSITIVA (+)',
          tone: 'success',
          detail: r.note,
          petriSpec: {
            agarColor: '#5c331e',
            agarRimColor: '#3b1e10',
            growth: true,
            colonyColor: r.colonyColor || '#e2e8f0',
            swarming: !!r.swarming
          }
        };
      }

      case 'tcbs': {
        const r = mp.tcbs;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'tcbs',
            badge: 'INIBITO (Nessuna crescita)',
            tone: 'neutral',
            detail: 'Crescita completamente inibita dall’alcalinità (pH 8.6), citrato e sali biliari del TCBS.',
            petriSpec: {
              agarColor: '#1b6b63',
              agarRimColor: '#0e423d',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'tcbs',
          badge: 'COLONIE GIALLE · SACCAROSIO (+)',
          tone: 'amber',
          detail: r.note,
          petriSpec: {
            agarColor: '#2f7a58',
            agarRimColor: '#164731',
            growth: true,
            colonyColor: '#facc15',
            agarHaloColor: 'rgba(250, 204, 21, 0.45)'
          }
        };
      }

      case 'bile_esculin': {
        const r = mp.bileEsculin;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'bile_esculin',
            badge: 'INIBITO DALLA BILE',
            tone: 'neutral',
            detail: 'Il batterio è inibito dall’elevata concentrazione di sali biliari (40% bile).',
            petriSpec: {
              agarColor: '#9c7c44',
              agarRimColor: '#634d26',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'bile_esculin',
          badge: r.black ? 'ESCULINA POSITIVO (NERO +)' : 'CRESCITA · ESCULINA (−)',
          tone: r.black ? 'success' : 'neutral',
          detail: r.note,
          petriSpec: {
            agarColor: r.black ? '#1e1b18' : '#9c7c44',
            agarRimColor: r.black ? '#0c0a09' : '#634d26',
            growth: true,
            colonyColor: r.black ? '#d6d3d1' : '#e7e5e4',
            agarHaloColor: r.black ? 'rgba(10, 10, 10, 0.7)' : null
          }
        };
      }

      case 'cetrimide': {
        const r = mp.cetrimide;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'cetrimide',
            badge: 'INIBITO DALLA CETRIMIDE',
            tone: 'neutral',
            detail: 'Nessuna crescita: il detergente cationico cetrimide inibisce completamente questo ceppo.',
            petriSpec: {
              agarColor: '#cfd8cc',
              agarRimColor: '#8d998a',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'cetrimide',
          badge: 'PIOCIANINA BLU-VERDE (+)',
          tone: 'success',
          detail: r.note,
          petriSpec: {
            agarColor: '#178577',
            agarRimColor: '#0c4d44',
            growth: true,
            colonyColor: '#a7f3d0',
            agarHaloColor: 'rgba(52, 211, 153, 0.48)'
          }
        };
      }

      case 'lowenstein': {
        const r = mp.lowenstein;
        if (!r.growth) {
          return {
            testId,
            viewType: 'petri',
            mediumId: 'lowenstein',
            badge: 'NESSUNA CRESCITA MICOBATTERICA',
            tone: 'neutral',
            detail: 'Inibito dal verde malachite o assenza delle tipiche colonie micobatteriche su terreno all’uovo.',
            petriSpec: {
              agarColor: '#4c956c',
              agarRimColor: '#2c5e43',
              growth: false
            }
          };
        }
        return {
          testId,
          viewType: 'petri',
          mediumId: 'lowenstein',
          badge: 'COLONIE A CAVOLFIORE (+)',
          tone: 'success',
          detail: r.note,
          petriSpec: {
            agarColor: '#4c956c',
            agarRimColor: '#2c5e43',
            growth: true,
            colonyColor: '#ead7b7',
            roughOverride: true
          }
        };
      }

      default:
        return null;
    }
  }

  window.BioGuessrData = {
    TESTS_CATALOG,
    BACTERIA_DB,
    evaluateTest
  };
})();
