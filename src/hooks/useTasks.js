import { useState, useEffect } from "react";
import { dateInputValueToIso } from "../utils/dateUtils";

const STORAGE_KEY = "tasks";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    // Migrate: assign per-group priority if any task is missing it
    if (tasks.some((t) => t.priority == null)) {
      let todoP = 1;
      let doneP = 1;
      return tasks.map((t) => ({
        ...t,
        priority: t.priority ?? (t.done ? doneP++ : todoP++),
      }));
    }
    return tasks;
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
    setTasks((prev) => {
      const maxPriority = prev
        .filter((t) => !t.done)
        .reduce((max, t) => Math.max(max, t.priority ?? 0), 0);
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          done: false,
          dateAdded: now,
          dateDue: sevenDaysLater,
          dateDone: null,
          priority: maxPriority + 1,
        },
      ];
    });
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleDone(id) {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const nowDone = !task.done;

      // Assign priority at the end of the destination group
      const maxDestPriority = prev
        .filter((t) => t.id !== id && t.done === nowDone)
        .reduce((max, t) => Math.max(max, t.priority ?? 0), 0);

      // Renumber the source group to close the gap left by the departing task
      const sourceGroup = prev
        .filter((t) => t.id !== id && t.done === task.done)
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      const sourcePriorityMap = new Map(sourceGroup.map((t, i) => [t.id, i + 1]));

      return prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            done: nowDone,
            dateDone: nowDone ? new Date().toISOString() : null,
            priority: maxDestPriority + 1,
          };
        }
        if (sourcePriorityMap.has(t.id)) {
          return { ...t, priority: sourcePriorityMap.get(t.id) };
        }
        return t;
      });
    });
  }

  function updateDueDate(id, isoDate) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dateDue: isoDate } : t))
    );
  }

  function reorderTask(draggedId, targetId) {
    setTasks((prev) => {
      const dragged = prev.find((t) => t.id === draggedId);
      if (!dragged) return prev;

      // Reorder only within the same group (todo or done)
      const group = [...prev]
        .filter((t) => t.done === dragged.done)
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

      const without = group.filter((t) => t.id !== draggedId);

      if (targetId === null) {
        without.push(dragged);
      } else {
        const idx = without.findIndex((t) => t.id === targetId);
        if (idx === -1) {
          without.push(dragged);
        } else {
          without.splice(idx, 0, dragged);
        }
      }

      const priorityMap = new Map(without.map((t, i) => [t.id, i + 1]));
      return prev.map((t) =>
        priorityMap.has(t.id) ? { ...t, priority: priorityMap.get(t.id) } : t
      );
    });
  }

  return { tasks, addTask, deleteTask, toggleDone, updateDueDate, reorderTask };
}
