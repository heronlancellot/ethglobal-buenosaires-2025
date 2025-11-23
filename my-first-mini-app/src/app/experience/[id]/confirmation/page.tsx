'use client';

import { Page } from '@/components/PageLayout';
import { Navigation } from '@/components/Navigation';
import { Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { Pin } from 'iconoir-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getExperienceDetails } from '@/lib/contractUtils';
import { formatUnits } from 'viem';

interface ExperienceData {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  rating: number;
  ratingCount: number;
  images: string[];
  organizer: {
    name: string;
    avatar?: string;
  };
}

export default function ExperienceConfirmationPage() {
  const params = useParams();
  const [experience, setExperience] = useState<ExperienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const experienceId = params.id as string;

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = parseInt(experienceId, 10);
        if (isNaN(id)) {
          setError('Invalid experience ID');
          setLoading(false);
          return;
        }

        const data = await getExperienceDetails(id);

        // Transform contract data to UI format
        const uiExperience = {
          id: data.id.toString(),
          title: data.title,
          description: data.description,
          price: `$${formatUnits(data.price, 18)}`,
          location: data.location,
          rating: 4.8, // Default rating
          ratingCount: Number(data.participantCount),
          images: data.coverImage ? [data.coverImage] : ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'],
          organizer: {
            name: data.creator.slice(0, 6) + '...' + data.creator.slice(-4),
            avatar: undefined,
          },
        };

        setExperience(uiExperience);
      } catch (err) {
        console.error('Error fetching experience:', err);
        setError(err instanceof Error ? err.message : 'Failed to load experience');
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [experienceId]);

  if (loading) {
    return (
      <Page>
        <Page.Main className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#db5852] mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </Page.Main>
      </Page>
    );
  }

  if (error || !experience) {
    return (
      <Page>
        <Page.Main className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#757683] font-semibold mb-2">Experience not found</p>
            <p className="text-sm text-gray-600">{error || 'Unable to load experience data'}</p>
          </div>
        </Page.Main>
      </Page>
    );
  }

  return (
    <Page className="bg-white">
      <Page.Main className="pb-28">
        <div className="flex flex-col items-center px-4 py-8">
          {/* Sun Mascot */}
          <div className="mb-6">
            <div className="relative w-40 h-40 mx-auto">
              {/* Sun face - main circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-xl">
                {/* Left eye (open) */}
                <div className="absolute top-10 left-1/4 w-5 h-5 bg-black rounded-full"></div>
                {/* Right eye (winking) */}
                <div className="absolute top-10 right-1/4 w-7 h-1 bg-black rounded-full"></div>
                {/* Smile */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-20 h-10 border-4 border-black border-t-transparent rounded-full"></div>
                {/* Cheeks */}
                <div className="absolute top-14 left-6 w-7 h-7 bg-pink-300 rounded-full"></div>
                <div className="absolute top-14 right-6 w-7 h-7 bg-pink-300 rounded-full"></div>
              </div>
              {/* Left arm - bent at elbow, hand on hip */}
              <div className="absolute top-1/2 -left-6 w-8 h-16 bg-yellow-400 rounded-full transform -rotate-45 origin-top"></div>
              <div className="absolute top-1/2 left-2 w-6 h-8 bg-yellow-400 rounded-full transform rotate-45"></div>
              {/* Right arm - bent at elbow, hand on hip */}
              <div className="absolute top-1/2 -right-6 w-8 h-16 bg-yellow-400 rounded-full transform rotate-45 origin-top"></div>
              <div className="absolute top-1/2 right-2 w-6 h-8 bg-yellow-400 rounded-full transform -rotate-45"></div>
              {/* Legs - blue shoes */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
                <div className="w-7 h-10 bg-blue-500 rounded-full shadow-md"></div>
                <div className="w-7 h-10 bg-blue-500 rounded-full shadow-md"></div>
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-2xl font-bold text-[#1f1f1f] mb-3 text-center">
            Packing your spot in this experience!
          </h1>

          {/* Subtitle */}
          <p className="text-[#757683] text-sm text-center mb-8 max-w-sm">
            Your future host is checking if the vibes match. As soon as you&apos;re approved, we&apos;ll send you a notification.
          </p>

          {/* Experience Card */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden mb-6">
            {/* Image with Rating */}
            <div className="relative w-full h-48">
              <Image
                src={experience.images[0]}
                alt={experience.title}
                fill
                className="object-cover"
              />
              {/* Rating Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
                <span className="text-[#fccd09] text-sm">★</span>
                <span className="text-[#1f1f1f] text-sm font-semibold">{experience.rating}</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              {/* Title */}
              <h2 className="text-xl font-bold text-[#1f1f1f] mb-2">{experience.title}</h2>

              {/* Host Info */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-[#757683]">Offered by</span>
                {experience.organizer.avatar ? (
                  <Marble 
                    src={experience.organizer.avatar} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                )}
                <span className="text-sm font-semibold text-[#1f1f1f]">{experience.organizer.name}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#757683] mb-3 line-clamp-2">
                {experience.description}
              </p>

              {/* Location */}
              <div className="flex items-center gap-1.5">
                <Pin className="w-4 h-4 text-[#1f1f1f]" strokeWidth={2} />
                <span className="text-sm text-[#1f1f1f]">{experience.location}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="w-full max-w-md">
            <p className="text-[#757683] text-sm text-center">
              <span className="font-semibold">Heads up:</span> you&apos;ll only get charged once you pull up to the event and the host scans your Rising Code.
            </p>
          </div>
        </div>
      </Page.Main>

      <Navigation />
    </Page>
  );
}

