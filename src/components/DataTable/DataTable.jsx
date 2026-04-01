import React, { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Mail,
  MapPin,
  Phone,
  SquarePen,
} from 'lucide-react';

const getStatusClassName = (status) => {
  if (status === 'Onboarded') {
    return 'status-pill status-pill--success';
  }

  if (status === 'Rejected') {
    return 'status-pill status-pill--danger';
  }

  return 'status-pill status-pill--neutral';
};

const globalTextFilter = (row, _columnId, filterValue) => {
  const searchableText = [
    row.original.companyName,
    row.original.contactName,
    row.original.email,
    row.original.phoneNumber,
    row.original.postcode,
    row.original.vendorType,
    row.original.serviceOffering,
    row.original.location,
    ...(row.original.serviceOfferings || []),
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(String(filterValue ?? '').toLowerCase());
};

const DataTable = ({ data, globalFilter, onEdit }) => {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="checkbox-custom"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="checkbox-custom"
            aria-label={`Select ${row.original.companyName}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 48,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span>{row.original.email}</span>,
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        cell: ({ row }) => (
          <div className="table-stack-cell">
            <span>{row.original.phoneNumber}</span>
            <small>{row.original.contactName}</small>
          </div>
        ),
      },
      {
        accessorKey: 'postcode',
        header: 'Postcode',
      },
      {
        accessorKey: 'vendorType',
        header: 'Vendor Type',
      },
      {
        accessorKey: 'serviceOffering',
        header: 'Service Offering',
        cell: ({ row }) => (
          <div className="table-stack-cell">
            <span>{row.original.serviceOffering}</span>
            <small>{row.original.serviceOfferings.length} services attached</small>
          </div>
        ),
      },
      {
        accessorKey: 'signupDate',
        header: 'Signup Date',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={getStatusClassName(row.original.status)}>
            {row.original.invitationState}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => onEdit(row.original)}
            className="table-action-button"
            title="Open record"
            aria-label={`Open ${row.original.companyName}`}
          >
            <SquarePen size={16} />
          </button>
        ),
        enableSorting: false,
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalTextFilter,
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  const pageRows = table.getRowModel().rows;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const pageStart = totalRows === 0 ? 0 : pageIndex * table.getState().pagination.pageSize + 1;
  const pageEnd = Math.min(
    (pageIndex + 1) * table.getState().pagination.pageSize,
    totalRows
  );

  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index).slice(
    Math.max(0, pageIndex - 2),
    Math.max(0, pageIndex - 2) + 5
  );

  return (
    <div className="waitlist-table-shell">
      <div className="waitlist-table-toolbar">
        <div>
          <strong>{totalRows}</strong>
          <span>results in view</span>
        </div>
        <div>
          <strong>{selectedRows}</strong>
          <span>selected on this filtered set</span>
        </div>
      </div>

      <div className="waitlist-table-desktop">
        <div className="table-container">
          <table className="waitlist-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      className={header.column.getCanSort() ? 'is-sortable' : ''}
                    >
                      <div className="table-header-label">
                        <span>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="table-sort-icons">
                            <ChevronUp
                              size={12}
                              className={header.column.getIsSorted() === 'asc' ? 'is-active' : ''}
                            />
                            <ChevronDown
                              size={12}
                              className={header.column.getIsSorted() === 'desc' ? 'is-active' : ''}
                            />
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="empty-state">
                      <strong>No matches found</strong>
                      <p>Adjust the filters or search terms to widen the queue.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="waitlist-mobile-list">
        {pageRows.length > 0 ? (
          pageRows.map((row) => {
            const user = row.original;
            return (
              <article key={row.id} className="mobile-record-card">
                <div className="mobile-record-card__top">
                  <label className="mobile-record-card__selector">
                    <input
                      type="checkbox"
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      className="checkbox-custom"
                    />
                    <span>{user.companyName}</span>
                  </label>
                  <span className={getStatusClassName(user.status)}>{user.invitationState}</span>
                </div>

                <div className="mobile-record-card__body">
                  <div className="mobile-record-card__row">
                    <Mail size={15} />
                    <span>{user.email}</span>
                  </div>
                  <div className="mobile-record-card__row">
                    <Phone size={15} />
                    <span>{user.phoneNumber}</span>
                  </div>
                  <div className="mobile-record-card__row">
                    <MapPin size={15} />
                    <span>
                      {user.postcode} - {user.location}
                    </span>
                  </div>
                </div>

                <div className="mobile-record-card__meta">
                  <span>{user.vendorType}</span>
                  <span>{user.serviceOffering}</span>
                  <span>{user.signupDate}</span>
                </div>

                <button className="mobile-record-card__action" onClick={() => onEdit(user)}>
                  Open details
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-state empty-state--card">
            <strong>No matches found</strong>
            <p>Adjust the filters or search terms to widen the queue.</p>
          </div>
        )}
      </div>

      <div className="table-pagination">
        <div className="table-pagination__summary">
          Showing {pageStart}-{pageEnd} of {totalRows}
        </div>

        <div className="table-pagination__controls">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="pagination-button"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="pagination-pages">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => table.setPageIndex(number)}
                className={`pagination-page ${pageIndex === number ? 'pagination-page--active' : ''}`}
              >
                {number + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="pagination-button"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

