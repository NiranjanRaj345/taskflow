import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';

const Tasks = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('tasks', () => taskAPI.getAll(filter));

  const createMutation = useMutation(taskAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('userTasks');
      setShowForm(false);
      toast.success('Task created successfully');
    },
  });

  const updateMutation = useMutation(({ id, data }) => taskAPI.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('userTasks');
      toast.success('Task updated successfully');
    },
  });

  const deleteMutation = useMutation(taskAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('userTasks');
      toast.success('Task deleted successfully');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      assignedTo: formData.get('assignedTo'),
      team: formData.get('team'),
      dueDate: formData.get('dueDate'),
    });
  };

  const getStatusColor = (status) => {
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="title" type="text" required placeholder="Task title" className="px-3 py-2 border border-gray-300 rounded-md" />
              <select name="status" className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
              <select name="priority" className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <input name="dueDate" type="date" className="px-3 py-2 border border-gray-300 rounded-md" />
              <input name="team" type="text" placeholder="Team ID" className="px-3 py-2 border border-gray-300 rounded-md" />
              <input name="assignedTo" type="text" placeholder="Assigned User ID" className="px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <textarea name="description" rows="3" placeholder="Description" className="px-3 py-2 border border-gray-300 rounded-md w-full" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
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
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data?.data?.map((task) => (
                    <tr key={task._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{task.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => updateMutation.mutate({ id: task._id, data: { status: task.status === 'todo' ? 'in-progress' : 'todo' } })} className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(task._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
