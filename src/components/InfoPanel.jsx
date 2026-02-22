import React from 'react';
import styles from './InfoPanel.module.css';

export default function InfoPanel({ facts, isOpen, onToggle }) {
    return (
        <>
            <button
                className={`${styles.toggleBtn} ${isOpen ? styles.open : ''}`}
                onClick={onToggle}
                title="Résumé des infos"
            >
                📋
            </button>

            {isOpen && (
                <div className={`${styles.panel} glass-panel`}>
                    <h3 className={styles.title}>📋 Infos obtenues</h3>
                    {facts.length === 0 ? (
                        <p className={styles.empty}>Pose des questions pour remplir ce panneau !</p>
                    ) : (
                        <ul className={styles.factList}>
                            {facts.map((fact, i) => (
                                <li key={i} className={styles.factItem}>
                                    <span className={styles.factIcon}>
                                        {fact.confirmed ? '✅' : '❌'}
                                    </span>
                                    <span className={styles.factText}>{fact.text}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </>
    );
}
