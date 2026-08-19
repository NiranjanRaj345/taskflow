import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { taskAPI, teamAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Filter, CheckCircle2, Circle, Clock, User } from 'lucide-react';

const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', icon: Circle, color: 'text-gray-500' },
  { value: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
  { value: 'review', label: 'Review', icon: Edit2, color: 'text-blue-500' },
  { value: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
];

const Tasks = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '', mine: false });
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const queryClient = useQueryClient();

  const { user } = useAuth();

  useEffect(() => {
    teamAPI.getMyTeams().then((res) => {
      setTeams(res.data.data || []);
    }).catch(() => {});
  }, []);

  const selectedTeam = teams.find((t) => t._id === selectedTeamId);
  const teamMembers = selectedTeam?.members || [];
  const myRole = selectedTeam ? selectedTeam.members.find((m) => m.user?._id === user?._id)?.role : null;
  const canCreateTask = selectedTeam ? ['owner', 'admin'].includes(myRole) : false;

  const hasAnyManageableTeam = teams.some((team) => {
    const role = team.members.find((m) => m.user?._id === user?._id)?.role;
    return ['owner', 'admin'].includes(role);
  });

  const { data, isLoading } = useQuery(
    ['tasks', filter],
    () => {
      if (filter.mine) {
        return taskAPI.getUserTasks();
      }
      const params = { ...filter };
      delete params.mine;
      return taskAPI.getAll(params);
    },
  );

  const createMutation = useMutation(taskAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('userTasks');
      setShowForm(false);
      setSelectedTeamId('');
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => taskAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries('userTasks');
        toast.success('Task updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update task');
      },
    }
  );

  const deleteMutation = useMutation(taskAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('userTasks');
      toast.success('Task deleted successfully');
    },
  });

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t._id === teamId);
    return team?.name || 'Unknown Team';
  };

  const getUserName = (userId) => {
    const u = users.find((user) => user._id === userId);
    return u?.name || u?.email || 'Unassigned';
  };

  const getStatusInfo = (statusValue) => {
    return TASK_STATUSES.find((s) => s.value === statusValue) || TASK_STATUSES[0];
  };

  const canUpdateTask = (task) => {
    if (!user || !task) return false;
    const team = teams.find((t) => t._id === task.team);
    if (!team) return false;
    const member = team.members.find((m) => m.user?._id === user._id);
    if (!member) return false;
    if (['owner', 'admin'].includes(member.role)) return true;
    if (task.assignedTo && task.assignedTo.toString() === user._id) return true;
    return false;
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const taskData = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      assignedTo: formData.get('assignedTo'),
      team: formData.get('team'),
      dueDate: formData.get('dueDate'),
    };

    if (!taskData.title || !taskData.description || !taskData.team || !taskData.assignedTo || !taskData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMutation.mutate(taskData);
  };

  const getStatusColor = (status) => {
    const info = getStatusInfo(status);
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your tasks and track progress</p>
        </div>
        {hasAnyManageableTeam && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </button>
        )}
      </div>

      {!hasAnyManageableTeam && teams.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            You need to be an owner or admin of a team to create tasks.
          </p>
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="title" type="text" required placeholder="Task title" className="px-3 py-2 border border-gray-300 rounded-md" />
              <select name="status" className="px-3 py-2 border border-gray-300 rounded-md">
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select name="priority" className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <input name="dueDate" type="date" required className="px-3 py-2 border border-gray-300 rounded-md" />
              <select
                name="team"
                required
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                }}
              >
                <option value="">Select Team</option>
                {teams.map((team) => {
                  const role = team.members.find((m) => m.user?._id === user?._id)?.role;
                  return (
                    <option key={team._id} value={team._id} disabled={!['owner', 'admin'].includes(role)}>
                      {team.name} {role ? `(${role})` : ''}
                    </option>
                  );
                })}
              </select>
              <select name="assignedTo" required className="px-3 py-2 border border-gray-300 rounded-md" disabled={!selectedTeamId}>
                <option value="">Assign to</option>
                {teamMembers.map((m) => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name || m.user.email}</option>
                ))}
              </select>
            </div>
            <textarea name="description" rows="3" required placeholder="Description" className="px-3 py-2 border border-gray-300 rounded-md w-full" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => { setShowForm(false); setSelectedTeamId(''); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Status</option>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={() => setFilter({ status: '', priority: '', mine: !filter.mine })}
              className={`px-3 py-2 border rounded-md text-sm font-medium ${
                filter.mine
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              My Tasks
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading tasks...</div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data?.data?.map((task) => {
                    const statusInfo = getStatusInfo(task.status);
                    const StatusIcon = statusInfo.icon;
                    const updatable = canUpdateTask(task);
                    const isDone = task.status === 'done';

                    return (
                      <tr key={task._id} className={isDone ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {task.title}
                            {isDone && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {updatable ? (
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              className={`text-xs border border-gray-300 rounded-md px-2 py-1 ${getStatusColor(task.status)}`}
                            >
                              {TASK_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{task.priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeamName(task.team)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            {getUserName(task.assignedTo)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isDone ? (
                            <span className="text-green-600 font-medium">Completed</span>
                          ) : (
                            <span className="text-gray-400">In Progress</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {updatable && !isDone && (
                            <button onClick={() => deleteMutation.mutate(task._id)} className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(!data?.data?.data || data.data.data.length === 0) && (
                <div className="text-center py-8 text-gray-500">No tasks found. Create your first task!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
