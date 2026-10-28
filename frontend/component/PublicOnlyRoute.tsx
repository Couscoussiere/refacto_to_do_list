import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../service/authService';

// Login / inscription : inutile d'y accéder quand on est déjà connecté.
export default function PublicOnlyRoute() {
    if (isAuthenticated()) {
        return <Navigate to="/projects" replace />;
    }

    return <Outlet />;
}
