import React from 'react';
import { useQuery } from 'react-query';
import { taskAPI } from '../services/api';
import { ListTodo, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, error } = useQuery('userTasks', taskAPI.getUserTasks);

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
        <p className="mt-1 text-sm text-gray-600">Overview of your tasks and activity</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tasks" value={stats.total} icon={ListTodo} color="text-blue-600" />
        <StatCard title="To Do" value={stats.todo} icon={Clock} color="text-gray-600" />
        <StatCard title="In Progress" value={stats.inProgress} icon={AlertTriangle} color="text-yellow-600" />
        <StatCard title="Completed" value={stats.done} icon={CheckCircle} color="text-green-600" />
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a href="/tasks" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
              <ListTodo className="flex-shrink-0 h-6 w-6 text-blue-600" />
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">View All Tasks</p>
                <p className="text-sm text-gray-500 truncate">Manage your tasks</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
