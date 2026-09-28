import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';

export const LoginPage: React.FC = () => {
  const { login, register, setActivePage } = useStudyVault();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up (New User) form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [major, setMajor] = useState('Computer Science');
  const [semester, setSemester] = useState('Semester 3');
  const [targetHours, setTargetHours] = useState(4);

  const popularMajors = [
    'Computer Science',
    'Data Science',
    'Electrical Eng.',
    'Mechanical Eng.',
    'Medicine / Pre-Med',
    'Business Administration',
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    const res = await login(signInEmail, signInPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid university or personal email.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password should be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      major,
      semester,
      targetDailyHours: targetHours,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Could not complete registration.');
    }
  };

  const handleQuickGuest = async () => {
    setLoading(true);
    const guestEmail = `student_${Math.random().toString(36).substring(2, 7)}@studyvault.ai`;
    await register({
      name: 'New Student',
      email: guestEmail,
      password: 'guest',
      major: 'Computer Science',
      semester: 'Semester 1',
      targetDailyHours: 3.5,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen liquid-bg-atmosphere text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600/30">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-glow border border-white/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">Studyvault</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Feature Highlights (Hidden on small screens) */}
          <div className="hidden lg:block lg:col-span-5 space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Adaptive Study Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Start fresh with your personal{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
                StudyVault.
              </span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Experience an intelligent academic assistant that analyzes your syllabus, creates custom study blocks, and autonomously protects your exam countdown.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Clean & Tailored Environment</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Zero sample clutter. Every course, timetable slot, and exam belongs exclusively to you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Autonomous Session Rebalancing</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Missed a lecture or busy day? StudyVault re-partitions topics across upcoming open hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card (7 cols) */}
          <div className="lg:col-span-7">
            <GlassCard
              variant="elevated"
              rounded="lg"
              className="p-6 sm:p-8 border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
            >
              {/* Tab Selector */}
              <div className="flex items-center p-1 rounded-xl bg-dark-900/80 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'signin'
                      ? 'bg-blue-600 text-white shadow-tactile'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'signup'
                      ? 'bg-blue-600 text-white shadow-tactile'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account (New User)
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ─── SIGN IN FORM ─── */}
              {mode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@university.edu"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">Password</label>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full shadow-blue-glow font-semibold mt-2"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {loading ? 'Signing In...' : 'Sign In to StudyVault'}
                  </Button>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Register as New User →
                    </button>
                  </div>
                </form>
              ) : (
                /* ─── CREATE ACCOUNT (NEW USER) FORM ─── */
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <UserIcon className="absolute left-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maya Lin"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="maya@college.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="Choose password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Semester / Level
                      </label>
                      <div className="relative flex items-center">
                        <Calendar className="absolute left-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Semester 4, Year 2"
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Major / Degree */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Major / Field of Study
                    </label>
                    <div className="relative flex items-center">
                      <GraduationCap className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Computer Science, Mechanical Eng."
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-900/80 text-white text-sm border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {popularMajors.map((pm) => (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => setMajor(pm)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            major === pm
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-white/[0.02] text-slate-400 border-white/[0.05] hover:text-white'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily Study Capacity Target */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">
                        Target Daily Study Capacity
                      </label>
                      <span className="font-mono font-bold text-cyan-300">
                        {targetHours} hours / day
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={0.5}
                      value={targetHours}
                      onChange={(e) => setTargetHours(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 bg-dark-900 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Light (2h)</span>
                      <span>Balanced (4h)</span>
                      <span>Intensive (6h+)</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full shadow-blue-glow font-semibold mt-2"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {loading ? 'Creating Vault...' : 'Create Account & Start Fresh'}
                  </Button>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Sign in here →
                    </button>
                  </div>
                </form>
              )}

              {/* Guest / Demo Option */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] text-center">
                <button
                  type="button"
                  onClick={handleQuickGuest}
                  disabled={loading}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explore as Guest Student (Clean Slate)</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
