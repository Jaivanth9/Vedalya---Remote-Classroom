// src/components/VideoPlayer.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";

interface VideoPlayerProps {
  classData: {
    id?: string;
    title?: string;
    description?: string;
    video_url?: string;
    scheduled_at?: string;
    class_type?: string;
    transcript?: string;
    // possible alternate keys teacher might have used:
    videoUrl?: string;
    video?: string;
    url?: string;
    src?: string;
    file?: string;
    courseTitle?: string;
  };
}

const SAFE_YT_REGEX = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/\s]+)/i;

const getYouTubeEmbedUrl = (raw?: string | null) => {
  try {
    if (!raw || typeof raw !== "string") return null;
    // search for id in any known format
    const m = raw.match(SAFE_YT_REGEX);
    if (m && m[1]) {
      // use nocookie domain (lower tracking)
      return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    }
    // sometimes raw could already be an embed url
    if (raw.includes("youtube.com/embed/") || raw.includes("youtube-nocookie.com/embed/")) {
      return raw;
    }
    return null;
  } catch (err) {
    // defensive: don't crash
    console.warn("getYouTubeEmbedUrl parse failed:", err);
    return null;
  }
};

const isDirectVideoFile = (url?: string | null) => {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ classData }) => {
  // Normalize: try common field names for the video URL
  const rawUrl =
    classData?.video_url ??
    classData?.videoUrl ??
    classData?.video ??
    classData?.url ??
    classData?.src ??
    classData?.file ??
    null;

  const embedUrl = getYouTubeEmbedUrl(rawUrl);
  const isFile = isDirectVideoFile(rawUrl);

  // UI state to surface helpful hints to users (adblockers etc.)
  const [showBlockedHint, setShowBlockedHint] = useState(false);

  // A tiny onError for iframe to show hint when iframe can't load (note: onError on iframe not always reliable)
  const iframeOnError = () => {
    // commonly adblock/privacy extensions block network calls causing the player to misbehave.
    setShowBlockedHint(true);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative pt-[56.25%] bg-black/5">
        {embedUrl ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={classData?.title ?? "Class video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={iframeOnError}
          />
        ) : isFile && rawUrl ? (
          <video
            className="absolute top-0 left-0 w-full h-full"
            controls
            src={rawUrl}
            onError={() => setShowBlockedHint(true)}
          />
        ) : rawUrl ? (
          // Unknown remote URL — render it in an iframe (best-effort) and also show link
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={rawUrl}
            title={classData?.title ?? "Class video"}
            allowFullScreen
            onError={iframeOnError}
          />
        ) : (
          // no video url available
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-center p-4">
              <AlertTriangle className="mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No video URL available for this class.</p>
            </div>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{classData?.title ?? "Untitled class"}</CardTitle>
            <CardDescription className="mt-2 truncate">{classData?.description}</CardDescription>
          </div>
          <Badge variant="secondary">{classData?.class_type ?? "Recorded"}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {classData?.scheduled_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(classData.scheduled_at), "PPP")}</span>
            </div>
          )}
          {classData?.scheduled_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(classData.scheduled_at), "p")}</span>
            </div>
          )}
        </div>

        {classData?.transcript && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold mb-2">About this video</p>
            <p className="text-xs text-muted-foreground line-clamp-3">{classData.transcript}</p>
          </div>
        )}

        {/* Helpful fallback UI when embeds are blocked */}
        {showBlockedHint && (
          <div className="mt-3 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <div><strong>Video failed to load in the embedded player.</strong></div>
                <div className="mt-1">This commonly happens when an ad-blocker or privacy extension blocks requests to YouTube/Google. Try one of:</div>
                <ul className="mt-2 ml-4 list-disc">
                  <li>Whitelist <code>localhost</code> (or your dev domain) in your ad-blocker/privacy extension.</li>
                  <li>Open the video directly by clicking the link below.</li>
                </ul>
                {rawUrl && (
                  <div className="mt-2">
                    <a className="inline-flex items-center gap-2 underline" href={rawUrl} target="_blank" rel="noopener noreferrer">
                      <LinkIcon /> Open video in new tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
