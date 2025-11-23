'use client';

import { getAllExperiencesAddresses } from '@/lib/contractUtils';
import { useState } from 'react';

export function ContractDebugger() {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testContract = async () => {
    setLoading(true);
    setDebugInfo('Testing contract...\n');

    try {
      // Test: Call getAllExperiences
      try {
        setDebugInfo((prev) => prev + `Calling getAllExperiences...\n`);
        const addresses = await getAllExperiencesAddresses();
        setDebugInfo(
          (prev) =>
            prev +
            `✓ getAllExperiences call successful\nAddresses returned: ${addresses.length}\n${JSON.stringify(addresses, null, 2)}\n`
        );
      } catch (err) {
        setDebugInfo(
          (prev) =>
            prev + `✗ getAllExperiences call failed:\n${JSON.stringify(err, null, 2)}\n`
        );
      }
    } catch (error) {
      setDebugInfo((prev) => prev + `Error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Contract Debugger</h2>
      <button
        onClick={testContract}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Contract'}
      </button>
      <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96 border border-gray-300">
        {debugInfo || 'Click "Test Contract" to start debugging...'}
      </pre>
    </div>
  );
}
