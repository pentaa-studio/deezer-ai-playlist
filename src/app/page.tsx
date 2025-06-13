"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from '@ai-sdk/react'
import { useState, useEffect, useRef } from 'react';
import DeezerPlayer from '@/components/DeezerPlayer';
import { Track } from '@/lib/generator';
import { MessageCircle, Music, Loader2, Send, Zap, Search, TrendingUp } from 'lucide-react';
import AppIcon from '@/components/AppIcon';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat();
  const [currentPlaylist, setCurrentPlaylist] = useState<{title: string, tracks: Track[]} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract playlist data from tool calls in messages
  const extractPlaylistFromMessages = () => {
    // Look for the latest assistant message with tool calls
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === 'assistant' && message.toolInvocations) {
        for (const toolCall of message.toolInvocations) {
          if (toolCall.toolName === 'createPlaylist' && 
              'result' in toolCall && 
              toolCall.result?.success && 
              toolCall.result?.playlist) {
            const playlist = toolCall.result.playlist;
            return {
              title: playlist.title,
              tracks: playlist.tracks.map((track: any) => ({
                id: track.id,
                title: track.title,
                artist: track.artist,
                album: track.album,
                preview: track.preview,
                tag: "search" as const
              }))
            };
          }
        }
      }
    }
    return null;
  };

  // Update playlist when messages change
  useEffect(() => {
    const playlist = extractPlaylistFromMessages();
    if (playlist) {
      setCurrentPlaylist(playlist);
    }
  }, [messages]);

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  // Check if conversation is in progress
  const hasConversation = messages.length > 0;
  const hasPlaylist = currentPlaylist !== null;
  const isStreaming = status === "streaming";

  // Get tool call indicators
  const getToolCallInfo = (message: any) => {
    if (!message.toolInvocations) return null;
    
    const toolCalls = message.toolInvocations.map((tool: any) => {
      switch (tool.toolName) {
        case 'searchMusic':
          return { icon: Search, label: `Recherche: ${tool.args?.query}`, color: 'text-blue-500' };
        case 'createPlaylist':
          return { icon: Music, label: 'Création de playlist', color: 'text-[#a238ff]' };
        case 'getPopularTracks':
          return { icon: TrendingUp, label: `Tendances: ${tool.args?.genre || 'tous genres'}`, color: 'text-green-500' };
        default:
          return { icon: Zap, label: tool.toolName, color: 'text-gray-500' };
      }
    });
    
    return toolCalls;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppIcon size={32} animated={true} />
            <div>
              <h1 className="text-xl font-bold">
                Text to <span className="text-[#a238ff]">Playlist</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Agent IA musical avec function calling
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          {hasConversation && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#a238ff]/10 border border-[#a238ff]/20 rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-orange-500 animate-pulse' : 
                hasPlaylist ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <span className="text-xs font-medium">
                {isStreaming ? 'Agent en action...' : 
                 hasPlaylist ? 'Playlist créée' : 'En conversation'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content - Resizable layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left side - Conversation */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full flex flex-col border-r">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md space-y-6">
                  <div className="mx-auto">
                    <AppIcon size={64} animated={true} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Agent Musical IA</h2>
                    <p className="text-muted-foreground mb-6">
                      Discutez avec l&apos;agent qui peut rechercher de la musique et créer des playlists
                    </p>
                  </div>
                  
                  {/* Quick suggestions */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer text-left">
                      <p className="font-medium text-sm">🔍 Recherche d&apos;artistes</p>
                      <p className="text-xs text-muted-foreground">Explorez des artistes spécifiques</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer text-left">
                      <p className="font-medium text-sm">🎵 Création de playlist</p>
                      <p className="text-xs text-muted-foreground">Générez des playlists personnalisées</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer text-left">
                      <p className="font-medium text-sm">📈 Tendances musicales</p>
                      <p className="text-xs text-muted-foreground">Découvrez les hits du moment</p>
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
                      <div className="flex-shrink-0">
                        <AppIcon size={32} />
                      </div>
                    )}
                    <div className={`max-w-[80%] space-y-2`}>
                      {/* Message content */}
                      <div className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-[#a238ff] text-white' 
                          : 'bg-muted'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      </div>
                      
                                              {/* Tool calls indicators */}
                        {message.role === 'assistant' && message.toolInvocations && (
                          <div className="space-y-1">
                            {getToolCallInfo(message)?.map((tool: any, toolIdx: number) => (
                              <div key={toolIdx} className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded text-xs">
                                <tool.icon size={12} className={tool.color} />
                                <span className="text-muted-foreground">{tool.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
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
          
          {/* Input area - only for conversation */}
          <div className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4">
            <form onSubmit={handleFormSubmit} className="relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  hasConversation 
                    ? "Continuez la conversation avec TtP..." 
                    : "Demandez à TtP de rechercher de la musique ou créer une playlist..."
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
              L&apos;agent peut rechercher de la musique, créer des playlists et découvrir les tendances
                         </p>
           </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right side - Playlist */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full flex flex-col bg-card/30">
          {/* Playlist header */}
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <AppIcon size={20} />
              Playlist de l&apos;Agent
            </h2>
          </div>
          
          {/* Playlist content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isStreaming ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 size={32} className="animate-spin text-[#a238ff]" />
                <div className="text-center">
                  <h3 className="font-semibold text-[#a238ff] mb-2">
                    🤖 Agent en action...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    L&apos;agent utilise ses outils pour vous aider
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
                <div className="opacity-50">
                  <AppIcon size={64} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Aucune playlist</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasConversation 
                      ? "Demandez à l'agent de créer une playlist"
                      : "Commencez une conversation avec l'agent musical"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
