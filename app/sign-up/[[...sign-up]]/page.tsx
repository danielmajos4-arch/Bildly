import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none border-0 p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 min-h-[44px] rounded-xl transition-all",
    socialButtonsBlockButtonText: "font-medium",
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-500 text-sm",
    formFieldInput: "text-base min-h-[44px]",
    formButtonPrimary:
      "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 min-h-[44px] rounded-xl transition-all",
    footerActionLink: "text-emerald-600 hover:text-emerald-700 font-medium",
  },
} as const;

function SignUpBadges() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600 sm:mb-6 sm:text-sm">
      <div className="flex items-center gap-1.5">
        <svg
          className="h-4 w-4 shrink-0 text-emerald-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Free Forever</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg
          className="h-4 w-4 shrink-0 text-emerald-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>No Credit Card</span>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthPageShell
      title="Get started free"
      subtitle="Generate winning proposals in 30 seconds"
      beforeCard={<SignUpBadges />}
      footer={
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
      />
    </AuthPageShell>
  );
}
