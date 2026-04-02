import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Exams() {
  const [exams, setExams] = useState<any[]>([]);
  const [examName, setExamName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('4');
  const [totalMarks, setTotalMarks] = useState(0);

  const fetchExams = async () => {
    const querySnapshot = await getDocs(query(collection(db, 'exams'), orderBy('grade_level')));
    setExams(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const addExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'exams'), { 
      exam_name: examName, 
      grade_level: Number(gradeLevel), 
      total_marks: Number(totalMarks) 
    });
    setExamName('');
    setTotalMarks(0);
    fetchExams();
  };

  return (
    <div className="p-4">
      <Link to="/" className="flex items-center text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Home
      </Link>
      <h1 className="text-2xl font-bold mb-4">Exams</h1>
      <form onSubmit={addExam} className="my-4 p-4 border rounded bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Exam Name" value={examName} onChange={e => setExamName(e.target.value)} className="border p-2 rounded" required />
          <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="border p-2 rounded">
            {[4, 5, 6, 7, 8, 9].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <input type="number" placeholder="Total Marks" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className="border p-2 rounded" required />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="bg-green-600 text-white p-2 rounded w-full shadow-md hover:shadow-lg transition"
        >
          Add Exam
        </motion.button>
      </form>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2">Grade</th>
            <th className="border p-2">Exam Name</th>
            <th className="border p-2">Total Marks</th>
          </tr>
        </thead>
        <tbody>
          {exams.map(e => (
            <tr key={e.id}>
              <td className="border p-2 text-center">{e.grade_level}</td>
              <td className="border p-2">{e.exam_name}</td>
              <td className="border p-2 text-center">{e.total_marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
