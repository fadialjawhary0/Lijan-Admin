import React from 'react';

const ContainerHeader = ({ title, actions = [], centeredTitle = false }) => (
  <div className={` ${centeredTitle ? 'text-center' : 'flex'} items-center justify-between px-4 py-2 border-b border-gray-300 rounded-t-xl bg-primary `}>
    <h3 className={`text-md font-semibold text-gray-50 `}>{title}</h3>
    <div className="flex gap-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          type={action.type || 'button'}
          className={`px-4 py-1 rounded text-gray-700 cursor-pointer ${
            action.className || 'bg-gray-50 font-medium hover:text-primary transition-all duration-300 '
          }`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

export default ContainerHeader;
