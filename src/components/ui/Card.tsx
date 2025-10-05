/**
 * Card Component
 * Wrapper around ComicCard for backward compatibility
 * Now uses comic styling by default
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import { ComicCard } from './ComicCard';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'outlined';
  style?: ViewStyle;
  scribble?: boolean; // Kept for backward compatibility
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  style,
  scribble = true, // Kept for compatibility but always uses scribble now
}) => {
  return (
    <ComicCard variant={variant === 'outlined' ? 'elevated' : variant} style={style}>
      {children}
    </ComicCard>
  );
};

// Export ComicCard sub-components for compatibility
export { ComicCardHeader as CardHeader } from './ComicCard';
export { ComicCardContent as CardContent } from './ComicCard';
export { ComicCardFooter as CardFooter } from './ComicCard';
