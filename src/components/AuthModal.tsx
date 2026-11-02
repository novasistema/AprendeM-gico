import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, X } from 'lucide-react';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [kidName, setKidName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let profile: UserProfile;
      if (userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
      } else {
        profile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Aventurero Estelar',
          email: firebaseUser.email || '',
          xp: 50,
          coins: 100,
          level: 1,
          streak: 1,
          avatarConfig: { base: '🦁', hat: 'none', glasses: 'none', color: 'indigo' },
          unlockedItems: ['🦁', 'none'],
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, profile);
      }

      setLoading(false);
      onLoginSuccess(profile);
      onClose();
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Error al iniciar sesión con Google.');
    }
  };

  const handleCreateKidProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidName.trim()) {
      alert('Por favor ingresa tu nombre de aventurero.');
      return;
    }

    setLoading(true);
    try {
      const guestUid = 'guest_' + Date.now();
      const profile: UserProfile = {
        uid: guestUid,
        displayName: kidName.trim(),
        xp: 50,
        coins: 100,
        level: 1,
        streak: 1,
        avatarConfig: { base: selectedAvatar, hat: 'none', glasses: 'none', color: 'indigo' },
        unlockedItems: [selectedAvatar, 'none'],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', guestUid), profile);
      setLoading(false);
      onLoginSuccess(profile);
      onClose();
    } catch (err) {
      setLoading(false);
      handleFirestoreError(err, OperationType.CREATE, 'users/guest');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-5 shadow-xl text-slate-800">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-black text-indigo-950">¡Únete a la Academia!</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Sign-In */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-3 px-4 rounded-2xl shadow-2xs border border-slate-200 flex items-center justify-center space-x-3 transition text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Iniciar sesión con Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">o crea un perfil rápido</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick Kid Profile Form */}
          <form onSubmit={handleCreateKidProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre de Aventurero</label>
              <input
                type="text"
                value={kidName}
                onChange={(e) => setKidName(e.target.value)}
                placeholder="Ej: Capitán Lucas"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Elige tu Avatar Inicial</label>
              <div className="flex justify-between space-x-1.5">
                {['🦁', '🦊', '🐼', '🦄', '🦖'].map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border transition ${
                      selectedAvatar === av ? 'bg-amber-200 border-amber-400 shadow-2xs' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-3 rounded-2xl shadow-2xs transition text-sm border border-amber-400"
            >
              {loading ? 'Creando...' : '¡Comenzar Aventura! 🚀'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
