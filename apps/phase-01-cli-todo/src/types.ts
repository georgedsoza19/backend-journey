export type TodoStatus = "pending" | "done";

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TodoStore {
  todos: Todo[];
}
