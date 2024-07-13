export const IS_COLORED = /^\+\+\{.*\}.*\+\+$/;
export const LEADING_SPAN = /^\<span.*\>(?!$)/;
export const TRAILING_SPAN = /\<\/span\>$/;
export const PREFIX = /\~\=\{\S+\}/g
export const SUFFIX = /\=\~/g

export interface RegExMatch {
	index: number;
	value: string;
	end: number;
}
