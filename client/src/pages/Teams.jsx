import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { teamAPI, authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, Users, Trash2, LogOut, UserPlus, Clock, Globe, Lock } from 'lucide-react';

const Teams = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all | my
  const [isPublic, setIsPublic] = useState(true);
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: teams, isLoading } = useQuery(
    ['teams', filter],
    () => filter === 'my' ? teamAPI.getMyTeams() : teamAPI.getPublicTeams(),
    { keepPreviousData: true }
  );

  const { data: usersData } = useQuery('users', async () => {
    const res = await authAPI.getAllUsers();
    return res.data.data;
  }, { enabled: false });

  useEffect(() => {
    authAPI.getAllUsers().then((res) => setUsers(res.data.data)).catch(() => {});
  }, []);

  const createMutation = useMutation(teamAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      setShowForm(false);
      toast.success('Team created successfully');
    },
  });

  const deleteMutation = useMutation(teamAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      toast.success('Team deleted successfully');
    },
  });

  const requestJoinMutation = useMutation(teamAPI.requestJoin, {
    onSuccess: (_, teamId) => {
      setPendingRequests((prev) => ({ ...prev, [teamId]: true }));
      toast.success('Join request sent! Waiting for approval.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send join request');
    },
  });

  const leaveMutation = useMutation(teamAPI.leave, {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      toast.success('Left team successfully');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      isPublic: isPublic,
    });
  };

  const getRoleBadge = (role) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getVisibilityBadge = (team) => {
    if (team.isPublic === false) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <Lock className="h-3 w-3 mr-1" />
          Private
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <Globe className="h-3 w-3 mr-1" />
        Public
      </span>
    );
  };

  const isUserInTeam = (team) => {
    return team.members?.some((m) => m.user?._id === user?._id);
  };

  const getUserRole = (team) => {
    const member = team.members?.find((m) => m.user?._id === user?._id);
    return member?.role;
  };

  const isOwner = (team) => {
    return team.createdBy?._id === user?._id || team.createdBy?.toString?.() === user?._id;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your teams and collaboration</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Teams</option>
            <option value="my">My Teams</option>
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <input name="name" type="text" required placeholder="Team name" className="px-3 py-2 border border-gray-300 rounded-md" />
              <textarea name="description" rows="3" placeholder="Description" className="px-3 py-2 border border-gray-300 rounded-md w-full" />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Private</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {isPublic ? 'Anyone can discover and join this team directly.' : 'Only members can see this team. Others need an invite link or admin approval to join.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading teams...</div>
        ) : (
          teams?.data?.data?.map((team) => {
            const inTeam = isUserInTeam(team);
            const role = getUserRole(team);
            const owner = isOwner(team);
            const canDelete = role === 'owner' || role === 'admin';
            const hasPendingRequest = pendingRequests[team._id];

            return (
              <div key={team._id} className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/teams/${team._id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.description || 'No description'}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this team?')) {
                          deleteMutation.mutate(team._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">
                      Members: {team.members?.length || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      {getVisibilityBadge(team)}
                      {role && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(role)}`}>
                          {role}
                        </span>
                      )}
                    </div>
                  </div>

                  {team.members && team.members.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {team.members.slice(0, 3).map((member) => (
                        <div key={member.user._id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{member.user.name || member.user.email}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadge(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <p className="text-xs text-gray-500">+{team.members.length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  {owner ? (
                    <span className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50">
                      Owner
                    </span>
                  ) : inTeam ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to leave this team?')) {
                          leaveMutation.mutate(team._id);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave
                    </button>
                  ) : hasPendingRequest ? (
                    <span className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50">
                      <Clock className="h-4 w-4 mr-2" />
                      Pending Approval
                    </span>
                  ) : team.isPublic === false ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestJoinMutation.mutate(team._id);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Request to Join
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestJoinMutation.mutate(team._id);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Team
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {(!teams?.data?.data || teams.data.data.length === 0) && (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new team or joining an existing one.</p>
        </div>
      )}
    </div>
  );
};

export default Teams;
