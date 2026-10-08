# Backbeat

L'app di inglese di Pipu: grammatica a tempo di batteria, frasi a mattoncini, dialoghi, riassunti e un libro separato dal gioco (anche in PDF).
PWA in React 19 + Vite, pensata per il telefono, deploy su Netlify.

## Cosa c'è dentro

| Sezione | Cosa fa |
|---|---|
| **Palco** (home) | Livello = tempo in BPM, serie di giorni, la setlist di oggi (3 attività scelte in base ai punti deboli, +60 XP se le chiude tutte) |
| **Drill a tempo** | 128 domande sui 4 pad della batteria. Metronomo, 3 vite (bacchette), ogni 5 giuste di fila il tempo accelera di 8 BPM |
| **Costruisci la frase** | 31 frasi da montare con mattoncini colorati per funzione (soggetto, verbo…), con pezzi trappola |
| **Parole** | 85 carte in 6 mazzi con ripetizione spaziata (1, 2, 4, 8, 16, 32 giorni) |
| **Jam** | 6 dialoghi a scelta con audio, traduzione e spiegazione degli errori |
| **Riassunti** | 4 testi (bossa nova, LEGO, blues, Beethoven): idee principali, riassunto migliore, riassunto scritto con checklist |
| **Parla con Theo** | Tutor AI opzionale (serve una chiave Anthropic) |
| **Libro** | 14 capitoli: Lato A il ripasso, Lato B le novità. Lettura in app o PDF |
| **Dischi** | Statistiche, mixer della padronanza per argomento, 15 trofei, impostazioni |

Il progresso sta nel `localStorage` del telefono (chiave `bb_pipu_v1`): niente account, niente server, ma anche niente sincronizzazione tra dispositivi.

## Avvio in locale

```bash
npm install
npm run dev          # http://localhost:5173 (service worker spento in sviluppo)
npm run build        # controlla i contenuti e poi compila in dist/
npm run preview      # prova la build vera, con service worker
```

`npm run build` lancia prima `npm run check`: se una domanda ha opzioni doppie, un dialogo ha due risposte giuste, una parola del glossario non è nel testo ecc., la build si ferma e dice dove.

Il tutor non gira con `npm run dev` (la funzione è di Netlify). Per provarlo in locale: `npx netlify dev` con `ANTHROPIC_API_KEY` in un file `.env`.

## Deploy su Netlify (come Luna & Letters)

1. Crea un repo su GitHub e fai push di questa cartella (`node_modules` e `dist` sono già in `.gitignore`).
2. Su Netlify: **Add new site → Import an existing project → GitHub**, scegli il repo. Le impostazioni di build sono già in `netlify.toml` (`npm run build`, cartella `dist`, funzioni in `netlify/functions`, Node 22).
3. Ogni `git push` rifà il deploy.

### Attivare Theo (facoltativo)

In **Site configuration → Environment variables**:

| Variabile | Obbligatoria | Valore |
|---|---|---|
| `ANTHROPIC_API_KEY` | sì, per attivare Theo | la tua chiave |
| `ALLOWED_ORIGIN` | consigliata | l'URL del sito, es. `https://backbeat-pipu.netlify.app` |
| `ANTHROPIC_MODEL` | no | default `claude-haiku-4-5-20251001` |
| `LEARNER_NAME` | no | default `Pipu` |

Poi rifai il deploy. **Importante:** l'endpoint `/.netlify/functions/chat` è pubblico. `ALLOWED_ORIGIN` blocca le chiamate dai browser di altri siti, ma non da script. Imposta un limite di spesa mensile sulla chiave dalla console Anthropic.

Senza chiave l'app funziona uguale: la chat mostra "Theo non è collegato" e il riassunto scritto viene valutato solo dalla checklist.

## Installarla sul telefono di Pipu

- **iPhone:** apri il link in Safari → Condividi → *Aggiungi alla schermata Home*. Meglio installarla: nelle schede normali di Safari, iOS può cancellare i dati dei siti non visitati per un po'.
- **Android:** Chrome propone *Installa app*, oppure menu → *Aggiungi a schermata Home*.

## Modificare i contenuti

Tutto il contenuto è in `src/content/`, in file JS semplici da leggere:

- `book.js`: capitoli del libro (blocchi: titoletti, tabelle, esempi, errori tipici, "Prova tu")
- `drill.js`: domande. La risposta giusta va sempre **per prima**, l'ordine si mescola da solo
- `bricks.js`: frasi a mattoncini, con trappole e ordini alternativi accettati
- `vocab.js`, `dialogues.js`, `texts.js`: parole, dialoghi, testi da riassumere

Dopo una modifica: `npm run check`.

### Rigenerare i PDF

I PDF sono già in `public/pdf/` e vengono pubblicati così come sono. Se cambi `book.js`:

```bash
npm i --no-save playwright pdf-lib
npx playwright install chromium
npm run book
```

Lo script rigenera un PDF per capitolo e il libro completo (copertina, indice con i numeri di pagina veri, soluzioni di "Prova tu" in fondo a ogni capitolo).

## Rifarla per qualcun altro

1. `src/config.js`: nome, "da parte di", nome dell'app e soprattutto **`storageKey` diversa** (altrimenti due app sullo stesso dominio si sovrascrivono i progressi).
2. I contenuti in `src/content/` se gli interessi sono diversi.
3. `LEARNER_NAME` su Netlify se usi il tutor.

## Aggiornamenti e cache

Il service worker (`public/sw.js`) scarica la pagina sempre dalla rete quando c'è connessione, quindi gli aggiornamenti arrivano al primo avvio online. Offline usa la copia in cache. Se qualcosa resta vecchio, cambia `VERSION` in `sw.js`.

## Limiti noti

- **"4th conditional"**: nelle grammatiche non esiste. Il capitolo B2 lo spiega a Pipu e tratta i **condizionali misti**, che è quasi sempre ciò che si intende a scuola con quel nome.
- **Notifiche push** non incluse: richiederebbero un server e su iPhone funzionano solo con l'app installata.
- **iPhone**: con il tasto silenzioso attivo i suoni della batteria non si sentono (è una regola di iOS per Web Audio). Il riconoscimento vocale nella chat c'è solo nei browser che lo supportano; altrimenti il microfono non compare.
- Il tutor è stato testato solo con risposte simulate, non con una chiave vera.
