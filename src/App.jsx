import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { GlobalStyles, Spinner } from './components/ui'
import LandingPage from './pages/LandingPage'
import DedicatedSignIn from './pages/DedicatedSignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import AddListing from './pages/AddListing'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Messages from './pages/Messages'
import Saved from './pages/Saved'
import Dashboard from './pages/Dashboard'
import LandlordDashboard from './pages/LandlordDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminOverview from './pages/admin/AdminOverview'
import AdminVerifications from './pages/admin/AdminVerifications'
import AdminPhotos from './pages/admin/AdminPhotos'
import AdminUsers from './pages/admin/AdminUsers'
import AdminListings from './pages/admin/AdminListings'
import AdminArchived from './pages/admin/AdminArchived'
import AdminSync from './pages/admin/AdminSync'
import AdminClaims from './pages/admin/AdminClaims'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import FairHousing from './pages/FairHousing'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={32} label="Loading Chathouse..." />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

// Validates UUID v4-ish format (loose — covers any 8-4-4-4-12 hex pattern)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/* ============================================================
   Captures ?ref={userId} from URL and stashes it in localStorage.
   Read & applied during signup flow (email + Google OAuth).
   - Runs once on App mount
   - Validates UUID format before storing
   - Doesn't overwrite an existing pending_ref (first invite wins)
   ============================================================ */
function captureReferral() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (!ref) return
  if (!UUID_REGEX.test(ref)) return
  // Don't overwrite — first invite a user clicks gets credit
  if (localStorage.getItem('chathouse_pending_ref')) return
  localStorage.setItem('chathouse_pending_ref', ref)
}

export default function App() {
  useEffect(() => {
    captureReferral()
  }, [])

  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<DedicatedSignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/listings" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-property" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/property-dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        {/* Public profile route — Profile.jsx internally gates consumer (buyer/renter)
            profiles for signed-out viewers using the SignedOutGate component. */}
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/admin" element={<ProtectedRoute><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/verifications" element={<ProtectedRoute><AdminVerifications /></ProtectedRoute>} />
        <Route path="/admin/photos" element={<ProtectedRoute><AdminPhotos /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/listings" element={<ProtectedRoute><AdminListings /></ProtectedRoute>} />
        <Route path="/admin/archived" element={<ProtectedRoute><AdminArchived /></ProtectedRoute>} />
        <Route path="/admin/sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />
        <Route path="/admin/claims" element={<ProtectedRoute><AdminClaims /></ProtectedRoute>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/fair-housing" element={<FairHousing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}