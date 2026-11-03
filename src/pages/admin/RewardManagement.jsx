import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { getStudentOverallAttendance } from '../../utils/attendanceCalculator';
import { useWeb3 } from '../../context/Web3Context';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatAddress } from '../../utils/web3';
import { REWARD_SLABS, ETHERSCAN_BASE_URL } from '../../utils/constants';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Wallet,
  Sparkles,
  Info,
} from 'lucide-react';

export const RewardManagement = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(6);
  const [loading, setLoading] = useState(true);
  const [distributingId, setDistributingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const {
    account,
    isConnected,
    isSepolia,
    connectWallet,
    switchNetwork,
    distributeRewardOnChain,
    checkOnChainHasReceived,
  } = useWeb3();

  const loadData = async () => {
    try {
      const [stus, atts, rews] = await Promise.all([
        attendanceService.getStudents(),
        attendanceService.getAttendance(),
        attendanceService.getRewards(),
      ]);
      setStudents(stus);
      setAttendance(atts);
      setRewards(rews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDistribute = async (student, points, percentage) => {
    setActionMessage(null);

    if (!isConnected) {
      alert('Please connect your MetaMask admin wallet first.');
      await connectWallet();
      return;
    }

    if (!isSepolia) {
      alert('Please switch MetaMask network to Sepolia Testnet.');
      await switchNetwork();
      return;
    }

    if (!student.wallet_address) {
      alert(`Student ${student.full_name} does not have an Ethereum wallet bound yet. Please edit the student's profile to add their wallet address.`);
      return;
    }

    // Check duplicate in DB
    const isAlreadyRewarded = rewards.some(
      (r) => r.student_id === student.id && r.semester_id === Number(selectedSemester)
    );
    if (isAlreadyRewarded) {
      alert(`Reward already distributed to ${student.full_name} for Semester ${selectedSemester}. Duplicate prevention active.`);
      return;
    }

    setDistributingId(student.id);

    try {
      // 1. Trigger Solidity Smart Contract distributeReward() transaction via MetaMask
      const result = await distributeRewardOnChain(
        student.wallet_address,
        points,
        selectedSemester
      );

      // 2. Record confirmed transaction to Supabase / Database
      await attendanceService.recordRewardDistribution({
        student_id: student.id,
        semester_id: selectedSemester,
        attendance_percentage: percentage,
        reward_points: points,
        transaction_hash: result.transactionHash,
      });

      setActionMessage({
        type: 'success',
        text: `Successfully distributed ${points} points to ${student.full_name}! Tx Hash: ${result.transactionHash}`,
        txHash: result.transactionHash,
      });

      // Reload dataset
      await loadData();
    } catch (err) {
      console.error('Reward distribution failed:', err);
      setActionMessage({
        type: 'error',
        text: err.message || 'Transaction failed or was rejected in MetaMask.',
      });
    } finally {
      setDistributingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reward Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated attendance percentage evaluation and Sepolia blockchain token distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Target Semester:</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action status notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{actionMessage.text}</p>
              {actionMessage.txHash && (
                <a
                  href={`${ETHERSCAN_BASE_URL}/tx/${actionMessage.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] underline hover:text-emerald-900"
                >
                  Verify on Sepolia Etherscan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Slabs Reference Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REWARD_SLABS.map((slab) => (
          <div
            key={slab.label}
            className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
          >
            <div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${slab.badgeColor}`}>
                {slab.label}
              </span>
              <p className="text-xs text-slate-500 mt-1">{slab.description}</p>
            </div>
            <div className="text-xl font-extrabold text-slate-800">
              {slab.points} <span className="text-xs font-medium text-slate-400">Pts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Student Eligibility and Distribution Table */}
      <Card
        title={`Student Eligibility & Blockchain Payouts — Semester ${selectedSemester}`}
        subtitle="Automatic incentive calculation from recorded attendance percentage"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Enrollment ID</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">MetaMask Wallet</th>
                <th className="pb-3">Attendance %</th>
                <th className="pb-3">Calculated Slab</th>
                <th className="pb-3">Points</th>
                <th className="pb-3">Distribution Status</th>
                <th className="pb-3 text-right">Blockchain Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const stats = getStudentOverallAttendance(student.id, attendance);
                const existingReward = rewards.find(
                  (r) => r.student_id === student.id && r.semester_id === Number(selectedSemester)
                );
                const isDistributed = Boolean(existingReward);
                const isEligible = stats.rewardInfo.points > 0;
                const isProcessingThis = distributingId === student.id;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-mono font-medium text-slate-700">
                      {student.student_id || '-'}
                    </td>
                    <td className="py-4 font-semibold text-slate-800">
                      {student.full_name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {student.email}
                      </span>
                    </td>
                    <td className="py-4 font-mono">
                      {student.wallet_address ? (
                        <span className="text-purple-700 font-medium">
                          {formatAddress(student.wallet_address)}
                        </span>
                      ) : (
                        <span className="text-rose-500 italic flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> Missing Wallet
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-bold text-slate-800">
                      {stats.percentage}%
                      <div className="text-[10px] text-slate-400 font-normal">
                        {stats.presentLectures} / {stats.totalLectures} lectures
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stats.rewardInfo.badgeColor}`}>
                        {stats.rewardInfo.tier}
                      </span>
                    </td>
                    <td className="py-4 font-extrabold text-sm text-slate-900">
                      {stats.rewardInfo.points} Pts
                    </td>
                    <td className="py-4">
                      {isDistributed ? (
                        <div>
                          <Badge variant="purple" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Distributed
                          </Badge>
                          {existingReward.transaction_hash && (
                            <a
                              href={`${ETHERSCAN_BASE_URL}/tx/${existingReward.transaction_hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-mono text-purple-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              Tx Hash <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : isEligible ? (
                        <Badge variant="warning">Ready for Distribution</Badge>
                      ) : (
                        <Badge variant="danger">Ineligible (&lt;75%)</Badge>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {isDistributed ? (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Claimed (Sem {selectedSemester})
                        </span>
                      ) : isEligible ? (
                        <Button
                          variant="blockchain"
                          size="sm"
                          loading={isProcessingThis}
                          disabled={!student.wallet_address || Boolean(distributingId)}
                          onClick={() =>
                            handleDistribute(student, stats.rewardInfo.points, stats.percentage)
                          }
                          icon={Coins}
                        >
                          {isProcessingThis ? 'Signing...' : 'Distribute on Sepolia'}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No points eligible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
