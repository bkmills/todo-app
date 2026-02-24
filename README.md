# Todo App

A clean, interactive to-do list built with React, Vite, and Tailwind CSS. Tasks persist across sessions via localStorage.

## Features

- Add tasks with a due date defaulting to 7 days out
- **To Do / Done tabs** — checking a task moves it automatically; unchecking moves it back
- Editable due dates per task
- Timestamps for when each task was added and completed
- Delete tasks from either tab
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
