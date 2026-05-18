import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { EventsService } from '../../lib/services/EventsService';
import { EventResponse } from '../../lib/models/EventResponse';
import { Calendar, MapPin, Ticket } from 'lucide-react-native';
import AmbientBackground from '../../components/AmbientBackground';
import CanvasGrain from '../../components/CanvasGrain';
import AbstractShapes from '../../components/AbstractShapes';

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
      <CanvasGrain />
      <AbstractShapes />

      {/* Decorative Lettrine background É */}
      <View className="absolute top-[80px] right-[-10px] z-[-1] pointer-events-none opacity-[0.02]">
        <Text style={{ fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 240 }} className="text-accent">
          É
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C26D5C" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="py-8">
          {/* Header Hero Section */}
          <View className="pt-16 pb-10">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-[1px] bg-accent" />
              <Text className="font-sans text-[10px] text-accent font-bold uppercase tracking-[0.3em]">
                Agenda Culturel
              </Text>
            </View>
            <Text className="font-serif text-5xl leading-[1.1] text-foreground tracking-tight">
              Expositions &
            </Text>
            <Text className="font-serif text-5xl leading-[1.1] text-accent italic font-normal tracking-tight mt-1">
              Vernissages
            </Text>
            <Text className="font-sans text-xs text-muted leading-relaxed max-w-xs mt-3">
              Rencontrez les artistes, découvrez leurs nouvelles créations et vivez l'art en direct.
            </Text>
          </View>
          
          {loading && !refreshing ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator color="#C26D5C" size="large" />
            </View>
          ) : events.length > 0 ? (
            <View className="gap-8 pb-16">
              {events.map((event, index) => {
                const eventDate = event.startDateTime ? new Date(event.startDateTime) : null;
                const formattedTime = eventDate ? eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '18:00';
                
                return (
                  <TouchableOpacity 
                    key={event.id || index} 
                    activeOpacity={0.95}
                    className="bg-[#FCFAF7] rounded-[36px] p-3 border border-black/5 shadow-sm active:shadow-md"
                  >
                    {/* Invitation Card Image Cover */}
                    <View className="relative w-full h-56 rounded-[28px] overflow-hidden bg-foreground/5 shadow-inner">
                      <Image 
                        source={event.posterUrl ? { uri: event.posterUrl } : require('../../assets/images/placeholder.png')} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-black/15" />
                      
                      {/* Ticket Badge */}
                      <View className="absolute bottom-4 left-4 bg-ink/75 backdrop-blur-md px-4 py-2 rounded-2xl flex-row items-center gap-1.5 shadow-sm">
                        <Ticket size={11} color="#E8B4A8" />
                        <Text className="font-sans text-[8px] font-bold text-white uppercase tracking-widest">
                          {event.ticketPrice && event.ticketPrice > 0 ? `${event.ticketPrice} FCFA` : 'Entrée Libre'}
                        </Text>
                      </View>

                      {/* Date Badge */}
                      <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl items-center shadow-sm">
                        <Text className="font-serif text-xl font-black text-accent leading-none">
                          {eventDate ? eventDate.getDate() : '??'}
                        </Text>
                        <Text className="font-sans text-[8px] font-bold text-muted uppercase mt-0.5 tracking-wider">
                          {eventDate ? eventDate.toLocaleString('fr-FR', { month: 'short' }) : 'MAI'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Event Description and Details */}
                    <View className="mt-4 px-3 pb-3">
                      <Text className="font-serif text-2xl text-foreground font-bold leading-tight mb-3" numberOfLines={1}>
                        {event.name}
                      </Text>
                      
                      {event.description && (
                        <Text className="font-sans text-xs text-muted leading-relaxed mb-4" numberOfLines={2}>
                          {event.description}
                        </Text>
                      )}

                      <View className="flex-row flex-wrap items-center gap-y-3 justify-between border-t border-black/5 pt-4">
                        <View className="flex-row items-center gap-1.5 flex-1 mr-4">
                          <MapPin size={12} color="#C26D5C" />
                          <Text className="font-sans text-[11px] text-muted font-bold" numberOfLines={1}>
                            {event.location || 'Galerie d\'Art, Dakar'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Calendar size={12} color="#C26D5C" />
                          <Text className="font-sans text-[11px] text-muted font-bold">
                            {formattedTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="py-20 items-center justify-center border border-dashed border-black/10 rounded-[40px] mb-12">
              <Text className="text-4xl mb-4">📅</Text>
              <Text className="font-serif text-lg text-foreground mb-1">Aucun événement prévu</Text>
              <Text className="font-sans text-xs text-muted text-center px-10">
                La scène culturelle prend une pause. Revenez bientôt pour les prochains vernissages !
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
