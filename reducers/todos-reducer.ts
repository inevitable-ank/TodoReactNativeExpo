import { Todo, TodoAction } from "@/types/todo";

export function todosReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      return [action.payload, ...state];
    case "UPDATE":
      return state.map((t) =>
        t.id === action.payload.id ? action.payload : t
      );
    case "TOGGLE":
      return state.map((t) =>
        t.id === action.payload
          ? { ...t, done: !t.done, updatedAt: Date.now() }
          : t
      );
    case "DELETE":
      return state.filter((t) => t.id !== action.payload);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}



