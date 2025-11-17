import React, { FC } from "react";
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Todo, Priority } from "@/types/todo";
import { getPriorityColor, getPriorityIcon } from "@/utils/todo-utils";

type TodoItemProps = {
  item: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
};

export const TodoItem: FC<TodoItemProps> = ({
  item,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
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
      <TouchableOpacity
        style={[
          styles.todoItem,
          isLandscape && styles.todoItemLandscape,
          {
            backgroundColor,
            borderColor,
            borderLeftWidth: 4,
            borderLeftColor: priorityColor,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(item.id);
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(item.id);
          }}
          style={[
            styles.checkbox,
            isLandscape && styles.checkboxLandscape,
            {
              backgroundColor: item.done ? priorityColor : "transparent",
              borderColor: priorityColor,
            },
          ]}
        >
          {item.done && <Ionicons name="checkmark" size={isLandscape ? 16 : 18} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.todoContent}>
          <ThemedText style={[styles.todoText, isLandscape && styles.todoTextLandscape, item.done && styles.todoTextDone]}>
            {item.text}
          </ThemedText>
          <View style={[styles.todoMeta, isLandscape && styles.todoMetaLandscape]}>
            <View style={styles.priorityBadge}>
              <Ionicons
                name={getPriorityIcon(item.priority) as any}
                size={isLandscape ? 10 : 12}
                color={priorityColor}
              />
              <ThemedText style={[styles.priorityText, isLandscape && styles.priorityTextLandscape, { color: priorityColor }]}>
                {item.priority.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={[styles.dateText, isLandscape && styles.dateTextLandscape]}>
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
            <Ionicons name="create-outline" size={isLandscape ? 18 : 20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onDelete(item.id);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={isLandscape ? 18 : 20} color="#EF5350" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  todoItemLandscape: {
    padding: 12,
    marginBottom: 8,
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
  checkboxLandscape: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  todoTextLandscape: {
    fontSize: 15,
    marginBottom: 3,
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
  todoMetaLandscape: {
    gap: 8,
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
  priorityTextLandscape: {
    fontSize: 9,
  },
  dateText: {
    fontSize: 11,
    opacity: 0.6,
  },
  dateTextLandscape: {
    fontSize: 10,
  },
  todoActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});


