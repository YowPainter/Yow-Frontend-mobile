import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { ChatApiService, ChatMessageDto } from '../../lib/services/ChatApiService';
import { chatService, ChatMessage } from '../../lib/services/ChatService';
import { Send, User, ChevronLeft } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

export default function ChatRoom() {
  const { id, name, profilePictureUrl, role } = useLocalSearchParams<{
    id: string;
    name: string;
    profilePictureUrl?: string;
    role?: string;
  }>();

  const { user } = useAuthStore();
  const navigation = useNavigation();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Configure custom header options
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ paddingRight: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
        >
          <ChevronLeft color="#141210" size={24} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
            {profilePictureUrl ? (
              <Image source={{ uri: profilePictureUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <User size={16} color="#9A8880" />
            )}
          </View>
          <View>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#141210' }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 8, color: '#9A8880', textTransform: 'uppercase', letterSpacing: 1 }}>
              {role === 'ROLE_ARTIST' ? 'Artiste' : 'Collectionneur'}
            </Text>
          </View>
        </View>
      ),
    });
  }, [navigation, name, profilePictureUrl, role]);

  // Load chat history & initialize socket connection
  useEffect(() => {
    const currentUserId = user?.id;
    if (!currentUserId || !id) return;

    const loadHistory = async () => {
      try {
        const history = await ChatApiService.getMessages(currentUserId, id);
        // Sort history by date descending for the inverted list
        const sorted = (history || []).sort((a, b) => {
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        });
        setMessages(sorted);
        
        // Mark as read
        await ChatApiService.markAsRead(currentUserId, id);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadHistory();

    // Connect to WebSocket channel
    chatService.connect(
      (newMessage) => {
        // Callback on new message received
        if (newMessage.senderId === id || newMessage.recipientId === id) {
          setMessages((prev) => [newMessage, ...prev]);
          
          // If we received a message from the contact we are chatting with, mark it as read immediately
          if (newMessage.senderId === id) {
            ChatApiService.markAsRead(currentUserId, id).catch((e) => {
              console.warn('Failed to mark incoming message as read:', e);
            });
          }
        }
      },
      () => {
        setIsConnected(true);
      }
    );

    return () => {
      chatService.disconnect();
    };
  }, [user?.id, id]);

  const handleSend = () => {
    if (!messageText.trim() || !id) return;

    const sentMessage = chatService.sendMessage(id, messageText.trim());
    if (sentMessage) {
      setMessages((prev) => [sentMessage, ...prev]);
      setMessageText('');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="flex-1 bg-background relative overflow-hidden"
    >
      <AmbientBackground />
      
      {/* Messages List */}
      {isHistoryLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C26D5C" size="large" />
        </View>
      ) : (
        <FlatList
          inverted
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id;
            return (
              <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View className={`max-w-[75%] px-5 py-3.5 rounded-[24px] ${
                  isMe 
                    ? 'bg-accent rounded-br-[4px] shadow-sm shadow-accent/10' 
                    : 'bg-white border border-black/5 rounded-bl-[4px] shadow-sm'
                }`}>
                  <Text className={`font-sans text-sm leading-relaxed ${isMe ? 'text-white font-medium' : 'text-foreground'}`}>
                    {item.content}
                  </Text>
                  <Text className={`font-sans text-[8px] mt-1.5 self-end ${isMe ? 'text-white/60' : 'text-muted'}`}>
                    {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input footer */}
      <SafeAreaView className="bg-white/80 border-t border-black/5 px-6 py-4 flex-row items-center gap-3">
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Votre message..."
          placeholderTextColor="#9A8880"
          className="flex-1 bg-foreground/[0.03] border border-black/10 rounded-full px-5 py-3.5 font-sans text-sm text-foreground"
          multiline
        />
        <TouchableOpacity 
          onPress={handleSend}
          disabled={!messageText.trim()}
          className="w-12 h-12 rounded-full bg-accent items-center justify-center shadow-md active:opacity-90 disabled:opacity-40"
        >
          <Send color="white" size={16} className="ml-0.5" />
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
