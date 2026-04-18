import { cardsDocument } from '@all-according-to-plan/shared';
import cors from 'cors';
import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const eventsPayload = JSON.parse(
  readFileSync(join(__dirname, 'data/events.json'), 'utf8')
) as { events: unknown[] };

const app = express();
app.use(cors());
app.use(express.json());

let savedSnapshot: unknown = { note: 'empty' };

app.get('/cards', (_req, res) => {
  res.json(cardsDocument);
});

app.get('/events', (_req, res) => {
  res.json(eventsPayload);
});

app.post('/save-game', (req, res) => {
  savedSnapshot = req.body ?? {};
  res.json({ ok: true });
});

app.get('/load-game', (_req, res) => {
  res.json(savedSnapshot);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(port, () => {
  console.log(`mock-server listening on ${port}`);
});
