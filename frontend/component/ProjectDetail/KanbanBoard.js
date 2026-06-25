"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KanbanBoard;
const react_1 = __importDefault(require("react"));
const ProjectDetail_module_css_1 = __importDefault(require("../../pages/ProjectDetail/ProjectDetail.module.css"));
const Columns_1 = require("../../constant/Columns");
const TaskCard_1 = __importDefault(require("./TaskCard"));
function KanbanBoard({ tasks, dragOverCol, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onTaskClick, }) {
    return (<div className={ProjectDetail_module_css_1.default.board}>
            {Columns_1.COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.status);
            return (<div key={col.status} className={[
                    ProjectDetail_module_css_1.default.column,
                    ProjectDetail_module_css_1.default[`column_${col.status}`],
                    dragOverCol === col.status ? ProjectDetail_module_css_1.default.dragOver : '',
                ].filter(Boolean).join(' ')} onDragOver={e => { e.preventDefault(); onDragOver(col.status); }} onDragLeave={onDragLeave} onDrop={() => onDrop(col.status)}>
                        <div className={ProjectDetail_module_css_1.default.columnHeader}>
                            <span className={ProjectDetail_module_css_1.default.columnTitle}>{col.label}</span>
                            <span className={ProjectDetail_module_css_1.default.columnCount}>{colTasks.length}</span>
                        </div>

                        {colTasks.length === 0 ? (<div className={ProjectDetail_module_css_1.default.emptyCol}>Aucune tâche</div>) : (colTasks.map(task => (<TaskCard_1.default key={task.id} task={task} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onTaskClick}/>)))}
                    </div>);
        })}
        </div>);
}
