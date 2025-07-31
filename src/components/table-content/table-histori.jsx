"use client";

import React, { useEffect, useState } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronDown,
	Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker"; // Import DateRange
import useSWR from "swr";

// Impor komponen UI dari shadcn/ui atau sejenisnya
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
				{new Date(row.getValue("time")).toLocaleString("id-ID", {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})}
			</div>
		),
		// --- FUNGSI FILTER DIPERBARUI UNTUK RANGE ---
		filterFn: (row, columnId, filterValue) => {
			const rowDate = new Date(row.getValue(columnId));
			const fromDate = filterValue?.from;
			const toDate = filterValue?.to;

			// Jika tidak ada tanggal awal, jangan filter (tampilkan semua)
			if (!fromDate) {
				return true;
			}

			// Jika hanya tanggal awal yang dipilih, filter untuk hari itu saja
			if (fromDate && !toDate) {
				return (
					rowDate.getFullYear() === fromDate.getFullYear() &&
					rowDate.getMonth() === fromDate.getMonth() &&
					rowDate.getDate() === fromDate.getDate()
				);
			}

			// Jika rentang tanggal lengkap dipilih
			if (fromDate && toDate) {
				// Atur 'from' ke awal hari dan 'to' ke akhir hari agar inklusif
				const from = new Date(fromDate);
				from.setHours(0, 0, 0, 0);
				const to = new Date(toDate);
				to.setHours(23, 59, 59, 999);
				return rowDate >= from && rowDate <= to;
			}

			return true;
		},
	},
	// ... Definisi kolom lainnya tetap sama (temperature, humidity, dst.)
	{
		accessorKey: "temperature",
		header: "Suhu (°C)",
		cell: ({ row }) => {
			const value = parseFloat(row.getValue("temperature"));
			return !isNaN(value) ? value.toFixed(2) : "N/A";
		},
	},
	{
		accessorKey: "humidity",
		header: "Kelembapan (%)",
		cell: ({ row }) => {
			const value = parseFloat(row.getValue("humidity"));
			return !isNaN(value) ? value.toFixed(2) : "N/A";
		},
	},
	{
		accessorKey: "ph",
		header: "pH",
		cell: ({ row }) => {
			const value = parseFloat(row.getValue("ph"));
			return !isNaN(value) ? value.toFixed(2) : "N/A";
		},
	},
	{
		accessorKey: "light",
		header: "Cahaya",
		cell: ({ row }) => {
			const value = parseFloat(row.getValue("light"));
			return !isNaN(value) ? value.toFixed(2) : "N/A";
		},
	},
	{
		accessorKey: "ec",
		header: "EC",
		cell: ({ row }) => {
			const value = parseFloat(row.getValue("ec"));
			return !isNaN(value) ? value.toFixed(2) : "N/A";
		},
	},
	{
		accessorKey: "water_temp",
		header: "Suhu Air (°C)",
		cell: ({ row }) => {
			const value = parseFloat(row.getValue("water_temp"));
			return !isNaN(value) ? value.toFixed(2) : "N/A";
		},
	},
];

const fetcher = (url) => fetch(url).then((res) => res.json());

// --- Komponen Utama Tabel ---
export function TableHistori() {
	const {
		data: swrData,
		error,
		isLoading,
	} = useSWR("/api/sensor-data?type=all", fetcher);

	const [sorting, setSorting] = useState([{ id: "time", desc: true }]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");

	const data = React.useMemo(() => {
		if (!swrData?.data) return [];
		return swrData.data
			.map((item) => ({
				time: item.date,
				temperature: item.temperature ?? "N/A",
				humidity: item.humidity ?? "N/A",
				ph: item.ph ?? "N/A",
				light: item.light ?? "N/A",
				ec: item.ec ?? "N/A",
				water_temp: item.water_temp ?? "N/A",
				water_level: item.water_level ?? "N/A",
			}))
			.sort((a, b) => new Date(b.time) - new Date(a.time));
	}, [swrData]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnFilters,
			globalFilter,
			columnVisibility,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
				{/* --- Toolbar Terintegrasi --- */}
				<div className="flex flex-col sm:flex-row items-center gap-4 pb-4">
					<Input
						placeholder="Cari semua data..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="w-full sm:max-w-xs"
					/>
					{/* Filter Tanggal */}
					<DateRangeFilter column={table.getColumn("time")} />
					<div className="flex items-center gap-2 ml-auto">
						{/* Tombol Kolom */}
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

				{/* --- Tabel Data --- */}
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
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
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

				{/* --- Paginasi --- */}
				<div className="flex items-center justify-end space-x-2 pt-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Sebelumnya
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Selanjutnya
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// --- KOMPONEN FILTER DIPERBARUI UNTUK RANGE ---
function DateRangeFilter({ column }) {
	const [date, setDate] = useState(undefined);

	useEffect(() => {
		column?.setFilterValue(date);
	}, [date, column]);

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
					mode="range" // Ganti mode menjadi "range"
					selected={date}
					onSelect={setDate}
					initialFocus
					locale={id}
					numberOfMonths={2} // Tampilkan 2 bulan untuk navigasi lebih mudah
				/>
			</PopoverContent>
		</Popover>
	);
}
