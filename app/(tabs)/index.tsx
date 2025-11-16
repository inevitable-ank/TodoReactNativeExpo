import React, { FC, useState, useMemo } from "react";
import { SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Alert, ListRenderItemInfo } from "react-native";
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
        <StatsHeader todos={todos} />

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <FilterTabs filter={filter} onFilterChange={setFilter} />

        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState filter={filter} searchQuery={searchQuery} />
          }
        />

        <TouchableOpacity
          style={styles.fab}
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
  listContent: {
    paddingHorizontal: 20,
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
});
