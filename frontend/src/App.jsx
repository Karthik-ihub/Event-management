import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/signin';
import AdminSignin from './pages/adminsignin';
import CreateEvent from './pages/create-event';
import Dashboard from './pages/dashboard';
import UserDashboard from './pages/userdashboard';
import Home from './pages/home';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import CreateEvent from './pages/CreateEvent';
// import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/adminsignin" element={<AdminSignin />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/create-event" element={<CreateEvent />} />
        <Route path="/user/home" element={<Home />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

