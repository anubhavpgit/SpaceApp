/**
 * Custom hook to load comic/handwritten fonts
 * Using @expo-google-fonts packages correctly
 */
import { useFonts as useComicNeueFonts } from '@expo-google-fonts/comic-neue/useFonts';
import { useFonts as usePatrickHandFonts } from '@expo-google-fonts/patrick-hand/useFonts';

// Import font assets from subdirectories (named exports)
import { ComicNeue_300Light } from '@expo-google-fonts/comic-neue/300Light';
import { ComicNeue_400Regular } from '@expo-google-fonts/comic-neue/400Regular';
import { ComicNeue_700Bold } from '@expo-google-fonts/comic-neue/700Bold';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand/400Regular';

export const useFonts = () => {
  const [comicNeueLoaded] = useComicNeueFonts({
    ComicNeue_300Light,
    ComicNeue_400Regular,
    ComicNeue_700Bold,
  });

  const [patrickHandLoaded] = usePatrickHandFonts({
    PatrickHand_400Regular,
  });

  return {
    fontsLoaded: comicNeueLoaded && patrickHandLoaded,
  };
};
