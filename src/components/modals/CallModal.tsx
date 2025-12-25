import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebRTC } from "@/hooks/useWebRTC";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant?: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
  isVideo?: boolean;
}

const VideoTile = ({
  stream,
  isLocal = false,
  muted = false,
  participantInfo,
}: {
  stream: MediaStream | null;
  isLocal?: boolean;
  muted?: boolean;
  participantInfo?: { name: string; avatar?: string };
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Check for video tracks
      const checkVideo = () => {
        const videoTrack = stream.getVideoTracks()[0];
        setHasVideo(!!(videoTrack && videoTrack.enabled));
      };

      checkVideo();

      stream.getVideoTracks().forEach((t) => {
        t.onmute = () => setHasVideo(false);
        t.onunmute = () => setHasVideo(true);
        t.onended = () => setHasVideo(false);
        // Also listen to 'enabled' property changes if possible (though onmute usually covers it)
      });

      const interval = setInterval(checkVideo, 1000); // Polling as fallback
      return () => clearInterval(interval);
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div
      className={`relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center ${
        isLocal
          ? "w-48 h-32 absolute bottom-4 right-4 shadow-xl z-20"
          : "w-full h-full"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || muted}
        className={`w-full h-full object-cover ${
          hasVideo ? "block" : "hidden"
        }`}
      />
      {!hasVideo && (
        <div className="flex flex-col items-center justify-center p-4">
          <Avatar
            className={`w-20 h-20 border-4 ${
              isLocal ? "border-green-500" : "border-notfox-primary"
            } mb-2`}
          >
            <AvatarImage src={participantInfo?.avatar} />
            <AvatarFallback className="text-xl bg-gray-700">
              {participantInfo?.name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm shadow-md bg-black/50 px-2 py-1 rounded">
            {participantInfo?.name || (isLocal ? "You" : "User")}
          </span>
        </div>
      )}

      {isLocal && hasVideo && (
        <span className="absolute bottom-1 right-2 text-xs bg-black/50 px-1 rounded text-white">
          You
        </span>
      )}
    </div>
  );
};

export const CallModal = ({
  isOpen,
  onClose,
  participant,
  isVideo = false,
  conversationId,
}: CallModalProps & { conversationId?: string }) => {
  const { profile } = useAuth();

  const {
    localStream,
    remoteStreams, // This is now a Map<userId, MediaStream>
    peers,
    toggleMic,
    toggleVideo,
  } = useWebRTC(isOpen ? conversationId : undefined, profile?.id, { isVideo });

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);

  // Calculate grid layout based on number of participants
  const participantCount = remoteStreams.size;

  // Basic grid logic
  const getGridClass = () => {
    if (participantCount <= 1) return "grid-cols-1";
    if (participantCount === 2) return "grid-cols-2";
    return "grid-cols-2 md:grid-cols-3"; // Expand as needed
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl bg-black/95 border-notfox-darker p-6 flex flex-col h-[80vh] [&>button]:hidden">
        <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
          {/* If no one else is here */}
          {/* If no one else is here */}
          {remoteStreams.size === 0 && (
            <div className="flex flex-col items-center justify-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-notfox-primary animate-pulse">
                <AvatarImage src={participant?.avatar_url || undefined} />
                <AvatarFallback>#</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-white mb-2">
                {peers.length > 0 ? "Connecting..." : "Waiting for others..."}
              </h3>
              <p className="text-gray-400">
                {peers.length > 0
                  ? `Found ${peers.length} peer(s)`
                  : "Share the link so others can join."}
              </p>
            </div>
          )}

          {/* Remote Video Grid */}
          {remoteStreams.size > 0 && (
            <div
              className={`grid ${getGridClass()} gap-4 w-full h-full content-center p-4`}
            >
              {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                <div
                  key={userId}
                  className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800"
                >
                  {/* We'd ideally fetch user profile here for name/avatar if video is off */}
                  <VideoTile stream={stream} />
                </div>
              ))}
            </div>
          )}

          {/* Local Video (PIP) */}
          {localStream && isVideoEnabled && (
            <VideoTile stream={localStream} isLocal={true} />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-6 pb-2">
          <Button
            size="icon"
            variant={isVideoEnabled ? "default" : "secondary"}
            className="w-14 h-14 rounded-full"
            onClick={() => {
              const enabled = !isVideoEnabled;
              setIsVideoEnabled(enabled);
              toggleVideo();
            }}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            size="icon"
            variant={isMicMuted ? "secondary" : "default"}
            className={`w-14 h-14 rounded-full ${
              isMicMuted
                ? "bg-white text-black hover:bg-white/90"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={() => {
              const muted = !isMicMuted;
              setIsMicMuted(muted);
              toggleMic();
            }}
          >
            {isMicMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          <Button
            size="icon"
            variant="destructive"
            className="w-16 h-14 rounded-full"
            onClick={onClose}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
