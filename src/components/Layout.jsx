import React from 'react';
import styles from './Layout.module.css';
import AdBanner from './AdBanner';

export default function Layout({ children }) {
    return (
        <div className={styles.appContainer}>
            {/* Left Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.adPlaceholder}>
                    <AdBanner format="vertical" slot="" />
                </div>
            </aside>

            {/* Main Application Area */}
            <main className={styles.mainContent}>
                {children}
            </main>

            {/* Right Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.adPlaceholder}>
                    <AdBanner format="vertical" slot="" />
                </div>
            </aside>
        </div>
    );
}
