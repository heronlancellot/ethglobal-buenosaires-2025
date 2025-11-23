'use client';

import { Page } from '@/components/PageLayout';
import { EventList, Event } from '@/components/EventList';
import { SearchBar } from '@/components/SearchBar';
import { Navigation } from '@/components/Navigation';
import { LoginPage } from '@/components/LoginPage';
import { QrCode } from 'iconoir-react';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useExperiences } from '@/hooks/useExperiences';
import { formatUnits } from 'viem';

export default function HomePage() {
  const { data: session, status } = useSession();
  const { experiences, loading, error } = useExperiences();
  const [searchQuery, setSearchQuery] = useState('');

  // Convert blockchain experiences to UI events
  const events = useMemo(() => {
    return experiences.map((exp): Event => ({
      id: exp.id.toString(),
      title: exp.title,
      description: exp.description,
      organizer: exp.creator,
      organizerAvatar: undefined,
      price: `$${formatUnits(exp.price, 18)}`,
      rating: 4.5, // Default rating - can be fetched from separate contract if available
      image: exp.coverImage || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop',
      location: exp.location,
    }));
  }, [experiences]);

  // Filtered events based on search
  const filteredEvents = useMemo(() => {
    if (searchQuery.trim() === '') {
      return events;
    }
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  // Show login page if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#db5852]"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleJoinEvent = (eventId: string) => {
    console.log('Join event:', eventId);
    // Implementar lógica de participação no evento
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
    // Implementar lógica de filtros
  };

  return (
    <Page className="bg-white">
      <Page.Header className="bg-white pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-bold text-[#1f1f1f] leading-tight">
            Hello, Mikaele!
          </h1>
          <button
            className="text-[#db5852] hover:bg-gray-50 p-2 rounded-lg transition-colors"
            aria-label="QR Code"
          >
            <QrCode className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
        <SearchBar onSearch={handleSearch} onFilterClick={handleFilterClick} />
      </Page.Header>

      <Page.Main className="pb-28 bg-white px-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#db5852] mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando experiências...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
            <p className="text-red-800 font-medium">Erro ao carregar experiências</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Nenhuma experiência encontrada</p>
              </div>
            ) : (
              <EventList events={filteredEvents} onJoinEvent={handleJoinEvent} />
            )}
          </>
        )}
      </Page.Main>

      <Navigation />
    </Page>
  );
}
