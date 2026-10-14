export interface TripDay { id: string; day: number; date: string; title: string; stops: ItineraryStop[] }
export interface ItineraryDetail { title: string; content: string[] }
export interface ItineraryStop { id: string; startTime: string; endTime: string; name: string; type: string; placeId?: string; placeIds?: string[]; details?: ItineraryDetail[]; notes: string }
export type PlaceType = 'shop' | 'restaurant' | 'attraction' | 'hotel';
export type ItemType = 'shopping' | 'food' | 'experience';
export interface Place { type: PlaceType; id: string; name: string; area: string; address: string; navigationDestination?: string; shortAddress?: string; hours?: string; closedDays?: string; sourceUrls?: string[]; mapUrl?: string; notes: string }
export interface TripItem { type: ItemType; id: string; name: string; category: string; priority: number; image: string; imageCaption?: string; notes: string; placeIds: string[]; color?: string; size?: string }
