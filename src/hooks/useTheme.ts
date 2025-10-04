import { useColorScheme } from 'react-native';
import { createTheme } from '../constants/theme';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  return createTheme(colorScheme === 'dark');
};
