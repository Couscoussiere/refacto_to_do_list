"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importDefault(require("react"));
const Register_1 = __importDefault(require("./pages/Auth/Register/Register"));
const Login_1 = __importDefault(require("./pages/Auth/Login/Login"));
const Home_1 = __importDefault(require("./pages/Home/Home"));
const ProjectDetail_1 = __importDefault(require("./pages/ProjectDetail/ProjectDetail"));
const SessionExpiredModal_1 = __importDefault(require("./component/SessionExpiredModal"));
const NotificationToast_1 = __importDefault(require("./component/NotificationToast"));
const authService_1 = require("./service/authService");
const fetchWithAuth_1 = require("./utils/fetchWithAuth");
const useNotifications_1 = require("./hooks/useNotifications");
function App() {
    const [page, setPage] = react_1.default.useState((0, authService_1.isAuthenticated)() ? 'home' : 'register');
    const [selectedProject, setSelectedProject] = react_1.default.useState(null);
    const [sessionExpired, setSessionExpired] = react_1.default.useState(false);
    const { notifications, dismiss } = (0, useNotifications_1.useNotifications)();
    react_1.default.useEffect(() => {
        const handler = () => setSessionExpired(true);
        window.addEventListener(fetchWithAuth_1.UNAUTHORIZED_EVENT, handler);
        return () => window.removeEventListener(fetchWithAuth_1.UNAUTHORIZED_EVENT, handler);
    }, []);
    const openProject = (project) => {
        setSelectedProject(project);
        setPage('project');
    };
    const handleReconnect = () => {
        setSessionExpired(false);
        setPage('login');
    };
    let content;
    if (page === 'project' && selectedProject) {
        content = (<ProjectDetail_1.default project={selectedProject} onBack={() => setPage('home')} onLogout={() => setPage('login')}/>);
    }
    else if (page === 'home') {
        content = <Home_1.default onLogout={() => setPage('login')} onOpenProject={openProject}/>;
    }
    else if (page === 'login') {
        content = <Login_1.default onGoToRegister={() => setPage('register')} onSuccess={() => setPage('home')}/>;
    }
    else {
        content = <Register_1.default onGoToLogin={() => setPage('login')} onSuccess={() => setPage('home')}/>;
    }
    return (<>
            {content}
            {sessionExpired && <SessionExpiredModal_1.default onReconnect={handleReconnect}/>}
            <NotificationToast_1.default notifications={notifications} onDismiss={dismiss}/>
        </>);
}
