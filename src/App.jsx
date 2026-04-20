import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import AddListing from './pages/AddListing'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import AdminOverview from './pages/admin/AdminOverview'
import AdminVerifications from './pages/admin/AdminVerifications'
import AdminPhotos from './pages/admin/AdminPhotos'
import AdminUsers from './pages/admin/AdminUsers'
import AdminListings from './pages/admin/AdminListings'
import AdminSync from './pages/admin/AdminSync'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import FairHousing from './pages/FairHousing'

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
      <Route path="/" element={<Home />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminOverview /></ProtectedRoute>} />
      <Route path="/admin/verifications" element={<ProtectedRoute><AdminVerifications /></ProtectedRoute>} />
      <Route path="/admin/photos" element={<ProtectedRoute><AdminPhotos /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/listings" element={<ProtectedRoute><AdminListings /></ProtectedRoute>} />
      <Route path="/admin/sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/fair-housing" element={<FairHousing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
