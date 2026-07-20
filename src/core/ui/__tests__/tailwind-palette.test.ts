import { TEMPERATURE_BANDS } from '@shared/constants';

const tailwindConfig = require('../../../../tailwind.config.js');
const temp = tailwindConfig.theme.extend.colors.temp as Record<string, string>;

describe('paleta do tailwind.config.js', () => {
  it('é idêntica à do domínio', () => {
    for (const band of TEMPERATURE_BANDS) {
      expect(temp[band.id]).toBe(band.color);
    }
  });

  it('não tem nenhuma cor de temperatura a mais', () => {
    expect(Object.keys(temp).sort()).toEqual(
      TEMPERATURE_BANDS.map((b) => b.id).sort(),
    );
  });
});
