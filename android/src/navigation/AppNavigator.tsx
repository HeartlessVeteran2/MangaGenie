/**
 * Main App Navigation Component
 * Bottom Tab Navigation with Stack Navigation for each tab
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import AnimeScreen from '../screens/AnimeScreen';
import RepositoriesScreen from '../screens/RepositoriesScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReaderScreen from '../screens/ReaderScreen';
import PlayerScreen from '../screens/PlayerScreen';

import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
};

const LibraryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
};

const AnimeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnimeMain" component={AnimeScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
};

const RepositoriesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RepositoriesMain" component={RepositoriesScreen} />
    </Stack.Navigator>
  );
};

const DownloadsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DownloadsMain" component={DownloadsScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Library':
              iconName = 'library-books';
              break;
            case 'Anime':
              iconName = 'play-circle-outline';
              break;
            case 'Sources':
              iconName = 'source';
              break;
            case 'Downloads':
              iconName = 'download';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryStack}
        options={{ title: 'Library' }}
      />
      <Tab.Screen 
        name="Anime" 
        component={AnimeStack}
        options={{ title: 'Anime' }}
      />
      <Tab.Screen 
        name="Sources" 
        component={RepositoriesStack}
        options={{ title: 'Sources' }}
      />
      <Tab.Screen 
        name="Downloads" 
        component={DownloadsStack}
        options={{ title: 'Downloads' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;