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

// --- Definisi Kolom yang Ditingkatkan ---
// Menambahkan kemampuan sorting pada header
export const columns = [
	// Kolom bisa ditambahkan untuk checkbox jika diperlukan
	// { id: 'select', header: ... },
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
	},
	// Contoh kolom lain dengan sorting
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

// --- Komponen Utama Tabel ---
export function TableHistori() {
	const [data, setData] = useState([]);
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [loading, setLoading] = useState(true);

	// Fetch data
	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			try {
				const res = await fetch(
					"http://localhost:3000/api/sensor-data?type=all"
				);
				const json = await res.json();
				const merged = json.map((item) => ({
					time: item.date,
					temperature: item.temperature ?? "N/A",
					humidity: item.humidity ?? "N/A",
					ph: item.ph ?? "N/A",
					light: item.light ?? "N/A",
					ec: item.ec ?? "N/A",
					water_temp: item.water_temp ?? "N/A",
					water_level: item.water_level ?? "N/A",
				}));
				setData(merged);
			} catch (error) {
				console.error("Failed to fetch data:", error);
				// Bisa ditambahkan state untuk menampilkan pesan error di UI
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

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

	// Fungsi untuk mengunduh CSV dari data yang sedang ditampilkan (sudah terfilter)
	const downloadCSV = () => {
		const csvRows = [];
		// Ambil header yang terlihat
		const headers = table
			.getVisibleLeafColumns()
			.map((col) => col.id)
			.join(",");
		csvRows.push(headers);

		// Ambil baris dari model yang sudah difilter dan diurutkan
		table.getFilteredRowModel().rows.forEach((row) => {
			const values = row.getVisibleCells().map((cell) => {
				let value = cell.getValue();
				// Format tanggal jika perlu
				if (cell.column.id === "time") {
					value = `"${new Date(value).toLocaleString("id-ID")}"`;
				}
				return value;
			});
			csvRows.push(values.join(","));
		});

		const csvString = csvRows.join("\n");
		const blob = new Blob([csvString], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.setAttribute("href", url);
		a.setAttribute("download", "histori_sensor.csv");
		a.click();
	};

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
						{/* Tombol Unduh */}
						<Button variant="outline" onClick={downloadCSV}>
							<Download className="mr-2 h-4 w-4" />
							Unduh
						</Button>
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
							{loading ? (
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

// Komponen helper untuk filter tanggal
function DateRangeFilter({ column }) {
	const [date, setDate] = useState(undefined);

	useEffect(() => {
		if (date?.from && date?.to) {
			// Set filter ke kolom 'time'
			column?.setFilterValue([date.from, date.to]);
		} else {
			column?.setFilterValue(undefined);
		}
	}, [date, column]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className="w-full sm:w-[280px] justify-start text-left font-normal"
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
					onSelect={setDate}
					initialFocus
					locale={id}
				/>
			</PopoverContent>
		</Popover>
	);
}
