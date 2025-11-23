import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { NOMAD_EXPERIENCE_ADDRESS, NOMAD_EXPERIENCE_ABI, NOMA_PROFILE_HUB_ADDRESS, NOMA_PROFILE_HUB_ABI } from '@/contracts/constants';

// Create a singleton public client
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
});

/**
 * Fetch all experiences from the Nomad Experience contract
 */
export async function getAllExperiencesAddresses() {
  try {
    console.log('Fetching all experiences from contract:', NOMAD_EXPERIENCE_ADDRESS);

    let count: bigint;

    try {
      count = (await publicClient.readContract({
        address: NOMAD_EXPERIENCE_ADDRESS,
        abi: NOMAD_EXPERIENCE_ABI,
        functionName: 'experienceCount',
      })) as bigint;
      console.log('Count:', count);
    } catch (err) {
      console.error('Error calling experienceCount. Contract may not be deployed or function may not exist:', err);
      // Return empty array if contract call fails
      return [];
    }

    const countNumber = Number(count);
    console.log('Experience count:', countNumber);

    if (countNumber === 0) {
      console.log('No experiences found');
      return [];
    }

    const experiences = [];

    // Fetch each experience one by one
    for (let i = 0; i < countNumber; i++) {
      try {
        const experience = (await publicClient.readContract({
          address: NOMAD_EXPERIENCE_ADDRESS,
          abi: NOMAD_EXPERIENCE_ABI,
          functionName: 'getExperience',
          args: [i],
        })) as readonly [
          string,
          string,
          string,
          string,
          bigint,
          bigint,
          string,
          bigint,
          bigint,
          boolean,
          bigint
        ];

        console.log('Experience:', experience);

        const [creator, title, description, coverImage, startTime, endTime, location, price, maxParticipants, canceled, participantCount] = experience;

        experiences.push({
          id: i,
          creator,
          title,
          description,
          coverImage,
          startTime,
          endTime,
          location,
          price,
          maxParticipants,
          canceled,
          participantCount,
        });

        console.log(`Fetched experience ${i}: ${title}`);
      } catch (err) {
        console.error(`Error fetching experience ${i}:`, err);
        // Continue to next experience if one fails
        continue;
      }
    }

    console.log('Fetched all experiences:', experiences);
    return experiences;
  } catch (error) {
    console.error('Error fetching experiences:', error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Fetch details for a single experience by ID
 */
export async function getExperienceDetails(experienceId: number) {
  try {
    const experience = (await publicClient.readContract({
      address: NOMAD_EXPERIENCE_ADDRESS,
      abi: NOMAD_EXPERIENCE_ABI,
      functionName: 'getExperience',
      args: [experienceId],
    })) as readonly [
      string,
      string,
      string,
      string,
      bigint,
      bigint,
      string,
      bigint,
      bigint,
      boolean,
      bigint
    ];

    const [creator, title, description, coverImage, startTime, endTime, location, price, maxParticipants, canceled, participantCount] = experience;

    return {
      id: experienceId,
      creator,
      title,
      description,
      coverImage,
      startTime,
      endTime,
      location,
      price,
      maxParticipants,
      canceled,
      participantCount,
    };
  } catch (error) {
    console.error(`Error fetching experience details for ID ${experienceId}:`, error);
    throw error;
  }
}

/**
 * Fetch join requests for an experience
 */
export async function getJoinRequests(experienceId: number) {
  try {
    const requests = (await publicClient.readContract({
      address: NOMAD_EXPERIENCE_ADDRESS,
      abi: NOMAD_EXPERIENCE_ABI,
      functionName: 'getJoinRequests',
      args: [experienceId],
    })) as readonly `0x${string}`[];

    return requests;
  } catch (error) {
    console.error(`Error fetching join requests for experience ${experienceId}:`, error);
    throw error;
  }
}

/**
 * Fetch approved participants for an experience
 */
export async function getParticipants(experienceId: number) {
  try {
    const participants = (await publicClient.readContract({
      address: NOMAD_EXPERIENCE_ADDRESS,
      abi: NOMAD_EXPERIENCE_ABI,
      functionName: 'getParticipants',
      args: [experienceId],
    })) as readonly `0x${string}`[];

    return participants;
  } catch (error) {
    console.error(`Error fetching participants for experience ${experienceId}:`, error);
    throw error;
  }
}

/**
 * Fetch approved experiences for a user
 */
export async function getUserApprovedExperiences(userAddress: string) {
  try {
    const experienceIds = (await publicClient.readContract({
      address: NOMAD_EXPERIENCE_ADDRESS,
      abi: NOMAD_EXPERIENCE_ABI,
      functionName: 'getUserApprovedExperiences',
      args: [userAddress as `0x${string}`],
    })) as readonly bigint[];

    return experienceIds.map((id) => Number(id));
  } catch (error) {
    console.error(`Error fetching approved experiences for user ${userAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch requested (pending) experiences for a user
 */
export async function getUserRequestedExperiences(userAddress: string) {
  try {
    const experienceIds = (await publicClient.readContract({
      address: NOMAD_EXPERIENCE_ADDRESS,
      abi: NOMAD_EXPERIENCE_ABI,
      functionName: 'getUserRequestedExperiences',
      args: [userAddress as `0x${string}`],
    })) as readonly bigint[];

    return experienceIds.map((id) => Number(id));
  } catch (error) {
    console.error(`Error fetching requested experiences for user ${userAddress}:`, error);
    throw error;
  }
}

/**
 * Check user status for an experience (approved, requested, or none)
 */
export async function getUserExperienceStatus(
  experienceId: number,
  userAddress: string
): Promise<'approved' | 'requested' | 'none'> {
  try {
    // Check if user is in approved participants
    const participants = await getParticipants(experienceId);
    const isApproved = participants.some(
      (addr) => addr.toLowerCase() === userAddress.toLowerCase()
    );

    if (isApproved) {
      return 'approved';
    }

    // Check if user has a pending join request
    const joinRequests = await getJoinRequests(experienceId);
    const hasRequest = joinRequests.some(
      (addr) => addr.toLowerCase() === userAddress.toLowerCase()
    );

    if (hasRequest) {
      return 'requested';
    }

    return 'none';
  } catch (error) {
    console.error(
      `Error checking user status for experience ${experienceId}:`,
      error
    );
    return 'none';
  }
}

/**
 * Fetch user profile data from NOMA Profile Hub
 */
export async function getUserProfile(userAddress: string) {
  try {
    const profile = (await publicClient.readContract({
      address: NOMA_PROFILE_HUB_ADDRESS,
      abi: NOMA_PROFILE_HUB_ABI,
      functionName: 'getProfile',
      args: [userAddress as `0x${string}`],
    })) as {
      exists: boolean;
      hostedCount: bigint;
      attendedCount: bigint;
      lastJoinedTimestamp: bigint;
      lastHostedTimestamp: bigint;
    };

    return {
      exists: profile.exists,
      hostedCount: Number(profile.hostedCount),
      attendedCount: Number(profile.attendedCount),
      lastJoinedTimestamp: Number(profile.lastJoinedTimestamp),
      lastHostedTimestamp: Number(profile.lastHostedTimestamp),
    };
  } catch (error) {
    console.error(`Error fetching profile for user ${userAddress}:`, error);
    // Return default values if profile doesn't exist or error occurs
    return {
      exists: false,
      hostedCount: 0,
      attendedCount: 0,
      lastJoinedTimestamp: 0,
      lastHostedTimestamp: 0,
    };
  }
}
