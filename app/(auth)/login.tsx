import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../lib/toast';
import AmbientBackground from '../../components/AmbientBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const getErrorMessage = (error: any) => {
    if (error?.body?.message) return error.body.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return error?.message || 'Email ou mot de passe incorrect';
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      const msg = 'Veuillez remplir tous les champs';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Bienvenue, ${user.firstName || 'Artiste'} !`);
      
      if (user.role === 'ROLE_ARTIST') {
        router.replace('/(dashboard)/artdashboard');
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior="padding" 
      className="flex-1 bg-background relative overflow-hidden"
    >
      <AmbientBackground />
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        
        {/* Header Hero */}
        <View className="h-[280px] w-full relative bg-ink">
          <Image 
            source={require('../../assets/images/african-login-art.png')} 
            className="w-full h-full opacity-70"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
          
          <TouchableOpacity 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
            className="absolute top-14 left-6 w-12 h-12 items-center justify-center rounded-full bg-black/20 border border-white/20"
          >
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          
          <View className="absolute bottom-12 left-8 right-8">
            <Text className="font-serif text-5xl text-white tracking-tight mb-2">Connexion.</Text>
            <Text className="font-sans text-white/80 text-sm font-light italic">Heureux de vous revoir parmi nous.</Text>
          </View>
        </View>

        {/* Minimalist Form */}
        <View className="bg-background px-8 pt-8 pb-12">
          
          {/* Email Field */}
          <View className="mb-8">
            <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ${focusedField === 'email' ? 'text-accent' : 'text-muted'}`}>
              Adresse Email
            </Text>
            <TextInput 
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="nom@exemple.com"
              placeholderTextColor="#9A8880"
              className={`font-sans text-xl text-foreground pb-4 border-b ${focusedField === 'email' ? 'border-accent' : 'border-black/10'}`}
              autoCapitalize="none"
              keyboardType="email-address"
              selectionColor="#C26D5C"
            />
          </View>

          {/* Password Field */}
          <View className="mb-12 relative">
            <View className="flex-row justify-between items-end mb-2">
              <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold ${focusedField === 'password' ? 'text-accent' : 'text-muted'}`}>
                Mot de passe
              </Text>
              <TouchableOpacity>
                <Text className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-accent">Oublié ?</Text>
              </TouchableOpacity>
            </View>
            <View className="relative justify-center">
              <TextInput 
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                placeholderTextColor="#9A8880"
                className={`font-sans text-xl text-foreground pb-4 pr-12 border-b ${focusedField === 'password' ? 'border-accent' : 'border-black/10'}`}
                secureTextEntry={!showPassword}
                selectionColor="#C26D5C"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-4 p-2"
              >
                {showPassword ? <EyeOff size={20} color="#9A8880" /> : <Eye size={20} color="#9A8880" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message Display */}
          {errorMessage && (
            <View className="mb-6 bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-center">
              <Text className="text-red-600 font-sans text-xs flex-1">{errorMessage}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className="w-full bg-ink py-5 items-center flex-row justify-center shadow-lg active:bg-ink/90"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-sans font-bold uppercase tracking-[0.4em] text-xs">Se Connecter</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-16 items-center">
            <Text className="font-sans text-muted font-light italic mb-4">Nouveau dans la galerie ?</Text>
            <TouchableOpacity 
              onPress={() => router.push('/register' as any)}
              className="border border-black/10 px-10 py-4"
            >
              <Text className="font-sans text-[10px] font-bold text-ink uppercase tracking-[0.3em]">Créer un compte</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
