import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Login from './components/LoginForm'
import Dashboard from './components/Dashboard'
import RegisterForm from './components/RegisterForm'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify'

function App() {
  return(
    <>
    <Navbar/>
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<RegisterForm />} />
    <Route path="/dashboard" element={
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    } />
  </Routes>
  <ToastContainer />
    </>
  );
}

export default App
