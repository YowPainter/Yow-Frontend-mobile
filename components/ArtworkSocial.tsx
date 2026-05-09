import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Heart, MessageSquare } from 'lucide-react-native';
import { ArtworksService } from '../lib/services/ArtworksService';
import { ArtistsService } from '../lib/services/ArtistsService';
import { useAuthStore } from '../store/authStore';
import { toast } from '../lib/toast';

interface ArtworkSocialProps {
  artworkId: string;
  artistId?: string;
  initialLikes?: number;
}

export default function ArtworkSocial({ artworkId, artistId, initialLikes = 0 }: ArtworkSocialProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [artistSlug, setArtistSlug] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const getArtistInfo = async () => {
      if (!artistId) return;
      try {
        const artist = await ArtistsService.getArtistById(artistId);
        setArtistSlug(artist.slug || null);
      } catch (error) {
        console.error('Error fetching artist slug:', error);
      }
    };
    getArtistInfo();
  }, [artistId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour liker');
      return;
    }
    if (!artistSlug) {
      toast.error('Impossible de liker cette œuvre');
      return;
    }

    setLoading(true);
    try {
      await ArtworksService.toggleLike(artistSlug, artworkId);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error('Erreur lors du like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-row items-center gap-6">
      <TouchableOpacity 
        onPress={handleLike}
        disabled={loading}
        className="flex-row items-center gap-1.5"
      >
        <Heart 
          size={18} 
          color={isLiked ? '#C26D5C' : '#9A8880'} 
          fill={isLiked ? '#C26D5C' : 'transparent'} 
        />
        <Text className={`text-xs font-bold ${isLiked ? 'text-accent' : 'text-muted'}`}>
          {likes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5">
        <MessageSquare size={18} color="#9A8880" />
        <Text className="text-xs font-bold text-muted">0</Text>
      </TouchableOpacity>
    </View>
  );
}
