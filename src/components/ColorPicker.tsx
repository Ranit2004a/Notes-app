import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NOTE_PALETTES, LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface ColorPickerProps {
  selectedColorId: string;
  onSelectColor: (id: string) => void;
  isDarkMode: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColorId,
  onSelectColor,
  isDarkMode,
}) => {
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {NOTE_PALETTES.map((palette) => {
          const isSelected = selectedColorId === palette.id;
          const bg = isDarkMode ? palette.dark : palette.light;
          return (
            <TouchableOpacity
              key={palette.id}
              activeOpacity={0.8}
              onPress={() => onSelectColor(palette.id)}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: bg,
                  borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                  borderWidth: isSelected ? 2.5 : 1,
                  transform: [{ scale: isSelected ? 1.1 : 1 }],
                },
              ]}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={isDarkMode ? '#ffffff' : '#0f172a'}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 38,
    justifyContent: 'center',
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
