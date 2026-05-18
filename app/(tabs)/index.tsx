import {
  View, Text, ScrollView, RefreshControl, SafeAreaView,
  TextInput, TouchableOpacity, ActivityIndicator, Image
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { GlobalSearchService } from '../../lib/services/GlobalSearchService';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import { ArtistResponse } from '../../lib/models/ArtistResponse';
import ArtworkCard from '../../components';
import { Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';
import CanvasGrain from '../../components/CanvasGrain';
import AbstractShapes from '../../components/AbstractShapes';
import { router } from 'expo-router';

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

// Organic paint stain styles for artist avatars
const SHAPES = [
  { borderTopLeftRadius: 35, borderTopRightRadius: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 30 },
  { borderTopLeftRadius: 20, borderTopRightRadius: 35, borderBottomLeftRadius: 30, borderBottomRightRadius: 25 },
  { borderTopLeftRadius: 35, borderTopRightRadius: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 35 },
  { borderTopLeftRadius: 25, borderTopRightRadius: 30, borderBottomLeftRadius: 35, borderBottomRightRadius: 20 },
];

export default function GalleryTab() {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [artists, setArtists] = useState<ArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async (searchQuery = activeSearch) => {
    try {
      let artworksData: ArtworkResponse[];
      if (searchQuery.trim()) {
        const results = await GlobalSearchService.globalSearch(searchQuery.trim());
        artworksData = results.artworks || [];
      } else {
        artworksData = await ArtworksService.getLatestArtworks();
      }

      // Client-side filter by technique/style
      if (selectedTechnique) artworksData = artworksData.filter(a => a.technique === selectedTechnique);
      if (selectedStyle) artworksData = artworksData.filter(a => a.style === selectedStyle);

      setArtworks(artworksData);

      // Fetch featured artists list
      const artistsData = await ArtistsService.searchArtists('');
      setArtists(artistsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching gallery home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSearch, selectedTechnique, selectedStyle]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    fetchData();
  };

  const hasActiveFilters = selectedTechnique || selectedStyle || activeSearch;

  // Split into masterpiece and acquisitions list
  const masterpiece = artworks[0];
  const acquisitions = artworks.slice(1);

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <CanvasGrain />
      <AbstractShapes />

      {/* Decorative Lettrine background Y */}
      <View className="absolute top-[80px] right-[-10px] z-[-1] pointer-events-none opacity-[0.02]">
        <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 240 }} className="text-accent">
          Y
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C26D5C" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Editorial Hero Banner */}
        <View className="px-6 pt-20 pb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-[1px] bg-accent" />
            <Text className="font-sans text-[10px] text-accent font-bold uppercase tracking-[0.3em]">
              YowPainter Gallery
            </Text>
          </View>
          <Text className="font-serif text-5xl leading-[1.1] text-foreground tracking-tight">
            L'Art.
          </Text>
          <Text className="font-serif text-5xl leading-[1.1] text-accent italic font-normal tracking-tight mt-1">
            Sans les murs.
          </Text>
          <Text className="font-sans text-xs text-muted leading-relaxed max-w-xs mt-3">
            Découvrez une sélection exclusive d'œuvres contemporaines uniques, à portée de main.
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 shadow-sm px-4 gap-3">
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

        {loading && !refreshing ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator color="#C26D5C" size="large" />
          </View>
        ) : (
          <View>
            {/* Curated Masterpiece Showcase (Pièce Maîtresse) */}
            {masterpiece && !hasActiveFilters && (
              <View className="mb-8 px-4">
                <View className="flex-row items-center justify-between mb-4 px-2">
                  <Text className="font-serif text-xl font-bold text-foreground">Pièce Maîtresse</Text>
                  <Text className="font-sans text-[9px] text-accent font-bold uppercase tracking-widest">
                    Acquisition Vedette
                  </Text>
                </View>
                <ArtworkCard artwork={masterpiece} />
              </View>
            )}

            {/* "Le Village des Créateurs" horizontal list of artists */}
            {artists.length > 0 && !hasActiveFilters && (
              <View className="mb-10 pt-4">
                <View className="flex-row justify-between items-end px-6 mb-6">
                  <View className="flex-1 mr-4">
                    <View className="w-6 h-[1.5px] bg-accent mb-2" />
                    <Text className="font-serif text-xl font-bold text-foreground">Village des Créateurs</Text>
                    <Text className="font-sans text-[9px] text-muted uppercase tracking-widest mt-0.5">Explorez leurs univers uniques</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/artists' as any)} 
                    className="flex-row items-center gap-1 active:opacity-60"
                  >
                    <Text className="font-sans text-[9px] font-bold text-accent uppercase tracking-widest">Voir tous</Text>
                    <ArrowRight size={10} color="#C26D5C" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                >
                  {artists.map((artist, idx) => {
                    const shapeStyle = SHAPES[idx % SHAPES.length];
                    const displayName = artist.artistName || `${artist.firstName} ${artist.lastName}`;
                    return (
                      <TouchableOpacity
                        key={artist.id || idx}
                        onPress={() => artist.slug && router.push(`/artist/${artist.slug}`)}
                        className="mr-6 items-center w-28 active:opacity-90"
                      >
                        <View 
                          style={shapeStyle} 
                          className="w-20 h-24 overflow-hidden bg-foreground/5 border border-black/10 shadow-sm"
                        >
                          <Image
                            source={artist.profilePictureUrl ? { uri: artist.profilePictureUrl } : require('../../assets/images/placeholder.png')}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                        <Text 
                          className="font-serif text-xs text-foreground text-center font-bold mt-3 w-full"
                          numberOfLines={1}
                        >
                          {displayName}
                        </Text>
                        <Text 
                          className="font-sans text-[8px] text-muted text-center uppercase tracking-widest mt-0.5 w-full"
                          numberOfLines={1}
                        >
                          {artist.location || 'Contemporain'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* "Nouvelles Acquisitions" list */}
            {artworks.length > 0 ? (
              <View className="px-4 pb-12">
                <View className="flex-row items-center justify-between mb-6 px-2">
                  <Text className="font-serif text-xl font-bold text-foreground">
                    {hasActiveFilters ? 'Résultats de recherche' : 'Nouvelles Acquisitions'}
                  </Text>
                  <Text className="font-sans text-[9px] font-bold text-muted uppercase">
                    {hasActiveFilters ? artworks.length : acquisitions.length} Item{artworks.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View className="gap-8">
                  {(hasActiveFilters ? artworks : acquisitions).map((artwork, index) => {
                    const numberStr = String(index + 1).padStart(2, '0');
                    return (
                      <View key={artwork.id || index} className="relative">
                        {/* Catalogue number overlay */}
                        {!hasActiveFilters && (
                          <View className="absolute top-10 left-[-8px] z-50">
                            <Text 
                              style={{ fontFamily: 'PlayfairDisplay_600SemiBold' }} 
                              className="text-[44px] text-accent opacity-30 select-none pointer-events-none"
                            >
                              {numberStr}
                            </Text>
                          </View>
                        )}
                        <View className={hasActiveFilters ? '' : 'pl-6'}>
                          <ArtworkCard artwork={artwork} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="py-20 items-center justify-center border border-dashed border-black/10 rounded-[40px] mx-6 mb-12">
                <Text className="text-4xl mb-4">🔍</Text>
                <Text className="font-serif text-lg text-foreground mb-2">Aucun résultat</Text>
                <Text className="font-sans text-xs text-muted text-center px-10">
                  Aucune œuvre ne correspond à votre recherche. Essayez d'autres critères.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
