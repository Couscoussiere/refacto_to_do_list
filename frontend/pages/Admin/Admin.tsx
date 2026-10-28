import React from 'react';
import homeStyle from '../Home/Home.module.css';
import style from './Admin.module.css';
import { getUser } from '../../service/authService';
import { getAllUsers, deleteUser, type User } from '../../service/userService';
import { formatDate } from '../../utils/formatDate';

interface Props {
    onBack: () => void;
}

export default function Admin({ onBack }: Props) {
    const currentUser = getUser();
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            setUsers(await getAllUsers());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (user: User) => {
        if (!window.confirm(`Supprimer le compte de ${user.firstName} ${user.lastName} (${user.email}) ?`)) return;
        setError(null);
        try {
            await deleteUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    };

    return (
        <div className={homeStyle.page}>
            <header className={homeStyle.header}>
                <span className={homeStyle.brand}>TRAVAIL</span>
                <div className={homeStyle.userArea}>
                    <button className={homeStyle.logoutBtn} onClick={onBack}>
                        ← Retour aux projets
                    </button>
                </div>
            </header>

            <main className={homeStyle.main}>
                <div className={homeStyle.topBar}>
                    <div>
                        <h1 className={homeStyle.title}>Administration</h1>
                        <p className={homeStyle.subtitle}>
                            {users.length} compte{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {error && <div className={homeStyle.error}>{error}</div>}

                {loading ? (
                    <div className={homeStyle.empty}>Chargement...</div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Créé le</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`${style.role} ${style[`role_${u.role}`]}`}>{u.role}</span>
                                    </td>
                                    <td>{formatDate(u.createdAt)}</td>
                                    <td className={style.actions}>
                                        {u.role === 'standard' && String(u.id) !== String(currentUser?.id) && (
                                            <button className={style.deleteBtn} onClick={() => handleDelete(u)}>
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
}
