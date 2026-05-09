import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse } from '../lib/models/AuthResponse';
import { AuthenticationService } from '../lib/services/AuthenticationService';
import { ArtistsService } from '../lib/services/ArtistsService';
import { BuyerProfileService } from '../lib/services/BuyerProfileService';
import { LoginRequest } from '../lib/models/LoginRequest';
import { RegisterRequest } from '../lib/models/RegisterRequest';

export interface ExtendedAuthResponse extends AuthResponse {
    id?: string;
    slug?: string;
    bio?: string;
    profilePictureUrl?: string;
}

interface AuthState {
    user: ExtendedAuthResponse | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    refreshAccessToken: () => Promise<string | null>;
    refreshProfile: () => Promise<void>;
    setUser: (user: ExtendedAuthResponse) => void;
    logout: () => void;
}

let refreshPromise: Promise<string | null> | null = null;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            login: async (credentials) => {
                const response = await AuthenticationService.login(credentials);
                set({
                    user: response,
                    token: response.accessToken || null,
                    refreshToken: response.refreshToken || null,
                    isAuthenticated: !!response.accessToken,
                });
                
                if (response.accessToken) {
                    const extendedResponse = response as any;
                    if (response.role === 'ROLE_ARTIST' && extendedResponse.slug) {
                        await AsyncStorage.setItem('currentTenantSlug', extendedResponse.slug);
                    }
                    try {
                        await get().refreshProfile();
                    } catch (e) {
                        console.warn('Could not refresh profile after login:', e);
                    }
                }
                return get().user as AuthResponse;
            },

            register: async (data) => {
                const response = await AuthenticationService.register(data);
                set({
                    user: response,
                    token: response.accessToken || null,
                    refreshToken: response.refreshToken || null,
                    isAuthenticated: !!response.accessToken,
                });
                if (response.accessToken) {
                    try {
                        await get().refreshProfile();
                    } catch (e) {
                        console.warn('Could not refresh profile after registration:', e);
                    }
                }
                return response;
            },

            refreshAccessToken: async () => {
                if (refreshPromise) return refreshPromise;

                refreshPromise = (async () => {
                    const { refreshToken } = get();
                    if (!refreshToken) {
                        get().logout();
                        return null;
                    }

                    try {
                        const response = await AuthenticationService.refresh(refreshToken);
                        const newToken = response.accessToken || null;
                        const newRefreshToken = response.refreshToken || null;

                        set({
                            token: newToken,
                            refreshToken: newRefreshToken,
                            isAuthenticated: !!newToken,
                            user: {
                                ...get().user,
                                ...response,
                            }
                        });

                        return newToken;
                    } catch (error) {
                        console.error('Failed to refresh token:', error);
                        get().logout();
                        return null;
                    } finally {
                        refreshPromise = null;
                    }
                })();

                return refreshPromise;
            },

            refreshProfile: async () => {
                const { user } = get();
                if (!user) return;

                try {
                    if (user.role === 'ROLE_ARTIST') {
                        const profile = await ArtistsService.getMyProfile();
                        set((state) => ({
                            user: {
                                ...state.user,
                                id: profile.id ?? state.user?.id,
                                firstName: profile.firstName ?? state.user?.firstName,
                                lastName: profile.lastName ?? state.user?.lastName,
                                profilePictureUrl: profile.profilePictureUrl ?? state.user?.profilePictureUrl,
                                artistName: profile.artistName ?? state.user?.artistName,
                                bio: profile.bio ?? state.user?.bio,
                                slug: profile.slug ?? (state.user as any)?.slug,
                            },
                        }));
                        
                        if (profile.slug) {
                            await AsyncStorage.setItem('currentTenantSlug', profile.slug);
                        }
                    } else {
                        const profile = await BuyerProfileService.getMe();
                        set((state) => ({
                            user: {
                                ...state.user,
                                id: profile.id ?? state.user?.id,
                                firstName: profile.firstName ?? state.user?.firstName,
                                lastName: profile.lastName ?? state.user?.lastName,
                                profilePictureUrl: profile.profilePictureUrl ?? state.user?.profilePictureUrl,
                                bio: profile.bio ?? state.user?.bio,
                            },
                        }));
                    }
                } catch (e) {
                    console.warn('refreshProfile failed:', e);
                }
            },

            logout: () => {
                AsyncStorage.removeItem('currentTenantSlug');
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            setUser: (user: ExtendedAuthResponse) => {
                set({ user });
            },
        }),
        {
            name: 'yowpainter-auth',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
