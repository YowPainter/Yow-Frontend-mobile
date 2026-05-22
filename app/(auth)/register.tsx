import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../lib/toast';
import { RegisterRequest } from '../../lib/models/RegisterRequest';
import { uploadToCloudinary } from '../../lib/cloudinary';
import AmbientBackground from '../../components/AmbientBackground';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function Register() {
  const [role, setRole] = useState<'COLLECTOR' | 'ARTIST'>('COLLECTOR');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'firstName' | 'lastName' | 'artistName' | 'email' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const register = useAuthStore((state) => state.register);

  const getErrorMessage = (error: any) => {
    if (error?.body?.message) return error.body.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return error?.message || 'Erreur lors de l\'inscription';
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Permission d\'accès aux photos requise');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    setAvatarUri(null);
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!firstName || !email || !password || (role === 'ARTIST' && !artistName)) {
      const msg = 'Veuillez remplir les champs obligatoires';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      let avatarUrl = '';
      if (avatarUri) {
        try {
          avatarUrl = await uploadToCloudinary(avatarUri);
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          toast.error("Échec de l'envoi de l'image. Veuillez réessayer.");
          setLoading(false);
          return;
        }
      }

      const nameForSlug = role === 'ARTIST' ? (artistName || `${firstName}-${lastName}`) : `${firstName}-${lastName}`;
      const generatedSlug = slugify(nameForSlug) + "-" + Math.random().toString(36).substring(2, 7);

      await register({ 
        firstName, 
        lastName, 
        email, 
        password, 
        role: role === 'ARTIST' ? RegisterRequest.role.ROLE_ARTIST : RegisterRequest.role.ROLE_BUYER,
        artistName: role === 'ARTIST' ? artistName : undefined,
        slug: generatedSlug,
        imageURL: avatarUrl || undefined,
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
      behavior="padding" 
      style={{ flex: 1 }}
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
        <View className="h-[220px] w-full relative bg-ink">
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
          
          <View className="absolute bottom-8 left-8 right-8">
            <Text className="font-serif text-4xl text-white tracking-tight mb-1">Inscription.</Text>
            <Text className="font-sans text-white/80 text-xs font-light italic">Commencer votre voyage artistique.</Text>
          </View>
        </View>

        {/* Form Container */}
        <View className="bg-background px-8 pt-6 pb-12">
          
          {/* Role Selection */}
          <View className="flex-row gap-4 mb-8 p-1 bg-foreground/5 rounded-full">
            <TouchableOpacity
              onPress={() => setRole('COLLECTOR')}
              className={`flex-1 py-3 px-6 rounded-full items-center justify-center transition-all ${role === 'COLLECTOR' ? 'bg-foreground shadow-md' : ''}`}
            >
              <Text className={`font-sans text-[10px] uppercase tracking-[0.2em] font-bold ${role === 'COLLECTOR' ? 'text-background' : 'text-foreground/40'}`}>
                Collectionneur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole('ARTIST')}
              className={`flex-1 py-3 px-6 rounded-full items-center justify-center transition-all ${role === 'ARTIST' ? 'bg-accent shadow-md' : ''}`}
            >
              <Text className={`font-sans text-[10px] uppercase tracking-[0.2em] font-bold ${role === 'ARTIST' ? 'text-white' : 'text-foreground/40'}`}>
                Artiste
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Picture Picker */}
          <View className="items-center gap-2 mb-8">
            <View className="relative">
              <TouchableOpacity 
                onPress={pickAvatar}
                className="w-24 h-24 rounded-full border-2 border-dashed border-foreground/10 items-center justify-center overflow-hidden bg-foreground/5"
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Camera color="#9A8880" size={32} />
                )}
              </TouchableOpacity>
              {avatarUri ? (
                <TouchableOpacity 
                  onPress={removeAvatar}
                  className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-1 shadow-md"
                >
                  <X color="white" size={14} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={pickAvatar}
                  className="absolute -bottom-1 -right-1 bg-accent rounded-full p-2 shadow-md"
                >
                  <Camera color="white" size={14} />
                </TouchableOpacity>
              )}
            </View>
            <Text className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold text-muted mt-1">Photo de profil</Text>
          </View>

          {/* Names Row */}
          <View className="flex-row gap-6 mb-6">
            <View className="flex-1">
              <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-1 ${focusedField === 'firstName' ? 'text-accent' : 'text-muted'}`}>
                Prénom *
              </Text>
              <TextInput 
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                placeholder="John"
                placeholderTextColor="#9A8880"
                className={`font-sans text-lg text-foreground pb-2 border-b ${focusedField === 'firstName' ? 'border-accent' : 'border-black/10'}`}
                selectionColor="#C26D5C"
              />
            </View>
            <View className="flex-1">
              <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-1 ${focusedField === 'lastName' ? 'text-accent' : 'text-muted'}`}>
                Nom
              </Text>
              <TextInput 
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
                placeholder="Doe"
                placeholderTextColor="#9A8880"
                className={`font-sans text-lg text-foreground pb-2 border-b ${focusedField === 'lastName' ? 'border-accent' : 'border-black/10'}`}
                selectionColor="#C26D5C"
              />
            </View>
          </View>

          {/* Artist Name Input (Conditional) */}
          {role === 'ARTIST' && (
            <View className="mb-6">
              <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-1 ${focusedField === 'artistName' ? 'text-accent' : 'text-muted'}`}>
                Nom d'Artiste *
              </Text>
              <TextInput 
                value={artistName}
                onChangeText={setArtistName}
                onFocus={() => setFocusedField('artistName')}
                onBlur={() => setFocusedField(null)}
                placeholder="Votre nom d'artiste"
                placeholderTextColor="#9A8880"
                className={`font-sans text-lg text-foreground pb-2 border-b ${focusedField === 'artistName' ? 'border-accent' : 'border-black/10'}`}
                selectionColor="#C26D5C"
              />
            </View>
          )}

          {/* Email Field */}
          <View className="mb-6">
            <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-1 ${focusedField === 'email' ? 'text-accent' : 'text-muted'}`}>
              Adresse Email *
            </Text>
            <TextInput 
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="nom@exemple.com"
              placeholderTextColor="#9A8880"
              className={`font-sans text-lg text-foreground pb-2 border-b ${focusedField === 'email' ? 'border-accent' : 'border-black/10'}`}
              autoCapitalize="none"
              keyboardType="email-address"
              selectionColor="#C26D5C"
            />
          </View>

          {/* Password Field */}
          <View className="mb-10 relative">
            <Text className={`font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-1 ${focusedField === 'password' ? 'text-accent' : 'text-muted'}`}>
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
                className={`font-sans text-lg text-foreground pb-2 pr-12 border-b ${focusedField === 'password' ? 'border-accent' : 'border-black/10'}`}
                secureTextEntry={!showPassword}
                selectionColor="#C26D5C"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 p-2"
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
            className={`w-full py-5 items-center flex-row justify-center shadow-lg active:opacity-90 ${role === 'COLLECTOR' ? 'bg-foreground' : 'bg-accent'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-sans font-bold uppercase tracking-[0.4em] text-xs">Créer le compte</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-12 items-center">
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
