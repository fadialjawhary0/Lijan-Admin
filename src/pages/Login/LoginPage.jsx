import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import devoteamLogo from '../../assets/Devoteam_logo.png';
import backgroundImage from '../../assets/Background2.jpg';
import { useLoginMutation } from '../../queries/auth';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user-management', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { mutate: login } = useLoginMutation();

  const validateFields = () => {
    const errors = {
      username: !username.trim(),
      password: !password.trim(),
    };

    setFieldErrors(errors);

    if (error) {
      setError('');
    }

    return !errors.username && !errors.password;
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFields()) {
      setError('Please enter both username and password.');
      setIsLoading(false);
      return;
    }

    login(
      { username, password },
      {
        onSuccess: response => {
          setIsLoading(false);
          if (response.succeeded) {
            authLogin(response);
            navigate('/user-management');
          } else {
            const errorMessage = response.errors && response.errors.length > 0 ? 'Invalid username or password.' : 'Something went wrong.';
            setError(errorMessage);
          }
        },
        onError: error => {
          setIsLoading(false);
          const errorMessage = error.response?.data?.errors?.[0] || error.message || 'Invalid username or password.';
          setError(errorMessage);
        },
      }
    );
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }

    if (error) {
      setError('');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left image section */}
      <div className="hidden md:flex w-0 md:w-2/3 h-screen">
        <img src={backgroundImage} alt="Digital transformation" className="object-cover w-full h-full" />
      </div>
      {/* Right form section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/3 bg-white px-6 py-8 shadow-lg z-10">
        <img src={devoteamLogo} alt="Devoteam Logo" className="w-40 mb-6" />
        <h2 className="text-xl font-semibold mb-2">Admin Portal - Sign in</h2>
        <form className="w-full max-w-xs flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={e => handleInputChange('username', e.target.value)}
            className={`input-admin px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-primary ${
              fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
            }`}
            autoFocus
            disabled={isLoading}
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => handleInputChange('password', e.target.value)}
              className={`input-admin px-3 py-2 pr-10 rounded border focus:outline-none focus:ring-2 focus:ring-primary w-full ${
                fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={isLoading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className={`${
              isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary'
            } w-full text-white py-2 rounded font-semibold hover:bg-primary-dark transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
