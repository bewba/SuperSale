import type { SupabaseClient } from '@supabase/supabase-js';
import { logEvent } from './logger';

type TypeCheck = {
	value: any;
	expectedType: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';
	fieldName: string;
	required?: boolean;
};

/**
 * Validates the type of a value and logs if incorrect
 * @param supabase - Supabase client for logging
 * @param userId - User ID for logging
 * @param checks - Array of type checks to perform
 * @returns true if all checks pass, false otherwise
 */
export async function validateTypes(
	supabase: SupabaseClient,
	userId: string | null,
	checks: TypeCheck[]
): Promise<{ valid: boolean; errors: string[] }> {
	const errors: string[] = [];

	for (const check of checks) {
		const { value, expectedType, fieldName, required = false } = check;

		// Check if required field is missing
		if (required && (value === null || value === undefined)) {
			const error = `Type validation failure: Required field "${fieldName}" is missing or null`;
			errors.push(error);
			await logEvent(supabase, userId, error);
			continue;
		}

		// Skip validation if value is null/undefined and not required
		if (!required && (value === null || value === undefined)) {
			continue;
		}

		// Check actual type
		let actualType: string;
		if (value === null) {
			actualType = 'null';
		} else if (value === undefined) {
			actualType = 'undefined';
		} else if (Array.isArray(value)) {
			actualType = 'array';
		} else {
			actualType = typeof value;
		}

		// Validate type
		if (actualType !== expectedType) {
			const error = `Type validation failure: Field "${fieldName}" expected type "${expectedType}" but got "${actualType}" (value: ${JSON.stringify(value).substring(0, 100)})`;
			errors.push(error);
			await logEvent(supabase, userId, error);
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Validates that a value is a string
 */
export function isString(value: any): value is string {
	return typeof value === 'string';
}

/**
 * Validates that a value is a number
 */
export function isNumber(value: any): value is number {
	return typeof value === 'number' && !isNaN(value);
}

/**
 * Validates that a value is a boolean
 */
export function isBoolean(value: any): value is boolean {
	return typeof value === 'boolean';
}

/**
 * Validates that a value is an array
 */
export function isArray(value: any): value is any[] {
	return Array.isArray(value);
}

/**
 * Validates that a value is an object (and not null/array)
 */
export function isObject(value: any): value is Record<string, any> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

