import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Valuable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

export function getValuable<T extends object, V = Valuable<T>>(obj: T): V {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) =>
        !(
          (typeof v === "string" && !v.length) ||
          v === null ||
          typeof v === "undefined"
        ),
    ),
  ) as V;
}

export function prettyBytes(bytes: number): string {
  const units = ["B", "kB", "MB", "GB", "TB", "PB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / 1024 ** i;
  return `${size.toFixed(2)} ${units[i]}`;
}

export function isUrl(value: string) {
  return z.string().url().safeParse(value).success;
}

const imageUrlRegex = new RegExp(
  /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|svg|webp|bmp))/i,
);

export function isImageUrl(value: string) {
  return value.match(imageUrlRegex);
}

export const cleanEmptyParams = <T extends Record<string, unknown>>(
  search: T,
) => {
  const newSearch = { ...search };
  for (const key of Object.keys(search)) {
    const value = newSearch[key];
    if (
      value === undefined ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    )
      delete newSearch[key];
  }

  if (search.pageIndex === DEFAULT_PAGE_INDEX) {
    // @ts-ignore
    newSearch.pageIndex = undefined;
  }
  if (search.pageSize === DEFAULT_PAGE_SIZE) {
    // @ts-ignore
    newSearch.pageSize = undefined;
  }

  return newSearch;
};
