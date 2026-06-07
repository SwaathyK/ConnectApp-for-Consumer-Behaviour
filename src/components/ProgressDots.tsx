import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  total: number;
  current: number; // 0-indexed; dashes 0..current are active
}

export default function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dash, i <= current ? styles.dashActive : styles.dashInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  dash: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  dashActive: {
    backgroundColor: '#FFFFFF',
  },
  dashInactive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
