'use client';

import { Stock } from '@/types/portfolio';
import { memo, useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';

interface PortfolioTableProps {
    stocks: Stock[];
}

const columnHelper = createColumnHelper<Stock>();

function PortfolioTableComponent({ stocks }: PortfolioTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatNumber = (value: number, decimals: number = 2) => {
        return value.toFixed(decimals);
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'STOCK NAME',
                cell: (info) => (
                    <div className="py-1">
                        <div className="font-medium text-slate-100 text-sm">{info.getValue()}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{info.row.original.symbol}</div>
                    </div>
                ),
            }),
            columnHelper.accessor('sector', {
                header: 'SECTOR',
                cell: (info) => (
                    <span className="inline-block px-2 py-1 text-[10px] font-medium bg-slate-800 text-slate-300 rounded uppercase tracking-wide">
                        {info.getValue()}
                    </span>
                ),
            }),
            columnHelper.accessor('purchasePrice', {
                header: 'PURCHASE PRICE',
                cell: (info) => <span className="text-slate-300 text-sm number-cell">{formatCurrency(info.getValue())}</span>,
            }),
            columnHelper.accessor('quantity', {
                header: 'QTY',
                cell: (info) => <span className="text-slate-300 text-sm number-cell">{info.getValue()}</span>,
            }),
            columnHelper.accessor('investment', {
                header: 'INVESTMENT',
                cell: (info) => <span className="font-medium text-slate-100 text-sm number-cell">{formatCurrency(info.getValue())}</span>,
            }),
            columnHelper.accessor('portfolioPercent', {
                header: 'PORTFOLIO %',
                cell: (info) => <span className="text-slate-300 text-sm number-cell">{formatNumber(info.getValue())}%</span>,
            }),
            columnHelper.accessor('cmp', {
                header: 'CMP',
                cell: (info) => (
                    <span className="font-semibold text-blue-500 text-sm number-cell">{formatCurrency(info.getValue())}</span>
                ),
            }),
            columnHelper.accessor('presentValue', {
                header: 'PRESENT VALUE',
                cell: (info) => <span className="font-medium text-slate-100 text-sm number-cell">{formatCurrency(info.getValue())}</span>,
            }),
            columnHelper.accessor('gainLoss', {
                header: 'GAIN/LOSS',
                cell: (info) => {
                    const value = info.getValue();
                    const percent = info.row.original.gainLossPercent;
                    return (
                        <div className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
                            <div className="font-semibold text-sm number-cell">{formatCurrency(value)}</div>
                            <div className="text-xs mt-0.5 number-cell">{percent >= 0 ? '+' : ''}{formatNumber(percent)}%</div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('peRatio', {
                header: 'P/E RATIO',
                cell: (info) => <span className="text-slate-300 text-sm number-cell">{formatNumber(info.getValue())}</span>,
            }),
            columnHelper.accessor('latestEarnings', {
                header: 'LATEST EARNINGS',
                cell: (info) => <span className="text-slate-300 text-sm number-cell">{formatNumber(info.getValue())}</span>,
            }),
        ],
        []
    );

    const table = useReactTable({
        data: stocks,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-slate-800">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950 cursor-pointer hover:bg-slate-900 transition-colors select-none"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() && (
                                                <span className="text-blue-500 text-xs">
                                                    {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row, index) => (
                            <tr
                                key={row.id}
                                className={`border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'
                                    }`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(PortfolioTableComponent);
