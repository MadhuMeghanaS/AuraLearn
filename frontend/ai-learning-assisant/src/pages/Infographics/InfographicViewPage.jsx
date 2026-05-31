import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import {
  ArrowLeft,
  Loader2,
  BarChart2,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Trash2
} from 'lucide-react';

/* ─── Circular Gauge ───────────────────────────────────────── */
const CircleGauge = ({ value, label, description, color, index }) => {
  // Try to extract a numeric percentage to animate, otherwise just show value text
  const numericMatch = String(value).match(/(\d+(?:\.\d+)?)/);
  const pct = numericMatch ? Math.min(parseFloat(numericMatch[1]), 100) : null;
  const circumference = 2 * Math.PI * 36;
  const strokeDash = pct !== null ? (pct / 100) * circumference : circumference * 0.75;

  return (
    <div className="flex flex-col items-center space-y-3 group">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" strokeWidth="7" fill="none" className="stroke-zinc-100" />
          <circle
            cx="40" cy="40" r="36"
            strokeWidth="7"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - strokeDash}
            style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-zinc-800 leading-none text-center px-1">{value}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">{label}</p>
        {description && <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed max-w-[100px]">{description}</p>}
      </div>
    </div>
  );
};

/* ─── Timeline Step ────────────────────────────────────────── */
const TimelineStep = ({ step, title, description, isLast, color }) => (
  <div className="flex space-x-4">
    <div className="flex flex-col items-center">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md"
        style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}
      >
        {step}
      </div>
      {!isLast && <div className="w-px flex-grow mt-1" style={{ background: `${color}30` }} />}
    </div>
    <div className="pb-8 min-h-[60px]">
      <p className="text-sm font-bold text-zinc-800 leading-tight">{title}</p>
      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

/* ─── Concept Card ─────────────────────────────────────────── */
const ConceptCard = ({ term, definition, importance, palette }) => (
  <div className={`p-4 rounded-2xl border ${palette.border} ${palette.bgLight} space-y-2`}>
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${palette.dot}`} />
      <h4 className={`text-sm font-black ${palette.text}`}>{term}</h4>
    </div>
    <p className="text-xs text-zinc-600 leading-relaxed">{definition}</p>
    {importance && (
      <div className="flex items-start space-x-1.5 pt-1">
        <Lightbulb size={11} className={`${palette.text} mt-0.5 shrink-0`} />
        <p className={`text-[11px] font-semibold ${palette.text} leading-relaxed`}>{importance}</p>
      </div>
    )}
  </div>
);

/* ─── Section Header ───────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
  <div className="flex items-center space-x-3 mb-6">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: color }}>
      <Icon size={18} />
    </div>
    <div>
      <h2 className="text-lg font-black text-zinc-800">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>}
    </div>
  </div>
);

/* ─── Main View Page ───────────────────────────────────────── */
const COLORS = {
  pink:    '#ed7e99',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
};

const CONCEPT_PALETTES = [
  { border: 'border-[#ffd6e7]', bgLight: 'bg-[#ffeff2]', text: 'text-[#ed7e99]',   dot: 'bg-[#ed7e99]' },
  { border: 'border-violet-100', bgLight: 'bg-violet-50', text: 'text-violet-500',  dot: 'bg-violet-400' },
  { border: 'border-emerald-100', bgLight: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  { border: 'border-amber-100', bgLight: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400'  },
];

const InfographicViewPage = () => {
  const { infographicId } = useParams();
  const navigate = useNavigate();
  const [infographic, setInfographic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchInfographic = async () => {
      try {
        const res = await api.get(`/infographics/${infographicId}`);
        setInfographic(res.data.data);
      } catch (err) {
        console.error('Failed to fetch infographic:', err);
        navigate('/infographics');
      } finally {
        setLoading(false);
      }
    };
    fetchInfographic();
  }, [infographicId, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this infographic?')) return;
    setDeleting(true);
    try {
      await api.delete(`/infographics/${infographicId}`);
      navigate('/infographics');
    } catch (err) {
      console.error('Failed to delete:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10 mb-4" />
        <p className="text-zinc-400 font-semibold text-sm">Loading Visual Infographic...</p>
      </div>
    );
  }

  if (!infographic) return null;

  const metricColors = [COLORS.pink, COLORS.violet, COLORS.emerald, COLORS.amber, COLORS.pink];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <Link to="/infographics" className="flex items-center hover:text-[#ed7e99] transition-colors">
            <ArrowLeft size={14} className="mr-2" /> All Infographics
          </Link>
          <ChevronRight size={12} />
          <span className="text-zinc-500 truncate max-w-[200px]">{infographic.title}</span>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          <span>Delete</span>
        </button>
      </div>

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden card-standard p-8 bg-gradient-to-br from-[#fffbf9] to-[#fff0f4]">
        {/* Decorative glows */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-[#ed7e99]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-start space-x-5">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#ed7e99] to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-[#ed7e99]/30 shrink-0">
            <BarChart2 className="text-white" size={24} />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-black text-[#ed7e99] uppercase tracking-widest bg-[#ffeff2] px-2.5 py-1 rounded-full">AI Infographic</span>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-800 leading-tight">{infographic.title}</h1>
            {infographic.subtitle && (
              <p className="text-zinc-500 font-medium mt-1 text-sm">{infographic.subtitle}</p>
            )}
            {infographic.summary && (
              <p className="text-zinc-500 text-sm leading-relaxed mt-4 max-w-3xl">{infographic.summary}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics Section ─────────────────────────────────── */}
      {infographic.metrics && infographic.metrics.length > 0 && (
        <div className="card-standard p-8">
          <SectionHeader
            icon={BarChart2}
            title="Key Metrics & Statistics"
            subtitle="Core numbers extracted from the document"
            color={COLORS.pink}
          />
          <div className="flex flex-wrap gap-8 justify-center md:justify-start">
            {infographic.metrics.map((metric, i) => (
              <CircleGauge
                key={i}
                value={metric.value}
                label={metric.label}
                description={metric.description}
                color={metricColors[i % metricColors.length]}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Concepts Grid ────────────────────────────────────── */}
      {infographic.concepts && infographic.concepts.length > 0 && (
        <div className="card-standard p-8">
          <SectionHeader
            icon={BookOpen}
            title="Core Concepts"
            subtitle="Key terms and ideas from the material"
            color={COLORS.violet}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {infographic.concepts.map((concept, i) => (
              <ConceptCard
                key={i}
                term={concept.term}
                definition={concept.definition}
                importance={concept.importance}
                palette={CONCEPT_PALETTES[i % CONCEPT_PALETTES.length]}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline ─────────────────────────────────────────── */}
      {infographic.timeline && infographic.timeline.length > 0 && (
        <div className="card-standard p-8">
          <SectionHeader
            icon={CheckCircle2}
            title="Process Timeline"
            subtitle="Step-by-step learning sequence"
            color={COLORS.emerald}
          />
          <div className="max-w-2xl">
            {infographic.timeline.map((item, i) => (
              <TimelineStep
                key={i}
                step={item.step || `${i + 1}`}
                title={item.title}
                description={item.description}
                isLast={i === infographic.timeline.length - 1}
                color={metricColors[i % metricColors.length]}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Takeaway Block ───────────────────────────────────── */}
      {infographic.takeaway && (
        <div className="relative overflow-hidden card-standard p-8 bg-gradient-to-br from-[#fffbf9] via-white to-violet-50">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start space-x-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
              <Sparkles size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Key Takeaway</p>
              <blockquote className="text-zinc-700 font-semibold text-base leading-relaxed border-l-4 border-amber-300 pl-4">
                {infographic.takeaway}
              </blockquote>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <Link
          to="/infographics"
          className="flex items-center space-x-2 text-sm font-bold text-zinc-400 hover:text-[#ed7e99] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to All Infographics</span>
        </Link>
        <Link
          to="/documents"
          className="flex items-center space-x-2 text-sm font-bold text-[#ed7e99] hover:text-[#eb6d8a] transition-colors"
        >
          <Sparkles size={14} />
          <span>Generate Another</span>
        </Link>
      </div>
    </div>
  );
};

export default InfographicViewPage;
