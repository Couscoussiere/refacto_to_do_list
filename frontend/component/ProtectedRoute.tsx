import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../service/authService';

// Zones réservées aux utilisateurs connectés : sinon redirection vers /login,
// en mémorisant la page demandée pour y revenir après connexion.
export default function ProtectedRoute() {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
