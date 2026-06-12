import { crisesDocument, type CrisisDefinition } from '@all-according-to-plan/shared';

export type CrisisLibrary = {
  get: (id: string) => CrisisDefinition | undefined;
  all: CrisisDefinition[];
};

export function buildCrisisLibrary(crises: CrisisDefinition[]): CrisisLibrary {
  const map = new Map(crises.map((c) => [c.id, c]));
  return {
    get: (id) => map.get(id),
    all: crises,
  };
}

export function getDefaultCrisisLibrary(): CrisisLibrary {
  return buildCrisisLibrary(crisesDocument.crises);
}
