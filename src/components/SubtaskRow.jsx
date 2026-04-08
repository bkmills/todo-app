export default function SubtaskRow({
  subtask,
  onToggle,
  onDelete,
  onEditStart,
  onEditCommit,
  onEditCancel,
  isEditing,
  editText,
  onEditChange,
  showDateDone,
}) {
  function handleDelete() {
    if (window.confirm(`Delete "${subtask.name}"?`)) {
      onDelete(subtask.id);
    }
  }

  return (
    <tr className="bg-gray-50">
      <td className="py-2 px-4 text-right text-gray-300 text-sm">↳</td>
      <td className="py-2 px-4 pl-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={subtask.done}
            onChange={() => onToggle(subtask.id)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          {isEditing ? (
            <input
              autoFocus
              value={editText}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditCommit();
                if (e.key === "Escape") onEditCancel();
              }}
              className="flex-1 text-sm px-2 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <span
              className={`text-sm ${
                subtask.done ? "line-through text-gray-400" : "text-gray-600"
              }`}
            >
              {subtask.name}
            </span>
          )}
        </div>
      </td>
      <td className="hidden sm:table-cell py-2 px-4" />
      <td className="py-2 px-4" />
      {showDateDone && <td className="hidden sm:table-cell py-2 px-4" />}
      <td className="py-2 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onEditCommit}
                className="text-green-500 hover:text-green-700 transition-colors text-base leading-none"
                aria-label="Save"
              >
                ✓
              </button>
              <button
                onClick={onEditCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
                aria-label="Cancel edit"
              >
                ×
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEditStart}
                className="text-gray-300 hover:text-blue-500 transition-colors text-sm leading-none"
                aria-label="Edit subtask"
              >
                ✎
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                aria-label="Delete subtask"
              >
                ×
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
