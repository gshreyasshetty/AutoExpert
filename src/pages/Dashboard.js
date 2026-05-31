import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Trash2, MessageCircle, Plus, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vehicles`);
            const data = await response.json();
            setVehicles(data.vehicles || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteVehicle = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
                method: 'DELETE',
            });
            fetchVehicles();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    };

    // Analytics Calculations
    const totalVehicles = vehicles.length;
    const totalMileage = vehicles.reduce((sum, v) => sum + (parseInt(v.mileage) || 0), 0);
    // Simulated "Total Service Spend" based on mileage (just for demo)
    const estimatedServiceSpend = Math.round(totalMileage * 0.05); 

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="dashboard-container">
            {/* Business Analytics Section */}
            <div className="analytics-section" style={{ marginBottom: '30px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <BarChart3 /> Fleet Analytics
                </h2>
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Vehicles</span>
                            <Car size={20} color="var(--primary-color)" />
                        </div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{totalVehicles}</h3>
                    </div>
                    
                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Mileage</span>
                            <Activity size={20} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{totalMileage.toLocaleString()} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>km</span></h3>
                    </div>

                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Est. Service Spend</span>
                            <DollarSign size={20} color="#f59e0b" />
                        </div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>${estimatedServiceSpend.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div className="dashboard-header">
                <h1>My Garage</h1>
                <Link to="/add-vehicle" className="add-btn">
                    <Plus size={20} />
                    Add Vehicle
                </Link>
            </div>

            {vehicles.length === 0 ? (
                <div className="empty-state">
                    <Car size={64} className="empty-icon" />
                    <h2>No vehicles yet</h2>
                    <p>Add your first vehicle to get started with AI diagnostics</p>
                    <Link to="/add-vehicle" className="primary-btn">
                        Add Your First Vehicle
                    </Link>
                </div>
            ) : (
                <div className="vehicles-grid">
                    {vehicles.map((vehicle) => (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="vehicle-card"
                        >
                            <div className="vehicle-info">
                                <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                <p className="vehicle-detail">{vehicle.mileage.toLocaleString()} km</p>
                                {vehicle.vin && <p className="vehicle-detail">VIN: {vehicle.vin}</p>}
                            </div>

                            <div className="vehicle-actions">
                                <Link to={`/vehicle/${vehicle.id}`} className="action-btn manage-btn">
                                    <MessageCircle size={18} />
                                    Manage
                                </Link>
                                <button onClick={() => deleteVehicle(vehicle.id)} className="action-btn delete-btn">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
