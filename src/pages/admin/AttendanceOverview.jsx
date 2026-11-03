import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { calculatePercentage } from '../../utils/attendanceCalculator';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Calendar, Filter, Search, CheckCircle2, XCircle } from 'lucide-react';

export const AttendanceOverview = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [att, stus, subjs] = await Promise.all([
          attendanceService.getAttendance(),
          attendanceService.getStudents(),
          attendanceService.getSubjects(),
        ]);
        setAttendance(att);
        setStudents(stus);
        setSubjects(subjs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = attendance.filter((rec) => {
    if (selectedSubject !== 'all' && rec.subject_id !== selectedSubject) return false;
    if (selectedDate && rec.attendance_date !== selectedDate) return false;
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) return false;

    if (search) {
      const student = students.find((s) => s.id === rec.student_id);
      const nameMatch = student?.full_name?.toLowerCase().includes(search.toLowerCase());
      const idMatch = student?.student_id?.toLowerCase().includes(search.toLowerCase());
      if (!nameMatch && !idMatch) return false;
    }
    return true;
  });

  const totalFiltered = filtered.length;
  const presentsFiltered = filtered.filter((r) => r.status === 'present').length;
  const filteredPct = calculatePercentage(presentsFiltered, totalFiltered);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Attendance Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive database audit of all daily lecture attendance submissions
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Search Student</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Student name or ID..."
                className="w-full pl-8 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>
        </div>

        {/* Quick summary ribbon */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong>{totalFiltered}</strong> attendance records
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {presentsFiltered} Present ({filteredPct}%)
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-medium">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              {totalFiltered - presentsFiltered} Absent
            </span>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Lecture Date</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Enrollment ID</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 50).map((record) => {
                const student = students.find((s) => s.id === record.student_id);
                const subject = subjects.find((sb) => sb.id === record.subject_id);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-medium text-slate-700">
                      {record.attendance_date}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {student?.full_name || 'Unknown'}
                    </td>
                    <td className="py-3 font-mono text-slate-500">
                      {student?.student_id || '-'}
                    </td>
                    <td className="py-3 text-slate-700">
                      <span className="font-mono font-bold text-navy-800 mr-1.5">
                        {subject?.subject_code || record.subject_id}
                      </span>
                      <span className="text-slate-500">{subject?.subject_name}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={record.status === 'present' ? 'success' : 'danger'}>
                        {record.status === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px] font-mono">
                      {record.created_at ? new Date(record.created_at).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No attendance records found matching the active filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
