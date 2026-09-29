import Sidebar from '@/components/Sidebar';
import { Icon } from '@/components/Icon';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <div className="content">
        <header className="topbar">
          <button className="mobile-menu">
            <Icon name="menu" />
          </button>
          <span className="eyebrow flex items-center gap-2">SOUTH MUMBAI RESIDENTIAL <span className="text-gray-500 font-normal opacity-50">|</span> <span className="text-[#68727f]">DEAL ROOM</span></span>
          <div>
            <span className="live-dot" /> SYSTEM LIVE
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
