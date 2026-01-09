import { useState, useEffect } from 'react';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (token: string, role: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole('');
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Fleet Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">Dashboard content coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default App;