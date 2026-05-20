import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { ChatApiService, UserChatDto } from '../../lib/services/ChatApiService';
import { Search, MessageSquare, ArrowRight, User } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

export default function ChatIndex() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<UserChatDto[]>([]);
  const [suggestions, setSuggestions] = useState<UserChatDto[]>([]);
  const [searchResults, setSearchResults] = useState<UserChatDto[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchContacts = async () => {
    if (!user?.id) return;
    try {
      const data = await ChatApiService.getContacts(user.id);
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setIsContactsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!user?.id) return;
    try {
      const data = await ChatApiService.getSuggestions(user.id);
      setSuggestions(data || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  // Refresh data on page focus
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
      fetchSuggestions();
    }, [user?.id])
  );

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const data = await ChatApiService.searchUsers(text);
      // Filter out self
      const filtered = (data || []).filter(u => u.id !== user?.id);
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = (contact: UserChatDto) => {
    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: contact.id, 
        name: contact.name, 
        profilePictureUrl: contact.profilePictureUrl || '',
        role: contact.role
      }
    } as any);
  };

  return (
    <View className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Bar */}
        <View className="relative justify-center mb-6">
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Rechercher un artiste ou collectionneur..."
            placeholderTextColor="#9A8880"
            className="bg-white border border-black/10 rounded-2xl pl-12 pr-4 py-4 font-sans text-sm text-foreground shadow-sm"
          />
          <Search size={16} color="#9A8880" className="absolute left-4" />
        </View>

        {/* Search Results / suggestions & contacts */}
        {searchResults !== null ? (
          <View className="mb-8">
            <Text className="font-serif text-lg text-foreground mb-4">Résultats de recherche</Text>
            {isSearching ? (
              <ActivityIndicator color="#C26D5C" size="small" className="py-4" />
            ) : searchResults.length === 0 ? (
              <View className="py-8 items-center bg-white rounded-3xl border border-black/5 shadow-sm">
                <Text className="font-sans text-xs text-muted italic">Aucun utilisateur trouvé.</Text>
              </View>
            ) : (
              <View className="gap-3">
                {searchResults.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    onPress={() => startChat(contact)}
                    className="bg-white rounded-2xl p-4 flex-row items-center gap-4 border border-black/5 shadow-sm"
                  >
                    <View className="w-10 h-10 rounded-full overflow-hidden bg-foreground/5 items-center justify-center">
                      {contact.profilePictureUrl ? (
                        <Image source={{ uri: contact.profilePictureUrl }} className="w-full h-full" />
                      ) : (
                        <User size={18} color="#9A8880" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-sans text-sm font-bold text-foreground">{contact.name}</Text>
                      <Text className="font-sans text-[9px] text-muted uppercase tracking-widest mt-0.5">
                        {contact.role === 'ROLE_ARTIST' ? 'Artiste' : 'Collectionneur'}
                      </Text>
                    </View>
                    <ArrowRight size={14} color="#C26D5C" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Suggested Artists */}
            {suggestions.length > 0 && (
              <View className="mb-8">
                <Text className="font-serif text-lg text-foreground mb-4">Artistes à découvrir</Text>
                {isSuggestionsLoading ? (
                  <ActivityIndicator color="#C26D5C" size="small" className="self-start py-2" />
                ) : (
                  <FlatList
                    horizontal
                    data={suggestions}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => startChat(item)}
                        className="bg-white rounded-[24px] p-4 items-center justify-center border border-black/5 shadow-sm w-28"
                      >
                        <View className="w-12 h-12 rounded-full overflow-hidden bg-foreground/5 mb-3 border border-black/5 shadow-sm">
                          {item.profilePictureUrl ? (
                            <Image source={{ uri: item.profilePictureUrl }} className="w-full h-full" />
                          ) : (
                            <View className="w-full h-full items-center justify-center">
                              <User size={20} color="#9A8880" />
                            </View>
                          )}
                        </View>
                        <Text className="font-sans text-[11px] font-bold text-foreground text-center" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="font-sans text-[8px] text-accent uppercase tracking-widest mt-1">Artiste</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}

            {/* Recent Conversations */}
            <View className="mb-10">
              <View className="flex-row justify-between items-baseline mb-4">
                <Text className="font-serif text-lg text-foreground">Discussions Récentes</Text>
                <Text className="font-sans text-[9px] uppercase tracking-widest font-black text-muted">{contacts.length} chats</Text>
              </View>

              {isContactsLoading ? (
                <ActivityIndicator color="#C26D5C" size="small" className="py-12" />
              ) : contacts.length === 0 ? (
                <View className="py-20 items-center justify-center bg-white rounded-[32px] border border-dashed border-black/10">
                  <MessageSquare size={32} color="#9A8880" className="opacity-40 mb-3" />
                  <Text className="font-sans text-xs text-muted italic text-center px-10">
                    Vous n'avez pas encore de discussions en cours. Ouvrez le profil d'un artiste pour démarrer une conversation !
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {contacts.map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      onPress={() => startChat(contact)}
                      className="bg-white hover:bg-foreground/[0.01] rounded-[24px] p-4 flex-row items-center gap-4 border border-black/5 shadow-sm"
                    >
                      <View className="w-12 h-12 rounded-full overflow-hidden bg-foreground/5 border border-black/5 shadow-sm justify-center items-center">
                        {contact.profilePictureUrl ? (
                          <Image source={{ uri: contact.profilePictureUrl }} className="w-full h-full" />
                        ) : (
                          <User size={20} color="#9A8880" />
                        )}
                      </View>
                      
                      <View className="flex-1">
                        <View className="flex-row justify-between items-baseline mb-1">
                          <Text className="font-sans text-sm font-bold text-foreground" numberOfLines={1}>{contact.name}</Text>
                          <Text className="font-sans text-[8px] text-muted font-bold uppercase tracking-wider">
                            {contact.role === 'ROLE_ARTIST' ? 'Artiste' : 'Collectionneur'}
                          </Text>
                        </View>
                        <Text className="font-sans text-xs text-muted" numberOfLines={1}>
                          Discuter avec {contact.name}...
                        </Text>
                      </View>

                      {contact.unreadCount && contact.unreadCount > 0 ? (
                        <View className="bg-accent min-w-[20px] h-5 rounded-full items-center justify-center px-1.5 shadow-sm shadow-accent/20">
                          <Text className="text-white font-sans text-[9px] font-black">{contact.unreadCount}</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
