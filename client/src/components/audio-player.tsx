import { useState, useEffect, RefObject } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioPath: string;
  audioRef: RefObject<HTMLAudioElement>;
  onTimeUpdate: (time: number) => void;
  currentChapter: string;
}

export function AudioPlayer({
  audioPath,
  audioRef,
  onTimeUpdate,
  currentChapter,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, onTimeUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownloadAudio = () => {
    const a = document.createElement("a");
    a.href = audioPath;
    a.download = "podcast-audio.wav";
    a.click();
  };

  return (
    <div className="space-y-4" data-testid="audio-player">
      <audio ref={audioRef} src={audioPath} preload="metadata" />

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">
          Now Playing
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {currentChapter || "Loading..."}
        </p>
      </div>

      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
          data-testid="slider-seek"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid="text-current-time">{formatTime(currentTime)}</span>
          <span data-testid="text-duration">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          onClick={togglePlayPause}
          data-testid="button-play-pause"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1 cursor-pointer"
            data-testid="slider-volume"
          />
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={handleDownloadAudio}
          data-testid="button-download-audio"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
