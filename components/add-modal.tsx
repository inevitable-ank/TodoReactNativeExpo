import React, { FC, useState } from "react";
import { Modal, Pressable, TextInput, View, TouchableOpacity, StyleSheet, Keyboard } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Priority } from "@/types/todo";
import { PrioritySelector } from "./priority-selector";

type AddModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (text: string, priority: Priority) => void;
};

export const AddModal: FC<AddModalProps> = ({ visible, onClose, onAdd }) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), priority);
    setText("");
    setPriority("medium");
    onClose();
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClose = () => {
    setText("");
    setPriority("medium");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText type="subtitle" style={styles.modalTitle}>
            New Task
          </ThemedText>

          <TextInput
            style={[
              styles.modalInput,
              { color: textColor, borderColor: Colors[colorScheme ?? "light"].icon },
            ]}
            placeholder="What needs to be done?"
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            onSubmitEditing={handleAdd}
          />

          <ThemedText style={styles.modalLabel}>Priority</ThemedText>
          <PrioritySelector priority={priority} onPriorityChange={setPriority} />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                { backgroundColor: tintColor },
                !text.trim() && styles.disabledButton,
              ]}
              onPress={handleAdd}
              disabled={!text.trim()}
            >
              <ThemedText style={styles.saveButtonText}>Add Task</ThemedText>
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
  disabledButton: {
    opacity: 0.5,
  },
});


