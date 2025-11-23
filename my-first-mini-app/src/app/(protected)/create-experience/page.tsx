'use client';

import { NOMAD_EXPERIENCE_ADDRESS, NOMAD_EXPERIENCE_ABI } from '@/contracts/constants';
import { Page } from '@/components/PageLayout';
import { Button, LiveFeedback, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { Pin, Calendar } from 'iconoir-react';
import { useRouter } from 'next/navigation';

interface FormData {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: string;
  price: string;
  coverImage: string;
}

export default function CreateExperiencePage() {
  const router = useRouter();
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [transactionId, setTransactionId] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    price: '',
    coverImage: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
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
          // Redirect to home after success
          router.push('/home');
        }, 2000);
      } else if (isError) {
        console.error('Transaction failed:', error);
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
          setTransactionId('');
        }, 3000);
      }
    }
  }, [isConfirmed, isConfirming, isError, error, transactionId, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Experience name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start date/time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End date/time is required';
    }
    if (!formData.maxParticipants || Number(formData.maxParticipants) <= 0) {
      newErrors.maxParticipants = 'Valid number of participants is required';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.coverImage.trim()) {
      newErrors.coverImage = 'Cover image URL is required';
    }

    // Validate dates
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCreateExperience = async () => {
    if (!validateForm()) {
      return;
    }

    setTransactionId('');
    setButtonState('pending');

    try {
      // Convert form data to contract format
      const startTimestamp = BigInt(Math.floor(new Date(formData.startTime).getTime() / 1000));
      const endTimestamp = BigInt(Math.floor(new Date(formData.endTime).getTime() / 1000));
      const priceInWei = BigInt(Math.floor(Number(formData.price) * 10 ** 18));
      const maxParticipants = BigInt(formData.maxParticipants);

      console.log('Creating experience with data:', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startTime: startTimestamp.toString(),
        endTime: endTimestamp.toString(),
        price: priceInWei.toString(),
        maxParticipants: maxParticipants.toString(),
        coverImage: formData.coverImage,
      });

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: NOMAD_EXPERIENCE_ADDRESS,
            abi: NOMAD_EXPERIENCE_ABI,
            functionName: 'createExperience',
            args: [
              formData.title,
              formData.description,
              formData.coverImage,
              startTimestamp,
              endTimestamp,
              formData.location,
              priceInWei,
              maxParticipants,
            ],
          },
        ],
      });

      console.log('Transaction response:', finalPayload);
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

      <Page.Main className="pb-28">
        <div className="w-full max-w-2xl mx-auto px-4 py-6">
          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6">
            {/* Experience Name */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#757683] mb-2">
                Experience Name <span className="text-[#db5852]">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter experience name"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#757683] mb-2">
                Description <span className="text-[#db5852]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your experience..."
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f] resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#757683] mb-2">
                Location <span className="text-[#db5852]">*</span>
              </label>
              <div className="relative">
                <Pin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757683]" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.location ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Start and End Date/Time */}
            <div>
              <label className="block text-sm font-medium text-[#757683] mb-2">
                Start and end date/time <span className="text-[#db5852]">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757683]" />
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.startTime ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
                  )}
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757683]" />
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.endTime ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Number of Participants */}
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-[#757683] mb-2">
                Number of participants <span className="text-[#db5852]">*</span>
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="Enter max number of participants"
                min="1"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.maxParticipants ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-500">{errors.maxParticipants}</p>
              )}
            </div>

            {/* Experience Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-[#757683] mb-2">
                Experience price per person <span className="text-[#db5852]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757683]">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                    errors.price ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Upload Pictures */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-[#757683] mb-2">
                Upload pictures <span className="text-[#db5852]">*</span>
              </label>
              <textarea
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                placeholder="Enter image URL (e.g., https://images.unsplash.com/photo-...)"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.coverImage ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f] resize-none`}
              />
              {errors.coverImage && (
                <p className="mt-1 text-sm text-red-500">{errors.coverImage}</p>
              )}
              <p className="mt-1 text-xs text-[#757683]">
                For now, please enter an image URL. File upload will be available soon.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
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
                  Post your experience!
                </Button>
              </LiveFeedback>
            </div>
          </div>
        </div>
      </Page.Main>
    </>
  );
}
