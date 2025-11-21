import { YouTubeVideo, YouTubeSearchResult, YouTubeVideoDetails } from '../types/youtube';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

function calculateScore(video: YouTubeVideo): number {
  const durationSeconds = parseDuration(video.duration);

  const normalizedViews = Math.log10(video.viewCount + 1);

  let durationScore = 0;
  if (durationSeconds > 0) {
    if (durationSeconds >= 300 && durationSeconds <= 900) {
      durationScore = 10;
    } else if (durationSeconds >= 180 && durationSeconds < 300) {
      durationScore = 8;
    } else if (durationSeconds > 900 && durationSeconds <= 1800) {
      durationScore = 6;
    } else if (durationSeconds < 180) {
      durationScore = 4;
    } else {
      durationScore = 2;
    }
  }

  let engagementScore = 0;
  if (video.likeCount && video.viewCount > 0) {
    const engagementRate = (video.likeCount / video.viewCount) * 100;
    engagementScore = Math.log10(video.likeCount + 1) * (1 + engagementRate);
  }

  const recencyBoost = calculateRecencyBoost(video.publishedAt);

  const totalScore = (normalizedViews * 3) + (durationScore * 2) + (engagementScore * 4) + recencyBoost;

  return totalScore;
}

function calculateRecencyBoost(publishedAt: string): number {
  const publishedDate = new Date(publishedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 30) {
    return 5;
  } else if (daysDiff <= 90) {
    return 3;
  } else if (daysDiff <= 365) {
    return 1;
  }
  return 0;
}

export async function searchVideos(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
  try {
    const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error('Failed to search videos');
    }

    const searchData = await searchResponse.json();
    const searchResults: YouTubeSearchResult[] = searchData.items || [];

    if (searchResults.length === 0) {
      return [];
    }

    const videoIds = searchResults.map(item => item.id.videoId).join(',');
    const detailsUrl = `${BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const detailsData = await detailsResponse.json();
    const videoDetails: YouTubeVideoDetails[] = detailsData.items || [];

    const videos: YouTubeVideo[] = searchResults.map((result, index) => {
      const details = videoDetails.find(d => d.id === result.id.videoId);

      const video: YouTubeVideo = {
        id: result.id.videoId,
        title: result.snippet.title,
        description: result.snippet.description,
        thumbnail: result.snippet.thumbnails.high.url,
        channelTitle: result.snippet.channelTitle,
        channelId: result.snippet.channelId,
        duration: details?.contentDetails.duration || 'PT0S',
        viewCount: parseInt(details?.statistics.viewCount || '0'),
        likeCount: details?.statistics.likeCount ? parseInt(details.statistics.likeCount) : undefined,
        publishedAt: result.snippet.publishedAt,
        score: 0
      };

      video.score = calculateScore(video);
      return video;
    });

    return videos.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

export async function searchMultipleQueries(queries: string[]): Promise<YouTubeVideo[]> {
  const allVideos: YouTubeVideo[] = [];
  const videoIds = new Set<string>();

  for (const query of queries) {
    const videos = await searchVideos(query, 3);
    videos.forEach(video => {
      if (!videoIds.has(video.id)) {
        videoIds.add(video.id);
        allVideos.push(video);
      }
    });
  }

  return allVideos.sort((a, b) => b.score - a.score);
}
