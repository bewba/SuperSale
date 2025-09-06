// src/lib/pb.client.ts
import PocketBase from 'pocketbase';
import { PUBLIC_PBURL } from '$env/static/public';

let pb: PocketBase | null = null;

// TODO: SETUP ENV FOR THIS
export function getPb() {
	if (!pb) pb = new PocketBase(PUBLIC_PBURL ?? 'http://127.0.0.1:8090');
	return pb;
}
