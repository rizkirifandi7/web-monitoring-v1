"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Thermometer,
	Droplets,
	FlaskConical,
	Zap,
	Sun,
	Waves,
} from "lucide-react";

// 1. Definisikan skema validasi menggunakan Zod
const formSchema = z
	.object({
		suhuMin: z.coerce.number().min(0, "Nilai minimum diperlukan."),
		suhuMax: z.coerce.number().min(0, "Nilai maksimum diperlukan."),
		kelembabanMin: z.coerce.number().min(0).max(100),
		kelembabanMax: z.coerce.number().min(0).max(100),
		phMin: z.coerce.number().min(0).max(14),
		phMax: z.coerce.number().min(0).max(14),
		ecMin: z.coerce.number().min(0),
		ecMax: z.coerce.number().min(0),
		cahayaMin: z.coerce.number().min(0),
		cahayaMax: z.coerce.number().min(0),
		suhuAirMin: z.coerce.number().min(0),
		suhuAirMax: z.coerce.number().min(0),
		levelAirMin: z.coerce.number().min(0),
		levelAirMax: z.coerce.number().min(0),
	})
	// 2. Validasi cross-field: pastikan Max >= Min
	.refine((data) => data.suhuMax >= data.suhuMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["suhuMax"], // Tampilkan pesan error di field suhuMax
	})
	.refine((data) => data.kelembabanMax >= data.kelembabanMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["kelembabanMax"],
	})
	.refine((data) => data.phMax >= data.phMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["phMax"],
	})
	.refine((data) => data.ecMax >= data.ecMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["ecMax"],
	})
	.refine((data) => data.cahayaMax >= data.cahayaMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["cahayaMax"],
	})
	.refine((data) => data.suhuAirMax >= data.suhuAirMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["suhuAirMax"],
	})
	.refine((data) => data.levelAirMax >= data.levelAirMin, {
		message: "Maksimum harus lebih besar atau sama dengan minimum.",
		path: ["levelAirMax"],
	});

// Komponen Form
export const PengaturanForm = () => {
	// Inisialisasi form dengan react-hook-form dan zod
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			suhuMin: 25,
			suhuMax: 30,
			kelembabanMin: 60,
			kelembabanMax: 80,
			phMin: 5.5,
			phMax: 6.5,
			ecMin: 1.2,
			ecMax: 2.5,
			cahayaMin: 10000,
			cahayaMax: 30000,
			suhuAirMin: 26,
			suhuAirMax: 28,
			levelAirMin: 20,
			levelAirMax: 90,
		},
	});

	// Fungsi yang dijalankan saat form disubmit
	function onSubmit(values) {
		// Di aplikasi nyata, di sini Anda akan mengirim data ke API
		console.log("Pengaturan berhasil disimpan:", values);
		alert(
			"Pengaturan berhasil disimpan! Cek console log untuk melihat datanya."
		);
	}

	// Fungsi render untuk field Min/Max agar tidak mengulang kode
	const renderMinMaxFields = (name, unit) => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<FormField
				control={form.control}
				name={`${name}Min`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{`${name} Minimum (${unit})`}</FormLabel>
						<FormControl>
							<Input type="number" step="0.1" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name={`${name}Max`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{`${name} Maksimum (${unit})`}</FormLabel>
						<FormControl>
							<Input type="number" step="0.1" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);

	return (
		<Card className="flex w-full flex-col gap-4 shadow-none">
			<CardHeader className="p-4 border-b py-0">
				<CardTitle className="text-xl text-gray-800">
					Pengaturan Batas Nilai
				</CardTitle>
				<CardDescription>
					Atur batas minimum dan maksimum untuk setiap parameter sistem
					hidroponik.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						{/* --- Grup Parameter Lingkungan --- */}
						<div className="space-y-4">
							<h3 className="text-base font-semibold flex items-center text-gray-700 mb-4">
								<Thermometer className="mr-1 h-4 w-4 " />
								Parameter Lingkungan
							</h3>
							{renderMinMaxFields("suhu", "°C")}
							{renderMinMaxFields("kelembaban", "%")}
						</div>

						<Separator />

						{/* --- Grup Parameter Larutan --- */}
						<div className="space-y-4">
							<h3 className="text-base font-semibold flex items-center text-gray-700 mb-4">
								<FlaskConical className="mr-1 h-4 w-4 " />
								Parameter Larutan
							</h3>
							{renderMinMaxFields("ph", "")}
							{renderMinMaxFields("ec", "µS/cm")}
							{renderMinMaxFields("suhuAir", "°C")}
						</div>

						<Separator />

						{/* --- Grup Parameter Lainnya --- */}
						<div className="space-y-4">
							<h3 className="text-base font-semibold flex items-center text-gray-700 mb-4">
								<Sun className="mr-1 h-4 w-4 " />
								Parameter Lainnya
							</h3>
							{renderMinMaxFields("cahaya", "lux")}
							{renderMinMaxFields("levelAir", "cm")}
						</div>

						<CardFooter className="px-0">
							<Button
								type="submit"
								className="w-full bg-emerald-700 hover:bg-emerald-600"
							>
								Simpan Pengaturan
							</Button>
						</CardFooter>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
