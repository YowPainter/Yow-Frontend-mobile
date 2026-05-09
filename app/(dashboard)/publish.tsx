import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { X, Camera, Plus, Trash2, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { ArtworksService } from '../../lib/services/ArtworksService';
import { toast } from '../../lib/toast';
import AmbientBackground from '../../components/AmbientBackground';

export default function PublishArtwork() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technique, setTechnique] = useState('OIL');
  const [style, setStyle] = useState('ABSTRACT');
  const [dimensions, setDimensions] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    if (images.length >= 5) {
      toast.error('Maximum 5 images autorisées');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...newUris].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title || images.length === 0) {
      toast.error('Le titre et au moins une image sont requis');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload images to Cloudinary
      const imageUrls = await Promise.all(
        images.map(uri => uploadToCloudinary(uri))
      );

      // 2. Create artwork on backend
      await ArtworksService.createArtwork({
        title,
        description: description || undefined,
        technique: technique as any,
        style: style as any,
        dimensions: dimensions || undefined,
        tags,
        imageUrls,
      });

      toast.success('Œuvre publiée avec succès !');
      router.replace('/(dashboard)/artdashboard');
    } catch (error: any) {
      console.error('Error publishing artwork:', error);
      toast.error(error.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background relative overflow-hidden">
      <AmbientBackground />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <View className="px-6 py-4 flex-row items-center border-b border-black/5">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <ChevronLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-serif text-xl font-bold">Publier</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* Image Picker */}
          <View className="mb-8">
            <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Images (Max 5)</Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((uri, index) => (
                <View key={index} className="w-24 h-24 rounded-2xl bg-foreground/5 relative overflow-hidden">
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                  >
                    <X size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity 
                  onPress={pickImages}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-black/10 items-center justify-center bg-black/2"
                >
                  <Plus size={24} color="#9A8880" />
                  <Text className="text-[8px] font-bold text-muted uppercase mt-1">Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            <View>
              <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Titre de l'œuvre</Text>
              <TextInput 
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: L'Âme du Sahel"
                className="bg-white border border-black/5 rounded-2xl px-4 py-4 font-serif text-lg text-foreground shadow-sm"
              />
            </View>

            <View className="mt-4">
              <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Description</Text>
              <TextInput 
                value={description}
                onChangeText={setDescription}
                placeholder="L'histoire derrière cette pièce..."
                multiline
                numberOfLines={4}
                className="bg-white border border-black/5 rounded-2xl px-4 py-4 font-sans text-sm text-foreground shadow-sm min-h-[100px]"
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Technique</Text>
                <View className="bg-white border border-black/5 rounded-2xl px-4 py-4 shadow-sm">
                  <Text className="text-sm">{technique}</Text>
                  {/* Simplified: In a real app, use a picker modal */}
                </View>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Style</Text>
                <View className="bg-white border border-black/5 rounded-2xl px-4 py-4 shadow-sm">
                  <Text className="text-sm">{style}</Text>
                </View>
              </View>
            </View>

            <View className="mt-4">
              <Text className="font-sans text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Tags</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <View key={tag} className="flex-row items-center gap-1 bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    <Text className="text-[10px] font-bold text-accent">#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <X size={10} color="#C26D5C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View className="flex-row gap-2">
                <TextInput 
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Ajouter un tag..."
                  className="flex-1 bg-white border border-black/5 rounded-full px-4 py-3 text-xs shadow-sm"
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity 
                  onPress={handleAddTag}
                  className="w-12 h-12 rounded-full bg-ink items-center justify-center shadow-lg"
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="h-20" />
        </ScrollView>

        {/* Submit Button */}
        <View className="p-6 border-t border-black/5 bg-background">
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            className="w-full bg-accent py-5 rounded-3xl items-center shadow-xl flex-row justify-center gap-3"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Camera color="white" size={20} />
                <Text className="text-white font-sans font-bold uppercase tracking-widest text-xs">Publier l'œuvre</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
