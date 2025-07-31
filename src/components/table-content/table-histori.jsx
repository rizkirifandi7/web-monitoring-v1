// File: components/SensorDataComponents.js (atau path yang sesuai)

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel, // <-- Tambahkan ini untuk filter client-side
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronDown,
	Calendar as CalendarIcon, // <-- Tambahkan kembali ikon kalender
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

export const columns = [
	{
		accessorKey: "time",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Waktu
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="pl-4">
				{new Date(row.original.date).toLocaleString("id-ID", {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})}
			</div>
		),
	},
	{ accessorKey: "temperature", header: "Suhu (°C)" },
	{ accessorKey: "humidity", header: "Kelembapan (%)" },
	{ accessorKey: "ph", header: "pH" },
	{ accessorKey: "light", header: "Cahaya" },
	{ accessorKey: "ec", header: "EC" },
	{ accessorKey: "water_temp", header: "Suhu Air (°C)" },
];

const fetcher = (url) => fetch(url).then((res) => res.json());

export function TableHistori() {
	// --- DIUBAH: Tambahkan kembali state untuk filter tanggal ---
	const [dateRange, setDateRange] = useState(undefined);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnVisibility, setColumnVisibility] = useState({});
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const apiUrl = useMemo(() => {
		const params = new URLSearchParams({
			page: (pagination.pageIndex + 1).toString(),
			limit: pagination.pageSize.toString(),
		});
		// --- DIUBAH: Tambahkan kembali parameter tanggal ke URL jika ada ---
		if (dateRange?.from) {
			const toDate = dateRange.to || dateRange.from;
			const endOfDay = new Date(toDate);
			endOfDay.setHours(23, 59, 59, 999);
			params.append("start", dateRange.from.toISOString());
			params.append("end", endOfDay.toISOString());
		}
		return `/api/sensor-data/all?${params.toString()}`;
	}, [pagination, dateRange]);

	const {
		data: swrData,
		error,
		isLoading,
	} = useSWR(apiUrl, fetcher, { keepPreviousData: true });

	// Efek untuk reset halaman ke 1 jika filter tanggal berubah
	useEffect(() => {
		if (dateRange) {
			setPagination((p) => ({ ...p, pageIndex: 0 }));
		}
	}, [dateRange]);

	const data = useMemo(() => swrData?.data ?? [], [swrData]);
	const pageCount = useMemo(() => {
		return swrData?.total ? Math.ceil(swrData.total / pagination.pageSize) : 0;
	}, [swrData, pagination.pageSize]);

	const table = useReactTable({
		data,
		columns,
		pageCount,
		state: { pagination, globalFilter, columnVisibility },
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(), // <-- Aktifkan model filter
		manualPagination: true, // Paginasi tetap manual (di-handle server)
		// manualFiltering: true, <-- Hapus atau set ke false agar search bekerja di client
	});

	return (
		<Card className="w-full bg-white border shadow-none">
			<CardHeader className="p-4 border-b py-0">
				<CardTitle className="text-xl font-bold text-slate-800">
					Dashboard Histori Data Sensor
				</CardTitle>
				<CardDescription>
					Cari, filter, dan unduh rekaman data dari sensor secara lengkap.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-4 pt-4">
				{/* --- DIUBAH: Tambahkan kembali komponen filter tanggal --- */}
				<div className="flex flex-col sm:flex-row items-center gap-4 pb-4">
					<Input
						placeholder="Cari di halaman ini..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="w-full sm:max-w-xs"
					/>
					<DateRangeFilter date={dateRange} onDateChange={setDateRange} />
					<div className="flex items-center gap-2 ml-auto">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									Kolom <ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{table
									.getAllColumns()
									.filter((col) => col.getCanHide())
									.map((col) => (
										<DropdownMenuCheckboxItem
											key={col.id}
											className="capitalize"
											checked={col.getIsVisible()}
											onCheckedChange={(val) => col.toggleVisibility(!!val)}
										>
											{col.id}
										</DropdownMenuCheckboxItem>
									))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				{/* Sisanya tetap sama */}
				<div className="rounded-md border">
					<Table>
						<TableHeader className="bg-slate-50">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 10 }).map((_, i) => (
									<TableRow key={i}>
										{columns.map((col) => (
											<TableCell key={col.accessorKey}>
												<Skeleton className="h-6 w-full" />
											</TableCell>
										))}
									</TableRow>
								))
							) : table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										Data tidak ditemukan.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<div className="flex items-center justify-between pt-4">
					<div className="text-sm text-muted-foreground">
						Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4" /> Sebelumnya
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Selanjutnya <ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// --- DIUBAH: Tambahkan kembali komponen DateRangeFilter ---
function DateRangeFilter({ date, onDateChange }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className="w-full sm:w-[260px] justify-start text-left font-normal"
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date?.from ? (
						date.to ? (
							<>
								{format(date.from, "d LLL y", { locale: id })} -{" "}
								{format(date.to, "d LLL y", { locale: id })}
							</>
						) : (
							format(date.from, "d LLL y", { locale: id })
						)
					) : (
						<span>Pilih rentang tanggal</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="range"
					selected={date}
					onSelect={onDateChange}
					initialFocus
					locale={id}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
}

// Komponen untuk data 'latest' tidak perlu diubah
export function LatestSensorCard({ sensorKey, title, unit }) {
	const { data, error, isLoading } = useSWR(
		"/api/sensor-data/latest",
		fetcher,
		{ refreshInterval: 5000 }
	);
	const value = data?.[sensorKey];
	const displayValue = typeof value === "number" ? value.toFixed(2) : "N/A";
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-10 w-2/3" />
				) : (
					<p className="text-3xl font-bold">
						{displayValue} <span className="text-lg font-normal">{unit}</span>
					</p>
				)}
			</CardContent>
		</Card>
	);
}
