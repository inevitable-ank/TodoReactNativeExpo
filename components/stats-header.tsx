import React, { FC, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Todo } from "@/types/todo";
import { calculateStats } from "@/utils/todo-utils";

type StatsHeaderProps = {
  todos: Todo[];
};

export const StatsHeader: FC<StatsHeaderProps> = ({ todos }) => {
  const stats = useMemo(() => calculateStats(todos), [todos]);

  return (
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
  );
};

const styles = StyleSheet.create({
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
});


