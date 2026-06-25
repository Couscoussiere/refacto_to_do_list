"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectHeader;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("../../pages/ProjectDetail/ProjectDetail.module.css"));
function ProjectHeader({ initials, fullName, onBack, onLogout }) {
    return (<header className={ProjectDetail_module_css_1.default.header}>
            <div className={ProjectDetail_module_css_1.default.headerLeft}>
                <button className={ProjectDetail_module_css_1.default.backBtn} onClick={onBack} title="Retour">←</button>
                <span className={ProjectDetail_module_css_1.default.brand}>TRAVAIL</span>
            </div>
            <div className={ProjectDetail_module_css_1.default.userArea}>
                <div className={ProjectDetail_module_css_1.default.avatar}>{initials}</div>
                <span className={ProjectDetail_module_css_1.default.userName}>{fullName}</span>
                <button className={ProjectDetail_module_css_1.default.logoutBtn} onClick={onLogout}>Se déconnecter</button>
            </div>
        </header>);
}
