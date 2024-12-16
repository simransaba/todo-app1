import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase.config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaTrash, FaCheck, FaUndo, FaEdit } from 'react-icons/fa'; // Added FaEdit icon
import LoginForm from './components/LoginForm';

function App() {
  // Existing states
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  // New states for editing
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  // Your existing useEffect hooks remain the same
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'todos'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const todoList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Current todos:', todoList);
        setTodos(todoList);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching todos:", error);
        setError('Error fetching todos: ' + error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up todo listener:", error);
      setError('Error setting up todo listener: ' + error.message);
      setLoading(false);
    }
  }, [user]);

  // Your existing addTodo function remains the same
  const addTodo = async (e) => {
    e.preventDefault();
    if (!user || input.trim() === '') {
      console.log('No user or empty input');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'todos'), {
        text: input,
        completed: false,
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      console.log('Successfully added todo with ID:', docRef.id);
      setInput('');
      setError('');
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Error adding todo: ' + error.message);
    }
  };

  // New function to start editing
  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  };

  // New function to cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  // New function to save edited todo
  const saveEdit = async (id) => {
    if (!user || editText.trim() === '') return;

    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        text: editText.trim(),
        lastModified: serverTimestamp()
      });
      setEditId(null);
      setEditText('');
      setError('');
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Error updating todo: ' + error.message);
    }
  };

  // Your existing toggleTodo and deleteTodo functions remain the same
  const toggleTodo = async (id, completed) => {
    if (!user) return;
    
    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        completed: !completed
      });
      setError('');
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Error updating todo: ' + error.message);
    }
  };

  const deleteTodo = async (id) => {
    if (!user) return;
    
    try {
      const todoRef = doc(db, 'todos', id);
      await deleteDoc(todoRef);
      setError('');
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Error deleting todo: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <LoginForm />
          
          {user && (
            <div className="max-w-md mx-auto mt-8">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h1 className="text-3xl font-bold text-center mb-8">Todo List</h1>
                  
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                      {error}
                    </div>
                  )}

                  <form onSubmit={addTodo} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Add a new todo..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                    >
                      Add
                    </button>
                  </form>

                  <div className="mt-6">
                    {todos.length === 0 ? (
                      <p className="text-center text-gray-500">No todos yet. Add one above!</p>
                    ) : (
                      todos.map(todo => (
                        <div
                          key={todo.id}
                          className="flex items-center justify-between p-4 border-b"
                        >
                          {editId === todo.id ? (
                            // Edit mode
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                              />
                              <button
                                onClick={() => saveEdit(todo.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            // Display mode
                            <>
                              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                {todo.text}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(todo)}
                                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => toggleTodo(todo.id, todo.completed)}
                                  className={`p-2 rounded-full ${
                                    todo.completed ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-green-100 hover:bg-green-200'
                                  }`}
                                >
                                  {todo.completed ? <FaUndo /> : <FaCheck />}
                                </button>
                                <button
                                  onClick={() => deleteTodo(todo.id)}
                                  className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;