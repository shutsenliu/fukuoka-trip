export interface TripDay { id: string; day: number; date: string; title: string; stops: ItineraryStop[] }
export interface ItineraryStop { id: string; startTime: string; endTime: string; name: string; type: string; storeId?: string; storeIds?: string[]; notes: string }
export interface Store { id: string; name: string; area: string; address: string; mapUrl?: string; notes: string }
export interface WishlistItem { id: string; name: string; category: string; priority: number; image: string; notes: string; storeIds: string[]; color?: string; size?: string }
