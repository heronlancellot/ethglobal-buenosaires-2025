'use client';

import { Page } from '@/components/PageLayout';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUserProfile, getUserApprovedExperiences } from '@/lib/contractUtils';
import Image from 'next/image';

interface NFTItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  timestamp: string;
}

interface ProfileData {
  exists: boolean;
  hostedCount: number;
  attendedCount: number;
  lastJoinedTimestamp: number;
  lastHostedTimestamp: number;
  experiencesCount: number;
  peopleMetCount: number;
  nftGallery: NFTItem[];
  missionProgress: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData>({
    exists: false,
    hostedCount: 0,
    attendedCount: 0,
    lastJoinedTimestamp: 0,
    lastHostedTimestamp: 0,
    experiencesCount: 0,
    peopleMetCount: 0,
    nftGallery: [],
    missionProgress: 33,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user) {
        return;
      }

      try {
        const userAddress = session.user.walletAddress || session.user.id;
        if (!userAddress) {
          return;
        }

        // Fetch profile data from contract using getProfile
        const profile = await getUserProfile(userAddress);
        console.log('Profile data from getProfile:', profile);
        
        // Fetch approved experiences to count unique people met
        const approvedExperiences = await getUserApprovedExperiences(userAddress);
        
        // For now, we'll use mock NFT data
        // In the future, this could be fetched from the AttendanceNFT contract
        const mockNFTs: NFTItem[] = [
          {
            id: '1',
            title: 'SUMMERTIME',
            subtitle: '& THE EASY',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            timestamp: '3 Hours ago',
          },
          {
            id: '2',
            title: 'KEEP ON ROLLING',
            subtitle: 'STAY HUMBLE',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            timestamp: '5 Days ago',
          },
          {
            id: '3',
            title: 'SHOOT YOUR SHOT',
            subtitle: '',
            image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=400&fit=crop',
            timestamp: '6 Months ago',
          },
          {
            id: '4',
            title: 'We Are LOVED',
            subtitle: '',
            image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop',
            timestamp: '1 Year ago',
          },
        ];

        // Use profile data from getProfile
        const experiencesCount = profile.exists ? profile.attendedCount : (approvedExperiences.length || 0);
        const peopleMetCount = profile.exists ? Math.max(profile.attendedCount * 3, 0) : (approvedExperiences.length * 3 || 0);

        setProfileData({
          exists: profile.exists,
          hostedCount: profile.hostedCount,
          attendedCount: profile.attendedCount,
          lastJoinedTimestamp: profile.lastJoinedTimestamp,
          lastHostedTimestamp: profile.lastHostedTimestamp,
          experiencesCount,
          peopleMetCount,
          nftGallery: mockNFTs,
          missionProgress: 33, // This could be calculated based on actual mission data
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Use default values on error
      }
    };

    fetchProfileData();
  }, [session]);

  const username = session?.user?.username || 'mika_sza';
  const displayName = session?.user?.name || 'Mikaele Santos';

  // Calculate mission progress percentage for circular progress
  const progressPercentage = profileData.missionProgress;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (progressPercentage / 100) * circumference;

  return (
    <Page className="bg-gray-100">
      <Page.Main className="p-0 pb-28 overflow-y-auto">
        {/* Profile Header with Gradient */}
        <div className="relative">
          {/* Gradient Background */}
          <div className="h-48 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />
          
          {/* White Content Area */}
          <div className="bg-white rounded-t-3xl -mt-8 relative pt-16 pb-6">

            {/* Name and Username */}
            <div className="text-center mt-4 px-6">
              <h1 className="text-2xl font-bold text-[#1f1f1f] mb-1">{displayName}</h1>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[#1f1f1f] text-sm font-semibold">X</span>
                <span className="text-[#1f1f1f] text-sm">@{username}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center justify-center gap-8 mt-6 px-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#db5852]">{profileData.attendedCount}</div>
                <div className="text-sm text-[#757683] mt-1">Attended</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#db5852]">{profileData.hostedCount}</div>
                <div className="text-sm text-[#757683] mt-1">Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#db5852]">{profileData.peopleMetCount}</div>
                <div className="text-sm text-[#757683] mt-1">People Met</div>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Gallery Section */}
        <div className="px-6 py-6 bg-white">
          <h2 className="text-lg font-bold text-[#1f1f1f] mb-4">NFT Gallery</h2>
          <div className="grid grid-cols-2 gap-3">
            {profileData.nftGallery.map((nft) => (
              <div
                key={nft.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-amber-50"
              >
                <Image
                  src={nft.image}
                  alt={nft.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* NFT Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  <div className="text-center">
                    <div className="text-white text-xs font-bold mb-0.5 drop-shadow-lg">
                      {nft.title}
                    </div>
                    {nft.subtitle && (
                      <div className="text-white text-[10px] font-semibold drop-shadow-lg">
                        {nft.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                {/* Timestamp */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/30 backdrop-blur-sm rounded-md px-2 py-1">
                    <span className="text-white text-[9px] font-medium">{nft.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOMA Mission Section */}
        <div className="px-6 py-6 bg-white mt-2">
          <h2 className="text-lg font-bold text-[#1f1f1f] mb-4">NOMA Mission</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-[#1f1f1f] mb-1">Meet 3 new people through NOMA</p>
              <p className="text-xs text-[#757683]">Period: November 1st-30th, 2025</p>
            </div>
            {/* Circular Progress */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="transform -rotate-90 w-24 h-24">
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#1f1f1f]">{progressPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </Page.Main>
    </Page>
  );
}

