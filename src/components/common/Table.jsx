import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import Input from './Input';
import EmptyState from './EmptyState';
import Loader from './Loader';

const Table = ({ 
  columns = [], 
  data = [], 
  loading = false, 
  searchPlaceholder = 'Search records...',
  searchKey,
  onRowClick,
  pageSize = 5
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting handler
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Process data (Filter -> Sort -> Paginate)
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search filter
    if (searchQuery && searchKey) {
      result = result.filter(row => {
        const val = row[searchKey];
        return String(val || '').toLowerCase().includes(searchQuery.toLowerCase());
      });
    } else if (searchQuery) {
      // Generic search across all values if searchKey not specified
      result = result.filter(row => {
        return Object.values(row).some(val => 
          String(val || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // 2. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchKey, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Adjust page if data filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Table search filter bar */}
      {searchKey && (
        <div className="flex justify-between items-center gap-4.5">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            className="max-w-xs bg-white dark:bg-slate-800"
            containerClassName="max-w-xs"
          />
        </div>
      )}

      {/* Main Table Grid */}
      <div className="relative overflow-x-auto rounded-2xl border border-slate-200/40 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md shadow-premium">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 z-10 flex items-center justify-center">
            <Loader message="Fetching grid rows..." />
          </div>
        )}

        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200/40 dark:border-slate-800/40">
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 font-sans tracking-wide uppercase text-xs ${col.sortable !== false ? 'cursor-pointer select-none' : ''} ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortConfig?.key === col.key ? (
                      sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={`px-6 py-4.5 text-slate-700 dark:text-slate-200 font-sans ${col.className || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {!loading && (
                    <div className="p-8">
                      <EmptyState 
                        title="Empty Database Grid"
                        description="No records matched this configuration or query list."
                      />
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2.5">
          <span className="text-xs text-slate-400 font-sans font-medium">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200/45 dark:border-slate-800/45 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/40 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-sans">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200/45 dark:border-slate-800/45 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/40 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
