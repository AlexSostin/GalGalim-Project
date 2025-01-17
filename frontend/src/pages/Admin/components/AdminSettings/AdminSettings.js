import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './AdminSettings.css';

const AdminSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        allowNewRegistrations: true,
        autoApproveListings: false,
        notifyOnNewOrders: true,
        maintenanceMode: false
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSettingChange = async (setting, value) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/settings/update/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    setting: setting,
                    value: value
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update setting');
            }

            setSettings(prev => ({
                ...prev,
                [setting]: value
            }));
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="admin-settings">
            <h2>Admin Settings</h2>
            
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="settings-container">
                <div className="settings-section">
                    <h3>General Settings</h3>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.allowNewRegistrations}
                                onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
                            />
                            Allow New User Registrations
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.autoApproveListings}
                                onChange={(e) => handleSettingChange('autoApproveListings', e.target.checked)}
                            />
                            Auto-approve New Listings
                        </label>
                    </div>
                </div>
                
                <div className="settings-section">
                    <h3>Notification Settings</h3>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.notifyOnNewOrders}
                                onChange={(e) => handleSettingChange('notifyOnNewOrders', e.target.checked)}
                            />
                            Notify on New Orders
                        </label>
                    </div>
                </div>
                
                <div className="settings-section">
                    <h3>Maintenance</h3>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                            />
                            Enable Maintenance Mode
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
