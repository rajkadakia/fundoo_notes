import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { LabelProvider } from './context/LabelContext';
import { SearchProvider } from './context/SearchContext';
import './index.css';

function App() {
  return (
    <Router>
      <SearchProvider>
        <LabelProvider>
          <div className="app-container">
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            
            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard type="notes" />} />
              <Route path="/archive" element={<Dashboard type="archive" />} />
              <Route path="/trash" element={<Dashboard type="trash" />} />
              <Route path="/label/:labelId" element={<Dashboard type="label" />} />
            </Route>
            
            {/* Redirect root to login for now */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </div>
      </LabelProvider>
      </SearchProvider>
    </Router>
  );
}

export default App;
