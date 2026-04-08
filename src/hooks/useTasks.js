import { useState, useEffect } from "react";
import { dateInputValueToIso } from "../utils/dateUtils";

const STORAGE_KEY = "tasks";

function save(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let loaded = raw ? JSON.parse(raw) : [];

      // Migrate: assign per-group priority if any task is missing it
      if (loaded.some((t) => t.priority == null && !t.parentId)) {
        let todoP = 1;
        let doneP = 1;
        loaded = loaded.map((t) => ({
          ...t,
          priority: t.priority ?? (t.parentId ? null : t.done ? doneP++ : todoP++),
        }));
      }

      // Migrate: add parentId: null to tasks that predate subtask support
      if (loaded.some((t) => !("parentId" in t))) {
        loaded = loaded.map((t) =>
          "parentId" in t ? t : { ...t, parentId: null }
        );
      }

      setTasks(loaded);
    } catch {
      // corrupted storage — start fresh
    }
    setLoading(false);
  }, []);

  async function addTask(name) {
    const now = new Date().toISOString();
    const sevenDaysLater = dateInputValueToIso(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );
    const maxPriority = tasks
      .filter((t) => !t.done && !t.parentId)
      .reduce((max, t) => Math.max(max, t.priority ?? 0), 0);
    const newTask = {
      id: crypto.randomUUID(),
      name,
      done: false,
      parentId: null,
      dateAdded: now,
      dateDue: sevenDaysLater,
      dateDone: null,
      priority: maxPriority + 1,
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    save(nextTasks);
  }

  async function addSubtask(parentId, name) {
    const newTask = {
      id: crypto.randomUUID(),
      name,
      done: false,
      parentId,
      dateAdded: new Date().toISOString(),
      dateDue: null,
      dateDone: null,
      priority: null,
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    save(nextTasks);
  }

  async function deleteTask(id) {
    // Also remove subtasks (no DB cascade in localStorage)
    const nextTasks = tasks.filter((t) => t.id !== id && t.parentId !== id);
    setTasks(nextTasks);
    save(nextTasks);
  }

  async function toggleDone(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.parentId) {
      const nowDone = !task.done;
      const dateDone = nowDone ? new Date().toISOString() : null;
      const nextTasks = tasks.map((t) =>
        t.id === id ? { ...t, done: nowDone, dateDone } : t
      );
      setTasks(nextTasks);
      save(nextTasks);
      return;
    }

    const nowDone = !task.done;
    const maxDestPriority = tasks
      .filter((t) => t.id !== id && t.done === nowDone && !t.parentId)
      .reduce((max, t) => Math.max(max, t.priority ?? 0), 0);
    const sourceGroup = tasks
      .filter((t) => t.id !== id && t.done === task.done && !t.parentId)
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    const sourcePriorityMap = new Map(sourceGroup.map((t, i) => [t.id, i + 1]));
    const newPriority = maxDestPriority + 1;
    const dateDone = nowDone ? new Date().toISOString() : null;

    const nextTasks = tasks.map((t) => {
      if (t.id === id) return { ...t, done: nowDone, dateDone, priority: newPriority };
      if (sourcePriorityMap.has(t.id)) return { ...t, priority: sourcePriorityMap.get(t.id) };
      return t;
    });
    setTasks(nextTasks);
    save(nextTasks);
  }

  async function renameTask(id, name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const nextTasks = tasks.map((t) => (t.id === id ? { ...t, name: trimmed } : t));
    setTasks(nextTasks);
    save(nextTasks);
  }

  async function updateDueDate(id, isoDate) {
    const nextTasks = tasks.map((t) => (t.id === id ? { ...t, dateDue: isoDate } : t));
    setTasks(nextTasks);
    save(nextTasks);
  }

  async function reorderTask(draggedId, targetId) {
    const dragged = tasks.find((t) => t.id === draggedId);
    if (!dragged) return;
    const group = [...tasks]
      .filter((t) => t.done === dragged.done && !t.parentId)
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    const without = group.filter((t) => t.id !== draggedId);
    if (targetId === null) {
      without.push(dragged);
    } else {
      const idx = without.findIndex((t) => t.id === targetId);
      without.splice(idx === -1 ? without.length : idx, 0, dragged);
    }
    const priorityMap = new Map(without.map((t, i) => [t.id, i + 1]));

    const nextTasks = tasks.map((t) =>
      priorityMap.has(t.id) ? { ...t, priority: priorityMap.get(t.id) } : t
    );
    setTasks(nextTasks);
    save(nextTasks);
  }

  return { tasks, loading, addTask, addSubtask, deleteTask, toggleDone, updateDueDate, reorderTask, renameTask };
}
