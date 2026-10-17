#!/usr/bin/env node
import { addTodo, listTodos, removeTodo, setTodoStatus } from "./store.js";

function printHelp(): void {
  console.log(`Phase 1 — JSON Todo CLI

Usage:
  pnpm cli:phase-01 list
  pnpm cli:phase-01 add "<title>"
  pnpm cli:phase-01 done <id>
  pnpm cli:phase-01 pending <id>
  pnpm cli:phase-01 remove <id>
`);
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "list": {
      const todos = await listTodos();
      if (todos.length === 0) {
        console.log("No todos yet. Add one with: pnpm cli:phase-01 add \"Buy milk\"");
        return;
      }
      for (const todo of todos) {
        const mark = todo.status === "done" ? "[x]" : "[ ]";
        console.log(`${mark} ${todo.id}  ${todo.title}`);
      }
      return;
    }
    case "add": {
      const title = args.join(" ").trim();
      const todo = await addTodo(title);
      console.log(`Added: ${todo.id} — ${todo.title}`);
      return;
    }
    case "done": {
      const id = args[0];
      if (!id) throw new Error("Missing id");
      const todo = await setTodoStatus(id, "done");
      console.log(`Done: ${todo.title}`);
      return;
    }
    case "pending": {
      const id = args[0];
      if (!id) throw new Error("Missing id");
      const todo = await setTodoStatus(id, "pending");
      console.log(`Pending: ${todo.title}`);
      return;
    }
    case "remove": {
      const id = args[0];
      if (!id) throw new Error("Missing id");
      await removeTodo(id);
      console.log(`Removed: ${id}`);
      return;
    }
    case "help":
    case undefined:
      printHelp();
      return;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
