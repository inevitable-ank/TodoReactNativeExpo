import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Filter } from "@/types/todo";

type EmptyStateProps = {
  filter: Filter;
  searchQuery: string;
};

export const EmptyState: FC<EmptyStateProps> = ({ filter, searchQuery }) => {
  const colorScheme = useColorScheme();

  const getMessage = () => {
    if (searchQuery) {
      return "No tasks match your search";
    }
    if (filter === "active") {
      return "No active tasks — great job! 🎉";
    }
    if (filter === "completed") {
      return "No completed tasks yet";
    }
    return "No tasks yet — add one to get started! ✨";
  };

  return (
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
      <ThemedText style={styles.emptyText}>{getMessage()}</ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
});



