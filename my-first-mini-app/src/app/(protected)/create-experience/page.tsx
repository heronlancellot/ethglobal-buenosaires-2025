'use client';

import { NOMAD_EXPERIENCE_ADDRESS, NOMAD_EXPERIENCE_ABI } from '@/contracts/constants';
import { Page } from '@/components/PageLayout';
import { Button, LiveFeedback, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';

export default function CreateExperiencePage() {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [transactionId, setTransactionId] = useState<string>('');

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public	'),
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
    error,
  } = useWaitForTransactionReceipt({
    client: client,
    appConfig: {
      app_id: process.env.NEXT_PUBLIC_WLD_CLIENT_ID as `app_${string}`,
    },
    transactionId: transactionId,
  });

  useEffect(() => {
    if (transactionId && !isConfirming) {
      if (isConfirmed) {
        console.log('Transaction confirmed!');
        setButtonState('success');
        setTimeout(() => {
          setButtonState(undefined);
          setTransactionId('');
        }, 3000);
      } else if (isError) {
        console.error('Transaction failed:', error);
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
          setTransactionId('');
        }, 3000);
      }
    }
  }, [isConfirmed, isConfirming, isError, error, transactionId]);

  const handleCreateExperience = async () => {
    setTransactionId('');
    setButtonState('pending');

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: NOMAD_EXPERIENCE_ADDRESS,
            abi: NOMAD_EXPERIENCE_ABI,
            functionName: 'createExperience',
            args: [
              'Test Experience',
              'This is a test experience',
              'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop',
              BigInt(1763866544),
              BigInt(9999999999),
              'Buenos Aires',
              BigInt(0.0000000001 * 10 ** 18),
              BigInt(50),
            ],
          },
        ],
      
      });


      console.log('finalPayload', finalPayload);
      if (finalPayload.status === 'success') {
        console.log(
          'Transaction submitted, waiting for confirmation:',
          finalPayload.transaction_id,
        );
        setTransactionId(finalPayload.transaction_id);
      } else {
        console.error('Transaction submission failed:', finalPayload);
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending transaction:', err);
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  return (
    <>
      <Page.Header className="p-0">
        <TopBar title="Criar Experiência" />
      </Page.Header>

      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <div className="w-full max-w-md px-4 py-8">
          <LiveFeedback
            label={{
              failed: 'Falha ao criar experiência',
              pending: 'Criando experiência...',
              success: 'Experiência criada com sucesso!',
            }}
            state={buttonState}
            className="w-full"
          >
            <Button
              onClick={handleCreateExperience}
              disabled={buttonState === 'pending'}
              size="lg"
              variant="primary"
              className="w-full"
            >
              Criar Experiência
            </Button>
          </LiveFeedback>
        </div>
      </Page.Main>
    </>
  );
}
