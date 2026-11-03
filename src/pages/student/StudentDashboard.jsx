import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { attendanceService } from '../../services/attendanceService';
import {
  getStudentOverallAttendance,
  getStudentSubjectWiseAttendance,
} from '../../utils/attendanceCalculator';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { formatAddress } from '../../utils/web3';
import { ETHERSCAN_BASE_URL } from '../../utils/constants';
import {
  Percent,
  CalendarCheck,
  Award,
  Coins,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { profile } = useAuth();
  const { account, isConnected, connectWallet, getOnChainStudentBalance } = useWeb3();

  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [onChainBalance, setOnChainBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [atts, subjs, rews] = await Promise.all([
          attendanceService.getAttendance(),
          attendanceService.getSubjects(),
          attendanceService.getRewards(profile?.id),
        ]);
        setAttendance(atts);
        setSubjects(subjs);
        setRewards(rews);

        // Fetch on-chain balance if student has a wallet
        const studentWallet = profile?.wallet_address || account;
        if (studentWallet) {
          const bal = await getOnChainStudentBalance(studentWallet);
          setOnChainBalance(bal);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.id, profile?.wallet_address, account, getOnChainStudentBalance]);

  const stats = getStudentOverallAttendance(profile?.id, attendance);
  const subjectStats = getStudentSubjectWiseAttendance(profile?.id, subjects, attendance);

  // Total DB reward points
  const dbPoints = rewards.reduce((acc, r) => acc + (Number(r.reward_points) || 0), 0);
  const displayPoints = onChainBalance !== null ? onChainBalance : dbPoints;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Welcome back, {profile?.full_name || 'Student'}!
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
              {profile?.student_id || 'CSE-2023-001'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Student Attendance Portal • Blockchain Incentive Token Balance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/student/rewards">
            <Button variant="blockchain" size="sm" icon={Award}>
              View My Rewards
            </Button>
          </Link>
          <Link to="/student/attendance">
            <Button variant="secondary" size="sm" icon={CalendarCheck}>
              Detailed Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Binding Alert if Missing */}
      {!profile?.wallet_address && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-purple-900">MetaMask Wallet Not Bound</p>
              <p className="text-[11px] text-purple-700">
                Connect your MetaMask wallet in the top bar to bind your Ethereum address and receive on-chain rewards.
              </p>
            </div>
          </div>
          <Button variant="blockchain" size="sm" onClick={connectWallet}>
            Connect Now
          </Button>
        </div>
      )}

      {/* 6 Core Student Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.percentage}%`}
          subtitle={stats.percentage >= 75 ? 'Above 75% Requirement' : 'Below 75% Warning'}
          icon={Percent}
          color={stats.percentage >= 90 ? 'emerald' : stats.percentage >= 75 ? 'amber' : 'rose'}
        />
        <StatCard
          title="Classes Attended"
          value={stats.presentLectures}
          subtitle={`Out of ${stats.totalLectures} lectures conducted`}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Available Reward Points"
          value={`${displayPoints} Pts`}
          subtitle={onChainBalance !== null ? 'Live from Smart Contract' : 'Synced from Database'}
          icon={Coins}
          color="purple"
        />
        <StatCard
          title="Reward Eligibility"
          value={stats.rewardInfo.tier}
          subtitle={`${stats.rewardInfo.points} pts potential`}
          icon={Award}
          color={stats.rewardInfo.isEligible ? 'emerald' : 'navy'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject-Wise Progress */}
        <div className="lg:col-span-2">
          <Card
            title="Subject-Wise Attendance Breakdown"
            subtitle="Current semester course attendance tracking"
            headerAction={
              <Link to="/student/attendance" className="text-xs text-navy-800 font-semibold hover:underline flex items-center gap-1">
                Details <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-4">
              {subjectStats.map((subj) => (
                <div key={subj.subjectId} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-navy-800 bg-slate-200/80 px-2 py-0.5 rounded">
                        {subj.subjectCode}
                      </span>
                      <span className="ml-2 font-semibold text-slate-800 text-xs">
                        {subj.subjectName}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 text-xs">
                      {subj.percentage}% ({subj.presentLectures}/{subj.totalLectures})
                    </span>
                  </div>
                  <ProgressBar value={subj.percentage} size="sm" colorScheme="auto" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Recent On-Chain Transactions */}
        <div>
          <Card
            title="My Reward Transactions"
            subtitle="Verified on Sepolia Testnet"
            headerAction={
              <Link to="/student/transactions" className="text-xs text-purple-600 font-semibold hover:underline">
                View All
              </Link>
            }
          >
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Semester {reward.semester_id} Incentive
                    </span>
                    <span className="font-extrabold text-purple-700">
                      +{reward.reward_points} Pts
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Attendance: {reward.attendance_percentage}%
                  </div>
                  {reward.transaction_hash && (
                    <div className="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                        {formatAddress(reward.transaction_hash)}
                      </span>
                      <a
                        href={`${ETHERSCAN_BASE_URL}/tx/${reward.transaction_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:underline flex items-center gap-1 font-medium text-[10px]"
                      >
                        Sepolia Tx <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {rewards.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No reward distributions received yet this semester. Maintain &ge;75% attendance to qualify!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
