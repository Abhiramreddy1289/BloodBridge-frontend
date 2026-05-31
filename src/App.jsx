import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FindDonor = lazy(() => import('./pages/FindDonor'));
const BloodBanks = lazy(() => import('./pages/BloodBanks'));
const RequestBlood = lazy(() => import('./pages/RequestBlood'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Camps = lazy(() => import('./pages/Camps'));
const Stories = lazy(() => import('./pages/Stories'));
const Guides = lazy(() => import('./pages/Guides'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Profile = lazy(() => import('./pages/Profile'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const MyDonations = lazy(() => import('./pages/MyDonations'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminRequests = lazy(() => import('./pages/AdminRequests'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const About = lazy(() => import('./pages/About'));
const Join = lazy(() => import('./pages/Join'));
const RequestDetails = lazy(() => import('./pages/RequestDetails'));

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Suspense fallback={<div className="rounded-3xl bg-white p-10 text-center font-bold text-slate-500 shadow-soft">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/join" element={<Join />} />
              <Route path="/about" element={<About />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/camps" element={<Camps />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blood-banks" element={<BloodBanks />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/find-donor" element={<ProtectedRoute><FindDonor /></ProtectedRoute>} />
              <Route path="/request-blood" element={<ProtectedRoute><RequestBlood /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
              <Route path="/my-donations" element={<ProtectedRoute><MyDonations /></ProtectedRoute>} />
              <Route path="/requests/:id" element={<ProtectedRoute><RequestDetails /></ProtectedRoute>} />
              
              {/* Admin Protected Routes */}
              <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/requests" element={<ProtectedRoute adminOnly={true}><AdminRequests /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute adminOnly={true}><AdminAnalytics /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
