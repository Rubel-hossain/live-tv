import { TvExperience } from "@/components/tv-experience";
import { getPlaylist } from "@/lib/playlist";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const channels = await getPlaylist();
    logger.info(`Loaded ${channels.length} channels from playlist`);
    return <TvExperience channels={channels} />;
  } catch (error) {
    logger.error("Failed to load playlist", error);
    
    return (
      <main className="error-state">
        <div className="error-icon">
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx={12} cy={12} r={10} />
            <line x1={12} y1={8} x2={12} y2={12} />
            <line x1={12} y1={16} x2={12.01} y2={16} />
          </svg>
        </div>
        <h1>Playlist Not Found</h1>
        <p>
          Could not load the playlist. For deployments, set `PLAYLIST_URL` to a raw GitHub
          playlist URL. For localhost, keep your M3U file in the project root.
        </p>
      </main>
    );
  }
}
