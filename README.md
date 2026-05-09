# YowPainter Mobile 🎨

YowPainter est une plateforme mobile élégante et moderne dédiée à la promotion de l'art africain. Elle permet aux artistes de présenter leurs œuvres, de gérer leurs expositions et de vendre leurs créations directement à une communauté de collectionneurs passionnés.

## ✨ Fonctionnalités

- **Galerie Interactive** : Explorez une vaste collection d'œuvres d'art avec des détails riches et des visuels haute définition.
- **Espace Artiste (Dashboard)** : Un tableau de bord complet pour les artistes permettant de :
  - Publier de nouvelles œuvres avec plusieurs images.
  - Gérer le statut des œuvres (En vente, Archive, Publié).
  - Créer et gérer des événements (Expositions, Ateliers).
  - Suivre les statistiques (Vues, Likes, Revenus).
- **Profils d'Artistes** : Découvrez l'histoire et la biographie des créateurs.
- **Boutique Intégrée** : Achetez des œuvres d'art en toute sécurité.
- **Gestion des Événements** : Restez informé des dernières expositions et rencontres artistiques.
- **Interface Premium** : Design soigné avec des animations fluides, des arrière-plans ambiants et une typographie raffinée (Playfair Display & Inter).

## 🚀 Technologies Utilisées

- **Framework** : [Expo](https://expo.dev/) (React Native)
- **Navigation** : [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Styling** : [NativeWind](https://www.nativewind.dev/) (Tailwind CSS pour React Native)
- **State Management** : [Zustand](https://github.com/pmndrs/zustand)
- **Icônes** : [Lucide React Native](https://lucide.dev/)
- **Upload d'images** : [Cloudinary](https://cloudinary.com/)
- **Polices** : Google Fonts (Playfair Display, Inter)

## 🛠️ Installation et Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/client) sur votre appareil mobile ou un émulateur.

### Étapes

1. **Cloner le projet** :
   ```bash
   git clone <url-du-repo>
   cd mobile
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement** :
   Créez un fichier `.env` à la racine et ajoutez vos clés :
   ```env
   EXPO_PUBLIC_API_URL=https://votre-api-yowpainter.com
   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
   EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=votre_preset
   ```

4. **Lancer l'application** :
   ```bash
   npx expo start
   ```

5. **Scanner le QR Code** avec l'application Expo Go (Android) ou l'appareil photo (iOS).

## 📸 Captures d'écran

*(Ajoutez ici vos captures d'écran une fois l'application déployée)*

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---
Développé avec passion pour l'art africain. 🌍✨
