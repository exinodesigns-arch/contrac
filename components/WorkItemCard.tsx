
import React from 'react';
import { WorkItem, SubWork } from '../types';
import { EditIcon, TrashIcon, CheckCircleIcon } from './icons';
import { STATUS_COLORS } from '../constants';

interface WorkItemCardProps {
  item: WorkItem;
  onEdit: () => void;
  onDelete: () => void;
}

const SubWorkItem: React.FC<{subWork: SubWork}> = ({subWork}) => (
    <div className={`flex items-center gap-2 text-sm ${subWork.isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
        <CheckCircleIcon className={`w-4 h-4 ${subWork.isCompleted ? 'text-green-500' : 'text-gray-600'}`}/>
        <span>{subWork.name}</span>
    </div>
);

const WorkItemCard: React.FC<WorkItemCardProps> = ({ item, onEdit, onDelete }) => {
  const statusColor = STATUS_COLORS[item.status];

  return (
    <div className="bg-neutral rounded-lg border border-gray-700 shadow-md flex flex-col justify-between p-4 transition-all hover:shadow-lg hover:border-accent">
      <div>
        <div className="flex justify-between items-start">
            <div>
                <h4 className="text-lg font-bold text-white">{item.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{item.category}</p>
            </div>
          <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusColor}`}>
            {item.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-400">Quantity:</span>
            <span className="text-gray-200 font-mono">{item.quantity.toFixed(2)} {item.unitType}</span>
          </div>
          {item.color && item.color.trim() !== '' && item.color !== 'N/A' && (
             <div className="flex justify-between items-start pt-2">
                <span className="font-semibold text-gray-400 self-center">Color/Shade:</span>
                {item.color.startsWith('data:image/') ? (
                    <div className="text-right pl-2">
                        <img src={item.color} alt={item.colorFileName || 'Color preview'} className="w-12 h-12 object-cover rounded ml-auto border border-gray-600"/>
                        {item.colorFileName && <span className="text-xs text-gray-500 truncate block max-w-[120px]">{item.colorFileName}</span>}
                    </div>
                ) : (
                    <span className="text-gray-200 text-right pl-2">{item.color}</span>
                )}
            </div>
          )}
          {item.designPreference && (
            <div>
              <span className="font-semibold text-gray-400">Design:</span>
              <p className="text-gray-300 text-xs mt-1 bg-base-100 p-2 rounded">{item.designPreference}</p>
            </div>
          )}
          {item.subWorks.length > 0 && (
             <div className="pt-2">
                 <span className="font-semibold text-gray-400">Sub-works:</span>
                 <div className="mt-1 space-y-1">
                     {item.subWorks.map(sw => <SubWorkItem key={sw.id} subWork={sw}/>)}
                 </div>
             </div>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition"><EditIcon className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded-full transition"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default WorkItemCard;