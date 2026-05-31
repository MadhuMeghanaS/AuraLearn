import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/apiService';
import { 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Edit, 
  Save, 
  Loader2, 
  X, 
  Check, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, updateProfileState } = useAuth();
  const [editing, setEditing] = useState(false);
  
  // State for profile editing
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // State for password change
  const [pwd, setPwd] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  // Initialize values when user loads
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Flash message timeout helper
  const showFlashMessage = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => {
      setter({ type: '', text: '' });
    }, 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      showFlashMessage(setProfileMessage, 'error', 'Name and email cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', { username, email });
      if (res.data.success) {
        // Update context state
        updateProfileState({ username, email });
        setEditing(false);
        showFlashMessage(setProfileMessage, 'success', 'Profile updated successfully!');
      } else {
        showFlashMessage(setProfileMessage, 'error', res.data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      showFlashMessage(
        setProfileMessage, 
        'error', 
        err.response?.data?.error || 'An error occurred while updating profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwd.current || !pwd.new || !pwd.confirm) {
      showFlashMessage(setPwdMessage, 'error', 'All fields are required');
      return;
    }
    if (pwd.new.length < 6) {
      showFlashMessage(setPwdMessage, 'error', 'New password must be at least 6 characters long');
      return;
    }
    if (pwd.new !== pwd.confirm) {
      showFlashMessage(setPwdMessage, 'error', 'New passwords do not match');
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await api.post('/auth/change-password', { 
        currentPassword: pwd.current, 
        newPassword: pwd.new 
      });
      
      if (res.data.success) {
        setPwd({ current: '', new: '', confirm: '' });
        showFlashMessage(setPwdMessage, 'success', 'Password updated successfully!');
      } else {
        showFlashMessage(setPwdMessage, 'error', res.data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error('Failed to change password', err);
      showFlashMessage(
        setPwdMessage, 
        'error', 
        err.response?.data?.error || 'Incorrect current password or update failed'
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* Page Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-zinc-800 tracking-tight flex items-center gap-2">
          Your Profile
        </h1>
        <p className="text-zinc-500 text-sm">Manage your personal settings, account details, and security.</p>
      </div>

      {/* Main Info Card */}
      <div className="card-standard p-6 md:p-8 relative overflow-hidden bg-white/70 backdrop-blur-md border border-[#f3eae0] rounded-2xl shadow-sm">
        
        {/* User avatar header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-[#f3eae0] mb-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-tr from-[#ed7e99] to-[#f7a4b8] rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-[#ed7e99]/20 transform transition-transform group-hover:scale-105 duration-300">
              {username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-4 border-white shadow-sm flex items-center justify-center">
              <ShieldCheck size={14} className="stroke-[3]" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-extrabold text-zinc-800">{user?.username || 'Learner'}</h2>
              <p className="text-zinc-500 font-medium flex items-center justify-center md:justify-start gap-1.5 text-sm">
                <Mail size={14} className="text-zinc-400" />
                {user?.email || 'learner@domain.com'}
              </p>
            </div>
            
            {user?.createdAt && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-50 text-zinc-500 rounded-full border border-zinc-200/60 text-xs font-semibold">
                <Calendar size={12} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <User size={18} className="text-[#ed7e99]" />
            Personal Details
          </h3>

          {profileMessage.text && (
            <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
              profileMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {profileMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-black text-zinc-500 uppercase tracking-wider">Full Name</label>
              {editing ? (
                <input
                  id="fullName"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#ed7e99]/40 focus:border-[#ed7e99] transition-all"
                />
              ) : (
                <div className="px-4 py-3 bg-[#fffdfb] border border-[#f3eae0] rounded-xl text-zinc-750 font-semibold shadow-sm shadow-zinc-100/50">
                  {username || 'N/A'}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="emailAddr" className="text-xs font-black text-zinc-500 uppercase tracking-wider">Email Address</label>
              {editing ? (
                <input
                  id="emailAddr"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#ed7e99]/40 focus:border-[#ed7e99] transition-all"
                />
              ) : (
                <div className="px-4 py-3 bg-[#fffdfb] border border-[#f3eae0] rounded-xl text-zinc-750 font-semibold shadow-sm shadow-zinc-100/50">
                  {email || 'N/A'}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#ed7e99] hover:bg-[#eb6d8a] disabled:bg-[#f7a4b8] text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] text-sm shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (user) {
                      setUsername(user.username || '');
                      setEmail(user.email || '');
                    }
                  }}
                  className="bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] text-sm"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="bg-[#fffdfb] hover:bg-zinc-50 border border-[#f3eae0] text-zinc-800 font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] text-sm shadow-sm"
              >
                <Edit size={16} className="text-[#ed7e99]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="card-standard p-6 md:p-8 bg-white/70 backdrop-blur-md border border-[#f3eae0] rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mb-5">
          <Lock size={18} className="text-[#ed7e99]" />
          Change Password
        </h3>

        {pwdMessage.text && (
          <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 mb-5 animate-in fade-in slide-in-from-top-2 duration-300 ${
            pwdMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {pwdMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span>{pwdMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="currPwd" className="text-xs font-black text-zinc-500 uppercase tracking-wider">Current Password</label>
              <input
                id="currPwd"
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#ed7e99]/40 focus:border-[#ed7e99] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="newPwd" className="text-xs font-black text-zinc-500 uppercase tracking-wider">New Password</label>
              <input
                id="newPwd"
                type="password"
                value={pwd.new}
                onChange={(e) => setPwd({ ...pwd, new: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#ed7e99]/40 focus:border-[#ed7e99] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confPwd" className="text-xs font-black text-zinc-500 uppercase tracking-wider">Confirm New Password</label>
              <input
                id="confPwd"
                type="password"
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                placeholder="Confirm password"
                className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl px-4 py-3 text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#ed7e99]/40 focus:border-[#ed7e99] transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPwd}
              className="bg-[#ed7e99] hover:bg-[#eb6d8a] disabled:bg-[#f7a4b8] text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] text-sm shadow-sm"
            >
              {isChangingPwd ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Logout / Dangerous Area */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={logout}
          className="bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-200 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center gap-2 active:scale-[0.98] text-sm shadow-sm"
        >
          <LogOut size={16} className="stroke-[2.5]" />
          <span>Sign Out of Account</span>
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;
