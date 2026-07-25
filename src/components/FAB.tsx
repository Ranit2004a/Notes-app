import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface FABProps {
  onPress: () => void;
  isDarkMode: boolean;
  label?: string;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({ onPress, isDarkMode, label, style }) => {
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.fab,
        {
          backgroundColor: theme.accent,
          shadowColor: theme.accent,
        },
        style,
      ]}
    >
      <Ionicons name="add" size={26} color="#ffffff" />
      {Boolean(label) && <Text style={styles.fabLabel}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 999,
  },
  fabLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
});
