import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { attendanceService } from '../../services/attendanceService';
import { getStudentOverallAttendance } from '../../utils/attendanceCalculator';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatAddress } from '../../utils/web3';
import { REWARD_SLABS, ETHERSCAN_BASE_URL } from '../../utils/constants';
import {
  Award,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MyRewards = () => {
  const { profile } = useAuth();
  const { account, isConnected, connectWallet, getOnChainStudentBalance } = useWeb3();

  const [attendance, setAttendance] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [onChainPoints, setOnChainPoints] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBalances = async () => {
    setIsRefreshing(true);
    try {
      const [atts, rews] = await Promise.all([
        attendanceService.getAttendance(),
        attendanceService.getRewards(profile?.id),
      ]);
      setAttendance(atts);
      setRewards(rews);

      const targetWallet = profile?.wallet_address || account;
      if (targetWallet) {
        const bal = await getOnChainStudentBalance(targetWallet);
        setOnChainPoints(bal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [profile?.id, profile?.wallet_address, account]);

  const stats = getStudentOverallAttendance(profile?.id, attendance);
  const dbPoints = rewards.reduce((acc, r) => acc + (Number(r.reward_points) || 0), 0);
  const activeBalance = onChainPoints !== null ? onChainPoints : dbPoints;

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Incentive Rewards</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Attendance-linked incentive points recorded on the Ethereum Sepolia smart contract
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchBalances}
          loading={isRefreshing}
          icon={RefreshCw}
        >
          Sync Balances
        </Button>
      </div>

      {/* Main Reward Points Hero Card */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-navy-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Smart Contract Verified</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              {activeBalance} <span className="text-lg font-normal text-purple-200">Incentive Points</span>
            </h3>
            <p className="text-xs text-purple-200/80 mt-1 max-w-md">
              Cumulative balance stored in the AttendanceReward contract for wallet{' '}
              <span className="font-mono text-purple-100 font-semibold">
                {profile?.wallet_address ? formatAddress(profile.wallet_address) : 'Not Bound'}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            {stats.rewardInfo.points > 0 ? (
              <Button variant="blockchain" size="md" onClick={handleCelebrate} icon={Sparkles}>
                Celebrate Status 🎉
              </Button>
            ) : null}

            <div className="text-[11px] text-purple-200/70 font-mono">
              Status: {onChainPoints !== null ? 'Live On-Chain Sepolia' : 'Synced from Database'}
            </div>
          </div>
        </div>
      </div>

      {/* Slabs Criteria & Eligibility Status */}
      <Card title="Attendance Reward Slabs & My Current Standing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {REWARD_SLABS.map((slab) => {
            const isCurrentSlab =
              stats.percentage >= slab.min && stats.percentage <= slab.max;

            return (
              <div
                key={slab.label}
                className={`p-4 rounded-xl border transition ${
                  isCurrentSlab
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-400/30 shadow-sm'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${slab.badgeColor}`}>
                    {slab.label}
                  </span>
                  {isCurrentSlab && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Your Tier
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800">{slab.points}</span>
                  <span className="text-xs font-medium text-slate-500">Points</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{slab.description}</p>
              </div>
            );
          })}
        </div>

        {/* Current Standing Explanation */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs">
          <Award className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-slate-600">
            <h4 className="font-semibold text-slate-800">
              Semester 6 Standing: {stats.percentage}% Attendance ({stats.rewardInfo.tier})
            </h4>
            <p className="mt-0.5">
              {stats.percentage >= 90
                ? 'Outstanding performance! You are eligible for 50 Gold Tier incentive points.'
                : stats.percentage >= 75
                ? 'Satisfactory attendance! You are eligible for 20 Silver Tier incentive points.'
                : 'Your current attendance is below the 75% threshold. Attend future lectures to reach the 75% eligibility mark.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Reward Distribution History */}
      <Card title="Distribution Receipts">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Semester</th>
                <th className="pb-3">Attendance %</th>
                <th className="pb-3">Points Credited</th>
                <th className="pb-3">Sepolia Tx Hash</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Etherscan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rewards.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-semibold text-slate-800">
                    Semester {r.semester_id}
                  </td>
                  <td className="py-3.5 font-bold text-slate-800">
                    {r.attendance_percentage}%
                  </td>
                  <td className="py-3.5 font-extrabold text-sm text-purple-700">
                    +{r.reward_points} Pts
                  </td>
                  <td className="py-3.5 font-mono text-slate-600">
                    {r.transaction_hash ? formatAddress(r.transaction_hash) : '-'}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3.5 text-right">
                    {r.transaction_hash && (
                      <a
                        href={`${ETHERSCAN_BASE_URL}/tx/${r.transaction_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium hover:underline"
                      >
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rewards.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No reward receipts logged yet. Once the college admin executes on-chain distribution, your receipt will appear here.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
