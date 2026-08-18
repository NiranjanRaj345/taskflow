import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { teamAPI, taskAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Users, Trash2, LogOut, UserPlus } from 'lucide-react';

const Teams = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all | my
  const [users, setUsers] = useState([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: teams, isLoading } = useQuery(
    ['teams', filter],
    () => filter === 'my' ? teamAPI.getMyTeams() : teamAPI.getAll(),
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

  const joinMutation = useMutation(teamAPI.join, {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      toast.success('Joined team successfully');
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

  const isUserInTeam = (team) => {
    return team.members?.some((m) => m.user?._id === user?._id);
  };

  const getUserRole = (team) => {
    const member = team.members?.find((m) => m.user?._id === user?._id);
    return member?.role;
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
            const canDelete = role === 'owner' || role === 'admin';

            return (
              <div key={team._id} className="bg-white shadow rounded-lg p-6">
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
                      onClick={() => {
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
                    {role && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(role)}`}>
                        {role}
                      </span>
                    )}
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
                  {inTeam ? (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to leave this team?')) {
                          leaveMutation.mutate(team._id);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm('Do you want to join this team?')) {
                          joinMutation.mutate(team._id);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join
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
