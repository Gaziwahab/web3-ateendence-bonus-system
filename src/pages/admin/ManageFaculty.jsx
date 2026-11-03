import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { UserPlus, GraduationCap, BookOpen } from 'lucide-react';

export const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [fData, sData] = await Promise.all([
        attendanceService.getFaculty(),
        attendanceService.getSubjects(),
      ]);
      setFaculty(fData);
      setSubjects(sData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await attendanceService.createProfile({
        full_name: name,
        email,
        role: 'faculty',
      });
      setIsAddOpen(false);
      setName('');
      setEmail('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to add faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Faculty</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure faculty accounts authorized to record student daily attendance
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} icon={UserPlus}>
          Add Faculty Member
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Faculty Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Assigned Subjects</th>
                <th className="pb-3">Role Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculty.map((prof) => {
                const assigned = subjects.filter((s) => s.faculty_id === prof.id);
                return (
                  <tr key={prof.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-semibold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      {prof.full_name}
                    </td>
                    <td className="py-3.5 text-slate-600">{prof.email}</td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {assigned.length > 0 ? (
                          assigned.map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono border border-slate-200"
                            >
                              {s.subject_code} ({s.subject_name.substring(0, 18)}...)
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">No assigned subjects</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <Badge variant="primary">Active Faculty</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Faculty Account">
        <form onSubmit={handleAddFaculty} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Vikram Verma"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. prof.verma@college.edu"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Create Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
