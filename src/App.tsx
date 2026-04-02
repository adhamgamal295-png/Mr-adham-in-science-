/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Grades from './components/Grades';
import Exams from './components/Exams';
import { motion } from 'motion/react';
import { ArrowLeft, Microscope, Atom, FlaskConical, BarChart3, Users } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function Home() {
  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = [
    { name: 'Students', path: '/students', icon: Users, color: 'text-blue-600' },
    { name: 'Exams', path: '/exams', icon: Microscope, color: 'text-green-600' },
    { name: 'Grades', path: '/grades', icon: BarChart3, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          <Atom className="w-16 h-16 text-blue-500 animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mr Adham in Science</h1>
        <p className="text-slate-600 mt-2">Track, analyze, and grow scientific minds.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={login} 
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition"
        >
          Login with Google
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={item.path} className="block bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
                <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
                <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
                <p className="text-slate-500 mt-1">Manage your {item.name.toLowerCase()} data.</p>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      setStudents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'students'), { name, class: className });
      setName('');
      setClassName('');
      fetchStudents();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    }
  };

  return (
    <div className="p-4">
      <Link to="/" className="flex items-center text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Home
      </Link>
      <h1 className="text-2xl font-bold">Students</h1>
      <form onSubmit={addStudent} className="my-4 p-4 border rounded">
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 mr-2" required />
        <input type="text" placeholder="Class" value={className} onChange={e => setClassName(e.target.value)} className="border p-2 mr-2" required />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">Add Student</button>
      </form>
      <ul>
        {students.map((s) => <li key={s.id}>{s.name} - {s.class}</li>)}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/grades" element={<Grades />} />
      </Routes>
    </Router>
  );
}
