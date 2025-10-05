/**
 * AQI Card - Comic Style
 * Rewritten to use the new ComicCard component
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ComicCard, ComicCardHeader, ComicCardContent } from '../ui/ComicCard';
import { ScribbleText } from '../scribble/ScribbleText';
import { AQIReading } from '../../types/airQuality';
import { getAQIColor, getAQILabel } from '../../constants/aqi';
import { useTheme } from '../../hooks/useTheme';

interface AQICardProps {
  data: AQIReading;
}

export const AQICardComic: React.FC<AQICardProps> = ({ data }) => {
  const theme = useTheme();
  const color = getAQIColor(data.category);
  const label = getAQILabel(data.category);

  return (
    <ComicCard variant="elevated">
      <ComicCardHeader>
        <ScribbleText
          size="xs"
          weight="bold"
          color={theme.colors.text.muted}
          style={styles.sectionLabel}
        >
          AIR QUALITY INDEX
        </ScribbleText>
        <ScribbleText size="xxl" weight="regular" color={theme.colors.text.primary}>
          {data.location.city}
        </ScribbleText>
      </ComicCardHeader>

      <ComicCardContent>
        <View style={styles.aqiContainer}>
          {/* AQI Value Badge */}
          <View style={[styles.aqiBadge, { backgroundColor: color }]}>
            <ScribbleText
              size="xxxl"
              weight="bold"
              color={theme.colors.text.inverse}
            >
              {data.aqi}
            </ScribbleText>
          </View>

          {/* AQI Info */}
          <View style={styles.aqiInfo}>
            <ScribbleText
              size="lg"
              weight="bold"
              color={color}
              style={styles.aqiLabel}
            >
              {label}
            </ScribbleText>
            <ScribbleText
              size="sm"
              color={theme.colors.text.muted}
            >
              Updated {new Date(data.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ScribbleText>
          </View>
        </View>

        {/* Dominant Pollutant */}
        {data.dominantPollutant && (
          <View style={styles.pollutantRow}>
            <ScribbleText size="sm" color={theme.colors.text.tertiary}>
              Dominant Pollutant
            </ScribbleText>
            <ScribbleText size="base" weight="bold" color={theme.colors.text.primary}>
              {data.dominantPollutant.toUpperCase()}
            </ScribbleText>
          </View>
        )}
      </ComicCardContent>
    </ComicCard>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aqiBadge: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Hand-drawn shadow effect
    shadowColor: '#2D4059',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  aqiInfo: {
    flex: 1,
  },
  aqiLabel: {
    marginBottom: 4,
  },
  pollutantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: 'rgba(45, 64, 89, 0.1)',
    borderStyle: 'dashed', // Comic-style dashed line
  },
});
