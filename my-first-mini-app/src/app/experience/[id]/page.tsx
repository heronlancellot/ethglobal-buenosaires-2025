'use client';

import { Page } from '@/components/PageLayout';
import { Navigation } from '@/components/Navigation';
import { Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { Pin, ArrowLeft, ArrowRight } from 'iconoir-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getExperienceDetails } from '@/lib/contractUtils';
import { formatUnits } from 'viem';
import { MiniKit } from '@worldcoin/minikit-js';
import { NOMAD_EXPERIENCE_ADDRESS, NOMAD_EXPERIENCE_ABI } from '@/contracts/constants';

interface ExperienceData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  location: string;
  rating: number;
  ratingCount: number;
  recommendation: number;
  images: string[];
  organizer: {
    name: string;
    avatar?: string;
    experiences: number;
    peopleMet: number;
    about: string;
  };
}

export default function ExperienceDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
          subtitle: '',
          description: data.description,
          price: `$${formatUnits(data.price, 18)}`,
          location: data.location,
          rating: 4.5, // Default rating
          ratingCount: Number(data.participantCount),
          recommendation: 98, // Default
          images: data.coverImage ? [data.coverImage] : ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'],
          organizer: {
            name: data.creator.slice(0, 6) + '...' + data.creator.slice(-4),
            avatar: undefined,
            experiences: 0,
            peopleMet: Number(data.participantCount),
            about: `Creator: ${data.creator}`,
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
            <p className="text-gray-600">Loading experience...</p>
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === experience.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? experience.images.length - 1 : prev - 1
    );
  };

  const handleRequestJoin = async (experienceId: bigint) => {
    try {
      // Parse price from experience (remove '$' and convert to wei)
      const priceInUSD = parseFloat(experience.price.replace('$', ''));
      const priceInWei = BigInt(Math.floor(priceInUSD * 1e18));
      // Convert to hex string for MiniKit
      const priceInHex = '0x' + priceInWei.toString(16);

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: NOMAD_EXPERIENCE_ADDRESS,
            abi: NOMAD_EXPERIENCE_ABI,
            functionName: 'requestJoin',
            args: [experienceId],
            value: priceInHex,
          },
        ],
      });
      console.log('Join request response:', finalPayload);
      if (finalPayload.status === 'success') {
        console.log('Join request submitted, waiting for confirmation:', finalPayload.transaction_id);
      } else {
        console.error('Join request failed:', finalPayload);
      }
    } catch (error) {
      console.error('Error requesting join:', error);
    }
  };

  return (
    <Page className="bg-white">
      {/* Image Carousel */}
      <div className="relative w-full h-[50vh] min-h-[400px]">
        <Image
          src={experience.images[currentImageIndex]}
          alt={experience.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Navigation Arrows - Semi-transparent circular buttons */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-[#1f1f1f] p-2.5 rounded-full transition-colors z-10 shadow-md"
          aria-label="Previous image"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-[#1f1f1f] p-2.5 rounded-full transition-colors z-10 shadow-md"
          aria-label="Next image"
        >
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Price - Bottom left */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white font-bold text-lg drop-shadow-lg">{experience.price}</span>
        </div>

        {/* Title and Location - Bottom right */}
        <div className="absolute bottom-4 right-4 text-right">
          <h1 className="text-white text-lg font-bold mb-1 drop-shadow-lg">{experience.title}</h1>
          <div className="flex items-center justify-end gap-1">
            <Pin className="w-3.5 h-3.5 text-white drop-shadow-lg" strokeWidth={2} />
            <span className="text-white font-medium text-sm drop-shadow-lg">{experience.location}</span>
          </div>
        </div>
      </div>

      <Page.Main className="pb-28">
        {/* Rating Section */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[#fccd09] text-xl leading-none">★</span>
              ))}
            </div>
            <p className="text-[#757683] text-[15px]">
              {experience.rating} Rating ({experience.ratingCount})
            </p>
          </div>
          <button className="bg-[#db5852] hover:bg-[#c94a44] active:bg-[#b73d38] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          onClick={() => {
            handleRequestJoin(BigInt(experience.id));
          }}
          >
            Confirm
          </button>
        </div>

        {/* Description */}
        <div className="px-5 pt-6 pb-4">
          <p className="text-[#757683] text-[15px] leading-relaxed">
            {experience.description}
          </p>
        </div>

        {/* Recommendation */}
        <div className="px-5 pt-4 pb-6 flex items-start gap-4">
          <span className="text-[#db5852] text-5xl font-bold leading-none">{experience.recommendation}%</span>
          <p className="text-[#757683] text-[15px] leading-relaxed pt-2 flex-1">
            of guests who tried this experience would recommend it to a friend
          </p>
        </div>

        {/* About Anna Section */}
        <div className="px-5 pt-6 pb-8">
          <div className="flex items-start gap-4 mb-6">
            {experience.organizer.avatar ? (
              <Marble src={experience.organizer.avatar} className="w-16 h-16 rounded-full flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-[#1f1f1f] text-xl font-bold mb-4">About {experience.organizer.name}</h3>
              
              {/* Statistics */}
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-[#db5852] text-2xl font-bold">{experience.organizer.experiences}</p>
                  <p className="text-[#757683] text-sm">Experiences</p>
                </div>
                <div>
                  <p className="text-[#db5852] text-2xl font-bold">{experience.organizer.peopleMet}</p>
                  <p className="text-[#757683] text-sm">People Meet</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-[#757683] text-[15px] leading-relaxed">
            {experience.organizer.about}
          </p>
        </div>
      </Page.Main>

      <Navigation />
    </Page>
  );
}

