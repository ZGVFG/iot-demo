import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/login'
import Register from './pages/Register'
import MainLayout from './layouts/MainLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  )
}
