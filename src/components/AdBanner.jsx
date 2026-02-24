import { useEffect, useRef } from 'react';

export default function AdBanner({ format = 'auto', slot = '', style = {} }) {
    const adRef = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (!pushed.current && adRef.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            } catch (e) {
                console.log('AdSense error:', e);
            }
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '1rem 0', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-5283007740349348"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="false"
                ref={adRef}
            />
        </div>
    );
}
