import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { Location } from '../../types/airQuality';
import { theme } from '../../constants/theme';

interface LocationCardProps {
  location: Location;
  onChangeLocation?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onChangeLocation,
}) => {
  return (
    <Card variant="flat" style={styles.card}>
      <CardContent style={styles.content}>
        <View style={styles.locationInfo}>
          <View style={styles.textContainer}>
            <Text style={styles.city}>{location.city}</Text>
            <Text style={styles.country}>{location.country}</Text>
          </View>
        </View>
        {onChangeLocation && (
          <TouchableOpacity onPress={onChangeLocation} style={styles.button}>
            <Text style={styles.buttonText}>Change</Text>
          </TouchableOpacity>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.tertiary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: theme.spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  city: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  country: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  buttonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
});
