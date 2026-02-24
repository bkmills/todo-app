import { useState } from "react";
import TaskRow from "./TaskRow";

const COLUMNS = [
  { key: "priority", label: "#" },
  { key: "task", label: "Task" },
  { key: "dateAdded", label: "Date Added" },
  { key: "dateDue", label: "Date Due" },
  { key: "dateDone", label: "Date Done" },
  { key: null, label: "" },
];

function sortTasks(tasks, column, direction) {
  return [...tasks].sort((a, b) => {
    let aVal, bVal;
    switch (column) {
      case "priority":
        aVal = a.priority ?? Infinity;
        bVal = b.priority ?? Infinity;
        break;
      case "task":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "dateAdded":
        aVal = a.dateAdded ?? "";
        bVal = b.dateAdded ?? "";
        break;
      case "dateDue":
        aVal = a.dateDue ?? "";
        bVal = b.dateDue ?? "";
        break;
      case "dateDone":
        aVal = a.dateDone ?? "";
        bVal = b.dateDone ?? "";
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdateDueDate,
  onReorder,
  emptyMessage,
}) {
  const [sortConfig, setSortConfig] = useState({
    column: "priority",
    direction: "asc",
  });
  const [draggedId, setDraggedId] = useState(null);
  const [dragOver, setDragOver] = useState(null); // { id, position: 'before'|'after' }

  // Drag-and-drop only makes sense when viewing priority order ascending
  const isDragEnabled =
    sortConfig.column === "priority" && sortConfig.direction === "asc";

  function handleSort(colKey) {
    if (!colKey) return;
    setSortConfig((prev) =>
      prev.column === colKey
        ? { column: colKey, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column: colKey, direction: "asc" }
    );
  }

  function handleDragStart(id) {
    setDraggedId(id);
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (!isDragEnabled || id === draggedId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setDragOver((prev) =>
      prev?.id === id && prev?.position === position ? prev : { id, position }
    );
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(null);
    }
  }

  function handleDrop(e, id) {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      if (dragOver?.position === "after") {
        // Insert after target: find next item in priority-sorted order
        const prioritySorted = [...tasks].sort(
          (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
        );
        const idx = prioritySorted.findIndex((t) => t.id === id);
        const nextId = prioritySorted[idx + 1]?.id ?? null;
        onReorder(draggedId, nextId);
      } else {
        onReorder(draggedId, id);
      }
    }
    setDraggedId(null);
    setDragOver(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOver(null);
  }

  function getSortIndicator(colKey) {
    if (sortConfig.column !== colKey) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  }

  const sortedTasks = sortTasks(tasks, sortConfig.column, sortConfig.direction);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key ?? "actions"}
                onClick={() => handleSort(col.key)}
                className={`py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider${
                  col.key
                    ? " cursor-pointer select-none hover:text-gray-700"
                    : ""
                }`}
              >
                {col.label}
                {col.key && (
                  <span className="text-gray-400">
                    {getSortIndicator(col.key)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedTasks.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="py-12 text-center text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdateDueDate={onUpdateDueDate}
                draggable={isDragEnabled}
                isDragging={draggedId === task.id}
                isDragBefore={
                  dragOver?.id === task.id && dragOver?.position === "before"
                }
                isDragAfter={
                  dragOver?.id === task.id && dragOver?.position === "after"
                }
                onDragStart={() => handleDragStart(task.id)}
                onDragOver={(e) => handleDragOver(e, task.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, task.id)}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
