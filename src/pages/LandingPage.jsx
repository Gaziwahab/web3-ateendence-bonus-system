import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  Database,
  Coins,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  Lock,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { REWARD_SLABS, ETHERSCAN_BASE_URL, DEFAULT_CONTRACT_ADDRESS } from '../utils/constants';
import { formatAddress } from '../utils/web3';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-navy-900 via-purple-900 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">AttendIncentive</span>
              <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200">
                Web3 Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Blockchain Academic Rewards System</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-purple-600 transition">Features</a>
          <a href="#how-it-works" className="hover:text-purple-600 transition">How It Works</a>
          <a href="#reward-slabs" className="hover:text-purple-600 transition">Reward Slabs</a>
          <a href="#architecture" className="hover:text-purple-600 transition">Architecture</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-xs">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" className="font-semibold text-xs shadow-md">
              Create Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 lg:px-16 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-purple-200/50 via-indigo-100/40 to-blue-200/30 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-purple-700 font-bold">Ethereum Sepolia Powered</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Decentralized Attendance Credentialing</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Attendance-Linked <br />
            <span className="bg-gradient-to-r from-navy-900 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Incentive Program
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transform passive college attendance into an automated, verifiable rewards ecosystem. 
            Faculty records daily presence, percentages calculate dynamically, and eligible students 
            receive immutable incentive points through a Solidity smart contract.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold shadow-lg shadow-navy-900/10" icon={ArrowRight}>
                Enter Application Portal
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-semibold">
                Explore How It Works
              </Button>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Smart Contract Verified</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Zero PII On-Chain</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Anti-Duplicate Logic</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>MetaMask Integration</span>
            </div>
          </div>
        </div>

        {/* High-Fidelity UI Product Mockup Card */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xl p-4 sm:p-6 text-left">
            {/* Top Bar of the Mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 font-mono font-medium text-slate-400 hidden sm:inline">
                  attend-incentive.edu/portal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 font-mono text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  Contract: {formatAddress(DEFAULT_CONTRACT_ADDRESS)}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-[11px] font-semibold">
                  Sepolia Connected
                </span>
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
              {/* Left 2 Cols: Real-time Stats & Course Breakdown */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Semester Attendance</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">94.8%</p>
                    <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">
                      Gold Tier Qualified
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">On-Chain Incentive</span>
                    <p className="text-2xl font-black text-purple-900 mt-1">50 Pts</p>
                    <span className="text-[11px] font-medium text-purple-700 mt-1 inline-block">
                      Disbursed to Student Wallet
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lectures</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">40 / 42</p>
                    <span className="text-[11px] font-medium text-slate-500 mt-1 inline-block">
                      4 Active Courses
                    </span>
                  </div>
                </div>

                {/* Course List Preview */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Course Progress Overview</span>
                    <span className="text-slate-400">Minimum 75% Requirement</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">CS401: Blockchain Architecture & Protocols</span>
                      <span className="font-bold text-emerald-600">96.0% (24/25)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">CS402: Distributed Systems & Cloud Infrastructure</span>
                      <span className="font-bold text-emerald-600">92.0% (23/25)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Verified Blockchain Receipt */}
              <div className="p-4 rounded-xl border border-purple-200/80 bg-gradient-to-b from-purple-50/80 to-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">
                      Smart Contract Ledger
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Verified
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Latest Payout Confirmation</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Reward points minted on Sepolia by College Admin wallet.
                  </p>

                  <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200 font-mono text-[11px] space-y-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">TRANSACTION HASH</span>
                      <span className="text-purple-700 font-bold truncate block">0x8f2d8a594892cbe38204b7...</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">EVENT</span>
                      <span className="text-slate-800 font-semibold">RewardDistributed (50 Pts)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">RECIPIENT WALLET</span>
                      <span className="text-slate-700">0x71C63dd...F3740D</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Audit on Etherscan</span>
                  <a
                    href={`${ETHERSCAN_BASE_URL}/address/${DEFAULT_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    View Contract <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Portals Section */}
      <section id="features" className="py-24 bg-white border-y border-slate-200/80 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Role-Based Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Engineered for the Entire College Ecosystem
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Three synchronized interfaces provide granular security, rapid attendance logging, and transparent rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Console */}
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50/60 hover:border-navy-500 transition shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold text-xl shadow-md mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Administrator Console</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Full control over student enrollment, faculty accounts, course creation, and automated semester attendance percentage calculations.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Manage students, faculty & subjects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Trigger on-chain reward distribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Comprehensive blockchain audit trail</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link to="/login" className="text-xs font-bold text-navy-900 hover:text-purple-600 flex items-center gap-1 group">
                  <span>Sign In as Administrator</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            {/* Faculty Hub */}
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50/60 hover:border-blue-500 transition shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md mb-6">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Faculty Teaching Hub</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Streamlined daily lecture attendance taking with fast bulk toggles, historical audits, and built-in duplicate prevention.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Select assigned subject & date</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mark Present/Absent with one-click toggles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant duplicate submission protection</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                  <span>Sign In as Faculty</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            {/* Student Portal */}
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50/60 hover:border-purple-500 transition shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Student Incentive Portal</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Subject-wise attendance breakdown, live eligibility status, MetaMask wallet binding, and tamper-proof on-chain reward point balance.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Subject-by-subject attendance progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live smart contract token balance query</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct verification on Sepolia Etherscan</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link to="/login" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group">
                  <span>Sign In as Student</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Automated Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            How the Incentive Protocol Operates
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A seamless bridge between daily college administration and immutable blockchain settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="font-mono text-3xl font-black text-slate-200">01</span>
            <h4 className="text-sm font-bold text-slate-900 mt-3">Attendance Logging</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Faculty marks lecture attendance daily. Records are securely stored in Supabase PostgreSQL with strict RLS policies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="font-mono text-3xl font-black text-slate-200">02</span>
            <h4 className="text-sm font-bold text-slate-900 mt-3">Percentage Evaluation</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              The engine dynamically calculates (Present / Total) × 100 and matches student standing against academic reward slabs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="font-mono text-3xl font-black text-purple-200">03</span>
            <h4 className="text-sm font-bold text-slate-900 mt-3">On-Chain Distribution</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              College Admin triggers reward execution. The Solidity smart contract verifies conditions and disburses points on Sepolia.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="font-mono text-3xl font-black text-emerald-200">04</span>
            <h4 className="text-sm font-bold text-slate-900 mt-3">Public Verification</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Students and evaluators inspect their verifiable cryptographic receipts and token balance via Sepolia block explorer.
            </p>
          </div>
        </div>
      </section>

      {/* Reward Slabs Section */}
      <section id="reward-slabs" className="py-24 bg-slate-900 text-white px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-700/50">
              Incentive Tiers
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Attendance Reward Slabs</h2>
            <p className="text-xs text-slate-400 mt-2">
              Defined criteria for automatic semester reward point allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REWARD_SLABS.map((slab) => (
              <div
                key={slab.label}
                className="rounded-2xl border border-slate-800 p-8 bg-slate-950/60 flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${slab.badgeColor}`}>
                    {slab.label}
                  </span>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{slab.points}</span>
                    <span className="text-sm font-medium text-slate-400">Incentive Points</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{slab.description}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Enforced by Solidity Smart Contract</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Architecture (Supabase + Blockchain) */}
      <section id="architecture" className="py-24 px-6 lg:px-16 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Hybrid Design
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            Why Supabase + Ethereum Blockchain?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            The ideal balance of student data privacy, high-throughput daily operations, and cryptographic immutability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Supabase: Off-Chain Privacy & Speed</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Storing thousands of daily lecture check-ins on a public blockchain would be prohibitively slow and expensive. 
              Supabase PostgreSQL stores student rosters and daily attendance with Row Level Security (RLS), preserving student privacy.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero gas fees for routine daily attendance logging</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Database-level unique constraint on (student, subject, date)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Row Level Security guarantees student record privacy</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Solidity: On-Chain Settlement & Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When semester attendance is finalized, reward points are permanently minted onto the Ethereum Sepolia testnet. 
              Neither students nor administrators can alter historical token balances after on-chain confirmation.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Tamper-proof academic incentive balances</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Smart contract guards against duplicate semester claims</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>MetaMask wallet integration with Sepolia testnet</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="bg-gradient-to-tr from-navy-900 via-slate-900 to-purple-950 text-white py-16 px-6 lg:px-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Experience the Attendance-Linked Incentive System?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            Sign in with your college account to view attendance analytics, mark presence, or audit smart contract transactions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="blockchain" size="md" className="w-full sm:w-auto font-semibold" icon={ArrowRight}>
                Sign In to Portal
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto font-semibold">
                Register New User
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 lg:px-16 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🎓</span>
            <span className="font-bold text-slate-800">AttendIncentive</span>
            <span>• College Attendance & Blockchain Incentive Platform</span>
          </div>
          <div>
            <span>Sepolia Smart Contract: </span>
            <span className="font-mono text-purple-700 font-semibold">{formatAddress(DEFAULT_CONTRACT_ADDRESS)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
