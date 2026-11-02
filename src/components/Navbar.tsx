import React from 'react';
import { UserProfile, AppView } from '../types';
import { Sparkles, Coins, Flame, Trophy, ShoppingBag, BookOpen, Camera, Globe, User, LogOut } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
  onOpenStats: () => void;
  onOpenStudyBuddy: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenStats,
  onOpenStudyBuddy,
  onSignOut,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-amber-200 rounded-2xl flex items-center justify-center shadow-sm transform group-hover:scale-105 transition duration-300 border-2 border-amber-300">
              <Sparkles className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-indigo-900">
                AprendeMágico 🌟
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Academia Estelar
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition text-sm ${
                currentView === 'dashboard'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => onNavigate('homework')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition text-sm ${
                currentView === 'homework'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Subir Tarea</span>
            </button>

            <button
              onClick={() => onNavigate('language')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition text-sm ${
                currentView === 'language'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Idiomas</span>
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition text-sm ${
                currentView === 'shop'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Tienda</span>
            </button>
          </div>

          {/* User Stats & Profile */}
          <div className="flex items-center space-x-2.5">
            {user ? (
              <>
                {/* Streak */}
                <div className="flex items-center bg-orange-50 px-2.5 py-1.5 rounded-full border border-orange-200 text-orange-700">
                  <Flame className="w-4 h-4 text-orange-500 mr-1 fill-orange-400 animate-bounce" />
                  <span className="text-xs font-black">{user.streak}d</span>
                </div>

                {/* Coins */}
                <div className="flex items-center bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-200 text-amber-800">
                  <Coins className="w-4 h-4 mr-1 text-amber-500 fill-amber-400" />
                  <span className="text-xs font-black">{user.coins}</span>
                </div>

                {/* Stats button */}
                <button
                  onClick={onOpenStats}
                  className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition text-slate-700"
                  title="Ver Mis Logros"
                >
                  <Trophy className="w-4 h-4 text-amber-600" />
                </button>

                {/* AI Study Buddy */}
                <button
                  onClick={onOpenStudyBuddy}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs flex items-center space-x-1 border border-purple-200"
                >
                  <span>🤖 RoboAmigo</span>
                </button>

                {/* Profile / Logout */}
                <div className="hidden md:flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold truncate max-w-[80px] text-slate-700">{user.displayName}</span>
                  <button
                    onClick={onSignOut}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-amber-300 hover:bg-amber-400 text-amber-950 font-black px-4 py-2 rounded-2xl shadow-sm transition flex items-center space-x-1.5 text-xs sm:text-sm border border-amber-400"
              >
                <User className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Navegación inferior móvil" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg flex items-center justify-around">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center p-1 rounded-xl transition ${
            currentView === 'dashboard' ? 'text-amber-600 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          onClick={() => onNavigate('homework')}
          className={`flex flex-col items-center p-1 rounded-xl transition ${
            currentView === 'homework' ? 'text-amber-600 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tarea</span>
        </button>

        <button
          onClick={() => onNavigate('language')}
          className={`flex flex-col items-center p-1 rounded-xl transition ${
            currentView === 'language' ? 'text-amber-600 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <Globe className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Idiomas</span>
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center p-1 rounded-xl transition ${
            currentView === 'shop' ? 'text-amber-600 font-black' : 'text-slate-500 font-medium'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tienda</span>
        </button>
      </nav>
    </>
  );
};
