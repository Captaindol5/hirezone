import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleMeta = {
  candidate: { label: 'Candidate Portal', accent: 'emerald' },
  hr: { label: 'HR / Hiring Manager Portal', accent: 'cyan' },
  hiring_manager: { label: 'Hiring Manager Portal', accent: 'amber' },
  interviewer: { label: 'Interviewer Portal', accent: 'violet' },
  manager: { label: 'Executive Manager Portal', accent: 'orange' },
};

const getRedirectPath = (role) => {
  if (!role) return '/dashboard';
  if (role === 'candidate') return '/portal/candidate';
  if (role === 'interviewer') return '/portal/interviewer';
  if (role === 'hr' || role === 'hiring_manager') return '/portal/hr';
  if (role === 'manager') return '/portal/analytics';
  return '/dashboard';
};

const LoginPage = () => {
  const { role } = useParams();
  const resolvedRole = roleMeta[role] ? role : 'candidate';
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
      await login(email, password, resolvedRole);
      navigate(getRedirectPath(resolvedRole));
    } catch (err) {
      setError(err.message || authError || 'Unable to sign in. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-shell">
      <div className="auth-card">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain hidden dark:block" />
        </div>
        <div className="auth-header">
          <Link to="/login" className="back-link"><ArrowLeft size={16} /> Choose portal</Link>
          <div className="auth-badge">
            <ShieldCheck size={16} />
            Secure access
          </div>
        </div>

        <div className="auth-copy">
          <div className={`auth-icon ${roleMeta[resolvedRole].accent}`}>
            <LockKeyhole size={24} />
          </div>
          <div>
            <p className="eyebrow">Sign in</p>
            <h1>{roleMeta[resolvedRole].label}</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <label>
            <span>Email address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="primary-btn block-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in to portal'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;