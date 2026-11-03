import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { calculatePercentage } from '../../utils/attendanceCalculator';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useWeb3 } from '../../context/Web3Context';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Percent,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  Link2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, isSepolia, account } = useWeb3();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, facultyData, attendanceData, rewardsData] = await Promise.all([
          attendanceService.getStudents(),
          attendanceService.getFaculty(),
          attendanceService.getAttendance(),
          attendanceService.getRewards(),
        ]);
        setStudents(studentsData);
        setFaculty(facultyData);
        setAttendance(attendanceData);
        setRewards(rewardsData);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate Average Student Attendance
  const totalLectures = attendance.length;
  const totalPresents = attendance.filter((a) => a.status === 'present').length;
  const avgAttendance = calculatePercentage(totalPresents, totalLectures);

  // Total rewards points distributed
  const totalPoints = rewards.reduce((acc, curr) => acc + (Number(curr.reward_points) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Administrator Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            College Attendance Analytics & Sepolia Smart Contract Incentive Distribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/rewards">
            <Button variant="blockchain" size="sm" icon={Coins}>
              Distribute Rewards
            </Button>
          </Link>
          <Link to="/admin/students">
            <Button variant="secondary" size="sm" icon={Users}>
              Manage Students
            </Button>
          </Link>
        </div>
      </div>

      {/* Web3 Warning or Status Banner */}
      {!isConnected ? (
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs font-semibold text-purple-900">MetaMask Admin Wallet Not Connected</p>
              <p className="text-[11px] text-purple-700">Connect your owner wallet to trigger on-chain reward distributions on Sepolia.</p>
            </div>
          </div>
          <Badge variant="purple">Web3 Ready</Badge>
        </div>
      ) : !isSepolia ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-800 text-xs">
          <span>MetaMask is connected to an alternate chain. Switch to Sepolia Testnet for smart contract executions.</span>
        </div>
      ) : null}

      {/* 5 Core Dashboard Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled in program"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Faculty"
          value={faculty.length}
          subtitle="Teaching staff"
          icon={GraduationCap}
          color="navy"
        />
        <StatCard
          title="Attendance Records"
          value={totalLectures}
          subtitle="Logged across subjects"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Average Attendance"
          value={`${avgAttendance}%`}
          subtitle="All students & lectures"
          icon={Percent}
          color="amber"
        />
        <StatCard
          title="Rewards Distributed"
          value={`${totalPoints} Pts`}
          subtitle={`${rewards.length} On-chain payouts`}
          icon={Coins}
          color="purple"
        />
      </div>

      {/* Quick Action Grid & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Attendance Records */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Daily Attendance Logs"
            subtitle="Real-time attendance recorded by faculty members"
            headerAction={
              <Link to="/admin/attendance" className="text-xs text-navy-800 font-semibold hover:underline flex items-center gap-1">
                View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.slice(-6).reverse().map((record) => {
                    const student = students.find((s) => s.id === record.student_id);
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono text-slate-600">{record.attendance_date}</td>
                        <td className="py-3 font-medium text-slate-800">
                          {student?.full_name || record.student_id}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {student?.student_id || ''}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 font-mono">{record.subject_id}</td>
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
            </div>
          </Card>
        </div>

        {/* Right Col: Smart Contract Reward Status */}
        <div>
          <Card
            title="Blockchain Reward Status"
            subtitle="Sepolia Smart Contract Distribution"
            headerAction={
              <Link to="/admin/transactions" className="text-xs text-purple-600 font-semibold hover:underline">
                Audit Trail
              </Link>
            }
          >
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-500">Total Points Awarded</span>
                  <span className="font-bold text-slate-800">{totalPoints} Points</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Transactions Recorded</span>
                  <span className="font-bold text-purple-600">{rewards.length} Receipts</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Recent On-Chain Payouts</h4>
                <div className="space-y-2">
                  {rewards.slice(-3).reverse().map((r) => {
                    const student = students.find((s) => s.id === r.student_id);
                    return (
                      <div key={r.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">{student?.full_name || 'Student'}</span>
                          <span className="font-bold text-purple-700">+{r.reward_points} Pts</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Semester {r.semester_id}</span>
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                            {r.transaction_hash?.substring(0, 10)}...
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Link to="/admin/rewards" className="block pt-2">
                <Button variant="blockchain" size="sm" className="w-full" icon={Link2}>
                  Open Reward Manager
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
