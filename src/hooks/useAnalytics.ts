import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  trackPageView,
  trackEvent,
  trackCourseView,
  trackSearch,
  trackFilter,
  trackApplyClick,
  trackSignupStart,
  trackSignupComplete,
  trackApplicationStart,
  trackApplicationComplete,
  trackPaymentStart,
  trackPaymentSuccess,
  trackPaymentFailure,
  trackPaymentAbandoned,
  trackContactSubmission,
  trackSyllabusRequest,
} from "../services/analytics";
import type { AnalyticsEventType } from "../services/analytics";

/**
 * Hook for automated page view tracking on route changes, plus convenient event dispatchers.
 */
export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return {
    trackEvent: (type: AnalyticsEventType, payload?: Record<string, any>) => trackEvent(type, payload),
    trackCourseView,
    trackSearch,
    trackFilter,
    trackApplyClick,
    trackSignupStart,
    trackSignupComplete,
    trackApplicationStart,
    trackApplicationComplete,
    trackPaymentStart,
    trackPaymentSuccess,
    trackPaymentFailure,
    trackPaymentAbandoned,
    trackContactSubmission,
    trackSyllabusRequest,
  };
}
