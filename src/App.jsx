import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import LandingPage from './pages/LandingPage'
import DedicatedSignIn from './pages/DedicatedSignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import AddListing from './pages/AddListing'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Messages from './pages/Messages'
import Dashboard from './pages/Dashboard'
import LandlordDashboard from './pages/LandlordDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminOverview from './pages/admin/AdminOverview'
import AdminVerifications from './pages/admin/AdminVerifications'
import AdminPhotos from './pages/admin/AdminPhotos'
import AdminUsers from './pages/admin/AdminUsers'
import AdminListings from './pages/admin/AdminListings'
import AdminSync from './pages/admin/AdminSync'
import AdminClaims from './pages/admin/AdminClaims'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import FairHousing from './pages/FairHousing'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' }}/>
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<DedicatedSignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/listings" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/my-property" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
      <Route path="/property-dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminOverview /></ProtectedRoute>} />
      <Route path="/admin/verifications" element={<ProtectedRoute><AdminVerifications /></ProtectedRoute>} />
      <Route path="/admin/photos" element={<ProtectedRoute><AdminPhotos /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/listings" element={<ProtectedRoute><AdminListings /></ProtectedRoute>} />
      <Route path="/admin/sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />
      <Route path="/admin/claims" element={<ProtectedRoute><AdminClaims /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/fair-housing" element={<FairHousing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
