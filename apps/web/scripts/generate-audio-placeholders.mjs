import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(__dirname, '../public/audio');

const files = [
  'ui/card-hover.ogg',
  'ui/card-play.ogg',
  'ui/resource-gain.ogg',
  'ui/draw-card.ogg',
  'ui/end-turn.ogg',
  'ui/modal-open.ogg',
  'ui/dice-roll.ogg',
  'ui/success-reveal.ogg',
  'ui/partial-reveal.ogg',
  'ui/failure-reveal.ogg',
  'events/event-sting.ogg',
  'elections/election-sting.ogg',
  'elections/election-pulse.ogg',
  'ambience/distant-siren.ogg',
  'ambience/industrial-hum.ogg',
  'ambience/radio-static.ogg',
  'ambience/crowd-murmur.ogg',
  'ambience/rain-wind.ogg',
  'ambience/military-drone.ogg',
  'music/base-ambient.ogg',
  'music/election-tension.ogg',
  'music/danger-escalation.ogg',
  'music/collapse-alarm.ogg',
];

function writeSilentOggPlaceholder(filePath, durationSec = 0.15) {
  const sampleRate = 22050;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSec));
  const data = Buffer.alloc(numSamples * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  const wavPath = filePath.replace(/\.ogg$/, '.wav');
  fs.mkdirSync(path.dirname(wavPath), { recursive: true });
  fs.writeFileSync(wavPath, Buffer.concat([header, data]));
}

for (const rel of files) {
  const target = path.join(publicRoot, rel.replace(/\.ogg$/, '.wav'));
  writeSilentOggPlaceholder(target);
  console.log('wrote', target);
}

console.log('Placeholders are silent WAV files. Replace with OGG/MP3 production assets; manifest lists .ogg first.');
