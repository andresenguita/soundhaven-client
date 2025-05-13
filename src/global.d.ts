// client/src/global.d.ts
export {}; // convierte este fichero en un módulo

declare global {
  // Extendemos la ventana global para incluir Spotify
  interface Window {
    Spotify: typeof Spotify;
  }

  // Declaración del namespace Spotify con los tipos mínimos que usamos
  namespace Spotify {
    /** Opciones al instanciar el reproductor */
    interface PlayerOptions {
      name: string;
      getOAuthToken(callback: (token: string) => void): void;
    }

    /** Clase principal del Web Playback SDK */
    class Player {
      constructor(options: PlayerOptions);
      connect(): Promise<boolean>;
      addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
      addListener(event: 'player_state_changed', callback: (state: PlaybackState | null) => void): void;
      togglePlay(): Promise<void>;
      seek(position_ms: number): Promise<void>;
    }

    /** Estado de reproducción que devuelve el SDK */
    interface PlaybackState {
      paused: boolean;
      position: number;
      duration: number;
    }
  }
}
