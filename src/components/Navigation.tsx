'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: '시뮬레이션' },
    { href: '/methodology', label: '방법론' },
    { href: '/references', label: '참고문헌' },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-inner">
        <span className="nav-title">AMOC 담수 유입 시뮬레이션</span>
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
