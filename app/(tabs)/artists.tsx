import { View, Text, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { ArtistResponse } from '../../lib/models/ArtistResponse';
import { Search, X, ChevronRight } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

export default function ArtistsDirectory() {
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const fetchArtists = useCallback(async (searchQuery = activeSearch) => {
    setLoading(true);
    try {
      const data = await ArtistsService.searchArtists(searchQuery.trim());
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  }, [activeSearch]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleSearch = () => {
    setActiveSearch(search);
  };

  const clearSearch = () => {
    setSearch('');
    setActiveSearch('');
  };

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View className="px-6 pt-10 pb-6 border-b border-foreground/5">
          <Text className="font-serif text-4xl text-foreground mb-2">
            Nos Artistes<Text className="text-accent">.</Text>
          </Text>
          <Text className="font-sans text-sm text-muted leading-relaxed">
            Explorez une collection de talents visionnaires sélectionnés pour leur <Text className="text-accent font-bold">audace</Text> et leur <Text className="text-accent font-bold">maîtrise</Text>.
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 py-6">
          <View className="flex-row items-center bg-white rounded-full border border-black/10 shadow-sm px-4">
            <Search size={20} color="#9A8880" />
            <TextInput
              className="flex-1 font-sans text-base text-foreground py-4 ml-3"
              placeholder="Rechercher un artiste..."
              placeholderTextColor="#9A8880"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="p-2">
                <X size={18} color="#9A8880" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Artist List */}
        <View className="px-6 pb-10">
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color="#C26D5C" size="large" />
            </View>
          ) : artists.length > 0 ? (
            <View className="gap-4">
              {artists.map((artist, index) => (
                <TouchableOpacity
                  key={artist.id || index}
                  onPress={() => artist.slug && router.push(`/artist/${artist.slug}` as any)}
                  className="flex-row items-center bg-white p-5 rounded-[32px] border border-black/5 shadow-sm"
                >
                  <View className="w-20 h-20 rounded-[24px] bg-foreground/5 overflow-hidden border border-black/5">
                    <Image
                      source={artist.profilePictureUrl ? { uri: artist.profilePictureUrl } : require('../../assets/images/placeholder.png')}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1 ml-5">
                    <Text className="font-serif text-xl text-foreground mb-1">
                      {artist.artistName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Artiste inconnu'}
                    </Text>
                    <Text className="font-sans text-xs text-muted leading-relaxed" numberOfLines={2}>
                      {artist.bio || 'Artiste de la galerie. Explorez sa collection exceptionnelle d\'œuvres.'}
                    </Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center ml-2">
                    <ChevronRight size={16} color="#C26D5C" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-20 items-center border border-dashed border-black/10 rounded-[40px]">
              <Text className="text-4xl mb-4">🎭</Text>
              <Text className="font-serif text-xl text-foreground mb-2">Aucun artiste trouvé</Text>
              <Text className="font-sans text-sm text-muted text-center px-10">
                Aucun artiste ne correspond à "{activeSearch}".
              </Text>
              <TouchableOpacity onPress={clearSearch} className="mt-6 border-b border-accent pb-1">
                <Text className="font-sans text-xs font-bold text-accent uppercase tracking-widest">Réinitialiser la recherche</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
