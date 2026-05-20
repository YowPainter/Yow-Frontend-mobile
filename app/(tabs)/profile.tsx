import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Settings, LayoutGrid, Heart, History, LogOut, ChevronRight, ChevronLeft, MessageSquare } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

export default function ProfileTab() {
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
    <View className="flex-1 bg-background justify-center items-center px-10 relative overflow-hidden">
        <AmbientBackground />
        
        <View className="w-20 h-20 rounded-full bg-foreground/5 items-center justify-center mb-6">
          <LogOut size={32} color="#9A8880" />
        </View>
        <Text className="font-serif text-2xl text-foreground text-center mb-2">Rejoignez YowPainter</Text>
        <Text className="font-sans text-sm text-muted text-center mb-10 leading-relaxed"> Connectez-vous pour gérer vos collections, suivre vos artistes favoris et accéder à votre espace artiste. </Text>
        <TouchableOpacity 
          onPress={() => router.push('/login')}
          className="w-full bg-ink py-5 rounded-3xl items-center shadow-lg"
        >
          <Text className="text-white font-sans font-bold uppercase tracking-widest text-xs">Se Connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View className="py-6 items-center">
          <View className="relative">
            <View className="w-32 h-32 rounded-[48px] overflow-hidden bg-foreground/5 border-4 border-white shadow-xl">
              <Image 
                source={user?.profilePictureUrl ? { uri: user.profilePictureUrl } : require('../../assets/images/placeholder.png')} 
                className="w-full h-full"
              />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-2xl items-center justify-center border-4 border-background shadow-lg">
              <Settings size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="font-serif text-3xl text-foreground mt-6">{user?.firstName} {user?.lastName}</Text>
          <Text className="font-sans text-xs text-muted uppercase tracking-[0.2em] mt-1">{user?.role === 'ROLE_ARTIST' ? 'Artiste Certifié' : 'Collectionneur'}</Text>
          
          {user?.bio && (
            <Text className="font-sans text-sm text-muted text-center mt-4 px-6 leading-relaxed">
              {user.bio}
            </Text>
          )}

          <TouchableOpacity 
            onPress={() => router.push('/(dashboard)/artdashboard' as any)} // Redirect to dash for editing
            className="mt-6 flex-row items-center gap-2 bg-foreground/5 px-6 py-3 rounded-2xl border border-black/5"
          >
            <Settings size={14} color="#141210" />
            <Text className="font-sans text-xs font-bold uppercase tracking-widest">Gérer le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Action Grid */}
        <View className="gap-6 mb-10">
          
          {user?.role === 'ROLE_ARTIST' && (
            <TouchableOpacity 
              onPress={() => router.push('/(dashboard)/artdashboard' as any)}
              className="flex-row items-center bg-accent/5 p-6 rounded-[32px] border border-accent/10"
            >
              <View className="w-12 h-12 rounded-2xl bg-accent items-center justify-center">
                <LayoutGrid size={24} color="white" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-serif text-lg text-foreground">Dashboard Artiste</Text>
                <Text className="font-sans text-xs text-muted">Gérez vos œuvres et statistiques</Text>
              </View>
              <ChevronRight size={20} color="#C26D5C" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={() => router.push('/chat')}
            className="flex-row items-center bg-white p-5 rounded-[28px] border border-black/5 shadow-sm"
          >
            <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
              <MessageSquare size={20} color="#8B5CF6" />
            </View>
            <Text className="flex-1 ml-4 font-serif text-base">Messagerie</Text>
            <ChevronRight size={18} color="#9A8880" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-5 rounded-[28px] border border-black/5 shadow-sm">
            <View className="w-10 h-10 rounded-xl bg-pink-50 items-center justify-center">
              <Heart size={20} color="#EC4899" />
            </View>
            <Text className="flex-1 ml-4 font-serif text-base">Favoris</Text>
            <ChevronRight size={18} color="#9A8880" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-5 rounded-[28px] border border-black/5 shadow-sm">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
              <History size={20} color="#3B82F6" />
            </View>
            <Text className="flex-1 ml-4 font-serif text-base">Historique d'achat</Text>
            <ChevronRight size={18} color="#9A8880" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-red-50 p-5 rounded-[28px] border border-red-100 shadow-sm"
          >
            <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center">
              <LogOut size={20} color="#EF4444" />
            </View>
            <Text className="flex-1 ml-4 font-serif text-base text-red-600">Déconnexion</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
}
