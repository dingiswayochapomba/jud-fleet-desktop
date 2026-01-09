import { useState } from 'react';
import { Eye, Truck } from 'lucide-react';

interface LoginProps {
  initSupabase: () => Promise<any>;
}

export default function Login({ initSupabase }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const supabase = await initSupabase();
      
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Success
      setSuccessMessage('Login successful!');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c24] min-h-screen w-screen flex items-center justify-center p-0">
      <div className="w-screen h-screen bg-[#C5C5C5] overflow-hidden flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="hidden md:block w-1/2 relative">
          <div className="relative w-full h-full">
            <img
              src="/src/assets/images/2.jpg"
              alt="Fleet Management Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Truck size={40} className="text-white mb-4" />
              <h2 className="text-3xl font-bold text-center">Judiciary Fleet Management System</h2>
              <p className="text-center text-sm text-white/80 max-w-xs mt-4">Efficient fleet management and vehicle tracking</p>
            </div>
          </div>
        </div>

        {/* Right Section - Scrollable */}
        <div className="w-full md:w-1/2 h-screen md:overflow-y-auto overflow-y-auto flex flex-col relative">
          <div className="p-4 md:p-8 flex-1 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-gray-900 text-lg md:text-2xl font-semibold mb-6 text-center">
                Log in
              </h1>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-xs mb-3">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 px-3 py-2 rounded-lg text-xs mb-3">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-gray-900 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] placeholder-gray-500"
                  required
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-gray-900 rounded-lg p-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EA7B7B] text-white rounded-lg p-2 text-sm hover:bg-[#D25353] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
