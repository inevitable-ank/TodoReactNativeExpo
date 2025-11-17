import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTodos } from '@/hooks/use-todos';
import { Todo, Priority } from '@/types/todo';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ExploreScreen() {
  const { todos } = useTodos();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();
  const cardBackground = useThemeColor(
    { light: '#f5f5f5', dark: '#2a2a2a' },
    'background'
  );

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.done).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority breakdown
    const priorityCounts = todos.reduce(
      (acc, todo) => {
        acc[todo.priority] = (acc[todo.priority] || 0) + 1;
        return acc;
      },
      {} as Record<Priority, number>
    );

    // Completion by priority
    const priorityCompletion = todos.reduce(
      (acc, todo) => {
        if (!acc[todo.priority]) {
          acc[todo.priority] = { total: 0, completed: 0 };
        }
        acc[todo.priority].total++;
        if (todo.done) {
          acc[todo.priority].completed++;
        }
        return acc;
      },
      {} as Record<Priority, { total: number; completed: number }>
    );

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentTodos = todos.filter((t) => t.createdAt >= sevenDaysAgo || t.updatedAt >= sevenDaysAgo);
    const recentCompleted = recentTodos.filter((t) => t.done && t.updatedAt >= sevenDaysAgo).length;

    // Oldest incomplete task
    const incompleteTasks = todos.filter((t) => !t.done);
    const oldestIncomplete = incompleteTasks.length > 0
      ? incompleteTasks.reduce((oldest, current) =>
          current.createdAt < oldest.createdAt ? current : oldest
        )
      : null;

    return {
      total,
      completed,
      active,
      completionRate,
      priorityCounts,
      priorityCompletion,
      recentTodos: recentTodos.length,
      recentCompleted,
      oldestIncomplete,
    };
  }, [todos]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getProductivityTip = () => {
    if (stats.total === 0) {
      return "Start by adding your first task! Every journey begins with a single step.";
    }
    if (stats.completionRate === 100) {
      return "🎉 Amazing! You've completed all your tasks. Time to set new goals!";
    }
    if (stats.active > 10) {
      return "You have many active tasks. Consider breaking them down into smaller, manageable pieces.";
    }
    if (stats.oldestIncomplete) {
      const daysOld = Math.floor((Date.now() - stats.oldestIncomplete.createdAt) / (24 * 60 * 60 * 1000));
      if (daysOld > 7) {
        return `You have a task that's been pending for ${daysOld} days. Maybe it's time to tackle it or remove it?`;
      }
    }
    if (stats.completionRate < 30) {
      return "Try focusing on completing one task at a time. Small wins build momentum!";
    }
    return "Keep up the great work! Consistency is key to productivity.";
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20 },
            isTablet && [
              styles.scrollContentTablet,
              { paddingHorizontal: Math.max(40, (width - 768) / 2 + 40) },
            ],
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Statistics & Insights
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Track your productivity and stay on top of your goals
            </ThemedText>
          </View>

          {/* Overview Stats */}
          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Overview
            </ThemedText>
            <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
              <View style={[styles.statBox, isTablet && styles.statBoxTablet]}>
                <ThemedText style={[styles.statValue, isTablet && styles.statValueTablet]}>
                  {stats.total}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Tasks</ThemedText>
              </View>
              <View style={[styles.statBox, isTablet && styles.statBoxTablet]}>
                <ThemedText style={[styles.statValue, isTablet && styles.statValueTablet, { color: '#4CAF50' }]}>
                  {stats.completed}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Completed</ThemedText>
              </View>
              <View style={[styles.statBox, isTablet && styles.statBoxTablet]}>
                <ThemedText style={[styles.statValue, isTablet && styles.statValueTablet, { color: '#2196F3' }]}>
                  {stats.active}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Active</ThemedText>
              </View>
              <View style={[styles.statBox, isTablet && styles.statBoxTablet]}>
                <ThemedText style={[styles.statValue, isTablet && styles.statValueTablet, { color: '#9C27B0' }]}>
                  {stats.completionRate}%
                </ThemedText>
                <ThemedText style={styles.statLabel}>Done</ThemedText>
              </View>
            </View>
          </View>

          {/* Priority Breakdown */}
          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Priority Distribution
            </ThemedText>
            {(['high', 'medium', 'low'] as Priority[]).map((priority) => {
              const count = stats.priorityCounts[priority] || 0;
              const total = stats.total;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <View key={priority} style={styles.priorityRow}>
                  <View style={styles.priorityInfo}>
                    <Ionicons
                      name={priority === 'high' ? 'flag' : priority === 'medium' ? 'flag-outline' : 'remove'}
                      size={20}
                      color={getPriorityColor(priority)}
                    />
                    <ThemedText style={styles.priorityLabel}>
                      {getPriorityLabel(priority)}
                    </ThemedText>
                  </View>
                  <View style={styles.priorityStats}>
                    <ThemedText style={styles.priorityCount}>{count}</ThemedText>
                    <ThemedText style={styles.priorityPercentage}>{percentage}%</ThemedText>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Completion by Priority */}
          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Completion by Priority
            </ThemedText>
            {(['high', 'medium', 'low'] as Priority[]).map((priority) => {
              const data = stats.priorityCompletion[priority] || { total: 0, completed: 0 };
              const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <View key={priority} style={styles.completionRow}>
                  <View style={styles.completionInfo}>
                    <ThemedText style={styles.completionLabel}>
                      {getPriorityLabel(priority)}
                    </ThemedText>
                    <ThemedText style={styles.completionDetail}>
                      {data.completed} of {data.total} completed
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.completionRate, { color: getPriorityColor(priority) }]}>
                    {rate}%
                  </ThemedText>
                </View>
              );
            })}
          </View>

          {/* Recent Activity */}
          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Recent Activity (7 days)
            </ThemedText>
            <View style={styles.activityRow}>
              <Ionicons name="time-outline" size={20} color="#2196F3" />
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityLabel}>Tasks created/updated</ThemedText>
                <ThemedText style={styles.activityValue}>{stats.recentTodos}</ThemedText>
              </View>
            </View>
            <View style={styles.activityRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityLabel}>Tasks completed</ThemedText>
                <ThemedText style={styles.activityValue}>{stats.recentCompleted}</ThemedText>
              </View>
            </View>
          </View>

          {/* Productivity Tip */}
          <View style={[styles.card, styles.tipCard, { backgroundColor: cardBackground }]}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color="#FFC107" />
              <ThemedText type="subtitle" style={styles.tipTitle}>
                Productivity Tip
              </ThemedText>
            </View>
            <ThemedText style={styles.tipText}>{getProductivityTip()}</ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  scrollContentTablet: {
    paddingHorizontal: 40,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsGridTablet: {
    justifyContent: 'flex-start',
    gap: 16,
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  statBoxTablet: {
    width: '23%',
    marginBottom: 0,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statValueTablet: {
    fontSize: 40,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  priorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priorityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  priorityPercentage: {
    fontSize: 14,
    opacity: 0.6,
    minWidth: 40,
    textAlign: 'right',
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  completionInfo: {
    flex: 1,
  },
  completionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completionDetail: {
    fontSize: 14,
    opacity: 0.6,
  },
  completionRate: {
    fontSize: 24,
    fontWeight: '700',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  tipCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipTitle: {
    marginBottom: 0,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
