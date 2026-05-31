import React from 'react';
import { AlertTriangle, Wrench, DollarSign, ShoppingCart, CheckCircle, Activity } from 'lucide-react';

const ResultDisplay = ({ result }) => {
    if (!result) return null;

    // Handle legacy string results or error objects
    if (typeof result === 'string') {
        return <div className="result-card"><p>{result}</p></div>;
    }

    const { issue, severity, estimatedCost, parts, fix, analysis } = result;

    const getSeverityColor = (sev) => {
        if (!sev) return 'gray';
        const s = sev.toLowerCase();
        if (s.includes('high')) return '#ef4444'; // Red
        if (s.includes('medium')) return '#f59e0b'; // Orange
        return '#10b981'; // Green
    };

    return (
        <div className="result-card">
            <div className="result-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <h2 className="result-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle color={getSeverityColor(severity)} />
                    {issue || "Diagnosis Result"}
                </h2>
                {severity && (
                    <span className="severity-badge" style={{ 
                        backgroundColor: getSeverityColor(severity),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {severity}
                    </span>
                )}
            </div>

            <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Cost Estimator */}
                <div className="info-box cost-box" style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                        <DollarSign size={20} />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Est. Repair Cost</h3>
                    </div>
                    <p className="cost-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                        {estimatedCost || "N/A"}
                    </p>
                </div>

                {/* Parts Marketplace */}
                <div className="info-box parts-box" style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                        <Wrench size={20} />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Required Parts</h3>
                    </div>
                    <div className="parts-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {parts && parts.length > 0 ? (
                            parts.map((part, index) => (
                                <div key={index} className="part-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '8px', borderRadius: '4px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{part}</span>
                                    <a 
                                        href={`https://www.amazon.in/s?k=${encodeURIComponent(part + " automotive part")}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="buy-btn"
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '4px', 
                                            background: '#f90', 
                                            color: 'white', 
                                            textDecoration: 'none', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <ShoppingCart size={12} /> Buy
                                    </a>
                                </div>
                            ))
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No specific parts listed.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Analysis Section */}
            {analysis && (
                <div className="analysis-section" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                        <Activity size={20} color="#3b82f6" /> 
                        Technical Analysis
                    </h3>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>{analysis}</p>
                </div>
            )}

            {/* Fix Instructions */}
            <div className="fix-section" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                    <CheckCircle size={20} color="var(--primary-color)" /> 
                    Recommended Fix
                </h3>
                <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>{fix}</p>
            </div>
        </div>
    );
};

export default ResultDisplay;
