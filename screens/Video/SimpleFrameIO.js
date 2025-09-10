import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import Svg, { Path } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const COMMENTS_KEY = "frameio_comments";
const DRAWINGS_KEY = "frameio_drawings";

// Frame.io style colors
const drawingColors = [
  "#FF6B6B", "#FF9F43", "#4ECDC4", "#45B7D1", 
  "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF6B35"
];

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `00:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function SimpleFrameIO() {
  // Component lifecycle refs
  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  
  // Video state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  
  // Drawing state
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedColor, setSelectedColor] = useState(drawingColors[0]);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  
  // Video controls state
  const [showVideoControls, setShowVideoControls] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Progress bar width for seeking
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Video ref using expo-av
  const videoRef = useRef(null);

  // Component lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (isMountedRef.current) {
          setVideoError(null);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background, pause video
        if (videoRef.current && isPlaying) {
          try {
            videoRef.current.pauseAsync();
            if (isMountedRef.current) {
              setIsPlaying(false);
            }
          } catch (error) {
            console.log('Error pausing on background:', error);
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    loadSavedData();

    return () => {
      isMountedRef.current = false;
      subscription?.remove();
    };
  }, [isPlaying]);

  // Playback status updates (expo-av)
  const handlePlaybackStatusUpdate = useCallback((status) => {
    if (!isMountedRef.current) return;

    if (status.isLoaded) {
      const dur = status.durationMillis ? status.durationMillis / 1000 : duration;
      const pos = status.positionMillis ? status.positionMillis / 1000 : currentTime;
      setDuration(dur);
      setCurrentTime(pos);
      setIsPlaying(status.isPlaying || false);
      setIsLoading(false);
      setPlayerReady(true);
      setVideoError(null);
    } else if (status.error) {
      console.error('Video error:', status.error);
      setVideoError('Failed to load video. Please check your internet connection.');
      setIsLoading(false);
      setPlayerReady(false);
    }
  }, [duration, currentTime]);

  // Auto-save comments
  useEffect(() => {
    if (comments.length > 0) {
      AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(comments)).catch(console.error);
    }
  }, [comments]);

  // Auto-save drawings
  useEffect(() => {
    if (drawings.length > 0) {
      AsyncStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawings)).catch(console.error);
    }
  }, [drawings]);

  const loadSavedData = async () => {
    try {
      const [savedComments, savedDrawings] = await Promise.all([
        AsyncStorage.getItem(COMMENTS_KEY),
        AsyncStorage.getItem(DRAWINGS_KEY)
      ]);
      
      if (savedComments) {
        const parsed = JSON.parse(savedComments);
        setComments(Array.isArray(parsed) ? parsed : []);
      }
      
      if (savedDrawings) {
        const parsed = JSON.parse(savedDrawings);
        setDrawings(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // Drawing PanResponder
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return isDrawing;
      },
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        return isDrawing;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return isDrawing;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return isDrawing;
      },
      onPanResponderGrant: (evt, gestureState) => {
        if (!isDrawing) return false;
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX},${locationY}`;
        setCurrentPath(newPath);
        console.log('Drawing started at:', locationX, locationY);
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isDrawing) return;
        const { locationX, locationY } = evt.nativeEvent;
        console.log('Drawing move to:', locationX, locationY);
        setCurrentPath(prev => {
          if (!prev) return `M${locationX},${locationY}`;
          const newPath = `${prev} L${locationX},${locationY}`;
          console.log('Updated path:', newPath);
          return newPath;
        });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => {
        return false; // Don't allow termination while drawing
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!isDrawing || !currentPath) return;
        console.log('Drawing completed:', currentPath);
        const newDrawing = {
          id: Date.now(),
          path: currentPath,
          color: selectedColor,
          timestamp: currentTime,
          duration: 5,
        };
        setDrawings(prev => {
          const updated = [...prev, newDrawing];
          console.log('Total drawings:', updated.length);
          return updated;
        });
        setCurrentPath("");
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Handle termination
        if (currentPath) {
          console.log('Drawing terminated:', currentPath);
          const newDrawing = {
            id: Date.now(),
            path: currentPath,
            color: selectedColor,
            timestamp: currentTime,
            duration: 5,
          };
          setDrawings(prev => [...prev, newDrawing]);
        }
        setCurrentPath("");
      },
    }), [isDrawing, currentPath, selectedColor, currentTime]
  );


  // Actions using expo-av methods
  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current || !isMountedRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setVideoError('Playback error occurred');
    }
  }, [isPlaying]);

  const seekToTimestamp = useCallback(async (timestamp) => {
    if (!videoRef.current || timestamp === undefined || !isMountedRef.current) return;
    try {
      const clamped = Math.max(0, Math.min(timestamp, duration));
      await videoRef.current.setPositionAsync(clamped * 1000);
    } catch (error) {
      console.error('Seek error:', error);
      setVideoError('Seek error occurred');
    }
  }, [duration]);

  const skipForward = useCallback(async () => {
    if (!videoRef.current || !isMountedRef.current) return;
    try {
      const newTime = Math.min(currentTime + 10, duration);
      await videoRef.current.setPositionAsync(newTime * 1000);
    } catch (error) {
      console.error('Skip forward error:', error);
    }
  }, [currentTime, duration]);

  const skipBackward = useCallback(async () => {
    if (!videoRef.current || !isMountedRef.current) return;
    try {
      const newTime = Math.max(currentTime - 10, 0);
      await videoRef.current.setPositionAsync(newTime * 1000);
    } catch (error) {
      console.error('Skip backward error:', error);
    }
  }, [currentTime]);

  const handleVideoTap = useCallback(() => {
    if (isDrawing) return;
    setShowVideoControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowVideoControls(false), 3000);
  }, [isDrawing]);

  const addComment = useCallback(() => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: currentTime,
      user: "Museb Akbani",
      createdAt: new Date().toISOString(),
      number: comments.length + 1,
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment("");
    setShowCommentInput(false);
  }, [newComment, currentTime, comments.length]);

  const deleteComment = useCallback((commentId) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedComments = comments.filter(c => c.id !== commentId);
            setComments(updatedComments);
            if (updatedComments.length === 0) {
              AsyncStorage.removeItem(COMMENTS_KEY);
            } else {
              AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));
            }
          }
        }
      ]
    );
  }, [comments]);

  const toggleDrawingMode = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    const newDrawingState = !isDrawing;
    setIsDrawing(newDrawingState);
    setShowDrawingTools(!showDrawingTools);
    
    // Hide video controls when entering drawing mode
    if (newDrawingState) {
      setShowVideoControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    
    // Don't auto-pause video when entering drawing mode
    // Let user control play/pause manually
  }, [isDrawing, showDrawingTools]);

  const getCurrentDrawings = useCallback(() => {
    const visibleDrawings = drawings.filter(drawing => {
      const drawingStart = drawing.timestamp;
      const drawingEnd = drawing.timestamp + (drawing.duration || 5);
      const isVisible = currentTime >= drawingStart && currentTime <= drawingEnd;
      return isVisible;
    });
    
    // Debug log when drawings are visible
    if (visibleDrawings.length > 0) {
      console.log(`Showing ${visibleDrawings.length} drawings at time ${currentTime.toFixed(2)}`);
    }
    
    return visibleDrawings;
  }, [drawings, currentTime]);

  const clearDrawings = useCallback(() => {
    Alert.alert(
      "Clear Drawings",
      "Remove all drawings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setDrawings([]);
            setCurrentPath("");
            AsyncStorage.removeItem(DRAWINGS_KEY);
          }
        }
      ]
    );
  }, []);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper}>
          {/* Video content */}
          {videoError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{videoError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => {
                  setVideoError(null);
                  setIsLoading(true);
                  setPlayerReady(false);
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.videoContentWrapper}>
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: VIDEO_URL }}
                shouldPlay={false}
                isLooping={false}
                resizeMode="contain"
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#4ade80" />
                  <Text style={styles.loadingText}>Loading video...</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Drawing Overlay */}
          <Svg style={styles.drawingOverlay} width="100%" height="100%">
            {getCurrentDrawings().map((drawing) => (
              <Path
                key={drawing.id}
                d={drawing.path}
                stroke={drawing.color}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={selectedColor}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
          
          {/* Drawing capture area - only when drawing is active */}
          {isDrawing && (
            <View 
              style={styles.drawingCaptureArea}
              {...panResponder.panHandlers}
            />
          )}
          
          {/* Tap handler overlay for non-drawing mode (hide while controls visible) */}
          {!isDrawing && !showVideoControls && (
            <TouchableOpacity 
              style={styles.tapOverlay}
              onPress={handleVideoTap}
              activeOpacity={0}
            />
          )}

          {/* Comment Markers */}
          <View style={styles.timelineMarkers} pointerEvents="box-none">
            {comments.map((comment) => {
              const left = duration > 0 ? `${(comment.timestamp / duration) * 100}%` : "0%";
              return (
                <TouchableOpacity
                  key={comment.id}
                  style={[styles.commentMarker, { left }]}
                  onPress={() => seekToTimestamp(comment.timestamp)}
                >
                  <View style={styles.commentMarkerDot}>
                    <Text style={styles.commentMarkerText}>C</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Video Controls Overlay */}
          {showVideoControls && !isDrawing && (
            <View style={styles.videoControlsOverlay} pointerEvents="box-none">
              <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
                <Text style={styles.skipButtonText}>⏪</Text>
                <Text style={styles.skipButtonLabel}>-10s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.playPauseOverlay} onPress={togglePlayPause}>
                <Text style={styles.playPauseOverlayText}>{isPlaying ? "⏸" : "▶"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
                <Text style={styles.skipButtonText}>⏩</Text>
                <Text style={styles.skipButtonLabel}>+10s</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          
          {/* Progress Bar */}
          <TouchableOpacity 
            style={styles.progressBarContainer}
            onPress={(e) => {
              const { locationX } = e.nativeEvent;
              const width = progressBarWidth || 300;
              const progress = Math.max(0, Math.min(locationX / width, 1));
              const newTime = duration * progress;
              seekToTimestamp(newTime);
            }}
          >
            <View 
              style={styles.progressBar}
              onLayout={(evt) => setProgressBarWidth(evt.nativeEvent.layout.width)}
            >
              <View 
                style={[styles.progressFill, { 
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                }]} 
              />
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.drawButton, isDrawing && styles.drawButtonActive]}
          onPress={toggleDrawingMode}
        >
          <Text style={styles.drawButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Drawing Tools */}
      {showDrawingTools && (
        <View style={styles.drawingToolsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {drawingColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorButton,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.clearButton} onPress={clearDrawings}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comments */}
      <View style={styles.commentsSection}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <TouchableOpacity 
            style={styles.addCommentButton}
            onPress={() => setShowCommentInput(true)}
          >
            <Text style={styles.addCommentButtonText}>+ Comment</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Input */}
        {showCommentInput && (
          <View style={styles.commentInputContainer}>
            <Text style={styles.commentTimestamp}>
              {formatTime(currentTime)}
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Add your comment..."
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              autoFocus
            />
            <View style={styles.commentInputActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCommentInput(false);
                  setNewComment("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.postButton} 
                onPress={addComment}
                disabled={!newComment.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Comments List */}
        <ScrollView style={styles.commentsList}>
          {comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>
                No comments yet. Click + Comment to add one!
              </Text>
            </View>
          ) : (
            comments
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment) => (
                <TouchableOpacity
                  key={comment.id}
                  style={styles.commentItem}
                  onPress={() => seekToTimestamp(comment.timestamp)}
                >
                  <View style={styles.commentHeader}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>CI</Text>
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.userName}>{comment.user}</Text>
                        <View style={styles.commentMetaRight}>
                          <Text style={styles.commentNumber}>#{comment.number}</Text>
                          <TouchableOpacity 
                            style={styles.deleteCommentButton}
                            onPress={() => deleteComment(comment.id)}
                          >
                            <Text style={styles.deleteCommentText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.timestampBadge}
                        onPress={() => seekToTimestamp(comment.timestamp)}
                      >
                        <Text style={styles.timestampText}>
                          {formatTime(comment.timestamp)}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4ade80",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  videoContainer: {
    height: 250,
    backgroundColor: "#000",
    position: "relative",
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  tapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: "auto",
  },
  video: {
    flex: 1,
  },
  videoContentWrapper: {
    flex: 1,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  drawingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: "none",
  },
  drawingCaptureArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    backgroundColor: "transparent",
  },
  timelineMarkers: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    height: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    pointerEvents: "box-none",
  },
  commentMarker: {
    position: "absolute",
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  commentMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  commentMarkerText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  timeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  drawButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  drawButtonActive: {
    backgroundColor: "#6366f1",
  },
  drawButtonText: {
    fontSize: 18,
  },
  drawingToolsContainer: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorButton: {
    borderColor: "#fff",
    borderWidth: 3,
  },
  clearButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  commentsSection: {
    flex: 1,
    backgroundColor: "#2a2a2a",
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  commentsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  addCommentButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addCommentButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  commentInputContainer: {
    backgroundColor: "#3a3a3a",
    margin: 16,
    borderRadius: 8,
    padding: 12,
  },
  commentTimestamp: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: "#4a4a4a",
    borderRadius: 6,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  commentInputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 14,
  },
  postButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyComments: {
    padding: 32,
    alignItems: "center",
  },
  emptyCommentsText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
  commentItem: {
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  commentHeader: {
    flexDirection: "row",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    justifyContent: "space-between",
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  commentNumber: {
    color: "#999",
    fontSize: 12,
  },
  timestampBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  timestampText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  commentText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  // Video controls overlay styles
  videoControlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 4,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  skipButtonLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
  },
  playPauseOverlay: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 35,
    width: 70,
    height: 70,
  },
  playPauseOverlayText: {
    color: "#fff",
    fontSize: 30,
  },
  // Progress bar styles
  timeContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#3a3a3a",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
  },
  // Comment delete button styles
  commentMetaRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteCommentButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteCommentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
