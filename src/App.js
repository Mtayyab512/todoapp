import React, { useState, useEffect } from 'react';
import './App.scss';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';
import { collection, addDoc, deleteDoc, updateDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseconfig';

function App() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [currentEdit, setCurrentEdit] = useState('');
  const [currentEditedItem, setCurrentEditedItem] = useState({ id: '', title: '', description: '' });

  // Function to load todos from Firestore
  const loadTodos = async () => {
    try {
      const todosCollection = collection(db, 'todos');
      const todosSnapshot = await getDocs(todosCollection);
      const todosList = todosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTodos(todosList);
    } catch (error) {
      console.error('Error fetching todos: ', error);
    }
  };

  useEffect(() => {
    loadTodos(); // Load todos on initial render
  }, []);

  const handleAddTodo = async () => {
    try {
      const newTodoItem = {
        title: newTitle,
        description: newDescription,
      };

      const docRef = await addDoc(collection(db, 'todos'), newTodoItem);
      setTodos(prevTodos => [...prevTodos, { id: docRef.id, ...newTodoItem }]);
      setNewTitle('');
      setNewDescription('');
    } catch (error) {
      console.error('Error adding todo: ', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo: ', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      const todoRef = doc(db, 'todos', id);
      const todoDoc = await getDoc(todoRef);

      if (todoDoc.exists()) {
        const now = new Date();
        const completedOn = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        const completedTodo = {
          ...todoDoc.data(),
          completedOn: completedOn
        };

        await addDoc(collection(db, 'completedTodos'), completedTodo);
        await deleteDoc(todoRef); // Remove from 'todos' collection

        // Update local state: remove from todos and add to completedTodos
        setTodos(prevTodos => prevTodos.map(todo =>
          todo.id === id ? { ...completedTodo } : todo
        ));
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error completing todo: ', error);
    }
  };

  const handleEdit = (id, item) => {
    setCurrentEdit(id);
    setCurrentEditedItem(item);
  };

  const handleUpdateTitle = (value) => {
    setCurrentEditedItem(prev => ({ ...prev, title: value }));
  };

  const handleUpdateDescription = (value) => {
    setCurrentEditedItem(prev => ({ ...prev, description: value }));
  };

  const handleUpdateToDo = async () => {
    try {
      await updateDoc(doc(db, 'todos', currentEdit), {
        title: currentEditedItem.title,
        description: currentEditedItem.description
      });

      // Update local state: update the todo in the todos array
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === currentEdit ? { ...todo, title: currentEditedItem.title, description: currentEditedItem.description } : todo
      ));

      setCurrentEdit('');
    } catch (error) {
      console.error('Error updating todo: ', error);
    }
  };

  return (
    <div className="App">
      <h1>My Todos</h1>

      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="What's the task title?"
            />
          </div>
          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="What's the task description?"
            />
          </div>
          <div className="todo-input-item">
            <button
              type="button"
              onClick={handleAddTodo}
              className="primaryBtn"
            >
              Add
            </button>
          </div>
        </div>

        <div className="btn-area">
          <button
            className={`secondaryBtn ${!isCompleteScreen && 'active'}`}
            onClick={() => setIsCompleteScreen(false)}
          >
            Todo
          </button>
          <button
            className={`secondaryBtn ${isCompleteScreen && 'active'}`}
            onClick={() => setIsCompleteScreen(true)}
          >
            Completed
          </button>
        </div>

        <div className="todo-list">

          {isCompleteScreen === false &&
            todos.filter(todo => !todo.completedOn).map((item) => (
              <div className="todo-list-item" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div>
                  <AiOutlineDelete
                    className="icon"
                    onClick={() => handleDeleteTodo(item.id)}
                    title="Delete?"
                  />
                  <BsCheckLg
                    className="check-icon"
                    onClick={() => handleComplete(item.id)}
                    title="Complete?"
                  />
                  <AiOutlineEdit
                    className="check-icon"
                    onClick={() => handleEdit(item.id, item)}
                    title="Edit?"
                  />
                </div>

              </div>
            ))}

          {isCompleteScreen === true &&
            todos.filter(todo => todo.completedOn).map((item) => (
              <div className="todo-list-item" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p>Completed On: {item.completedOn}</p>
                </div>
              </div>
            ))}

        </div>

        {currentEdit && !isCompleteScreen && (
          <div className="edit__wrapper">
            <input
              type="text"
              value={currentEditedItem.title}
              onChange={e => handleUpdateTitle(e.target.value)}
              placeholder="Update title"
            />
            <input
              type="text"
              value={currentEditedItem.description}
              onChange={e => handleUpdateDescription(e.target.value)}
              placeholder="Update description"
            />
            <button onClick={handleUpdateToDo} className="primaryBtn">Update</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
