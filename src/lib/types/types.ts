export type Deal = {
	id: string; // good
	title: string; // good
	image: string; // good
	quantity: number; // good
	original_price: number; // good
	discount_price: number; // good
	discount_percent: number; // good
	reason: string; // good
	expires_at: string; // good
	contact_information: string; // good
	reason_category: string; // good
	owner_id: string; // good
	// NOTE: NEED TO ADD THESE COLUMNS TO THE DB
	avg_rating: number;
	image_list?: string[] | null;
};

export type ProductResponse = {
	data: Deal[];
	hasMore: boolean;
};

export type Seller = {
	// NOTE: Commenting this out jic we need them
	// name: string;
	// rating: number;
	// total_reviews: number;
	id: string;
	logo?: string;
	email: string;
	phone: string;
	business_name: string;
	address: string;
	joined_at: string;
	deals: Deal[];
	// Add this column to the DB
	activeChatIDs: string[] | [] | null;
};

export type ChatRoom = {
	id: string;
	buyer: string;
	seller: string;
	product: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;
};

export type Enriched = {
	id: string;
	buyer: string;
	seller: string;
	product: string;
	created: string;
	updated: string;
	collectionId: string;
	collectionName: string;
	buyerEmail: string;
	productName: string;
};
