import React from 'react';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ text, sender }) {
    const isAi = sender === 'ai';
    return (
        <div className={`${styles.wrapper} ${isAi ? styles.aiWrapper : styles.userWrapper}`}>
            <div className={`${styles.bubble} ${isAi ? styles.ai : styles.user}`}>
                {text}
            </div>
        </div>
    );
}
