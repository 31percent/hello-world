import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import GamesList from './components/GamesList';
import PokerTable from './components/PokerTable';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const GameRoute: React.FC = () => {
  const gameId = window.location.pathname.split('/game/')[1];
  
  if (!gameId) {
    return <Navigate to="/games" />;
  }

  return <PokerTable gameId={gameId} />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/games" /> : <LoginPage />} 
      />
      <Route 
        path="/games" 
        element={
          <ProtectedRoute>
            <GamesList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/game/:gameId" 
        element={
          <ProtectedRoute>
            <GameRoute />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/games" : "/login"} />} 
      />
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/games" : "/login"} />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
