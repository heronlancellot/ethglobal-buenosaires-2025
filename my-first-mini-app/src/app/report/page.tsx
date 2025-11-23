'use client';

import { Page } from '@/components/PageLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WarningTriangle } from 'iconoir-react';
import Image from 'next/image';
import NomadBad from '@/assets/NOMADBAD.svg';

interface ReportFormData {
  experienceName: string;
  whatHappened: string;
  typeOfIssue: string;
  attachEvidence: string;
  contactEmail: string;
}

export default function ReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ReportFormData>({
    experienceName: '',
    whatHappened: '',
    typeOfIssue: '',
    attachEvidence: '',
    contactEmail: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ReportFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ReportFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReportFormData, string>> = {};

    if (!formData.experienceName.trim()) {
      newErrors.experienceName = 'Experience name is required';
    }
    if (!formData.whatHappened.trim()) {
      newErrors.whatHappened = 'Please describe what happened';
    }
    if (!formData.typeOfIssue.trim()) {
      newErrors.typeOfIssue = 'Type of issue is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to submit report
      console.log('Submitting report:', formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      alert('Report submitted successfully! We will review it and get back to you.');
      router.push('/calendar');
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page className="bg-[#163545]">

      <Page.Main className="pb-28 px-4 py-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-4">Oh no!</h1>
          <div className="flex items-start justify-center gap-3 mb-6 px-2">
            <p className="text-white text-sm leading-relaxed max-w-[240px] text-center">
              This isn&apos;t the experience we aim for. Tell us what happened so we can fix it.
            </p>
            {/* Sad Sun Illustration */}
            <div className="flex-shrink-0 mt-1">
              <Image src={NomadBad} alt="Nomad Bad" width={100} height={100} />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-6 space-y-5 max-w-full">
          {/* Experience Name */}
          <div>
            <label htmlFor="experienceName" className="block text-sm font-medium text-[#757683] mb-2">
              Experience Name <span className="text-[#db5852]">*</span>
            </label>
            <input
              type="text"
              id="experienceName"
              name="experienceName"
              value={formData.experienceName}
              onChange={handleInputChange}
              placeholder="Enter experience name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.experienceName ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
            />
            {errors.experienceName && (
              <p className="mt-1 text-sm text-red-500">{errors.experienceName}</p>
            )}
          </div>

          {/* What Happened? */}
          <div>
            <label htmlFor="whatHappened" className="block text-sm font-medium text-[#757683] mb-2">
              What Happened? <span className="text-[#db5852]">*</span>
            </label>
            <textarea
              id="whatHappened"
              name="whatHappened"
              value={formData.whatHappened}
              onChange={handleInputChange}
              placeholder="Describe what happened..."
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.whatHappened ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f] resize-none`}
            />
            {errors.whatHappened && (
              <p className="mt-1 text-sm text-red-500">{errors.whatHappened}</p>
            )}
          </div>

          {/* Type of Issue */}
          <div>
            <label htmlFor="typeOfIssue" className="block text-sm font-medium text-[#757683] mb-2">
              Type of Issue <span className="text-[#db5852]">*</span>
            </label>
            <input
              type="text"
              id="typeOfIssue"
              name="typeOfIssue"
              value={formData.typeOfIssue}
              onChange={handleInputChange}
              placeholder=""
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.typeOfIssue ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]`}
            />
            {errors.typeOfIssue && (
              <p className="mt-1 text-sm text-red-500">{errors.typeOfIssue}</p>
            )}
          </div>

          {/* Attach Evidence */}
          <div>
            <label htmlFor="attachEvidence" className="block text-sm font-medium text-[#757683] mb-2">
              Attach Evidence <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              id="attachEvidence"
              name="attachEvidence"
              value={formData.attachEvidence}
              onChange={handleInputChange}
              placeholder="Enter file URL or description"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]"
            />
            <p className="mt-1 text-xs text-[#757683]">
              You can provide image URLs or links to evidence
            </p>
          </div>

          {/* Contact E-mail */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-[#757683] mb-2">
              Contact E-mail
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#db5852] focus:border-transparent text-[#1f1f1f]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Warning Icon at bottom */}
        <div className="flex justify-center mt-6">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <WarningTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </Page.Main>
    </Page>
  );
}

