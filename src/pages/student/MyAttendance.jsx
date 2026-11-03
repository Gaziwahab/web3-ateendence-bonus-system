import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import {
  getStudentOverallAttendance,
  getStudentSubjectWiseAttendance,
} from '../../utils/attendanceCalculator';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
} from 'lucide-react';

export const MyAttendance = () => {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [atts, subjs] = await Promise.all([
          attendanceService.getAttendance(),
          attendanceService.getSubjects(),
        ]);
        setAttendance(atts);
        setSubjects(subjs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overall = getStudentOverallAttendance(profile?.id, attendance);
  const subjectBreakdown = getStudentSubjectWiseAttendance(profile?.id, subjects, attendance);

  const studentLogs = attendance.filter((r) => r.student_id === profile?.id);
  const filteredLogs = studentLogs.filter((r) =>
    selectedSubjectId === 'all' ? true : r.subject_id === selectedSubjectId
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Attendance</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed lecture attendance records and course-wise percentage breakdown
        </p>
      </div>

      {/* Overall Attendance Summary Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 text-white flex flex-col items-center justify-center font-black shadow-md">
            <span className="text-xl leading-none">{overall.percentage}%</span>
            <span className="text-[10px] font-medium text-slate-300">Overall</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {overall.percentage >= 75
                ? 'Great Attendance Standing!'
                : 'Warning: Low Attendance'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              You have attended <strong>{overall.presentLectures}</strong> out of{' '}
              <strong>{overall.totalLectures}</strong> conducted lectures.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overall.rewardInfo.badgeColor}`}>
                {overall.rewardInfo.tier} ({overall.rewardInfo.points} Pts Eligible)
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64">
          <ProgressBar value={overall.percentage} size="lg" colorScheme="auto" showLabel />
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            75% required for incentive eligibility
          </p>
        </div>
      </div>

      {/* Subject-Wise Cards Table */}
      <Card title="Subject-Wise Attendance Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Subject Code</th>
                <th className="pb-3">Course Title</th>
                <th className="pb-3">Semester</th>
                <th className="pb-3">Attended / Total</th>
                <th className="pb-3 w-48">Attendance Rate</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectBreakdown.map((subj) => (
                <tr key={subj.subjectId} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-mono font-bold text-navy-800">
                    {subj.subjectCode}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800">
                    {subj.subjectName}
                  </td>
                  <td className="py-3.5 text-slate-600">
                    Semester {subj.semester}
                  </td>
                  <td className="py-3.5 font-mono text-slate-700">
                    {subj.presentLectures} / {subj.totalLectures}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={subj.percentage} size="sm" colorScheme="auto" />
                      <span className="font-bold text-slate-800 w-12 text-right">{subj.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    {subj.percentage >= 90 ? (
                      <Badge variant="success">Excellent</Badge>
                    ) : subj.percentage >= 75 ? (
                      <Badge variant="primary">Satisfactory</Badge>
                    ) : (
                      <Badge variant="danger">Low Attendance</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily Attendance Logs */}
      <Card
        title="My Daily Lecture Logs"
        subtitle="Individual lecture records submitted by faculty"
        headerAction={
          <div className="flex items-center gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none"
            >
              <option value="all">All Courses</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Lecture Date</th>
                <th className="pb-3">Course Code</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-mono font-medium text-slate-700">
                    {log.attendance_date}
                  </td>
                  <td className="py-3 font-mono text-slate-700">
                    {log.subject_id}
                  </td>
                  <td className="py-3">
                    <Badge variant={log.status === 'present' ? 'success' : 'danger'}>
                      {log.status === 'present' ? 'Present' : 'Absent'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No lecture logs recorded for the selected course yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
