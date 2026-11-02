# 🧫 BioGuessr Lab — Simulatore Diagnostico di Microbiologia

Un simulatore interattivo di laboratorio microbiologico e diagnostica clinica con **100 specie batteriche certificate**, microscopio ottico a immersione ($1000\times$), colorazioni differenziali (Gram, Ziehl-Neelsen, spore, capsula), prove biochimiche e l'**Albero Genealogico dei Batteri** (*Dominio $\rightarrow$ Phylum $\rightarrow$ Classe $\rightarrow$ Ordine $\rightarrow$ Famiglia $\rightarrow$ Genere $\rightarrow$ Specie*).

---

## 🚀 Come Condividere il Sito Web con Chiunque

Il sito è completamente statico (HTML5, CSS3, JavaScript puro, Canvas 2D e Three.js), privo di dipendenze di build o server backend complessi. Tutti i percorsi degli asset sono strettamente relativi: puoi ospitarlo e condividerlo immediatamente in uno dei seguenti modi gratuiti:

### Metodo 1: GitHub Pages (Consigliato per link pubblico permanente)
1. Crea un nuovo repository pubblico su [GitHub](https://github.com/new) (es. `bioguessr-lab`).
2. Dal terminale in questa cartella esegui:
   ```bash
   git add .
   git commit -m "BioGuessr Lab v3.2: 100 specie, microscopio e condivisione"
   git branch -M main
   git remote add origin https://github.com/TUO_USERNAME/bioguessr-lab.git
   git push -u origin main
   ```
3. Su GitHub, vai in **Settings** $\rightarrow$ **Pages** $\rightarrow$ **Build and deployment** $\rightarrow$ Seleziona **Deploy from a branch** e scegli `main` / `root`.
4. Il tuo sito sarà immediatamente online e condivisibile all'indirizzo:
   `https://TUO_USERNAME.github.io/bioguessr-lab/`

### Metodo 2: Netlify Drop (Condivisione istantanea in 30 secondi, senza terminale)
1. Vai su [app.netlify.com/drop](https://app.netlify.com/drop).
2. Trascina l'intera cartella del progetto (`Project 1`) nel riquadro di caricamento.
3. Riceverai all'istante un link pubblico gratuito (es. `https://bioguessr-lab-xyz.netlify.app`) condivisibile con chiunque!

### Metodo 3: Vercel (1 comando)
Se hai Node.js installato:
```bash
npx vercel
```
Segui le istruzioni a schermo per ottenere un link `https://bioguessr-lab.vercel.app` in meno di un minuto.

### Metodo 4: Condivisione Immediata sulla Rete Locale (Wi-Fi)
Per far provare il sito a colleghi o amici connessi alla stessa rete Wi-Fi (anche da smartphone o tablet):
```bash
npx serve -l 3000
```
oppure con Python:
```bash
python -m http.server 3000 --bind 0.0.0.0
```
Chiunque sulla tua stessa rete potrà aprire il browser all'indirizzo:
`http://TUO-INDIRIZZO-IP-LOCALE:3000` (es. `http://192.168.1.100:3000`).

---

## 🔗 Funzionalità di Condivisione Integrata (Web Share API & Sfide)
- **Tasto "🔗 Condividi" nel menu e nella schermata iniziale**: genera un link e apre la finestra nativa di condivisione su smartphone/tablet (WhatsApp, Telegram, email, social) oppure copia automaticamente il link negli appunti con notifica toast.
- **Sfide Dirette su Singolo Ceppo**: puoi sfidare colleghi o amici sullo stesso identico batterio misterioso condividendo l'URL con il parametro `?sample=<id>` (es. `https://iltuosito.com/?sample=bacillus_anthracis` o `?sample=escherichia_coli`).
- **Condivisione Risultato di Fine Diagnosi**: al termine della diagnosi, il pulsante *"Condividi Diagnosi"* genera un messaggio di sfida personalizzato con il punteggio ottenuto e il ceppo misterioso.

---

## 🔬 Caratteristiche del Laboratorio
- **100 Specie Batteriche Certificate** cliniche, ambientali e alimentari con schede scientifiche complete.
- **Doppia Modalità**:
  - *Modalità Standard*: visualizzazione rapida con microscopia procedurale nitida immediata a $1000\times$.
  - *Modalità Realistica*: bancone 3D, cappa BSL-2 con semina automatica a 4 quadranti, immersione in olio, messa a fuoco manuale e micrografie reali ad alta definizione da letteratura scientifica (CDC PHIL / open-access).
- **Albero Genealogico Tassonomico**: esplorazione ad albero interattivo con ricerca filogenetica, nodi espandibili e ispettore laterale.
- **Blocchetto Note & Atlante Scientifico**: consultazione dei test diagnostici e della letteratura peer-reviewed.
