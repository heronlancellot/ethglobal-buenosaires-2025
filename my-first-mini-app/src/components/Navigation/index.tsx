'use client';

import { Compass, Calendar, Plus, Bell } from 'iconoir-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Marble } from '@worldcoin/mini-apps-ui-kit-react';

/**
 * Custom bottom navigation matching the design
 * Features: Compass (red), Calendar, Plus button (center, red), Bell with notification, Profile
 */

export const Navigation = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {/* Compass Icon - Red when active */}
        <button
          onClick={() => { setActiveTab('home'); router.push('/'); } }
          className="flex flex-col items-center justify-center p-2 transition-colors"
          aria-label="Home"
        >
          <Compass 
            className={`w-6 h-6 ${activeTab === 'home' ? 'text-[#db5852]' : 'text-[#757683]'}`} 
            strokeWidth={2} 
          />
        </button>

        {/* Calendar Icon */}
        <button
          onClick={() => { setActiveTab('calendar'); router.push('/calendar'); } }
          className="flex flex-col items-center justify-center p-2 transition-colors"
          aria-label="Calendar"
        >
          <Calendar 
            className={`w-6 h-6 ${activeTab === 'calendar' ? 'text-[#db5852]' : 'text-[#757683]'}`} 
            strokeWidth={2} 
          />
        </button>

        {/* Plus Button - Large, Red, Circular */}
        <button
          onClick={() => { setActiveTab('create-experience'); router.push('/create-experience'); } }
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#db5852] text-white shadow-lg hover:bg-[#c94a44] active:bg-[#b73d38] transition-colors"
          aria-label="Create"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Bell Icon with Notification Badge */}
        <button
          onClick={() => { setActiveTab('notifications'); router.push('/notifications'); } }
          className="relative flex flex-col items-center justify-center p-2 transition-colors"
          aria-label="Notifications"
        >
          <Bell 
            className={`w-6 h-6 ${activeTab === 'notifications' ? 'text-[#db5852]' : 'text-[#757683]'}`} 
            strokeWidth={2} 
          />
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#db5852] rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-[9px] font-bold leading-none">1</span>
          </span>
        </button>

        {/* Profile Picture */}
        <button
          onClick={() => { setActiveTab('profile'); router.push('/profile'); } }
          className="flex flex-col items-center justify-center p-2 transition-colors"
          aria-label="Profile"
        >
          {session?.user?.profilePictureUrl ? (
            <Marble 
              src={session.user.profilePictureUrl} 
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300" />
          )}
        </button>
      </div>
    </nav>
  );
};
