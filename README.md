# Todo App

**Live demo: [my-second-app-phi.vercel.app](https://my-second-app-phi.vercel.app)** · **[GitHub](https://github.com/bkmills/todo-app)**

A clean, interactive to-do list built with React, Vite, and Tailwind CSS. Tasks persist across sessions via localStorage.

## Features

- Add tasks with a due date defaulting to 7 days out
- **To Do / Done tabs** — checking a task moves it automatically; unchecking moves it back
- Editable due dates per task
- Timestamps for when each task was added and completed
- Delete tasks from either tab
- **Priority column** — tasks are numbered sequentially per tab; remaining tasks renumber automatically when one is completed or deleted
- **Drag-and-drop reordering** — drag any row up or down to reprioritize; grab the ⠿ handle next to the priority number
- **Sortable columns** — click any column header to sort ascending or descending (↑↓); drag-and-drop is available when sorted by priority
- Data persists across page reloads via localStorage

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v3](https://v3.tailwindcss.com/)
- localStorage (no backend required)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── AddTaskForm.jsx   # Controlled input, submits on Enter or button click
│   ├── TabBar.jsx        # Tab navigation with per-tab task counts
│   ├── TaskList.jsx      # Table layout with empty-state handling
│   └── TaskRow.jsx       # Individual task row with inline date editing
├── hooks/
│   └── useTasks.js       # All task state and localStorage persistence
├── utils/
│   └── dateUtils.js      # Date formatting and timezone-safe conversions
└── App.jsx               # Root component, tab state, task filtering
```
