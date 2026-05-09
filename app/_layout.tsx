import "../global.css";
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { initializeApi } from '../lib/apiInit';
import { View, Text, ScrollView, RefreshControl, SafeAreaView, Image, ActivityIndicator } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeApi();
        // Délai artificiel pour afficher le beau splash screen (1.5 secondes)
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!appReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2EFE9' }}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 24 }}
          resizeMode="contain"
        />
        {fontsLoaded && (
          <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 36, color: '#141210' }}>
            YowPainter
          </Text>
        )}
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#F2EFE9',
        },
        headerTintColor: '#141210',
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay_600SemiBold',
        },
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={{ width: 40, height: 40, borderRadius: 20 }}
              resizeMode="contain" 
            />
            <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 18 }}>YowPainter</Text>
          </View>
        ),
        contentStyle: {
          backgroundColor: '#F2EFE9',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="gallery/[id]" options={{ title: 'Détails', headerShown: false }} />
      <Stack.Screen name="artist/[slug]" options={{ title: 'Artiste', headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ title: 'Connexion', presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ title: 'Inscription', presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
