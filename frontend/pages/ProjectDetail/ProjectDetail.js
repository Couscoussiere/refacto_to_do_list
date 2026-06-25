"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectDetail;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("./ProjectDetail.module.css"));
const authService_1 = require("../../service/authService");
const taskService_1 = require("../../service/taskService");
const ProjectHeader_1 = __importDefault(require("../../component/ProjectDetail/ProjectHeader"));
const ProjectBar_1 = __importDefault(require("../../component/ProjectDetail/ProjectBar"));
const KanbanBoard_1 = __importDefault(require("../../component/ProjectDetail/KanbanBoard"));
const NewTaskModal_1 = __importDefault(require("../../component/ProjectDetail/NewTaskModal"));
const EditTaskModal_1 = __importDefault(require("../../component/ProjectDetail/EditTaskModal"));
const ProjectSettingsModal_1 = __importDefault(require("../../component/ProjectDetail/ProjectSettingsModal"));
function ProjectDetail({ project, onBack, onLogout, onProjectUpdated, onProjectDeleted }) {
    const user = (0, authService_1.getUser)();
    const [currentProject, setCurrentProject] = react_1.default.useState(project);
    const [tasks, setTasks] = react_1.default.useState([]);
    const [loading, setLoading] = react_1.default.useState(true);
    const [error, setError] = react_1.default.useState(null);
    const [showNewTask, setShowNewTask] = react_1.default.useState(false);
    const [showSettings, setShowSettings] = react_1.default.useState(false);
    const [editTask, setEditTask] = react_1.default.useState(null);
    const [dragOverCol, setDragOverCol] = react_1.default.useState(null);
    const dragTaskId = react_1.default.useRef(null);
    react_1.default.useEffect(() => {
        setLoading(true);
        (0, taskService_1.getTasksByProject)(currentProject.id)
            .then(setTasks)
            .catch(err => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
            .finally(() => setLoading(false));
    }, [currentProject.id]);
    const handleLogout = () => { (0, authService_1.logout)(); onLogout(); };
    const handleDragStart = (taskId) => { dragTaskId.current = taskId; };
    const handleDrop = async (targetStatus) => {
        const id = dragTaskId.current;
        if (!id)
            return;
        const task = tasks.find(t => t.id === id);
        if (!task || task.status === targetStatus)
            return;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
        try {
            await (0, taskService_1.updateTaskStatus)(id, targetStatus);
        }
        catch {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t));
        }
        dragTaskId.current = null;
        setDragOverCol(null);
    };
    const handleProjectUpdated = (updated) => {
        setCurrentProject(updated);
        onProjectUpdated?.(updated);
    };
    const handleProjectDeleted = () => {
        onProjectDeleted?.();
        onBack();
    };
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';
    return (<div className={ProjectDetail_module_css_1.default.page}>
            <ProjectHeader_1.default initials={initials} fullName={fullName} onBack={onBack} onLogout={handleLogout}/>

            <ProjectBar_1.default project={currentProject} onOpenSettings={() => setShowSettings(true)} onNewTask={() => setShowNewTask(true)}/>

            {error && <div className={ProjectDetail_module_css_1.default.error}>{error}</div>}

            {loading ? (<div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>) : (<KanbanBoard_1.default tasks={tasks} dragOverCol={dragOverCol} onDragStart={handleDragStart} onDragEnd={() => setDragOverCol(null)} onDragOver={setDragOverCol} onDragLeave={() => setDragOverCol(null)} onDrop={handleDrop} onTaskClick={setEditTask}/>)}

            {showNewTask && user && (<NewTaskModal_1.default projectId={currentProject.id} userId={Number(user.id)} onClose={() => setShowNewTask(false)} onCreated={task => setTasks(prev => [task, ...prev])}/>)}

            {showSettings && (<ProjectSettingsModal_1.default project={currentProject} onClose={() => setShowSettings(false)} onUpdated={handleProjectUpdated} onDeleted={handleProjectDeleted}/>)}

            {editTask && (<EditTaskModal_1.default task={editTask} onClose={() => setEditTask(null)} onUpdated={updated => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))} onDeleted={id => setTasks(prev => prev.filter(t => t.id !== id))}/>)}
        </div>);
}
