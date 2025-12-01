import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="flex items-center text-red-500 text-xs mt-1 gap-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
    </svg>
    <span>{message}</span>
  </div>
);

export default ErrorMessage;
