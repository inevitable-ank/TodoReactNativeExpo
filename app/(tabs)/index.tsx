import React, { FC, useEffect, useReducer, useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  ListRenderItemInfo,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/* ---------------- Types ---------------- */
type Priority = "low" | "medium" | "high";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
};

type Filter = "all" | "active" | "completed";

type Action =
  | { type: "SET"; payload: Todo[] }
  | { type: "ADD"; payload: Todo }
  | { type: "UPDATE"; payload: Todo }
  | { type: "TOGGLE"; payload: string }
  | { type: "DELETE"; payload: string }
  | { type: "CLEAR" };

const STORAGE_KEY = "@todos_v2";

/* ---------------- Reducer ---------------- */
function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      return [action.payload, ...state];
    case "UPDATE":
      return state.map((t) =>
        t.id === action.payload.id ? action.payload : t
      );
    case "TOGGLE":
      return state.map((t) =>
        t.id === action.payload
          ? { ...t, done: !t.done, updatedAt: Date.now() }
          : t
      );
    case "DELETE":
      return state.filter((t) => t.id !== action.payload);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

/* ---------------- Priority Colors ---------------- */
const getPriorityColor = (priority: Priority, isDark: boolean) => {
  if (isDark) {
    return {
      low: "#4CAF50",
      medium: "#FF9800",
      high: "#F44336",
    }[priority];
  }
  return {
    low: "#66BB6A",
    medium: "#FFA726",
    high: "#EF5350",
  }[priority];
};

const getPriorityIcon = (priority: Priority) => {
  return {
    low: "arrow-down",
    medium: "remove",
    high: "arrow-up",
  }[priority];
};

/* ---------------- Todo Item Component ---------------- */
const TodoItem: FC<{
  item: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}> = ({ item, onToggle, onDelete, onEdit }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#1E1E1E" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#E0E0E0", dark: "#333" },
    "icon"
  );
  const textColor = useThemeColor({}, "text");
  const priorityColor = getPriorityColor(item.priority, isDark);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(item.done ? 0.6 : 1),
      transform: [{ scale: withSpring(item.done ? 0.98 : 1) }],
    };
  });

  return (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutRight.springify()}
      style={animatedStyle}
    >
      <Pressable
        style={[
          styles.todoItem,
          {
            backgroundColor,
            borderColor,
            borderLeftWidth: 4,
            borderLeftColor: priorityColor,
          },
        ]}
        onPress={() => onToggle(item.id)}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(item.id);
          }}
          style={[
            styles.checkbox,
            {
              backgroundColor: item.done ? priorityColor : "transparent",
              borderColor: priorityColor,
            },
          ]}
        >
          {item.done && (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </TouchableOpacity>

        <View style={styles.todoContent}>
          <ThemedText
            style={[
              styles.todoText,
              item.done && styles.todoTextDone,
            ]}
          >
            {item.text}
          </ThemedText>
          <View style={styles.todoMeta}>
            <View style={styles.priorityBadge}>
              <Ionicons
                name={getPriorityIcon(item.priority) as any}
                size={12}
                color={priorityColor}
              />
              <ThemedText
                style={[styles.priorityText, { color: priorityColor }]}
              >
                {item.priority.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.todoActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onEdit(item);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onDelete(item.id);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#EF5350" />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
};

/* ---------------- Edit Modal Component ---------------- */
const EditModal: FC<{
  visible: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSave: (todo: Todo) => void;
}> = ({ visible, todo, onSave, onClose }) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    if (todo) {
      setText(todo.text);
      setPriority(todo.priority);
    }
  }, [todo]);

  const handleSave = () => {
    if (!todo || !text.trim()) return;
    onSave({
      ...todo,
      text: text.trim(),
      priority,
      updatedAt: Date.now(),
    });
    onClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Edit Task
          </ThemedText>

          <TextInput
            style={[
              styles.modalInput,
              { color: textColor, borderColor: Colors[colorScheme ?? "light"].icon },
            ]}
            placeholder="Task description..."
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />

          <ThemedText style={styles.modalLabel}>Priority</ThemedText>
          <View style={styles.prioritySelector}>
            {(["low", "medium", "high"] as Priority[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setPriority(p);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.priorityOption,
                  priority === p && {
                    backgroundColor: getPriorityColor(p, colorScheme === "dark"),
                  },
                ]}
              >
                <Ionicons
                  name={getPriorityIcon(p) as any}
                  size={16}
                  color={priority === p ? "#fff" : textColor}
                />
                <ThemedText
                  style={[
                    styles.priorityOptionText,
                    priority === p && { color: "#fff" },
                  ]}
                >
                  {p.toUpperCase()}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* ---------------- Main App Component ---------------- */
const App: FC = () => {
  const [todos, dispatch] = useReducer(todosReducer, []);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Todo[] = JSON.parse(raw);
          dispatch({ type: "SET", payload: parsed });
        }
      } catch (e) {
        console.warn("Failed to load todos", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (e) {
        console.warn("Failed to save todos", e);
      }
    };
    save();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // Apply filter
    if (filter === "active") {
      filtered = filtered.filter((t) => !t.done);
    } else if (filter === "completed") {
      filtered = filtered.filter((t) => t.done);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter((t) =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by priority and date
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt - a.createdAt;
    });
  }, [todos, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.done).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, completionRate };
  }, [todos]);

  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: "ADD", payload: newTodo });
    setText("");
    setPriority("medium");
    setShowAddModal(false);
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const updateTodo = (todo: Todo) => {
    dispatch({ type: "UPDATE", payload: todo });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTodo = (id: string) => {
    dispatch({ type: "TOGGLE", payload: id });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const deleteTodo = (id: string) =>
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "DELETE", payload: id });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          },
        },
      ],
      { cancelable: true }
    );

  const renderItem = ({ item }: ListRenderItemInfo<Todo>) => (
    <TodoItem
      item={item}
      onToggle={toggleTodo}
      onDelete={deleteTodo}
      onEdit={setEditingTodo}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            My Tasks
          </ThemedText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
              <ThemedText style={styles.statLabel}>Total</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: "#4CAF50" }]}>
                {stats.active}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Active</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: "#2196F3" }]}>
                {stats.completionRate}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>Done</ThemedText>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors[colorScheme ?? "light"].icon}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: textColor,
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              },
            ]}
            placeholder="Search tasks..."
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearSearch}
            >
              <Ionicons name="close-circle" size={20} color={textColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(["all", "active", "completed"] as Filter[]).map((f) => {
            const isSelected = filter === f;
            const selectedBgColor = colorScheme === "dark" ? "#0a7ea4" : "#0a7ea4";
            return (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  setFilter(f);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.filterTab,
                  isSelected && {
                    backgroundColor: selectedBgColor,
                    shadowColor: selectedBgColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Todo List */}
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.emptyContainer}
            >
              <Ionicons
                name="checkmark-done-circle-outline"
                size={64}
                color={Colors[colorScheme ?? "light"].icon}
              />
              <ThemedText style={styles.emptyText}>
                {searchQuery
                  ? "No tasks match your search"
                  : filter === "active"
                  ? "No active tasks — great job! 🎉"
                  : filter === "completed"
                  ? "No completed tasks yet"
                  : "No tasks yet — add one to get started! ✨"}
              </ThemedText>
            </Animated.View>
          }
        />

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: tintColor }]}
          onPress={() => {
            setShowAddModal(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Add Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowAddModal(false)}
          >
            <Pressable
              style={[styles.modalContent, { backgroundColor }]}
              onPress={(e) => e.stopPropagation()}
            >
              <ThemedText type="subtitle" style={styles.modalTitle}>
                New Task
              </ThemedText>

              <TextInput
                style={[
                  styles.modalInput,
                  { color: textColor, borderColor: Colors[colorScheme ?? "light"].icon },
                ]}
                placeholder="What needs to be done?"
                placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                value={text}
                onChangeText={setText}
                multiline
                autoFocus
                onSubmitEditing={addTodo}
              />

              <ThemedText style={styles.modalLabel}>Priority</ThemedText>
              <View style={styles.prioritySelector}>
                {(["low", "medium", "high"] as Priority[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => {
                      setPriority(p);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.priorityOption,
                      priority === p && {
                        backgroundColor: getPriorityColor(p, colorScheme === "dark"),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getPriorityIcon(p) as any}
                      size={16}
                      color={priority === p ? "#fff" : textColor}
                    />
                    <ThemedText
                      style={[
                        styles.priorityOptionText,
                        priority === p && { color: "#fff" },
                      ]}
                    >
                      {p.toUpperCase()}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddModal(false);
                    setText("");
                    setPriority("medium");
                  }}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    { backgroundColor: tintColor },
                    !text.trim() && styles.disabledButton,
                  ]}
                  onPress={addTodo}
                  disabled={!text.trim()}
                >
                  <ThemedText style={styles.saveButtonText}>Add Task</ThemedText>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Edit Modal */}
        <EditModal
          visible={!!editingTodo}
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSave={updateTodo}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default App;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  todoTextDone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 11,
    opacity: 0.6,
  },
  todoActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalTitle: {
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.8,
  },
  prioritySelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0a7ea4",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
