// Fonctions de mapping entre UserRow (BDD) et User (application)
export const toUser = (row) => ({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
});
// Fonction de mapping pour exposer uniquement les champs publics de l'utilisateur
export const toPublicUser = (user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
});
