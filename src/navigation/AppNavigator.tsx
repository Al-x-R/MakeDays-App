// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { ListScreen } from '../screens/ListScreen';
import { TrackerDetailScreen } from '../screens/TrackerDetailScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CreateTrackerScreen } from '../screens/CreateTrackerScreen';

import { ListCheck, PlusSquare, CalendarDays } from 'lucide-react-native';
import colors from '../constants/colors';
import { View } from 'react-native';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="TrackerList" component={ListScreen} />
      <HomeStack.Screen name="TrackerDetail" component={TrackerDetailScreen} />
    </HomeStack.Navigator>
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
      <Tab.Screen
        name="ListTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <ListCheck color={color} size={size} />,
        }}
      />

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

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
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

      </RootStack.Navigator>
    </NavigationContainer>
  );
};
