import React, { useEffect, useState } from 'react';
import { UserProfile, StudySession } from '../types';
import { Trophy, X, Flame, Star, Coins, BarChart2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StatsModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ user, onClose }) => {
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; hours: number }>>([
    { day: 'Lun', hours: 1.0 },
    { day: 'Mar', hours: 1.5 },
    { day: 'Mié', hours: 0.5 },
    { day: 'Jue', hours: 2.0 },
    { day: 'Vie', hours: 1.2 },
    { day: 'Sáb', hours: 2.5 },
    { day: 'Dom', hours: 0.8 },
  ]);

  useEffect(() => {
    const fetchStudySessions = async () => {
      if (!user) return;
      try {
        const qRef = collection(db, 'study_sessions');
        const q = query(qRef, where('userId', '==', user.uid));
        const snap = await getDocs(q);
        
        const daysMap: { [key: string]: number } = {
          'Lun': 0.5,
          'Mar': 1.0,
          'Mié': 0.8,
          'Jue': 1.5,
          'Vie': 1.0,
          'Sáb': 2.0,
          'Dom': 0.5
        };

        snap.forEach(docSnap => {
          const session = docSnap.data() as StudySession;
          if (session.completedAt) {
            const date = new Date(session.completedAt);
            const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday...
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const name = dayNames[dayOfWeek];
            // Each completed session adds approx 0.5 hours of study time
            daysMap[name] = (daysMap[name] || 0) + 0.5;
          }
        });

        const formatted = [
          { day: 'Lun', hours: daysMap['Lun'] },
          { day: 'Mar', hours: daysMap['Mar'] },
          { day: 'Mié', hours: daysMap['Mié'] },
          { day: 'Jue', hours: daysMap['Jue'] },
          { day: 'Vie', hours: daysMap['Vie'] },
          { day: 'Sáb', hours: daysMap['Sáb'] },
          { day: 'Dom', hours: daysMap['Dom'] },
        ];
        setWeeklyData(formatted);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'study_sessions');
      }
    };

    fetchStudySessions();
  }, [user]);

  const badges = [
    { title: 'Primeros Pasos', desc: 'Completaste tu primer quiz', unlocked: (user?.xp || 0) > 0, icon: '🌟' },
    { title: 'Explorador Estelar', desc: 'Alcanzaste el Nivel 2', unlocked: (user?.level || 1) >= 2, icon: '🚀' },
    { title: 'Coleccionista', desc: 'Obtuviste 100 monedas', unlocked: (user?.coins || 0) >= 100, icon: '🪙' },
    { title: 'Racha de Fuego', desc: 'Mantuviste una racha activa', unlocked: (user?.streak || 0) > 0, icon: '🔥' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-xl text-slate-800 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-black text-indigo-950">Tus Logros y Estadísticas</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-orange-50 p-2.5 rounded-2xl border border-orange-200">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-black text-orange-900">{user?.streak || 0}</div>
            <div className="text-[10px] text-orange-700 font-bold">Días Racha</div>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
            <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-lg font-black text-amber-900">{user?.coins || 0}</div>
            <div className="text-[10px] text-amber-700 font-bold">Monedas</div>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
            <Star className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-lg font-black text-emerald-900">{user?.xp || 0}</div>
            <div className="text-[10px] text-emerald-700 font-bold">Puntos XP</div>
          </div>
        </div>

        {/* Study Hours Bar Chart */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Horas de Estudio esta Semana</h4>
          </div>
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: any) => [`${value} hrs`, 'Tiempo de Estudio']}
                />
                <Bar dataKey="hours" fill="#fbbf24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badges List */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Medallas Desbloqueadas</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border flex items-center space-x-3 transition ${
                  badge.unlocked
                    ? 'bg-amber-50/60 border-amber-200 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-xs text-indigo-950">{badge.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{badge.desc}</div>
                </div>
                {badge.unlocked && (
                  <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    ¡Listo!
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-3 rounded-2xl shadow-2xs transition text-sm border border-amber-400"
        >
          ¡Genial! Continuar Estudiando 🚀
        </button>

      </div>
    </div>
  );
};
