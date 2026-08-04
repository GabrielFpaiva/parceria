import { render, screen } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('mostra o emoji quando não há foto', async () => {
    await render(<Avatar photoURL={null} fallbackEmoji="🦊" />);
    expect(screen.getByText('🦊')).toBeTruthy();
  });

  it('esconde o emoji quando há foto', async () => {
    await render(<Avatar photoURL="https://exemplo.com/a.jpg" fallbackEmoji="🦊" />);
    expect(screen.queryByText('🦊')).toBeNull();
  });

  it('colore o anel pela faixa de temperatura', async () => {
    await render(<Avatar photoURL={null} fallbackEmoji="🦊" temperature={90} />);
    expect(screen.getByLabelText('Parceria em chamas')).toBeTruthy();
  });

  it('não desenha anel sem temperatura', async () => {
    await render(<Avatar photoURL={null} fallbackEmoji="🦊" />);
    expect(screen.queryByLabelText(/^Parceria /)).toBeNull();
  });
});
