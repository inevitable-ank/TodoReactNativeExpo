import React, { FC } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Filter } from "@/types/todo";

type FilterTabsProps = {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
};

export const FilterTabs: FC<FilterTabsProps> = ({ filter, onFilterChange }) => {
  const colorScheme = useColorScheme();
  const selectedBgColor = "#0a7ea4";

  return (
    <View style={styles.filterContainer}>
      {(["all", "active", "completed"] as Filter[]).map((f) => {
        const isSelected = filter === f;
        return (
          <TouchableOpacity
            key={f}
            onPress={() => {
              onFilterChange(f);
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
  );
};

const styles = StyleSheet.create({
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
});


