import { SignIn } from "@clerk/nextjs";
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
    identityPreviewEditButton: "text-emerald-600",
  },
} as const;

export default function SignInPage() {
  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to continue winning proposals"
      footer={
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Sign up free
          </Link>
        </p>
      }
    >
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </AuthPageShell>
  );
}
