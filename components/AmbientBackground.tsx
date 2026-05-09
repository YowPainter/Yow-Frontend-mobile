import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BlurredBlob = ({ color, size, top, left, right, bottom }: any) => {
  return (
    <View style={[styles.blobContainer, { top, left, right, bottom, width: size, height: size }]}>
      <View style={[styles.circle, { width: size, height: size, backgroundColor: color, opacity: 0.04 }]} />
      <View style={[styles.circle, { width: size * 0.8, height: size * 0.8, backgroundColor: color, opacity: 0.06 }]} />
      <View style={[styles.circle, { width: size * 0.6, height: size * 0.6, backgroundColor: color, opacity: 0.08 }]} />
      <View style={[styles.circle, { width: size * 0.4, height: size * 0.4, backgroundColor: color, opacity: 0.12 }]} />
    </View>
  );
};

export default function AmbientBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none" className="z-[-1] overflow-hidden">
      {/* Tache chaude en haut à droite */}
      <BlurredBlob color="#C26D5C" size={width * 1.5} top={-width * 0.5} right={-width * 0.5} />
      {/* Tache neutre en bas à gauche */}
      <BlurredBlob color="#9A8880" size={width * 1.8} bottom={-width * 0.6} left={-width * 0.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  blobContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
  }
});
