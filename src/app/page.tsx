"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from '@ai-sdk/react'
import { useState, useEffect } from 'react';
import DeezerPlayer from '@/components/DeezerPlayer';
import { Track } from '@/lib/generator';
import { MessageCircle, Music, Loader2 } from 'lucide-react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat();
  const [currentPlaylist, setCurrentPlaylist] = useState<{title: string, tracks: Track[]} | null>(null);
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);

  // Check if user is asking to generate playlist
  const checkIfGeneratingPlaylist = (userMessage: string) => {
    const generateKeywords = [
      'génère', 'crée', 'fais', 'lance', 'go', 'ok', 'oui', 'parfait', 
      'c\'est bon', 'allons-y', 'maintenant', 'playlist maintenant'
    ];
    
    return generateKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
  };

  // Extract playlist data from assistant messages
  const extractPlaylistData = (content: string) => {
    try {
      // Look for data between markers
      const startMarker = '---PLAYLIST_DATA---';
      const endMarker = '---END_PLAYLIST_DATA---';
      
      const startIndex = content.indexOf(startMarker);
      const endIndex = content.indexOf(endMarker);
      
      if (startIndex !== -1 && endIndex !== -1) {
        const jsonStr = content.substring(startIndex + startMarker.length, endIndex).trim();
        const playlistData = JSON.parse(jsonStr);
        setCurrentPlaylist(playlistData);
        setIsGeneratingPlaylist(false); // Stop loading when playlist is ready
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to extract playlist data:', error);
      setIsGeneratingPlaylist(false);
      return false;
    }
  };

  // Clean description by removing playlist data
  const cleanDescription = (content: string) => {
    const startMarker = '---PLAYLIST_DATA---';
    const startIndex = content.indexOf(startMarker);
    if (startIndex !== -1) {
      const cleanedContent = content.substring(0, startIndex).trim();
      // If we're in the middle of streaming playlist data, keep loading state
      if (cleanedContent && startIndex > 0) {
        return cleanedContent;
      }
      // If content is empty or just starting playlist data, show loading message
      return "🎵 Finalisation de votre playlist...";
    }
    return content;
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    // Check if user is asking to generate playlist
    if (checkIfGeneratingPlaylist(input)) {
      setIsGeneratingPlaylist(true);
    }
    handleSubmit(e);
  };

  // Check for new assistant messages and extract playlist data
  useEffect(() => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMessage) {
      // If message contains playlist data marker but no end marker yet, keep loading
      const hasStartMarker = lastAssistantMessage.content.includes('---PLAYLIST_DATA---');
      const hasEndMarker = lastAssistantMessage.content.includes('---END_PLAYLIST_DATA---');
      
      if (hasStartMarker && !hasEndMarker && status === "streaming") {
        // Still streaming playlist data, keep loading state
        setIsGeneratingPlaylist(true);
      } else {
        // Try to extract playlist data
        extractPlaylistData(lastAssistantMessage.content);
      }
    }
  }, [messages, status]);

  // Reset loading state if streaming stops without playlist
  useEffect(() => {
    if (status !== "streaming" && isGeneratingPlaylist) {
      // Check if we actually got a playlist, if not reset loading
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && !lastMessage.content.includes('---PLAYLIST_DATA---')) {
        setIsGeneratingPlaylist(false);
      }
    }
  }, [status, isGeneratingPlaylist, messages]);

  // Check if conversation is in progress
  const hasConversation = messages.length > 0;
  const hasPlaylist = currentPlaylist !== null;

  return (
    <main className="max-w-4xl mx-auto py-12 flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Text to <span className="text-[#a238ff]">Playlist</span>
        </h1>
        <p className="text-muted-foreground">
          Discutez avec l&apos;IA pour créer des playlists personnalisées sur Deezer
        </p>
      </div>
      
      {/* Conversation Status */}
      {hasConversation && (
        <div className="flex items-center justify-center gap-2 p-3 bg-[#a238ff]/10 border border-[#a238ff]/20 rounded-lg">
          <MessageCircle size={16} className="text-[#a238ff]" />
          <span className="text-sm">
            {isGeneratingPlaylist
              ? "🎵 Génération de votre playlist en cours..."
              : hasPlaylist 
                ? "Playlist générée ! Vous pouvez continuer la conversation pour en créer une nouvelle."
                : "Conversation en cours... L&apos;IA apprend à vous connaître pour créer la playlist parfaite."
            }
          </span>
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={
            hasConversation 
              ? "Continuez la conversation..." 
              : "Ex: Je veux une playlist pour faire du sport"
          }
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={status === "streaming" || !input}
          className="bg-[#a238ff] hover:bg-[#8b2bdb]"
        >
          {status === "streaming" ? "..." : "Envoyer"}
        </Button>
      </form>
      
      {/* Suggestions for first message */}
      {!hasConversation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Music size={16} />
              Exemples de demandes
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• &quot;Je veux une playlist pour faire du sport&quot;</p>
              <p>• &quot;Musique calme pour travailler&quot;</p>
              <p>• &quot;Playlist festive pour une soirée&quot;</p>
              <p>• &quot;Sons chill pour me détendre&quot;</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MessageCircle size={16} />
              Comment ça marche
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Décrivez votre besoin musical</p>
              <p>2. L&apos;IA vous pose des questions</p>
              <p>3. Répondez pour affiner vos goûts</p>
              <p>4. Dites &quot;génère&quot; pour créer la playlist</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Conversation */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle size={20} />
            Conversation avec l&apos;IA
          </h2>
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground p-8 border rounded-lg">
              Commencez une conversation pour créer votre playlist personnalisée
            </p>
          )}
          {messages.map((message, idx) => (
            <div key={idx} className={`p-4 border rounded-lg ${
              message.role === 'user' 
                ? 'bg-[#a238ff]/5 border-[#a238ff]/20 ml-8' 
                : 'bg-card mr-8'
            }`}>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                {message.role === 'user' ? '👤 Vous' : '🤖 Assistant IA'}
              </p>
              <p className="whitespace-pre-wrap">{cleanDescription(message.content)}</p>
            </div>
          ))}
        </section>

        {/* Deezer Player */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Music size={20} />
            Player Deezer
          </h2>
          
          {/* Loading State for Playlist Generation */}
          {isGeneratingPlaylist ? (
            <div className="p-8 border rounded-lg bg-gradient-to-br from-[#a238ff]/5 to-[#a238ff]/10 border-[#a238ff]/20">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader2 size={32} className="animate-spin text-[#a238ff]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#a238ff]">
                    {messages.some(m => m.content.includes('---PLAYLIST_DATA---')) 
                      ? "🎵 Finalisation de votre playlist..."
                      : "🎵 Création de votre playlist parfaite..."
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages.some(m => m.content.includes('---PLAYLIST_DATA---'))
                      ? "Presque fini ! Je prépare l'affichage de vos morceaux..."
                      : "Je fouille dans les millions de titres Deezer pour trouver les morceaux qui vous correspondent parfaitement !"
                    }
                  </p>
                </div>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-[#a238ff] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#a238ff] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#a238ff] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          ) : currentPlaylist ? (
            <DeezerPlayer 
              tracks={currentPlaylist.tracks} 
              title={currentPlaylist.title}
            />
          ) : (
            <p className="text-center text-muted-foreground p-8 border rounded-lg">
              {hasConversation 
                ? "Continuez la conversation et dites &apos;génère&apos; pour créer votre playlist"
                : "Commencez une conversation pour voir votre playlist ici"
              }
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
