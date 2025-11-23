'use client';

import { Marble } from '@worldcoin/mini-apps-ui-kit-react';
import Image from 'next/image';
import { Pin } from 'iconoir-react';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerAvatar?: string;
  price: string;
  rating: number;
  image: string;
  location?: string;
  status?: 'none' | 'requested' | 'approved';
  onJoin?: (id: string) => void;
}

export const EventCard = ({
  id,
  title,
  description,
  organizer,
  organizerAvatar,
  price,
  rating,
  image,
  location,
  status = 'none',
  onJoin,
}: EventCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/experience/${id}`);
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'approved':
        return {
          text: 'Approved',
          className: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors flex-shrink-0 cursor-default',
        };
      case 'requested':
        return {
          text: 'Pending',
          className: 'bg-[#db5852] hover:bg-[#c94a44] active:bg-[#b73d38] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors flex-shrink-0 cursor-default',
        };
      default:
        return {
          text: 'Join',
          className: 'bg-[#db5852] hover:bg-[#c94a44] active:bg-[#b73d38] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors flex-shrink-0',
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div 
      className="flex gap-4 mb-5 mt-5 bg-white cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Event Image */}
      <div className="relative w-[140px] h-[140px] flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="140px"
        />
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-[#db5852] rounded-md px-2 py-1 flex items-center gap-0.5">
          <span className="text-white text-[10px] leading-none font-bold">★</span>
          <span className="text-white text-[11px] font-semibold leading-none">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Event Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex-1">
          <h3 className="font-bold text-[#1f1f1f] text-[15px] mb-1.5 leading-tight">{title}</h3>
          <div className="flex items-center gap-2 mb-2">
          {organizerAvatar ? (
            <Marble src={organizerAvatar} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0" />
          )}
          <span className="text-[11px] text-[#757683] truncate">Offered by {organizer.slice(0, 6) + '...' + organizer.slice(-4)}</span>
        </div>
          <p className="text-[13px] text-[#757683] line-clamp-2 mb-2 leading-snug">
            {description}
          </p>
        </div>
       
        <div className="flex items-center justify-between gap-2 mt-2 min-w-0">
        {location && (
          <div className="flex items-center gap-1 mb-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-[#1f1f1f] flex-shrink-0" strokeWidth={2} />
            <span className="text-[11px] text-[#757683] truncate">{location}</span>
          </div>
        )}
        <div className="flex flex-col items-center gap-2">
          <span className="font-bold text-[#1f1f1f] text-[15px] flex-shrink-0">{price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.(id);
            }}
            className={"rounded-md !bg-[#db5852] !text-white px-5 py-2 text-[13px] font-semibold transition-colors flex-shrink-0 cursor-default"}
          >
            {buttonConfig.text}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

