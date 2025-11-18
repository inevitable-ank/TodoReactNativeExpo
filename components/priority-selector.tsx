import React, { FC } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Priority } from "@/types/todo";
import { getPriorityColor, getPriorityIcon } from "@/utils/todo-utils";

type PrioritySelectorProps = {
  priority: Priority;
  onPriorityChange: (priority: Priority) => void;
};

export const PrioritySelector: FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
}) => {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.prioritySelector}>
      {(["low", "medium", "high"] as Priority[]).map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => {
            onPriorityChange(p);
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
  );
};

const styles = StyleSheet.create({
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
});



