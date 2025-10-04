import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'outlined';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  style,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <View style={[styles.header, style]}>{children}</View>;
};

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <View style={[styles.content, style]}>{children}</View>;
};

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <View style={[styles.footer, style]}>{children}</View>;
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  elevated: {
    ...theme.shadows.md,
    backgroundColor: theme.colors.background.elevated,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    ...theme.shadows.sm,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
});
