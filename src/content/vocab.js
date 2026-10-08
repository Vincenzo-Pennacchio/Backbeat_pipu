// Parole: carte per la ripetizione spaziata. Formato: [inglese, italiano, esempio, mazzo]
export const DECKS = {
  music: { name: 'Musica', icon: '♪' },
  drums: { name: 'Batteria', icon: '🥁' },
  build: { name: 'Costruire', icon: '🧱' },
  phrasal: { name: 'Phrasal verbs', icon: '↗' },
  talk: { name: 'Per parlare', icon: '💬' },
  linkers: { name: 'Connettivi', icon: '🔗' },
};

const RAW = [
  // ── Musica ──────────────────────────────────────────────
  ['beat', 'battito, tempo', 'Can you feel the beat?', 'music'],
  ['rhythm', 'ritmo', 'Bossa nova has a soft, swinging rhythm.', 'music'],
  ['groove', 'groove, andamento ritmico', 'The bass and drums lock into a groove.', 'music'],
  ['melody', 'melodia', 'The saxophone plays the melody.', 'music'],
  ['harmony', 'armonia', 'Jazz harmony uses a lot of rich chords.', 'music'],
  ['chord', 'accordo', 'The guitarist plays three chords.', 'music'],
  ['scale', 'scala', 'Blues players love the blues scale.', 'music'],
  ['key', 'tonalità', 'This song is in the key of F.', 'music'],
  ['bar', 'battuta', 'A twelve-bar blues has twelve bars.', 'music'],
  ['sheet music', 'spartito', 'I can’t read sheet music yet.', 'music'],
  ['to improvise', 'improvvisare', 'Jazz musicians improvise their solos.', 'music'],
  ['gig', 'serata, concerto', 'We’ve got a gig on Saturday night.', 'music'],
  ['rehearsal', 'prova', 'Rehearsal starts at five.', 'music'],
  ['audience', 'pubblico', 'The audience clapped for five minutes.', 'music'],
  ['lyrics', 'testo di una canzone', 'I know all the lyrics by heart.', 'music'],
  ['stage', 'palco', 'The band walked onto the stage.', 'music'],
  ['to tune', 'accordare', 'Always tune your drums before a gig.', 'music'],
  ['composer', 'compositore', 'Beethoven was a German composer.', 'music'],

  // ── Batteria ────────────────────────────────────────────
  ['drum kit', 'batteria (lo strumento)', 'My drum kit has five pieces.', 'drums'],
  ['snare drum', 'rullante', 'The snare drum plays the backbeat.', 'drums'],
  ['bass drum', 'cassa', 'Press the pedal to play the bass drum.', 'drums'],
  ['hi-hat', 'charleston', 'Keep the time on the hi-hat.', 'drums'],
  ['ride cymbal', 'piatto ride', 'Jazz drummers play the ride cymbal a lot.', 'drums'],
  ['crash cymbal', 'piatto crash', 'Hit the crash cymbal at the end of the fill.', 'drums'],
  ['floor tom', 'timpano', 'The floor tom has a deep sound.', 'drums'],
  ['sticks', 'bacchette', 'I broke my sticks during the show.', 'drums'],
  ['brushes', 'spazzole', 'Use brushes for a soft bossa nova.', 'drums'],
  ['drumhead', 'pelle', 'This drumhead needs to be changed.', 'drums'],
  ['fill', 'fill, passaggio', 'He played a great fill before the chorus.', 'drums'],
  ['roll', 'rullo', 'A snare roll builds up the tension.', 'drums'],
  ['to keep time', 'tenere il tempo', 'A good drummer keeps time for the band.', 'drums'],
  ['backbeat', 'accenti sul 2 e sul 4', 'Rock music has a strong backbeat.', 'drums'],
  ['pedal', 'pedale', 'My bass drum pedal squeaks.', 'drums'],

  // ── Costruire ───────────────────────────────────────────
  ['brick', 'mattoncino', 'I need one more red brick.', 'build'],
  ['stud', 'bottoncino (sopra il mattoncino)', 'A classic brick has eight studs.', 'build'],
  ['baseplate', 'base', 'Start building on a green baseplate.', 'build'],
  ['piece', 'pezzo', 'This set has over two thousand pieces.', 'build'],
  ['instructions', 'istruzioni', 'Follow the instructions step by step.', 'build'],
  ['to snap together', 'incastrare', 'The bricks snap together easily.', 'build'],
  ['gear', 'ingranaggio', 'Turn the gear to move the crane.', 'build'],
  ['axle', 'asse', 'The wheels spin on an axle.', 'build'],
  ['minifigure', 'minifigure, omino', 'The set comes with four minifigures.', 'build'],
  ['to design', 'progettare', 'I want to design my own spaceship.', 'build'],

  // ── Phrasal verbs ───────────────────────────────────────
  ['count in', 'dare l’attacco', 'The drummer counts the band in.', 'phrasal'],
  ['warm up', 'riscaldarsi', 'Always warm up before you play.', 'phrasal'],
  ['set up', 'montare, preparare', 'We set up the drums in ten minutes.', 'phrasal'],
  ['turn up', 'alzare (il volume)', 'Turn up the bass a little.', 'phrasal'],
  ['turn down', 'abbassare (il volume)', 'Please turn it down, I’m studying!', 'phrasal'],
  ['try out (for)', 'fare un provino', 'She tried out for the school band.', 'phrasal'],
  ['play along (with)', 'suonare sopra un brano', 'I play along with my favourite records.', 'phrasal'],
  ['figure out', 'capire, risolvere', 'I figured out the rhythm of that song.', 'phrasal'],
  ['come up with', 'inventare, avere un’idea', 'He came up with a great fill.', 'phrasal'],
  ['keep up (with)', 'stare al passo', 'The tempo is fast. Can you keep up?', 'phrasal'],
  ['carry on', 'continuare', 'Carry on, you’re doing great!', 'phrasal'],
  ['put together', 'assemblare', 'I put the set together in one afternoon.', 'phrasal'],
  ['take apart', 'smontare', 'We took the old model apart.', 'phrasal'],
  ['run out of', 'finire, restare senza', 'We ran out of red bricks.', 'phrasal'],
  ['look up', 'cercare (un’informazione)', 'Look up the word in the dictionary.', 'phrasal'],
  ['find out', 'scoprire', 'I found out that Lego means “play well”.', 'phrasal'],
  ['give up', 'arrendersi, smettere', 'Don’t give up, you’re almost there!', 'phrasal'],
  ['pick up', 'andare a prendere', 'Can you pick me up after rehearsal?', 'phrasal'],
  ['show up', 'presentarsi, arrivare', 'Only three people showed up.', 'phrasal'],
  ['look forward to', 'non vedere l’ora di', 'I’m looking forward to the concert.', 'phrasal'],

  // ── Per parlare ─────────────────────────────────────────
  ['How’s it going?', 'Come va?', 'Hey Leo, how’s it going?', 'talk'],
  ['What are you into?', 'Cosa ti appassiona?', 'So, what are you into? Jazz? Rock?', 'talk'],
  ['I totally agree.', 'Sono completamente d’accordo.', 'Miles Davis is a genius. I totally agree.', 'talk'],
  ['I see your point, but…', 'Capisco cosa intendi, ma…', 'I see your point, but I prefer blues.', 'talk'],
  ['Could you say that again?', 'Puoi ripetere?', 'Sorry, could you say that again?', 'talk'],
  ['What does … mean?', 'Cosa significa…?', 'What does “gig” mean?', 'talk'],
  ['How about…?', 'Che ne dici di…?', 'How about playing a bossa nova?', 'talk'],
  ['Why don’t we…?', 'Perché non…?', 'Why don’t we meet at four?', 'talk'],
  ['Let me think.', 'Fammi pensare.', 'My favourite album? Let me think.', 'talk'],
  ['By the way', 'A proposito', 'By the way, have you heard the new album?', 'talk'],
  ['It sounds great!', 'Sembra fantastico! / Suona benissimo!', 'A jam on Friday? It sounds great!', 'talk'],
  ['Take care!', 'Stammi bene!', 'See you on Thursday. Take care!', 'talk'],

  // ── Connettivi ──────────────────────────────────────────
  ['because', 'perché', 'I practise because I want to join a band.', 'linkers'],
  ['so', 'quindi', 'It was late, so we stopped.', 'linkers'],
  ['but', 'ma', 'I like jazz, but I don’t like opera.', 'linkers'],
  ['although', 'anche se', 'Although it was late, we kept playing.', 'linkers'],
  ['however', 'tuttavia', 'The set was hard. However, I finished it.', 'linkers'],
  ['then', 'poi', 'First we set up, then we played.', 'linkers'],
  ['in addition', 'inoltre', 'In addition, the text describes the first records.', 'linkers'],
  ['according to', 'secondo', 'According to the author, blues was born in the South.', 'linkers'],
  ['in short', 'in breve', 'In short, bossa nova mixes samba and jazz.', 'linkers'],
  ['to sum up', 'per riassumere', 'To sum up, the hi-hat changed drumming.', 'linkers'],
];

const slug = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const VOCAB = RAW.map(([en, it, ex, deck]) => ({ id: `${deck}-${slug(en)}`, en, it, ex, deck }));
export const vocabById = (id) => VOCAB.find((v) => v.id === id);
