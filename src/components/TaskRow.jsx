import { formatDate, isoToDateInputValue, dateInputValueToIso } from "../utils/dateUtils";

export default function TaskRow({
  task,
  onToggle,
  onDelete,
  onUpdateDueDate,
  draggable,
  isDragging,
  isDragBefore,
  isDragAfter,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) {
  function handleDueDateChange(e) {
    if (!e.target.value) return;
    onUpdateDueDate(task.id, dateInputValueToIso(e.target.value));
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.name}"?`)) {
      onDelete(task.id);
    }
  }

  const dropStyle =
    isDragBefore
      ? { boxShadow: "inset 0 2px 0 0 #3b82f6" }
      : isDragAfter
      ? { boxShadow: "inset 0 -2px 0 0 #3b82f6" }
      : undefined;

  return (
    <tr
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={dropStyle}
      className={`border-b border-gray-100 transition-colors${
        isDragging
          ? " opacity-40 bg-blue-50"
          : isDragBefore || isDragAfter
          ? " bg-blue-50"
          : " hover:bg-gray-50"
      }`}
    >
      {/* Priority */}
      <td className="py-3 px-4 text-sm text-gray-400 tabular-nums whitespace-nowrap">
        {draggable && (
          <span className="mr-1.5 text-gray-300 cursor-grab select-none">
            ⠿
          </span>
        )}
        {task.priority}
      </td>

      {/* Checkbox + Task Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task.id)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <span
            className={`text-sm ${
              task.done ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {task.name}
          </span>
        </div>
      </td>

      {/* Date Added */}
      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
        {formatDate(task.dateAdded)}
      </td>

      {/* Date Due */}
      <td className="py-3 px-4">
        <input
          type="date"
          value={isoToDateInputValue(task.dateDue)}
          onChange={handleDueDateChange}
          className="text-sm text-gray-700 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </td>

      {/* Date Done */}
      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
        {task.dateDone ? formatDate(task.dateDone) : "—"}
      </td>

      {/* Delete */}
      <td className="py-3 px-4 text-right">
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
          aria-label="Delete task"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
