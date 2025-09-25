import { useEffect, useRef, useState } from 'react';
import { PostCard } from './PostCard';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';

interface PostCardWithTrackingProps {
  post: any;
  currentUserId?: string;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onSaveStrategy: (post: any) => void;
  onReport: (postId: string) => void;
}

export const PostCardWithTracking = (props: PostCardWithTrackingProps) => {
  const { trackView, trackDwellTime } = useInteractionTracking();
  const [hasViewed, setHasViewed] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Post came into view
            if (!hasViewed) {
              trackView(props.post.id);
              setHasViewed(true);
            }
            setViewStartTime(Date.now());
          } else {
            // Post left view
            if (viewStartTime) {
              const dwellTime = (Date.now() - viewStartTime) / 1000;
              trackDwellTime(props.post.id, dwellTime);
              setViewStartTime(null);
            }
          }
        });
      },
      {
        threshold: 0.5, // 50% of post must be visible
        rootMargin: '0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      // Track final dwell time if component unmounts while viewing
      if (viewStartTime) {
        const dwellTime = (Date.now() - viewStartTime) / 1000;
        trackDwellTime(props.post.id, dwellTime);
      }
    };
  }, [props.post.id, hasViewed, viewStartTime, trackView, trackDwellTime]);

  return (
    <div ref={cardRef}>
      <PostCard {...props} />
    </div>
  );
};