import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  Image, Alert, ActivityIndicator, TextInput, Modal
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  Plus, BarChart2, Image as ImageIcon, LogOut, Eye, Heart,
  ShoppingBag, Calendar, Trash2, Edit3, X, MapPin, Clock, DollarSign, ChevronLeft
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { ArtistsService } from '../../lib/services/ArtistsService';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { EventsService } from '../../lib/services/EventsService';
import { ShopOrdersService } from '../../lib/services/ShopOrdersService';
import { ArtworkResponse } from '../../lib/models/ArtworkResponse';
import { ArtistAnalyticsResponse } from '../../lib/models/ArtistAnalyticsResponse';
import { EventResponse } from '../../lib/models/EventResponse';
import { EventCreateRequest } from '../../lib/models/EventCreateRequest';
import { toast } from '../../lib/toast';
import { uploadToCloudinary } from '../../lib/cloudinary';
import * as ImagePicker from 'expo-image-picker';
import AmbientBackground from '../../components/AmbientBackground';
import { WalletTab } from '../../components';

type DashTab = 'oeuvres' | 'evenements' | 'boutique' | 'portefeuille';

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    PUBLISHED: { bg: '#DCFCE7', text: '#16A34A', label: 'En ligne' },
    ON_SALE: { bg: '#FEF9C3', text: '#CA8A04', label: 'En vente' },
    DRAFT: { bg: '#F3F4F6', text: '#6B7280', label: 'Brouillon' },
    ARCHIVED: { bg: '#FEE2E2', text: '#DC2626', label: 'Archivé' },
    SOLD: { bg: '#EDE9FE', text: '#7C3AED', label: 'Vendu' },
  };
  const s = styles[status || 'DRAFT'];
  return (
    <View style={{ backgroundColor: s.bg }} className="px-3 py-1 rounded-full">
      <Text style={{ color: s.text }} className="text-[9px] font-bold uppercase tracking-widest">{s.label}</Text>
    </View>
  );
}

/* ─── Create Event Modal ─── */
function CreateEventModal({ visible, onClose, onCreated }: {
  visible: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: '', description: '', location: '', startDateTime: '', ticketPrice: '' });
  const [loading, setLoading] = useState(false);
  const [posterUri, setPosterUri] = useState<string | null>(null);

  const pickPoster = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setPosterUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.startDateTime.trim()) {
      toast.error('Nom et date sont obligatoires');
      return;
    }
    setLoading(true);
    try {
      let posterUrl: string | undefined;
      if (posterUri) posterUrl = await uploadToCloudinary(posterUri);
      const payload: EventCreateRequest = {
        name: form.name,
        description: form.description,
        location: form.location,
        startDateTime: form.startDateTime,
        ticketPrice: form.ticketPrice ? parseFloat(form.ticketPrice) : 0,
        posterUrl,
        type: EventCreateRequest.type.EXHIBITION,
        endDateTime: form.startDateTime, // For simplicity, set same as start for now
      };
      await EventsService.createEvent(payload);
      toast.success('Événement créé !');
      onCreated();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-black/5">
          <Text className="font-serif text-xl text-foreground">Nouvel Événement</Text>
          <TouchableOpacity onPress={onClose}><X size={24} color="#9A8880" /></TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={pickPoster} className="w-full h-40 bg-foreground/5 rounded-3xl items-center justify-center border-2 border-dashed border-black/10 mb-6 overflow-hidden">
            {posterUri ? (
              <Image source={{ uri: posterUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center gap-2">
                <Calendar size={28} color="#9A8880" />
                <Text className="font-sans text-xs text-muted">Ajouter une affiche</Text>
              </View>
            )}
          </TouchableOpacity>

          {[
            { key: 'name', label: 'Nom de l\'événement *', placeholder: 'Ex: Exposition Automne 2025' },
            { key: 'location', label: 'Lieu', placeholder: 'Ex: Galerie Akwa, Douala' },
            { key: 'startDateTime', label: 'Date (format: 2025-12-01T18:00:00) *', placeholder: '2025-12-01T18:00:00' },
            { key: 'ticketPrice', label: 'Prix du billet (FCFA, 0 = gratuit)', placeholder: '2500' },
          ].map(field => (
            <View key={field.key} className="mb-5">
              <Text className="font-sans text-xs font-bold text-muted uppercase tracking-widest mb-2">{field.label}</Text>
              <TextInput
                className="bg-white border border-black/10 rounded-2xl px-4 py-4 font-sans text-sm text-foreground"
                placeholder={field.placeholder}
                value={(form as any)[field.key]}
                onChangeText={v => setForm(prev => ({ ...prev, [field.key]: v }))}
                keyboardType={field.key === 'ticketPrice' ? 'decimal-pad' : 'default'}
              />
            </View>
          ))}

          <View className="mb-8">
            <Text className="font-sans text-xs font-bold text-muted uppercase tracking-widest mb-2">Description</Text>
            <TextInput
              className="bg-white border border-black/10 rounded-2xl px-4 py-4 font-sans text-sm text-foreground"
              placeholder="Décrivez votre événement..."
              value={form.description}
              onChangeText={v => setForm(prev => ({ ...prev, description: v }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            className="w-full bg-accent py-5 rounded-3xl items-center shadow-xl mb-10"
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <Text className="text-white font-sans font-bold uppercase tracking-widest text-xs">Créer l'Événement</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ─── Edit Profile Modal ─── */
function EditProfileModal({ visible, onClose, currentBio, currentName, onSaved }: {
  visible: boolean; onClose: () => void; currentBio?: string; currentName?: string; onSaved: (data: any) => void;
}) {
  const [artistName, setArtistName] = useState(currentName || '');
  const [bio, setBio] = useState(currentBio || '');
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let profilePictureUrl: string | undefined;
      if (avatarUri) profilePictureUrl = await uploadToCloudinary(avatarUri);
      const updated = await ArtistsService.updateMyProfile({ artistName, bio, ...(profilePictureUrl ? { profilePictureUrl } : {}) });
      onSaved(updated);
      toast.success('Profil mis à jour !');
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-black/5">
          <Text className="font-serif text-xl text-foreground">Modifier le profil</Text>
          <TouchableOpacity onPress={onClose}><X size={24} color="#9A8880" /></TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 py-8" keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={pickAvatar} className="w-24 h-24 rounded-[28px] bg-foreground/10 self-center items-center justify-center mb-8 overflow-hidden border-4 border-white shadow-lg">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-2xl">📸</Text>
            )}
          </TouchableOpacity>

          <View className="mb-5">
            <Text className="font-sans text-xs font-bold text-muted uppercase tracking-widest mb-2">Nom d'artiste</Text>
            <TextInput
              className="bg-white border border-black/10 rounded-2xl px-4 py-4 font-sans text-sm text-foreground"
              value={artistName}
              onChangeText={setArtistName}
              placeholder="Votre nom d'artiste"
            />
          </View>

          <View className="mb-8">
            <Text className="font-sans text-xs font-bold text-muted uppercase tracking-widest mb-2">Biographie</Text>
            <TextInput
              className="bg-white border border-black/10 rounded-2xl px-4 py-4 font-sans text-sm text-foreground"
              value={bio}
              onChangeText={setBio}
              placeholder="Parlez de vous et de votre art..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity onPress={handleSave} disabled={loading} className="w-full bg-ink py-5 rounded-3xl items-center mb-10">
            {loading ? <ActivityIndicator color="white" /> : (
              <Text className="text-white font-sans font-bold uppercase tracking-widest text-xs">Enregistrer</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ─── Main Dashboard ─── */
export default function ArtistDashboard() {
  const [tab, setTab] = useState<DashTab>('oeuvres');
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [analytics, setAnalytics] = useState<ArtistAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user, logout, setUser } = useAuthStore();

  const displayName = user?.artistName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Artiste';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artworksData, analyticsData, eventsData] = await Promise.allSettled([
        ArtworksService.getMyArtworks(),
        ArtistsService.getMyAnalytics(),
        EventsService.getMyEvents(),
      ]);
      if (artworksData.status === 'fulfilled') setArtworks(artworksData.value);
      if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
      if (eventsData.status === 'fulfilled') setEvents(eventsData.value);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteArtwork = (artwork: ArtworkResponse) => {
    Alert.alert(
      'Supprimer l\'œuvre',
      `Êtes-vous sûr de vouloir supprimer "${artwork.title}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            try {
              await ArtworksService.bulkDelete([artwork.id!]);
              setArtworks(prev => prev.filter(a => a.id !== artwork.id));
              toast.success('Œuvre supprimée');
            } catch {
              toast.error('Erreur lors de la suppression');
            }
          }
        }
      ]
    );
  };

  const handleStatusChange = async (artwork: ArtworkResponse, newStatus: 'PUBLISHED' | 'ARCHIVED' | 'ON_SALE') => {
    try {
      await ArtworksService.updateStatus(artwork.id!, newStatus);
      setArtworks(prev => prev.map(a => a.id === artwork.id ? { ...a, status: newStatus as any } : a));
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteEvent = (event: EventResponse) => {
    Alert.alert('Annuler l\'événement', `Annuler "${event.name}" ?`, [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Confirmer', style: 'destructive',
        onPress: async () => {
          try {
            await EventsService.cancelEvent(event.id!);
            setEvents(prev => prev.filter(e => e.id !== event.id));
            toast.success('Événement annulé');
          } catch {
            toast.error('Erreur');
          }
        }
      }
    ]);
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const tabs = [
    { id: 'oeuvres' as DashTab, label: 'Œuvres', icon: ImageIcon },
    { id: 'evenements' as DashTab, label: 'Événements', icon: Calendar },
    { id: 'boutique' as DashTab, label: 'Boutique', icon: ShoppingBag },
    { id: 'portefeuille' as DashTab, label: 'Wallet', icon: DollarSign },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-16 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center z-50 border border-black/5"
        >
          <ChevronLeft color="#141210" size={24} />
        </TouchableOpacity>

        {/* Header */}
        <View className="px-6 pt-36 pb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="font-serif text-3xl text-foreground">Bonjour,</Text>
              <Text className="font-serif text-3xl text-accent">{displayName}</Text>
              <Text className="font-sans text-[10px] text-muted uppercase tracking-widest mt-1">Espace Artiste</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowEditProfile(true)}
              className="w-24 h-24 rounded-[32px] overflow-hidden bg-foreground/5 border border-black/5 shadow-md"
            >
              <Image
                source={user?.profilePictureUrl ? { uri: user.profilePictureUrl } : require('../../assets/images/placeholder.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          <View className="mb-6">
            <Text className="font-sans text-sm text-muted leading-relaxed" numberOfLines={3}>
              {user?.bio || "Aucune biographie renseignée. Ajoutez-en une pour vous présenter aux collectionneurs."}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowEditProfile(true)}
              className="mt-3 flex-row items-center gap-2 bg-ink/5 self-start px-4 py-2 rounded-xl border border-black/5"
            >
              <Edit3 size={12} color="#141210" />
              <Text className="font-sans text-[10px] font-bold text-foreground uppercase tracking-widest">Modifier le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Cards */}
        <View className="px-6 mb-6">
          {loading ? (
            <View className="h-24 bg-foreground/5 rounded-3xl items-center justify-center">
              <ActivityIndicator color="#C26D5C" />
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {[
                { icon: ImageIcon, value: analytics?.totalArtworks ?? artworks.length, label: 'Œuvres' },
                { icon: Eye, value: analytics?.publishedArtworks ?? 0, label: 'Publiées' },
                { icon: Heart, value: analytics?.totalLikes ?? 0, label: 'Likes' },
                { icon: DollarSign, value: analytics?.totalRevenue ?? 0, label: 'Revenus (FCFA)' },
              ].map((stat, i) => (
                <View key={i} className="flex-1 min-w-[44%] bg-white p-4 rounded-3xl border border-black/5 shadow-sm">
                  <stat.icon size={16} color="#C26D5C" />
                  <Text className="font-serif text-2xl font-bold text-foreground mt-2">{stat.value}</Text>
                  <Text className="font-sans text-[9px] text-muted uppercase tracking-widest">{stat.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push('/(dashboard)/publish' as any)}
            className="flex-1 bg-accent py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg"
          >
            <Plus color="white" size={18} />
            <Text className="text-white font-sans font-bold uppercase tracking-widest text-[10px]">Nouvelle Œuvre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCreateEvent(true)}
            className="flex-1 bg-ink py-4 rounded-2xl items-center flex-row justify-center gap-2"
          >
            <Calendar color="white" size={18} />
            <Text className="text-white font-sans font-bold uppercase tracking-widest text-[10px]">Événement</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-b border-black/5 px-6 mb-6">
          {tabs.map(t => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              className="flex-1 items-center py-4"
            >
              <Text className={`font-sans text-[10px] font-bold uppercase tracking-widest ${tab === t.id ? 'text-accent' : 'text-muted'}`}>
                {t.label}
              </Text>
              {tab === t.id && <View className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent rounded-full" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-6 pb-10">

          {/* ── Œuvres ── */}
          {tab === 'oeuvres' && (
            <View className="gap-4">
              {loading ? (
                <ActivityIndicator color="#C26D5C" className="py-10" />
              ) : artworks.length > 0 ? artworks.map(artwork => (
                <View key={artwork.id} className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                  <View className="flex-row items-center p-4 gap-4">
                    <View className="w-16 h-16 rounded-2xl bg-foreground/5 overflow-hidden">
                      <Image
                        source={artwork.imageUrls?.[0] ? { uri: artwork.imageUrls[0] } : require('../../assets/images/placeholder.png')}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-base text-foreground" numberOfLines={1}>{artwork.title}</Text>
                      <Text className="font-sans text-[10px] text-muted mt-0.5">
                        {artwork.publishedAt ? new Date(artwork.publishedAt).toLocaleDateString('fr-FR') : 'Non publié'}
                      </Text>
                    </View>
                    <StatusBadge status={artwork.status} />
                  </View>
                  {/* Actions */}
                  <View className="flex-row border-t border-black/5">
                    <TouchableOpacity
                      onPress={() => handleStatusChange(artwork, artwork.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED')}
                      className="flex-1 py-3 items-center flex-row justify-center gap-1.5"
                    >
                      <Edit3 size={14} color="#9A8880" />
                      <Text className="font-sans text-[10px] font-bold text-muted uppercase">
                        {artwork.status === 'PUBLISHED' ? 'Archiver' : 'Publier'}
                      </Text>
                    </TouchableOpacity>
                    <View className="w-px bg-black/5" />
                    <TouchableOpacity
                      onPress={() => handleStatusChange(artwork, 'ON_SALE')}
                      className="flex-1 py-3 items-center flex-row justify-center gap-1.5"
                    >
                      <ShoppingBag size={14} color="#C26D5C" />
                      <Text className="font-sans text-[10px] font-bold text-accent uppercase">Mettre en vente</Text>
                    </TouchableOpacity>
                    <View className="w-px bg-black/5" />
                    <TouchableOpacity
                      onPress={() => handleDeleteArtwork(artwork)}
                      className="flex-1 py-3 items-center flex-row justify-center gap-1.5"
                    >
                      <Trash2 size={14} color="#EF4444" />
                      <Text className="font-sans text-[10px] font-bold text-red-500 uppercase">Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : (
                <View className="py-20 items-center border border-dashed border-black/10 rounded-[40px]">
                  <Text className="text-4xl mb-4">🎨</Text>
                  <Text className="font-sans text-sm text-muted italic text-center">Vous n'avez pas encore publié d'œuvres.</Text>
                  <TouchableOpacity onPress={() => router.push('/(dashboard)/publish' as any)} className="mt-6 bg-accent px-8 py-3 rounded-full">
                    <Text className="text-white font-sans font-bold text-xs uppercase tracking-widest">Publier ma première œuvre</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ── Événements ── */}
          {tab === 'evenements' && (
            <View className="gap-4">
              {loading ? (
                <ActivityIndicator color="#C26D5C" className="py-10" />
              ) : events.length > 0 ? events.map(event => (
                <View key={event.id} className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                  <View className="flex-row p-4 gap-4 items-start">
                    <View className="w-12 items-center justify-center bg-accent/10 rounded-2xl py-3">
                      <Text className="font-serif text-lg font-bold text-accent">
                        {event.startDateTime ? new Date(event.startDateTime).getDate() : '?'}
                      </Text>
                      <Text className="font-sans text-[8px] font-bold text-muted uppercase">
                        {event.startDateTime ? new Date(event.startDateTime).toLocaleString('fr', { month: 'short' }) : ''}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-serif text-base text-foreground">{event.name}</Text>
                      {event.location && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <MapPin size={10} color="#9A8880" />
                          <Text className="font-sans text-[10px] text-muted" numberOfLines={1}>{event.location}</Text>
                        </View>
                      )}
                      <Text className="font-sans text-[10px] text-accent font-bold mt-1">
                        {event.ticketPrice && event.ticketPrice > 0 ? `${event.ticketPrice} FCFA` : 'Gratuit'}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row border-t border-black/5">
                    <TouchableOpacity onPress={() => handleDeleteEvent(event)} className="flex-1 py-3 items-center flex-row justify-center gap-1.5">
                      <Trash2 size={14} color="#EF4444" />
                      <Text className="font-sans text-[10px] font-bold text-red-500 uppercase">Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : (
                <View className="py-20 items-center border border-dashed border-black/10 rounded-[40px]">
                  <Text className="text-4xl mb-4">📅</Text>
                  <Text className="font-sans text-sm text-muted italic text-center">Aucun événement créé.</Text>
                  <TouchableOpacity onPress={() => setShowCreateEvent(true)} className="mt-6 bg-ink px-8 py-3 rounded-full">
                    <Text className="text-white font-sans font-bold text-xs uppercase tracking-widest">Créer un événement</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ── Boutique ── */}
          {tab === 'boutique' && (
            <View className="py-20 items-center border border-dashed border-black/10 rounded-[40px]">
              <Text className="text-4xl mb-4">🛍️</Text>
              <Text className="font-serif text-lg text-foreground mb-2">Gérez votre boutique</Text>
              <Text className="font-sans text-sm text-muted italic text-center px-8">
                Mettez vos œuvres "En vente" depuis l'onglet Œuvres pour qu'elles apparaissent ici.
              </Text>
            </View>
          )}

          {/* ── Portefeuille ── */}
          {tab === 'portefeuille' && <WalletTab />}

        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center gap-2 mb-16 mx-6 py-5 bg-red-50 rounded-3xl border border-red-100">
          <LogOut size={16} color="#EF4444" />
          <Text className="font-sans text-red-500 text-xs font-bold uppercase tracking-widest">Déconnexion</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modals */}
      <CreateEventModal
        visible={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        onCreated={fetchData}
      />
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentName={user?.artistName}
        currentBio={user?.bio}
        onSaved={(data) => setUser?.({ ...user!, ...data })}
      />
    </SafeAreaView>
  );
}
