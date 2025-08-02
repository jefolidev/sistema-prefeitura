// notAuthenticated.tsx
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/login/login';

const NotAuthenticatedRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default NotAuthenticatedRoutes;