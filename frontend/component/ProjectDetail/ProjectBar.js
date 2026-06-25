"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectBar;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("../../pages/ProjectDetail/ProjectDetail.module.css"));
const ProjectStatusLabels_1 = require("../../constant/ProjectStatusLabels");
const formatDate_1 = require("../../utils/formatDate");
function ProjectBar({ project, onOpenSettings, onNewTask }) {
    return (<div className={ProjectDetail_module_css_1.default.projectBar}>
            <div>
                <h1 className={ProjectDetail_module_css_1.default.projectTitle}>{project.name}</h1>
                <div className={ProjectDetail_module_css_1.default.projectMeta}>
                    <span className={`${ProjectDetail_module_css_1.default.badge} ${ProjectDetail_module_css_1.default[`badge_${project.status}`]}`}>
                        {ProjectStatusLabels_1.PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    {project.description && (<p className={ProjectDetail_module_css_1.default.projectDesc}>{project.description}</p>)}
                    {(project.startDate || project.dueDate) && (<span className={ProjectDetail_module_css_1.default.projectDate}>
                            {(0, formatDate_1.formatDate)(project.startDate)} — {(0, formatDate_1.formatDate)(project.dueDate)}
                        </span>)}
                </div>
            </div>
            <div className={ProjectDetail_module_css_1.default.projectBarActions}>
                <button className={ProjectDetail_module_css_1.default.settingsBtn} onClick={onOpenSettings} title="Paramètres du projet">
                    ⚙
                </button>
                <button className={ProjectDetail_module_css_1.default.newTaskBtn} onClick={onNewTask}>
                    + Nouvelle tâche
                </button>
            </div>
        </div>);
}
