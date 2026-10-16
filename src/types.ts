export interface TripDay { id: string; day: number; date: string; title: string; remindersMarkdown?: string; stops: ItineraryStop[] }
export interface ItineraryDetail { title: string; content: string[] }
export interface ItineraryMap { label: string; destination: string; confirmed?: boolean; origin?: string; transit?: boolean; walking?: boolean }
export interface ItineraryStop { id: string; startTime: string; endTime: string; name: string; type: string; placeId?: string; placeIds?: string[]; details?: ItineraryDetail[]; detailMarkdown?: string; maps?: ItineraryMap[]; notes: string }
export type PlaceType = 'shop' | 'restaurant' | 'attraction' | 'hotel';
export type ItemType = 'shopping' | 'food';
export interface Place { type: PlaceType; id: string; name: string; area: string; address: string; navigationDestination?: string; mapQuery?: string; shortAddress?: string; hours?: string; closedDays?: string; sourceUrls?: string[]; mapUrl?: string; notes: string }
export interface PurchaseOption { name: string; notes: string; sourceUrl: string }
export interface TripItem { type: ItemType; id: string; name: string; category: string; priority: number; image: string; imageCaption?: string; notes: string; placeIds: string[]; purchaseOptions?: PurchaseOption[]; shoppingGroup?: 'drugstore'; comparisonId?: string; convenienceStore?: '7-ELEVEN' | 'Lawson'; sourceUrls?: string[]; color?: string; size?: string }
