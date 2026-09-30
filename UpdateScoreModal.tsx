import React, { useState } from 'react';
import { creditService } from '../services/api';
import { X, Award, CheckCircle } from 'lucide-react';

interface UpdateScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  onScoreUpdated: () => void;
}

export const UpdateScoreModal: React.FC<UpdateScoreModalProps> = ({
  isOpen,
  onClose,
  currentScore,
  onScoreUpdated,
}) => {
  const [newScore, setNewScore] = useState<number>(currentScore);
  const [note, setNote] = useState<string>('Periodic bureau refresh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newScore < 300 || newScore > 900) {
      setError('CIBIL credit score must be between 300 and 900.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await creditService.addScore({
        credit_score: Number(newScore),
        note: note.trim() || 'Score update',
      });
      onScoreUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update credit score.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Log Updated Credit Score</h3>
            <p className="text-xs text-slate-400">Record latest CIBIL bureau pull or statement</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              New CIBIL / Credit Score (300 – 900)
            </label>
            <div className="relative">
              <input
                type="number"
                min="300"
                max="900"
                value={newScore}
                onChange={(e) => setNewScore(parseInt(e.target.value, 10) || 300)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-lg font-mono font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3.5 top-3 text-xs text-slate-400">
                Current: {currentScore}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Update Reason / Bureau Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid off card balance / Limit increase"
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Improvement Delta:</span>
              <span
                className={`font-bold font-mono ${
                  newScore >= currentScore ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {newScore - currentScore >= 0
                  ? `+${newScore - currentScore} pts`
                  : `${newScore - currentScore} pts`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bureau Tier:</span>
              <span className="font-semibold text-white">
                {newScore >= 750
                  ? 'Excellent (Prime)'
                  : newScore >= 700
                  ? 'Good'
                  : newScore >= 650
                  ? 'Fair'
                  : 'Needs Attention'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save & Recalculate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
