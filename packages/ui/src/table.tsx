import * as React from 'react';

import { cn } from './utils.js';

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/60">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  ),
);

Table.displayName = 'Table';

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b border-white/5', className)} {...props} />
  ),
);

TableHeader.displayName = 'TableHeader';

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-400',
        className,
      )}
      {...props}
    />
  ),
);

TableHead.displayName = 'TableHead';

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-b-0', className)} {...props} />
  ),
);

TableBody.displayName = 'TableBody';

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-white/5 transition hover:bg-slate-900/60 data-[state=selected]:bg-slate-900',
        className,
      )}
      {...props}
    />
  ),
);

TableRow.displayName = 'TableRow';

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-4 py-3 align-middle text-sm text-slate-200', className)}
      {...props}
    />
  ),
);

TableCell.displayName = 'TableCell';
