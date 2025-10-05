/**
 * Custom Text Component
 * Default text component with Comic Neue font applied globally
 */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform } from 'react-native';

export interface TextProps extends RNTextProps {
  bold?: boolean;
  handwritten?: boolean;
  readable?: boolean; // Use system font for better readability in paragraphs
}

export const Text: React.FC<TextProps> = ({
  style,
  bold = false,
  handwritten = false,
  readable = false,
  ...props
}) => {
  // Use system font for readable content (paragraphs, summaries)
  const fontFamily = readable
    ? Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      })
    : handwritten
    ? 'PatrickHand_400Regular'
    : bold
    ? 'ComicNeue_700Bold'
    : 'ComicNeue_400Regular';

  const fontWeight = readable && bold ? '600' : undefined;

  return (
    <RNText
      style={[
        styles.defaultText,
        {
          fontFamily,
          ...(fontWeight && { fontWeight }),
        },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'ComicNeue_400Regular',
    letterSpacing: 0.3,
  },
});
