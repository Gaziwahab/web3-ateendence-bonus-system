import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Check,
  Info,
} from 'lucide-react';

export const MarkAttendance = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subject') || '');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Map of studentId => 'present' | 'absent'
  const [attendanceMap, setAttendanceMap] = useState({});
  const [existingCount, setExistingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [subjs, stus] = await Promise.all([
          attendanceService.getSubjects(),
          attendanceService.getStudents(),
        ]);
        setSubjects(subjs);
        setStudents(stus);

        if (!selectedSubjectId && subjs.length > 0) {
          // If faculty has assigned subjects, default to first assigned
          const mySubj = subjs.find((s) => s.faculty_id === profile?.id) || subjs[0];
          setSelectedSubjectId(mySubj.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [profile?.id]);

  // When subject or date changes, check if attendance already exists
  useEffect(() => {
    if (!selectedSubjectId || !attendanceDate || students.length === 0) return;

    const checkExisting = async () => {
      try {
        const records = await attendanceService.getAttendance({
          subject_id: selectedSubjectId,
          attendance_date: attendanceDate,
        });

        const initialMap = {};
        if (records.length > 0) {
          setExistingCount(records.length);
          // Pre-populate with existing status
          students.forEach((s) => {
            const found = records.find((r) => r.student_id === s.id);
            initialMap[s.id] = found ? found.status : 'present';
          });
        } else {
          setExistingCount(0);
          // Default all to 'present' for fast marking
          students.forEach((s) => {
            initialMap[s.id] = 'present';
          });
        }
        setAttendanceMap(initialMap);
      } catch (err) {
        console.error(err);
      }
    };

    checkExisting();
  }, [selectedSubjectId, attendanceDate, students]);

  const toggleStudentStatus = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Please select a subject.');
      return;
    }
    if (!attendanceDate) {
      alert('Please select an attendance date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentStatuses = students.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id] || 'present',
      }));

      await attendanceService.submitAttendanceBatch({
        subject_id: selectedSubjectId,
        attendance_date: attendanceDate,
        marked_by: profile?.id,
        studentStatuses,
      });

      const selectedSubjObj = subjects.find((s) => s.id === selectedSubjectId);
      setToastMessage({
        type: 'success',
        text: `Attendance saved successfully for ${selectedSubjObj?.subject_code} on ${attendanceDate}!`,
      });
      setExistingCount(studentStatuses.length);
    } catch (err) {
      alert(err.message || 'Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPresentCount = Object.values(attendanceMap).filter((v) => v === 'present').length;
  const currentAbsentCount = Object.values(attendanceMap).filter((v) => v === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mark Daily Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select subject and date, record student presence, and submit to database
          </p>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Configuration Form */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Academic Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} - {s.subject_name} (Semester {s.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lecture Date
            </label>
            <input
              type="date"
              required
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white font-medium"
            />
          </div>
        </div>

        {/* Duplicate warning / notice banner */}
        {existingCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Attendance records for this subject and date already exist ({existingCount} logged). 
              Submitting will update the attendance entries while preventing duplicate database keys.
            </span>
          </div>
        )}
      </Card>

      {/* Student List & Attendance Toggles */}
      <Card
        title={`Student Attendance Roster (${students.length} Registered Students)`}
        subtitle="Click on status button to toggle Present or Absent"
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleMarkAll('present')}
              className="text-xs"
            >
              Mark All Present
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleMarkAll('absent')}
              className="text-xs"
            >
              Mark All Absent
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Enrollment ID</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3 text-center">Current Marking</th>
                <th className="pb-3 text-right">Quick Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const isPresent = attendanceMap[student.id] === 'present';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono font-medium text-slate-700">
                      {student.student_id || '-'}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {student.full_name}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {student.email}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isPresent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => toggleStudentStatus(student.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isPresent
                            ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        Set to {isPresent ? 'Absent' : 'Present'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Submission Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {currentPresentCount} Present
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <XCircle className="w-4 h-4 text-rose-600" />
              {currentAbsentCount} Absent
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={Check}
          >
            Submit Daily Attendance
          </Button>
        </div>
      </Card>
    </div>
  );
};
