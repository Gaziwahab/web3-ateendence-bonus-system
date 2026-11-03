import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WalletButton } from '../web3/WalletButton';
import { NetworkBadge } from '../web3/NetworkBadge';
import { ContractSetupModal } from '../web3/ContractSetupModal';
import { Settings, LogOut, ChevronDown, UserCircle2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { profile, role, logout, switchDemoRole, isDemoMode } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (newRole) => {
    setShowRoleMenu(false);
    await switchDemoRole(newRole);
    if (newRole === 'admin') navigate('/admin');
    else if (newRole === 'faculty') navigate('/faculty');
    else if (newRole === 'student') navigate('/student');
  };

  const roleColors = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    faculty: 'bg-blue-50 text-blue-700 border-blue-200',
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-bold text-navy-900 text-sm">AttendIncentive</span>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs font-medium text-slate-700"
              title="Switch demo persona for testing"
            >
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${roleColors[role] || 'bg-slate-100'}`}>
                {role || 'Guest'}
              </span>
              <span className="font-semibold text-slate-800">{profile?.full_name || 'Select Role'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Demo Account (Viva / Demo)
                </div>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">Dr. Rajesh Mehta</p>
                    <p className="text-[10px] text-slate-500">Admin (College Principal)</p>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded border border-rose-200">Admin</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('faculty')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">Prof. Sunita Sharma</p>
                    <p className="text-[10px] text-slate-500">Faculty (Blockchain Dept)</p>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200">Faculty</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('student')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">Rahul Kumar (95%)</p>
                    <p className="text-[10px] text-slate-500">Student (CSE-2023-001)</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-200">Student</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Network Badge, Wallet, Settings, Logout */}
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <WalletButton />

          <button
            onClick={() => setShowContractModal(true)}
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg border border-transparent hover:border-purple-200 transition"
            title="Configure Sepolia Smart Contract"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <ContractSetupModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
      />
    </>
  );
};
