import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useLoading } from '../../lib/LoadingContext';
const Login = () => {
  const { loading, setLoading } = useLoading();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-green-200 p-4 rounded-lg inset-shadow-zinc-300 space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            LOGIN
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email or username</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email or username"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 bg-amber-50 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>
          <div className='flex justify-between'>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Not a member?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register
              </Link>
            </p>
          </div>
          <div>
            <button
              type="submit"
              className="border rounded-full pl-4 pr-4 mt-1 bg-blue-600 text-gray-50 p-1" disabled={loading} 
              >
             {loading ? 'Loading...' : 'Login'}
                
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Login;