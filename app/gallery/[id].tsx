import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import { ArtistResponse } from '../../lib/models/ArtistResponse';
import { CommentResponse } from '../../lib/models/CommentResponse';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Send, Calendar, Ruler, Palette } from 'lucide-react-native';
import ArtworkSocial from '../../components/ArtworkSocial';
import CanvasGrain from '../../components/CanvasGrain';
import AbstractShapes from '../../components/AbstractShapes';
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

  const handleAcquire = () => {
    toast.success('Demande d\'acquisition enregistrée ! Un conservateur YowPainter va vous contacter.');
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
        
        {/* Dynamic Blurred Background with high immersion */}
        <View style={StyleSheet.absoluteFill} className="opacity-50">
          <Image 
            key={`blur-${currentIdx}`}
            source={{ uri: currentImage }} 
            style={StyleSheet.absoluteFill}
            blurRadius={60}
            resizeMode="cover"
          />
          <View style={StyleSheet.absoluteFill} className="bg-black/45" />
        </View>

        {/* Header Controls */}
        <SafeAreaView className="z-50 flex-row justify-between px-6 py-4 items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md items-center justify-center border border-white/20"
          >
            <X color="white" size={20} />
          </TouchableOpacity>
          <View className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 max-w-[60%]">
            <Text className="text-white font-serif text-sm text-center" numberOfLines={1}>{artwork.title}</Text>
          </View>
          <View className="w-10" />
        </SafeAreaView>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Curated Museum Frame in Carousel Area */}
          <View style={{ height: SCREEN_WIDTH * 1.3 }} className="items-center justify-center px-6">
            <View 
              key={currentIdx}
              className="w-full aspect-[4/5] rounded-[36px] bg-white border-8 border-[#C49050] p-5 shadow-2xl relative"
            >
              <View className="w-full h-full border-2 border-[#4A2810] rounded-xl overflow-hidden bg-[#FAF8F5] relative shadow-inner">
                <Image 
                  source={{ uri: currentImage }} 
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              {/* Subtle signature inside frame */}
              <Text className="absolute bottom-7 right-9 font-serif italic text-foreground/15 text-[11px] pointer-events-none">
                {artwork.artistName}
              </Text>
            </View>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <View className="absolute inset-x-8 flex-row justify-between items-center z-50">
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
                    className={`h-1.5 rounded-full ${i === currentIdx ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
                    />
                ))}
              </View>
            )}
          </View>

          {/* Bottom Info & Comments Sheet */}
          <View className="bg-background rounded-t-[44px] px-8 pt-8 pb-10 min-h-[500px] relative overflow-hidden">
            <CanvasGrain />
            <AbstractShapes />

            <View className="flex-row justify-between items-start mb-6 gap-4">
              <View className="flex-1">
                <Text className="font-serif text-3xl font-bold text-foreground mb-3 leading-tight">{artwork.title}</Text>
                
                {/* Artist avatar redirection trigger */}
                <TouchableOpacity 
                  onPress={() => {
                    const target = artist?.slug || artwork?.artistId;
                    if (target) router.push(`/artist/${target}` as any);
                  }}
                  className="flex-row items-center gap-2.5"
                >
                  <View 
                    style={{ borderTopLeftRadius: 10, borderTopRightRadius: 6, borderBottomLeftRadius: 8, borderBottomRightRadius: 10 }}
                    className="w-8 h-9 overflow-hidden bg-foreground/5 border border-black/5"
                  >
                    <Image 
                      source={artist?.profilePictureUrl ? { uri: artist.profilePictureUrl } : require('../../assets/images/placeholder.png')}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <Text className="font-sans text-[9px] text-accent uppercase tracking-[0.25em] font-bold">
                    Par {artwork.artistName || 'Artiste'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ArtworkSocial 
                artworkId={artwork.id!} 
                artistId={artwork.artistId} 
                initialLikes={artwork.likeCount} 
              />
            </View>
            
            <Text className="font-sans text-xs text-foreground/75 leading-relaxed mb-8 italic">
              "{artwork.description || 'Cette œuvre ne possède pas encore de description.'}"
            </Text>

            {/* Structured Technical Specifications grid */}
            <View className="bg-white/40 border border-black/5 rounded-[28px] p-5 mb-8 flex-row flex-wrap gap-y-4">
              <View className="w-1/2 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-accent/5 items-center justify-center">
                  <Palette size={14} color="#C26D5C" />
                </View>
                <View>
                  <Text className="font-sans text-[8px] text-muted uppercase tracking-widest">Style</Text>
                  <Text className="font-sans text-[11px] font-bold text-foreground mt-0.5">{artwork.style || 'ABSTRACT'}</Text>
                </View>
              </View>

              <View className="w-1/2 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-accent/5 items-center justify-center">
                  <Ruler size={14} color="#C26D5C" />
                </View>
                <View>
                  <Text className="font-sans text-[8px] text-muted uppercase tracking-widest">Dimensions</Text>
                  <Text className="font-sans text-[11px] font-bold text-foreground mt-0.5">{artwork.dimensions || 'N/A'}</Text>
                </View>
              </View>

              <View className="w-1/2 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-accent/5 items-center justify-center">
                  <Palette size={14} color="#C26D5C" />
                </View>
                <View>
                  <Text className="font-sans text-[8px] text-muted uppercase tracking-widest">Technique</Text>
                  <Text className="font-sans text-[11px] font-bold text-foreground mt-0.5">{artwork.technique || 'OIL'}</Text>
                </View>
              </View>

              <View className="w-1/2 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-accent/5 items-center justify-center">
                  <Calendar size={14} color="#C26D5C" />
                </View>
                <View>
                  <Text className="font-sans text-[8px] text-muted uppercase tracking-widest">Date</Text>
                  <Text className="font-sans text-[11px] font-bold text-foreground mt-0.5">
                    {artwork.publishedAt ? new Date(artwork.publishedAt).toLocaleDateString('fr-FR') : 'Récemment'}
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA action trigger button */}
            <TouchableOpacity 
              onPress={handleAcquire}
              activeOpacity={0.95}
              className="w-full bg-accent py-5 rounded-[24px] items-center shadow-lg flex-row justify-center gap-3 mb-10"
            >
              <ShoppingCart color="white" size={18} />
              <Text className="text-white font-sans font-bold uppercase tracking-widest text-[10px]">Acquérir cette œuvre</Text>
            </TouchableOpacity>

            {/* Comments Section */}
            <View className="border-t border-black/5 pt-8">
              <Text className="font-serif text-xl font-bold text-foreground mb-6">Discussion ({comments.length})</Text>
              
              {/* Add Comment Input with premium outline */}
              <View className="flex-row items-center gap-3 mb-8 bg-white/70 border border-black/5 p-2 rounded-2xl shadow-inner">
                <TextInput 
                  className="flex-1 font-sans text-xs px-4 py-2 text-foreground"
                  placeholder="Écrire votre message..."
                  placeholderTextColor="#9A8880"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity 
                  onPress={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  className={`w-10 h-10 rounded-xl items-center justify-center shadow-sm ${newComment.trim() ? 'bg-accent' : 'bg-muted/10'}`}
                >
                  {submitting ? <ActivityIndicator size="small" color="white" /> : <Send size={14} color="white" />}
                </TouchableOpacity>
              </View>

              <View className="gap-6">
                {comments.length > 0 ? comments.map((comment) => (
                  <View key={comment.id} className="flex-row gap-4 bg-white/30 border border-black/5 rounded-[22px] p-4">
                    <View 
                      style={{ borderTopLeftRadius: 10, borderTopRightRadius: 6, borderBottomLeftRadius: 8, borderBottomRightRadius: 10 }}
                      className="w-9 h-10 bg-accent/10 items-center justify-center border border-accent/20"
                    >
                      <Text className="font-serif text-sm font-bold text-accent uppercase">
                        {comment.userName?.charAt(0) || 'U'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-sans text-[10px] font-bold text-foreground">{comment.userName || 'Collectionneur'}</Text>
                        <Text className="font-sans text-[8px] text-muted font-bold">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('fr-FR') : ''}
                        </Text>
                      </View>
                      <Text className="font-sans text-xs text-foreground/80 leading-relaxed">{comment.content}</Text>
                    </View>
                  </View>
                )) : (
                  <Text className="font-sans text-xs text-muted italic text-center py-4">Partagez votre ressenti sur cette création.</Text>
                )}
              </View>
            </View>
          </View>
          <View className="h-10" />
        </ScrollView>

      </View>
    </View>
  );
}

function SafeAreaView({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={`pt-12 ${className}`}>{children}</View>;
}
