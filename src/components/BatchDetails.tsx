
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, BookOpen, Trophy, Clock } from 'lucide-react';

interface Batch {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

interface BatchDetailsProps {
  batch: Batch;
  onBack: () => void;
  onEnroll: (batchId: string) => void;
  isEnrolled: boolean;
}

const BatchDetails = ({ batch, onBack, onEnroll, isEnrolled }: BatchDetailsProps) => {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="outline"
        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Batches
      </Button>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {batch.image_url && (
              <div className="w-full md:w-1/3">
                <img
                  src={batch.image_url}
                  alt={batch.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">{batch.title}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base mb-4">
                {batch.description}
              </CardDescription>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>Comprehensive Training</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Lifetime Access</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-1" />
                  <span>Expert Guidance</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-[#e3bd30] mb-2">
                  {formatPrice(batch.price)}
                </div>
                <p className="text-gray-600 dark:text-gray-400">One-time payment • Lifetime access</p>
              </div>
              
              {!isEnrolled ? (
                <Button
                  onClick={() => onEnroll(batch.id)}
                  className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold px-8 py-3 text-lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Enroll Now
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold px-8 py-3 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Continue Learning
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What's Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#e3bd30] rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-400">Video Lessons</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#e3bd30] rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-400">Workout Plans</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#e3bd30] rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-400">Nutrition Guides</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#e3bd30] rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-400">Progress Tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#e3bd30] rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-400">Expert Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#e3bd30] rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-400">Lifetime Access</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchDetails;
