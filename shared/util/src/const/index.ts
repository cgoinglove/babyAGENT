export const IS_PROD = process.env.NODE_ENV === 'production';

export const IS_BROWSER = typeof window != 'undefined';
