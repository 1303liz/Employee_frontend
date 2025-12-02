import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { useAuth } from './hooks/useAuth';
import './index.css';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      <div className="app-container">
        {user && <Sidebar />}
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
      {user && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
