import React from 'react';
import { Link } from 'react-router-dom';
import style from '../Landing/Landing.module.css';

export default function NotFound() {
    return (
        <div className={style.page}>
            <header className={style.header}>
                <span className={style.brand}>TRAVAIL</span>
            </header>
            <main className={style.hero}>
                <h1 className={style.headline}>404</h1>
                <p className={style.tagline}>Cette page n'existe pas ou n'est plus disponible.</p>
                <Link className={style.cta} to="/">Retour à l'accueil</Link>
            </main>
        </div>
    );
}
