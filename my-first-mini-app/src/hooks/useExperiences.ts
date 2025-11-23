import { getAllExperiencesAddresses } from '@/lib/contractUtils';
import { useEffect, useState } from 'react';

export interface Experience {
  id: number;
  creator: string;
  title: string;
  description: string;
  coverImage: string;
  startTime: bigint;
  endTime: bigint;
  location: string;
  price: bigint;
  maxParticipants: bigint;
  canceled: boolean;
  participantCount: bigint;
  rating?: number;
}

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all experiences (already includes details)
        const experiencesData = await getAllExperiencesAddresses();

        if (!experiencesData || experiencesData.length === 0) {
          console.log('No experiences found');
          setExperiences([]);
          return;
        }

        setExperiences(experiencesData);
      } catch (err) {
        console.error('Error fetching experiences:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return { experiences, loading, error };
}
