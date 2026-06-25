"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewTaskModal;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("../../pages/ProjectDetail/ProjectDetail.module.css"));
const taskService_1 = require("../../service/taskService");
const Columns_1 = require("../../constant/Columns");
const Priorities_1 = require("../../constant/Priorities");
const EmptyTaskForm_1 = require("../../constant/EmptyTaskForm");
function NewTaskModal({ projectId, userId, onClose, onCreated }) {
    const [form, setForm] = react_1.default.useState(EmptyTaskForm_1.EMPTY_TASK_FORM);
    const [formError, setFormError] = react_1.default.useState(null);
    const [submitting, setSubmitting] = react_1.default.useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            const payload = {
                projectId,
                userId,
                name: form.name,
                ...(form.description ? { description: form.description } : {}),
                priority: form.priority,
                status: form.status,
                ...(form.dueDate ? { dueDate: form.dueDate } : {}),
            };
            const created = await (0, taskService_1.createTask)(payload);
            onCreated(created);
            onClose();
        }
        catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className={ProjectDetail_module_css_1.default.overlay} onClick={onClose}>
            <div className={ProjectDetail_module_css_1.default.modal} onClick={e => e.stopPropagation()}>
                <div className={ProjectDetail_module_css_1.default.modalHeader}>
                    <h2 className={ProjectDetail_module_css_1.default.modalTitle}>Nouvelle tâche</h2>
                    <button className={ProjectDetail_module_css_1.default.closeBtn} onClick={onClose}>✕</button>
                </div>

                {formError && <div className={ProjectDetail_module_css_1.default.error}>{formError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={ProjectDetail_module_css_1.default.field}>
                        <label className={ProjectDetail_module_css_1.default.label}>Nom *</label>
                        <input className={ProjectDetail_module_css_1.default.input} name="name" value={form.name} onChange={handleChange} placeholder="Nom de la tâche" required/>
                    </div>

                    <div className={ProjectDetail_module_css_1.default.field}>
                        <label className={ProjectDetail_module_css_1.default.label}>Description</label>
                        <textarea className={ProjectDetail_module_css_1.default.textarea} name="description" value={form.description} onChange={handleChange} placeholder="Description optionnelle..." rows={3}/>
                    </div>

                    <div className={ProjectDetail_module_css_1.default.row}>
                        <div className={ProjectDetail_module_css_1.default.field}>
                            <label className={ProjectDetail_module_css_1.default.label}>Statut</label>
                            <select className={ProjectDetail_module_css_1.default.input} name="status" value={form.status} onChange={handleChange}>
                                {Columns_1.COLUMNS.map(c => (<option key={c.status} value={c.status}>{c.label}</option>))}
                            </select>
                        </div>
                        <div className={ProjectDetail_module_css_1.default.field}>
                            <label className={ProjectDetail_module_css_1.default.label}>Priorité</label>
                            <select className={ProjectDetail_module_css_1.default.input} name="priority" value={form.priority} onChange={handleChange}>
                                {Priorities_1.PRIORITIES.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
                            </select>
                        </div>
                    </div>

                    <div className={ProjectDetail_module_css_1.default.field}>
                        <label className={ProjectDetail_module_css_1.default.label}>Échéance</label>
                        <input className={ProjectDetail_module_css_1.default.input} type="date" name="dueDate" value={form.dueDate} onChange={handleChange}/>
                    </div>

                    <div className={ProjectDetail_module_css_1.default.modalActions}>
                        <button type="button" className={ProjectDetail_module_css_1.default.cancelBtn} onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className={ProjectDetail_module_css_1.default.submitBtn} disabled={submitting}>
                            {submitting ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>);
}
