import { View, Text, ScrollView, RefreshControl, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { EventsService } from '../../lib/services/EventsService';
import { EventResponse } from '../../lib/models/EventResponse';
import { Calendar, MapPin, ChevronRight } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';

export default function EventsTab() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await EventsService.getUpcomingEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
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
          <Text className="font-serif text-4xl text-foreground mb-1">
            Événements<Text className="text-accent">.</Text>
          </Text>
          <Text className="font-sans text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-10">Agenda Culturel</Text>
          
          {loading && !refreshing ? (
            <View className="py-20 items-center">
              <Text className="font-sans text-muted italic">Chargement de l'agenda...</Text>
            </View>
          ) : events.length > 0 ? (
            <View className="gap-8">
              {events.map((event, index) => (
                <TouchableOpacity 
                  key={event.id || index} 
                  className="bg-white rounded-[36px] p-3 border border-black/5 shadow-sm"
                >
                  <View className="relative w-full h-48 rounded-[28px] overflow-hidden bg-foreground/5">
                    <Image 
                      source={event.posterUrl ? { uri: event.posterUrl } : require('../../assets/images/placeholder.png')} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/20" />
                    <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl items-center shadow-sm">
                      <Text className="font-serif text-lg font-bold text-accent">
                        {event.startDateTime ? new Date(event.startDateTime).getDate() : '??'}
                      </Text>
                      <Text className="font-sans text-[8px] font-bold text-muted uppercase">
                        {event.startDateTime ? new Date(event.startDateTime).toLocaleString('default', { month: 'short' }) : 'MAY'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="mt-4 px-3 pb-2">
                    <Text className="font-serif text-2xl text-foreground mb-3">{event.name}</Text>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1.5">
                        <MapPin size={12} color="#C26D5C" />
                        <Text className="font-sans text-xs text-muted" numberOfLines={1}>{event.location || 'Dakar, Sénégal'}</Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Calendar size={12} color="#C26D5C" />
                        <Text className="font-sans text-xs text-muted">
                          {event.startDateTime ? new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:00'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-20 items-center border border-dashed border-black/10 rounded-[40px]">
              <Text className="font-serif text-xl text-muted opacity-50">Aucun événement prévu</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
