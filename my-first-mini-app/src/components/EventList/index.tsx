'use client';

import { EventCard } from '../EventCard';

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerAvatar?: string;
  price: string;
  rating: number;
  image: string;
  location?: string;
}

interface EventListProps {
  events: Event[];
  onJoinEvent?: (eventId: string) => void;
  currentPage?: number;
  totalPages?: number;
}

export const EventList = ({ events, onJoinEvent, currentPage = 1, totalPages = 4 }: EventListProps) => {
  return (
    <div className="w-full">
      {events.map((event) => (
        <EventCard
          key={event.id}
          {...event}
          onJoin={onJoinEvent}
        />
      ))}
      
      {/* Pagination Dots and See More */}
      {events.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-4 mb-2">
          {/* Pagination Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index + 1 === currentPage ? 'bg-[#db5852]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* See More Button */}
          <button className="text-[#db5852] font-semibold text-[13px] hover:text-[#c94a44] transition-colors flex items-center gap-1">
            See More
            <svg className="w-4 h-4 text-[#db5852]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

