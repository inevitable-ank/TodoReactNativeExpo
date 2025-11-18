import React, { FC, useState, useMemo } from "react";
import { SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Alert, ListRenderItemInfo, View, useWindowDimensions, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Todo, Filter, Priority } from "@/types/todo";
import { useTodos } from "@/hooks/use-todos";
import { TodoItem } from "@/components/todo-item";
import { StatsHeader } from "@/components/stats-header";
import { SearchBar } from "@/components/search-bar";
import { FilterTabs } from "@/components/filter-tabs";
import { AddModal } from "@/components/add-modal";
import { EditModal } from "@/components/edit-modal";
import { EmptyState } from "@/components/empty-state";

const App: FC = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { todos, dispatch } = useTodos();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  const borderColor = useThemeColor(
    { light: "rgba(0,0,0,0.1)", dark: "rgba(255,255,255,0.1)" },
    "icon"
  );

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
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return filtered.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt - a.createdAt;
    });
  }, [todos, filter, searchQuery]);

  const addTodo = (text: string, priority: Priority) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      done: false,
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: "ADD", payload: newTodo });
  };

  const updateTodo = (todo: Todo) => {
    dispatch({ type: "UPDATE", payload: todo });
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
        <View style={[styles.mainLayout, isLandscape && styles.mainLayoutLandscape]}>
          {/* Left Sidebar (Landscape) or Top Section (Portrait) */}
          {isLandscape ? (
            <ScrollView
              style={[
                styles.headerSection,
                styles.headerSectionLandscape,
                { borderRightColor: borderColor }
              ]}
              contentContainerStyle={[
                styles.headerSectionContent,
                { paddingTop: insets.top + 20 }
              ]}
              showsVerticalScrollIndicator={true}
            >
              <StatsHeader todos={todos} />
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
              <FilterTabs filter={filter} onFilterChange={setFilter} />
            </ScrollView>
          ) : (
            <View style={[styles.headerSection, { paddingTop: insets.top + 20 }]}>
              <StatsHeader todos={todos} />
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
              <FilterTabs filter={filter} onFilterChange={setFilter} />
            </View>
          )}

          {/* Todo List Area */}
          <View style={[styles.listContainer, isLandscape && styles.listContainerLandscape]}>
            <FlatList
              data={filteredTodos}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.listContent,
                isLandscape && styles.listContentLandscape,
                isLandscape && { paddingTop: insets.top + 8 },
              ]}
              style={styles.list}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              ListEmptyComponent={
                <EmptyState filter={filter} searchQuery={searchQuery} />
              }
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.fab, isLandscape && styles.fabLandscape]}
          onPress={() => {
            setShowAddModal(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <AddModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addTodo}
        />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainLayout: {
    flex: 1,
    flexDirection: "column",
  },
  mainLayoutLandscape: {
    flexDirection: "row",
  },
  headerSection: {
    flexShrink: 0,
  },
  headerSectionLandscape: {
    width: 320,
    minWidth: 280,
    maxWidth: 360,
    borderRightWidth: 1,
    flex: 0,
  },
  headerSectionContent: {
    paddingRight: 16,
    paddingBottom: 20,
  },
  listContainer: {
    flex: 1,
    minHeight: 0,
  },
  listContainerLandscape: {
    flex: 1,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContentLandscape: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    backgroundColor: "#0a7ea4",
    shadowColor: "#0a7ea4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabLandscape: {
    right: 24,
    bottom: 24,
  },
});
