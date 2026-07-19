import { theme } from '../theme';
import { TEMPERATURE_BANDS } from '@shared/constants';

describe('theme', () => {
  it('a paleta de temperatura é idêntica à do domínio', () => {
    for (const band of TEMPERATURE_BANDS) {
      expect(theme.colors.temp[band.id]).toBe(band.color);
    }
  });

  it('a escala de espaço é múltipla de 4', () => {
    for (const value of theme.space) {
      expect(value % 4).toBe(0);
    }
  });

  it('todo estilo de texto usa tabular-nums onde há número', () => {
    expect(theme.type.display.fontVariant).toContain('tabular-nums');
    expect(theme.type.title.fontVariant).toContain('tabular-nums');
  });
});
