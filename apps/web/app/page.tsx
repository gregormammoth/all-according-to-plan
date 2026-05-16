import { AudioProvider } from '@/components/audio/AudioProvider';
import { GameShell } from '@/components/game/GameShell';
import { MotionProvider } from '@/lib/motion/MotionProvider';

export default function HomePage() {
  return (
    <MotionProvider>
      <AudioProvider>
        <GameShell />
      </AudioProvider>
    </MotionProvider>
  );
}
