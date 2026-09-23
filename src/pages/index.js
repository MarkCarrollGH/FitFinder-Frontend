import { useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';

const CATEGORIES = ['shirts', 'trousers', 'jacket', 'dresses', 'skirts', 'shoes'];

function MarqueeRow({ items, reverse }) {

    if (!items.length) return null;
    const doubled = [...items, ...items];
    return (
        <div style={{ overflow: 'hidden', width: '100%', marginBottom: '0.5rem' }}>
            <div style={{
                display: 'flex',
                animation: `${reverse ? 'marqueeRight' : 'marqueeLeft'} 30s linear infinite`,
                width: 'max-content',
            }}>
                {doubled.map((item, i) => (
                    <div key={i} style={{ width: '160px', flexShrink: 0, marginRight: '0.5rem' }}>
                        <img
                            src={item.img_url}
                            alt={item.name}
                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px', display: 'block' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function HomePage() {
    const router = useRouter();
    const [catalogue, setCatalogue] = useState({});
    const [userId, setUserId] = useState(null)
    
    useEffect(() => {
    setUserId(Cookies.get('user_id') || null);
    }, []);

    useEffect(() => {
        CATEGORIES.forEach(cat => {
            axios.get(`/clothes/${cat}/get`)
                .then(({ data }) => setCatalogue(prev => ({ ...prev, [cat]: data })))
                .catch(() => setCatalogue(prev => ({ ...prev, [cat]: [] })));
        });
    }, []);

    return (
        <>
            <style>{`
                @keyframes marqueeLeft {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes marqueeRight {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }
            `}</style>

            <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', margin: '0 calc(-1 * ((100vw - 100%) / 2))', marginTop: '-3rem', width: '100vw' }}>
                {/* Blurred scrolling background */}
                <div style={{ position: 'absolute', inset: 0, filter: 'blur(6px)', transform: 'scale(1.05)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {CATEGORIES.map((cat, i) => (
                        <MarqueeRow key={cat} items={catalogue[cat] || []} reverse={i % 2 !== 0} />
                    ))}
                </div>

                {/* Welcome overlay */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
                    <div style={{ background: 'rgba(245,224,245,0.9)', borderRadius: '12px', padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.5rem, 6vw, 4rem)', textAlign: 'center', boxShadow: '0 8px 32px rgba(180,80,180,0.2)', border: '1px solid rgba(196,122,196,0.3)', width: '100%', maxWidth: '480px' }}>
                        <img src="/FF-png-notxt.png" alt="FitFinder" style={{ maxWidth: '200px', marginBottom: '1rem' }} />
                        <h1 style={{ color: '#7a3d7a', marginBottom: '0.5rem' }}>Welcome to Fit Finder</h1>
                        {!userId ? (
                            <div style={{ marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    style={{ margin: '0 0.5rem', padding: '0.75rem 2rem', fontSize: '1rem', backgroundColor: '#c47ac4', color: 'white', fontWeight: '600', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => router.push('/auth/register')}
                                    style={{ margin: '0 0.5rem', padding: '0.75rem 2rem', fontSize: '1rem', backgroundColor: 'transparent', color: '#9b4f9b', fontWeight: '600', border: '1.5px solid rgba(196,122,196,0.5)', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Register
                                </button>
                            </div>
                        ) :
                           (<p style={{ color: '#3a3a3a', marginTop: '1.5rem' }}>Discover personalized outfit recommendations and explore the latest fashion trends tailored just for you.</p>)}
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;
