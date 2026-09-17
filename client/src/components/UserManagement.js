import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '../utils/toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', getAuthConfig());
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load registered users');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This will also delete all their recipes.`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, getAuthConfig());
      toast.success(`User "${userName}" deleted successfully!`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>User Management</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Manage all registered users. Deleting a user will also delete all their recipes.
      </p>

      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#ecf0f1', borderRadius: '8px' }}>
          <h3>No users found</h3>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Username</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Joined</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '15px' }}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td style={{ padding: '15px' }}>{user.username}</td>
                  <td style={{ padding: '15px' }}>{user.email}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      background: user.role === 'admin' ? '#e74c3c' : '#3498db'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '14px', color: '#7f8c8d' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {user.role !== 'admin' ? (
                      <button
                        onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                        style={{
                          padding: '8px 16px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span style={{ color: '#95a5a6', fontSize: '14px' }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderLeft: '4px solid #ffc107', borderRadius: '4px' }}>
        <strong>⚠️ Warning:</strong> Deleting a user will permanently remove their account and all recipes they've submitted. This action cannot be undone.
      </div>
    </div>
  );
}

export default UserManagement;
