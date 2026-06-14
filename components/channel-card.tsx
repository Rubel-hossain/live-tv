import { Heart, Play } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import type { Channel } from "@/lib/types";
import { accentIndex, channelInitials } from "@/lib/channel-utils";

type ChannelCardProps = {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  favoriteEnabled: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

function ChannelCardBase({
  channel,
  isActive,
  isFavorite,
  favoriteEnabled,
  onSelect,
  onToggleFavorite
}: ChannelCardProps) {
  const accentClass = `accent-${accentIndex(channel.name)}`;
  const initials = channelInitials(channel.name);

  return (
    <article className={`channel-item ${isActive ? "is-active" : ""}`}>
      <button
        type="button"
        className="channel-main-button"
        onClick={onSelect}
        aria-current={isActive ? "true" : undefined}
      >
        <span className={`channel-mark small ${accentClass}`}>
          {channel.logo ? (
            <Image
              src={channel.logo}
              alt=""
              fill
              sizes="54px"
              className="channel-logo"
              unoptimized
            />
          ) : (
            <span>{initials}</span>
          )}
        </span>

        <span className="channel-info">
          <span className="channel-name">{channel.name}</span>
          <span className="channel-meta">
            <span className="channel-number">{channel.number.toString().padStart(3, "0")}</span>
            {channel.quality ? <span className="quality-badge">{channel.quality}</span> : null}
            {channel.country ? <span className="country-badge">{channel.country}</span> : null}
          </span>
        </span>
      </button>

      <div className="channel-actions">
        {favoriteEnabled ? (
          <button
            type="button"
            className={`favorite-button ${isFavorite ? "active" : ""}`}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            title={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        ) : null}

        {isActive ? (
          <span className="playing-indicator" aria-label="Now playing">
            <Play size={14} fill="currentColor" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </article>
  );
}

export const ChannelCard = memo(ChannelCardBase);
