import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css'

export default function Navbar() {
    const { pathname } = useLocation();

    const links = [
        { to: '/', label: 'Search' },
        { to: '/saved', label: 'Saved' },
        { to: '/about', label: 'About' },
        { to: '/help', label: 'Help' },
    ];


    return (
        <header className='navbar'>
            <Link to="/" className='navbar-logo'>
                <div className='logo-icon'>📚</div>
                <span>ScholarVault</span>
            </Link>

            <nav className='nav-links'>
                {links.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`nav-link ${pathname === link.to ? 'active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}