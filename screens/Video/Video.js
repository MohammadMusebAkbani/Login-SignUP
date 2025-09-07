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
  FlatList,
  Modal,
} from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, useVideoPlayer } from "expo-video";
import Svg, { Path } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const COMMENTS_KEY = "video_comments";
const DRAWINGS_KEY = "video_drawings";
const TASKS_KEY = "video_tasks";
const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FF6B35",
];

const taskPriorities = [
  { id: 'low', label: 'Low', color: '#4ECDC4' },
  { id: 'medium', label: 'Medium', color: '#FFEAA7' },
  { id: 'high', label: 'High', color: '#FF6B6B' },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function VideoScreen() {
  // Component lifecycle refs
  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  
  const [comments, setComments] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  
  // Task state
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskFilterModalVisible, setTaskFilterModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedTaskPriority, setSelectedTaskPriority] = useState(taskPriorities[1].id);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskView, setTaskView] = useState("list"); // "list" or "detail"
  const [filteredPriority, setFilteredPriority] = useState("all");
  const [isTaskLoading, setIsTaskLoading] = useState(false);

  // expo-video player with lifecycle management
  const player = useVideoPlayer(VIDEO_URL, (player) => {
    if (isMountedRef.current && appStateRef.current === 'active') {
      try {
        player.loop = false;
        setPlayerReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error configuring player:', error);
        if (isMountedRef.current) {
          setIsLoading(false);
          setPlayerReady(false);
        }
      }
    }
  });

  // Component lifecycle management and data loading
  useEffect(() => {
    isMountedRef.current = true;
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        // App is going to background, pause video
        if (player && playerReady) {
          try {
            player.pause();
          } catch (error) {
            console.log('Error pausing on background:', error);
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    (async () => {
      try {
        setIsTaskLoading(true);
        const savedComments = await AsyncStorage.getItem(COMMENTS_KEY);
        const savedDrawings = await AsyncStorage.getItem(DRAWINGS_KEY);
        const savedTasks = await AsyncStorage.getItem(TASKS_KEY);
        
        if (savedComments && isMountedRef.current) setComments(JSON.parse(savedComments));
        if (savedDrawings && isMountedRef.current) setDrawings(JSON.parse(savedDrawings));
        if (savedTasks && isMountedRef.current) setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMountedRef.current) {
          Alert.alert('Error', 'Failed to load saved data');
        }
      } finally {
        if (isMountedRef.current) {
          setIsTaskLoading(false);
        }
      }
    })();
    
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

  // Save comments to AsyncStorage
  useEffect(() => {
    if (comments.length > 0) {
      AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    }
  }, [comments]);

  // Save drawings to AsyncStorage
  useEffect(() => {
    if (drawings.length > 0) {
      AsyncStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawings));
    }
  }, [drawings]);

  // PanResponder for drawing
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
          };
          setDrawings((prev) => [...prev, newDrawing]);
          setCurrentPath("");
        },
      }),
    [isDrawing, currentPath, selectedColor, currentTime]
  );

  // Add new comment
  const addComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      timestamp: currentTime,
      user: "User",
      time: new Date().toLocaleTimeString(),
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  // Seek video to comment timestamp with safety checks
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

  // Clear all drawings
  const clearDrawings = () => {
    setDrawings([]);
    setCurrentPath("");
  };

  // Task management functions
  const openNewTaskModal = () => {
    setSelectedTask(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setSelectedTaskPriority(taskPriorities[1].id);
    setTaskModalVisible(true);
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setTaskView("detail");
    // If task has timestamp, seek to it
    if (task.timestamp !== undefined) {
      seekToTimestamp(task.timestamp);
    }
  };

  const addOrUpdateTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }

    if (selectedTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id ? 
        {
          ...task,
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim(),
          priority: selectedTaskPriority,
          updatedAt: new Date().toISOString(),
        } : task
      );
      setTasks(updatedTasks);
    } else {
      // Add new task
      const newTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: selectedTaskPriority,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: currentTime, // Associate with current video timestamp
      };
      setTasks([...tasks, newTask]);
    }

    // Reset form and close modal
    setTaskModalVisible(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setSelectedTaskPriority(taskPriorities[1].id);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? 
      { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : 
      task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            if (selectedTask && selectedTask.id === taskId) {
              setTaskView("list");
              setSelectedTask(null);
            }
          }
        }
      ]
    );
  };

  const editTask = (task) => {
    setSelectedTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || "");
    setSelectedTaskPriority(task.priority);
    setTaskModalVisible(true);
  };

  const getFilteredTasks = () => {
    if (filteredPriority === "all") return tasks;
    return tasks.filter(task => task.priority === filteredPriority);
  };

  const getPriorityColor = (priorityId) => {
    const priority = taskPriorities.find(p => p.id === priorityId);
    return priority ? priority.color : "#999";
  };

  const getPriorityLabel = (priorityId) => {
    const priority = taskPriorities.find(p => p.id === priorityId);
    return priority ? priority.label : "Unknown";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper} {...panResponder.panHandlers}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
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
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Initializing video...</Text>
            </View>
          )}
          {/* Drawing overlay */}
          <Svg style={styles.drawingOverlay} width="100%" height="100%">
            {drawings
              .filter(
                (drawing) =>
                  Math.abs(drawing.timestamp - currentTime) < 1 // Show drawing at correct time
              )
              .map((drawing) => (
                <Path
                  key={drawing.id}
                  d={drawing.path}
                  stroke={drawing.color}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={selectedColor}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </Svg>
          {/* Comment markers on timeline */}
          <View style={styles.timelineMarkers} pointerEvents="box-none">
            {comments.map((comment) => {
              const left = duration
                ? `${(comment.timestamp / duration) * 100}%`
                : "0%";
              return (
                <TouchableOpacity
                  key={comment.id}
                  style={[styles.marker, { left }]}
                  onPress={() => seekToTimestamp(comment.timestamp)}
                >
                  <View style={styles.markerDot} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <TouchableOpacity 
            style={styles.taskButton}
            onPress={() => setTaskView(taskView === "list" ? "list" : "list")}
          >
            <FontAwesome5 name="tasks" size={18} color="#fff" />
            <Text style={styles.taskButtonText}>Tasks</Text>
            {tasks.filter(t => !t.completed).length > 0 && (
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>
                  {tasks.filter(t => !t.completed).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.commentsSection}>
        {taskView === "list" ? (
          <View style={styles.taskSection}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>Tasks</Text>
              <View style={styles.taskActions}>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={() => setTaskFilterModalVisible(true)}
                >
                  <FontAwesome5 name="filter" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addTaskButton}
                  onPress={openNewTaskModal}
                >
                  <FontAwesome5 name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            {isTaskLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
            ) : getFilteredTasks().length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="tasks" size={32} color="#666" />
                <Text style={styles.emptyText}>No tasks found</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={openNewTaskModal}
                >
                  <Text style={styles.emptyButtonText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={getFilteredTasks().sort((a, b) => {
                  // Sort by completed status first, then by priority and creation date
                  if (a.completed !== b.completed) return a.completed ? 1 : -1;
                  
                  // Priority sorting (high -> medium -> low)
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  if (a.priority !== b.priority) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  }
                  
                  // Sort by creation date (newest first)
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })}
                keyExtractor={item => item.id}
                style={styles.taskList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.taskItem, item.completed && styles.taskItemCompleted]}
                    onPress={() => openTaskDetail(item)}
                  >
                    <TouchableOpacity 
                      style={[styles.taskCheckbox, 
                        { borderColor: getPriorityColor(item.priority) },
                        item.completed && { backgroundColor: getPriorityColor(item.priority) }
                      ]}
                      onPress={() => toggleTaskCompletion(item.id)}
                    >
                      {item.completed && <FontAwesome5 name="check" size={12} color="#fff" />}
                    </TouchableOpacity>
                    <View style={styles.taskContent}>
                      <Text 
                        style={[styles.taskItemTitle, item.completed && styles.taskItemTitleCompleted]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text 
                          style={[styles.taskItemDesc, item.completed && styles.taskItemDescCompleted]}
                          numberOfLines={1}
                        >
                          {item.description}
                        </Text>
                      ) : null}
                      <View style={styles.taskMeta}>
                        <View 
                          style={[styles.priorityBadge, 
                            { backgroundColor: getPriorityColor(item.priority) }
                          ]}
                        >
                          <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
                        </View>
                        {item.timestamp !== undefined && (
                          <TouchableOpacity 
                            style={styles.timestampBadge}
                            onPress={() => seekToTimestamp(item.timestamp)}
                          >
                            <FontAwesome5 name="play-circle" size={12} color="#f59e0b" />
                            <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.taskItemMenu}
                      onPress={() => editTask(item)}
                    >
                      <FontAwesome5 name="ellipsis-v" size={16} color="#999" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        ) : taskView === "detail" && selectedTask ? (
          <View style={styles.taskDetailContainer}>
            <View style={styles.taskDetailHeader}>
              <TouchableOpacity 
                style={styles.taskDetailBack}
                onPress={() => setTaskView("list")}
              >
                <FontAwesome5 name="arrow-left" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.taskDetailTitle} numberOfLines={1}>{selectedTask.title}</Text>
              <View style={styles.taskDetailActions}>
                <TouchableOpacity 
                  style={styles.taskDetailAction}
                  onPress={() => editTask(selectedTask)}
                >
                  <FontAwesome5 name="edit" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.taskDetailAction, { marginLeft: 12 }]}
                  onPress={() => deleteTask(selectedTask.id)}
                >
                  <FontAwesome5 name="trash" size={16} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.taskDetailContent}>
              <View style={styles.taskDetailSection}>
                <View style={styles.taskDetailRow}>
                  <View style={styles.taskDetailCol}>
                    <Text style={styles.taskDetailLabel}>Status</Text>
                    <TouchableOpacity 
                      style={styles.taskDetailStatus}
                      onPress={() => toggleTaskCompletion(selectedTask.id)}
                    >
                      <View style={[styles.taskStatusIndicator, 
                        { backgroundColor: selectedTask.completed ? "#4ade80" : "#ff6b6b" }
                      ]} />
                      <Text style={styles.taskStatusText}>
                        {selectedTask.completed ? "Completed" : "Active"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskDetailCol}>
                    <Text style={styles.taskDetailLabel}>Priority</Text>
                    <View style={[styles.priorityBadge, 
                      { backgroundColor: getPriorityColor(selectedTask.priority) }
                    ]}>
                      <Text style={styles.priorityText}>{getPriorityLabel(selectedTask.priority)}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {selectedTask.timestamp !== undefined && (
                <View style={styles.taskDetailSection}>
                  <Text style={styles.taskDetailLabel}>Video Timestamp</Text>
                  <TouchableOpacity 
                    style={styles.taskDetailTimestamp}
                    onPress={() => seekToTimestamp(selectedTask.timestamp)}
                  >
                    <FontAwesome5 name="play-circle" size={16} color="#f59e0b" />
                    <Text style={styles.taskDetailTimestampText}>{formatTime(selectedTask.timestamp)}</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.taskDetailSection}>
                <Text style={styles.taskDetailLabel}>Description</Text>
                {selectedTask.description ? (
                  <Text style={styles.taskDetailDescription}>{selectedTask.description}</Text>
                ) : (
                  <Text style={styles.taskDetailEmpty}>No description provided</Text>
                )}
              </View>
              
              <View style={styles.taskDetailSection}>
                <Text style={styles.taskDetailLabel}>Created</Text>
                <Text style={styles.taskDetailDate}>
                  {new Date(selectedTask.createdAt).toLocaleString()}
                </Text>
                {selectedTask.updatedAt && selectedTask.updatedAt !== selectedTask.createdAt && (
                  <>
                    <Text style={[styles.taskDetailLabel, { marginTop: 8 }]}>Last Updated</Text>
                    <Text style={styles.taskDetailDate}>
                      {new Date(selectedTask.updatedAt).toLocaleString()}
                    </Text>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          <ScrollView style={styles.commentsList}>
          {comments.map((comment) => (
            <TouchableOpacity
              key={comment.id}
              style={styles.commentItem}
              onPress={() => seekToTimestamp(comment.timestamp)}
            >
              <View style={styles.commentHeader}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>
                    {comment.user[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentMeta}>
                    <Text style={styles.userName}>{comment.user}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {formatTime(comment.timestamp)}
                  </Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            </TouchableOpacity>
          })}
        </ScrollView>
        )}

        <View style={styles.addCommentContainer}>
          <Text style={styles.currentTimestamp}>
            {formatTime(currentTime)}
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Leave your comment..."
            placeholderTextColor="#666"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={addComment}>
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.drawingTools}>
          <TouchableOpacity
            style={[
              styles.toolButton,
              isDrawing && styles.activeToolButton,
            ]}
            onPress={() => setIsDrawing(!isDrawing)}
          >
            <Text style={styles.toolText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={clearDrawings}>
            <Text style={styles.toolText}>🗑️</Text>
          </TouchableOpacity>
          <View style={styles.colorPalette}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTask ? "Edit Task" : "New Task"}
              </Text>
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setTaskModalVisible(false)}
              >
                <FontAwesome5 name="times" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.taskInput}
                placeholder="Task title"
                placeholderTextColor="#666"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.taskInput, styles.taskTextarea]}
                placeholder="Task description (optional)"
                placeholderTextColor="#666"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.prioritySelector}>
                {taskPriorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityOption,
                      { backgroundColor: priority.color + '22' },
                      selectedTaskPriority === priority.id && {
                        backgroundColor: priority.color + '44',
                        borderColor: priority.color,
                      },
                    ]}
                    onPress={() => setSelectedTaskPriority(priority.id)}
                  >
                    <View 
                      style={[styles.priorityDot, { backgroundColor: priority.color }]} 
                    />
                    <Text style={styles.priorityOptionText}>{priority.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.videoTimestampSection}>
                <Text style={styles.inputLabel}>Video Timestamp</Text>
                <View style={styles.timestampInfo}>
                  <FontAwesome5 name="clock" size={14} color="#f59e0b" />
                  <Text style={styles.timestampInfoText}>
                    Task will be linked to current video position: {formatTime(currentTime)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setTaskModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addOrUpdateTask}
              >
                <Text style={styles.saveButtonText}>
                  {selectedTask ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Task Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={taskFilterModalVisible}
        onRequestClose={() => setTaskFilterModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setTaskFilterModalVisible(false)}
        >
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>Filter by Priority</Text>
            
            <TouchableOpacity 
              style={[styles.filterOption, filteredPriority === 'all' && styles.filterOptionSelected]}
              onPress={() => {
                setFilteredPriority('all');
                setTaskFilterModalVisible(false);
              }}
            >
              <Text style={styles.filterOptionText}>All Tasks</Text>
              {filteredPriority === 'all' && (
                <FontAwesome5 name="check" size={14} color="#6366f1" />
              )}
            </TouchableOpacity>
            
            {taskPriorities.map(priority => (
              <TouchableOpacity 
                key={priority.id}
                style={[
                  styles.filterOption, 
                  filteredPriority === priority.id && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setFilteredPriority(priority.id);
                  setTaskFilterModalVisible(false);
                }}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View 
                    style={[styles.filterPriorityDot, { backgroundColor: priority.color }]} 
                  />
                  <Text style={styles.filterOptionText}>{priority.label} Priority</Text>
                </View>
                {filteredPriority === priority.id && (
                  <FontAwesome5 name="check" size={14} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  videoContainer: {
    height: 250,
    backgroundColor: "#000",
    position: "relative",
  },
  videoWrapper: { flex: 1, position: "relative" },
  video: { flex: 1 },
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
  controlsContainer: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  timeText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  taskButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3a3a3a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  taskButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  taskBadge: {
    backgroundColor: "#ff6b6b",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  taskBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  commentsSection: { flex: 1, backgroundColor: "#2a2a2a" },
  commentsList: { flex: 1, padding: 16 },
  commentItem: {
    marginBottom: 16,
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    padding: 12,
  },
  commentHeader: { flexDirection: "row" },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  commentContent: { flex: 1 },
  commentMeta: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  userName: { color: "#fff", fontSize: 14, fontWeight: "600", marginRight: 8 },
  commentTime: { color: "#666", fontSize: 12 },
  timestamp: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  commentText: { color: "#fff", fontSize: 14, marginBottom: 8 },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
    backgroundColor: "#2a2a2a",
  },
  currentTimestamp: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "500",
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#3a3a3a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#fff",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#6366f1",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: { color: "#fff", fontSize: 16 },
  drawingTools: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
  },
  toolButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#3a3a3a",
  },
  activeToolButton: { backgroundColor: "#6366f1" },
  toolText: { fontSize: 16 },
  colorPalette: { flexDirection: "row", marginLeft: 8 },
  colorButton: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  selectedColor: { borderWidth: 2, borderColor: "#fff" },
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
  marker: {
    position: "absolute",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f59e0b",
    borderWidth: 2,
    borderColor: "#fff",
  },
  // Task list styles
  taskSection: {
    flex: 1,
    backgroundColor: "#2a2a2a",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  taskTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addTaskButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  taskItemCompleted: {
    opacity: 0.7,
    backgroundColor: "#333",
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskItemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  taskItemTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskItemDesc: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 8,
  },
  taskItemDescCompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  timestampBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timestampText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  taskItemMenu: {
    padding: 8,
  },
  
  // Task detail styles
  taskDetailContainer: {
    flex: 1,
    backgroundColor: "#2a2a2a",
  },
  taskDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  taskDetailBack: {
    padding: 8,
    marginRight: 8,
  },
  taskDetailTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  taskDetailActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskDetailAction: {
    padding: 8,
  },
  taskDetailContent: {
    flex: 1,
    padding: 16,
  },
  taskDetailSection: {
    marginBottom: 24,
  },
  taskDetailRow: {
    flexDirection: "row",
    marginHorizontal: -8,
  },
  taskDetailCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  taskDetailLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
  },
  taskDetailStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3a3a3a",
    borderRadius: 4,
    padding: 8,
  },
  taskStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  taskStatusText: {
    color: "#fff",
    fontSize: 14,
  },
  taskDetailTimestamp: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 4,
    padding: 10,
  },
  taskDetailTimestampText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  taskDetailDescription: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: "#3a3a3a",
    borderRadius: 4,
    padding: 12,
  },
  taskDetailEmpty: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  taskDetailDate: {
    color: "#ccc",
    fontSize: 14,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    width: "90%",
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: 500,
  },
  inputLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
  },
  taskInput: {
    backgroundColor: "#3a3a3a",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    color: "#fff",
    fontSize: 16,
  },
  taskTextarea: {
    height: 100,
    textAlignVertical: "top",
  },
  prioritySelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
    marginHorizontal: 4,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  priorityOptionText: {
    color: "#fff",
    fontSize: 14,
  },
  videoTimestampSection: {
    marginBottom: 16,
  },
  timestampInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    padding: 12,
    borderRadius: 4,
  },
  timestampInfoText: {
    color: "#f59e0b",
    fontSize: 14,
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  
  // Filter modal styles
  filterModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  filterModalContent: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 16,
    width: 250,
    marginRight: 16,
    marginBottom: 16,
  },
  filterModalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  filterOptionSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  filterOptionText: {
    color: "#fff",
    fontSize: 14,
  },
  filterPriorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
});
