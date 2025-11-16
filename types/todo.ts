export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
};

export type Filter = "all" | "active" | "completed";

export type TodoAction =
  | { type: "SET"; payload: Todo[] }
  | { type: "ADD"; payload: Todo }
  | { type: "UPDATE"; payload: Todo }
  | { type: "TOGGLE"; payload: string }
  | { type: "DELETE"; payload: string }
  | { type: "CLEAR" };


