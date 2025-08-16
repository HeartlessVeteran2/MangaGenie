/**
 * MangaAI Android App
 * Main Application Component
 */

import React, { useEffect } from 'react';
import {
  StatusBar,
  useColorScheme,
  LogBox,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RepositoryProvider } from './contexts/RepositoryContext';
import { Colors } from './constants/Colors';

// Disable specific warnings for development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
    flex: 1,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RepositoryProvider>
              <NavigationContainer>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={backgroundStyle.backgroundColor}
                />
                <AppNavigator />
              </NavigationContainer>
            </RepositoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;