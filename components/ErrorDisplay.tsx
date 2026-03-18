import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Globe, AlertTriangle, ChevronRight } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  const [type, ...messageParts] = error.split(': ');
  const message = messageParts.join(': ');

  const getErrorDetails = () => {
    switch (type) {
      case 'AUTHENTICATION_ERROR':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-red-400" />,
          title: 'Authentication Failed',
          action: 'Check API Key in Settings'
        };
      case 'QUOTA_EXCEEDED':
        return {
          icon: <RefreshCw className="w-5 h-5 text-amber-400 animate-spin-slow" />,
          title: 'Rate Limit Reached',
          action: 'Wait 60 seconds and retry'
        };
      case 'NETWORK_ERROR':
        return {
          icon: <Globe className="w-5 h-5 text-blue-400" />,
          title: 'Connectivity Issue',
          action: 'Check internet connection'
        };
      case 'SAFETY_BLOCK':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          title: 'Content Restricted',
          action: 'Review audio content'
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
          title: 'Analysis Error',
          action: 'Try a longer/clearer sample'
        };
    }
  };

  const details = getErrorDetails();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-5 bg-slate-900/80 border border-red-500/20 rounded-2xl shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-500/10 rounded-xl shrink-0">
          {details.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{details.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">{message || error}</p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-500/5 w-fit px-2 py-1 rounded-md border border-indigo-500/10">
            <ChevronRight className="w-3 h-3" />
            Next Step: {details.action}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
