// Costruisci la frase. Ogni mattoncino è "testo|classe".
// Classi (colori): s = soggetto, v = verbo, o = oggetto/complemento, x = tempo/luogo/altro, q = parola interrogativa
// b = mattoncini nell'ordine giusto, x = mattoncini trappola, alt = altri ordini accettati, q = domanda
export const BRICK_CLASSES = {
  s: { name: 'Soggetto', color: 'red' },
  v: { name: 'Verbo', color: 'yellow' },
  o: { name: 'Oggetto', color: 'blue' },
  x: { name: 'Tempo, luogo, altro', color: 'green' },
  q: { name: 'Domanda', color: 'white' },
};

const RAW = [
  { t: 'present', it: 'Mi esercito sempre alla batteria dopo la scuola.', b: ['I|s', 'always|x', 'practise|v', 'the drums|o', 'after school|x'], x: ['practises|v'], alt: ['After school I always practise the drums'] },
  { t: 'present', it: 'A mia sorella non piace l’heavy metal.', b: ['My sister|s', 'doesn’t like|v', 'heavy metal|o'], x: ['don’t like|v'] },
  { t: 'present', it: 'Proviamo il sabato.', b: ['We|s', 'rehearse|v', 'on Saturdays|x'], x: ['in Saturdays|x'], alt: ['On Saturdays we rehearse'] },
  { t: 'present', it: 'Dove suoni di solito?', q: true, b: ['Where|q', 'do|v', 'you|s', 'usually|x', 'play|v'], x: ['does|v'] },
  { t: 'continuous', it: 'Questo mese la band sta registrando un nuovo album.', b: ['The band|s', 'is recording|v', 'a new album|o', 'this month|x'], x: ['records|v'], alt: ['This month the band is recording a new album'] },
  { t: 'continuous', it: 'In questo momento sta costruendo un castello Lego.', b: ['He|s', 'is building|v', 'a Lego castle|o', 'right now|x'], x: ['builds|v'], alt: ['Right now he is building a Lego castle'] },
  { t: 'stative', it: 'Questa canzone suona benissimo.', b: ['This song|s', 'sounds|v', 'amazing|o'], x: ['is sounding|v'] },
  { t: 'stative', it: 'Sento la batteria dalla mia camera.', b: ['I|s', 'can hear|v', 'the drums|o', 'from my room|x'], x: ['am hearing|v'] },
  { t: 'past', it: 'Miles Davis registrò Kind of Blue nel 1959.', b: ['Miles Davis|s', 'recorded|v', 'Kind of Blue|o', 'in 1959|x'], x: ['records|v'], alt: ['In 1959 Miles Davis recorded Kind of Blue'] },
  { t: 'past', it: 'Hai visto il concerto?', q: true, b: ['Did|v', 'you|s', 'see|v', 'the concert|o'], x: ['saw|v'] },
  { t: 'past', it: 'L’anno scorso non siamo andati al festival.', b: ['We|s', 'didn’t go|v', 'to the festival|x', 'last year|x'], x: ['didn’t went|v'], alt: ['Last year we didn’t go to the festival'] },
  { t: 'past', it: 'I musicisti erano molto stanchi dopo lo spettacolo.', b: ['The musicians|s', 'were|v', 'very tired|o', 'after the show|x'], x: ['was|v'], alt: ['After the show the musicians were very tired'] },
  { t: 'pastperf', it: 'Il concerto era già iniziato quando siamo arrivati.', b: ['The concert|s', 'had already started|v', 'when we arrived|x'], x: ['has already started|v'], alt: ['When we arrived the concert had already started'] },
  { t: 'pastperf', it: 'Non avevo mai suonato jazz prima di quel giorno.', b: ['I|s', 'had never played|v', 'jazz|o', 'before that day|x'], x: ['have never played|v'], alt: ['Before that day I had never played jazz'] },
  { t: 'future', it: 'Ho deciso: comprerò un nuovo piatto.', b: ['I|s', 'am going to buy|v', 'a new cymbal|o'], x: ['will to buy|v'] },
  { t: 'future', it: 'Penso che questo album ti piacerà.', b: ['I think|x', 'you|s', 'will love|v', 'this album|o'], x: ['are loving|v'] },
  { t: 'future', it: 'Venerdì suoniamo alla festa della scuola.', b: ['We|s', 'are playing|v', 'at the school party|x', 'on Friday|x'], x: ['in Friday|x'], alt: ['On Friday we are playing at the school party'] },
  { t: 'future', it: 'Ti chiamerò quando arriverò a casa.', b: ['I|s', 'will call|v', 'you|o', 'when I get home|x'], x: ['when I will get home|x'], alt: ['When I get home I will call you'] },
  { t: 'future', it: 'Entro giugno avrò finito questo set Lego.', b: ['By June|x', 'I|s', 'will have finished|v', 'this Lego set|o'], x: ['will have finish|v'], alt: ['I will have finished this Lego set by June'] },
  { t: 'cond', it: 'Se piove, suoneremo al chiuso.', b: ['If it rains|x', 'we|s', 'will play|v', 'inside|x'], x: ['would play|v'], alt: ['We will play inside if it rains'] },
  { t: 'cond', it: 'Se avessi più tempo, costruirei una città Lego.', b: ['If I had more time|x', 'I|s', 'would build|v', 'a Lego city|o'], x: ['will build|v'], alt: ['I would build a Lego city if I had more time'] },
  { t: 'cond', it: 'Se fossimo partiti prima, non avremmo perso l’autobus.', b: ['If we had left earlier|x', 'we|s', 'wouldn’t have missed|v', 'the bus|o'], x: ['didn’t miss|v'], alt: ['We wouldn’t have missed the bus if we had left earlier'] },
  { t: 'cond', it: 'Se fossi in te, mi eserciterei ogni giorno.', b: ['If I were you|x', 'I|s', 'would practise|v', 'every day|x'], x: ['If I am you|x'], alt: ['I would practise every day if I were you'] },
  { t: 'mixed', it: 'Se mi fossi esercitato di più, ora sarei nella band.', b: ['If I had practised more|x', 'I|s', 'would be|v', 'in the band|x', 'now|x'], x: ['would have been|v'], alt: ['I would be in the band now if I had practised more', 'If I had practised more I would be in the band now'] },
  { t: 'mixed', it: 'Se non fosse così timida, ieri avrebbe cantato al concerto.', b: ['If she weren’t so shy|x', 'she|s', 'would have sung|v', 'at the concert|x', 'yesterday|x'], x: ['would sing|v'], alt: ['She would have sung at the concert yesterday if she weren’t so shy'] },
  { t: 'phrasal', it: 'Per favore, abbassalo.', b: ['Please|x', 'turn|v', 'it|o', 'down|x'], x: ['up|x'] },
  { t: 'phrasal', it: 'Lei ha avuto un’idea geniale.', b: ['She|s', 'came up with|v', 'a brilliant idea|o'], x: ['came up|v'] },
  { t: 'phrasal', it: 'Il batterista dà l’attacco alla band.', b: ['The drummer|s', 'counts|v', 'the band|o', 'in|x'], x: ['count|v'], alt: ['The drummer counts in the band'] },
  { t: 'sentence', it: 'Chi suona la batteria nella tua band?', q: true, b: ['Who|q', 'plays|v', 'the drums|o', 'in your band|x'], x: ['does play|v'] },
  { t: 'sentence', it: 'La ragazza che suona il sax è mia cugina.', b: ['The girl|s', 'who plays|v', 'the sax|o', 'is|v', 'my cousin|o'], x: ['which plays|v'] },
  { t: 'sentence', it: 'Anche se era tardi, abbiamo continuato a suonare.', b: ['Although it was late|x', 'we|s', 'kept playing|v'], x: ['However it was late|x'], alt: ['We kept playing although it was late'] },
];

const brick = (str, i) => {
  const [text, cls] = str.split('|');
  return { key: i, text, cls };
};

export const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();

export const BRICKS = RAW.map((r, i) => {
  const bricks = r.b.map(brick);
  const answer = bricks.map((b) => b.text).join(' ');
  return {
    id: `b${i}`,
    topic: r.t,
    it: r.it,
    question: !!r.q,
    bricks,
    extras: (r.x || []).map((s, j) => brick(s, 100 + j)),
    answer,
    accepted: [answer, ...(r.alt || [])].map(norm),
  };
});
