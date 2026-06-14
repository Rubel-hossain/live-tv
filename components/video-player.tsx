"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";
import type { Channel } from "@/lib/types";
import { playbackUrl } from "@/lib/stream-url";

type VideoPlayerProps = {
  channel: Channel;
  muted: boolean;
  onError: (error: string) => void;
  onChannelChange: () => void;
};

export function VideoPlayer({ channel, muted, onError, onChannelChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const sourceUrl = playbackUrl(
      channel.url,
      typeof window === "undefined" ? undefined : window.location.protocol
    );

    onError("");
    hlsRef.current?.destroy();
    hlsRef.current = null;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.muted = mutedRef.current;

    const attemptPlay = () => {
      video.play().catch(() => {
        onError("Press play to start this stream.");
      });
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        backBufferLength: 60,
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30
      });

      hlsRef.current = hls;
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, attemptPlay);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          onError("Reconnecting to the stream...");
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          onError("Recovering the video stream...");
          hls.recoverMediaError();
          return;
        }

        onError("This stream did not respond in the browser. Try another channel.");
        hls.destroy();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      attemptPlay();
    } else {
      onError("Your browser cannot play HLS streams directly.");
    }

    onChannelChange();

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [channel.id, channel.url, onChannelChange, onError]);

  return (
    <video
      ref={videoRef}
      className="video-element"
      controls
      autoPlay
      muted={muted}
      playsInline
      onCanPlay={() => onError("")}
      onError={() => onError("This browser could not load the selected stream.")}
    />
  );
}
