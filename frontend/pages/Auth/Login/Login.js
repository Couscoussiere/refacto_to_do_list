"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Login;
const react_1 = __importDefault(require("react"));
const Login_module_css_1 = __importDefault(require("./Login.module.css"));
const authService_1 = require("../../../service/authService");
const FEATURES = [
    { icon: '✓', label: 'Retrouvez toutes vos tâches en un clin d\'œil' },
    { icon: '↻', label: 'Reprenez là où vous vous étiez arrêté' },
    { icon: '⊙', label: 'Vos données synchronisées en temps réel' },
];
function Login({ onGoToRegister, onSuccess }) {
    const [email, setEmail] = react_1.default.useState('');
    const [password, setPassword] = react_1.default.useState('');
    const [error, setError] = react_1.default.useState(null);
    const [loading, setLoading] = react_1.default.useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token, user } = await (0, authService_1.login)({ email, password });
            (0, authService_1.saveToken)(token);
            (0, authService_1.saveUser)(user);
            onSuccess();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className={Login_module_css_1.default.page}>

            {/* ── Panneau gauche ── */}
            <div className={Login_module_css_1.default.left}>
                <div className={Login_module_css_1.default.decoCircle} style={{ width: 400, height: 400, top: -120, right: -120 }}/>
                <div className={Login_module_css_1.default.decoCircle} style={{ width: 220, height: 220, bottom: 80, right: 60 }}/>

                <span className={Login_module_css_1.default.brand}>TRAVAIL</span>

                <div className={Login_module_css_1.default.leftBody}>
                    <h1 className={Login_module_css_1.default.headline}>
                        Bon retour<br />parmi nous.
                    </h1>
                    <p className={Login_module_css_1.default.tagline}>
                        Connectez-vous pour retrouver vos tâches
                        et reprendre là où vous vous étiez arrêté.
                    </p>
                    <div className={Login_module_css_1.default.features}>
                        {FEATURES.map((f, i) => (<div key={i} className={Login_module_css_1.default.feature}>
                                <span className={Login_module_css_1.default.featureIcon}>{f.icon}</span>
                                {f.label}
                            </div>))}
                    </div>
                </div>

                <span className={Login_module_css_1.default.footer}>© 2025 TRAVAIL — Tous droits réservés</span>
            </div>

            {/* ── Panneau droit ── */}
            <div className={Login_module_css_1.default.right}>
                <div className={Login_module_css_1.default.card}>
                    <h2 className={Login_module_css_1.default.cardTitle}>Se connecter</h2>
                    <p className={Login_module_css_1.default.cardSubtitle}>Entrez vos identifiants pour continuer</p>

                    {error && <div className={Login_module_css_1.default.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={Login_module_css_1.default.field}>
                            <label className={Login_module_css_1.default.label} htmlFor="email">Adresse email</label>
                            <input className={Login_module_css_1.default.input} id="email" type="email" placeholder="jean.dupont@email.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                        </div>

                        <div className={Login_module_css_1.default.field}>
                            <label className={Login_module_css_1.default.label} htmlFor="password">Mot de passe</label>
                            <input className={Login_module_css_1.default.input} id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
                        </div>

                        <button className={Login_module_css_1.default.button} type="submit" disabled={loading}>
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className={Login_module_css_1.default.registerLink}>
                        Pas encore de compte ?{' '}
                        <span className={Login_module_css_1.default.link} onClick={onGoToRegister}>S'inscrire</span>
                    </p>
                </div>
            </div>

        </div>);
}
