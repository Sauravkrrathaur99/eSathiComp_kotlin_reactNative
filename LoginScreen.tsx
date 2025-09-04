import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, Text, StyleSheet, Image, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authorize } from 'react-native-app-auth';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const clientId = '68a4e767-34b2-41e5-b4c7-59578dae21b8';
const tenantId = '1de61f46-fc12-4067-ab1d-147eb7e21025';
const redirectUri = 'msauth://com.esathicomp/M61nf%2BaC69kCXmFY1ejcX83rDNc%3D'; // Change per your app

const config = {
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  clientId,
  redirectUrl: redirectUri,
  scopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
  additionalParameters: {},
  serviceConfiguration: {
    authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  },
};

const backgroundImage = require('./assets/images/login_bg.png');
const msIcon = require('./assets/images/Microsoft_Logo_16px.png'); // Optional icon

const LoginScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (storedToken) {
          await validateToken(storedToken);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
        setErrorMessage('Error loading token. Please try again.');
      }
    };
    checkExistingToken();
  }, []);

  const validateToken = async (token) => {
    setLoading(true);
    try {
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userInfoResponse.ok) {
        const userData = await userInfoResponse.json();
        setUserInfo(userData);
        const userName = `${userData.givenName || ''} ${userData.surname || ''}`.trim() || 'User';
        await AsyncStorage.setItem('userName', userName);
        // Navigate to main app screen after login
        navigation.replace('MainTab'); // adjust as per your navigation structure
      } else {
        await AsyncStorage.removeItem('accessToken');
        setLoading(false);
      }
    } catch (e) {
      await AsyncStorage.removeItem('accessToken');
      setLoading(false);
      setErrorMessage('Failed to validate token. Please try again.');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const authResult = await authorize(config);
      await AsyncStorage.setItem('accessToken', authResult.accessToken);
      if (authResult.refreshToken) {
        await AsyncStorage.setItem('refreshToken', authResult.refreshToken);
      }
      validateToken(authResult.accessToken);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'Failed to authorize');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.container}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.container}>
          {/* App Name and Tagline centered above button */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={styles.title}>
              eSathi-Onelogica
            </Text>
            <Text style={styles.subtitle}>
              Your Smart Companion App
            </Text>
          </View>
          {/* Sign in with Microsoft button */}
          <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
            <Image source={msIcon} style={styles.microsoftLogo} />
            <Text style={styles.signInButtonText}>
              {loading ? 'Signing in...' : 'Sign in with Microsoft'}
            </Text>
          </TouchableOpacity>
          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        </View>
      </SafeAreaView>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  microsoftLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#0078D4',
    fontWeight: '500',
  },
  loading: {
    color: '#FF8C00',
    fontSize: 18,
  },
  errorMessage: {
    marginTop: 20,
    color: '#FF0000',
    fontWeight: '600',
  },
});

export default LoginScreen;
