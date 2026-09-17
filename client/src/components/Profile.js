import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '../utils/toast';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', getAuthConfig());
      setProfileData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        username: response.data.username
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile details');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/profile', profileData, getAuthConfig());
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        getAuthConfig()
      );
      toast.success('Password changed successfully! 🔐');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f1f5f9',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 1s ease-in-out infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
          Account Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Manage your personal information, username, and password credentials
        </p>
      </div>

      {/* Profile Information Card */}
      <div style={{
        background: '#ffffff',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
        marginBottom: '32px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
          👤 Profile Details
        </h2>
        <form onSubmit={handleProfileSubmit} style={{ margin: 0, padding: 0, boxShadow: 'none', background: 'transparent' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              disabled
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Usernames are unique and cannot be modified
            </small>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div style={{
        background: '#ffffff',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
          🔒 Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} style={{ margin: 0, padding: 0, boxShadow: 'none', background: 'transparent' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength="6"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px' }}
            />
            <small style={{ color: '#94a3b8', fontSize: '12px' }}>Minimum 6 characters</small>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              minLength="6"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
