import { useState, Fragment } from "react";
import TaskRow from "./TaskRow";
import SubtaskRow from "./SubtaskRow";

const ALL_COLUMNS = [
  { key: "priority", label: "#" },
  { key: "task", label: "Task" },
  { key: "dateAdded", label: "Added", mobileHide: true },
  { key: "dateDue", label: "Due" },
  { key: "dateDone", label: "Done", mobileHide: true, doneOnly: true },
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
  activeTab,
  onToggle,
  onDelete,
  onUpdateDueDate,
  onReorder,
  onAddSubtask,
  onRename,
  emptyMessage,
}) {
  const [sortConfig, setSortConfig] = useState({ column: "priority", direction: "asc" });
  const [draggedId, setDraggedId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [addingSubtaskFor, setAddingSubtaskFor] = useState(null);
  const [subtaskName, setSubtaskName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const columns = ALL_COLUMNS.filter((c) => !c.doneOnly || activeTab === "done");
  const isDragEnabled =
    sortConfig.column === "priority" && sortConfig.direction === "asc";

  // Top-level tasks only, filtered to the active tab
  const topLevel = tasks.filter(
    (t) => !t.parentId && (activeTab === "todo" ? !t.done : t.done)
  );
  const sortedTopLevel = sortTasks(topLevel, sortConfig.column, sortConfig.direction);

  function handleSort(colKey) {
    if (!colKey) return;
    setSortConfig((prev) =>
      prev.column === colKey
        ? { column: colKey, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column: colKey, direction: "asc" }
    );
  }

  function handleDragStart(e, id) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
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
    const dragged = e.dataTransfer.getData("text/plain");
    if (dragged && dragged !== id) {
      if (dragOver?.position === "after") {
        const idx = sortedTopLevel.findIndex((t) => t.id === id);
        const nextId = sortedTopLevel[idx + 1]?.id ?? null;
        onReorder(dragged, nextId);
      } else {
        onReorder(dragged, id);
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

  function handleAddSubtaskSubmit(e, parentId) {
    e.preventDefault();
    if (!subtaskName.trim()) return;
    onAddSubtask(parentId, subtaskName.trim());
    setSubtaskName("");
    setAddingSubtaskFor(null);
  }

  function toggleAddingFor(taskId) {
    if (addingSubtaskFor === taskId) {
      setAddingSubtaskFor(null);
      setSubtaskName("");
    } else {
      setAddingSubtaskFor(taskId);
      setSubtaskName("");
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditText(task.name);
  }

  function commitEdit(id) {
    if (editText.trim()) onRename(id, editText.trim());
    setEditingId(null);
    setEditText("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  // Number of "middle" columns for the subtask input row colSpan
  const subtaskColSpan = columns.length - 2;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key ?? "actions"}
                onClick={() => handleSort(col.key)}
                className={`py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider${
                  col.key ? " cursor-pointer select-none hover:text-gray-700" : ""
                }${col.mobileHide ? " hidden sm:table-cell" : ""}`}
              >
                {col.label}
                {col.key && (
                  <span className="text-gray-400">{getSortIndicator(col.key)}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedTopLevel.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedTopLevel.map((task) => {
              const subtasks = tasks.filter((t) => t.parentId === task.id);
              return (
                <Fragment key={task.id}>
                  <TaskRow
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdateDueDate={onUpdateDueDate}
                    onAddSubtask={() => toggleAddingFor(task.id)}
                    onEditStart={() => startEdit(task)}
                    onEditCommit={() => commitEdit(task.id)}
                    onEditCancel={cancelEdit}
                    isEditing={editingId === task.id}
                    editText={editText}
                    onEditChange={setEditText}
                    showDateDone={activeTab === "done"}
                    draggable={isDragEnabled}
                    isDragging={draggedId === task.id}
                    isDragBefore={dragOver?.id === task.id && dragOver?.position === "before"}
                    isDragAfter={dragOver?.id === task.id && dragOver?.position === "after"}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, task.id)}
                    onDragEnd={handleDragEnd}
                  />
                  {subtasks.map((sub) => (
                    <SubtaskRow
                      key={sub.id}
                      subtask={sub}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEditStart={() => startEdit(sub)}
                      onEditCommit={() => commitEdit(sub.id)}
                      onEditCancel={cancelEdit}
                      isEditing={editingId === sub.id}
                      editText={editText}
                      onEditChange={setEditText}
                      showDateDone={activeTab === "done"}
                    />
                  ))}
                  {addingSubtaskFor === task.id && (
                    <tr className="bg-blue-50">
                      <td className="py-2 px-4 text-right text-gray-300 text-sm">↳</td>
                      <td className="py-2 px-4 pl-6" colSpan={subtaskColSpan}>
                        <form
                          onSubmit={(e) => handleAddSubtaskSubmit(e, task.id)}
                          className="flex items-center gap-2"
                        >
                          <input
                            autoFocus
                            value={subtaskName}
                            onChange={(e) => setSubtaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setAddingSubtaskFor(null);
                                setSubtaskName("");
                              }
                            }}
                            placeholder="Subtask name…"
                            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <button
                            type="submit"
                            disabled={!subtaskName.trim()}
                            className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 transition-colors"
                          >
                            Add
                          </button>
                        </form>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <button
                          onClick={() => {
                            setAddingSubtaskFor(null);
                            setSubtaskName("");
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
                          aria-label="Cancel"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
