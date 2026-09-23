import React from 'react';
import {
  Home,
  LayoutDashboard,
  Users,
  QrCode,
  Compass,
  Newspaper,
  ShoppingBag,
  BarChart3,
  Palette,
  ShieldCheck,
  GraduationCap,
  Award,
  Code2,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { NAVIGATION_ITEMS, NavigationItem } from '../../config/navigation.config';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ROLES } from '../../config/constants';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4 shrink-0" />,
  LayoutDashboard: <LayoutDashboard className="w-4 h-4 shrink-0" />,
  UserPlus: <UserPlus className="w-4 h-4 shrink-0" />,
  Users: <Users className="w-4 h-4 shrink-0" />,
  QrCode: <QrCode className="w-4 h-4 shrink-0" />,
  GraduationCap: <GraduationCap className="w-4 h-4 shrink-0" />,
  Award: <Award className="w-4 h-4 shrink-0" />,
  Compass: <Compass className="w-4 h-4 shrink-0" />,
  Newspaper: <Newspaper className="w-4 h-4 shrink-0" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4 shrink-0" />,
  BarChart3: <BarChart3 className="w-4 h-4 shrink-0" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 shrink-0" />,
  Palette: <Palette className="w-4 h-4 shrink-0" />,
  Code2: <Code2 className="w-4 h-4 shrink-0" />,
};

export const Sidebar: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const {
    activeView,
    setActiveView,
    isSidebarOpen,
    setSidebarOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    setLoginModalOpen,
  } = useUIStore();

  const isPublicUser = !isAuthenticated || currentUser.role === ROLES.PUBLIC_USER;

  // Filter navigation items dynamically based on current user's role
  const authorizedNavItems = NAVIGATION_ITEMS.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const renderNavGroup = (items: NavigationItem[], title?: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 mb-4">
        {title && !isSidebarCollapsed && (
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {title}
          </p>
        )}
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group relative",
                isSidebarCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2.5",
                isActive
                  ? "bg-[#0066B3] text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
              )}
            >
              <div className={cn("flex items-center gap-3 min-w-0", isSidebarCollapsed && "justify-center")}>
                <span className={cn(
                  "transition-transform duration-150 group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                )}>
                  {iconMap[item.iconName]}
                </span>
                {!isSidebarCollapsed && (
                  <span className="truncate text-left">{item.label}</span>
                )}
              </div>
              {!isSidebarCollapsed && item.badge && (
                <Badge
                  size="sm"
                  variant={isActive ? "neutral" : "orange"}
                  className="text-[10px] py-0 px-1.5 ml-2"
                >
                  {item.badge}
                </Badge>
              )}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.label}
                  {item.badge && <span className="ml-1 text-[#F7941D]">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const mainItems = authorizedNavItems.filter((i) => i.category === 'main');
  const ecosystemItems = authorizedNavItems.filter((i) => i.category === 'ecosystem');
  const managementItems = authorizedNavItems.filter((i) => i.category === 'management');
  const systemItems = authorizedNavItems.filter((i) => i.category === 'system');

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col transition-all duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          "h-16 border-b border-slate-100 flex items-center justify-between",
          isSidebarCollapsed ? "px-3 justify-center" : "px-4"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-900/10 flex items-center justify-center p-1 shrink-0">
              <img
                src="/logo.png"
                alt="Logo SAKA Pariwisata"
                className="w-full h-full object-contain"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight truncate">SPWN Apps</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#0066B3] text-white shrink-0">2.0</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">SAKA Pariwisata Network</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Active Persona Badge */}
        {!isSidebarCollapsed ? (
          <div className="px-3 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#009B4D] shrink-0 animate-pulse" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Peran Aktif</p>
                <p className="font-semibold text-slate-800 truncate text-xs">{currentUser.roleName}</p>
              </div>
            </div>
            <button
              onClick={toggleSidebarCollapse}
              title="Ciutkan Sidebar"
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-2 border-b border-slate-100 flex flex-col items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#009B4D] animate-pulse" title={`Peran: ${currentUser.roleName}`} />
            <button
              onClick={toggleSidebarCollapse}
              title="Bentangkan Sidebar"
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 custom-scrollbar">
          {renderNavGroup(mainItems)}
          {renderNavGroup(ecosystemItems, "Ekosistem")}
          {renderNavGroup(managementItems, "Manajemen")}
          {renderNavGroup(systemItems, "Platform")}
        </div>

        {/* Public Login CTA */}
        {isPublicUser && (
          <div className={cn("p-2.5 border-t border-slate-100", isSidebarCollapsed && "text-center")}>
            {!isSidebarCollapsed ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setLoginModalOpen(true)}
                leftIcon={<LogIn className="w-3.5 h-3.5" />}
                className="w-full justify-center text-xs rounded-xl font-semibold shadow-xs"
              >
                Masuk ke Akun
              </Button>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                title="Masuk ke Akun"
                className="w-8 h-8 mx-auto rounded-xl bg-[#0066B3] text-white border-2 border-[#0066B3] flex items-center justify-center hover:bg-white hover:text-[#0066B3] transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Footer Branding */}
        <div className={cn("border-t border-slate-100 text-center", isSidebarCollapsed ? "p-2" : "p-3")}>
          {!isSidebarCollapsed ? (
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
                <span className="text-[11px] font-bold text-slate-700">Wonderful Indonesia</span>
              </div>
              <p className="text-[10px] text-slate-400">Enterprise Digital Ecosystem</p>
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-[#0066B3] text-[10px] font-bold">
              WI
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
