import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { teamAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Users, Trash2 } from 'lucide-react';

const Teams = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const queryClient = useQueryClient();

  const { data: teams, isLoading } = useQuery('teams', teamAPI.getAll);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your teams and collaboration</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </button>
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
          teams?.data?.data?.map((team) => (
            <div key={team._id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.description || 'No description'}</p>
                  </div>
                </div>
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
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Members: {team.members?.length || 0}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {(!teams?.data?.data || teams.data.data.length === 0) && (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
        </div>
      )}
    </div>
  );
};

export default Teams;
