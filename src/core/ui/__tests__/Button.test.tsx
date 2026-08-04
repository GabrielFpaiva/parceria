import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('mostra o rótulo e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Continuar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não dispara onPress quando desabilitado', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByText('Continuar'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('não dispara onPress enquanto carrega', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" onPress={onPress} loading />);
    await fireEvent.press(screen.getByLabelText('Continuar'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('expõe papel e estado de acessibilidade', async () => {
    await render(<Button label="Continuar" onPress={jest.fn()} disabled />);
    const button = screen.getByLabelText('Continuar');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
