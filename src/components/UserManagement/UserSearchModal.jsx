import React, { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { usePostAdMutation } from '../../queries/ad';

const UserSearchModal = ({ isOpen, onClose, onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: adData, isLoading: isAdLoading } = usePostAdMutation(debouncedSearchTerm, isOpen && debouncedSearchTerm.trim() !== '');

  const handleUserSelect = user => {
    onUserSelect(user);
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Search Active Directory Users</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <div className="space-y-4">
          {isAdLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Searching Active Directory...</p>
            </div>
          )}

          {!isAdLoading && adData?.data && adData.data.length > 0 && (
            <div className="space-y-2">
              {adData.data.map(user => (
                <div
                  key={user.adguid}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.displayName
                          ?.split(' ')
                          ?.map(n => n[0])
                          ?.join('')
                          ?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.displayName}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">@{user.samAccountName}</p>
                    </div>
                  </div>
                  <UserPlus className="text-gray-400" size={20} />
                </div>
              ))}
            </div>
          )}

          {!isAdLoading && adData?.data && adData.data.length === 0 && searchTerm.trim() !== '' && (
            <div className="text-center py-8">
              <p className="text-gray-600">No users found matching "{searchTerm}"</p>
            </div>
          )}

          {!isAdLoading && !adData?.data && searchTerm.trim() === '' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Start typing to search for users in Active Directory</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
