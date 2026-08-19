import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { teamAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const Invite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('loading'); // loading | success | error

  const acceptMutation = useMutation(
    () => teamAPI.acceptInvite(token),
    {
      onSuccess: () => {
        setStatus('success');
        queryClient.invalidateQueries('teams');
        toast.success('You have joined the team!');
        setTimeout(() => navigate('/teams'), 2000);
      },
      onError: (error) => {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Failed to accept invitation');
      },
    }
  );

  useEffect(() => {
    if (user) {
      acceptMutation.mutate();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Join Team</h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to be logged in to accept this invitation.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Team Invitation</h2>
          <p className="mt-2 text-sm text-gray-600">
            You have been invited to join a team.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Accepting invitation...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="text-sm text-gray-900 font-medium">Successfully joined the team!</p>
              <p className="text-xs text-gray-500">Redirecting to teams...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-12 w-12 text-red-600" />
              <p className="text-sm text-gray-900 font-medium">Failed to accept invitation</p>
              <p className="text-xs text-gray-500">The link may be invalid or expired.</p>
              <button
                onClick={() => navigate('/teams')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Teams
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invite;
