import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { ListScreen } from '../screens/ListScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ListCheck, CalendarDays, SquarePlus } from 'lucide-react-native';
import colors from '../constants/colors';
import { View } from 'react-native';

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
          name="List"
          component={ListScreen}
          options={{
            tabBarIcon: ({ color, size }) => <ListCheck color={color} size={size} />,
          }}
        />

        <Tab.Screen
          name="Add"
          component={AddPlaceholder}
          options={{
            tabBarIcon: ({ focused }) => (
              <SquarePlus
                color={focused ? colors.gradients.today[1] : colors.text.primary}
                size={32}
                strokeWidth={2}
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              alert('Открыть модалку создания!');
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
    </NavigationContainer>
  );
};
