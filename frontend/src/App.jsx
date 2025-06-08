import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Login from "./Components/auth/Login";
import Home from "./Home";
import Forget from "./Components/auth/Forget";
import Reset from "./Components/auth/Reset";
import Admin from "./Components/Dashboard/Admin";
import Students from "./Components/Dashboard/Students";
import Enseignants from "./Components/Dashboard/Enseignants";
import Pro from "./Components/Dashboard/Pro";
import Statistics from "./Components/Dashboard/Statistics";
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './Components/auth/PrivateRoute';
import ProfileCompletion from './Components/Dashboard/WelcomeProfileCompletion.jsx';
import FirstLoginRedirect from './Components/auth/FirstLoginRedirect.jsx';
import ProfessorQuestionnaires from "./Components/ProfessorQuestionnaires.jsx";
import ProQuestionnaires from "./Components/ProQuestionnaires.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget" element={<Forget />} />
        <Route path="/reset-password" element={<Reset />} /> {/* Add this line for the Reset component */}
          <Route path="/redirect" element={<FirstLoginRedirect />} />

          {/* 🔐 Routes protégées */}
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
           <Route path="/ProfileCompletion" element={
            <PrivateRoute>
              <ProfileCompletion />
            </PrivateRoute>
          } />
          <Route path="/admin/etud" element={
            <PrivateRoute>
              <Students />
            </PrivateRoute>
          } />
          <Route path="/admin/ens" element={
            <PrivateRoute>
              <Enseignants />
            </PrivateRoute>
          } />
          <Route path="/admin/pro" element={
            <PrivateRoute>
              <Pro />
            </PrivateRoute>
          } />
          <Route path="/admin/statistics" element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          } />
          <Route path="/enseignant/dashboard" element={
            <PrivateRoute>
              <ProfessorQuestionnaires />
            </PrivateRoute>
          } />
          <Route path="pro/dashboard" element={
            <PrivateRoute>
              <ProQuestionnaires />
            </PrivateRoute>
          } />
          
        
        
        </Routes>
      </Router>
    </AuthProvider>
  );
}
