# 🧫 BioGuessr Lab — Simulatore Diagnostico di Microbiologia

[![Specie Batteriche](https://img.shields.io/badge/Specie%20Batteriche-100%20Certificate-0284c7?style=for-the-badge&logo=microgenetics)](https://github.com/uomonero08/bioguessr-lab)
[![Livello Biosicurezza](https://img.shields.io/badge/Biosicurezza-BSL--2%20Compliant-16a34a?style=for-the-badge)](https://github.com/uomonero08/bioguessr-lab)
[![Tech](https://img.shields.io/badge/Tecnologia-HTML5%20%7C%20Three.js%20%7C%20Canvas%202D-0f766e?style=for-the-badge)](https://github.com/uomonero08/bioguessr-lab)

> **BioGuessr Lab** è un simulatore interattivo ed educativo di laboratorio di microbiologia clinica. Mettiti nei panni di un microbiologo: esamina campioni misteriosi, esegui colorazioni di Gram a immersione in olio ($1000\times$), semina sotto cappa di biosicurezza BSL-2 e consulta l'Albero Genealogico dei batteri per identificare l'isolato corretto prima di esaurire i 5 tentativi!

---

## 🌟 Caratteristiche Principali

### 🔬 Database di 100 Specie Batteriche Certificate
Copertura completa dei principali microrganismi di interesse **clinico, alimentare, farmaceutico e ambientale**:
- Stafilococchi, Streptococchi ed Enterococchi
- Enterobatteri (*E. coli*, *Salmonella*, *Klebsiella*, *Proteus*, *Shigella*, ecc.)
- Bacilli sporigeni aerobi e anaerobi obbligati (*Bacillus*, *Clostridium*)
- Micobatteri e batteri acido-resistenti (*Mycobacterium tuberculosis*, *M. avium*, *Nocardia*)
- Batteri esigenti e microaerofili (*Neisseria*, *Haemophilus*, *Helicobacter*, *Campylobacter*, *Vibrio*)

Ogni specie è corredata da scheda tassonomica completa a 7 livelli, morfologia al microscopio, profilo biochimico, comportamento colturale e **letteratura scientifica peer-reviewed di riferimento** (*CDC PHIL*, *Bergey's Manual*, *Clinical Microbiology Reviews*, *Journal of Clinical Microbiology*).

---

### 🥼 Doppia Modalità di Laboratorio

1. **⚡ Modalità Standard (Veloce)**:
   - Risultati immediati e microscopia procedurale nitida a $1000\times$.
   - Ideale per esercitarsi rapidamente nella diagnostica differenziale e memorizzare gli schemi biochimici.

2. **🥽 Modalità Realistica (Simulazione Completa BSL-2)**:
   - **Bancone da Laboratorio 3D** (sviluppato in Three.js) con microscopio ottico, piastre Petri e taccuino.
   - **Semina Automatica sotto Cappa Laminare**: animazione realistica dello striscio a quattro quadranti con ansa di platino e incubazione a 37°C.
   - **Postazione Microscopica Interattiva**: selezione degli obiettivi ($10\times$, $40\times$, $100\times$), applicazione dell'olio di cedro, regolazione della messa a fuoco macro/micrometrica e condensatore.
   - **Micrografie Ottiche Reali**: visualizzazione di immagini autentiche da pubblicazioni scientifiche e banche dati CDC.

---

### 🌳 Albero Genealogico & Filogenesi dei Batteri
Uno strumento didattico avanzato integrato nell'Atlante per esplorare l'inquadramento evolutivo dei procarioti:
$$\text{Dominio (Bacteria)} \longrightarrow \text{Phylum (6)} \longrightarrow \text{Classe (9)} \longrightarrow \text{Ordine (20)} \longrightarrow \text{Famiglia (35)} \longrightarrow \text{Genere (55)} \longrightarrow \text{Specie (100)}$$
- **Rami interattivi collassabili** con ricerca testuale in tempo reale ed espansione automatica.
- **Side Inspector**: anteprima immediata di microscopia, colorazione Gram, famiglia di appartenenza e metodo Gold Standard cliccando su qualsiasi nodo.

---

### 🧪 20 Test Diagnostici Disponibili

| Categoria | Test Inclusi |
| :--- | :--- |
| **🔬 Colorazioni** | Colorazione di Gram, Ziehl-Neelsen (BAAR), Colorazione delle Endospore (Schaeffer-Fulton), Esame a Fresco / Inchiostro di China (Capsula e Motilità). |
| **🫧 Prove Biochimiche** | Catalasi / Perossidasi ($H_2O_2$ al 3%), Ossidasi su striscia, Coagulasi in provetta, Ureasi (viraggio fucsia), Indolo & Atmosfera $O_2$ (Tioglicolato), Dischi Antibiotici Diagnostici (Optochina, Bacitracina, Novobiocina). |
| **🧫 Terreni Differenziali & Selettivi** | Agar Sangue (emolisi $\alpha, \beta, \gamma$), MacConkey (fermentazione lattosio), Mannitol Salt Agar MSA, EMB Verde Metallico, XLD (produzione $H_2S$), Agar Cioccolato, TCBS (Vibrioni), Bile-Esculina, Cetrimide, Löwenstein-Jensen. |

---

### 📒 I Due Quaderni di Laboratorio

- **Quaderno #1: Il Blocchetto Note del Microbiologo**
  - Registro storico automatico di tutti i test eseguiti sul ceppo corrente.
  - Foglio a righe per appunti liberi e tag diagnostici rapidi.
  - Checklist interattiva delle 100 specie per depennare i sospetti esclusi durante l'indagine.
- **Quaderno #2: L'Atlante dei Batteri & Dossier Scientifico**
  - Barra filtri rapidi con chip per marcatori diagnostici (Gram+, Gram−, Cocchi, Bacilli, Spore, Capsulati, Ossidasi+, Ureasi+, Mobili, Anaerobi).
  - Schede monografiche complete con micrografia 1000× ad alta risoluzione, caratteristiche coloniali e bibliografia scientifica con PMID.

---

## 🎮 Come si Gioca

1. **Ricevi un Ceppo Misterioso**: all'avvio di ogni turno viene generato un isolato clinico da identificare. Parti da un potenziale di **1.000 punti**.
2. **Conduci le Analisi**: scegli quali prove eseguire (ogni test scala un piccolo costo diagnostico in punti).
3. **Formula la Diagnosi**: digita il nome scientifico del batterio nella barra con autocompletamento.
4. **Attento agli Errori**: hai a disposizione un massimo di **5 errori**. Se sbagli genere o specie ti verranno forniti suggerimenti utili, ma perderai punti preziosi!
5. **Sfida i Colleghi**: al termine del round puoi condividere il risultato o inviare il link diretto al ceppo misterioso per sfidare chiunque a risolverlo.

---

## 🛠️ Architettura Tecnica

- **Zero Dipendenze di Build**: puro HTML5, CSS3 moderno con estetica glassmorphism da laboratorio, JavaScript ES6+ modulare.
- **Rendering 3D**: [Three.js](https://threejs.org/) per il bancone, la cappa a flusso laminare, la piastra Petri e il microscopio binoculare.
- **Canvas 2D Engine**: motore di rendering dedicato per piastre di coltura, colonie vettoriali, reazioni biochimiche e microscopia procedurale.
- **Audio Sintetizzato**: Web Audio API per feedback acustici realistici (ronzio della cappa BSL-2, rotazione della torretta porta-obiettivi, effervescenza di $H_2O_2$, sfoglio delle pagine).
- **Sicurezza**: Content Security Policy (CSP) rigida, sanitizzazione XSS, storage con validazione dello schema e zero cookie traccianti.

---

## 💻 Come Eseguire il Progetto in Locale

Non è necessaria alcuna installazione complessa. Basta clonare il repository e aprire `index.html` in un qualsiasi browser moderno:

```bash
git clone https://github.com/uomonero08/bioguessr-lab.git
cd bioguessr-lab
```

Apri direttamente il file `index.html` oppure avvia un server locale:
```bash
# Con Python
python -m http.server 3000

# Oppure con Node.js
npx serve
```
Visita poi `http://localhost:3000` nel tuo browser.

---

## 📄 Licenza e Fonti Iconografiche

- **Scopo del Progetto**: Educativo, didattico e divulgativo per studenti, docenti e appassionati di scienze biologiche e mediche.
- **Micrografie Reali**: Immagini di pubblico dominio e open-access provenienti dal *CDC Public Health Image Library (PHIL)* e da pubblicazioni scientifiche di microbiologia clinica (tutti i crediti sono consultabili in `assets/micrographs/credits.json`).
