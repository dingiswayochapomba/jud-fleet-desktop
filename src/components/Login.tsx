import { useState } from 'react';
import { Eye, Truck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, role: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      const body = isSignup
        ? { firstName, lastName, email, password }
        : { email, password };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || (isSignup ? 'Registration failed' : 'Login failed'));
        setLoading(false);
        return;
      }

      // Success
      onLoginSuccess(data.data.token, data.data.role);
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running on port 3000.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c24] min-h-screen w-screen flex items-center justify-center p-0">
      <div className="w-screen h-screen bg-[#C5C5C5] overflow-hidden flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="hidden md:block w-1/2 relative">
          <a href="#" className="absolute top-6 left-6 text-white text-2xl font-bold z-10">ARK</a>
          <a href="#" className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors z-10">
            Back to website →
          </a>
          <div className="relative w-full h-full">
            <img
              src="/src/assets/images/2.jpg"
              alt="Fleet Management Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#D25353]/30"></div>
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
              <div className="flex justify-center mb-6">
                <img
                  src="/src/assets/images/logo.png"
                  alt="Judiciary Logo"
                  className="w-28 h-32 object-contain"
                />
              </div>
              <h1 className="text-gray-900 text-lg md:text-2xl font-semibold mb-1 text-center">
                {isSignup ? 'Create an account' : 'Log in'}
              </h1>
              <p className="text-gray-600 mb-6 text-sm text-center">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                  className="text-[#EA7B7B] hover:underline ml-1 font-semibold"
                >
                  {isSignup ? 'Log in' : 'Sign up'}
                </button>
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded-lg text-xs mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignup && (
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full md:w-1/2 bg-white text-gray-900 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] placeholder-gray-500"
                      required={isSignup}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full md:w-1/2 bg-white text-gray-900 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] placeholder-gray-500"
                      required={isSignup}
                    />
                  </div>
                )}

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
                    placeholder={isSignup ? 'Enter your password' : 'Password'}
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

                {isSignup && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="rounded bg-white border-gray-400 text-[#EA7B7B] focus:ring-[#EA7B7B]"
                    />
                    <span className="text-gray-400 text-sm">
                      I agree to the{' '}
                      <a href="#" className="text-white hover:underline">
                        Terms & Conditions
                      </a>
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EA7B7B] text-white rounded-lg p-2 text-sm hover:bg-[#D25353] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? (isSignup ? 'Creating account...' : 'Logging in...') : (isSignup ? 'Create account' : 'Log in')}
                </button>

                {!isSignup && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-[#13131a] text-gray-400">Or register with</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      <button
                        type="button"
                        className="w-full md:w-1/2 flex items-center justify-center gap-2 bg-white text-gray-900 rounded-lg p-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                          />
                        </svg>
                        Google
                      </button>
                      <button
                        type="button"
                        className="w-full md:w-1/2 flex items-center justify-center gap-2 bg-white text-gray-900 rounded-lg p-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M17.05,11.97 C17.0389275,10.3054167 18.4521905,9.39916667 18.5,9.36833333 C17.6895905,8.17 16.4353095,7.94416667 15.9415476,7.91916667 C14.9047619,7.81166667 13.9057143,8.49333333 13.3790476,8.49333333 C12.8335714,8.49333333 11.9902381,7.93083333 11.1297619,7.94416667 C10.0233333,7.95916667 8.99642857,8.57583333 8.41309524,9.54833333 C7.20119048,11.5375 8.11357143,14.4758333 9.27357143,16.0708333 C9.86357143,16.8533333 10.5511905,17.7283333 11.4597619,17.7016667 C12.3422619,17.6716667 12.6915476,17.1466667 13.7473809,17.1466667 C14.7897619,17.1466667 15.1161905,17.7016667 16.0422619,17.6866667 C16.995,17.6716667 17.5922619,16.8925 18.1647619,16.1 C18.8576191,15.1866667 19.1397619,14.2916667 19.1522619,14.2466667 C19.1272619,14.2375 17.0647619,13.4366667 17.05,11.97"
                          />
                        </svg>
                        Apple
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
