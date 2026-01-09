import { useState } from 'react';
import { Eye, Truck, Loader } from 'lucide-react';

interface LoginProps {
  initSupabase: () => Promise<any>;
  onLoginSuccess?: () => void;
}

export default function Login({ initSupabase, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = await initSupabase();

      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in.');
        } else {
          setError(signInError.message || 'Login failed');
        }
        setLoading(false);
        return;
      }

      if (data?.session) {
        console.log('✓ Login successful:', data.session.user.email);
        setEmail('');
        setPassword('');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError('Login failed: No session created');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-0 bg-gray-100">
      <div className="w-screen h-screen bg-white overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Background Image */}
        <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="relative w-full h-full">
            <img
              src="/src/assets/images/2.jpg"
              alt="Fleet Management Background"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Truck size={48} className="text-white mb-4" />
              <h2 className="text-4xl font-bold text-center mb-2">Judiciary Fleet</h2>
              <h2 className="text-4xl font-bold text-center mb-4">Management System</h2>
              <p className="text-center text-lg text-white/90 max-w-xs">Efficient fleet management and vehicle tracking</p>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full md:w-1/2 h-screen flex flex-col items-center justify-center p-6 md:p-8 bg-white">
          <div className="w-full max-w-sm">
            {/* Mobile Header */}
            <div className="md:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Truck size={32} className="text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Fleet Manager</h1>
              <p className="text-gray-600 text-sm mt-1">Judiciary Fleet Management System</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 text-sm mt-2">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">📋 Demo Credentials:</p>
              <p className="text-xs text-blue-800 font-mono mb-1">Email: dingiswayochapomba@gmail.com</p>
              <p className="text-xs text-blue-800 font-mono">Password: @malawi2017</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
