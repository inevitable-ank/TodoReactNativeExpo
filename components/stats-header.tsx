import React, { FC, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Todo } from "@/types/todo";
import { calculateStats } from "@/utils/todo-utils";

type StatsHeaderProps = {
  todos: Todo[];
};

export const StatsHeader: FC<StatsHeaderProps> = ({ todos }) => {
  const stats = useMemo(() => calculateStats(todos), [todos]);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View style={[styles.header, isLandscape && styles.headerLandscape]}>
      <ThemedText type="title" style={[styles.title, isLandscape && styles.titleLandscape]}>
        My Tasks
      </ThemedText>
      <View style={[styles.statsContainer, isLandscape && styles.statsContainerLandscape]}>
        <View style={[styles.statItem, isLandscape && styles.statItemLandscape]}>
          {isLandscape ? (
            <>
              <ThemedText style={[styles.statLabel, isLandscape && styles.statLabelLandscape]}>
                Total
              </ThemedText>
              <ThemedText style={[styles.statValue, isLandscape && styles.statValueLandscape]}>
                {stats.total}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={styles.statValue}>
                {stats.total}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Total
              </ThemedText>
            </>
          )}
        </View>
        <View style={[styles.statItem, isLandscape && styles.statItemLandscape]}>
          {isLandscape ? (
            <>
              <ThemedText style={[styles.statLabel, isLandscape && styles.statLabelLandscape]}>
                Active
              </ThemedText>
              <ThemedText style={[styles.statValue, isLandscape && styles.statValueLandscape, { color: "#4CAF50" }]}>
                {stats.active}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.statValue, { color: "#4CAF50" }]}>
                {stats.active}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Active
              </ThemedText>
            </>
          )}
        </View>
        <View style={[styles.statItem, isLandscape && styles.statItemLandscape]}>
          {isLandscape ? (
            <>
              <ThemedText style={[styles.statLabel, isLandscape && styles.statLabelLandscape]}>
                Done
              </ThemedText>
              <ThemedText style={[styles.statValue, isLandscape && styles.statValueLandscape, { color: "#2196F3" }]}>
                {stats.completionRate}%
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.statValue, { color: "#2196F3" }]}>
                {stats.completionRate}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Done
              </ThemedText>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
  },
  headerLandscape: {
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    marginBottom: 16,
  },
  titleLandscape: {
    marginBottom: 12,
    fontSize: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  statsContainerLandscape: {
    flexDirection: "column",
    paddingVertical: 10,
    gap: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statItemLandscape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statValueLandscape: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  statLabelLandscape: {
    fontSize: 11,
    marginTop: 0,
  },
});


