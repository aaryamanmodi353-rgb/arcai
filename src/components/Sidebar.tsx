'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './Icon';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span>Æ</span> Arc
      </div>
      <nav>
        <Link href="/admin">
          <button className={pathname === '/admin' ? 'active' : ''}>
            <Icon name="dashboard" /> <span>Pipeline</span>
          </button>
        </Link>
        <Link href="/leads/new">
          <button className={pathname === '/leads/new' ? 'active' : ''}>
            <Icon name="plus" /> <span>New lead</span>
          </button>
        </Link>
        <Link href="/inventory">
          <button className={pathname === '/inventory' ? 'active' : ''}>
            <Icon name="sparkle" /> <span>Inventory</span>
          </button>
        </Link>
      </nav>
      <div className="sidebar-foot flex-col items-stretch border-t border-white/10 mt-auto text-sm text-gray-400 space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="user-avatar">AM</div>
          <div>
            <b className="block">Aryaman Modi</b>
            <small className="block mt-1">Advisory partner</small>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-[#e8a33b] hover:text-[#f4ba6e] transition-colors justify-start p-0 w-full text-left font-medium mt-2 cursor-pointer border-none bg-transparent">
          Logout
        </button>
      </div>
    </aside>
  );
}
