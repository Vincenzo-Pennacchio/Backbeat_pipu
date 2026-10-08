// Jam: dialoghi a scelta. Per ogni battuta il personaggio parla (say/it), Pipu sceglie una risposta tra tre.
// Opzioni: [testo, giusta?, spiegazione in italiano]. Esattamente UNA giusta per battuta (lo controlla scripts/check-content.mjs).
const opt = ([text, ok, fb]) => ({ text, ok, fb });

const RAW = [
  {
    id: 'audition', title: 'L’audizione', who: 'Nina', role: 'guida la jazz band della scuola', color: 'red',
    topic: 'present',
    scene: 'Ti presenti all’audizione della jazz band. Nina ti fa qualche domanda prima di sentirti suonare.',
    turns: [
      { say: 'Hi! You’re here for the audition, right? I’m Nina. What’s your name?', it: 'Ciao! Sei qui per l’audizione, giusto? Io sono Nina. Come ti chiami?', options: [
        ['Hi Nina, I’m Pipu. Nice to meet you.', true, 'Perfetto: nome e “piacere” in una frase.'],
        ['Hi, I have Pipu.', false, 'Per presentarti si usa to be: I’m Pipu.'],
        ['Hi, my name are Pipu.', false, 'My name è singolare: my name is Pipu.'],
      ] },
      { say: 'Nice to meet you too. So, what kind of music are you into?', it: 'Piacere mio. Allora, che genere di musica ti piace?', options: [
        ['I’m into jazz and bossa nova, but I love blues too.', true, 'Be into = essere appassionato di. Ottimo.'],
        ['I like very much jazz.', false, 'Niente tra verbo e oggetto: I like jazz very much.'],
        ['I am liking jazz and blues.', false, 'Like è un verbo di stato: niente -ing. I like jazz.'],
      ] },
      { say: 'Cool! We play a lot of ballads. Do you know how to play with brushes?', it: 'Forte! Suoniamo molte ballad. Sai suonare con le spazzole?', options: [
        ['Yes, I do. I often use them for slow songs.', true, 'Domanda con do → risposta breve con do. E often va prima del verbo.'],
        ['Yes, I am. I use them often.', false, 'La domanda usa do, quindi la risposta breve è Yes, I do.'],
        ['Yes, I do. I use always them.', false, 'L’avverbio va prima del verbo: I always use them.'],
      ] },
      { say: 'Great. We usually rehearse on Tuesdays at five. Can you come?', it: 'Ottimo. Di solito proviamo il martedì alle cinque. Puoi venire?', options: [
        ['Sure, I can come on Tuesday at five.', true, 'Giorni con on, orari con at.'],
        ['Sure, I can come in Tuesday at five.', false, 'Con i giorni si usa on: on Tuesday.'],
        ['Sure, I can come at Tuesday on five.', false, 'Al contrario: on Tuesday, at five.'],
      ] },
      { say: 'Perfect. Before you go, can you play a short groove for me?', it: 'Perfetto. Prima di andare, mi suoni un breve groove?', options: [
        ['Sure! I’ll play a bossa nova groove.', true, 'Decisione presa adesso: will.'],
        ['Sure! I play now a bossa nova groove.', false, 'Decisione sul momento: I’ll play. E now non va tra verbo e oggetto.'],
        ['Sure! I had played a bossa nova groove.', false, 'Il past perfect parla del passato del passato, non di adesso.'],
      ] },
    ],
    end: { say: 'Wow, that groove is really tight. Welcome to the band, Pipu!', it: 'Wow, quel groove è precisissimo. Benvenuto nella band, Pipu!' },
    phrases: [['be into', 'essere appassionato di'], ['rehearse', 'provare (musica)'], ['brushes', 'spazzole'], ['tight', 'preciso, compatto (di un groove)']],
  },
  {
    id: 'shop', title: 'Al negozio di musica', who: 'Sam', role: 'commesso del negozio di strumenti', color: 'yellow',
    topic: 'stative',
    scene: 'Entri nel negozio di strumenti per comprare bacchette nuove. Sam vuole mostrarti anche un piatto.',
    turns: [
      { say: 'Hi there! Can I help you, or are you just looking?', it: 'Ciao! Posso aiutarti o stai solo dando un’occhiata?', options: [
        ['Yes, please. I’m looking for a new pair of sticks.', true, 'Cercare qualcosa = look for.'],
        ['Yes, please. I search sticks.', false, 'Cercare un oggetto = look for: I’m looking for sticks.'],
        ['Yes, please. I am needing new sticks.', false, 'Need è un verbo di stato: I need new sticks.'],
      ] },
      { say: 'Sure. We’ve got 7A and 5B. Which size do you usually use?', it: 'Certo. Abbiamo 7A e 5B. Che misura usi di solito?', options: [
        ['I usually use 7A. They’re lighter.', true, 'Abitudine: present simple, con usually prima del verbo.'],
        ['I use usually 7A.', false, 'L’avverbio va prima del verbo: I usually use.'],
        ['I’m usually using 7A.', false, 'Per un’abitudine si usa il present simple.'],
      ] },
      { say: 'Here you are. Try this ride cymbal too, it’s brand new. What do you think?', it: 'Ecco a te. Prova anche questo ride, è nuovo di zecca. Che ne pensi?', options: [
        ['Wow, it sounds amazing!', true, 'Sound + aggettivo: it sounds amazing.'],
        ['Wow, it’s sounding amazing!', false, 'Sound (sembrare, dare l’impressione) è di stato: niente -ing.'],
        ['Wow, it sounds amazingly!', false, 'Dopo sound va l’aggettivo, non l’avverbio.'],
      ] },
      { say: 'It’s 180 euros. Expensive, I know.', it: 'Costa 180 euro. Caro, lo so.', options: [
        ['It’s too expensive for me. I think I’ll just take the sticks.', true, 'Decisione presa adesso: I’ll take.'],
        ['It’s too much expensive for me.', false, 'Troppo + aggettivo = too expensive, senza much.'],
        ['It’s too expensive. I think I take only the sticks.', false, 'Decisione presa sul momento: I’ll take.'],
      ] },
      { say: 'No problem. That’s twelve euros. Do you want a bag?', it: 'Nessun problema. Sono dodici euro. Vuoi una busta?', options: [
        ['No, thanks. I don’t need one.', true, 'Need al present simple, e one sostituisce “a bag”.'],
        ['No, thanks. I’m not needing it.', false, 'Need è un verbo di stato: I don’t need one.'],
        ['No, thanks. I haven’t need.', false, 'Need è un verbo normale: la negativa è I don’t need.'],
      ] },
    ],
    end: { say: 'Here’s your receipt. Enjoy the sticks, and come back when you’re ready for that cymbal!', it: 'Ecco lo scontrino. Goditi le bacchette e torna quando sei pronto per quel piatto!' },
    phrases: [['look for', 'cercare'], ['brand new', 'nuovo di zecca'], ['expensive', 'caro, costoso'], ['receipt', 'scontrino']],
  },
  {
    id: 'saturday', title: 'Il concerto di sabato', who: 'Leo', role: 'il tuo compagno di classe', color: 'blue',
    topic: 'past',
    scene: 'È lunedì. Leo vuole sapere com’è andato il concerto al jazz club di sabato.',
    turns: [
      { say: 'Hey! You went to the jazz club on Saturday, right? How was it?', it: 'Ehi! Sabato sei andato al jazz club, giusto? Com’è stato?', options: [
        ['It was amazing! The band played for two hours.', true, 'Fatto concluso nel passato: past simple. It → was.'],
        ['It were amazing!', false, 'Con it si usa was.'],
        ['It is amazing! The band plays for two hours.', false, 'Sabato è passato: serve il past simple.'],
      ] },
      { say: 'Cool! Who did you go with?', it: 'Forte! Con chi sei andato?', options: [
        ['I went with my uncle. He bought the tickets.', true, 'Go → went, buy → bought.'],
        ['I goed with my uncle.', false, 'Go è irregolare: went.'],
        ['I went with my uncle. He buyed the tickets.', false, 'Buy è irregolare: bought.'],
      ] },
      { say: 'Did you like the drummer?', it: 'Ti è piaciuto il batterista?', options: [
        ['Yes, I did. He played an incredible solo.', true, 'Risposta breve con did.'],
        ['Yes, I liked.', false, 'Risposta breve: Yes, I did.'],
        ['Yes, I did. He play an incredible solo.', false, 'Nella frase affermativa il verbo va al passato: played.'],
      ] },
      { say: 'Lucky you! I wanted to come, but I had a test on Monday. What time did it finish?', it: 'Beato te! Volevo venire, ma lunedì avevo una verifica. A che ora è finito?', options: [
        ['It finished at midnight, so I was really tired on Sunday.', true, 'At midnight, on Sunday. Tutto al passato.'],
        ['It finished on midnight.', false, 'Con gli orari si usa at: at midnight.'],
        ['It did finished at midnight.', false, 'Nelle affermative non serve did: it finished.'],
      ] },
      { say: 'Did you take any videos?', it: 'Hai fatto qualche video?', options: [
        ['No, I didn’t. I wanted to enjoy the music.', true, 'Risposta breve con didn’t, poi un motivo al passato.'],
        ['No, I didn’t took any.', false, 'Dopo didn’t il verbo torna alla forma base: take.'],
        ['No, I wasn’t take any.', false, 'La negativa del past simple si fa con didn’t + forma base.'],
      ] },
    ],
    end: { say: 'Fair enough. Next time we’ll go together, deal?', it: 'Giusto. La prossima volta andiamo insieme, affare fatto?' },
    phrases: [['lucky you', 'beato te'], ['ticket', 'biglietto'], ['incredible', 'incredibile'], ['fair enough', 'giusto, ci sta']],
  },
  {
    id: 'jam', title: 'Organizziamo una jam', who: 'Zoe', role: 'suona il pianoforte', color: 'green',
    topic: 'future',
    scene: 'Zoe vuole organizzare una jam session nel weekend con suo cugino sassofonista.',
    turns: [
      { say: 'Hey Pipu! My cousin plays the sax and we want to have a jam session this weekend. Are you in?', it: 'Ehi Pipu! Mio cugino suona il sax e vogliamo fare una jam questo weekend. Ci stai?', options: [
        ['Sure! What time are you meeting on Saturday?', true, 'Programma già fissato con altre persone: present continuous.'],
        ['Sure! At what time you meet?', false, 'Nelle domande serve l’ausiliare: What time are you meeting?'],
        ['Sure! I free on Saturday.', false, 'Manca il verbo to be: I’m free on Saturday.'],
      ] },
      { say: 'We’re meeting at my house at four. Can you bring your drums?', it: 'Ci vediamo a casa mia alle quattro. Puoi portare la batteria?', options: [
        ['My kit is too big, but I’ll bring my snare and a cymbal.', true, 'Offerta decisa sul momento: will.'],
        ['My kit is too big, but I bring my snare.', false, 'Per un’offerta decisa ora serve will: I’ll bring.'],
        ['My kit is too big, but I’ll to bring my snare.', false, 'Will + forma base, senza to.'],
      ] },
      { say: 'Great. What should we play?', it: 'Perfetto. Cosa suoniamo?', options: [
        ['How about playing Blue Bossa? I think you’ll like it.', true, 'How about + -ing per proporre. E una previsione personale con will.'],
        ['How about to play Blue Bossa?', false, 'Dopo how about il verbo va in -ing: How about playing…?'],
        ['How about we will play Blue Bossa?', false, 'Per proporre: How about playing…? oppure Why don’t we play…?'],
      ] },
      { say: 'Love it. Text me when you get home from school tomorrow, OK?', it: 'Mi piace. Scrivimi quando torni a casa da scuola domani, ok?', options: [
        ['Sure, I’ll text you when I get home.', true, 'Dopo when si usa il present, anche se parla di futuro.'],
        ['Sure, I’ll text you when I will get home.', false, 'Mai will dopo when: when I get home.'],
        ['Sure, I text you when I’ll get home.', false, 'Promessa: I’ll text. Dopo when: present.'],
      ] },
      { say: 'Do you think it’s going to rain on Saturday? We want to play in the garden.', it: 'Pensi che sabato pioverà? Vogliamo suonare in giardino.', options: [
        ['The forecast says heavy rain. It’s going to rain, so let’s play inside.', true, 'Previsione con prove evidenti (le previsioni del tempo): going to.'],
        ['The forecast says heavy rain. It rains, so let’s play inside.', false, 'Per una previsione futura non si usa il present simple.'],
        ['The forecast says heavy rain. It’s raining on Saturday.', false, 'Il present continuous è per i programmi fissati da persone, non per il meteo.'],
      ] },
    ],
    end: { say: 'Good idea. See you on Saturday, and don’t forget your brushes!', it: 'Buona idea. Ci vediamo sabato, e non dimenticare le spazzole!' },
    phrases: [['Are you in?', 'Ci stai?'], ['text someone', 'scrivere un messaggio a qualcuno'], ['forecast', 'previsioni del tempo'], ['heavy rain', 'pioggia forte']],
  },
  {
    id: 'whatif', title: 'E se…?', who: 'Nina', role: 'guida la jazz band della scuola', color: 'red',
    topic: 'mixed',
    scene: 'Dopo le prove, Nina ti fa un po’ di domande strane. Occhio ai condizionali: ci sono anche quelli misti.',
    turns: [
      { say: 'If you could play with any musician in history, who would you choose?', it: 'Se potessi suonare con qualsiasi musicista della storia, chi sceglieresti?', options: [
        ['If I could, I’d choose Art Blakey. He was an amazing drummer.', true, 'Situazione immaginaria: tipo 2, could / would.'],
        ['If I can, I will choose Art Blakey.', false, 'È una situazione immaginaria: tipo 2, If I could, I’d choose.'],
        ['If I would could, I’d choose Art Blakey.', false, 'Mai would nella frase con if.'],
      ] },
      { say: 'Good choice! What happens to your hands if you don’t practise for a week?', it: 'Bella scelta! Cosa succede alle tue mani se non ti eserciti per una settimana?', options: [
        ['If I don’t practise, my hands get slow.', true, 'Verità generale: tipo 0, present + present.'],
        ['If I won’t practise, my hands get slow.', false, 'Mai will nella frase con if.'],
        ['If I didn’t practise, my hands got slow.', false, 'È una cosa che succede sempre: tipo 0, al presente.'],
      ] },
      { say: 'True. By the way, why didn’t you come to the concert last month?', it: 'Vero. A proposito, perché non sei venuto al concerto il mese scorso?', options: [
        ['I was ill. If I hadn’t been ill, I would have come.', true, 'Passato che non si può cambiare: tipo 3.'],
        ['I was ill. If I wasn’t ill, I would come.', false, 'Parli del mese scorso: tipo 3, If I hadn’t been ill, I would have come.'],
        ['I was ill. If I would have been well, I would have come.', false, 'Mai would nella frase con if: If I had been well…'],
      ] },
      { say: 'Shame! Do you wish you had started playing earlier?', it: 'Peccato! Vorresti aver cominciato a suonare prima?', options: [
        ['A bit. If I had started earlier, I would be a better drummer now.', true, 'Condizionale misto: passato (had started) → presente (would be now).'],
        ['A bit. If I had started earlier, I would have been a better drummer now.', false, 'Con now il risultato è presente: would be.'],
        ['A bit. If I started earlier, I would be a better drummer now.', false, 'La condizione è nel passato: If I had started.'],
      ] },
      { say: 'Don’t worry, you’re doing great. What will you do if we win the school contest?', it: 'Tranquillo, stai andando alla grande. Cosa farai se vinciamo il concorso della scuola?', options: [
        ['If we win, I’ll buy a new ride cymbal!', true, 'Situazione reale e possibile: tipo 1, present + will.'],
        ['If we will win, I’ll buy a new ride cymbal!', false, 'Mai will nella frase con if: If we win.'],
        ['If we win, I buy a new ride cymbal.', false, 'Conseguenza futura: I’ll buy.'],
      ] },
    ],
    end: { say: 'Ha! If we play like today, we’ll definitely win.', it: 'Ah! Se suoniamo come oggi, vinceremo di sicuro.' },
    phrases: [['choose', 'scegliere'], ['ill', 'malato'], ['Shame!', 'Peccato!'], ['contest', 'concorso, gara']],
  },
  {
    id: 'bricks', title: 'Al negozio Lego', who: 'Kai', role: 'commesso del Brick Store', color: 'yellow',
    topic: 'phrasal',
    scene: 'Cerchi il set del jazz club. Kai parla veloce e usa un sacco di phrasal verbs.',
    turns: [
      { say: 'Hi! Welcome to the Brick Store. Are you looking for anything special?', it: 'Ciao! Benvenuto al Brick Store. Cerchi qualcosa in particolare?', options: [
        ['Yes, I’m looking for the jazz club set.', true, 'Cercare = look for.'],
        ['Yes, I’m searching the jazz club set.', false, 'Per cercare un oggetto si usa look for.'],
        ['Yes, I’m looking the jazz club set.', false, 'Manca la particella: look for.'],
      ] },
      { say: 'Oh, sorry, we’ve run out of it. We’ll get more next week.', it: 'Oh, mi dispiace, è finito. Ne arrivano altri la prossima settimana.', options: [
        ['No problem, I’ll come back next week.', true, 'Come back = tornare.'],
        ['No problem, I’ll return back next week.', false, 'Return significa già tornare: return next week oppure come back.'],
        ['No problem, I’ll come next week back.', false, 'La particella sta attaccata al verbo: come back next week.'],
      ] },
      { say: 'By the way, this is our biggest set: over three thousand pieces. How long would it take you to put it together?', it: 'A proposito, questo è il nostro set più grande: più di tremila pezzi. Quanto ci metteresti a montarlo?', options: [
        ['I think I could put it together in a weekend.', true, 'Put together è separabile: con il pronome, put it together.'],
        ['I think I could put together it in a weekend.', false, 'Con un pronome la particella va dopo: put it together.'],
        ['I think I could put it in a weekend together.', false, 'La particella va subito dopo il pronome: put it together in a weekend.'],
      ] },
      { say: 'Impressive! Do you ever take your models apart?', it: 'Notevole! Ti capita di smontare i tuoi modelli?', options: [
        ['Sometimes. I take them apart and build something new.', true, 'Take apart = smontare, con il pronome in mezzo.'],
        ['Sometimes. I take apart them.', false, 'Con un pronome: take them apart.'],
        ['Sometimes. I take them off and build something new.', false, 'Take off = togliersi (i vestiti) o decollare. Smontare = take apart.'],
      ] },
      { say: 'Cool. If you ever get stuck, you can look up the instructions on our website.', it: 'Forte. Se ti blocchi, puoi cercare le istruzioni sul nostro sito.', options: [
        ['Thanks! I’ll look them up if I get stuck.', true, 'Look up (cercare un’informazione) con il pronome in mezzo.'],
        ['Thanks! I’ll look up them if I get stuck.', false, 'Con un pronome: look them up.'],
        ['Thanks! I’ll search them up if I get stuck.', false, 'Cercare un’informazione = look up.'],
      ] },
    ],
    end: { say: 'Perfect. See you next week, and have fun building!', it: 'Perfetto. Ci vediamo la prossima settimana, e buon divertimento a costruire!' },
    phrases: [['run out of', 'finire, restare senza'], ['come back', 'tornare'], ['put together', 'montare, assemblare'], ['get stuck', 'bloccarsi']],
  },
];

export const DIALOGUES = RAW.map((d) => ({
  ...d,
  turns: d.turns.map((t) => ({ ...t, options: t.options.map(opt) })),
}));

export const dialogueById = (id) => DIALOGUES.find((d) => d.id === id);
