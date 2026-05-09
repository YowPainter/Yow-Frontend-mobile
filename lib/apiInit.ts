import { OpenAPI } from './core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';

/** Simple JWT decoder to check expiration */
function isTokenExpired(token: string): boolean {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return true;

        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        const exp = payload.exp;

        if (!exp) return false; 

        const currentTime = Math.floor(Date.now() / 1000);
        return (currentTime + 30) >= exp;
    } catch (e) {
        console.error('Error decoding token:', e);
        return true; 
    }
}

export function initializeApi() {
    // URL du backend depuis les variables d'environnement
    OpenAPI.BASE = process.env.EXPO_PUBLIC_API_URL || 'https://yowpainter-backend.onrender.com';

    // Injection dynamique du token depuis AsyncStorage
    OpenAPI.TOKEN = async () => {
        try {
            const storage = await AsyncStorage.getItem('yowpainter-auth');
            if (storage) {
                const parsed = JSON.parse(storage);
                let token = parsed.state?.token || '';

                if (token && isTokenExpired(token)) {
                    // Pour l'instant on retourne le token, le refresh sera géré par le store
                    // TODO: implémenter le refresh automatique si nécessaire
                }
                
                return token;
            }
        } catch (e) {
            console.warn('Failed to parse auth storage', e);
        }
        return '';
    };

    // Injection dynamique du header Tenant
    OpenAPI.HEADERS = async (): Promise<Record<string, string>> => {
        try {
            const tenantSlug = await AsyncStorage.getItem('currentTenantSlug');
            if (tenantSlug) {
                return { 'X-Tenant-ID': tenantSlug };
            }
        } catch (e) {
            console.warn('Failed to get tenant slug', e);
        }
        return {};
    };
}
