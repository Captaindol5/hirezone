import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || authError || 'Unable to sign in. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-shell min-h-screen relative font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100 flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[var(--bg-secondary)]/80 backdrop-blur-3xl border border-[var(--border-color)] rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 flex flex-col items-center">
        
        <Link to="/" className="absolute top-6 left-6 text-[var(--text-muted)] hover:text-orange-500 transition-colors p-2 bg-[var(--bg-primary)]/50 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute top-8 right-8 flex items-center gap-2 text-emerald-500 text-sm font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck size={16} /> Secure
        </div>

        <div className="mb-10 flex justify-center mt-4">
          <img src="/logo.png" alt="HireZone Logo" className="h-16 object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="HireZone Logo" className="h-16 object-contain hidden dark:block" />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
            <LockKeyhole size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-headers)] tracking-tight">Welcome back</h1>
          <p className="text-[var(--text-muted)] mt-2 font-medium">Sign in to the HireZone Portal</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-bold text-[var(--text-headers)] mb-2 ml-1">Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              required 
              className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-full py-4 px-6 text-[var(--text-headers)] text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-headers)] mb-2 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password" 
              required 
              className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-full py-4 px-6 text-[var(--text-headers)] text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
            />
          </div>

          {error && <ErrorModal error={error} onClose={() => setError('')} />}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-full py-4 mt-4 shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign in to portal'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;