import React, { useEffect, useState, useRef } from 'react';
import styles from './VictoryScreen.module.css';

// Confetti particle component
function Confetti() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        const colors = ['#818cf8', '#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#a78bfa', '#fb923c'];
        const particles = [];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 1.5,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                wobble: Math.random() * 2,
                wobbleSpeed: Math.random() * 0.05 + 0.02,
                wobbleOffset: Math.random() * Math.PI * 2,
                opacity: 1,
            });
        }

        let frame = 0;
        let animId;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            particles.forEach(p => {
                p.y += p.speed;
                p.rotation += p.rotSpeed;
                p.x += Math.sin(frame * p.wobbleSpeed + p.wobbleOffset) * p.wobble;

                // Fade out near bottom
                if (p.y > canvas.height * 0.8) {
                    p.opacity = Math.max(0, 1 - (p.y - canvas.height * 0.8) / (canvas.height * 0.2));
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                // Reset particle when off screen
                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.opacity = 1;
                }
            });

            // Stop after ~6 seconds 
            if (frame < 360) {
                animId = requestAnimationFrame(animate);
            }
        }

        animate();
        return () => cancelAnimationFrame(animId);
    }, []);

    return <canvas ref={canvasRef} className={styles.confettiCanvas} />;
}

// Rank emoji and color mapping
function getRankStyle(rank) {
    if (!rank) return { emoji: '🎮', color: '#818cf8', label: 'N/A' };
    const r = rank.charAt(0);
    switch (r) {
        case 'S': return { emoji: rank.includes('+') ? '👑' : '🏆', color: '#fbbf24', label: rank };
        case 'A': return { emoji: '🥇', color: '#34d399', label: rank };
        case 'B': return { emoji: '🥈', color: '#60a5fa', label: rank };
        case 'C': return { emoji: '🥉', color: '#fb923c', label: rank };
        default: return { emoji: '😐', color: '#94a3b8', label: rank };
    }
}

export default function VictoryScreen({ score, rank, character, turnCount, totalQuestionsAsked, maxTurns, hintsUsed, onRestart }) {
    const [showContent, setShowContent] = useState(false);
    const [countedScore, setCountedScore] = useState(0);
    const rankInfo = getRankStyle(rank);

    // Animate entry
    useEffect(() => {
        setTimeout(() => setShowContent(true), 300);
    }, []);

    // Animate score counting
    useEffect(() => {
        if (!showContent || !score) return;
        const target = score;
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.round(increment * step), target);
            setCountedScore(current);
            if (step >= steps) clearInterval(timer);
        }, duration / steps);

        return () => clearInterval(timer);
    }, [showContent, score]);

    return (
        <div className={styles.victoryOverlay}>
            <Confetti />

            <div className={`${styles.victoryCard} ${showContent ? styles.visible : ''}`}>
                {/* Big rank badge */}
                <div className={styles.rankBadge} style={{ '--rank-color': rankInfo.color }}>
                    <span className={styles.rankEmoji}>{rankInfo.emoji}</span>
                    <span className={styles.rankLabel}>{rankInfo.label}</span>
                </div>

                <h2 className={styles.title}>🎉 Bravo !</h2>
                <p className={styles.subtitle}>Tu as trouvé le personnage mystère !</p>

                {/* Character reveal */}
                {character && (
                    <div className={styles.characterCard}>
                        <div className={styles.characterName}>{character.name}</div>
                        <div className={styles.characterDescription}>{character.description}</div>
                        {character.tags && (
                            <div className={styles.tagList}>
                                {character.tags.map((tag, i) => (
                                    <span key={i} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Score display */}
                <div className={styles.scoreSection}>
                    <div className={styles.scoreNumber} style={{ color: rankInfo.color }}>
                        {countedScore}
                    </div>
                    <div className={styles.scoreLabel}>points</div>
                </div>

                {/* Stats grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>❓</span>
                        <span className={styles.statValue}>{turnCount || 0}</span>
                        <span className={styles.statLabel}>Questions</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>💡</span>
                        <span className={styles.statValue}>{hintsUsed || 0}</span>
                        <span className={styles.statLabel}>Indices</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🎯</span>
                        <span className={styles.statValue}>{maxTurns || 20}</span>
                        <span className={styles.statLabel}>Max tours</span>
                    </div>
                </div>

                {/* Score breakdown */}
                <div className={styles.breakdown}>
                    <div className={styles.breakdownRow}>
                        <span>Score de base</span>
                        <span>1500</span>
                    </div>
                    <div className={styles.breakdownRow}>
                        <span>Questions posées ({totalQuestionsAsked || turnCount}x)</span>
                        <span className={styles.penalty}>-{(totalQuestionsAsked || turnCount || 0) * 40}</span>
                    </div>
                    {hintsUsed > 0 && (
                        <div className={styles.breakdownRow}>
                            <span>Indices utilisés ({hintsUsed}x)</span>
                            <span className={styles.penalty}>-{hintsUsed * 150}</span>
                        </div>
                    )}
                    {turnCount <= 5 && (
                        <div className={styles.breakdownRow}>
                            <span>🚀 Bonus rapidité</span>
                            <span className={styles.bonus}>+300</span>
                        </div>
                    )}
                </div>

                <button onClick={onRestart} className={styles.restartBtn}>
                    🔄 Rejouer
                </button>
            </div>
        </div>
    );
}
