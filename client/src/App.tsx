import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './router/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DocumentEditor from './pages/DocumentEditor'
import AiGenerator from './pages/AiGenerator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>}/>
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/document/:id"
          element={
            <ProtectedRoute>
              <DocumentEditor/>
            </ProtectedRoute>
          }
        />
        <Route
        path='/ai-generator'
        element={
          <ProtectedRoute>
            <AiGenerator />
          </ProtectedRoute>
        }
        ></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
