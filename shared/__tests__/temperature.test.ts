import { bandForTemperature, clampTemperature } from '../temperature';

describe('bandForTemperature', () => {
  it.each([
    [100, 'burning'], [85, 'burning'],
    [84, 'warm'], [60, 'warm'],
    [59, 'mild'], [35, 'mild'],
    [34, 'cooling'], [15, 'cooling'],
    [14, 'hibernating'], [0, 'hibernating'],
  ])('temperatura %i cai na faixa %s', (temp, expected) => {
    expect(bandForTemperature(temp).id).toBe(expected);
  });

  it('trata valores fora do intervalo sem explodir', () => {
    expect(bandForTemperature(-10).id).toBe('hibernating');
    expect(bandForTemperature(999).id).toBe('burning');
  });

  it('toda faixa tem emoji, rótulo e cor', () => {
    for (const t of [100, 70, 40, 20, 5]) {
      const band = bandForTemperature(t);
      expect(band.emoji).toBeTruthy();
      expect(band.label).toBeTruthy();
      expect(band.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('clampTemperature', () => {
  it.each([[-5, 0], [0, 0], [50, 50], [100, 100], [140, 100]])(
    'limita %i em %i', (input, expected) => {
      expect(clampTemperature(input)).toBe(expected);
    });
});
