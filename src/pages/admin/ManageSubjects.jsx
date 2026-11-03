import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BookPlus, BookOpen, GraduationCap } from 'lucide-react';

export const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [semester, setSemester] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [sData, fData] = await Promise.all([
        attendanceService.getSubjects(),
        attendanceService.getFaculty(),
      ]);
      setSubjects(sData);
      setFaculty(fData);
      if (fData.length > 0 && !facultyId) {
        setFacultyId(fData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await attendanceService.createSubject({
        subject_name: subjectName,
        subject_code: subjectCode.toUpperCase(),
        faculty_id: facultyId || null,
        semester: Number(semester),
      });
      setIsAddOpen(false);
      setSubjectName('');
      setSubjectCode('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Subjects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic courses, semester associations, and assign professors
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} icon={BookPlus}>
          Add New Subject
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Code</th>
                <th className="pb-3">Subject Name</th>
                <th className="pb-3">Semester</th>
                <th className="pb-3">Assigned Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subj) => {
                const assignedProf = faculty.find((f) => f.id === subj.faculty_id);
                return (
                  <tr key={subj.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono font-bold text-navy-800">
                      {subj.subject_code}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {subj.subject_name}
                    </td>
                    <td className="py-3.5 text-slate-600">
                      Semester {subj.semester}
                    </td>
                    <td className="py-3.5 text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {assignedProf?.full_name || 'Unassigned'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Academic Subject">
        <form onSubmit={handleAddSubject} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Distributed Consensus Algorithms"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="CS405"
                className="w-full uppercase font-mono px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assign Faculty Instructor</label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.full_name} ({f.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Create Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
