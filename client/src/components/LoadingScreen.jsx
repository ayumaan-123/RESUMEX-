import React from 'react';

export default function LoadingScreen({ statusText }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center my-5 py-5">
      <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }} role="status"></div>
      <h4 className="fw-bold animate-pulse">{statusText}</h4>
      <p className="text-muted">Our AI analytical models are compiling real-time industry feedback metrics.</p>
    </div>
  );
}