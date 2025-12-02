"use client";

import { useState, useEffect, useRef } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  GraduationCap,
  Crown,
  BookOpen,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { getProfile, getCourses, checkoutStandard, checkoutPremium } from "@/lib/api/auth";

interface StatCard {
  label: string;
  value: string;
  icon: ElementType;
  caption?: string;
  accentColor: string;
}

interface CourseCard {
  id: string;
  title: string;
  link?: string;
}

const COURSE_NAMES: Record<string, string> = {
  "cmhxa9lro0000qe3ctmwl2vb2": "Discovering the Science of Emotions: What Every Parent of a Teen Should Know",
  "cmhxa9lrq0001qe3ctd3xmqo0": "Helping Teens Thrive: Emotional Intelligence for Parents",
  "cmhxa9lrq0002qe3cmeq9p72i": "Parent Wellness & Positive Role Modeling for Teens",
  "cmhxa9lrr0003qe3cbtbwhpx4": "Supporting Teen Emotional Expression: A Guide for Parents",
  "cmhxa9lrr0004qe3c8zg468x5": "Supporting Teen Emotional Expression: A Guide for Parents",
  "cmhxa9lrr0005qe3c7zdz9qnk": "Strengthening Emotional Bonds with Your Teen: A Parent's Guide",
};

export default function Dashboard() {
  const { clinician, accessToken, _hasHydrated, setAuth } = useAuthStore();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [activeTab, setActiveTab] = useState<"purchased" | "trending">(
    "purchased"
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [purchasedCourses, setPurchasedCourses] = useState<CourseCard[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<CourseCard[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseCard | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyPlanType, setBuyPlanType] = useState<"standard" | "premium" | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isStandardPaid, setIsStandardPaid] = useState(false);
  const [isPremiumPaid, setIsPremiumPaid] = useState(false);

  // Suppress cross-origin security errors from iframe
  useEffect(() => {
    const originalError = window.console.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.console.error = (...args: any[]) => {
      const errorMsg = args.join(' ');
      if (
        errorMsg.includes('cross-origin') || 
        errorMsg.includes('SecurityError') ||
        errorMsg.includes('CommitData') ||
        errorMsg.includes('Blocked a frame')
      ) {
        // Silently ignore cross-origin errors from course iframes
        return;
      }
      originalError.apply(console, args);
    };

    // Also suppress unhandled promise rejections from ServiceWorker
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('ServiceWorker') ||
        event.reason?.message?.includes('cross-origin') ||
        event.reason?.message?.includes('SecurityError')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.console.error = originalError;
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    if (_hasHydrated && !accessToken && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/signup");
    }
  }, [accessToken, _hasHydrated, router]);

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
            refreshToken: refreshToken || "",
            clinician: profileData,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // If profile fetch fails, don't redirect - just log the error
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [accessToken, _hasHydrated, setAuth]);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      if (!accessToken || !_hasHydrated) return;

      setIsLoadingCourses(true);
      try {
        const coursesData = await getCourses(accessToken);
        
        // Store payment status
        setIsStandardPaid(coursesData.isStandardPaid);
        setIsPremiumPaid(coursesData.isPremiumPaid);
        
        const SINGLE_COURSE_URL = "https://kanakk365.github.io/zenomi-course/";
        const SINGLE_COURSE_ID = "zenomi-course";
        const SINGLE_COURSE_TITLE = "Zenomi Course";
        
        if (coursesData.isStandardPaid || coursesData.isPremiumPaid) {
          const singleCourse: CourseCard = {
            id: SINGLE_COURSE_ID,
            title: SINGLE_COURSE_TITLE,
            link: SINGLE_COURSE_URL,
          };
          setPurchasedCourses([singleCourse]);
          setTrendingCourses([singleCourse]);
        } else {
          const purchased = coursesData.courses.map(course => ({
            id: course.id,
            title: COURSE_NAMES[course.id] || course.name || "Untitled Course",
            link: course.link,
          }));

          const trending = coursesData.allCourses.map(course => ({
            id: course.id,
            title: COURSE_NAMES[course.id] || course.name || "Untitled Course",
          }));

          setPurchasedCourses(purchased);
          setTrendingCourses(trending);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [accessToken, _hasHydrated]);

  const handleCourseClick = (course: CourseCard) => {
    if (course.link) {
      setSelectedCourse(course);
    }
  };

  const getCourseUrl = (link: string) => {
    // Return the direct link - errors are suppressed at the parent level
    return link;
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  const handleBuyClick = (planType: "standard" | "premium") => {
    setBuyPlanType(planType);
    setShowBuyModal(true);
    if (planType === "standard") {
      setSelectedCourseIds([]);
    }
  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setBuyPlanType(null);
    setSelectedCourseIds([]);
  };

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleCheckout = async () => {
    if (!accessToken) return;

    setIsProcessingCheckout(true);
    try {
      let response;
      if (buyPlanType === "standard") {
        if (selectedCourseIds.length === 0) {
          alert("Please select at least one course");
          setIsProcessingCheckout(false);
          return;
        }
        response = await checkoutStandard(accessToken, selectedCourseIds);
      } else {
        response = await checkoutPremium(accessToken);
      }

      // Open Stripe checkout in new tab
      window.open(response.url, '_blank');
      handleCloseBuyModal();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error instanceof Error ? error.message : "Checkout failed. Please try again.");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  if (!_hasHydrated || isLoadingProfile || isLoadingCourses) {
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
      label: "Total Courses Purchased",
      value: purchasedCourses.length.toString(),
      caption: "All-time access",
      icon: GraduationCap,
      accentColor: "bg-[#E3D6FF] text-[#704180]",
    },
    {
      label: "Available Courses",
      value: trendingCourses.length.toString(),
      caption: "Ready to explore",
      icon: BookOpen,
      accentColor: "bg-[#DFF3F0] text-[#218B75]",
    },
    {
      label: "Pro Annual Plan",
      value: "Pro",
      caption: "Upgrades available",
      icon: Crown,
      accentColor: "bg-[#FFF0D7] text-[#C58B27]",
    },
    {
      label: "Membership Duration",
      value: "Active",
      caption: "Premium access",
      icon: CalendarClock,
      accentColor: "bg-[#FFE5F1] text-[#D94875]",
    },
  ];

  const courses =
    activeTab === "purchased" ? purchasedCourses : trendingCourses;

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
                <p className="text-3xl font-semibold text-[#2C1B3A]">
                  {stat.value}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${stat.accentColor}`}
                >
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
              onClick={() => setActiveTab("purchased")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "purchased"
                  ? "bg-linear-to-r from-[#8B2D6C] to-[#704180] text-white"
                  : "text-[#8B2D6C]"
              }`}
            >
              Purchased Courses
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "trending"
                  ? "bg-linear-to-r from-[#8B2D6C] to-[#704180] text-white"
                  : "text-[#8B2D6C]"
              }`}
            >
              Trending courses
            </button>
          </div>

          {/* Buy Dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#8B2D6C] to-[#704180] px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
              Buy Courses
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleBuyClick("standard")}
                className="w-full text-left px-4 py-3 text-sm font-medium text-[#704180] hover:bg-[#F1E8FF] transition-colors rounded-t-xl"
              >
                Standard Plan
                <p className="text-xs text-[#8F82B0] mt-1">₹499 per course</p>
              </button>
              <button
                onClick={() => handleBuyClick("premium")}
                className="w-full text-left px-4 py-3 text-sm font-medium text-[#704180] hover:bg-[#F1E8FF] transition-colors rounded-b-xl"
              >
                Premium Plan
                <p className="text-xs text-[#8F82B0] mt-1">₹2,994 for all courses</p>
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.length === 0 ? (
            <p className="text-[#8F82B0] col-span-full text-center py-8">
              No courses available
            </p>
          ) : (
            courses.map((course) => (
              <article
                key={course.id}
                className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#8B2D6C] via-[#704180] to-[#4E2A66] p-6 text-white shadow-[0_12px_30px_rgba(112,65,128,0.25)] cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleCourseClick(course)}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35)_0%,transparent_55%)]" />
                </div>

                <div className="relative flex h-full flex-col gap-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                      Course
                    </p>
                    <h3 className="text-lg font-semibold leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <button className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10">
                    {course.link ? "Start Course" : "Coming Soon"} →
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Course Modal with Iframe */}
      {selectedCourse && selectedCourse.link && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-[#8B2D6C] to-[#704180]">
              <h2 className="text-xl font-semibold text-white truncate pr-4">
                {selectedCourse.title}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Iframe Container */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={getCourseUrl(selectedCourse.link)}
                className="w-full h-full border-0"
                title={selectedCourse.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-[#8B2D6C] to-[#704180]">
              <h2 className="text-2xl font-semibold text-white">
                {buyPlanType === "standard" ? "Standard Plan" : "Premium Plan"}
              </h2>
              <button
                onClick={handleCloseBuyModal}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {buyPlanType === "standard" ? (
                <>
                  <p className="text-[#53456B] mb-4">
                    Select the course you want to purchase (₹499):
                  </p>
                  <div className="space-y-3">
                    <label
                      className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#8B2D6C] transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes("zenomi-course")}
                        onChange={() => handleToggleCourse("zenomi-course")}
                        className="mt-1 w-5 h-5 text-[#8B2D6C] rounded focus:ring-[#8B2D6C]"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#2C1B3A]">Zenomi Course</p>
                        <p className="text-sm text-[#8F82B0] mt-1">₹499</p>
                      </div>
                    </label>
                  </div>
                  <div className="mt-6 p-4 bg-[#F1E8FF] rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#2C1B3A]">Total:</span>
                      <span className="text-2xl font-bold text-[#8B2D6C]">
                        ₹{selectedCourseIds.length * 499}
                      </span>
                    </div>
                    <p className="text-sm text-[#8F82B0] mt-1">
                      {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[#53456B] mb-4">
                    Get access to all {trendingCourses.length} courses with our Premium Plan!
                  </p>
                  <div className="space-y-3 mb-6">
                    {trendingCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-3 p-4 rounded-lg bg-[#F1E8FF]"
                      >
                        <svg className="w-6 h-6 text-[#8B2D6C] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="font-medium text-[#2C1B3A]">{course.title}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-linear-to-r from-[#8B2D6C] to-[#704180] rounded-lg text-white">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Premium Plan Total:</span>
                      <span className="text-2xl font-bold">₹2,994</span>
                    </div>
                    <p className="text-sm text-white/80 mt-1">
                      Save ₹{(trendingCourses.length * 499) - 2994} compared to individual purchases!
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseBuyModal}
                  className="px-6 py-2 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                  disabled={isProcessingCheckout}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout || (buyPlanType === "standard" && selectedCourseIds.length === 0)}
                  className="px-6 py-2 rounded-full bg-linear-to-r from-[#8B2D6C] to-[#704180] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingCheckout ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
