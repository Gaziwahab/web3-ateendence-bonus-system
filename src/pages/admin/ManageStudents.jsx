import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { getStudentOverallAttendance } from '../../utils/attendanceCalculator';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatAddress } from '../../utils/web3';
import { UserPlus, Search, Edit3, Wallet, Check } from 'lucide-react';

export const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newWallet, setNewWallet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Wallet modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editWalletAddress, setEditWalletAddress] = useState('');

  const loadData = async () => {
    try {
      const [studentsData, attData] = await Promise.all([
        attendanceService.getStudents(),
        attendanceService.getAttendance(),
      ]);
      setStudents(studentsData);
      setAttendance(attData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await attendanceService.createProfile({
        full_name: newName,
        email: newEmail,
        role: 'student',
        student_id: newStudentId,
        wallet_address: newWallet || null,
      });
      setIsAddOpen(false);
      setNewName('');
      setNewEmail('');
      setNewStudentId('');
      setNewWallet('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await attendanceService.updateProfileWallet(editingStudent.id, editWalletAddress);
      setEditingStudent(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update wallet address');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Students</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View registered students, bound MetaMask wallet addresses, and attendance percentage
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} icon={UserPlus}>
          Add New Student
        </Button>
      </div>

      <Card>
        {/* Search Bar */}
        <div className="mb-4 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or enrollment ID..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
          />
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Enrollment ID</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">MetaMask Wallet</th>
                <th className="pb-3">Attendance %</th>
                <th className="pb-3">Reward Slab</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const stats = getStudentOverallAttendance(student.id, attendance);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono font-medium text-slate-700">
                      {student.student_id || 'N/A'}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {student.full_name}
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {student.email}
                    </td>
                    <td className="py-3.5 font-mono text-slate-600">
                      {student.wallet_address ? (
                        <span className="flex items-center gap-1.5 text-purple-700 font-medium">
                          <Wallet className="w-3.5 h-3.5 text-purple-500" />
                          {formatAddress(student.wallet_address)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not connected</span>
                      )}
                    </td>
                    <td className="py-3.5 font-bold text-slate-800">
                      {stats.percentage}%
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({stats.presentLectures}/{stats.totalLectures})
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stats.rewardInfo.badgeColor}`}>
                        {stats.rewardInfo.tier} ({stats.rewardInfo.points} pts)
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setEditWalletAddress(student.wallet_address || '');
                        }}
                        className="text-slate-500 hover:text-purple-600 p-1.5 rounded hover:bg-purple-50 transition"
                        title="Edit Wallet Address"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student">
        <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Gaurav Sharma"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="gaurav.sharma@college.edu"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Enrollment ID</label>
            <input
              type="text"
              required
              value={newStudentId}
              onChange={(e) => setNewStudentId(e.target.value)}
              placeholder="CSE-2023-010"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">MetaMask Wallet Address (Optional)</label>
            <input
              type="text"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              placeholder="0x..."
              className="w-full font-mono px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Add Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Wallet Modal */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title={`Update Wallet: ${editingStudent?.full_name}`}
      >
        <form onSubmit={handleUpdateWallet} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Set or update the Ethereum wallet address associated with enrollment ID{' '}
            <strong>{editingStudent?.student_id}</strong>. Incentive tokens will be transferred here on Sepolia.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ethereum Wallet Address (0x...)</label>
            <input
              type="text"
              required
              value={editWalletAddress}
              onChange={(e) => setEditWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full font-mono px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button variant="blockchain" type="submit">
              Save Wallet Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
