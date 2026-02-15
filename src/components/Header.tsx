import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import colors from '../constants/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onActionPress?: () => void;
}

export const Header = ({
  title = "MakeDays",
  subtitle = "2026",
  onActionPress
}: HeaderProps) => {

  const handlePress = () => {
    if (onActionPress) {
      onActionPress();
    } else {
      Alert.alert("History", "Здесь будет переход к списку всех лет или привычек");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>View All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(51, 181, 229, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 181, 229, 0.3)',
  },
  buttonText: {
    color: colors.gradients.future[0],
    fontSize: 12,
    fontWeight: '700',
  },
});
