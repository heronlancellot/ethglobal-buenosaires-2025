'use client';

import { Page } from '@/components/PageLayout';
import { Navigation } from '@/components/Navigation';
import { EventCard } from '@/components/EventCard';
import { QrCode, ArrowRight, WarningTriangle } from 'iconoir-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getExperienceDetails, getUserApprovedExperiences, getUserRequestedExperiences } from '@/lib/contractUtils';
import { formatUnits } from 'viem';
import { useSession } from 'next-auth/react';

interface ExperienceCard {
  id: number;
  title: string;
  description: string;
  location: string;
  price: string;
  rating: number;
  image: string;
  organizer: {
    name: string;
    avatar?: string;
  };
  status: 'pending' | 'approved';
  startTime?: bigint;
  endTime?: bigint;
  creator: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [nextExperiences, setNextExperiences] = useState<ExperienceCard[]>([]);
  const [historyExperiences, setHistoryExperiences] = useState<ExperienceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserExperiences = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get user wallet address
        const userAddress = session.user.walletAddress || session.user.id;
        if (!userAddress) {
          setError('User address not found');
          setLoading(false);
          return;
        }

        // Get both approved and requested experience IDs for the user
        const [approvedIds, requestedIds] = await Promise.all([
          getUserApprovedExperiences(userAddress),
          getUserRequestedExperiences(userAddress),
        ]);
        
        console.log('Approved experience IDs:', approvedIds);
        console.log('Requested experience IDs:', requestedIds);
        console.log('User address:', userAddress);

        // Combine all experience IDs (remove duplicates)
        const allExperienceIds = [...new Set([...approvedIds, ...requestedIds])];

        // Fetch details for each experience
        const experiences: ExperienceCard[] = [];
        for (const id of allExperienceIds) {
          try {
            const data = await getExperienceDetails(id);

            // Determine status: approved if in approvedIds, pending if only in requestedIds
            const isApproved = approvedIds.includes(id);
            
            experiences.push({
              id,
              title: data.title,
              description: data.description,
              location: data.location,
              price: `$${formatUnits(data.price, 18)}`,
              rating: 4.8,
              image: data.coverImage || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
              organizer: {
                name: data.creator.slice(0, 6) + '...' + data.creator.slice(-4),
                avatar: undefined,
              },
              status: isApproved ? 'approved' : 'pending',
              startTime: data.startTime,
              endTime: data.endTime,
              creator: data.creator,
            });
          } catch (err) {
            console.error(`Error fetching experience ${id}:`, err);
            // Continue with other experiences
          }
        }

        // Separate into next (upcoming) and history (past)
        const now = BigInt(Math.floor(Date.now() / 1000));
        const zeroBigInt = BigInt(0);
        // Next: experiences that haven't ended yet (endTime > now or no endTime/endTime is 0)
        const next = experiences.filter((exp) => {
          if (!exp.endTime || exp.endTime === zeroBigInt) {
            // If no endTime, consider it as upcoming
            return true;
          }
          return exp.endTime > now;
        });
        // History: experiences that have already ended (endTime > 0 and endTime <= now)
        const history = experiences.filter((exp) => {
          return exp.endTime && exp.endTime > zeroBigInt && exp.endTime <= now;
        });

        console.log('Total experiences fetched:', experiences.length);
        console.log('Next experiences:', next.length);
        console.log('History experiences:', history.length);
        console.log('Experiences details:', experiences.map(exp => ({
          id: exp.id,
          title: exp.title,
          startTime: exp.startTime?.toString(),
          endTime: exp.endTime?.toString(),
        })));

        setNextExperiences(next);
        setHistoryExperiences(history);
      } catch (err) {
        console.error('Error fetching user experiences:', err);
        setError(err instanceof Error ? err.message : 'Failed to load experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchUserExperiences();
  }, [session]);

  if (loading) {
    return (
      <Page>
        <Page.Main className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#db5852] mx-auto mb-2"></div>
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        </Page.Main>
      </Page>
    );
  }

  return (
    <Page className="bg-white">
      <Page.Header className="p-0">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#1f1f1f]">Schedule</h1>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="QR Code"
          >
            <QrCode className="w-6 h-6 text-[#db5852]" strokeWidth={2} />
          </button>
        </div>
      </Page.Header>

      <Page.Main className="pb-28 bg-white">
        {/* Next Experiences Section */}
        {nextExperiences.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-bold text-[#1f1f1f] mb-4">Next Experiences</h2>
            <div className="space-y-0">
              {nextExperiences.map((experience) => (
                <EventCard
                  key={experience.id}
                  id={experience.id.toString()}
                  title={experience.title}
                  description={experience.description}
                  organizer={experience.organizer.name}
                  organizerAvatar={experience.organizer.avatar}
                  price={experience.price}
                  rating={experience.rating}
                  image={experience.image}
                  location={experience.location}
                  status={experience.status === 'pending' ? 'requested' : experience.status === 'approved' ? 'approved' : 'none'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Experience History Section */}
        {historyExperiences.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-bold text-[#1f1f1f] mb-4">Experience History</h2>
            <div className="space-y-0">
              {historyExperiences.map((experience) => (
                <EventCard
                  key={experience.id}
                  id={experience.id.toString()}
                  title={experience.title}
                  description={experience.description}
                  organizer={experience.organizer.name}
                  organizerAvatar={experience.organizer.avatar}
                  price={experience.price}
                  rating={experience.rating}
                  image={experience.image}
                  location={experience.location}
                  status="approved"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {nextExperiences.length === 0 && historyExperiences.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <WarningTriangle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-[#757683] text-center">No experiences scheduled yet</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <WarningTriangle className="w-16 h-16 text-red-300 mb-4" />
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Report Section */}
        <div className="px-4 py-6">
          <button
            onClick={() => router.push('/report')}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <WarningTriangle className="w-5 h-5 text-[#db5852]" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-left text-[#1f1f1f] font-medium">Report</span>
            <ArrowRight className="w-5 h-5 text-[#757683]" strokeWidth={2} />
          </button>
        </div>
      </Page.Main>

      <Navigation />
    </Page>
  );
}

