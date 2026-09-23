import classes from './MainNavigation.module.css'
import Link from 'next/link'
import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from "js-cookie";

function MainNavigation() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const checkCookie = () => setUserId(Cookies.get('user_id') || null);
    checkCookie();
    router.events.on('routeChangeComplete', checkCookie);
    return () => router.events.off('routeChangeComplete', checkCookie);
  }, [router.events]);
  
  return (
    <header className={classes.header}>
      <div className={classes.leftSection}>
        <div className={classes.icon} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>
          <img src="/FF-png-notxt.png" alt="Icon" className={classes.iconImage} />
        </div>
        FitFinder
      </div>
      <nav className={menuOpen ? classes.open : ''}>
        <ul>
          <li><Link href='/' onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link href='/recom' onClick={() => setMenuOpen(false)}>Outfit Ideas</Link></li>
          <li><Link href='/catalogue' onClick={() => setMenuOpen(false)}>Catalogue</Link></li>
        </ul>
      </nav>
      <div className={classes.userSection}>
        {userId ? (
          <Link href='/user' className={classes.loginLink}>Your Profile</Link>
        ) : (
          <Link href='/auth/login' className={classes.loginLink}>Log In</Link>
        )}
      </div>
      <button className={classes.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>
    </header>
  );
}

export default MainNavigation