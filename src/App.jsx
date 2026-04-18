import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import AddListing from './pages/AddListing'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '3px solid #e8f0fe',
        borderTop: '3px solid #1a6cf5',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <p style={{ color: '#64748b', fontSize: 14 }}>Loading Chathouse...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
      <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
