import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Generate breadcrumb items
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = pathSnippets.map((snippet, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const title = snippet.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return { title, url };
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onOpenMobile={() => setMobileOpen(true)} />

        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200/80 px-5 sm:px-6 py-2 flex items-center text-xs text-slate-500 gap-1.5 overflow-x-auto">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Home</span>
          </Link>
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={item.url}>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              {idx === breadcrumbItems.length - 1 ? (
                <span className="font-medium text-slate-800">{item.title}</span>
              ) : (
                <Link to={item.url} className="hover:text-slate-900 transition-colors">
                  {item.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Page Body Viewport: Uniform padding p-5 sm:p-6 on every single page */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
