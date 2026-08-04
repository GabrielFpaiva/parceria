import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { theme } from './theme';

type Props = {
  message: string;
  onRetry: () => void;
};

// Estado genérico de erro com ação de retentativa — usado quando uma guarda
// de rota não pode decidir para onde mandar o usuário porque a query falhou
// (rede caiu, permissão negada), em vez de dado ausente.
export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.message}>{message}</Text>
      <Button label="Tentar de novo" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space[5],
    gap: theme.space[4],
  },
  message: { textAlign: 'center', color: theme.colors.ink[700] },
});
