'use client';

import { useState, useEffect } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  GraduationCap,
  Crown,
  BarChart3,
  BookOpen,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { getProfile } from '@/lib/api/auth';

interface StatCard {
  label: string;
  value: string;
  icon: ElementType;
  caption?: string;
  accentColor: string;
}

interface CourseCard {
  id: string;
  category: string;
  title: string;
  progress: number;
  enrolled: number;
}

export default function Dashboard() {
  const { clinician, accessToken, _hasHydrated, setAuth } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'purchased' | 'trending'>('purchased');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    if (_hasHydrated && (!accessToken || !clinician)) {
      router.push('/signup');
    }
  }, [accessToken, clinician, _hasHydrated, router]);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken || !_hasHydrated) return;

      setIsLoadingProfile(true);
      try {
        const profileData = await getProfile(accessToken);
        // Update the store with fresh profile data
        if (accessToken) {
          const { refreshToken } = useAuthStore.getState();
          setAuth({
            accessToken,
            refreshToken: refreshToken || '',
            clinician: profileData,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // If profile fetch fails, don't redirect - just log the error
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [accessToken, _hasHydrated, setAuth]);

  if (!_hasHydrated || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0F8]">
        <div className="text-xl text-[#704180]">Loading your dashboard...</div>
      </div>
    );
  }

  if (!clinician) {
    return null;
  }

  const stats: StatCard[] = [
    {
      label: 'Total Courses Purchased',
      value: '12',
      caption: 'All-time access',
      icon: GraduationCap,
      accentColor: 'bg-[#E3D6FF] text-[#704180]',
    },
    {
      label: 'Active Courses',
      value: '68',
      caption: 'Currently in progress',
      icon: BookOpen,
      accentColor: 'bg-[#DFF3F0] text-[#218B75]',
    },
    {
      label: 'Pro Annual Plan',
      value: 'Pro',
      caption: 'Upgrades available',
      icon: Crown,
      accentColor: 'bg-[#FFF0D7] text-[#C58B27]',
    },
    {
      label: 'Membership Duration',
      value: '6 months',
      caption: 'Next renewal on Oct 14',
      icon: CalendarClock,
      accentColor: 'bg-[#FFE5F1] text-[#D94875]',
    },
  ];

  const purchasedCourses: CourseCard[] = [
    {
      id: 'course-1',
      category: 'Mental Health',
      title: 'Understanding Psychology: Cognitive Therapy Basics',
      progress: 26,
      enrolled: 26,
    },
    {
      id: 'course-2',
      category: 'Mental Health',
      title: 'Understanding Psychology: Mindfulness in Practice',
      progress: 14,
      enrolled: 14,
    },
    {
      id: 'course-3',
      category: 'Mental Health',
      title: 'Understanding Psychology: Cognitive Behaviour Techniques',
      progress: 60,
      enrolled: 60,
    },
  ];

  const trendingCourses: CourseCard[] = [
    {
      id: 'course-4',
      category: 'Child Development',
      title: 'Neurodevelopmental Milestones: Assessment & Intervention',
      progress: 0,
      enrolled: 82,
    },
    {
      id: 'course-5',
      category: 'Behavioural Science',
      title: 'Motivational Interviewing for Young Patients',
      progress: 0,
      enrolled: 71,
    },
    {
      id: 'course-6',
      category: 'Assessment',
      title: 'Early Childhood Screening: Practical Framework',
      progress: 0,
      enrolled: 64,
    },
  ];

  const courses = activeTab === 'purchased' ? purchasedCourses : trendingCourses;

  return (
    <div className="flex w-full flex-col gap-10">
            <section className="space-y-3">
              <p className="text-lg font-medium text-[#53456B]">
                Hello, <span className="font-semibold">{clinician.ownerName}</span> 👋
              </p>
              <h1 className="text-3xl font-semibold text-[#2C1B3A]">
                How can I help you today?
              </h1>
            </section>

            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-3xl bg-white p-6 shadow-[0_6px_24px_rgba(112,65,128,0.08)] transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#8F82B0]">
                        {stat.label}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-3xl font-semibold text-[#2C1B3A]">{stat.value}</p>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${stat.accentColor}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="space-y-6 rounded-3xl bg-white p-6 shadow-[0_6px_24px_rgba(112,65,128,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 rounded-full bg-[#F1E8FF] p-1">
                  <button
                    onClick={() => setActiveTab('purchased')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === 'purchased'
                        ? 'bg-linear-to-r from-[#8B2D6C] to-[#704180] text-white'
                        : 'text-[#8B2D6C]'
                    }`}
                  >
                    Purchased Courses
                  </button>
                  <button
                    onClick={() => setActiveTab('trending')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === 'trending'
                        ? 'bg-linear-to-r from-[#8B2D6C] to-[#704180] text-white'
                        : 'text-[#8B2D6C]'
                    }`}
                  >
                    Trending courses
                  </button>
                </div>

                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8B2D6C]/20 px-4 py-2 text-sm font-semibold text-[#8B2D6C] transition-colors hover:bg-[#F1E8FF]"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Plans
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#8B2D6C] via-[#704180] to-[#4E2A66] p-6 text-white shadow-[0_12px_30px_rgba(112,65,128,0.25)]"
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35)_0%,transparent_55%)]" />
                    </div>

                    <div className="relative flex h-full flex-col gap-5">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                          Category · {course.category}
                        </p>
                        <h3 className="text-lg font-semibold leading-snug">
                          {course.title}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-medium text-white/80">
                          {course.enrolled}% Enrolled
                        </p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-[#FFD166] via-[#FF9F1C] to-[#FF7F50]"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <button className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10">
                        Continue →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
    </div>
  );
}