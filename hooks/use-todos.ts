import { useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo, TodoAction } from "@/types/todo";
import { todosReducer } from "@/reducers/todos-reducer";
import { STORAGE_KEY } from "@/constants/todos";

export function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, []);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Todo[] = JSON.parse(raw);
          dispatch({ type: "SET", payload: parsed });
        }
      } catch (e) {
        console.warn("Failed to load todos", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (e) {
        console.warn("Failed to save todos", e);
      }
    };
    save();
  }, [todos]);

  return { todos, dispatch };
}



