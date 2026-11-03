import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { calculatePercentage } from '../../utils/attendanceCalculator';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Search, Filter, CalendarCheck2, Users } from 'lucide-react';

export const AttendanceHistory = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    searchParams.get('subject') || 'all'
  );
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('records'); // 'records' | 'percentages'

  useEffect(() => {
    const load = async () => {
      try {
        const [subjs, stus, atts] = await Promise.all([
          attendanceService.getSubjects(),
          attendanceService.getStudents(),
          attendanceService.getAttendance(),
        ]);
        setSubjects(subjs);
        setStudents(stus);
        setAttendance(atts);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const mySubjects = subjects.filter(
    (s) => s.faculty_id === profile?.id || !s.faculty_id
  );
  const mySubjectIds = mySubjects.map((s) => s.id);

  const filtered = attendance.filter((r) => {
    if (selectedSubjectId !== 'all') {
      if (r.subject_id !== selectedSubjectId) return false;
    } else {
      if (!mySubjectIds.includes(r.subject_id)) return false;
    }
    if (selectedDate && r.attendance_date !== selectedDate) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance History & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit previous attendance logs and inspect student attendance percentages
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'records'
                ? 'bg-white text-navy-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lecture Logs
          </button>
          <button
            onClick={() => setActiveTab('percentages')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'percentages'
                ? 'bg-white text-navy-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student % Summary
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            >
              <option value="all">All My Assigned Subjects</option>
              {mySubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Lecture Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Tab 1: Detailed Logs */}
      {activeTab === 'records' && (
        <Card title={`Attendance Records (${filtered.length} Entries)`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Enrollment ID</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((record) => {
                  const stu = students.find((s) => s.id === record.student_id);
                  const subj = subjects.find((s) => s.id === record.subject_id);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-medium text-slate-700">
                        {record.attendance_date}
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {stu?.full_name || 'Student'}
                      </td>
                      <td className="py-3 font-mono text-slate-500">
                        {stu?.student_id || '-'}
                      </td>
                      <td className="py-3 font-mono text-navy-800">
                        {subj?.subject_code || record.subject_id}
                      </td>
                      <td className="py-3">
                        <Badge variant={record.status === 'present' ? 'success' : 'danger'}>
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No attendance logs found for the selected filter.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: Student % Summary */}
      {activeTab === 'percentages' && (
        <Card title="Student Attendance Percentage Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Enrollment ID</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Present / Total</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Incentive Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const studentLogs = filtered.filter((r) => r.student_id === student.id);
                  const total = studentLogs.length;
                  const present = studentLogs.filter((r) => r.status === 'present').length;
                  const pct = calculatePercentage(present, total);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-mono font-medium text-slate-700">
                        {student.student_id || '-'}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        {student.full_name}
                      </td>
                      <td className="py-3.5 text-slate-600 font-mono">
                        {present} / {total} lectures
                      </td>
                      <td className="py-3.5 w-48">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={pct} size="sm" colorScheme="auto" />
                          <span className="font-bold text-slate-800 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {pct >= 90 ? (
                          <Badge variant="success">Gold (50 Pts)</Badge>
                        ) : pct >= 75 ? (
                          <Badge variant="warning">Silver (20 Pts)</Badge>
                        ) : (
                          <Badge variant="danger">&lt;75% At Risk</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
