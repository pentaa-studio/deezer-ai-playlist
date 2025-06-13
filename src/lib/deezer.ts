// Deezer API integration
interface WindowWithDZ extends Window {
  DZ?: {
    init: (config: { appId: string; channelUrl: string }) => void;
    login: (callback: (response: { authResponse?: { accessToken: string } }) => void, options: { perms: string }) => void;
    api: (endpoint: string, method?: string, params?: Record<string, unknown>, callback?: (response: unknown) => void) => void;
  };
}

export interface DeezerTrack {
  id: number;
  title: string;
  artist: {
    name: string;
  };
  album: {
    title: string;
  };
  preview: string;
  duration: number;
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
}

export class DeezerService {
  private appId: string;
  private accessToken: string | null = null;
  private isInitialized: boolean = false;

  constructor(appId: string) {
    this.appId = appId;
  }

  // Initialize Deezer SDK
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    if (!this.appId) {
      console.warn('Deezer App ID not provided. Set NEXT_PUBLIC_DEEZER_APP_ID in your .env.local');
      return;
    }

    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined') {
        // Check if DZ is already loaded
        if ((window as WindowWithDZ).DZ) {
          this.initializeDZ();
          resolve();
          return;
        }

        // Load Deezer SDK
        const script = document.createElement('script');
        script.src = 'https://e-cdns-files.dzcdn.net/js/min/dz.js';
        script.onload = () => {
          // Wait a bit for DZ to be available
          setTimeout(() => {
            if ((window as WindowWithDZ).DZ) {
              this.initializeDZ();
              resolve();
            } else {
              reject(new Error('Deezer SDK failed to load'));
            }
          }, 100);
        };
        script.onerror = () => reject(new Error('Failed to load Deezer SDK'));
        document.head.appendChild(script);
      } else {
        reject(new Error('Window not available'));
      }
    });
  }

  private initializeDZ(): void {
    try {
      (window as WindowWithDZ).DZ?.init({
        appId: this.appId,
        channelUrl: `${window.location.origin}/channel.html`,
      });
      this.isInitialized = true;
      console.log('Deezer SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Deezer SDK:', error);
      throw error;
    }
  }

  // Login user
  async login(): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Deezer SDK not initialized. Call init() first.');
    }

    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as WindowWithDZ).DZ) {
        (window as WindowWithDZ).DZ?.login((response) => {
          if (response.authResponse) {
            this.accessToken = response.authResponse.accessToken;
            resolve(true);
          } else {
            resolve(false);
          }
        }, { perms: 'basic_access,manage_library' });
      } else {
        resolve(false);
      }
    });
  }

  // Search tracks
  async searchTracks(query: string, limit: number = 10): Promise<DeezerTrack[]> {
    try {
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const data: DeezerSearchResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Deezer search error:', error);
      return [];
    }
  }

  // Create playlist (requires authentication)
  async createPlaylist(title: string, trackIds: number[]): Promise<number | null> {
    if (!this.isInitialized) {
      throw new Error('Deezer SDK not initialized');
    }

    if (!this.accessToken) {
      throw new Error('User not authenticated');
    }

    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as WindowWithDZ).DZ) {
        // Create playlist
        (window as WindowWithDZ).DZ?.api('/user/me/playlists', 'POST', { title }, (response) => {
          const playlistResponse = response as { id?: number };
          if (playlistResponse.id) {
            // Add tracks to playlist if any
            if (trackIds.length > 0) {
              const trackList = trackIds.join(',');
              (window as WindowWithDZ).DZ?.api(`/playlist/${playlistResponse.id}/tracks`, 'POST', { songs: trackList }, () => {
                resolve(playlistResponse.id!);
              });
            } else {
              resolve(playlistResponse.id);
            }
          } else {
            console.error('Failed to create playlist:', response);
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }

  // Get user info
  async getUserInfo(): Promise<unknown> {
    if (!this.isInitialized || !this.accessToken) return null;

    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as WindowWithDZ).DZ) {
        (window as WindowWithDZ).DZ?.api('/user/me', undefined, undefined, (response) => {
          resolve(response);
        });
      } else {
        resolve(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const deezerService = new DeezerService(process.env.NEXT_PUBLIC_DEEZER_APP_ID || ''); 