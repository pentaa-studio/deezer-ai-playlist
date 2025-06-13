import { Track } from "@/lib/generator";

interface DeezerPlayerProps {
  tracks: Track[];
  title: string;
}

export default function DeezerPlayer({ tracks, title }: DeezerPlayerProps) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Aucun morceau trouvé
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      
      {/* Track list with previews */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {tracks.length} morceaux trouvés
        </p>
        
        {tracks.map((track, idx) => (
          <div key={track.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{track.title}</div>
              <div className="text-sm text-muted-foreground">{track.artist}</div>
              {track.album && (
                <div className="text-xs text-muted-foreground">{track.album}</div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Preview audio */}
              {track.preview && (
                <audio controls className="w-32 h-8">
                  <source src={track.preview} type="audio/mpeg" />
                </audio>
              )}
              
              {/* Deezer link */}
              <a
                href={`https://www.deezer.com/track/${track.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                Deezer
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Share playlist */}
      <div className="mt-6 p-4 bg-card border rounded-lg">
        <p className="text-sm font-medium mb-3">Partager cette playlist :</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={`https://www.deezer.com/search/${encodeURIComponent(title)}`}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-background border rounded"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://www.deezer.com/search/${encodeURIComponent(title)}`);
            }}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Copier
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2 mt-3">
          <a
            href={`https://www.deezer.com/search/${encodeURIComponent(tracks.map(t => `${t.artist} ${t.title}`).join(' '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Rechercher sur Deezer
          </a>
          <a
            href={`https://open.spotify.com/search/${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Rechercher sur Spotify
          </a>
        </div>
      </div>
    </div>
  );
} 