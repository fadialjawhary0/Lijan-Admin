import React from 'react';
import { AlertCircle } from 'lucide-react';

const NoData = ({ message = 'No data available', className = '' }) => {
  return (
    <div className={`flex flex-col h-full items-center justify-center text-center bg-gray-100/90 rounded-lg ${className}`}>
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-500 mb-2">No Data Found</h3>
      <p className="text-red-500 font-bold text-lg">{message}</p>
    </div>
  );
};

export default NoData;
