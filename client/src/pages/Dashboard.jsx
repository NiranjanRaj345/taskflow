import React from 'react';
import { useQuery } from 'react-query';
import { taskAPI, teamAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ListTodo, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: teamsData } = useQuery('myTeams', teamAPI.getMyTeams);
  const { data, isLoading, error } = useQuery('userTasks', taskAPI.getUserTasks);

  const teams = teamsData?.data?.data || [];
  const hasTeam = teams.length > 0;

  const stats = React.useMemo(() => {
    if (!data?.data?.data) return { total: 0, todo: 0, inProgress: 0, review: 0, done: 0 };

    const taskList = data.data.data;
    return {
      total: taskList.length,
      todo: taskList.filter(t => t.status === 'todo').length,
      inProgress: taskList.filter(t => t.status === 'in-progress').length,
      review: taskList.filter(t => t.status === 'review').length,
      done: taskList.filter(t => t.status === 'done').length,
    };
  }, [data]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.name || 'User'}! Here's your overview.</p>
      </div>

      {!hasTeam ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Users className="h-8 w-8 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900">Get started by joining or creating a team</h3>
              <p className="text-sm text-blue-700 mt-1">
                Teams help you organize tasks and collaborate with others. Create a new team or join an existing one to start managing tasks.
              </p>
              <div className="mt-4 flex gap-3">
                <Link to="/teams" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Browse Teams
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Tasks" value={stats.total} icon={ListTodo} color="text-blue-600" />
          <StatCard title="To Do" value={stats.todo} icon={Clock} color="text-gray-600" />
          <StatCard title="In Progress" value={stats.inProgress} icon={AlertTriangle} color="text-yellow-600" />
          <StatCard title="Completed" value={stats.done} icon={CheckCircle} color="text-green-600" />
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/tasks" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">View All Tasks</p>
                <p className="text-sm text-gray-500 truncate">Manage your tasks</p>
              </div>
            </Link>
            <Link to="/teams" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Your Teams</p>
                <p className="text-sm text-gray-500 truncate">{hasTeam ? `You are in ${teams.length} team${teams.length > 1 ? 's' : ''}` : 'No teams yet'}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
