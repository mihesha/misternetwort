import React from 'react';
import { Plus } from 'lucide-react';

interface UsersViewProps {
  isDarkMode: boolean;
  adminUsers: any[];
  setShowNewUserModal: (val: boolean) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  isDarkMode,
  adminUsers,
  setShowNewUserModal
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white">إدارة مستخدمين وحسابات المشرفين والمالكين</h3>
            <p className="text-xs text-slate-400">إضافة مدراء للنظام وتعديل الأدوار والصلاحيات</p>
          </div>
          <button
            onClick={() => setShowNewUserModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستخدم إداري جديد</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 px-3">الاسم الكامل</th>
                <th className="py-2.5 px-3">البريد الإلكتروني</th>
                <th className="py-2.5 px-3">الدور / الصلاحية</th>
                <th className="py-2.5 px-3">رقم الهاتف</th>
                <th className="py-2.5 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300" dir="ltr">{u.phone}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
