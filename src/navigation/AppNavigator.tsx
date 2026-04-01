// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { ListScreen } from '../screens/ListScreen';
import { TrackerDetailScreen } from '../screens/TrackerDetailScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CreateTrackerScreen } from '../screens/CreateTrackerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditTrackerScreen } from '../screens/EditTrackerScreen';
import { DayDetailScreen } from '../screens/DayDetailScreen'; // <-- 1. ИМПОРТИРУЕМ НОВЫЙ ЭКРАН

import { ListCheck, PlusSquare, CalendarDays, User } from 'lucide-react-native';
import colors from '../constants/colors';
import { View } from 'react-native';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const CalendarStack = createNativeStackNavigator(); // <-- 2. СОЗДАЕМ СТЕК ДЛЯ КАЛЕНДАРЯ

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="TrackerList" component={ListScreen} />
      <HomeStack.Screen name="TrackerDetail" component={TrackerDetailScreen} />
    </HomeStack.Navigator>
  );
};

// 3. ДОБАВЛЯЕМ НАВИГАТОР ДЛЯ ВКЛАДКИ КАЛЕНДАРЯ
const CalendarStackNavigator = () => {
  return (
    <CalendarStack.Navigator screenOptions={{ headerShown: false }}>
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
      <CalendarStack.Screen name="DayDetail" component={DayDetailScreen} />
      {/* Добавляем TrackerDetail и сюда, чтобы карточки открывались плавно поверх календаря */}
      <CalendarStack.Screen name="TrackerDetail" component={TrackerDetailScreen} />
    </CalendarStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();
const AddPlaceholder = () => <View style={{flex:1, backgroundColor: colors.background}} />;

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0E',
          borderTopWidth: 1,
          borderTopColor: colors.borders.past,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.gradients.today[1],
        tabBarInactiveTintColor: colors.text.dim,
        tabBarShowLabel: false,
      }}
    >
      {/* ТАБ 1: СПИСОК */}
      <Tab.Screen
        name="ListTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <ListCheck color={color} size={size} />,
        }}
      />

      {/* ТАБ 2: ПЛЮС */}
      <Tab.Screen
        name="AddButton"
        component={AddPlaceholder}
        options={{
          tabBarIcon: ({ focused }) => (
            <PlusSquare
              color={focused ? colors.gradients.today[1] : colors.text.primary}
              size={32}
              strokeWidth={2}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateTracker');
          },
        })}
      />

      {/* ТАБ 3: КАЛЕНДАРЬ */}
      <Tab.Screen
        name="Calendar"
        component={CalendarStackNavigator} // <-- 4. ЗАМЕНИЛИ КОМПОНЕНТ НА СТЕК
        options={{
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />

      {/* ТАБ 4: ПРОФИЛЬ */}
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />

    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>

        <RootStack.Screen name="MainTabs" component={TabNavigator} />

        <RootStack.Screen
          name="CreateTracker"
          component={CreateTrackerScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />

        <RootStack.Screen
          name="EditTracker"
          component={EditTrackerScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />

      </RootStack.Navigator>
    </NavigationContainer>
  );
};
