import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import QRLogin from './pages/QRLogin';
import Welcome from './pages/Welcome';
import Shopping from './pages/Shopping';
import ErrorPage from './pages/ErrorPage';
import ThankYou from './pages/ThankYou';
import Admin from './pages/Admin';
import CashierPage from './pages/CashierPage';

function App() {
  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<QRLogin />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/success" element={<ThankYou />} />
          <Route path="/admin-portal" element={<Admin />} />
          <Route path="/cashier-portal" element={<CashierPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
