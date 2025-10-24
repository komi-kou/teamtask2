import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Sales from './pages/Sales';
import Projects from './pages/Projects';
import SalesEmails from './pages/SalesEmails';
import ServiceMaterials from './pages/ServiceMaterials';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <h1 className="logo">TeamHub</h1>
          <ul className="nav-menu">
            <li><Link to="/">📊 全体ダッシュボード</Link></li>
            <li><Link to="/sales">👥 顧客管理</Link></li>
            <li><Link to="/projects">📋 案件管理</Link></li>
            <li><Link to="/tasks">✅ タスク管理</Link></li>
            <li><Link to="/documents">📝 議事録・打ち合わせ</Link></li>
            <li><Link to="/sales-emails">📧 営業メール</Link></li>
            <li><Link to="/service-materials">📚 サービス資料</Link></li>
          </ul>
        </nav>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/sales-emails" element={<SalesEmails />} />
            <Route path="/service-materials" element={<ServiceMaterials />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
