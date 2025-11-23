'use client';

import { Page } from '@/components/PageLayout';
import { Navigation } from '@/components/Navigation';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { Pin, QrCode, Check, Xmark } from 'iconoir-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getExperienceDetails, getJoinRequests, getParticipants } from '@/lib/contractUtils';
import { formatUnits } from 'viem';
import { MiniKit } from '@worldcoin/minikit-js';
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { NOMAD_EXPERIENCE_ADDRESS, NOMAD_EXPERIENCE_ABI } from '@/contracts/constants';
import { useSession } from 'next-auth/react';

interface ExperienceData {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  rating: number;
  ratingCount: number;
  images: string[];
  creator: string;
}

interface JoinRequest {
  address: string;
  status: 'pending' | 'approved';
}

export default function ExperienceManagePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [experience, setExperience] = useState<ExperienceData | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');

  const experienceId = params.id as string;

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    client: client,
    appConfig: {
      app_id: process.env.NEXT_PUBLIC_WLD_CLIENT_ID as `app_${string}`,
    },
    transactionId: transactionId,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = parseInt(experienceId, 10);
        if (isNaN(id)) {
          setError('Invalid experience ID');
          setLoading(false);
          return;
        }

        // Fetch experience details
        const data = await getExperienceDetails(id);

        // Check if current user is the creator
        // Get wallet address from session (it might be in user.id or walletAddress)
        const userWalletAddress = session?.user?.walletAddress || session?.user?.id;
        if (userWalletAddress && userWalletAddress.toLowerCase() !== data.creator.toLowerCase()) {
          setError('You are not the creator of this experience');
          setLoading(false);
          return;
        }

        const uiExperience = {
          id: data.id.toString(),
          title: data.title,
          description: data.description,
          price: `$${formatUnits(data.price, 18)}`,
          location: data.location,
          rating: 4.8,
          ratingCount: Number(data.participantCount),
          images: data.coverImage ? [data.coverImage] : ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'],
          creator: data.creator,
        };

        setExperience(uiExperience);

        // Fetch join requests and participants
        const [requests, participants] = await Promise.all([
          getJoinRequests(id),
          getParticipants(id),
        ]);

        // Create join requests list with status
        const requestsList: JoinRequest[] = requests.map((addr) => ({
          address: addr,
          status: participants.includes(addr) ? 'approved' : 'pending',
        }));

        setJoinRequests(requestsList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [experienceId, session]);

  // Handle transaction confirmation
  useEffect(() => {
    if (transactionId && !isConfirming) {
      if (isConfirmed) {
        console.log('✅ Transaction confirmed!');
        setProcessingAddress(null);
        setTransactionId('');
        // Refresh data
        const refreshData = async () => {
          const id = parseInt(experienceId, 10);
          const [requests, participants] = await Promise.all([
            getJoinRequests(id),
            getParticipants(id),
          ]);
          const requestsList: JoinRequest[] = requests.map((addr) => ({
            address: addr,
            status: participants.includes(addr) ? 'approved' : 'pending',
          }));
          setJoinRequests(requestsList);
        };
        refreshData();
      } else if (isError) {
        console.error('❌ Transaction failed:', transactionError);
        setProcessingAddress(null);
        setTransactionId('');
      }
    }
  }, [isConfirmed, isConfirming, isError, transactionError, transactionId, experienceId]);

  const handleApprove = async (userAddress: string) => {
    if (!experience) return;

    try {
      setProcessingAddress(userAddress);
      setTransactionId('');

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: NOMAD_EXPERIENCE_ADDRESS,
            abi: NOMAD_EXPERIENCE_ABI,
            functionName: 'approveJoin',
            args: [Number(experienceId), userAddress as `0x${string}`],
          },
        ],
      });

      if (finalPayload.status === 'success') {
        setTransactionId(finalPayload.transaction_id);
      } else {
        console.error('Failed to approve:', finalPayload);
        setProcessingAddress(null);
      }
    } catch (err) {
      console.error('Error approving join:', err);
      setProcessingAddress(null);
    }
  };

  const handleReject = async (userAddress: string) => {
    if (!experience) return;

    try {
      setProcessingAddress(userAddress);
      setTransactionId('');

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: NOMAD_EXPERIENCE_ADDRESS,
            abi: NOMAD_EXPERIENCE_ABI,
            functionName: 'rejectJoin',
            args: [Number(experienceId), userAddress as `0x${string}`],
          },
        ],
      });

      if (finalPayload.status === 'success') {
        setTransactionId(finalPayload.transaction_id);
      } else {
        console.error('Failed to reject:', finalPayload);
        setProcessingAddress(null);
      }
    } catch (err) {
      console.error('Error rejecting join:', err);
      setProcessingAddress(null);
    }
  };

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
        <Page.Header className="p-0">
          <TopBar title="Manage Experience" />
        </Page.Header>
        <Page.Main className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#757683] font-semibold mb-2">Error</p>
            <p className="text-sm text-gray-600">{error || 'Unable to load data'}</p>
          </div>
        </Page.Main>
      </Page>
    );
  }

  const pendingRequests = joinRequests.filter((r) => r.status === 'pending');
  const approvedRequests = joinRequests.filter((r) => r.status === 'approved');
  // approvedParticipants is used in the approved section below

  return (
    <Page className="bg-white">
      <Page.Header className="p-0">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#1f1f1f]">Schedule</h1>
          <button
            onClick={() => router.push(`/experience/${experienceId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="View QR Code"
          >
            <QrCode className="w-6 h-6 text-[#1f1f1f]" strokeWidth={2} />
          </button>
        </div>
      </Page.Header>

      <Page.Main className="pb-28 bg-gray-50">
        {/* Next Experiences Section */}
        {pendingRequests.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-bold text-[#1f1f1f] mb-4">Next Experiences</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.address}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Image */}
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
                    <h3 className="text-lg font-bold text-[#1f1f1f] mb-2">{experience.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                      <span className="text-sm text-[#757683]">
                        Requested by {request.address.slice(0, 6)}...{request.address.slice(-4)}
                      </span>
                    </div>
                    <p className="text-sm text-[#757683] mb-4 line-clamp-2">{experience.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="w-4 h-4 text-[#1f1f1f]" strokeWidth={2} />
                      <span className="text-sm text-[#1f1f1f]">{experience.location}</span>
                    </div>
                    <div className="flex gap-2">
                      {/* Approve Button with Check Icon */}
                      <button
                        onClick={() => handleApprove(request.address)}
                        disabled={processingAddress === request.address}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                        title="Approve"
                      >
                        {processingAddress === request.address ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <Check className="w-5 h-5" strokeWidth={2.5} />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      
                      {/* Reject Button with X Icon */}
                      <button
                        onClick={() => handleReject(request.address)}
                        disabled={processingAddress === request.address}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                        title="Reject"
                      >
                        {processingAddress === request.address ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <Xmark className="w-5 h-5" strokeWidth={2.5} />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Experiences Section */}
        {approvedRequests.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-bold text-[#1f1f1f] mb-4">Approved Participants</h2>
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <div
                  key={request.address}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Image */}
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
                    <h3 className="text-lg font-bold text-[#1f1f1f] mb-2">{experience.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                      <span className="text-sm text-[#757683]">
                        Approved: {request.address.slice(0, 6)}...{request.address.slice(-4)}
                      </span>
                    </div>
                    <p className="text-sm text-[#757683] mb-4 line-clamp-2">{experience.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="w-4 h-4 text-[#1f1f1f]" strokeWidth={2} />
                      <span className="text-sm text-[#1f1f1f]">{experience.location}</span>
                    </div>
                    <button
                      disabled
                      className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
                    >
                      Approved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingRequests.length === 0 && approvedRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-[#757683] text-center">No join requests yet</p>
          </div>
        )}
      </Page.Main>

      <Navigation />
    </Page>
  );
}

