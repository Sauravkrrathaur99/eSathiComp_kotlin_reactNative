/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Button, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewAppScreen } from '@react-native/new-app-screen';
import BackgroundService from 'react-native-background-actions';

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(null), time));

const veryIntensiveTask = async (taskDataArguments: { delay: number }) => {
  const { delay } = taskDataArguments;
  // Runs in the foreground service
  while (BackgroundService.isRunning()) {
    console.log('Foreground service running...');
    await sleep(delay);
  }
};

const options = {
  taskName: 'eSathi Foreground Service',
  taskTitle: 'eSathi is running',
  taskDesc: 'App is running in the background',
  taskIcon: {
    name: 'ic_launcher', // Your app icon name without extension
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourapp://', // optional deep link URI
  parameters: {
    delay: 1000,
  },
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const startService = async () => {
    if (!BackgroundService.isRunning()) {
      await BackgroundService.start(veryIntensiveTask, options);
      console.log('Foreground service started');
    }
  };

  const stopService = async () => {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
      console.log('Foreground service stopped');
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent startService={startService} stopService={stopService} />
    </SafeAreaProvider>
  );
}

function AppContent({
  startService,
  stopService,
}: {
  startService: () => Promise<void>;
  stopService: () => Promise<void>;
}) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <NewAppScreen templateFileName="App.tsx" safeAreaInsets={safeAreaInsets} />
      <View style={styles.buttonsContainer}>
        <Button title="Start Foreground Service" onPress={startService} />
        <Button title="Stop Foreground Service" onPress={stopService} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    height: 100,
  },
});

export default App;
