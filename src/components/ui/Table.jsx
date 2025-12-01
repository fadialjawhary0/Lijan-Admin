import React from 'react';
import ContainerHeader from './ContainerHeader';

const Table = ({ title, actions = [], columns = [], data = [], pagination = {} }) => {
  const { page = 1, pageCount = 1, onPageChange = () => {} } = pagination;

  const getPages = () => {
    const pages = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', pageCount - 1, pageCount);
      } else if (page >= pageCount - 2) {
        pages.push(1, 2, '...', pageCount - 3, pageCount - 2, pageCount - 1, pageCount);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', pageCount);
      }
    }
    return pages;
  };

  return (
    <div className="rounded-xl bg-white shadow pb-4">
      <ContainerHeader title={title} actions={actions} />
      <div className="relative">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => (
                    <th key={col.key || col.label} className="px-6 py-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                      {columns.map(col => (
                        <td key={col.key || col.label} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center mt-6">
          <nav className="inline-flex items-center space-x-1 text-sm select-none">
            <button className="px-2 py-1 text-gray-400 hover:text-primary disabled:opacity-50" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              &larr; Previous
            </button>
            {getPages().map((p, i) =>
              p === '...' ? (
                <span key={i} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  className={`px-2 py-1 rounded font-medium transition-colors duration-150 ${
                    p === page ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'
                  }`}
                  onClick={() => onPageChange(p)}
                  disabled={p === page}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="px-2 py-1 text-gray-400 hover:text-primary disabled:opacity-50"
              onClick={() => onPageChange(page + 1)}
              disabled={page === pageCount}
            >
              Next &rarr;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Table;
