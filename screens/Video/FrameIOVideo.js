import React, { useState, useEffect, useMemo, useRef } from "react";
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
  AppState,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, useVideoPlayer } from "expo-video";
import Svg, { Path } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const COMMENTS_KEY = "frameio_comments";
const DRAWINGS_KEY = "frameio_drawings";

// Frame.io style colors for drawing tools
const drawingColors = [
  "#FF6B6B", // Red
  "#FF9F43", // Orange  
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Purple
  "#FF6B35", // Orange Red
  "#2C2C54", // Dark Blue
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centisecs = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}:${centisecs.toString().padStart(2, "0")}`;
}

function getTimeAgo(dateString) {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1d";
  if (diffInDays < 7) return `${diffInDays}d`;
  return commentDate.toLocaleDateString();
}

export default function FrameIOVideo() {
  // Component lifecycle refs
  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  
  // Video state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Expo video player with lifecycle management
  const player = useVideoPlayer(VIDEO_URL, (player) => {
    if (isMountedRef.current && appStateRef.current === 'active') {
      try {
        player.loop = false;
        setPlayerReady(true);
        setIsLoading(false);
        // Don't auto-play, let user control it
      } catch (error) {
        console.error('Error configuring player:', error);
        if (isMountedRef.current) {
          setIsLoading(false);
          setPlayerReady(false);
        }
      }
    }
  });

  // Component lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        // App is going to background, pause video
        if (player && isPlaying && playerReady) {
          try {
            player.pause();
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
      
      // Clean up video player
      if (player) {
        try {
          player.pause();
        } catch (error) {
          console.log('Error cleaning up player:', error);
        }
      }
    };
  }, []);

  // Save comments when they change
  useEffect(() => {
    if (comments.length > 0) {
      AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    }
  }, [comments]);

  // Save drawings when they change
  useEffect(() => {
    if (drawings.length > 0) {
      AsyncStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawings));
    }
  }, [drawings]);

  const loadSavedData = async () => {
    try {
      const savedComments = await AsyncStorage.getItem(COMMENTS_KEY);
      const savedDrawings = await AsyncStorage.getItem(DRAWINGS_KEY);
      
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
      if (savedDrawings) {
        setDrawings(JSON.parse(savedDrawings));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // PanResponder for drawing on video
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isDrawing,
        onMoveShouldSetPanResponder: () => isDrawing,
        onPanResponderGrant: (evt) => {
          if (!isDrawing) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath(`M${locationX},${locationY}`);
        },
        onPanResponderMove: (evt) => {
          if (!isDrawing) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
        },
        onPanResponderRelease: () => {
          if (!isDrawing || !currentPath) return;
          const newDrawing = {
            id: Date.now(),
            path: currentPath,
            color: selectedColor,
            timestamp: currentTime,
            duration: 3, // Show for 3 seconds
          };
          setDrawings((prev) => [...prev, newDrawing]);
          setCurrentPath("");
        },
      }),
    [isDrawing, currentPath, selectedColor, currentTime]
  );

  // Add comment at current timestamp
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: currentTime,
      user: "CAZZ INC",
      createdAt: new Date().toISOString(),
      number: comments.length + 1,
    };
    
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setShowCommentInput(false);
  };

  // Jump to comment timestamp with safety checks
  const seekToTimestamp = (timestamp) => {
    if (player && playerReady && isMountedRef.current && timestamp !== undefined) {
      try {
        player.currentTime = timestamp;
        setCurrentTime(timestamp);
      } catch (error) {
        console.error('Error seeking to timestamp:', error);
      }
    }
  };

  // Toggle play/pause with enhanced safety checks
  const togglePlayPause = () => {
    if (!player || !playerReady || isLoading || !isMountedRef.current || appStateRef.current !== 'active') {
      return;
    }
    
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // Toggle drawing mode with safety checks
  const toggleDrawingMode = () => {
    if (!isMountedRef.current) return;
    
    setIsDrawing(!isDrawing);
    setShowDrawingTools(!showDrawingTools);
    if (!isDrawing) {
      // Pause video when starting to draw
      if (player && playerReady && isPlaying) {
        try {
          player.pause();
          setIsPlaying(false);
        } catch (error) {
          console.error('Error pausing for drawing:', error);
        }
      }
    }
  };

  // Get drawings visible at current time
  const getCurrentDrawings = () => {
    return drawings.filter((drawing) => {
      const timeDiff = Math.abs(drawing.timestamp - currentTime);
      return timeDiff < (drawing.duration || 3);
    });
  };

  // Clear all drawings
  const clearDrawings = () => {
    Alert.alert(
      "Clear Drawings",
      "Are you sure you want to clear all drawings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setDrawings([]);
            setCurrentPath("");
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Video Player Section */}
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper} {...panResponder.panHandlers}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          ) : playerReady ? (
            <Video
              style={styles.video}
              player={player}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
              onTimeUpdate={(status) => {
                if (isMountedRef.current && status?.currentTime) {
                  setCurrentTime(status.currentTime);
                }
              }}
              onLoad={(status) => {
                if (isMountedRef.current && status?.duration) {
                  setDuration(status.duration);
                }
              }}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.loadingText}>Initializing video...</Text>
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
            {/* Current drawing path */}
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

          {/* Comment Markers on Timeline */}
          <View style={styles.timelineMarkers} pointerEvents="box-none">
            {comments.map((comment) => {
              const left = duration
                ? `${(comment.timestamp / duration) * 100}%`
                : "0%";
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
        </View>
      </View>

      {/* Video Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
          <Text style={styles.playPauseText}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
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
          <ScrollView 
            horizontal 
            style={styles.colorPalette}
            showsHorizontalScrollIndicator={false}
          >
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
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <TouchableOpacity 
            style={styles.addCommentButton}
            onPress={() => setShowCommentInput(true)}
          >
            <Text style={styles.addCommentButtonText}>+ Add Comment</Text>
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
              placeholder="Leave your comment..."
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
              <TouchableOpacity style={styles.postButton} onPress={addComment}>
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Comments List */}
        <ScrollView style={styles.commentsList}>
          {comments
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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
                    <Text style={styles.commentTime}>
                      {getTimeAgo(comment.createdAt)}
                    </Text>
                    <Text style={styles.commentNumber}>#{comment.number}</Text>
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
                  <TouchableOpacity style={styles.replyButton}>
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {comments.length === 0 && (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>
                No comments yet. Add a comment to get started!
              </Text>
            </View>
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
  videoContainer: {
    height: 250,
    backgroundColor: "#000",
    position: "relative",
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  video: {
    flex: 1,
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
  drawingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timelineMarkers: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    height: 30,
    flexDirection: "row",
    alignItems: "flex-end",
    pointerEvents: "box-none",
  },
  commentMarker: {
    position: "absolute",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  commentMarkerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  commentMarkerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playPauseText: {
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
  colorPalette: {
    flex: 1,
    marginRight: 12,
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
    minHeight: 80,
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
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  commentTime: {
    color: "#999",
    fontSize: 12,
    marginRight: 8,
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
    marginBottom: 8,
  },
  replyButton: {
    alignSelf: "flex-start",
  },
  replyButtonText: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "500",
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
});
