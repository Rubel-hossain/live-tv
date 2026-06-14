import { BadgeCheck, Signal } from "lucide-react";
import Image from "next/image";
import type { Channel } from "@/lib/types";
import { channelInitials, accentIndex } from "@/lib/channel-utils";
import { memo } from "react";

type NowPlayingPanelProps = {
  channel: Channel;
};

function NowPlayingPanelBase({ channel }: NowPlayingPanelProps) {
  const accentClass = `accent-${accentIndex(channel.name)}`;
  const initials = channelInitials(channel.name);

  return (
    <div className="now-panel">
      <div className={`channel-mark ${accentClass}`}>
        {channel.logo ? (
          <Image
            src={channel.logo}
            alt=""
            fill
            sizes="112px"
            className="channel-logo"
            unoptimized
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <h2>{channel.name}</h2>

      <dl>
        {channel.group && (
          <div>
            <dt>Group</dt>
            <dd>{channel.group}</dd>
          </div>
        )}
        
        {channel.country && (
          <div>
            <dt>Country</dt>
            <dd>{channel.country}</dd>
          </div>
        )}
        
        {channel.quality && (
          <div>
            <dt>Quality</dt>
            <dd>{channel.quality}</dd>
          </div>
        )}
        
        <div>
          <dt>Host</dt>
          <dd>{channel.host}</dd>
        </div>
      </dl>

      <div className="panel-badges">
        {channel.logo && (
          <div className="panel-badge">
            <BadgeCheck size={14} />
            <span>Logo</span>
          </div>
        )}
        
        <div className="panel-badge">
          <Signal size={14} />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}

export const NowPlayingPanel = memo(NowPlayingPanelBase);
