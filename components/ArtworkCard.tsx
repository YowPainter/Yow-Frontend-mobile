import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ArtworkResponse } from '../lib/models/ArtworkResponse';
import { Heart, MessageSquare, Share2 } from 'lucide-react-native';
import { router } from 'expo-router';
import ArtworkSocial from './ArtworkSocial';

interface ArtworkCardProps {
  artwork: ArtworkResponse;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const images = artwork.imageUrls || [];
  const mainImage = images[0];

  const handlePress = () => {
    router.push(`/gallery/${artwork.id}`);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={handlePress}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5"
    >
      {/* Header — tap to go to artist profile */}
      <TouchableOpacity 
        className="px-4 py-3 flex-row items-center gap-3"
        onPress={() => artwork.artistId && router.push(`/artist/${artwork.artistName?.toLowerCase().replace(/\s+/g, '-') || artwork.artistId}` as any)}
      >
        <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center border border-accent/20">
          <Text className="text-accent font-serif font-bold">{artwork.artistName?.charAt(0) || 'A'}</Text>
        </View>
        <View>
          <Text className="font-serif text-sm font-semibold text-foreground">{artwork.artistName || 'Artiste inconnu'}</Text>
          <Text className="font-sans text-[10px] text-muted uppercase tracking-widest">
            {artwork.publishedAt ? new Date(artwork.publishedAt).toLocaleDateString() : 'Récemment'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Image Container */}
      <View className="aspect-[4/3] bg-[#FDFCFB] overflow-hidden">
        {images.length === 1 ? (
          <Image source={{ uri: mainImage }} className="w-full h-full" resizeMode="cover" />
        ) : images.length === 2 ? (
          <View className="flex-row h-full gap-[2px]">
            <Image source={{ uri: images[0] }} className="flex-1 h-full" resizeMode="cover" />
            <Image source={{ uri: images[1] }} className="flex-1 h-full" resizeMode="cover" />
          </View>
        ) : images.length >= 3 ? (
          <View className="flex-row h-full gap-[2px]">
            <Image source={{ uri: images[0] }} className="flex-1 h-full" resizeMode="cover" />
            <View className="flex-1 gap-[2px]">
              <Image source={{ uri: images[1] }} className="flex-1" resizeMode="cover" />
              <View className="flex-1">
                <Image source={{ uri: images[2] }} className="w-full h-full" resizeMode="cover" />
                {images.length > 3 && (
                  <View className="absolute inset-0 bg-black/40 items-center justify-center">
                    <Text className="text-white font-bold text-lg">+{images.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <Image source={require('../assets/images/placeholder.png')} className="w-full h-full" resizeMode="cover" />
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="font-serif text-lg font-semibold text-foreground mb-1">{artwork.title}</Text>
        {artwork.description && (
          <Text className="font-sans text-xs text-foreground/60 leading-relaxed" numberOfLines={2}>
            {artwork.description}
          </Text>
        )}
        
        {/* Tags */}
        {artwork.tags && artwork.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {artwork.tags.map(tag => (
              <View key={tag} className="px-2 py-0.5 bg-accent/5 border border-accent/10 rounded-full">
                <Text className="text-[10px] font-bold text-accent uppercase tracking-widest">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="px-4 py-3 border-t border-black/5 flex-row items-center justify-between">
        <ArtworkSocial 
          artworkId={artwork.id!} 
          artistId={artwork.artistId} 
          initialLikes={artwork.likeCount} 
        />
        <TouchableOpacity>
          <Share2 size={18} color="#9A8880" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
