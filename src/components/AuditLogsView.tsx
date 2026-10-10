import React, { useState } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actionTypes = [
    'ALL',
    'LICENSE_CREATED',
    'LICENSE_ACTIVATION',
    'LICENSE_SUSPEND',
    'LICENSE_REVOKE',
    'RELEASE_PUBLISHED',
    'MAINTENANCE_UPDATED',
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">সিকিউরিটি ও অডিট ট্রেইল (Audit Logs)</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            অপরিবর্তনশীল অডিট ট্র্যাকিং · প্রতিটি প্রশাসনিক ক্রিয়াকলাপের ক্রিপ্টোগ্রাফিক রেকর্ড · আইপি অ্যাড্রেস লগ
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="অ্যাকশন, অ্যাক্টর বা আইডি খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {actionTypes.map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                actionFilter === act
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">টাইমস্ট্যাম্প</th>
                <th className="py-3 px-4 font-medium">অ্যাকশন</th>
                <th className="py-3 px-4 font-medium">অ্যাক্টর (Admin)</th>
                <th className="py-3 px-4 font-medium">টার্গেট এন্টিটি</th>
                <th className="py-3 px-4 font-medium">আইপি অ্যাড্রেস</th>
                <th className="py-3 px-4 font-medium">বিস্তারিত ডেটা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 tabular-nums">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-cyan-300">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {log.actor_name}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="text-slate-400">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="text-cyan-400 ml-1.5 font-bold">[{log.entity_id}]</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
