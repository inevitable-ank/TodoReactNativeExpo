import React, { FC, useEffect, useState } from "react";
import { Modal, Pressable, TextInput, View, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Todo, Priority } from "@/types/todo";
import { PrioritySelector } from "./priority-selector";

type EditModalProps = {
  visible: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSave: (todo: Todo) => void;
};

export const EditModal: FC<EditModalProps> = ({ visible, todo, onSave, onClose }) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    if (todo) {
      setText(todo.text);
      setPriority(todo.priority);
    }
  }, [todo]);

  const handleSave = () => {
    if (!todo || !text.trim()) return;
    onSave({
      ...todo,
      text: text.trim(),
      priority,
      updatedAt: Date.now(),
    });
    onClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Edit Task
          </ThemedText>

          <TextInput
            style={[
              styles.modalInput,
              { color: textColor, borderColor: Colors[colorScheme ?? "light"].icon },
            ]}
            placeholder="Task description..."
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />

          <ThemedText style={styles.modalLabel}>Priority</ThemedText>
          <PrioritySelector priority={priority} onPriorityChange={setPriority} />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalTitle: {
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0a7ea4",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


