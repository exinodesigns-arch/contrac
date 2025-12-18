
import React, { useMemo } from 'react';
import { WorkItem, WorkStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface ProgressSummaryProps {
  workItems: WorkItem[];
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ workItems }) => {
  const summary = useMemo(() => {
    return workItems.reduce(
      (acc, item) => {
        acc[item.status]++;
        return acc;
      },
      { [WorkStatus.PENDING]: 0, [WorkStatus.IN_PROGRESS]: 0, [WorkStatus.COMPLETED]: 0 }
    );
  }, [workItems]);

  const totalItems = workItems.length;
  if (totalItems === 0) {
    return (
        <div className="bg-base-100 rounded-lg shadow-lg p-4 text-center">
            <p className="text-gray-400">No work items to summarize.</p>
        </div>
    );
  }

  const completionPercentage = totalItems > 0 ? (summary[WorkStatus.COMPLETED] / totalItems) * 100 : 0;

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Project Progress</h3>
      <div className="space-y-4">
        <div className="flex justify-around items-center gap-4">
          {(Object.keys(summary) as WorkStatus[]).map(status => (
             <div key={status} className="text-center">
                <p className={`text-3xl font-bold ${STATUS_COLORS[status].replace('bg-', 'text-')}`}>{summary[status]}</p>
                <p className="text-sm text-gray-400">{status}</p>
             </div>
          ))}
          <div className="text-center">
             <p className="text-3xl font-bold text-white">{totalItems}</p>
             <p className="text-sm text-gray-400">Total Items</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-gray-300">Completion</span>
            <span className="text-sm font-medium text-gray-300">{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-neutral rounded-full h-2.5">
            <div className="bg-success h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
