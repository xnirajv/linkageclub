'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/forms/Slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  PlayCircle,
  SkipBack,
  SkipForward,
  Bookmark,
  CheckCircle,
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
  subtitles?: Array<{
    src: string;
    label: string;
    srclang: string;
  }>;
  qualities?: Array<{
    label: string;
    src: string;
    bitrate?: number;
  }>;
  nextVideo?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  prevVideo?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  onNext?: () => void;
  onPrevious?: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
  completed?: boolean;
  notes?: Array<{
    timestamp: number;
    note: string;
  }>;
  onAddNote?: (timestamp: number, note: string) => void;
}

export function VideoPlayer({
  src,
  title: _title,
  thumbnail,
  duration: _totalDuration,
  onProgress,
  onComplete,
  autoplay = false,
  subtitles = [],
  qualities = [],
  nextVideo,
  prevVideo,
  onNext,
  onPrevious,
  bookmarked = false,
  onBookmark,
  completed = false,
  notes: _notes = [],
  onAddNote,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(qualities[0]?.src || src);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(0);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.((video.currentTime / video.duration) * 100);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleProgress = () => {
      setBuffered(video.buffered);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('progress', handleProgress);
    };
  }, [onProgress, onComplete]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (autoplay) {
      videoRef.current?.play();
    }
  }, [autoplay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleQualityChange = (qualitySrc: string) => {
    const video = videoRef.current;
    if (!video) return;

    const wasPlaying = !video.paused;

    setSelectedQuality(qualitySrc);
    
    // In a real implementation, you would change the video source
    // and resume playback at the same time
    if (wasPlaying) {
      video.play();
    }
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const timestamp = Math.floor(currentTime);
    onAddNote?.(timestamp, noteText);
    setNoteText('');
    setShowNoteInput(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getBufferedProgress = () => {
    if (!buffered || buffered.length === 0 || duration === 0) return 0;
    
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
        return (buffered.end(i) / duration) * 100;
      }
    }
    return 0;
  };

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <Card
      ref={containerRef}
      className="relative overflow-hidden border border-white/10 bg-charcoal-950 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={selectedQuality}
        poster={thumbnail}
        className="aspect-video w-full bg-charcoal-950"
        onClick={togglePlay}
      >
        <track kind="captions" />
      </video>

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="relative mb-2">
          {/* Buffered Progress */}
          <div
            className="absolute h-1 bg-card/30 rounded-full"
            style={{ width: `${getBufferedProgress()}%` }}
          />
          
          {/* Playback Progress */}
          <Slider
            value={[(currentTime / duration) * 100 || 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="relative z-10"
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-card/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Previous Video */}
            {prevVideo && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-card/20"
                onClick={onPrevious}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
            )}

            {/* Next Video */}
            {nextVideo && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-card/20"
                onClick={onNext}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            )}

            {/* Time Display */}
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume Control */}
            <div className="flex items-center gap-1 group">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-card/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <div className="w-20 hidden group-hover:block">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            {/* Add Note */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-card/20"
              onClick={() => {
                setNoteTimestamp(Math.floor(currentTime));
                setShowNoteInput(true);
              }}
            >
              <Bookmark className="h-5 w-5" />
            </Button>

            {/* Bookmark */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-card/20"
              onClick={onBookmark}
            >
              <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
            </Button>

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-card/20"
                onClick={() => setSelectedSubtitle(
                  selectedSubtitle ? null : subtitles[0].srclang
                )}
              >
                <Subtitles className="h-5 w-5" />
              </Button>
            )}

            {/* Settings */}
            {qualities.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-card/20"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {showSettings && (
                  <Card className="absolute bottom-12 right-0 w-48 border border-white/10 bg-charcoal-900/96 p-2 text-white shadow-xl">
                    <div className="text-sm font-medium mb-2 px-2">Quality</div>
                    {qualities.map((quality) => (
                      <button
                        key={quality.src}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-charcoal-800 ${
                          selectedQuality === quality.src ? 'bg-primary-600' : ''
                        }`}
                        onClick={() => handleQualityChange(quality.src)}
                      >
                        {quality.label}
                        {quality.bitrate && (
                          <span className="text-xs text-charcoal-400 ml-2">
                            {quality.bitrate} kbps
                          </span>
                        )}
                      </button>
                    ))}

                    <div className="text-sm font-medium mt-2 mb-2 px-2">Speed</div>
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-charcoal-800 ${
                          playbackSpeed === speed ? 'bg-primary-600' : ''
                        }`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-card/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Note Input Modal */}
      {showNoteInput && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border border-white/10 bg-card/96 p-4 shadow-2xl dark:bg-charcoal-900/96">
            <h3 className="mb-2 text-lg font-semibold text-charcoal-950 dark:text-white">Add Note at {formatTime(noteTimestamp)}</h3>
            <textarea
              className="mb-2 h-24 w-full rounded-2xl border border-charcoal-200 bg-card px-3 py-2 text-sm text-charcoal-950 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
              placeholder="Enter your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteInput(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Save Note
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Next Video Overlay */}
      {!isPlaying && nextVideo && (
        <div className="absolute bottom-20 right-4 w-64 rounded-2xl border border-white/10 bg-charcoal-950/92 p-3 text-white shadow-xl backdrop-blur">
          <p className="text-xs text-charcoal-400 mb-1">Up Next</p>
          <div className="flex items-center gap-2">
            <div className="w-16 h-9 bg-charcoal-700 rounded flex-shrink-0">
              {nextVideo.thumbnail && (
                <img src={nextVideo.thumbnail} alt={nextVideo.title} className="w-full h-full object-cover rounded" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium line-clamp-2">{nextVideo.title}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full mt-2"
            onClick={onNext}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Play Next
          </Button>
        </div>
      )}

      {/* Completed Badge */}
      {completed && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success-500 px-3 py-1 text-sm font-medium text-white shadow-lg">
          <CheckCircle className="h-4 w-4" />
          Completed
        </div>
      )}
    </Card>
  );
}

// Mini video player for course listings
interface MiniVideoPlayerProps {
  src: string;
  thumbnail?: string;
  duration?: number;
  title?: string;
  onClick?: () => void;
}

export function MiniVideoPlayer({
  src,
  thumbnail,
  duration,
  title,
  onClick,
}: MiniVideoPlayerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-charcoal-900 shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          src={src}
          className="w-full h-full object-cover"
          muted
          loop
          ref={(video) => {
            if (video && isHovered) {
              video.play().catch(() => {});
            } else if (video) {
              video.pause();
            }
          }}
        />
      )}

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Duration Badge */}
      {duration && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
