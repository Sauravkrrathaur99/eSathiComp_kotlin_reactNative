import * as React from 'react';
import { Button, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';
import UserScreen from './UserScreen';
import BackgroundService from 'react-native-background-actions';
import { NewAppScreen } from '@react-native/new-app-screen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Your foreground/background service helpers
const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(null), time));

const veryIntensiveTask = async (taskDataArguments: { delay: number }) => {
  const { delay } = taskDataArguments;
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
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourapp://',
  parameters: {
    delay: 1000,
  },
};

function MainTab() {
  const safeAreaInsets = useSafeAreaInsets();

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
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#faf7fd',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: safeAreaInsets.bottom,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '500',
        },
        tabBarActiveTintColor: '#4a299e',
        tabBarInactiveTintColor: '#878787',
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'History') {
            return <Ionicons name="time-outline" size={24} color={color} />;
          }
          if (route.name === 'Home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />;
          }
          if (route.name === 'User') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="Home"
        options={{ title: 'Home' }}
      >
        {() => (
          <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
            {/* YOUR ORIGINAL "MainApp" CONTENT PRESERVED */}
            {/* Your actual MainScreen UI untouched */}

            <MainScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainTab" component={MainTab} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
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
