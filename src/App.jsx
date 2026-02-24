import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import AddTaskForm from "./components/AddTaskForm";
import TabBar from "./components/TabBar";
import TaskList from "./components/TaskList";

export default function App() {
  const [activeTab, setActiveTab] = useState("todo");
  const { tasks, addTask, deleteTask, toggleDone, updateDueDate, reorderTask } = useTasks();

  const todoTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const visibleTasks = activeTab === "todo" ? todoTasks : doneTasks;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>

        <AddTaskForm onAdd={addTask} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{ todo: todoTasks.length, done: doneTasks.length }}
          />

          <TaskList
            tasks={visibleTasks}
            onToggle={toggleDone}
            onDelete={deleteTask}
            onUpdateDueDate={updateDueDate}
            onReorder={reorderTask}
            emptyMessage={
              activeTab === "todo"
                ? "No tasks yet — add one above!"
                : "No completed tasks yet."
            }
          />
        </div>
      </div>
    </div>
  );
}
