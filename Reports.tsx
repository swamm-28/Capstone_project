import React, { useState, useEffect } from 'react';
import { reportService, formatINR } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Award,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await reportService.getReports();
      setReports(res.data);
      if (res.data && res.data.length > 0 && !selectedReport) {
        loadReportDetail(res.data[0].id);
      }
    } catch (err: any) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetail = async (id: number) => {
    try {
      const res = await reportService.getReportDetail(id);
      setSelectedReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    try {
      const nowStr = new Date().toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
        day: 'numeric',
      });
      const res = await reportService.generateReport({
        report_name: `Comprehensive Financial Health Audit — ${nowStr}`,
      });
      setSelectedReport(res.data);
      await fetchReports();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to generate report. Make sure profile is initialized.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = (id: number) => {
    const url = reportService.getPdfUrl(id);
    const win = window.open(url, '_blank');
    if (!win) {
      window.location.href = url;
    }
  };

  if (loading) return <LoadingSpinner message="Loading Financial Reports..." />;

  const d = selectedReport?.data;
  const ai = d?.ai_advice;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white">Financial Health Reports</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade PDF reports compiling your CIBIL profile, utilization analysis, and AI improvement plan.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{generating ? 'Compiling Report...' : 'Generate Financial Health Report'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Main Grid: Left reports list, Right selected report preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Previous Reports */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Generated Audits ({reports.length})
          </h3>

          {reports.length === 0 ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No reports generated yet.</p>
              <button
                onClick={handleGenerateReport}
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                Generate your first report
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => loadReportDetail(r.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/40 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4
                          className={`text-xs font-bold ${
                            isSelected ? 'text-blue-300' : 'text-white'
                          }`}
                        >
                          {r.report_name}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(r.generated_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(r.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Report Preview & PDF Download */}
        <div className="lg:col-span-2">
          {selectedReport && d ? (
            <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
              {/* Report Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Audit Snapshot Preview
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    {selectedReport.report_name}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Client: {d.user_name} • {new Date(selectedReport.generated_at).toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadPdf(selectedReport.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
              </div>

              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">CIBIL Score</span>
                  <p className="text-2xl font-extrabold text-blue-400 font-mono mt-0.5">
                    {d.current_credit_score}
                  </p>
                  <span className="text-[10px] text-slate-400">Delta: {d.score_delta}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Health Index</span>
                  <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                    {d.financial_health_score}/100
                  </p>
                  <span className="text-[10px] text-slate-400">{d.health_status}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Utilization</span>
                  <p className="text-2xl font-extrabold text-white font-mono mt-0.5">
                    {d.credit_utilization}%
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {d.credit_utilization <= 30 ? 'Optimal' : 'Elevated'}
                  </span>
                </div>
              </div>

              {/* Financial Metrics Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recorded Financial Parameters
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Reported Value</th>
                        <th className="p-2.5">Benchmark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-2.5 text-slate-300">Monthly Gross Income</td>
                        <td className="p-2.5 font-bold font-mono text-white">
                          {formatINR(d.monthly_income)}
                        </td>
                        <td className="p-2.5 text-slate-400">Baseline</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-300">Monthly Expenses / EMIs</td>
                        <td className="p-2.5 font-bold font-mono text-white">
                          {formatINR(d.monthly_expenses)}
                        </td>
                        <td className="p-2.5 text-slate-400">&le; 50% income</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-300">Total Outstanding Debt</td>
                        <td className="p-2.5 font-bold font-mono text-white">
                          {formatINR(d.total_debt)}
                        </td>
                        <td className="p-2.5 text-slate-400">Active Debt</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-300">Credit Facility Limit</td>
                        <td className="p-2.5 font-bold font-mono text-white">
                          {formatINR(d.credit_limit)}
                        </td>
                        <td className="p-2.5 text-slate-400">Total Cards</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-300">Debt-to-Income (DTI)</td>
                        <td className="p-2.5 font-bold font-mono text-white">{d.dti_ratio}%</td>
                        <td className="p-2.5 text-slate-400">&le; 35% Ideal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-300">Active Loan Facilities</td>
                        <td className="p-2.5 font-bold font-mono text-white">{d.active_loans}</td>
                        <td className="p-2.5 text-slate-400">Accounts</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-300">Missed Payments (24m)</td>
                        <td className="p-2.5 font-bold font-mono text-white">{d.missed_payments}</td>
                        <td className="p-2.5 text-slate-400">0 Defaults</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Recommendations Summary */}
              {ai && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Consultation Summary</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{ai.summary}</p>
                </div>
              )}

              {/* 5-Step Roadmap Preview */}
              {ai?.five_step_plan && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    5-Step Roadmap Snapshot
                  </h4>
                  <div className="space-y-2">
                    {ai.five_step_plan.slice(0, 3).map((st: any) => (
                      <div
                        key={st.step}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-white">
                            Step {st.step}: {st.title}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{st.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-3">
                          {st.timeline}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-[11px] text-slate-400 italic">
                DISCLAIMER: This report is for educational and informational purposes only and does
                not constitute financial, credit, lending, or investment advice.
              </div>
            </div>
          ) : (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Report Selected</h3>
              <p className="text-xs text-slate-400">
                Generate or choose a report from the list to preview details and download the PDF.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
