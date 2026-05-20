import { View, Text, ScrollView, RefreshControl, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ShopOrdersService } from '../../lib/services/ShopOrdersService';
import { ProductResponse } from '../../lib/models/ProductResponse';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

export default function ShopTab() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await ShopOrdersService.getGlobalProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C26D5C" />
        }
      >
        <View className="py-8">
          <View className="flex-row justify-between items-end mb-10">
            <View>
              <Text className="font-serif text-4xl text-foreground mb-1">
                Boutique<Text className="text-accent">.</Text>
              </Text>
              <Text className="font-sans text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Fine Art Store</Text>
            </View>
            <TouchableOpacity className="bg-accent/10 px-4 py-2 rounded-full border border-accent/20 flex-row items-center gap-2">
              <ShoppingBag size={14} color="#C26D5C" />
              <Text className="text-[10px] font-bold text-accent uppercase tracking-widest">Panier (0)</Text>
            </TouchableOpacity>
          </View>
          
          {loading && !refreshing ? (
            <View className="py-20 items-center">
              <Text className="font-sans text-muted italic">Chargement des articles...</Text>
            </View>
          ) : products.length > 0 ? (
            <View className="flex-row flex-wrap justify-between gap-y-8">
              {products.map((product, index) => (
                <TouchableOpacity 
                  key={product.id || index} 
                  className="w-[47%] bg-white rounded-[28px] p-2 border border-black/5 shadow-sm"
                >
                  <View className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-foreground/5">
                    <Image 
                      source={require('../../assets/images/placeholder.png')} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 bg-white/90 backdrop-blur-md w-7 h-7 rounded-full items-center justify-center shadow-sm">
                      <Star size={10} color="#C26D5C" fill="#C26D5C" />
                    </View>
                  </View>
                  
                  <View className="mt-3 px-1 pb-1">
                    <Text className="font-serif text-lg text-foreground leading-tight mb-1" numberOfLines={1}>{product.name}</Text>
                    <Text className="font-sans text-[10px] text-muted mb-2 uppercase tracking-widest">Fine Art Print</Text>
                    <Text className="font-sans text-sm font-bold text-accent">{product.price} FCFA</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-24 items-center justify-center border border-dashed border-black/10 rounded-[40px] px-10 text-center">
              <ShoppingBag size={40} color="#9A8880" opacity={0.2} />
              <Text className="font-serif text-xl text-muted opacity-50 mt-4 italic">Bientôt disponible</Text>
              <Text className="font-sans text-xs text-muted/60 mt-2">Nous préparons une sélection d'exception pour vous.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
