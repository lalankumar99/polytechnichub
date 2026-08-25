import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';

export const AdminPremiumManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editId, setEditId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPremiumUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateAdminPremiumUser(editingUser.internalId, { status: editStatus, id: editId });
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      alert('Error updating user: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (internalId: string) => {
    if (!confirm('Are you sure you want to delete this user? They will lose all premium access.')) return;
    try {
      await api.deleteAdminPremiumUser(internalId);
      loadData();
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Premium Access Requests</h2>
          <p className="text-sm text-slate-500">Manage student premium registrations and assign Login IDs.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Student</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Assigned ID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.internalId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-slate-700">{user.email}</p>
                    <p className="text-xs text-slate-500">{user.mobile}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {user.id || 'Not Assigned'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold \${
                      user.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      user.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {user.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setEditStatus(user.status);
                        setEditId(user.id || '');
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.internalId)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No premium registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-bold text-xl">Manage Access</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-4">
                  Student: <span className="font-bold text-slate-900">{editingUser.name}</span>
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
                >
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved & Active</option>
                  <option value="rejected">Rejected / Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assign Login ID</label>
                <input 
                  type="text" 
                  value={editId} 
                  onChange={e => setEditId(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none font-mono" 
                  placeholder="e.g. PH-1001"
                />
                <p className="text-xs text-slate-500 mt-1">Provide this ID to the student. They will use it to log in.</p>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center shadow-md disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
