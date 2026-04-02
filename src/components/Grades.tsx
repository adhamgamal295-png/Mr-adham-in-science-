import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Grades() {
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');
  const [scores, setScores] = useState({ knowledge: 0, experiment: 0, thinking: 0, analysis: 0, skill4: 0, skill5: 0, skill6: 0, skill7: 0, skill8: 0, skill9: 0 });

  const fetchData = async () => {
    const studentsSnap = await getDocs(collection(db, 'students'));
    setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const examsSnap = await getDocs(collection(db, 'exams'));
    setExams(examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const gradesSnap = await getDocs(query(collection(db, 'grades')));
    setGrades(gradesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateLevel = (total: number) => {
    if (total >= 180) return 'Master Scientist 🌟';
    if (total >= 150) return 'Excellent Scientist 👍';
    if (total >= 120) return 'Good Scientist 🔄';
    if (total >= 80) return 'Developing Scientist 🌱';
    return 'Needs Improvement ⚠️';
  };

  const saveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = scores.knowledge + scores.experiment + scores.thinking + scores.analysis + scores.skill4 + scores.skill5 + scores.skill6 + scores.skill7 + scores.skill8 + scores.skill9;
    const level = calculateLevel(total);
    await addDoc(collection(db, 'grades'), { student_id: studentId, exam_id: examId, ...scores, total, level });
    alert('Grade saved!');
    fetchData();
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';
  const getExamName = (id: string) => exams.find(e => e.id === id)?.exam_name || 'Unknown';

  return (
    <div className="p-4">
      <Link to="/" className="flex items-center text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Home
      </Link>
      <h1 className="text-2xl font-bold mb-4">Enter Grades</h1>
      <form onSubmit={saveGrade} className="my-4 p-4 border rounded bg-white shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <select onChange={e => setStudentId(e.target.value)} className="border p-2 rounded" required>
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select onChange={e => setExamId(e.target.value)} className="border p-2 rounded" required>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-4">
          <input type="number" placeholder="Knowledge" onChange={e => setScores({...scores, knowledge: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Experiment" onChange={e => setScores({...scores, experiment: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Thinking" onChange={e => setScores({...scores, thinking: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Analysis" onChange={e => setScores({...scores, analysis: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Skill 4" onChange={e => setScores({...scores, skill4: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Skill 5" onChange={e => setScores({...scores, skill5: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Skill 6" onChange={e => setScores({...scores, skill6: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Skill 7" onChange={e => setScores({...scores, skill7: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Skill 8" onChange={e => setScores({...scores, skill8: Number(e.target.value)})} className="border p-2 rounded" required />
          <input type="number" placeholder="Skill 9" onChange={e => setScores({...scores, skill9: Number(e.target.value)})} className="border p-2 rounded" required />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded w-full shadow-md hover:shadow-lg transition"
        >
          Save Grade
        </motion.button>
      </form>

      <h2 className="text-xl font-bold mt-8 mb-4">Saved Grades</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2">Student</th>
            <th className="border p-2">Exam</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Level</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(g => (
            <tr key={g.id}>
              <td className="border p-2">{getStudentName(g.student_id)}</td>
              <td className="border p-2">{getExamName(g.exam_id)}</td>
              <td className="border p-2">{g.total}</td>
              <td className="border p-2">{g.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
