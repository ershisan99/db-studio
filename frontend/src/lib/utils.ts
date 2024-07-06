import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Valuable<T> = { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] }

export function getValuable<T extends object, V = Valuable<T>>(obj: T): V {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => !((typeof v === 'string' && !v.length) || v === null || typeof v === 'undefined')
    )
  ) as V
}

export function prettyBytes(bytes: number): string {
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(2)} ${units[i]}`
}
