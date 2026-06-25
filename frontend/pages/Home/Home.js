"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const react_1 = __importDefault(require("react"));
const Home_module_css_1 = __importDefault(require("./Home.module.css"));
const authService_1 = require("../../service/authService");
const projectService_1 = require("../../service/projectService");
const STATUS_LABELS = {
    NOT_STARTED: 'Non démarré',
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
};
const STATUS_OPTIONS = ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'DONE'];
function formatDate(value) {
    if (!value)
        return '—';
    return new Date(value).toLocaleDateString('fr-FR');
}
const EMPTY_FORM = {
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    budget: 0,
    status: 'NOT_STARTED',
};
function Home({ onLogout, onOpenProject }) {
    const user = (0, authService_1.getUser)();
    const [projects, setProjects] = react_1.default.useState([]);
    const [loading, setLoading] = react_1.default.useState(true);
    const [error, setError] = react_1.default.useState(null);
    const [showModal, setShowModal] = react_1.default.useState(false);
    const [form, setForm] = react_1.default.useState(EMPTY_FORM);
    const [formError, setFormError] = react_1.default.useState(null);
    const [submitting, setSubmitting] = react_1.default.useState(false);
    const loadProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await (0, projectService_1.getAllProjects)();
            setProjects(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        finally {
            setLoading(false);
        }
    };
    react_1.default.useEffect(() => {
        loadProjects();
    }, []);
    const handleLogout = () => {
        (0, authService_1.logout)();
        onLogout();
    };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'budget' ? Number(value) : value }));
    };
    const handleCreateProject = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
                ...(form.startDate ? { startDate: form.startDate } : {}),
                ...(form.dueDate ? { dueDate: form.dueDate } : {}),
                ...(form.budget ? { budget: form.budget } : {}),
                status: form.status,
            };
            const created = await (0, projectService_1.createProject)(payload);
            setProjects(prev => [created, ...prev]);
            setShowModal(false);
            setForm(EMPTY_FORM);
        }
        catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        finally {
            setSubmitting(false);
        }
    };
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
    return (<div className={Home_module_css_1.default.page}>

            {/* ── Header ── */}
            <header className={Home_module_css_1.default.header}>
                <span className={Home_module_css_1.default.brand}>TRAVAIL</span>
                <div className={Home_module_css_1.default.userArea}>
                    <div className={Home_module_css_1.default.avatar}>{initials}</div>
                    <span className={Home_module_css_1.default.userName}>{fullName}</span>
                    <button className={Home_module_css_1.default.logoutBtn} onClick={handleLogout}>
                        Se déconnecter
                    </button>
                </div>
            </header>

            {/* ── Contenu ── */}
            <main className={Home_module_css_1.default.main}>
                <div className={Home_module_css_1.default.topBar}>
                    <div>
                        <h1 className={Home_module_css_1.default.title}>Mes projets</h1>
                        <p className={Home_module_css_1.default.subtitle}>{projects.length} projet{projects.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className={Home_module_css_1.default.newBtn} onClick={() => setShowModal(true)}>
                        + Nouveau projet
                    </button>
                </div>

                {error && <div className={Home_module_css_1.default.error}>{error}</div>}

                {loading ? (<div className={Home_module_css_1.default.empty}>Chargement...</div>) : projects.length === 0 ? (<div className={Home_module_css_1.default.emptyState}>
                        <p className={Home_module_css_1.default.emptyIcon}>📋</p>
                        <p className={Home_module_css_1.default.emptyText}>Aucun projet pour l'instant</p>
                        <p className={Home_module_css_1.default.emptyHint}>Créez votre premier projet pour commencer</p>
                    </div>) : (<div className={Home_module_css_1.default.grid}>
                        {projects.map(p => (<div key={p.id} className={Home_module_css_1.default.card} onClick={() => onOpenProject(p)} style={{ cursor: 'pointer' }}>
                                <div className={Home_module_css_1.default.cardHeader}>
                                    <h2 className={Home_module_css_1.default.cardName}>{p.name}</h2>
                                    <span className={`${Home_module_css_1.default.badge} ${Home_module_css_1.default[`badge_${p.status}`]}`}>
                                        {STATUS_LABELS[p.status]}
                                    </span>
                                </div>
                                {p.description && (<p className={Home_module_css_1.default.cardDesc}>{p.description}</p>)}
                                <div className={Home_module_css_1.default.cardMeta}>
                                    <span>📅 {formatDate(p.startDate)} → {formatDate(p.dueDate)}</span>
                                    {p.budget > 0 && <span>💰 {p.budget.toLocaleString('fr-FR')} €</span>}
                                </div>
                            </div>))}
                    </div>)}
            </main>

            {/* ── Modal création ── */}
            {showModal && (<div className={Home_module_css_1.default.overlay} onClick={() => setShowModal(false)}>
                    <div className={Home_module_css_1.default.modal} onClick={e => e.stopPropagation()}>
                        <div className={Home_module_css_1.default.modalHeader}>
                            <h2 className={Home_module_css_1.default.modalTitle}>Nouveau projet</h2>
                            <button className={Home_module_css_1.default.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {formError && <div className={Home_module_css_1.default.error}>{formError}</div>}

                        <form onSubmit={handleCreateProject}>
                            <div className={Home_module_css_1.default.field}>
                                <label className={Home_module_css_1.default.label}>Nom *</label>
                                <input className={Home_module_css_1.default.input} name="name" value={form.name} onChange={handleFormChange} placeholder="Mon projet" required/>
                            </div>

                            <div className={Home_module_css_1.default.field}>
                                <label className={Home_module_css_1.default.label}>Description</label>
                                <textarea className={Home_module_css_1.default.textarea} name="description" value={form.description} onChange={handleFormChange} placeholder="Description optionnelle..." rows={3}/>
                            </div>

                            <div className={Home_module_css_1.default.row}>
                                <div className={Home_module_css_1.default.field}>
                                    <label className={Home_module_css_1.default.label}>Date de début</label>
                                    <input className={Home_module_css_1.default.input} type="date" name="startDate" value={form.startDate} onChange={handleFormChange}/>
                                </div>
                                <div className={Home_module_css_1.default.field}>
                                    <label className={Home_module_css_1.default.label}>Date de fin</label>
                                    <input className={Home_module_css_1.default.input} type="date" name="dueDate" value={form.dueDate} onChange={handleFormChange}/>
                                </div>
                            </div>

                            <div className={Home_module_css_1.default.row}>
                                <div className={Home_module_css_1.default.field}>
                                    <label className={Home_module_css_1.default.label}>Budget (€)</label>
                                    <input className={Home_module_css_1.default.input} type="number" name="budget" value={form.budget} onChange={handleFormChange} min={0} placeholder="0"/>
                                </div>
                                <div className={Home_module_css_1.default.field}>
                                    <label className={Home_module_css_1.default.label}>Statut</label>
                                    <select className={Home_module_css_1.default.input} name="status" value={form.status} onChange={handleFormChange}>
                                        {STATUS_OPTIONS.map(s => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className={Home_module_css_1.default.modalActions}>
                                <button type="button" className={Home_module_css_1.default.cancelBtn} onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className={Home_module_css_1.default.submitBtn} disabled={submitting}>
                                    {submitting ? 'Création...' : 'Créer le projet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>)}
        </div>);
}
