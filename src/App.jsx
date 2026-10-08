import { useEffect } from 'react';
import { useRoute } from './lib/router.js';
import { useStore } from './lib/store.js';
import { configureAudio, unlockAudio } from './lib/audio.js';
import { setVoiceRate } from './lib/speech.js';
import { TabBar, Toasts } from './components/ui.jsx';
import Home from './screens/Home.jsx';
import Play from './screens/Play.jsx';
import Drill from './screens/Drill.jsx';
import Bricks from './screens/Bricks.jsx';
import Vocab from './screens/Vocab.jsx';
import { DialogueList, DialoguePlay } from './screens/Dialogues.jsx';
import Summary from './screens/Summary.jsx';
import Chat from './screens/Chat.jsx';
import { Library, Chapter } from './screens/Library.jsx';
import Records from './screens/Records.jsx';

const SCREENS = {
  home: Home, play: Play, drill: Drill, bricks: Bricks, vocab: Vocab,
  dialogues: DialogueList, dialogue: DialoguePlay, summary: Summary, chat: Chat,
  library: Library, chapter: Chapter, records: Records,
};
const WITH_TABS = new Set(['home', 'play', 'library', 'records']);
const PAPER = new Set(['library', 'chapter']);

export default function App() {
  const { path, params } = useRoute();
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    configureAudio({ sound: settings.sound, metronome: settings.metronome });
    setVoiceRate(settings.rate);
  }, [settings]);

  useEffect(() => {
    const f = () => unlockAudio();
    window.addEventListener('pointerdown', f, { once: true });
    return () => window.removeEventListener('pointerdown', f);
  }, []);

  const Screen = SCREENS[path] || Home;
  const paper = PAPER.has(path);
  const routeKey = `${path}?${new URLSearchParams(params)}`;

  useEffect(() => {
    document.body.dataset.world = paper ? 'paper' : 'stage';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper ? '#FFFFFF' : '#1D39A3');
    window.scrollTo(0, 0);
  }, [routeKey, paper]);

  const tabs = WITH_TABS.has(path);
  return (
    <div className={`app ${tabs ? 'has-tabs' : ''}`}>
      <main className="screen" key={routeKey}>
        <Screen params={params} />
      </main>
      {tabs && <TabBar />}
      <Toasts />
    </div>
  );
}
