"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectSettingsModal;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("../../pages/ProjectDetail/ProjectDetail.module.css"));
const projectService_1 = require("../../service/projectService");
const ProjectStatusLabels_1 = require("../../constant/ProjectStatusLabels");
function ProjectSettingsModal({ project, onClose, onUpdated, onDeleted }) {
    const [form, setForm] = react_1.default.useState({
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
        budget: project.budget != null ? String(project.budget) : '',
    });
    const [error, setError] = react_1.default.useState(null);
    const [submitting, setSubmitting] = react_1.default.useState(false);
    const [confirmDelete, setConfirmDelete] = react_1.default.useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || undefined,
                status: form.status,
                startDate: form.startDate || null,
                dueDate: form.dueDate || null,
                budget: form.budget ? Number(form.budget) : undefined,
            };
            const updated = await (0, projectService_1.updateProject)(project.id, payload);
            onUpdated(updated);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await (0, projectService_1.deleteProject)(project.id);
            onDeleted();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setSubmitting(false);
        }
    };
    return (<div className={ProjectDetail_module_css_1.default.overlay} onClick={onClose}>
            <div className={ProjectDetail_module_css_1.default.modal} onClick={e => e.stopPropagation()}>
                <div className={ProjectDetail_module_css_1.default.modalHeader}>
                    <h2 className={ProjectDetail_module_css_1.default.modalTitle}>Paramètres du projet</h2>
                    <button className={ProjectDetail_module_css_1.default.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <div className={ProjectDetail_module_css_1.default.error}>{error}</div>}

                {confirmDelete ? (<div className={ProjectDetail_module_css_1.default.confirmDelete}>
                        <p className={ProjectDetail_module_css_1.default.confirmText}>Supprimer définitivement ce projet et toutes ses tâches ?</p>
                        <div className={ProjectDetail_module_css_1.default.modalActions}>
                            <button className={ProjectDetail_module_css_1.default.cancelBtn} onClick={() => setConfirmDelete(false)} disabled={submitting}>
                                Annuler
                            </button>
                            <button className={ProjectDetail_module_css_1.default.deleteConfirmBtn} onClick={handleDelete} disabled={submitting}>
                                {submitting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>) : (<form onSubmit={handleSubmit}>
                        <div className={ProjectDetail_module_css_1.default.field}>
                            <label className={ProjectDetail_module_css_1.default.label}>Nom *</label>
                            <input className={ProjectDetail_module_css_1.default.input} name="name" value={form.name} onChange={handleChange} required/>
                        </div>

                        <div className={ProjectDetail_module_css_1.default.field}>
                            <label className={ProjectDetail_module_css_1.default.label}>Description</label>
                            <textarea className={ProjectDetail_module_css_1.default.textarea} name="description" value={form.description ?? ''} onChange={handleChange} rows={3}/>
                        </div>

                        <div className={ProjectDetail_module_css_1.default.row}>
                            <div className={ProjectDetail_module_css_1.default.field}>
                                <label className={ProjectDetail_module_css_1.default.label}>Statut</label>
                                <select className={ProjectDetail_module_css_1.default.input} name="status" value={form.status} onChange={handleChange}>
                                    {Object.entries(ProjectStatusLabels_1.PROJECT_STATUS_LABELS).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                                </select>
                            </div>
                            <div className={ProjectDetail_module_css_1.default.field}>
                                <label className={ProjectDetail_module_css_1.default.label}>Budget (€)</label>
                                <input className={ProjectDetail_module_css_1.default.input} type="number" name="budget" value={form.budget} onChange={handleChange} min={0}/>
                            </div>
                        </div>

                        <div className={ProjectDetail_module_css_1.default.row}>
                            <div className={ProjectDetail_module_css_1.default.field}>
                                <label className={ProjectDetail_module_css_1.default.label}>Date de début</label>
                                <input className={ProjectDetail_module_css_1.default.input} type="date" name="startDate" value={form.startDate} onChange={handleChange}/>
                            </div>
                            <div className={ProjectDetail_module_css_1.default.field}>
                                <label className={ProjectDetail_module_css_1.default.label}>Échéance</label>
                                <input className={ProjectDetail_module_css_1.default.input} type="date" name="dueDate" value={form.dueDate} onChange={handleChange}/>
                            </div>
                        </div>

                        <div className={ProjectDetail_module_css_1.default.modalActionsSpread}>
                            <button type="button" className={ProjectDetail_module_css_1.default.deleteBtn} onClick={() => setConfirmDelete(true)}>
                                Supprimer le projet
                            </button>
                            <div className={ProjectDetail_module_css_1.default.modalActions}>
                                <button type="button" className={ProjectDetail_module_css_1.default.cancelBtn} onClick={onClose}>
                                    Annuler
                                </button>
                                <button type="submit" className={ProjectDetail_module_css_1.default.submitBtn} disabled={submitting}>
                                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </form>)}
            </div>
        </div>);
}
