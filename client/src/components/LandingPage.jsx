import React, { useState } from 'react';

export default function LandingPage({ onAnalysisComplete }) {
  const [jobRole, setJobRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Comprehensive list of targeted technical industry roles
  const targetRolesList = [
    "Computer Engineering Intern",
    "Computer Engineering Specialist",
    "Full-Stack Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist / AI Engineer",
    "Machine Learning Researcher",
    "DevOps & Infrastructure Specialist",
    "Cloud Solutions Architect",
    "Embedded Systems / IoT Engineer",
    "Robotics & Automation Engineer",
    "Cybersecurity Analyst",
    "Database Administrator",
    "Hardware / VLSI Engineer",
    "Network Operations Specialist",
    "Systems Analyst",
    "Product Manager (Tech)",
    "Other / Custom Role"
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a valid PDF resume file.');
      return;
    }

    // Determine the final role value to pass to the API pipeline
    let finalRole = jobRole;
    if (jobRole === "Other / Custom Role") {
      if (!customRole.trim()) {
        setErrorMessage('Please specify your custom target designation.');
        return;
      }
      finalRole = customRole.trim();
    }

    if (!finalRole) {
      setErrorMessage('Please select or specify a target job designation.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobRole', finalRole);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis engine pipeline failure.');
      }

      const result = await response.json();
      onAnalysisComplete(result);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'System error processing your upload file context.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', minHeight: 'calc(100vh - 70px)', color: '#f8fafc', padding: '60px 20px' }} className="d-flex align-items-center">
      
      {/* --- PREMIUM COMPONENT CORE STYLING PANELS --- */}
      <style>{`
        .glass-card-upload {
          background: rgba(30, 41, 59, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }
        .custom-input {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
          border-radius: 10px !important;
          padding: 12px 16px !important;
        }
        select.custom-input {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 16px center !important;
          background-size: 12px 12px !important;
          appearance: none !important;
        }
        .custom-input option {
          background-color: #0f172a !important;
          color: #ffffff !important;
        }
        .custom-input::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }
        .custom-input:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.3) !important;
        }
        .file-dropzone {
          border: 2px dashed rgba(129, 140, 248, 0.5);
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.4);
          transition: all 0.2s ease;
          padding: 30px;
          cursor: pointer;
          display: block;
        }
        .file-dropzone:hover {
          border-color: #a5b4fc;
          background: rgba(99, 102, 241, 0.08);
        }
        .glow-btn-submit {
          background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff !important;
          font-weight: 700;
          border: none;
          padding: 14px;
          border-radius: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .glow-btn-submit:hover:not(:disabled) {
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.6);
          transform: translateY(-1px);
        }
        .hero-image-wrap {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 36px rgba(0,0,0,0.4);
        }
        .high-contrast-label {
          color: #f1f5f9 !important; 
          font-weight: 600;
          font-size: 0.82rem;
          letter-spacing: 0.75px;
          display: inline-block;
        }
        .high-contrast-subtitle {
          color: #cbd5e1 !important;
          font-size: 1rem;
          line-height: 1.6;
        }
        .high-contrast-disclaimer {
          color: #94a3b8 !important;
          font-size: 0.78rem;
          margin-top: 4px;
        }
      `}</style>

      <div className="container" style={{ maxWidth: '1050px' }}>
        <div className="row align-items-center g-5">
          
          {/* 💻 LEFT PANEL: SUMMARY DATA STRINGS */}
          <div className="col-lg-5 text-center text-lg-start">
            <h1 className="fw-bold display-5 mb-3" style={{ lineHeight: '1.25', color: '#ffffff' }}>
              Bridge the Gap Between Your Profile and Your Dream Career.
            </h1>
            <p className="high-contrast-subtitle mb-4">
              Upload your technical profile details alongside your target metrics. Our real-time benchmarking system processes formatting compliance and text structures instantly to prepare your copy for core tracking platforms.
            </p>
            
            <div className="hero-image-wrap mb-4 d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80" 
                alt="Collaborative Technical Workspace Team" 
                style={{ width: '100%', height: '230px', objectFit: 'cover', opacity: 0.9 }}
              />
            </div>
          </div>

          {/* 📥 RIGHT PANEL: USER SUBMISSION GATEWAY WITH CONDITIONAL INPUT */}
          <div className="col-lg-7">
            <div className="glass-card-upload">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-30">
                <h4 className="fw-bold m-0" style={{ color: '#ffffff' }}>Document Verification</h4>
                <span className="badge px-2 py-1 small font-monospace" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#e0e7ff', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  ATS Core Active
                </span>
              </div>
              
              {errorMessage && (
                <div className="alert alert-danger border-0 text-white rounded-3 bg-danger bg-opacity-60 small mb-4 py-2 px-3">
                  <i className="bi bi-exclamation-octagon-fill me-2"></i>{errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-uppercase high-contrast-label">Target Designation Role</label>
                  <select 
                    className="form-select form-control custom-input" 
                    value={jobRole} 
                    onChange={(e) => {
                      setJobRole(e.target.value);
                      setErrorMessage('');
                    }} 
                    required
                  >
                    <option value="" disabled hidden>Choose your target role context...</option>
                    {targetRolesList.map((role, idx) => (
                      <option key={idx} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* 🌟 CONDITIONAL MANUAL OVERRIDE INPUT FIELD */}
                {jobRole === "Other / Custom Role" && (
                  <div className="mb-3 animate-fade-in">
                    <label className="form-label text-uppercase high-contrast-label text-indigo" style={{color:'#a5b4fc'}}>Specify Custom Designation Title</label>
                    <input 
                      type="text" 
                      className="form-control custom-input border-indigo" 
                      style={{borderColor:'rgba(129, 140, 248, 0.6)'}}
                      placeholder="e.g., Quantum Computing Software Developer" 
                      value={customRole} 
                      onChange={(e) => setCustomRole(e.target.value)} 
                      required 
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label text-uppercase high-contrast-label">Context Job Description (Optional)</label>
                  <textarea className="form-control custom-input" rows="3" placeholder="Paste framework keyword expectations or baseline requirements..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label text-uppercase high-contrast-label">Primary Document File</label>
                  <label className="w-100 text-center file-dropzone m-0">
                    <input type="file" accept=".pdf" className="d-none" onChange={handleFileChange} />
                    
                    {!file && (
                      <div className="mb-2">
                        <i className="bi bi-file-earmark-arrow-up display-5" style={{ color: '#818cf8' }}></i>
                      </div>
                    )}
                    
                    <h6 className="mt-2 mb-1 fw-bold" style={{ color: file ? '#10b981' : '#ffffff' }}>
                      {file ? `✓ ${file.name}` : "Select or Drop Resume PDF"}
                    </h6>
                    <p className="high-contrast-disclaimer">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports standard machine-readable binary documents only"}
                    </p>
                  </label>
                </div>

                <button type="submit" className="w-100 glow-btn-submit btn d-flex align-items-center justify-content-center" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing Metrics Vector Trees...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i> Launch Analysis Execution
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}