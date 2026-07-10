import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, RadialLinearScale, BarElement, PointElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Radar, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, RadialLinearScale, BarElement, PointElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend);

const doughnutOptions = { plugins: { legend: { display: false } } };

const radarOptions = {
  plugins: { legend: { labels: { color: '#cbd5e1', boxWidth: 20 } } },
  scales: {
    r: {
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
      pointLabels: { color: '#94a3b8', font: { size: 11 } },
      ticks: { display: false }
    }
  }
};

const barOptions = {
  plugins: { legend: { labels: { color: '#cbd5e1', boxWidth: 20 } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
  }
};

const pieOptions = {
  plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', boxWidth: 15, padding: 15 } } }
};

export default function Dashboard({ data, goBack }) {
  const [activeSection, setActiveSection] = useState(null);
  
  const generatePdfReport = async (type) => {
    const endpoint = type === 'audit' ? '/api/generate-audit' : '/api/generate-optimized';
    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData: data })
      });
      if (!response.ok) throw new Error("Network failure.");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', type === 'audit' ? 'RESUMEX_Audit.pdf' : 'RESUMEX_Optimized.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
    }
  };

  const getSectionFixAdvice = (section, status) => {
    const lowered = status.toLowerCase();
    if (lowered.includes("missing")) {
      return `❌ Critical Error: The scanner completely missed your "${section}" section header or content. Ensure you have clear, bold text reading exactly "${section.toUpperCase()}" with no stylistic icons embedded inside the text string.`;
    }
    if (lowered.includes("improvement") || lowered.includes("warning")) {
      return `⚠ Warning Action Required: Your "${section}" section layout structure is parsing incompletely. Avoid multi-column text tables or nested blocks here. Convert this area into simple, single-column bullet points.`;
    }
    return `✅ Structural Compliance Passed: Your "${section}" framework layout matches parsing standards perfectly.`;
  };

  const doughnutData = {
    labels: ['ATS Match', 'Gap'],
    datasets: [{
      data: [data?.atsScore || 0, 100 - (data?.atsScore || 0)],
      backgroundColor: ['#6366f1', 'rgba(255,255,255,0.1)'],
      borderWidth: 0,
    }]
  };

  const radarData = {
    labels: ['Job Match', 'Readiness', 'Keywords', 'ATS Alignment'],
    datasets: [{
      label: 'Performance Overview',
      data: [data?.jobMatchPercentage || 45, data?.roleReadinessScore || 50, data?.keywordMatchPercentage || 40, data?.atsScore || 55],
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#818cf8',
      pointBackgroundColor: '#818cf8',
      borderWidth: 2,
    }]
  };

  const barData = {
    labels: ['Keyword Match', 'Role Alignment'],
    datasets: [{
      label: 'Comparison',
      data: [data?.keywordMatchPercentage || 30, data?.jobMatchPercentage || 40],
      backgroundColor: ['#06b6d4', '#4f46e5'],
      borderRadius: 8,
      barThickness: 50
    }]
  };

  const pieData = {
    labels: ['Matched', 'Missing'],
    datasets: [{
      data: [data?.matchedKeywords?.length || 5, data?.missingKeywords?.length || 5],
      backgroundColor: ['#10b981', '#f43f5e'],
      borderWidth: 0
    }]
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', minHeight: '100vh', color: '#f8fafc', padding: '30px' }}>
      
      <style>{`
        .glass-panel {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
        }
        .panel-main-title { color: #ffffff !important; font-weight: 700; }
        .panel-label-text { color: #ffffff !important; font-weight: 700; font-size: 1.2rem; }
        
        /* 🔧 FORCED WHITE TEXT LABELS FOR THE CARD HEADERS */
        .card-header-label { color: #cbd5e1 !important; font-weight: 700; letter-spacing: 0.8px; }
        
        .panel-sub-text { color: #94a3b8 !important; font-size: 0.88rem; margin-bottom: 20px; }
        .panel-body-text { color: #cbd5e1 !important; }
        .panel-list-item { color: #e2e8f0 !important; margin-bottom: 8px; }
        .custom-recruiter-box { color: #e2e8f0; background-color: rgba(0, 0, 0, 0.4); }
        .custom-rewrite-container { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); }
        .custom-score-badge { border: 1px solid rgba(255, 255, 255, 0.1); background-color: #000000; color: #ffffff; }
        .rewrite-original-text { color: #94a3b8 !important; font-size: 0.9rem; font-style: italic; }
        .rewrite-upgraded-text { color: #34d399 !important; font-size: 0.92rem; font-weight: 600; }
        
        .clickable-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .clickable-card:hover { transform: scale(1.03); box-shadow: 0 4px 15px rgba(255,255,255,0.1); }
        .advice-box { background: rgba(15, 23, 42, 0.85); border-left: 4px solid #6366f1; border-radius: 8px; font-size: 0.92rem; }
        .keyword-badge { display: inline-block; padding: 6px 12px; margin: 4px; border-radius: 20px; font-weight: 600; font-size: 0.82rem; }
        .badge-match { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; }
        .badge-missing { background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f87171; }
      `}</style>

      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h3 className="panel-main-title m-0">RESUMEX <span className="fs-6 text-primary">ANALYTICS ENGINE</span></h3>
          <p className="panel-body-text m-0">Enterprise AI Talent Benchmarking Dashboard</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={goBack} className="btn btn-outline-light px-3 fw-bold">New Analysis</button>
          <button onClick={() => generatePdfReport('audit')} className="btn btn-danger px-3">Visual Audit PDF</button>
          <button onClick={() => generatePdfReport('optimized')} className="btn btn-primary px-4">Better Version PDF</button>
        </div>
      </div>

      {/* --- BOX SCORES GRID --- */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="glass-panel text-center">
            <h6 className="text-uppercase small card-header-label">Overall Metric Matrix</h6>
            <div style={{ maxWidth: '110px', margin: '15px auto' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <h4 className="fw-bold text-white">{data?.atsScore || 0} / 100</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-panel text-center h-100 d-flex flex-column justify-content-center">
            <h6 className="text-uppercase small card-header-label">Strength Tier Placement</h6>
            <h3 className="fw-bold text-success my-3">{data?.resumeStrengthLevel || 'Competitive'}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-panel text-center h-100 d-flex flex-column justify-content-center">
            <h6 className="text-uppercase small card-header-label">Role Readiness Index</h6>
            <h3 className="display-6 fw-bold text-info my-2">{data?.roleReadinessScore || 0}%</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-panel text-center h-100 d-flex flex-column justify-content-center">
            <h6 className="text-uppercase small card-header-label">Recruiter Verdict Profile</h6>
            <p className="fst-italic border p-3 rounded custom-recruiter-box mb-0 mt-2">
              {data?.finalVerdict || 'Highly Acceptable layout structures.'}
            </p>
          </div>
        </div>
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-panel h-100">
            <h5 className="panel-label-text m-0">Performance Mapping</h5>
            <p className="panel-sub-text">A quick visual summary of alignment, readiness, keyword fit, and ATS quality.</p>
            <div style={{ padding: '10px' }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel h-100">
            <h5 className="panel-label-text m-0">Profile Coverage</h5>
            <p className="panel-sub-text">Comparison between keyword relevance and role alignment.</p>
            <div style={{ padding: '10px' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel h-100">
            <h5 className="panel-label-text m-0">Keyword Distribution</h5>
            <p className="panel-sub-text">Ratio of matched versus missing target terms.</p>
            <div style={{ padding: '10px' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* --- PROBLEM 2: LIVE KEYWORD FINDER CHECKLIST --- */}
      <div className="glass-panel mb-5">
        <h5 className="fw-bold mb-3 panel-main-title">🎯 Problem Solver: Target Keyword Implementation Pipeline</h5>
        <p className="text-muted small mb-3">Direct target vocabulary scanned from structural market profiles. Copy missing parameters inside your text markup to increase optimization scaling indices.</p>
        <div className="row g-3">
          <div className="col-md-6 border-end border-secondary border-opacity-25">
            <h6 className="text-success fw-bold small text-uppercase mb-2">✅ Matched Core Proficiencies</h6>
            <div className="d-flex flex-wrap">
              {data?.matchedKeywords && data.matchedKeywords.length > 0 ? (
                data.matchedKeywords.map((kw, i) => <span key={i} className="keyword-badge badge-match">{kw}</span>)
              ) : (
                <span className="text-muted small px-2">No matched items identified yet.</span>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <h6 className="text-danger fw-bold small text-uppercase mb-2">❌ Missing Targeted Terminology (Inject These)</h6>
            <div className="d-flex flex-wrap">
              {data?.missingKeywords && data.missingKeywords.length > 0 ? (
                data.missingKeywords.map((kw, i) => <span key={i} className="keyword-badge badge-missing">+ {kw}</span>)
              ) : (
                <span className="text-success small px-2">Perfect match configuration! No structural gaps found.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- PROBLEM 1: HEATMAP TRACKER WITH ACTIONABLE DRILL-DOWN --- */}
      <div className="glass-panel mb-5">
        <h5 className="fw-bold mb-2 panel-main-title">📊 Structural Compliance Heatmap Tracker</h5>
        <p className="text-muted small mb-4">💡 *Click on any module tile block below to view instant automated parsing repair strategies.*</p>
        
        <div className="row g-3 text-center mb-4">
          {data?.sectionsCheck && Object.entries(data.sectionsCheck).map(([section, sectionData], idx) => {
            const status = sectionData?.status || sectionData || "Missing";
            const score = sectionData?.score ?? null;
            const maxPoints = sectionData?.maxPoints ?? null;

            let heatmapStyle = { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' };
            if (status.toLowerCase().includes("improvement") || status.toLowerCase().includes("warning")) {
              heatmapStyle = { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' };
            } else if (status.toLowerCase().includes("missing")) {
              heatmapStyle = { background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#f87171' };
            }

            return (
              <div key={idx} className="col-md-3">
                <div onClick={() => setActiveSection({ name: section, status: status })} className="p-3 rounded h-100 d-flex flex-column justify-content-between clickable-card" style={heatmapStyle}>
                  <div>
                    <strong className="text-capitalize" style={{ fontSize: '1.05rem' }}>{section}</strong>
                    <div className="small opacity-75 mt-1 fw-semibold">{status}</div>
                  </div>
                  {score !== null && (
                    <div className="mt-3"><span className="badge custom-score-badge">{score} / {maxPoints} pts</span></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {activeSection && (
          <div className="p-3 advice-box">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-white text-uppercase" style={{fontSize: '0.85rem'}}>🔧 Repair Guideline Panel — {activeSection.name}</strong>
              <button onClick={() => setActiveSection(null)} className="btn btn-sm text-white p-0 px-1 opacity-70" style={{background:'none', border:'none'}}>✕ Close</button>
            </div>
            <p className="mb-0 text-white-50">{getSectionFixAdvice(activeSection.name, activeSection.status)}</p>
          </div>
        )}
      </div>

      {/* --- STRENGTHS & REWRITES --- */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="glass-panel h-100">
            <h5 className="fw-bold mb-3 text-success">Strategic Performance Strengths</h5>
            <ul className="ps-3">
              {data?.strengths?.map((s, i) => <li key={i} className="panel-list-item">{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="glass-panel h-100">
            <h5 className="fw-bold mb-3 text-info">AI Production-Ready Copy Rewrite Models</h5>
            <div className="p-3 rounded custom-rewrite-container">
              {data?.resumeRewriteSuggestions?.map((item, index) => (
                <div key={index} className="mb-3 pb-2 border-bottom border-secondary border-opacity-20">
                  <div className="rewrite-original-text mb-1">Original: "{item.original}"</div>
                  <div className="rewrite-upgraded-text">Upgraded: "{item.improved}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}