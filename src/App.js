import React, { useReducer, useEffect, createContext, useContext, useState, useRef, useMemo, useCallback } from 'react';
import './App.css'; // Import the CSS file for styling

const ThemeContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, action.payload];
    case 'UPDATE_TASK':
      return state.map(task => task.id === action.payload.id ? action.payload : task);
    case 'DELETE_TASK':
      return state.filter(task => task.id !== action.payload);
    case 'TOGGLE_TASK':
      return state.map(task => task.id === action.payload ? { ...task, completed: !task.completed } : task);
    default:
      return state;
  }
};

const TaskManagerApp = () => {
  const [tasks, dispatch] = useReducer(taskReducer, [], () => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const titleInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    if (tasks.length > 0) {
      alert('Task list updated');
    }
  }, [tasks]);

  useEffect(() => {
    titleInputRef.current.focus();
    console.log('Title input is focused:', titleInputRef.current === document.activeElement);
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    const newTask = { id: Date.now(), title, description, completed: false };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    setTitle('');
    setDescription('');
  };

  const toggleTask = useCallback((id) => {
    console.log('Toggling task:', id);
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  const deleteTask = useCallback((id) => {
    console.log('Deleting task:', id);
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const editTask = useCallback((id) => {
    const taskToEdit = tasks.find(task => task.id === id);
    if (!taskToEdit) return;
    const newTitle = prompt('Edit Task Title:', taskToEdit.title);
    if (newTitle === null) return; // Cancel if prompt is cancelled
    const newDescription = prompt('Edit Task Description:', taskToEdit.description);
    if (newDescription === null) return;
    dispatch({ type: 'UPDATE_TASK', payload: { ...taskToEdit, title: newTitle, description: newDescription } });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    console.log('Filtering tasks...');
    return tasks.filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'incomplete') return !task.completed;
      return true;
    });
  }, [tasks, filter]);

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="app">
        <header className="app-header">
          <h1>Task Manager</h1>
          <button className="toggle-button" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            required
            ref={titleInputRef}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            required
          />
          <button type="submit">Add Task</button>
        </form>
        <div className="filters">
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active-filter' : ''}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'active-filter' : ''}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('incomplete')}
            className={filter === 'incomplete' ? 'active-filter' : ''}
          >
            Incomplete
          </button>
        </div>
        <ul className="task-list">
          {filteredTasks.map(task => (
            <li key={task.id} className="task-item">
              <button onClick={() => editTask(task.id)} title="Edit Task">
                ✏️
              </button>
              <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </span>
              <span className="task-description">{task.description}</span>
              <button onClick={() => toggleTask(task.id)}>
                {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <TaskManagerApp />
    </ThemeContext.Provider>
  );
};

export default App;
