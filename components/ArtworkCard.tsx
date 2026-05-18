import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ArtworkResponse } from '../lib/models/ArtworkResponse';
import { Share2 } from 'lucide-react-native';
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
      activeOpacity={0.95}
      onPress={handlePress}
      className="bg-[#FCFAF7] rounded-[36px] overflow-hidden shadow-md border border-black/5 mb-4"
    >
      {/* Header — tap to go to artist profile */}
      <TouchableOpacity 
        className="px-6 py-4 flex-row items-center gap-3"
        onPress={() => artwork.artistId && router.push(`/artist/${artwork.artistName?.toLowerCase().replace(/\s+/g, '-') || artwork.artistId}` as any)}
      >
        <View className="w-9 h-9 rounded-full bg-accent/10 items-center justify-center border border-accent/20">
          <Text className="text-accent font-serif font-bold text-sm">
            {artwork.artistName?.charAt(0) || 'A'}
          </Text>
        </View>
        <View>
          <Text className="font-serif text-sm font-semibold text-foreground">{artwork.artistName || 'Artiste inconnu'}</Text>
          <Text className="font-sans text-[9px] text-muted uppercase tracking-[0.2em]">
            {artwork.publishedAt ? new Date(artwork.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Récemment'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Museum Frame & Image Container */}
      <View className="px-6 pb-2">
        <View className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-xl border-4 border-[#C49050] p-4 relative">
          {/* passe-partout texture overlay */}
          <View className="w-full h-full border border-[#4A2810] rounded-lg overflow-hidden bg-[#FAF8F5] relative shadow-inner">
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
                      <View className="absolute inset-0 bg-black/50 items-center justify-center">
                        <Text className="text-white font-sans font-bold text-lg">+{images.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <Image source={require('../assets/images/placeholder.png')} className="w-full h-full" resizeMode="cover" />
            )}
          </View>
          {/* Signature Label inside the frame */}
          <Text className="absolute bottom-6 right-8 font-serif italic text-foreground/15 text-[10px] pointer-events-none">
            {artwork.artistName}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="px-6 pt-3 pb-5">
        <View className="flex-row justify-between items-start gap-4 mb-2">
          <Text className="font-serif text-lg font-bold text-foreground flex-1 leading-snug">{artwork.title}</Text>
          <View className="bg-accent/15 px-3 py-1 rounded-full border border-accent/20">
            <Text className="text-[8px] font-bold text-accent uppercase tracking-widest">{artwork.style || 'ABSTRACT'}</Text>
          </View>
        </View>

        {artwork.description && (
          <Text className="font-sans text-xs text-foreground/60 leading-relaxed mb-3" numberOfLines={2}>
            {artwork.description}
          </Text>
        )}
        
        {/* Style & Technique Badge Row */}
        <View className="flex-row flex-wrap gap-1.5 items-center">
          <View className="px-2 py-0.5 bg-ink/5 rounded-md border border-ink/5">
            <Text className="text-[8px] font-sans text-muted font-bold uppercase tracking-widest">{artwork.technique || 'OIL'}</Text>
          </View>
          {artwork.dimensions && (
            <View className="px-2 py-0.5 bg-ink/5 rounded-md border border-ink/5">
              <Text className="text-[8px] font-sans text-muted font-bold uppercase tracking-widest">{artwork.dimensions}</Text>
            </View>
          )}
          {artwork.tags && artwork.tags.slice(0, 2).map(tag => (
            <View key={tag} className="px-2 py-0.5 bg-accent/5 rounded-md">
              <Text className="text-[8px] font-bold text-accent uppercase tracking-widest">#{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 py-4 border-t border-black/5 bg-[#FCFAF7] flex-row items-center justify-between">
        <ArtworkSocial 
          artworkId={artwork.id!} 
          artistId={artwork.artistId} 
          initialLikes={artwork.likeCount} 
        />
        <TouchableOpacity className="p-1 active:opacity-60">
          <Share2 size={16} color="#9A8880" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
