import { xpForNextLevel, totalXpForLevel } from '../level';

describe('xpForNextLevel', () => {
  it.each([
    [1, 122],
    [5, 210],
    [10, 320],
    [18, 496], // ← a mockup mostra "420 / 500" no nível 18
    [21, 562],
    [50, 1200],
  ])('nível %i exige %i XParceria para o próximo', (level, expected) => {
    expect(xpForNextLevel(level)).toBe(expected);
  });
});

describe('totalXpForLevel', () => {
  it.each([
    [1, 0],
    [2, 122],
    [10, 1890],
    [18, 5066],
    [21, 6620],
    [50, 31850],
  ])('atingir o nível %i custa %i XParceria acumulado', (level, expected) => {
    expect(totalXpForLevel(level)).toBe(expected);
  });

  it('a forma fechada bate com a soma iterativa', () => {
    for (let n = 1; n <= 60; n++) {
      let sum = 0;
      for (let k = 1; k < n; k++) sum += xpForNextLevel(k);
      expect(totalXpForLevel(n)).toBe(sum);
    }
  });

  it('é monotônica e nunca negativa', () => {
    for (let n = 1; n < 60; n++) {
      expect(totalXpForLevel(n + 1)).toBeGreaterThan(totalXpForLevel(n));
      expect(totalXpForLevel(n)).toBeGreaterThanOrEqual(0);
    }
  });
});
