import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/AddVehicle';
import VehicleManager from './pages/VehicleManager';
import DiagnosisForm from './components/DiagnosisForm';
import ResultDisplay from './components/ResultDisplay';
import { API_BASE_URL } from './config/api';
import './App.css';

// Wrapper for the legacy diagnosis page to match new layout
const QuickDiagnosis = () => {
    const [result, setResult] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        make: '', model: '', year: '', mileage: '', problem: '', symptoms: ''
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/diagnosis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            // Backend now returns the object directly
            setResult(data);
        } catch (error) {
            console.error(error);
            setResult({ issue: "Error", fix: "Failed to get diagnosis. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h2>Quick Diagnosis</h2>
            <DiagnosisForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                loading={loading}
            />
            <ResultDisplay result={result} />
        </div>
    );
};

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/add-vehicle" element={<AddVehicle />} />
                        <Route path="/vehicle/:id" element={<VehicleManager />} />
                        <Route path="/diagnosis" element={<QuickDiagnosis />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
