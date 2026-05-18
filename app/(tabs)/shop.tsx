import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { ShopOrdersService } from '../../lib/services/ShopOrdersService';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { ProductResponse } from '../../lib/models/ProductResponse';
import { ArtistResponse } from '../../lib/models/ArtistResponse';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import { ShoppingBag, Star } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';
import CanvasGrain from '../../components/CanvasGrain';
import AbstractShapes from '../../components/AbstractShapes';
import { toast } from '../../lib/toast';

export default function ShopTab() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [artists, setArtists] = useState<Record<string, ArtistResponse>>({});
  const [artworks, setArtworks] = useState<Record<string, ArtworkResponse>>({});
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShopData = async () => {
    try {
      const productsData = await ShopOrdersService.getGlobalProducts();
      setProducts(productsData);

      // Fetch corresponding artists and artworks
      const artistIds = Array.from(new Set(productsData.map(p => p.artistId).filter(Boolean))) as string[];
      const artworkIds = Array.from(new Set(productsData.map(p => p.artworkId).filter(Boolean))) as string[];

      const [artistsData, latestArtworks] = await Promise.all([
        Promise.all(artistIds.map(id => ArtistsService.getArtistById(id).catch(() => null))),
        ArtworksService.getLatestArtworks().catch(() => [])
      ]);

      const artistsMap: Record<string, ArtistResponse> = {};
      artistsData.forEach(artist => {
        if (artist && artist.id) artistsMap[artist.id] = artist;
      });
      setArtists(artistsMap);

      const artworksMap: Record<string, ArtworkResponse> = {};
      latestArtworks.forEach(art => {
        if (art.id && artworkIds.includes(art.id)) artworksMap[art.id] = art;
      });
      setArtworks(artworksMap);

    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShopData();
  };

  const handleAddToCart = (product: ProductResponse) => {
    setCartCount(prev => prev + 1);
    toast.success(`"${product.name}" ajouté au panier !`);
  };

  const handleCheckout = () => {
    if (cartCount === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    toast.success('Commande initiée ! Finalisation sur la passerelle sécurisée...');
  };

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <CanvasGrain />
      <AbstractShapes />

      {/* Decorative Lettrine background S */}
      <View className="absolute top-[80px] left-[-20px] z-[-1] pointer-events-none opacity-[0.02]">
        <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 240 }} className="text-accent">
          S
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C26D5C" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="py-8">
          {/* Header Row with Cart Button */}
          <View className="pt-16 pb-6 flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-[1px] bg-accent" />
                <Text className="font-sans text-[10px] text-accent font-bold uppercase tracking-[0.3em]">
                  Fine Art Store
                </Text>
              </View>
              <Text className="font-serif text-5xl leading-[1.1] text-foreground tracking-tight">
                Le goût de
              </Text>
              <Text className="font-serif text-5xl leading-[1.1] text-accent italic font-normal tracking-tight mt-1">
                l'exceptionnel.
              </Text>
            </View>

            {/* Premium Interactive Cart Trigger */}
            <TouchableOpacity 
              onPress={handleCheckout}
              activeOpacity={0.8}
              className="bg-ink px-4 py-3 rounded-2xl flex-row items-center gap-2 shadow-lg"
            >
              <ShoppingBag size={14} color="#E8B4A8" />
              <Text className="text-[9px] font-bold text-white uppercase tracking-widest">
                Panier ({cartCount})
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text className="font-sans text-xs text-muted leading-relaxed max-w-xs mb-10">
            Commandez des tirages Fine Art de très haute qualité signés par nos artistes certifiés.
          </Text>

          {loading && !refreshing ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator color="#C26D5C" size="large" />
            </View>
          ) : products.length > 0 ? (
            <View className="flex-row flex-wrap justify-between gap-y-8 pb-16">
              {products.map((product, index) => {
                const artist = product.artistId ? artists[product.artistId] : null;
                const artwork = product.artworkId ? artworks[product.artworkId] : null;
                const artworkImage = artwork?.imageUrls?.[0];
                const artistName = artist?.artistName || `${artist?.firstName || ''} ${artist?.lastName || ''}`.trim() || 'Artiste Certifié';

                return (
                  <TouchableOpacity 
                    key={product.id || index} 
                    activeOpacity={0.95}
                    onPress={() => handleAddToCart(product)}
                    className="w-[47%] bg-[#FCFAF7] rounded-[32px] p-2.5 border border-black/5 shadow-sm active:shadow-md"
                  >
                    {/* Art Print Passe-Partout Mockup */}
                    <View className="w-full aspect-[4/5] rounded-[22px] overflow-hidden bg-white border border-black/5 p-2 shadow-inner relative justify-center items-center">
                      <View className="w-full h-full border border-black/5 bg-[#FAF8F5] overflow-hidden shadow-inner">
                        <Image 
                          source={artworkImage ? { uri: artworkImage } : require('../../assets/images/placeholder.png')} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      
                      {/* Premium Review Badge */}
                      <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md w-7 h-7 rounded-full items-center justify-center shadow-sm">
                        <Star size={10} color="#C26D5C" fill="#C26D5C" />
                      </View>
                    </View>
                    
                    {/* Product Metadata */}
                    <View className="mt-3 px-1 pb-1">
                      <Text className="font-serif text-base text-foreground font-bold leading-tight" numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text className="font-sans text-[8px] text-muted uppercase tracking-widest mt-0.5" numberOfLines={1}>
                        Tirage par {artistName}
                      </Text>
                      <Text className="font-serif text-sm font-bold text-accent mt-2">
                        {product.price ? `${product.price.toLocaleString('fr-FR')} FCFA` : 'Prix sur demande'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="py-24 items-center justify-center border border-dashed border-black/10 rounded-[40px] px-10 text-center mb-12">
              <ShoppingBag size={40} color="#9A8880" opacity={0.2} />
              <Text className="font-serif text-xl text-muted opacity-50 mt-4 italic">Bientôt disponible</Text>
              <Text className="font-sans text-xs text-muted/60 mt-2">
                Nos conservateurs préparent une collection d'impressions d'art d'exception.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
