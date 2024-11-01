import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalProvider } from '../components/globalProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../utils/language/i18config';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        
        if (hasLaunched === null) {
          // First time launching the app
          await AsyncStorage.setItem('hasLaunched', 'true');
          router.replace('/welcome');
        } else {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        await SplashScreen.hideAsync();
      }
    };

    if (loaded) {
      checkFirstLaunch();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
    <GlobalProvider>
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ gestureEnabled: false }} />

        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
    </GlobalProvider>
    </I18nextProvider>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
