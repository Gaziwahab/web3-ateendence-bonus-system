import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatAddress } from '../../utils/web3';
import { ETHERSCAN_BASE_URL } from '../../utils/constants';
import { ExternalLink, Copy, Check, ShieldCheck, Link2 } from 'lucide-react';

export const StudentTransactions = () => {
  const { profile } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [copiedHash, setCopiedHash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rews = await attendanceService.getRewards(profile?.id);
        setRewards(rews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.id]);

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            On-chain ledger records of all reward points distributed to your Ethereum wallet address
          </p>
        </div>
        <Badge variant="purple" size="md" className="flex items-center gap-1.5 self-start">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sepolia Blockchain Receipts</span>
        </Badge>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Transaction Hash</th>
                <th className="pb-3">Semester</th>
                <th className="pb-3">Attendance %</th>
                <th className="pb-3">Incentive Points</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Block Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rewards.map((reward) => {
                const isCopied = copiedHash === reward.transaction_hash;
                return (
                  <tr key={reward.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-700 font-semibold">
                          {formatAddress(reward.transaction_hash)}
                        </span>
                        {reward.transaction_hash && (
                          <button
                            onClick={() => handleCopy(reward.transaction_hash)}
                            className="text-slate-400 hover:text-slate-600 transition"
                            title="Copy Transaction Hash"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-slate-800">
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
                    <td className="py-4 text-slate-500 font-mono text-[11px]">
                      {reward.created_at ? new Date(reward.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-4 text-right">
                      {reward.transaction_hash && (
                        <a
                          href={`${ETHERSCAN_BASE_URL}/tx/${reward.transaction_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium hover:underline text-xs"
                        >
                          Etherscan <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rewards.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No blockchain transactions found for your account yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
