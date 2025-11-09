import React from 'react';

interface ErrorAlertProps {
  title: string;
  message: string;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, message, onDismiss }) => {
  return (
    <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm">{message}</p>
          <button onClick={onDismiss} className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-900">
            Dispensar
          </button>
        </div>
      </div>
    </div>
  );
};
