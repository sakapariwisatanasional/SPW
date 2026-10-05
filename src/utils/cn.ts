import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan class Tailwind secara aman.
 *
 * twMerge memastikan utility yang diberikan terakhir benar-benar
 * menggantikan utility sebelumnya yang konflik, misalnya:
 * text-white -> text-slate-900
 * bg-[#0066B3] -> bg-white
 *
 * Ini penting untuk komponen UI yang memiliki variant default lalu
 * dioverride lewat className.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
