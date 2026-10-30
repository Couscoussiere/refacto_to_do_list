import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from './Landing.module.css';
import { isAuthenticated, getUser } from '../../service/authService';

const FEATURES = [
    { icon: '✓', title: 'Projets', label: 'Regroupez vos tâches par projet, avec budget et échéances.' },
    { icon: '↻', title: 'Kanban', label: 'Faites glisser vos tâches d\'une colonne à l\'autre.' },
    { icon: '⊙', title: 'Temps réel', label: 'Soyez notifié dès qu\'une tâche évolue.' },
];

// Durée de l'animation de sortie (cf. .leaving dans Landing.module.css)
const LEAVE_DURATION_MS = 350;

export default function Landing() {
    const loggedIn = isAuthenticated();
    const user = getUser();
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
    const navigate = useNavigate();
    const [leaving, setLeaving] = React.useState(false);

    // Joue l'animation de sortie avant d'aller vers login / inscription,
    // qui jouent à leur tour leur animation d'entrée.
    const goToAuth = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (leaving) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            navigate(path);
            return;
        }
        setLeaving(true);
        window.setTimeout(() => navigate(path, { state: { fromLanding: true } }), LEAVE_DURATION_MS);
    };

    return (
        <div className={leaving ? `${style.page} ${style.leaving}` : style.page}>
            <header className={style.header}>
                <span className={style.brand}>TRAVAIL</span>
                <nav className={style.nav}>
                    {loggedIn ? (
                        <Link className={style.userChip} to="/projects" title="Accéder à mes projets">
                            <span className={style.avatar}>{initials}</span>
                            <span className={style.userText}>
                                <span className={style.userLabel}>Connecté en tant que</span>
                                <span className={style.userName}>{fullName}</span>
                            </span>
                        </Link>
                    ) : (
                        <>
                            <Link className={style.ghostBtn} to="/login" onClick={goToAuth('/login')}>Se connecter</Link>
                            <Link className={style.primaryBtn} to="/register" onClick={goToAuth('/register')}>S'inscrire</Link>
                        </>
                    )}
                </nav>
            </header>

            <main className={style.hero}>
                <h1 className={style.headline}>Organisez vos tâches,<br />simplement.</h1>
                <p className={style.tagline}>
                    Un outil pensé pour vous aider à rester concentré,
                    prioriser l'essentiel et accomplir plus chaque jour.
                </p>
                <Link
                    className={style.cta}
                    to={loggedIn ? '/projects' : '/register'}
                    onClick={loggedIn ? undefined : goToAuth('/register')}
                >
                    {loggedIn ? 'Accéder à mes projets' : 'Commencer gratuitement'}
                </Link>

                <div className={style.features}>
                    {FEATURES.map(f => (
                        <div key={f.title} className={style.feature}>
                            <span className={style.featureIcon}>{f.icon}</span>
                            <h3 className={style.featureTitle}>{f.title}</h3>
                            <p className={style.featureText}>{f.label}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className={style.footer}>© 2025 TRAVAIL — Tous droits réservés</footer>
        </div>
    );
}
