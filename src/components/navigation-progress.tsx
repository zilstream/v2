import { NProgress } from "@tanem/react-nprogress";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function NavigationProgress() {
  const _pathname = useLocation({ select: (s) => s.pathname });
  const _searchParams = useLocation({
    select: (s) => new URLSearchParams(s.searchStr),
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NProgress isAnimating={isAnimating}>
      {({ isFinished, progress, animationDuration }) => (
        <div
          style={{
            opacity: isFinished ? 0 : 1,
            pointerEvents: "none",
            transition: `opacity ${animationDuration}ms linear`,
          }}
        >
          <div
            style={{
              background: "oklch(0.7659 0.1255 189.6403)",
              height: 2,
              left: 0,
              marginLeft: `${(-1 + progress) * 100}%`,
              position: "fixed",
              top: 0,
              transition: `margin-left ${animationDuration}ms linear`,
              width: "100%",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                boxShadow:
                  "0 0 10px oklch(0.7659 0.1255 189.6403), 0 0 5px oklch(0.7659 0.1255 189.6403)",
                display: "block",
                height: "100%",
                opacity: 1,
                position: "absolute",
                right: 0,
                transform: "rotate(3deg) translate(0px, -4px)",
                width: 100,
              }}
            />
          </div>
        </div>
      )}
    </NProgress>
  );
}
