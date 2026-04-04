import Image from "next/image";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  beforeCard?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPageShell({
  title,
  subtitle,
  beforeCard,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-white via-emerald-50/30 to-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-1 flex-col justify-center py-8 sm:py-10 md:py-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <header className="mb-6 flex flex-col items-center text-center sm:mb-8">
            <div className="mb-4 flex w-full justify-center sm:mb-5">
              <div className="relative mx-auto h-20 w-full max-w-[260px] sm:h-24 sm:max-w-[300px] md:h-28 md:max-w-[320px]">
                <Image
                  src="/bidly-logo.png"
                  alt="Bidly"
                  fill
                  className="object-contain object-center"
                  priority
                  sizes="(max-width: 640px) 260px, 320px"
                />
              </div>
            </div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-gray-600 sm:text-base">
              {subtitle}
            </p>
          </header>

          {beforeCard}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            {children}
          </div>

          <div className="mt-6 text-center sm:mt-8">{footer}</div>
        </div>
      </div>
    </div>
  );
}
