import React from 'react';

const AdminTable = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="table-admin">{children}</table>
    </div>
  );
};

export default AdminTable;
