// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TrackerDetailScreen } from '../screens/TrackerDetailScreen';
import { ListScreen } from '../screens/ListScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ListCheck, PlusCircle, CalendarDays } from 'lucide-react-native';
import colors from '../constants/colors';
import { View } from 'react-native';

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

export const AppNavigator = () => {
  return (
    <NavigationContainer>
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
          name="Add"
          component={AddPlaceholder}
          options={{
            tabBarIcon: ({ focused }) => (
              <PlusCircle
                color={focused ? colors.gradients.today[1] : colors.text.primary}
                size={32}
                strokeWidth={2}
              />
            ),
          }}
          listeners={() => ({ tabPress: (e) => { e.preventDefault(); alert('Add modal'); } })}
        />

        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
