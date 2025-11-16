import React, { FC } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export const SearchBar: FC<SearchBarProps> = ({ value, onChangeText }) => {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color={Colors[colorScheme ?? "light"].icon}
        style={styles.searchIcon}
      />
      <TextInput
        style={[
          styles.searchInput,
          {
            color: textColor,
            backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
          },
        ]}
        placeholder="Search tasks..."
        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearSearch}
        >
          <Ionicons name="close-circle" size={20} color={textColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
});


