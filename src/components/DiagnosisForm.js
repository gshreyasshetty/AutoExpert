import React from 'react';

const DiagnosisForm = ({ formData, setFormData, onSubmit, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="make">
              Vehicle Make
            </label>
            <input
              id="make"
              name="make"
              type="text"
              className="form-input"
              placeholder="e.g., Toyota"
              value={formData.make}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="model">
              Vehicle Model
            </label>
            <input
              id="model"
              name="model"
              type="text"
              className="form-input"
              placeholder="e.g., Corolla"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="year">
              Vehicle Year
            </label>
            <input
              id="year"
              name="year"
              type="text"
              className="form-input"
              placeholder="e.g., 2015"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mileage">
              KM Driven
            </label>
            <input
              id="mileage"
              name="mileage"
              type="text"
              className="form-input"
              placeholder="e.g., 60000"
              value={formData.mileage}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="problem">
            Problem Description
          </label>
          <textarea
            id="problem"
            name="problem"
            className="form-textarea"
            placeholder="Describe the issue your vehicle is experiencing..."
            value={formData.problem}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="symptoms">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            name="symptoms"
            className="form-textarea"
            placeholder="List any symptoms observed (e.g., strange noises, warning lights)..."
            value={formData.symptoms}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? (
            <>
              Getting Diagnosis
              <span className="loading-spinner"></span>
            </>
          ) : (
            'Get Recommendations'
          )}
        </button>
      </form>
    </div>
  );
};

export default DiagnosisForm;
