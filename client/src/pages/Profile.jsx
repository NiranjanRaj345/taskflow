import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Hash, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', avatar: '' });

  const { data, isLoading, refetch } = useQuery('profile', authAPI.getProfile, {
    enabled: false,
  });

  const profile = data?.data?.data || user;

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        setUser(response.data.data);
        queryClient.invalidateQueries('profile');
        setIsEditing(false);
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage your account details</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setFormData({
                      name: profile.name || '',
                      email: profile.email || '',
                      avatar: profile.avatar || '',
                    });
                  }
                }}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 inline mr-2" />
                Cancel
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={updateMutation.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  <Save className="h-4 w-4 inline mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-medium">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{profile?.name}</h4>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm font-medium">User ID</span>
                  </div>
                  <p className="text-sm text-gray-900 font-mono">{profile?.userId || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <p className="text-sm text-gray-900 capitalize">{profile?.role || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-gray-900">{profile?.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Status</span>
                  </div>
                  <p className="text-sm text-gray-900">{profile?.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
