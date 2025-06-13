import { Button } from "@/components/ui/button";
import { Track } from "@/lib/generator";
import { StarIcon, FrameIcon, PlayIcon } from "@radix-ui/react-icons";

export default function PlaylistCard({ title, artist, tag }: Track) {
  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{artist}</div>
      </div>
      {tag === "fav" ? (
        <span className="flex items-center gap-1 text-yellow-500"><StarIcon /> <span>★ Fav</span></span>
      ) : (
        <span className="flex items-center gap-1 text-red-500"><span>🔥</span> <span>🔥 Buzz</span></span>
      )}
      <Button variant="outline" size="icon" title="Play (simulé)"><PlayIcon /></Button>
    </div>
  );
} 