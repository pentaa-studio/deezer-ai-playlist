import { Track } from "@/lib/generator";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Music, 
  ExternalLink,
  Copy,
  Search
} from "lucide-react";

interface DeezerPlayerProps {
  tracks: Track[];
  title: string;
}

export default function DeezerPlayer({ tracks, title }: DeezerPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play next track when current ends
  const handleTrackEnd = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [currentTrackIndex, isPlaying]);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Aucun morceau trouvé
      </div>
    );
  }

  const currentTrack = tracks[currentTrackIndex];
  



  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };



  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-hidden">
      <h3 className="font-semibold text-lg flex-shrink-0">{title}</h3>
      
      {/* Main Player */}
      <div className="bg-card border rounded-lg p-4 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
            {currentTrack.cover ? (
              <Image 
                src={currentTrack.cover} 
                alt={`Cover de ${currentTrack.album || currentTrack.title}`}
                width={64}
                height={64}
                className="object-cover"
                onError={() => {
                  // Silently handle error - fallback will be shown
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#a238ff] to-[#8b2bdb] flex items-center justify-center text-white">
                <Music size={32} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{currentTrack.title}</h4>
            <p className="text-muted-foreground">{currentTrack.artist}</p>
            {currentTrack.album && (
              <p className="text-sm text-muted-foreground">{currentTrack.album}</p>
            )}
          </div>
          <a
            href={`https://www.deezer.com/track/${currentTrack.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-[#a238ff] text-white rounded hover:bg-[#8b2bdb] transition-colors"
          >
            <ExternalLink size={16} />
            Deezer
          </a>
        </div>

        {/* Audio Player */}
        {currentTrack.preview && (
          <div className="space-y-3">
            <audio
              ref={audioRef}
              src={currentTrack.preview}
              onEnded={handleTrackEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full"
              controls
            />
            
            {/* Custom Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prevTrack}
                className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                title="Morceau précédent"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlayPause}
                className="p-3 bg-[#a238ff] text-white rounded-full hover:bg-[#8b2bdb] transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={nextTrack}
                className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                title="Morceau suivant"
              >
                <SkipForward size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-3 text-center text-sm text-muted-foreground">
          Morceau {currentTrackIndex + 1} sur {tracks.length}
        </div>
      </div>


      
      {/* Playlist */}
      <div className="flex-1 flex flex-col space-y-2 min-h-0">
        <p className="text-sm font-medium flex items-center gap-2 flex-shrink-0">
          <Music size={16} />
          Playlist ({tracks.length} morceaux) :
        </p>
        
        <div className="flex-1 grid gap-1 overflow-y-auto overflow-x-hidden min-h-0 w-full">
          {tracks.map((track, idx) => (
            <div 
              key={track.id} 
              className={`flex items-center gap-3 p-2 rounded text-sm cursor-pointer transition-colors min-w-0 ${
                idx === currentTrackIndex 
                  ? 'bg-[#a238ff]/10 border border-[#a238ff]/30' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => playTrack(idx)}
            >
              <span className="text-muted-foreground w-6 flex-shrink-0 flex items-center justify-center">
                {idx === currentTrackIndex ? <Music size={16} className="text-[#a238ff]" /> : `${idx + 1}.`}
              </span>
              
              {/* Album cover thumbnail */}
              <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden shadow-sm">
                {track.cover ? (
                  <Image 
                    src={track.cover} 
                    alt={`Cover de ${track.album || track.title}`}
                    width={40}
                    height={40}
                    className="object-cover"
                    onError={() => {
                      // Silently handle error - fallback will be shown
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#a238ff] to-[#8b2bdb] flex items-center justify-center">
                    <Music size={16} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-medium truncate leading-tight" title={track.title}>
                  {track.title}
                </div>
                <div className="text-muted-foreground text-xs truncate leading-tight" title={track.artist}>
                  {track.artist}
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(idx);
                  }}
                  className="p-1 bg-[#a238ff] text-white rounded hover:bg-[#8b2bdb] transition-colors"
                  title={`Jouer ${track.title}`}
                >
                  <Play size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Share playlist */}
      <div className="p-4 bg-card border rounded-lg flex-shrink-0">
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
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            <Copy size={16} />
            Copier
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2 mt-3">
          <a
            href={`https://www.deezer.com/search/${encodeURIComponent(tracks.map(t => `${t.artist} ${t.title}`).join(' '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1 text-xs bg-[#a238ff] text-white rounded hover:bg-[#8b2bdb] transition-colors"
          >
            <Search size={14} />
            Rechercher sur Deezer
          </a>
        </div>
      </div>
    </div>
  );
} 