import { useState, useEffect } from "react";
import { dateInputValueToIso } from "../utils/dateUtils";

const STORAGE_KEY = "tasks";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(name) {
    const now = new Date().toISOString();
    const sevenDaysLater = dateInputValueToIso(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    );
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        done: false,
        dateAdded: now,
        dateDue: sevenDaysLater,
        dateDone: null,
      },
    ]);
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleDone(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nowDone = !t.done;
        return {
          ...t,
          done: nowDone,
          dateDone: nowDone ? new Date().toISOString() : null,
        };
      })
    );
  }

  function updateDueDate(id, isoDate) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dateDue: isoDate } : t))
    );
  }

  return { tasks, addTask, deleteTask, toggleDone, updateDueDate };
}
