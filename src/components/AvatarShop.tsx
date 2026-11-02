import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ShoppingBag, Coins, Check } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

interface AvatarShopProps {
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const AvatarShop: React.FC<AvatarShopProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'base' | 'hat' | 'glasses'>('base');

  const items = {
    base: [
      { id: '🦁', name: 'León Valiente', cost: 0 },
      { id: '🦊', name: 'Zorro Astuto', cost: 50 },
      { id: '🐼', name: 'Panda Zen', cost: 100 },
      { id: '🦄', name: 'Unicornio Mágico', cost: 200 },
      { id: '🦖', name: 'Dino Rex', cost: 250 }
    ],
    hat: [
      { id: 'none', name: 'Sin Sombrero', cost: 0 },
      { id: '👑', name: 'Corona Real', cost: 150 },
      { id: '🎓', name: 'Birrete de Sabio', cost: 100 },
      { id: '🎩', name: 'Sombrero Mágico', cost: 80 },
      { id: '🤠', name: 'Sombrero Vaquero', cost: 70 }
    ],
    glasses: [
      { id: 'none', name: 'Sin Gafas', cost: 0 },
      { id: '🕶️', name: 'Gafas de Sol Estelares', cost: 60 },
      { id: '👓', name: 'Lentes de Científico', cost: 50 },
      { id: '⭐', name: 'Estrellas Mágicas', cost: 90 }
    ]
  };

  const userCoins = user?.coins || 0;
  const avatarConfig = user?.avatarConfig || { base: '🦁', hat: 'none', glasses: 'none', color: 'indigo' };
  const unlockedItems = user?.unlockedItems || ['🦁', 'none'];

  const handleSelectItem = async (category: 'base' | 'hat' | 'glasses', itemId: string, cost: number) => {
    if (!user) {
      alert('Debes iniciar sesión para guardar tus avatares en la tienda.');
      return;
    }

    const isUnlocked = unlockedItems.includes(itemId) || cost === 0;

    if (!isUnlocked && userCoins < cost) {
      alert('¡No tienes suficientes monedas! Gana más completando quizzes y tareas.');
      return;
    }

    let newCoins = userCoins;
    let newUnlocked = [...unlockedItems];

    if (!isUnlocked) {
      newCoins -= cost;
      newUnlocked.push(itemId);
    }

    const newConfig = { ...avatarConfig, [category]: itemId };

    const updatedUser: UserProfile = {
      ...user,
      coins: newCoins,
      avatarConfig: newConfig,
      unlockedItems: newUnlocked,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        coins: newCoins,
        avatarConfig: newConfig,
        unlockedItems: newUnlocked,
        updatedAt: new Date().toISOString()
      });
      onUpdateUser(updatedUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 pb-24 sm:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-amber-200 text-amber-900 px-3.5 py-1 rounded-full font-bold text-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>TIENDA MÁGICA DE AVATARES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
              Personaliza tu Aventurero 🎒
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Usa tus monedas ganadas estudiando para desbloquear accesorios y presumir tu estilo.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-amber-200 flex items-center space-x-2.5 shadow-2xs">
            <Coins className="w-6 h-6 text-amber-500 fill-amber-400" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Tus Monedas</div>
              <div className="text-xl font-black text-amber-950">{userCoins} 🪙</div>
            </div>
          </div>
        </div>

        {/* Avatar Preview Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center shadow-sm max-w-xs mx-auto space-y-3">
          <div className="relative w-28 h-28 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center text-5xl shadow-2xs mx-auto border-4 border-white">
            <span>{avatarConfig.base}</span>
            {avatarConfig.hat !== 'none' && (
              <span className="absolute -top-3 right-3 text-3xl">{avatarConfig.hat}</span>
            )}
            {avatarConfig.glasses !== 'none' && (
              <span className="absolute top-9 text-2xl">{avatarConfig.glasses}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-indigo-950">{user?.displayName || 'Aventurero'}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Avatar Estelar Activo</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center space-x-2">
          {[
            { id: 'base', label: '🐾 Personaje' },
            { id: 'hat', label: '👑 Sombreros' },
            { id: 'glasses', label: '🕶️ Gafas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition border ${
                activeTab === tab.id
                  ? 'bg-amber-300 text-amber-950 border-amber-400 font-black'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {((items as any)[activeTab] || []).map((item: any) => {
            const isUnlocked = unlockedItems.includes(item.id) || item.cost === 0;
            const isSelected = avatarConfig[activeTab] === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(activeTab as any, item.id, item.cost)}
                className={`bg-white hover:bg-sky-50 rounded-2xl p-3.5 border text-center cursor-pointer transition flex flex-col justify-between shadow-2xs ${
                  isSelected ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200'
                }`}
              >
                <div className="text-3xl py-2">{item.id}</div>
                <div className="space-y-1">
                  <div className="font-bold text-xs text-indigo-950 truncate">{item.name}</div>
                  <div className="text-[11px] font-black flex items-center justify-center space-x-1">
                    {isUnlocked ? (
                      <span className="text-emerald-700 flex items-center">
                        <Check className="w-3 h-3 mr-0.5" /> Adquirido
                      </span>
                    ) : (
                      <span className="text-amber-800 flex items-center">
                        <Coins className="w-3 h-3 mr-1 text-amber-500 fill-amber-400" /> {item.cost}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
