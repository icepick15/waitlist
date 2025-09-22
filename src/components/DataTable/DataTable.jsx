import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ data, globalFilter, setGlobalFilter, onEdit }) => {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  // Define columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 checkbox-custom"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 checkbox-custom"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'postcode',
        header: 'Postcode',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'vendorType',
        header: 'Vendor Type',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'serviceOffering',
        header: 'Service Offering',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'signupDate',
        header: 'Signup Date',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          if (status === '-') {
            return <span className="text-gray-500">-</span>;
          }
          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                status === 'Onboarded'
                  ? 'bg-green-100 text-green-800'
                  : status === 'Rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => onEdit && onEdit(row.original)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1 btn-hover"
            title="Edit"
          >
            <Edit size={16} />
          </button>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* Table - takes most available space */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      {header.column.getCanSort() && (
                        <span className="flex flex-col">
                          <ChevronUp
                            size={12}
                            className={
                              header.column.getIsSorted() === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }
                          />
                          <ChevronDown
                            size={12}
                            className={
                              header.column.getIsSorted() === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-x border-b border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const pageIndex = table.getState().pagination.pageIndex;
              const pageNumber = i + Math.max(0, pageIndex - 2);
              
              if (pageNumber >= table.getPageCount()) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => table.setPageIndex(pageNumber)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    pageIndex === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber + 1}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;