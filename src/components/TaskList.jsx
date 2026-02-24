import TaskRow from "./TaskRow";

const COLUMNS = ["Task", "Date Added", "Date Due", "Date Done", ""];

export default function TaskList({ tasks, onToggle, onDelete, onUpdateDueDate, emptyMessage }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="py-12 text-center text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdateDueDate={onUpdateDueDate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
