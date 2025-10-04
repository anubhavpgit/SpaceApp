import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../ui/Card';
import { HealthAlert } from '../../types/airQuality';
import { useTheme } from '../../hooks/useTheme';

interface HealthAlertCardProps {
  alert: HealthAlert;
}

export const HealthAlertCard: React.FC<HealthAlertCardProps> = ({ alert }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  const severityConfig = {
    info: { color: theme.colors.text.secondary, bgColor: theme.colors.overlay.medium },
    warning: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.08)' },
    critical: { color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.08)' },
  };

  const config = severityConfig[alert.severity];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('HealthAlertDetail' as never, { alert } as never)}
    >
      <Card variant="elevated" style={[styles.card, { backgroundColor: config.bgColor }]}>
        <CardContent style={styles.content}>
          <View style={styles.row}>
            <View style={[styles.indicator, { backgroundColor: config.color }]} />
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: config.color }]}>{alert.title}</Text>
              <Text style={styles.message} numberOfLines={2}>{alert.message}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  content: {
    paddingVertical: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicator: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: theme.spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.4,
  },
});
