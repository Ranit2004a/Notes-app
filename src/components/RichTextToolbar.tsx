import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattingType } from '../utils/textFormatting';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface RichTextToolbarProps {
  onApplyFormat: (type: FormattingType) => void;
  isDarkMode: boolean;
  activeFormat?: string;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  onApplyFormat,
  isDarkMode,
}) => {
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const tools: {
    type: FormattingType;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    badgeText?: string;
    textStyle?: object;
  }[] = [
    {
      type: 'bold',
      label: 'Bold',
      badgeText: 'B',
      textStyle: { fontWeight: '900', fontSize: 15 },
    },
    {
      type: 'italic',
      label: 'Italic',
      badgeText: 'I',
      textStyle: { fontStyle: 'italic', fontWeight: '700', fontSize: 15 },
    },
    {
      type: 'underline',
      label: 'Underline',
      badgeText: 'U',
      textStyle: { textDecorationLine: 'underline', fontWeight: '700', fontSize: 15 },
    },
    {
      type: 'bullet',
      label: 'Bullet List',
      icon: 'list-outline',
    },
    {
      type: 'checklist',
      label: 'Checklist',
      icon: 'checkbox-outline',
    },
    {
      type: 'codeblock',
      label: 'Code Block',
      icon: 'code-slash-outline',
    },
  ];

  return (
    <View
      style={[
        styles.toolbarContainer,
        {
          backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
          borderTopColor: theme.surfaceBorder,
          borderBottomColor: theme.surfaceBorder,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.type}
            onPress={() => onApplyFormat(tool.type)}
            activeOpacity={0.7}
            style={[
              styles.toolButton,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            {tool.icon ? (
              <Ionicons name={tool.icon} size={16} color={theme.textPrimary} />
            ) : (
              <Text style={[{ color: theme.textPrimary }, tool.textStyle]}>
                {tool.badgeText}
              </Text>
            )}
            <Text style={[styles.toolLabel, { color: theme.textPrimary }]}>
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: {
    height: 44,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    height: 32,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
