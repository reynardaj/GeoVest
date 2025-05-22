// components/Authentication.tsx
"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs"; // Import useUser hook

interface AuthenticationProps {
  isMobileMenu?: boolean;
}

export default function Authentication({ isMobileMenu }: AuthenticationProps) {
  const { isSignedIn } = useUser(); // Use the useUser hook to get the sign-in status

  if (isSignedIn) {
    return <UserButton />; // Render the UserButton when signed in
  }

  if (isMobileMenu) {
    return (
      <div className="flex flex-col space-y-4">
        <SignUpButton mode="modal" forceRedirectUrl="/form">
          <Button variant="ghost" className="text-[15px] block py-2 px-4 hover:bg-primary-600 transition-colors font-inter font-bold rounded-md w-full text-left">
            Sign Up
          </Button>
        </SignUpButton>
        <SignInButton mode="modal" forceRedirectUrl="/map">
          <Button variant="ghost" className="text-[15px] block py-2 px-4 hover:bg-primary-600 transition-colors font-inter font-bold rounded-md w-full text-left">
            Log In
          </Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <SignUpButton mode="modal" forceRedirectUrl="/form">
        <Button variant="ghost" className="text-current hover:text-gray-200 font-inter font-bold">
          Sign Up
        </Button>
      </SignUpButton>
      <SignInButton mode="modal">
        <Button variant="ghost" className="text-current hover:text-gray-200 font-inter font-bold">
          Log In
        </Button>
      </SignInButton>
    </div>
  );
}