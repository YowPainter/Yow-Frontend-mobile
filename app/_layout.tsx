import 'react-native-reanimated';
import "../global.css";
import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { useFonts, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { initializeApi } from '../lib/apiInit';
import { View, Text, ScrollView, RefreshControl, SafeAreaView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

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
        headerRight: () => {
          const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
          if (!isAuthenticated) return null;
          return (
            <TouchableOpacity
              onPress={() => router.push('/chat')}
              style={{ marginRight: 8, padding: 8 }}
            >
              <MessageSquare color="#141210" size={22} />
            </TouchableOpacity>
          );
        },
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
      <Stack.Screen name="chat/index" options={{ title: 'Messagerie', headerShown: true }} />
      <Stack.Screen name="chat/[id]" options={{ title: 'Discussion', headerShown: true }} />
    </Stack>
  );
}
