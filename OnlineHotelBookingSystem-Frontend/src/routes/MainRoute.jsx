import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserRouter from './UserRouter';
import ManagerRouter from './ManagerRouter';
import AdminRouter from './AdminRouter';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import { useAuth } from '../context/AuthContext';

const MainRoute = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {!userRole && <Route path="*" element={<Navigate to="/login" replace />} />}
        {userRole === 'CUSTOMER' && <Route path="/*" element={<UserRouter />} />}
        {userRole === 'HOTELMANAGER' && <Route path="/*" element={<ManagerRouter />} />}
        {userRole === 'ADMIN' && <Route path="/*" element={<AdminRouter />} />}
      </Routes>
    </Router>
  );
};

export default MainRoute;
