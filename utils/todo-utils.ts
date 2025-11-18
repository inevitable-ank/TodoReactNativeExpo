import { Priority } from "@/types/todo";

export const getPriorityColor = (priority: Priority, isDark: boolean): string => {
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

export const getPriorityIcon = (priority: Priority): string => {
  return {
    low: "arrow-down",
    medium: "remove",
    high: "arrow-up",
  }[priority];
};

export const calculateStats = (todos: Array<{ done: boolean }>) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.done).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, active, completionRate };
};



