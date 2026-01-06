import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUser } from '../services/auth.service';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(formData.email, formData.password);
      // Assuming response.data contains the token, adjust based on actual API response
      // Commonly: { code: 200, message: "...", data: "token" } or similar
      // Let's assume response.data is the token or response contains token
      // If API returns { code: 200, data: "tokenstring" }
      
      const token = response.data || response.token; // Fallback
      if (token) {
        localStorage.setItem('token', token);
        // Also store user info if available
        if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        navigate('/dashboard');
      } else {
         // If structure is different, we might need to debug. For now assume standard.
         setError('Token not found in response');
      }

    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign in</h2>
        <p className="auth-subtitle">Use your Fundoo Account</p>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-actions">
            <Link to="/register" className="auth-link">Create account</Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
