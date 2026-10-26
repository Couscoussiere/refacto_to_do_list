import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import Register from './pages/Auth/Register/Register';
import Login from './pages/Auth/Login/Login';
import Landing from './pages/Landing/Landing';
import Home from './pages/Home/Home';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './component/ProtectedRoute';
import PublicOnlyRoute from './component/PublicOnlyRoute';
import SessionExpiredModal from './component/SessionExpiredModal';
import NotificationToast from './component/NotificationToast';
import { getProject, type Project } from './service/projectService';
import { UNAUTHORIZED_EVENT } from './utils/fetchWithAuth';
import { useNotifications } from './hooks/useNotifications';

type AuthPageState = { from?: string; fromLanding?: boolean } | null;

function LoginPage() {
    const navigate = useNavigate();
    const state = useLocation().state as AuthPageState;
    const from = state?.from ?? '/projects';
    return (
        <Login
            animateIn={state?.fromLanding === true}
            onGoToRegister={() => navigate('/register')}
            onSuccess={() => navigate(from, { replace: true })}
        />
    );
}

function RegisterPage() {
    const navigate = useNavigate();
    const state = useLocation().state as AuthPageState;
    return (
        <Register
            animateIn={state?.fromLanding === true}
            onGoToLogin={() => navigate('/login')}
            onSuccess={() => navigate('/projects', { replace: true })}
        />
    );
}

function HomePage() {
    const navigate = useNavigate();
    return (
        <Home
            onLogout={() => navigate('/login')}
            onOpenProject={(p: Project) => navigate(`/projects/${p.id}`, { state: { project: p } })}
        />
    );
}

function ProjectDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const projectId = Number(id);
    // Le projet est passé par la navigation depuis la liste ; sinon (rechargement,
    // lien direct) on le récupère auprès de project-service.
    const fromState = (location.state as { project?: Project } | null)?.project;
    const [project, setProject] = React.useState<Project | null>(fromState?.id === projectId ? fromState : null);
    const [notFound, setNotFound] = React.useState(false);

    React.useEffect(() => {
        if (project) return;
        if (!Number.isInteger(projectId) || projectId <= 0) {
            setNotFound(true);
            return;
        }
        getProject(projectId).then(setProject).catch(() => setNotFound(true));
    }, [projectId, project]);

    if (notFound) return <Navigate to="/projects" replace />;
    if (!project) return null;

    return (
        <ProjectDetail
            project={project}
            onBack={() => navigate('/projects')}
            onLogout={() => navigate('/login')}
        />
    );
}

export default function App() {
    const navigate = useNavigate();
    const [sessionExpired, setSessionExpired] = React.useState(false);
    const { notifications, dismiss } = useNotifications();

    React.useEffect(() => {
        const handler = () => setSessionExpired(true);
        window.addEventListener(UNAUTHORIZED_EVENT, handler);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
    }, []);

    const handleReconnect = () => {
        setSessionExpired(false);
        navigate('/login');
    };

    return (
        <>
            <Routes>
                {/* Accessible à tous */}
                <Route path="/" element={<Landing />} />

                {/* Réservé aux visiteurs non connectés */}
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Réservé aux utilisateurs connectés */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/projects" element={<HomePage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            {sessionExpired && <SessionExpiredModal onReconnect={handleReconnect} />}
            <NotificationToast notifications={notifications} onDismiss={dismiss} />
        </>
    );
}
