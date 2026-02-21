import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGridCalculation } from '../hooks/useGridCalculation';
import { DayData } from '../types';
import colors from '../constants/colors';

const GAP = 5;
const PADDING = 16;
const COLS = 7;
const MONTH_LABEL_WIDTH = 24;

export const YearGrid = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const months = useGridCalculation();

  const availableWidth = width - (PADDING * 2) - MONTH_LABEL_WIDTH - GAP;
  const itemWidth = (availableWidth - (GAP * (COLS - 1))) / COLS;
  const itemHeight = itemWidth * 0.4;

  const handlePress = (day: DayData) => {
    if (!day.date || day.status === 'EMPTY') return;
    Alert.alert(t('calendar.dateAlertTitle'), format(day.date, 'd MMMM yyyy', { locale: ru }));
  };

  const getCellProps = (status: DayData['status']) => {
    switch (status) {
      case 'PAST':
        return {
          colors: colors.gradients.past,
          textColor: colors.text.dim,
          borderWidth: 1,
          borderColor: colors.borders.past,
          opacity: 0.5
        };
      case 'TODAY':
        return {
          colors: colors.gradients.today,
          textColor: colors.text.inverse,
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: 1
        };
      case 'FUTURE':
        return {
          colors: colors.gradients.future,
          textColor: '#003344',
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: 1
        };
      default:
        return { colors: ['transparent', 'transparent'], textColor: 'transparent', borderWidth: 0, borderColor: 'transparent', opacity: 0 };
    }
  };

  const GradientCell = ({ day }: { day: DayData }) => {
    const props = getCellProps(day.status);

    return (
      <TouchableOpacity
        disabled={day.status === 'EMPTY'}
        onPress={() => handlePress(day)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={props.colors as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.cell,
            {
              width: itemWidth,
              height: itemHeight,
              borderWidth: props.borderWidth,
              borderColor: props.borderColor,
              opacity: props.opacity,
            },
          ]}
        >
          {day.status !== 'EMPTY' && (
            <Text style={[styles.cellText, { color: props.textColor, fontSize: itemHeight * 0.45 }]}>
              {day.dayOfMonth}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const WeekDaysHeader = () => {
    const days = t('calendar.weekdays', { returnObjects: true }) as string[];
    return (
      <View style={styles.headerRow}>
        <View style={{ width: MONTH_LABEL_WIDTH, marginRight: GAP }} />
        <View style={styles.daysHeader}>
          {days.map((d, i) => (
            <Text key={i} style={[styles.weekDayText, { width: itemWidth }]}>
              {d}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <WeekDaysHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {months.map((month) => (
          <View key={month.id} style={styles.monthRow}>

            <View style={styles.monthLabelContainer}>
              <Text style={styles.monthTitle}>
                {month.name.toUpperCase().split('').join('\n')}
              </Text>
            </View>

            <View style={[styles.grid, { width: availableWidth }]}>
              {month.days.map((day) => (
                <GradientCell key={day.id} day={day} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 5,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    marginBottom: GAP,
    marginTop: 10,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  daysHeader: {
    flexDirection: 'row',
    gap: GAP,
  },
  weekDayText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  monthRow: {
    flexDirection: 'row',
    marginBottom: GAP * 2,
    alignItems: 'stretch',
  },
  monthLabelContainer: {
    width: MONTH_LABEL_WIDTH,
    marginRight: GAP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '800', // Жирнее
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontWeight: '700',
  },
});
