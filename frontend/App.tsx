import React from 'react';
import Register from './pages/Auth/Register/Register';
import Login from './pages/Auth/Login/Login';
import Home from './pages/Home/Home';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Admin from './pages/Admin/Admin';
import SessionExpiredModal from './component/SessionExpiredModal';
import NotificationToast from './component/NotificationToast';
import { isAuthenticated, isAdmin } from './service/authService';
import { type Project } from './service/projectService';
import { UNAUTHORIZED_EVENT } from './utils/fetchWithAuth';
import { useNotifications } from './hooks/useNotifications';

type Page = 'register' | 'login' | 'home' | 'project' | 'admin';

export default function App() {
    const [page, setPage] = React.useState<Page>(isAuthenticated() ? 'home' : 'register');
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [sessionExpired, setSessionExpired] = React.useState(false);
    const { notifications, dismiss } = useNotifications();

    React.useEffect(() => {
        const handler = () => setSessionExpired(true);
        window.addEventListener(UNAUTHORIZED_EVENT, handler);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
    }, []);

    const openProject = (project: Project) => {
        setSelectedProject(project);
        setPage('project');
    };

    const handleReconnect = () => {
        setSessionExpired(false);
        setPage('login');
    };

    let content: React.ReactNode;
    if (page === 'admin' && isAdmin()) {
        content = <Admin onBack={() => setPage('home')} />;
    } else if (page === 'project' && selectedProject) {
        content = (
            <ProjectDetail
                project={selectedProject}
                onBack={() => setPage('home')}
                onLogout={() => setPage('login')}
            />
        );
    } else if (page === 'home' || page === 'admin') {
        // Un non-admin qui atteint 'admin' retombe sur l'accueil
        content = (
            <Home
                onLogout={() => setPage('login')}
                onOpenProject={openProject}
                onOpenAdmin={() => setPage('admin')}
            />
        );
    } else if (page === 'login') {
        content = <Login onGoToRegister={() => setPage('register')} onSuccess={() => setPage('home')} />;
    } else {
        content = <Register onGoToLogin={() => setPage('login')} onSuccess={() => setPage('home')} />;
    }

    return (
        <>
            {content}
            {sessionExpired && <SessionExpiredModal onReconnect={handleReconnect} />}
            <NotificationToast notifications={notifications} onDismiss={dismiss} />
        </>
    );
}
