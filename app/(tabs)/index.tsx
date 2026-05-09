import {
  View, Text, ScrollView, RefreshControl, SafeAreaView,
  TextInput, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { GlobalSearchService } from '../../lib/services/GlobalSearchService';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import ArtworkCard from '../../components';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

const TECHNIQUES = ['OIL', 'ACRYLIC', 'WATERCOLOR', 'GOUACHE', 'PASTEL', 'CHARCOAL', 'PENCIL', 'MIXED_MEDIA'];
const TECHNIQUE_LABELS: Record<string, string> = {
  OIL: 'Huile', ACRYLIC: 'Acrylique', WATERCOLOR: 'Aquarelle',
  GOUACHE: 'Gouache', PASTEL: 'Pastel', CHARCOAL: 'Fusain',
  PENCIL: 'Crayon', MIXED_MEDIA: 'Techniques mixtes',
};
const STYLES = ['ABSTRACT', 'FIGURATIVE', 'PORTRAIT', 'LANDSCAPE', 'IMPRESSIONISM', 'CONTEMPORARY'];
const STYLE_LABELS: Record<string, string> = {
  ABSTRACT: 'Abstrait', FIGURATIVE: 'Figuratif', PORTRAIT: 'Portrait',
  LANDSCAPE: 'Paysage', IMPRESSIONISM: 'Impressionnisme', CONTEMPORARY: 'Contemporain',
};

export default function GalleryTab() {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchArtworks = useCallback(async (searchQuery = activeSearch) => {
    try {
      let data: ArtworkResponse[];
      if (searchQuery.trim()) {
        const results = await GlobalSearchService.globalSearch(searchQuery.trim());
        data = results.artworks || [];
      } else {
        data = await ArtworksService.getLatestArtworks();
      }

      // Client-side filter by technique/style
      if (selectedTechnique) data = data.filter(a => a.technique === selectedTechnique);
      if (selectedStyle) data = data.filter(a => a.style === selectedStyle);

      setArtworks(data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSearch, selectedTechnique, selectedStyle]);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

  const handleSearch = () => {
    setActiveSearch(search);
    setLoading(true);
  };

  const clearSearch = () => {
    setSearch('');
    setActiveSearch('');
    setLoading(true);
  };

  const clearFilters = () => {
    setSelectedTechnique(null);
    setSelectedStyle(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArtworks();
  };

  const hasActiveFilters = selectedTechnique || selectedStyle || activeSearch;

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C26D5C" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="font-serif text-4xl text-foreground">
            La Galerie<Text className="text-accent">.</Text>
          </Text>
          <Text className="font-sans text-[10px] text-accent font-bold uppercase tracking-widest mt-1">
            {artworks.length} œuvre{artworks.length !== 1 ? 's' : ''} • Exclusivité
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center bg-white rounded-2xl border border-black/8 shadow-sm px-4 gap-3">
            <Search size={18} color="#9A8880" />
            <TextInput
              className="flex-1 font-sans text-sm text-foreground py-4"
              placeholder="Rechercher une œuvre, un artiste..."
              placeholderTextColor="#9A8880"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={16} color="#9A8880" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className={`w-8 h-8 rounded-xl items-center justify-center ${showFilters ? 'bg-accent' : 'bg-foreground/5'}`}
            >
              <SlidersHorizontal size={16} color={showFilters ? 'white' : '#9A8880'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <View className="px-6 mb-4 flex-row flex-wrap gap-2 items-center">
            {activeSearch && (
              <View className="flex-row items-center bg-accent/10 px-3 py-1.5 rounded-full gap-1.5">
                <Text className="font-sans text-[10px] font-bold text-accent">"{activeSearch}"</Text>
                <TouchableOpacity onPress={clearSearch}><X size={10} color="#C26D5C" /></TouchableOpacity>
              </View>
            )}
            {selectedTechnique && (
              <View className="flex-row items-center bg-ink/10 px-3 py-1.5 rounded-full gap-1.5">
                <Text className="font-sans text-[10px] font-bold text-foreground">{TECHNIQUE_LABELS[selectedTechnique]}</Text>
                <TouchableOpacity onPress={() => setSelectedTechnique(null)}><X size={10} color="#141210" /></TouchableOpacity>
              </View>
            )}
            {selectedStyle && (
              <View className="flex-row items-center bg-ink/10 px-3 py-1.5 rounded-full gap-1.5">
                <Text className="font-sans text-[10px] font-bold text-foreground">{STYLE_LABELS[selectedStyle]}</Text>
                <TouchableOpacity onPress={() => setSelectedStyle(null)}><X size={10} color="#141210" /></TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={() => { clearSearch(); clearFilters(); }}>
              <Text className="font-sans text-[10px] text-muted underline">Tout effacer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <View className="px-6 mb-6 bg-white mx-4 rounded-3xl p-5 border border-black/5 shadow-sm">
            <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Technique</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2">
                {TECHNIQUES.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedTechnique(selectedTechnique === t ? null : t)}
                    className={`px-4 py-2 rounded-full border ${selectedTechnique === t ? 'bg-ink border-ink' : 'bg-background border-black/10'}`}
                  >
                    <Text className={`font-sans text-[10px] font-bold ${selectedTechnique === t ? 'text-white' : 'text-muted'}`}>
                      {TECHNIQUE_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {STYLES.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedStyle(selectedStyle === s ? null : s)}
                    className={`px-4 py-2 rounded-full border ${selectedStyle === s ? 'bg-accent border-accent' : 'bg-background border-black/10'}`}
                  >
                    <Text className={`font-sans text-[10px] font-bold ${selectedStyle === s ? 'text-white' : 'text-muted'}`}>
                      {STYLE_LABELS[s]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Artworks Grid */}
        <View className="px-4 pb-10">
          {loading && !refreshing ? (
            <View className="py-20 items-center">
              <ActivityIndicator color="#C26D5C" size="large" />
            </View>
          ) : artworks.length > 0 ? (
            <View className="gap-6">
              {artworks.map((item, index) => (
                <ArtworkCard key={item.id || index} artwork={item} />
              ))}
            </View>
          ) : (
            <View className="py-20 items-center border border-dashed border-black/10 rounded-[40px]">
              <Text className="text-4xl mb-4">🔍</Text>
              <Text className="font-serif text-xl text-foreground mb-2">Aucun résultat</Text>
              <Text className="font-sans text-sm text-muted text-center px-10">
                Aucune œuvre ne correspond à votre recherche. Essayez d'autres critères.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
