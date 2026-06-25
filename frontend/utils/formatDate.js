"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
function formatDate(value) {
    if (!value)
        return '';
    return new Date(value).toLocaleDateString('fr-FR');
}
