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
    <div className="landing-shell min-h-screen relative font-sans bg-[#fbfbfc] dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors selection:bg-orange-500/30 flex items-center justify-center p-6">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-20 pointer-events-none bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-12 shadow-2xl shadow-black/5 flex flex-col items-center rounded-2xl">
        
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-orange-500 transition-colors p-2">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute top-8 right-8 flex items-center gap-2 text-emerald-500 text-xs tracking-widest font-bold uppercase">
          <ShieldCheck size={16} /> Secure
        </div>

        <div className="mb-10 flex justify-center mt-6">
          <img src="/logo.png" alt="HireZone Logo" className="h-10 object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="HireZone Logo" className="h-10 object-contain hidden dark:block" />
        </div>

        <div className="text-center mb-10 w-full">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back.</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Sign in to the HireZone Portal</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              required 
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 text-gray-900 dark:text-white text-lg outline-none focus:border-orange-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password" 
              required 
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 text-gray-900 dark:text-white text-lg outline-none focus:border-orange-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 rounded-none"
            />
          </div>

          {error && <ErrorModal error={error} onClose={() => setError('')} />}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm tracking-widest uppercase rounded-xl py-5 mt-8 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign in to portal'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;