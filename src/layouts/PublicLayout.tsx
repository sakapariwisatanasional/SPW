/**
 * PublicLayout
 * -----------------------------------------------------------------
 * Shell layout untuk pengunjung umum (Publik / Wisatawan / Tamu).
 * Mengintegrasikan Header publik bertema Wonderful Indonesia,
 * navigasi utama responsif, kontainer konten, dan Master Footer.
 */

import React, { useState } from 'react';
import { Compass, Newspaper, ShoppingBag, ShieldCheck, LogIn, Menu, X, Globe, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { ROLES } from '../config/constants';

export interface PublicLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  activeNav = 'home',
  onNavigate,
}) => {
  const { currentUser, switchRole, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Globe },
    { id: 'tourism', label: 'Destinasi Wisata', icon: Compass },
    { id: 'content', label: 'Warta SAKA', icon: Newspaper },
    { id: 'commerce', label: 'Kedai SAKA', icon: ShoppingBag },
    { id: 'verification', label: 'Cek Keaslian KTA', icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(id);
  };

  return (
    <div id="spwn-public-layout" className="min-h-screen bg-[#F5F7FA] flex flex-col text-slate-800">
      {/* Top Banner Tagline */}
      <div className="bg-[#0B1F33] text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#009B4D] inline-block animate-pulse" />
            <span className="font-medium tracking-wide">
              Gerakan Pramuka • SAKA Pariwisata Network Indonesia (SPWN 2.0)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>Harmoni Alam & Budaya Nusantara</span>
            <span>Sapta Pesona Indonesia</span>
          </div>
        </div>
      </div>

      {/* Main Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066B3] to-[#009B4D] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#0066B3]/20">
              SP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                  SAKA PARIWISATA
                </span>
                <span className="text-[10px] font-bold text-[#D81B60] bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                Wonderful Indonesia
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0066B3] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Auth & Access Control Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuthenticated && currentUser.role !== ROLES.PUBLIC_USER ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleNavClick(currentUser.role.includes('ADMIN') ? 'admin-dashboard' : 'member-dashboard')}
              >
                Dashboard {currentUser.roleName.split(' ')[0]}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<LogIn className="w-4 h-4 text-[#0066B3]" />}
                onClick={() => switchRole(ROLES.MEMBER)}
              >
                Masuk Anggota
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-[#0066B3] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100">
              <Button
                className="w-full justify-center"
                size="md"
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  switchRole(ROLES.MEMBER);
                }}
              >
                Masuk Portal Anggota
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Master Public Footer */}
      <footer className="bg-[#0B1F33] text-white border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Identity */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0066B3] flex items-center justify-center font-bold text-xs text-white">
                  SP
                </div>
                <h3 className="font-bold text-base tracking-wide">
                  SAKA PARIWISATA NASIONAL
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Wadah pembinaan generasi muda Gerakan Pramuka Indonesia di bidang kepariwisataan, kebudayaan, pemanduan wisata, dan pemberdayaan ekonomi kreatif nusantara berlandaskan Tri Satya dan Dasa Darma.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
                <span>Dikelola Bersama Kwartir Nasional & Kemenparekraf RI</span>
              </div>
            </div>

            {/* Column 2: 4 Peminatan Krida */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F7941D] mb-3">
                4 Krida Pariwisata
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• Bina Obyek & Daya Tarik Wisata</li>
                <li>• Bina Kuliner & Kearifan Lokal</li>
                <li>• Bina Pemanduan Wisata</li>
                <li>• Bina Sadar Wisata (Sapta Pesona)</li>
              </ul>
            </div>

            {/* Column 3: Sapta Pesona Standard */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#009B4D] mb-3">
                7 Nilai Sapta Pesona
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
                <span>1. Aman</span>
                <span>2. Tertib</span>
                <span>3. Bersih</span>
                <span>4. Sejuk</span>
                <span>5. Indah</span>
                <span>6. Ramah</span>
                <span className="col-span-2">7. Kenangan</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© 2026 SAKA Pariwisata Network (SPWN Apps 2.0). Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Dibangun dengan semangat</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>untuk Pariwisata Indonesia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
