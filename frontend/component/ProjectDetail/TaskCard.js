"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaskCard;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("../../pages/ProjectDetail/ProjectDetail.module.css"));
const PriorityDot_1 = require("../../constant/PriorityDot");
const formatDate_1 = require("../../utils/formatDate");
function TaskCard({ task, onDragStart, onDragEnd, onClick }) {
    return (<div className={ProjectDetail_module_css_1.default.taskCard} draggable onDragStart={() => onDragStart(task.id)} onDragEnd={onDragEnd} onClick={() => onClick(task)}>
            <div className={ProjectDetail_module_css_1.default.taskCardHeader}>
                <p className={ProjectDetail_module_css_1.default.taskName}>{task.name}</p>
                {task.priority && PriorityDot_1.PRIORITY_DOT[task.priority] && (<span className={ProjectDetail_module_css_1.default.priorityDot} style={{ backgroundColor: PriorityDot_1.PRIORITY_DOT[task.priority].color }} title={PriorityDot_1.PRIORITY_DOT[task.priority].title}/>)}
            </div>
            {task.description && (<p className={ProjectDetail_module_css_1.default.taskDesc}>{task.description}</p>)}
            {task.dueDate && (<p className={ProjectDetail_module_css_1.default.taskDue}>Échéance : {(0, formatDate_1.formatDate)(task.dueDate)}</p>)}
        </div>);
}
