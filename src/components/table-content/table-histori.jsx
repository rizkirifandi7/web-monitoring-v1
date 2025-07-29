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
	Download,
	Calendar as CalendarIcon,
} from "lucide-react";

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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

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
				{new Date(row.getValue("time")).toLocaleString("id-ID")}
			</div>
		),
		filterFn: (row, columnId, filterValue) => {
			if (!filterValue) return true;
			const date = new Date(row.getValue(columnId));
			const selected = new Date(filterValue);
			return (
				date.getFullYear() === selected.getFullYear() &&
				date.getMonth() === selected.getMonth() &&
				date.getDate() === selected.getDate()
			);
		},
	},
	{
		accessorKey: "temperature",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Suhu (°C)
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{ accessorKey: "humidity", header: "Kelembapan (%)" },
	{ accessorKey: "ph", header: "pH" },
	{ accessorKey: "light", header: "Cahaya" },
	{ accessorKey: "ec", header: "EC" },
	{ accessorKey: "water_temp", header: "Suhu Air (°C)" },
	{ accessorKey: "water_level", header: "Level Air" },
];

const fetcher = (url) => fetch(url).then((res) => res.json());

// --- Komponen Utama Tabel ---
export function TableHistori() {
	const {
		data: swrData,
		error,
		isLoading,
	} = useSWR("/api/sensor-data?type=all", fetcher);

	const [sorting, setSorting] = useState([
		{ id: "time", desc: true }, // default: waktu terbaru di atas
	]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");

	// Transform data dari SWR
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
			.sort((a, b) => new Date(b.time) - new Date(a.time)); // urutkan terbaru di atas
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
			<CardContent className="p-4 py-0">
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
								// Skeleton Loading
								Array.from({ length: 5 }).map((_, i) => (
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
				<div className="flex items-center justify-center space-x-2 pt-4">
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

function DateRangeFilter({ column }) {
	const [date, setDate] = useState(undefined);

	useEffect(() => {
		if (date) {
			column?.setFilterValue(date);
		} else {
			column?.setFilterValue(undefined);
		}
	}, [date, column]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className="w-full sm:w-[180px] justify-start text-left font-normal"
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? (
						format(date, "d LLL y", { locale: id })
					) : (
						<span>Pilih tanggal</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
					initialFocus
					locale={id}
				/>
			</PopoverContent>
		</Popover>
	);
}
