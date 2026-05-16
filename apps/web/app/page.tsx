import { AudioProvider } from '@/components/audio/AudioProvider';
import { GameShell } from '@/components/game/GameShell';

export default function HomePage() {
  return (
    <AudioProvider>
      <GameShell />
    </AudioProvider>
  );
}
