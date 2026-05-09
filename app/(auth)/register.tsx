import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../lib/toast';
import { RegisterRequest } from '../../lib/models/RegisterRequest';
import AmbientBackground from '../../components/AmbientBackground';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'firstName' | 'lastName' | 'email' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const register = useAuthStore((state) => state.register);

  const getErrorMessage = (error: any) => {
    if (error?.body?.message) return error.body.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return error?.message || 'Erreur lors de l\'inscription';
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!firstName || !email || !password) {
      const msg = 'Veuillez remplir les champs obligatoires';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      await register({ 
        firstName, 
        lastName, 
        email, 
        password, 
        role: RegisterRequest.role.ROLE_BUYER 
      });
      toast.success('Compte créé avec succès !');
      router.replace('/');
    } catch (error: any) {
      console.error('Register error:', error);
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background relative overflow-hidden"
    >
      <AmbientBackground />
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Header Hero */}
        <View className="h-[35%] w-full relative bg-ink">
          <Image 
            source={require('../../assets/images/african-register-art.png')} 
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
          
          <View className="absolute bottom-10 left-8 right-8">
            <Text className="font-serif text-5xl text-white tracking-tight mb-2">Inscription.</Text>
            <Text className="font-sans text-white/80 text-sm font-light italic">Rejoignez la collection.</Text>
          </View>
        </View>

        {/* Minimalist Form */}
        <View className="flex-1 bg-background px-8 pt-6 pb-12">
          
          {/* Names Row */}
          <View className="flex-row gap-6 mb-8">
            <View className="flex-1">
              <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ${focusedField === 'firstName' ? 'text-accent' : 'text-muted'}`}>
                Prénom *
              </Text>
              <TextInput 
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                placeholder="John"
                placeholderTextColor="#9A8880"
                className={`font-sans text-xl text-foreground pb-4 border-b ${focusedField === 'firstName' ? 'border-accent' : 'border-black/10'}`}
                selectionColor="#C26D5C"
              />
            </View>
            <View className="flex-1">
              <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ${focusedField === 'lastName' ? 'text-accent' : 'text-muted'}`}>
                Nom
              </Text>
              <TextInput 
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
                placeholder="Doe"
                placeholderTextColor="#9A8880"
                className={`font-sans text-xl text-foreground pb-4 border-b ${focusedField === 'lastName' ? 'border-accent' : 'border-black/10'}`}
                selectionColor="#C26D5C"
              />
            </View>
          </View>

          {/* Email Field */}
          <View className="mb-8">
            <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ${focusedField === 'email' ? 'text-accent' : 'text-muted'}`}>
              Adresse Email *
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
            <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ${focusedField === 'password' ? 'text-accent' : 'text-muted'}`}>
              Mot de passe *
            </Text>
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

          {/* Register Button */}
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            className="w-full bg-accent py-5 items-center flex-row justify-center shadow-lg active:bg-accent/90"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-sans font-bold uppercase tracking-[0.4em] text-xs">Créer le compte</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-16 items-center">
            <Text className="font-sans text-muted font-light italic mb-4">Déjà membre de la galerie ?</Text>
            <TouchableOpacity 
              onPress={() => router.push('/login' as any)}
              className="border border-black/10 px-10 py-4"
            >
              <Text className="font-sans text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Se connecter</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
