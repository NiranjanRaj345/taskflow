import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { teamAPI, authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, UserPlus, LogOut, Trash2, Crown, Check, X, Copy, CheckCircle } from 'lucide-react';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [users, setUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(['team', id], () => teamAPI.getById(id), { enabled: !!id });

  useEffect(() => {
    authAPI.getAllUsers().then((res) => setUsers(res.data.data)).catch(() => {});
  }, []);

  const team = data?.data?.data;
  const members = team?.members || [];

  const myRole = members.find((m) => m.user?._id === user?._id)?.role;
  const isCreator = team?.createdBy?._id === user?._id || team?.createdBy?.toString?.() === user?._id;
  const canManage = (myRole === 'owner' || myRole === 'admin') || isCreator;

  const { data: requestsData } = useQuery(
    ['joinRequests', id],
    () => teamAPI.getJoinRequests(id),
    { enabled: !!id && canManage }
  );

  const addMutation = useMutation(
    ({ userId, role }) => teamAPI.addMember(id, { userId, role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team', id]);
        queryClient.invalidateQueries('teams');
        setShowAddMember(false);
        toast.success('Member added');
      },
    }
  );

  const removeMutation = useMutation(
    (userId) => teamAPI.removeMember(id, { userId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team', id]);
        queryClient.invalidateQueries('teams');
        toast.success('Member removed');
      },
    }
  );

  const leaveMutation = useMutation(() => teamAPI.leave(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      toast.success('Left team');
      navigate('/teams');
    },
  });

  const deleteMutation = useMutation(() => teamAPI.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      toast.success('Team deleted');
      navigate('/teams');
    },
  });

  const approveMutation = useMutation(
    ({ userId }) => teamAPI.approveJoin(id, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team', id]);
        queryClient.invalidateQueries('teams');
        queryClient.invalidateQueries(['joinRequests', id]);
        toast.success('Join request approved');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ userId }) => teamAPI.rejectJoin(id, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['joinRequests', id]);
        toast.success('Join request rejected');
      },
    }
  );

  const generateInviteMutation = useMutation(
    ({ role }) => teamAPI.generateInviteLink(id, role),
    {
      onSuccess: (data) => {
        setInviteLink(data.data.data.link);
        toast.success('Invitation link generated!');
      },
    }
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/teams')} className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </button>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error?.response?.data?.message || 'Team not found'}</p>
        </div>
      </div>
    );
  }

  const availableUsers = users.filter((u) => !members.some((m) => m.user?._id === u._id));
  const joinRequests = requestsData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/teams')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-500">{team.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <button
              onClick={() => {
                if (window.confirm('Delete this team permanently?')) {
                  deleteMutation.mutate();
                }
              }}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          )}
          {myRole && myRole !== 'owner' && (
            <button
              onClick={() => {
                if (window.confirm('Leave this team?')) {
                  leaveMutation.mutate();
                }
              }}
              className="px-4 py-2 border border-gray-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
            >
              <LogOut className="h-4 w-4 inline mr-2" />
              Leave
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Members ({members.length})
            </h3>
            {canManage && (
              <button onClick={() => setShowAddMember(!showAddMember)} className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 inline mr-2" />
                Add Member
              </button>
            )}
          </div>

          {showAddMember && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex gap-3">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select user</option>
                  {availableUsers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name || u.email}</option>
                  ))}
                </select>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => {
                    if (!selectedUserId) {
                      toast.error('Select a user');
                      return;
                    }
                    addMutation.mutate({ userId: selectedUserId, role: selectedRole });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
              </div>
              {availableUsers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">All users are already members.</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                    {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.user.name || member.user.email}</p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role === 'owner' && <Crown className="h-3 w-3 inline mr-1" />}
                    {member.role}
                  </span>
                  {canManage && member.role !== 'owner' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${member.user.name || member.user.email} from the team?`)) {
                          removeMutation.mutate(member.user._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {canManage && joinRequests.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Join Requests ({joinRequests.length})</h3>
            <div className="space-y-3">
              {joinRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-medium text-sm">
                      {(request.user.name || request.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.user.name || request.user.email}</p>
                      <p className="text-xs text-gray-500">{request.user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveMutation.mutate({ userId: request.user._id })}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({ userId: request.user._id })}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {canManage && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation Link</h3>
            <p className="text-sm text-gray-500 mb-3">Generate a one-time invitation link that anyone can use to join this team without approval.</p>
            
            {!inviteLink ? (
              <button
                onClick={() => generateInviteMutation.mutate({ role: 'member' })}
                disabled={generateInviteMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                Generate Invitation Link
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                  {copied ? <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" /> : <Copy className="h-4 w-4 inline mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/tasks" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">View Tasks</p>
                <p className="text-sm text-gray-500 truncate">Manage team tasks</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
