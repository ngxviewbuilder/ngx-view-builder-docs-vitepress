// The YouTube lessons live in ../videos.json. The same file feeds the player,
// the VideoObject structured data in config.mts and the Markdown twins.
import data from '../videos.json';

export interface VideoChapter {
  at: number;
  title: string;
}

export interface Video {
  id: string;
  lesson: number;
  title: string;
  youtubeTitle: string;
  description: string;
  seconds: number;
  uploadDate: string;
  page: string;
  alsoOn?: string[];
  chapters: VideoChapter[];
}

export const videos: Video[] = data.videos;
export const channelUrl: string = data.channel;

export function findVideo(id: string): Video | undefined {
  return videos.find((video) => video.id === id);
}

/** 173 → "2:53" */
export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
