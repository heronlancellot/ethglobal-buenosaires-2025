import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { NOMAD_EXPERIENCE_ADDRESS, NOMAD_EXPERIENCE_ABI } from '@/contracts/constants';

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
