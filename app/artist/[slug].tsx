import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { ShopOrdersService } from '../../lib/services/ShopOrdersService';
import { EventsService } from '../../lib/services/EventsService';
import { ArtistResponse } from '../../lib/models/ArtistResponse';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import { ProductResponse } from '../../lib/models/ProductResponse';
import { EventResponse } from '../../lib/models/EventResponse';
import { ChevronLeft, ImageIcon, ShoppingBag, Calendar, MapPin, Star } from 'lucide-react-native';
import ArtworkCard from '../../components';

type TabType = 'gallery' | 'shop' | 'events';

export default function ArtistProfile() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [artist, setArtist] = useState<ArtistResponse | null>(null);
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        let artistData: ArtistResponse | null = null;
        
        // 1. Try by slug
        try {
          artistData = await ArtistsService.getArtistBySlug(slug);
        } catch (e) {
          // 2. Try by ID
          try {
            artistData = await ArtistsService.getArtistById(slug);
          } catch (e2) {
            // 3. Try search as a last resort (might be a name-based slug)
            const searchResults = await ArtistsService.searchArtists(slug.replace(/-/g, ' '));
            if (searchResults && searchResults.length > 0) {
              artistData = searchResults[0];
            } else {
              throw e2;
            }
          }
        }

        if (!artistData) throw new Error('Artist not found');

        setArtist(artistData);
        // Use the actual slug from the fetched data for the rest of the queries
        const activeSlug = artistData.slug || artistData.id || slug;

        const [artworksData, productsData, eventsData] = await Promise.allSettled([
          ArtworksService.getAllPublicArtworks(activeSlug),
          ShopOrdersService.getProductsByArtist(activeSlug),
          EventsService.getEventsByArtistSlug(activeSlug),
        ]);

        if (artworksData.status === 'fulfilled') setArtworks(artworksData.value);
        if (productsData.status === 'fulfilled') setProducts(productsData.value);
        if (eventsData.status === 'fulfilled') setEvents(eventsData.value);
      } catch (err) {
        console.error('Error fetching artist profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C26D5C" size="large" />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-10">
        <Text className="font-serif text-2xl text-foreground text-center mb-3">Profil Introuvable</Text>
        <Text className="font-sans text-sm text-muted text-center mb-8">L'artiste "{slug}" est introuvable.</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-ink px-8 py-4 rounded-full">
          <Text className="text-white font-sans font-bold uppercase tracking-widest text-xs">Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayName = artist.artistName || `${artist.firstName ?? ''} ${artist.lastName ?? ''}`.trim();

  const tabs = [
    { id: 'gallery' as TabType, label: 'Galerie', icon: ImageIcon, count: artworks.length },
    { id: 'shop' as TabType, label: 'Boutique', icon: ShoppingBag, count: products.length },
    { id: 'events' as TabType, label: 'Expositions', icon: Calendar, count: events.length },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Hero Header */}
        <View className="relative">
          {/* Cover background */}
          <View className="w-full h-72 bg-foreground/5 overflow-hidden">
            {artist.profilePictureUrl && (
              <Image source={{ uri: artist.profilePictureUrl }} className="w-full h-full" resizeMode="cover" blurRadius={20} />
            )}
            <View className="absolute inset-0 bg-ink/40" />
          </View>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-16 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center z-50"
          >
            <ChevronLeft color="white" size={20} />
          </TouchableOpacity>

          {/* Profile picture */}
          <View className="absolute bottom-0 left-6 transform translate-y-1/2 pt-10">
            <View className="w-32 h-32 rounded-[40px] overflow-hidden bg-cream border-4 border-background shadow-xl">
              <Image
                source={artist.profilePictureUrl ? { uri: artist.profilePictureUrl } : require('../../assets/images/placeholder.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Artist Info */}
        <View className="pt-16 px-6 pb-6">
          <Text className="font-serif text-3xl text-foreground">{displayName}</Text>
          <Text className="font-sans text-[10px] text-accent uppercase tracking-[0.3em] font-bold mt-1">Artiste Certifié • YowPainter</Text>

          {artist.bio ? (
            <Text className="font-sans text-sm text-muted mt-4 leading-relaxed">{artist.bio}</Text>
          ) : null}

          {/* Stats Row */}
          <View className="flex-row gap-8 mt-6 py-5 border-y border-black/5">
            <View className="items-center">
              <Text className="font-serif text-2xl font-bold text-foreground">{artworks.length}</Text>
              <Text className="font-sans text-[9px] text-muted uppercase tracking-widest">Œuvres</Text>
            </View>
            <View className="items-center">
              <Text className="font-serif text-2xl font-bold text-foreground">{products.length}</Text>
              <Text className="font-sans text-[9px] text-muted uppercase tracking-widest">Articles</Text>
            </View>
            <View className="items-center">
              <Text className="font-serif text-2xl font-bold text-foreground">{events.length}</Text>
              <Text className="font-sans text-[9px] text-muted uppercase tracking-widest">Expos</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-b border-black/5 px-6">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 items-center py-4"
            >
              <Text className={`font-sans text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'text-accent' : 'text-muted'}`}>
                {tab.label}
              </Text>
              {activeTab === tab.id && (
                <View className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-4 py-6">

          {/* GALERIE */}
          {activeTab === 'gallery' && (
            <View>
              <View className="flex-row justify-between items-center mb-6 px-2">
                <Text className="font-serif text-xl text-foreground">Œuvres de l'artiste</Text>
                <Text className="font-sans text-[10px] font-bold text-muted uppercase">{artworks.length} items</Text>
              </View>
              {artworks.length > 0 ? (
                <View className="gap-6">
                  {artworks.map((artwork, index) => (
                    <ArtworkCard key={artwork.id || index} artwork={artwork} />
                  ))}
                </View>
              ) : (
                <EmptyState message="L'artiste n'a pas encore publié d'œuvres." icon="🎨" />
              )}
            </View>
          )}

          {/* BOUTIQUE */}
          {activeTab === 'shop' && (
            <View>
              <View className="flex-row justify-between items-center mb-6 px-2">
                <Text className="font-serif text-xl text-foreground">La Boutique</Text>
                <Text className="font-sans text-[10px] font-bold text-muted uppercase">{products.length} articles</Text>
              </View>
              {products.length > 0 ? (
                <View className="flex-row flex-wrap justify-between gap-y-8">
                  {products.map((product, index) => (
                    <TouchableOpacity key={product.id || index} className="w-[47%]">
                      <View className="w-full aspect-[3/4] rounded-3xl overflow-hidden bg-foreground/5 border border-black/5">
                        <Image source={require('../../assets/images/placeholder.png')} className="w-full h-full" resizeMode="cover" />
                        <View className="absolute top-3 right-3 bg-white/80 w-8 h-8 rounded-full items-center justify-center shadow-sm">
                          <Star size={12} color="#C26D5C" fill="#C26D5C" />
                        </View>
                      </View>
                      <View className="mt-3 px-1">
                        <Text className="font-serif text-base text-foreground" numberOfLines={1}>{product.name}</Text>
                        <Text className="font-sans text-xs text-muted">Fine Art Print</Text>
                        <Text className="font-serif text-sm font-bold text-accent mt-1">{product.price} FCFA</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <EmptyState message="Aucun article en vente pour le moment." icon="🛍️" />
              )}
            </View>
          )}

          {/* ÉVÉNEMENTS */}
          {activeTab === 'events' && (
            <View>
              <View className="flex-row justify-between items-center mb-6 px-2">
                <Text className="font-serif text-xl text-foreground">Expositions</Text>
                <Text className="font-sans text-[10px] font-bold text-muted uppercase">{events.length} événements</Text>
              </View>
              {events.length > 0 ? (
                <View className="gap-6">
                  {events.map((event, index) => (
                    <View key={event.id || index} className="flex-row bg-white p-4 rounded-3xl border border-black/5 shadow-sm gap-4">
                      <View className="w-14 items-center justify-center bg-accent/5 rounded-2xl p-2">
                        <Text className="font-serif text-xl font-bold text-accent">
                          {event.startDateTime ? new Date(event.startDateTime).getDate() : '?'}
                        </Text>
                        <Text className="font-sans text-[8px] font-bold text-muted uppercase">
                          {event.startDateTime ? new Date(event.startDateTime).toLocaleString('fr', { month: 'short' }) : ''}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-serif text-base text-foreground mb-1">{event.name}</Text>
                        {event.location && (
                          <View className="flex-row items-center gap-1">
                            <MapPin size={11} color="#9A8880" />
                            <Text className="font-sans text-xs text-muted" numberOfLines={1}>{event.location}</Text>
                          </View>
                        )}
                        <View className="mt-2 self-start bg-accent/10 px-3 py-1 rounded-full">
                          <Text className="font-sans text-[9px] font-bold text-accent uppercase tracking-widest">
                            {event.ticketPrice && event.ticketPrice > 0 ? `${event.ticketPrice} FCFA` : 'Gratuit'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState message="Aucune exposition prévue pour cet artiste." icon="🖼️" />
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ message, icon }: { message: string; icon: string }) {
  return (
    <View className="py-20 items-center justify-center border border-dashed border-black/10 rounded-[40px]">
      <Text className="text-4xl mb-4">{icon}</Text>
      <Text className="font-sans text-sm text-muted italic text-center px-10">{message}</Text>
    </View>
  );
}
