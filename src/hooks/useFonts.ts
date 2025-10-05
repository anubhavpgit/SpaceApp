/**
 * Custom hook to load comic/handwritten fonts
 * Using @expo-google-fonts packages with correct import syntax
 */
import {
  useFonts as useExpoFonts,
  ComicNeue_300Light,
  ComicNeue_400Regular,
  ComicNeue_700Bold,
} from '@expo-google-fonts/comic-neue';

import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';

export const useFonts = () => {
  const [fontsLoaded, error] = useExpoFonts({
    ComicNeue_300Light,
    ComicNeue_400Regular,
    ComicNeue_700Bold,
    PatrickHand_400Regular,
  });

  return {
    fontsLoaded: fontsLoaded && !error,
    error,
  };
};
