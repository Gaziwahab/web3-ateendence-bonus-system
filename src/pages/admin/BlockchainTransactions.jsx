import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatAddress } from '../../utils/web3';
import { ETHERSCAN_BASE_URL } from '../../utils/constants';
import { ExternalLink, Copy, Check, ShieldCheck, Link2 } from 'lucide-react';

export const BlockchainTransactions = () => {
  const [rewards, setRewards] = useState([]);
  const [students, setStudents] = useState([]);
  const [copiedHash, setCopiedHash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rews, stus] = await Promise.all([
          attendanceService.getRewards(),
          attendanceService.getStudents(),
        ]);
        setRewards(rews);
        setStudents(stus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Blockchain Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable on-chain ledger records of all attendance-linked incentive point distributions
          </p>
        </div>
        <Badge variant="purple" size="md" className="flex items-center gap-1.5 self-start">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sepolia Testnet Ledger</span>
        </Badge>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Transaction Hash</th>
                <th className="pb-3">Recipient Student</th>
                <th className="pb-3">Wallet Address</th>
                <th className="pb-3">Semester</th>
                <th className="pb-3">Attendance %</th>
                <th className="pb-3">Reward Points</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Etherscan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rewards.map((reward) => {
                const student = students.find((s) => s.id === reward.student_id);
                const isCopied = copiedHash === reward.transaction_hash;

                return (
                  <tr key={reward.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-700 font-semibold">
                          {formatAddress(reward.transaction_hash)}
                        </span>
                        <button
                          onClick={() => handleCopy(reward.transaction_hash)}
                          className="text-slate-400 hover:text-slate-600 transition"
                          title="Copy Full Hash"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-slate-800">
                      {student?.full_name || 'Enrolled Student'}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {student?.student_id || ''}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-600">
                      {formatAddress(student?.wallet_address)}
                    </td>
                    <td className="py-4 font-medium text-slate-700">
                      Semester {reward.semester_id}
                    </td>
                    <td className="py-4 font-bold text-slate-800">
                      {reward.attendance_percentage}%
                    </td>
                    <td className="py-4 font-extrabold text-sm text-purple-700">
                      +{reward.reward_points} Pts
                    </td>
                    <td className="py-4">
                      <Badge variant="success">Confirmed On-Chain</Badge>
                    </td>
                    <td className="py-4 text-right">
                      <a
                        href={`${ETHERSCAN_BASE_URL}/tx/${reward.transaction_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium hover:underline text-xs"
                      >
                        View Tx <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rewards.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No blockchain transactions have been executed yet. Go to Reward Management to distribute rewards.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
