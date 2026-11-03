import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { calculatePercentage } from '../../utils/attendanceCalculator';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { BookOpen, Users, CalendarCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MySubjects = () => {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subjs, atts, stus] = await Promise.all([
          attendanceService.getSubjects(),
          attendanceService.getAttendance(),
          attendanceService.getStudents(),
        ]);
        setSubjects(subjs);
        setAttendance(atts);
        setStudents(stus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mySubjects = subjects.filter(
    (s) => s.faculty_id === profile?.id || !s.faculty_id
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Assigned Subjects</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Curriculum courses assigned to your faculty profile for attendance marking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mySubjects.map((subject) => {
          const subjectLogs = attendance.filter((a) => a.subject_id === subject.id);
          const totalPresent = subjectLogs.filter((a) => a.status === 'present').length;
          const avgPct = calculatePercentage(totalPresent, subjectLogs.length);
          const uniqueDates = new Set(subjectLogs.map((l) => l.attendance_date)).size;

          return (
            <Card key={subject.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200">
                    {subject.subject_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Semester {subject.semester}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mt-3">
                  {subject.subject_name}
                </h3>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Lectures Conducted</span>
                    <span className="font-bold text-slate-800 text-sm">{uniqueDates}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Enrolled Students</span>
                    <span className="font-bold text-slate-800 text-sm">{students.length}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1 font-medium">
                    <span className="text-slate-600">Course Average Attendance</span>
                    <span className="font-bold text-slate-800">{avgPct}%</span>
                  </div>
                  <ProgressBar value={avgPct} size="md" colorScheme="auto" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link to={`/faculty/history?subject=${subject.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                  View Logs
                </Link>
                <Link to={`/faculty/mark-attendance?subject=${subject.id}`}>
                  <Button variant="primary" size="sm" icon={CalendarCheck}>
                    Mark Attendance
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
