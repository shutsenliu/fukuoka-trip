export interface TripDay { id: string; day: number; date: string; title: string; stops: ItineraryStop[] }
export interface ItineraryStop { id: string; startTime: string; endTime: string; name: string; type: string; placeId?: string; placeIds?: string[]; notes: string }
export type PlaceType = 'shop' | 'restaurant' | 'attraction';
export type ItemType = 'shopping' | 'food' | 'experience';
export interface Place { type: PlaceType; id: string; name: string; area: string; address: string; mapUrl?: string; notes: string }
export interface TripItem { type: ItemType; id: string; name: string; category: string; priority: number; image: string; imageCaption?: string; notes: string; placeIds: string[]; color?: string; size?: string }
