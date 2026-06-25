"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Register;
const react_1 = __importDefault(require("react"));
const Register_module_css_1 = __importDefault(require("./Register.module.css"));
const authService_1 = require("../../../service/authService");
const FEATURES = [
    { icon: '✓', label: 'Créez et organisez vos tâches en quelques clics' },
    { icon: '↻', label: 'Suivez votre progression en temps réel' },
    { icon: '⊙', label: 'Accédez à vos listes depuis n\'importe où' },
];
function Register({ onGoToLogin, onSuccess }) {
    const [firstName, setFirstName] = react_1.default.useState('');
    const [lastName, setLastName] = react_1.default.useState('');
    const [email, setEmail] = react_1.default.useState('');
    const [password, setPassword] = react_1.default.useState('');
    const [error, setError] = react_1.default.useState(null);
    const [loading, setLoading] = react_1.default.useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token, user } = await (0, authService_1.register)({ firstName, lastName, email, password });
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
    return (<div className={Register_module_css_1.default.page}>

            {/* ── Panneau gauche ── */}
            <div className={Register_module_css_1.default.left}>
                <div className={Register_module_css_1.default.decoCircle} style={{ width: 400, height: 400, top: -120, right: -120 }}/>
                <div className={Register_module_css_1.default.decoCircle} style={{ width: 220, height: 220, bottom: 80, right: 60 }}/>

                <span className={Register_module_css_1.default.brand}>TRAVAIL</span>

                <div className={Register_module_css_1.default.leftBody}>
                    <h1 className={Register_module_css_1.default.headline}>
                        Organisez vos<br />tâches,<br />simplement.
                    </h1>
                    <p className={Register_module_css_1.default.tagline}>
                        Un outil pensé pour vous aider à rester concentré,
                        prioriser l'essentiel et accomplir plus chaque jour.
                    </p>
                    <div className={Register_module_css_1.default.features}>
                        {FEATURES.map((f, i) => (<div key={i} className={Register_module_css_1.default.feature}>
                                <span className={Register_module_css_1.default.featureIcon}>{f.icon}</span>
                                {f.label}
                            </div>))}
                    </div>
                </div>

                <span className={Register_module_css_1.default.footer}>© 2025 TRAVAIL — Tous droits réservés</span>
            </div>

            {/* ── Panneau droit ── */}
            <div className={Register_module_css_1.default.right}>
                <div className={Register_module_css_1.default.card}>
                    <h2 className={Register_module_css_1.default.cardTitle}>Créer un compte</h2>
                    <p className={Register_module_css_1.default.cardSubtitle}>Remplissez le formulaire pour commencer</p>

                    {error && <div className={Register_module_css_1.default.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={Register_module_css_1.default.row}>
                            <div className={Register_module_css_1.default.field}>
                                <label className={Register_module_css_1.default.label} htmlFor="firstName">Prénom</label>
                                <input className={Register_module_css_1.default.input} id="firstName" type="text" placeholder="Jean" value={firstName} onChange={e => setFirstName(e.target.value)} required/>
                            </div>
                            <div className={Register_module_css_1.default.field}>
                                <label className={Register_module_css_1.default.label} htmlFor="lastName">Nom</label>
                                <input className={Register_module_css_1.default.input} id="lastName" type="text" placeholder="Dupont" value={lastName} onChange={e => setLastName(e.target.value)} required/>
                            </div>
                        </div>

                        <div className={Register_module_css_1.default.field}>
                            <label className={Register_module_css_1.default.label} htmlFor="email">Adresse email</label>
                            <input className={Register_module_css_1.default.input} id="email" type="email" placeholder="jean.dupont@email.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                        </div>

                        <div className={Register_module_css_1.default.field}>
                            <label className={Register_module_css_1.default.label} htmlFor="password">Mot de passe</label>
                            <input className={Register_module_css_1.default.input} id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
                        </div>

                        <button className={Register_module_css_1.default.button} type="submit" disabled={loading}>
                            {loading ? 'Inscription en cours...' : "S'inscrire"}
                        </button>
                    </form>

                    <p className={Register_module_css_1.default.loginLink}>
                        Déjà un compte ?{' '}
                        <span className={Register_module_css_1.default.link} onClick={onGoToLogin}>Se connecter</span>
                    </p>
                </div>
            </div>

        </div>);
}
