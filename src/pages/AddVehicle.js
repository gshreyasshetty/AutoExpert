import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AddVehicle = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'Car',
        make: '',
        model: '',
        year: '',
        mileage: '',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        fuelEfficiency: '',
        vin: '',
        plateNumber: '',
        lastServiceDate: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                navigate('/');
            } else {
                const errorData = await response.json();
                alert(`Failed to save vehicle: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert(`Network Error: ${error.message}. Ensure the backend server is running on port 5000.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <button onClick={() => navigate('/')} className="back-btn">
                <ArrowLeft size={20} /> Back to Garage
            </button>

            <div className="form-card">
                <h2>Add New Vehicle</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Vehicle Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="Car">Car</option>
                            <option value="Bike">Bike</option>
                            <option value="Truck">Truck</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Make</label>
                            <input
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                placeholder="e.g. Toyota"
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <input
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="e.g. Camry"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Year</label>
                            <input
                                name="year"
                                type="number"
                                value={formData.year}
                                onChange={handleChange}
                                placeholder="e.g. 2020"
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Mileage (km)</label>
                            <input
                                name="mileage"
                                type="number"
                                value={formData.mileage}
                                onChange={handleChange}
                                placeholder="e.g. 50000"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fuel Type</label>
                            <select
                                name="fuelType"
                                value={formData.fuelType}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Transmission</label>
                            <select
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Fuel Efficiency (km/l)</label>
                        <input
                            name="fuelEfficiency"
                            type="number"
                            step="0.1"
                            value={formData.fuelEfficiency}
                            onChange={handleChange}
                            placeholder="e.g. 15.5"
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>VIN</label>
                            <input
                                name="vin"
                                value={formData.vin}
                                onChange={handleChange}
                                placeholder="Vehicle Identification Number"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>License Plate</label>
                            <input
                                name="plateNumber"
                                value={formData.plateNumber}
                                onChange={handleChange}
                                placeholder="e.g. ABC-1234"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Last Service Date</label>
                        <input
                            name="lastServiceDate"
                            type="date"
                            value={formData.lastServiceDate}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any specific details about the car..."
                            className="form-textarea"
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={20} /> Save Vehicle
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVehicle;
