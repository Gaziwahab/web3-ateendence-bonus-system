import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  BookOpen,
  Users,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard = () => {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter subjects assigned to this faculty member (or show all if admin in test)
  const mySubjects = subjects.filter(
    (s) => s.faculty_id === profile?.id || !s.faculty_id
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const mySubjectIds = mySubjects.map((s) => s.id);
  const todayRecords = attendance.filter(
    (a) => a.attendance_date === todayStr && mySubjectIds.includes(a.subject_id)
  );

  const myAttendance = attendance.filter((a) => mySubjectIds.includes(a.subject_id));

  return (
    <div className="space-y-6">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome, {profile?.full_name || 'Faculty Member'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty Teaching Portal • Daily Attendance & Student Analytics
          </p>
        </div>
        <Link to="/faculty/mark-attendance">
          <Button variant="primary" size="sm" icon={CalendarCheck}>
            Mark Daily Attendance
          </Button>
        </Link>
      </div>

      {/* 4 Metrics for Faculty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Subjects"
          value={mySubjects.length}
          subtitle="Active courses this semester"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled cohort"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Today's Attendance"
          value={todayRecords.length}
          subtitle={`${todayStr}`}
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Total Logs Recorded"
          value={myAttendance.length}
          subtitle="Across all assigned subjects"
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Subjects List */}
        <div className="lg:col-span-2">
          <Card
            title="My Assigned Courses"
            subtitle="Semester 6 Bachelor of Technology Curriculum"
            headerAction={
              <Link to="/faculty/subjects" className="text-xs text-navy-800 font-semibold hover:underline flex items-center gap-1">
                View Details <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {mySubjects.map((subj) => {
                const subjectLogs = attendance.filter((a) => a.subject_id === subj.id);
                // Unique dates conducted
                const uniqueDates = new Set(subjectLogs.map((l) => l.attendance_date)).size;

                return (
                  <div
                    key={subj.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-navy-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {subj.subject_code}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-sm">
                          {subj.subject_name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Semester {subj.semester} • {uniqueDates} Lectures Conducted • {students.length} Registered Students
                      </p>
                    </div>

                    <Link to={`/faculty/mark-attendance?subject=${subj.id}`}>
                      <Button variant="secondary" size="sm" icon={CalendarCheck}>
                        Mark Attendance
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Col: Recent Attendance History */}
        <div>
          <Card
            title="Recent Daily Submissions"
            subtitle="Latest lecture entries recorded"
            headerAction={
              <Link to="/faculty/history" className="text-xs text-navy-800 font-semibold hover:underline">
                All History
              </Link>
            }
          >
            <div className="space-y-3">
              {myAttendance.slice(-5).reverse().map((rec) => {
                const stu = students.find((s) => s.id === rec.student_id);
                return (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{stu?.full_name || 'Student'}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {rec.attendance_date} • {rec.subject_id}
                      </p>
                    </div>
                    <Badge variant={rec.status === 'present' ? 'success' : 'danger'}>
                      {rec.status === 'present' ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
