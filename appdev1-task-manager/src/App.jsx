import { useEffect, useState } from 'react'
import './App.css'
import { db } from './firebase'
//these are the following functions that will be used:
import { collection, doc, getDocs, deleteDoc, addDoc, updateDoc, getDoc } from "firebase/firestore";

function App() {

  //STATE FOR FETCHING TASKS
  const [tasks, setTasks] = useState([]);

  //STATE FOR ADDING TASKS
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  //FETCHING THE DOCUMENTS FROM THE COLLECTION
  //DEFINE THE FUNCTION 'fetchTasks', it must be an asynchronus function
  const fetchTasks = async () => {
    //get the reference for the selected collection
    const collectionRef = collection(db, 'tasks');
    //get the snapshot of the selected collection
    const querySnapshot = await getDocs(collectionRef);

    //map all the tasks and get their respective id, to be used in the tasks so they can have a unique identifier
    const tasks = querySnapshot.docs.map((task) => ({
      id: task.id,
      ...task.data() //the rest of the data
    }))
    //call the setTasks variable to set the tasks fetch, loaded later at the bottom
    setTasks(tasks)
  }

  //CALL THE FUNCTION USING useEffect
  useEffect(() => {
    fetchTasks();
  }, []);

  //FUNCTION THAT DELETES DOC FROM THE FIRESTORE
  //CREATE A FUNCTION NAMED 'deleteTask'
  const deleteTask = async (id) => {

    //call the document reference, since we want to delete a specific task
    const docRef = doc(db, 'tasks', id)
    //use deleteDoc and insert docRef as parameter to the function to delete the selected task
    await deleteDoc(docRef)

    //Reflecting changes in user perspective
    setTasks((prevTasks) => prevTasks.filter(task => task.id !== id))
  }

  //ADDING TASK FUNCTION AND REFLECTING TO USER PERSPECTIVE
  const addTask = async (e) => {
    //USE THIS TO PREVENT BROWSER REFRESH
    e.preventDefault();
    //call the collection
    const collectionRef = collection(db, 'tasks');
    //use the addDoc function that has 2 parameters, collection reference and the content that you want to add
    await addDoc(collectionRef, {
      title: title,
      body: body,
      status: 'pending'
    })
    //call the setTitle and setBody with empty parameters to clear the input line
    setTitle('')
    setBody('')
    alert('Task added')
  }

  //CHANGING FIELD STATUS
  //create a function called 'handleStatus'
  const handleStatus = async (id) => {
    try {
      const itemRef = doc(db, 'tasks', id);
      const currentTask = await getDoc(itemRef);
      const currentStatus = currentTask.data().status;
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

      await updateDoc(itemRef, {
        status: newStatus,
      });

      
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );
    
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <>

      <div className="formStyle">
        <h3>Add Task</h3>
        <form onSubmit={addTask}>
          <input type="text" name="title" id="title" placeholder="title" value={title} required onChange={(e) => setTitle(e.target.value)} />
          <textarea name="desc" id="desc" placeholder="description" value={body} required onChange={(e) => setBody(e.target.value)}></textarea>
          <button type="submit" onClick={() => { setTimeout(() => { window.location.reload() }, 1500) }}>Add Task</button>
        </form>
      </div>

      {
        tasks.map((task) => (
          <div key={task.id}>
            <div>
              Task title: {task.title}
            </div>
            <div>
              Task body: {task.body}
            </div>
            <div>
              Task status
              <button onClick={() => {handleStatus(task.id)}}>
                {task.status}
              </button>
            </div>
            <button onClick={() => deleteTask(task.id)}>
              Delete task
            </button>
          </div>

        ))
      }
    </>
  )
}

export default App