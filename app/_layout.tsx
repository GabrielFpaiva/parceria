import { Stack } from 'expo-router';
import 'react-native-gesture-handler';
import '../global.css';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
