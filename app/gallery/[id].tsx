import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import { ArtistResponse } from '../../lib/models/ArtistResponse';
import { CommentResponse } from '../../lib/models/CommentResponse';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Send } from 'lucide-react-native';
import ArtworkSocial from '../../components/ArtworkSocial';
import { toast } from '../../lib/toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ArtworkDetail() {
  const { id } = useLocalSearchParams();
  const [artwork, setArtwork] = useState<ArtworkResponse | null>(null);
  const [artist, setArtist] = useState<ArtistResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [artistSlug, setArtistSlug] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        const latest = await ArtworksService.getLatestArtworks();
        const found = latest.find(a => a.id === id);
        
        if (found) {
          setArtwork(found);
          if (found.artistId) {
            const artistData = await ArtistsService.getArtistById(found.artistId);
            setArtist(artistData);
            
            const computedSlug = artistData.slug || artistData.artistName?.toLowerCase().replace(/\s+/g, '-') || found.artistName?.toLowerCase().replace(/\s+/g, '-') || found.artistId;
            setArtistSlug(computedSlug as string);
            
            const comms = await ArtworksService.getComments(computedSlug as string, id as string);
            setComments(comms);
          }
        }
      } catch (err) {
        console.error('Error fetching artwork details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !artistSlug) return;
    setSubmitting(true);
    try {
      const added = await ArtworksService.addComment(artistSlug, id as string, { content: newComment });
      setComments([added, ...comments]);
      setNewComment('');
      toast.success('Commentaire ajouté');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !artwork) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C26D5C" size="large" />
      </View>
    );
  }

  const images = artwork.imageUrls || [];
  const currentImage = images[currentIdx];

  const goNext = () => {
    if (currentIdx < images.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-1 bg-black">
        
        {/* Dynamic Blurred Background */}
        <View style={StyleSheet.absoluteFill} className="opacity-60">
          <Image 
            key={`blur-${currentIdx}`}
            source={{ uri: currentImage }} 
            style={StyleSheet.absoluteFill}
            blurRadius={80}
            resizeMode="cover"
          />
          <View style={StyleSheet.absoluteFill} className="bg-black/20" />
        </View>

        {/* Header Controls */}
        <SafeAreaView className="z-50 flex-row justify-between px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md items-center justify-center border border-white/20"
          >
            <X color="white" size={20} />
          </TouchableOpacity>
          <View className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Text className="text-white font-serif text-sm" numberOfLines={1}>{artwork.title}</Text>
          </View>
          <View className="w-10" />
        </SafeAreaView>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Main Image Carousel Area */}
          <View style={{ height: SCREEN_WIDTH * 1.2 }} className="items-center justify-center">
            <View 
              key={currentIdx}
              className="w-full h-full p-6 items-center justify-center"
            >
              <Image 
                source={{ uri: currentImage }} 
                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                resizeMode="contain"
                className="shadow-2xl"
              />
            </View>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <View className="absolute inset-x-4 flex-row justify-between items-center z-50">
                <TouchableOpacity 
                  onPress={goPrev}
                  disabled={currentIdx === 0}
                  className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md items-center justify-center border border-white/20 ${currentIdx === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={goNext}
                  disabled={currentIdx === images.length - 1}
                  className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md items-center justify-center border border-white/20 ${currentIdx === images.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronRight color="white" size={24} />
                </TouchableOpacity>
              </View>
            )}

            {/* Dot Indicators */}
            {images.length > 1 && (
              <View className="absolute bottom-6 flex-row gap-2">
                {images.map((_, i) => (
                  <View 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
                  />
                ))}
              </View>
            )}
          </View>

          {/* Bottom Info & Comments Sheet */}
          <View className="bg-white rounded-t-[40px] px-8 pt-8 pb-10 min-h-[500px]">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <Text className="font-serif text-3xl font-bold text-foreground mb-2">{artwork.title}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    const target = artist?.slug || artwork?.artistId;
                    if (target) router.push(`/artist/${target}` as any);
                  }}
                  className="flex-row items-center gap-2"
                >
                  <View className="w-8 h-8 rounded-full bg-foreground/5 overflow-hidden border border-black/5">
                    <Image 
                      source={artist?.profilePictureUrl ? { uri: artist.profilePictureUrl } : require('../../assets/images/placeholder.png')}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <Text className="font-sans text-xs text-accent uppercase tracking-[0.2em] font-bold">
                    {artwork.artistName || 'Artiste'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ArtworkSocial 
                artworkId={artwork.id!} 
                artistId={artwork.artistId} 
                initialLikes={artwork.likeCount} 
              />
            </View>
            
            <Text className="font-sans text-sm text-foreground/70 leading-relaxed mb-8">
              {artwork.description || 'Aucune description disponible.'}
            </Text>

            <TouchableOpacity 
              className="w-full bg-ink py-4 rounded-2xl items-center shadow-xl flex-row justify-center gap-3 mb-10"
            >
              <ShoppingCart color="white" size={20} />
              <Text className="text-white font-sans font-bold uppercase tracking-widest text-xs">Acquérir cette œuvre</Text>
            </TouchableOpacity>

            {/* Comments Section */}
            <View>
              <Text className="font-serif text-xl mb-6">Commentaires ({comments.length})</Text>
              
              {/* Add Comment Input */}
              <View className="flex-row items-center gap-3 mb-8 bg-foreground/5 p-2 rounded-2xl">
                <TextInput 
                  className="flex-1 font-sans text-sm px-4"
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity 
                  onPress={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  className={`w-10 h-10 rounded-xl items-center justify-center ${newComment.trim() ? 'bg-accent' : 'bg-muted/20'}`}
                >
                  {submitting ? <ActivityIndicator size="small" color="white" /> : <Send size={18} color="white" />}
                </TouchableOpacity>
              </View>

              <View className="gap-6">
                {comments.length > 0 ? comments.map((comment) => (
                  <View key={comment.id} className="flex-row gap-4">
                    <View className="w-10 h-10 rounded-full bg-foreground/5 items-center justify-center border border-black/5">
                      <Text className="text-[10px] font-bold text-muted uppercase">{comment.userName?.charAt(0) || 'U'}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-sans text-[11px] font-bold text-foreground">{comment.userName || 'Utilisateur'}</Text>
                        <Text className="font-sans text-[9px] text-muted">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                        </Text>
                      </View>
                      <Text className="font-sans text-xs text-foreground/80 leading-relaxed">{comment.content}</Text>
                    </View>
                  </View>
                )) : (
                  <Text className="font-sans text-xs text-muted italic text-center py-4">Soyez le premier à commenter cette œuvre.</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

      </View>
    </View>
  );
}

function SafeAreaView({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={`pt-12 ${className}`}>{children}</View>;
}
