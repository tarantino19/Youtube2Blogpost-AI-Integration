import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

// Simple unicorn SVG for extra flair
const UnicornSVG = () => (
  <>
    <span
      className="block mx-auto mb-2"
      aria-label="Unicorn"
      style={{ width: 64, height: 64 }}
    >
      {/* SVG from https://openmoji.org/library/emoji-1F984/ */}
      <svg width="64" height="64" viewBox="0 0 72 72" fill="none">
        <ellipse cx="36" cy="36" rx="36" ry="36" fill="#E9D5FF" />
        <path
          d="M20 40c0-8 8-14 16-14s16 6 16 14-8 14-16 14-16-6-16-14z"
          fill="#F3E8FF"
        />
        <path d="M36 26c2-8 8-14 8-14s-2 8-8 14z" fill="#A7F3D0" />
        <ellipse cx="36" cy="44" rx="10" ry="8" fill="#C7D2FE" />
        <circle cx="36" cy="44" r="3" fill="#fff" />
        <ellipse cx="28" cy="44" rx="2" ry="1.5" fill="#fff" />
        <ellipse cx="44" cy="44" rx="2" ry="1.5" fill="#fff" />
      </svg>
    </span>
  </>
);

export function ErrorPage() {
  const error = useRouteError() as any;

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{
        background: "#F3E8FF", // soft pastel lavender
      }}
    >
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <UnicornSVG />
          <AlertTriangle className="mx-auto h-16 w-16 text-purple-400" />
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
            {error?.status === 404
              ? "Page Not Found"
              : "Oops! Something went wrong"}
          </h1>
          <p className="mt-2 text-lg text-gray-700 font-medium">
            {error?.status === 404
              ? "The page you're looking for doesn't exist."
              : error?.statusText ||
                error?.message ||
                "An unexpected error occurred in the land of unicorns."}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-purple-400 hover:bg-purple-500 transition-all duration-200"
            >
              <Home className="h-4 w-4 mr-2 text-white" />
              Back to Magical Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-4 py-2 border border-purple-200 text-sm font-semibold rounded-md text-purple-700 bg-white hover:bg-purple-50 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && error?.stack && (
          <div className="mt-8">
            <details className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <summary className="cursor-pointer text-sm font-semibold text-purple-600">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {error.stack}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
