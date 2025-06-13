"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from '@ai-sdk/react'
import { useState, useEffect, useRef } from 'react';
import DeezerPlayer from '@/components/DeezerPlayer';
import { Track } from '@/lib/generator';
import { MessageCircle, Music, Loader2, Send } from 'lucide-react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat();
  const [currentPlaylist, setCurrentPlaylist] = useState<{title: string, tracks: Track[]} | null>(null);
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    e.preventDefault();
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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#a238ff] to-[#8b2bdb] rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Text to <span className="text-[#a238ff]">Playlist</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Créez des playlists avec l&apos;IA
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          {hasConversation && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#a238ff]/10 border border-[#a238ff]/20 rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                isGeneratingPlaylist ? 'bg-orange-500 animate-pulse' : 
                hasPlaylist ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <span className="text-xs font-medium">
                {isGeneratingPlaylist ? 'Génération...' : 
                 hasPlaylist ? 'Playlist prête' : 'En conversation'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content - Split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Conversation */}
        <div className="flex-1 flex flex-col border-r">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#a238ff] to-[#8b2bdb] rounded-2xl flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Commencez une conversation</h2>
                    <p className="text-muted-foreground mb-6">
                      Décrivez le type de playlist que vous souhaitez créer
                    </p>
                  </div>
                  
                  {/* Quick suggestions */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer text-left">
                      <p className="font-medium text-sm">🏃‍♂️ Playlist pour le sport</p>
                      <p className="text-xs text-muted-foreground">Musiques énergiques pour l&apos;entraînement</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer text-left">
                      <p className="font-medium text-sm">💼 Musique de concentration</p>
                      <p className="text-xs text-muted-foreground">Sons calmes pour travailler</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer text-left">
                      <p className="font-medium text-sm">🎉 Playlist de fête</p>
                      <p className="text-xs text-muted-foreground">Hits dansants pour animer</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <div key={idx} className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#a238ff] to-[#8b2bdb] rounded-full flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-[#a238ff] text-white' 
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">
                        {cleanDescription(message.content)}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Right side - Playlist */}
        <div className="w-96 flex flex-col bg-card/30">
          {/* Playlist header */}
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Music size={18} />
              Playlist Générée
            </h2>
          </div>
          
          {/* Playlist content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isGeneratingPlaylist ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 size={32} className="animate-spin text-[#a238ff]" />
                <div className="text-center">
                  <h3 className="font-semibold text-[#a238ff] mb-2">
                    {messages.some(m => m.content.includes('---PLAYLIST_DATA---')) 
                      ? "🎵 Finalisation..."
                      : "🎵 Création en cours..."
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages.some(m => m.content.includes('---PLAYLIST_DATA---'))
                      ? "Préparation de l'affichage..."
                      : "Recherche des meilleurs morceaux..."
                    }
                  </p>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#a238ff] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#a238ff] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#a238ff] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            ) : currentPlaylist ? (
              <DeezerPlayer 
                tracks={currentPlaylist.tracks} 
                title={currentPlaylist.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Aucune playlist</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasConversation 
                      ? "Dites 'génère' pour créer votre playlist"
                      : "Commencez une conversation pour générer une playlist"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom input - ChatGPT style */}
      <div className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleFormSubmit} className="relative">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={
                hasConversation 
                  ? "Continuez la conversation..." 
                  : "Décrivez le type de playlist que vous voulez créer..."
              }
              className="pr-12 py-3 text-base"
              disabled={status === "streaming"}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={status === "streaming" || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-[#a238ff] hover:bg-[#8b2bdb]"
            >
              <Send size={16} />
            </Button>
          </form>
          
          {/* Helper text */}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Appuyez sur Entrée pour envoyer • L&apos;IA peut faire des erreurs, vérifiez les informations importantes
          </p>
        </div>
      </div>
    </div>
  );
}
