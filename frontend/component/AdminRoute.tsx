import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdmin } from '../service/authService';

// Zone d'administration : à placer sous ProtectedRoute ; un compte standard est renvoyé vers ses projets.
// Le contrôle réel est fait par auth-service (403 sur les routes admin).
export default function AdminRoute() {
    if (!isAdmin()) {
        return <Navigate to="/projects" replace />;
    }

    return <Outlet />;
}
