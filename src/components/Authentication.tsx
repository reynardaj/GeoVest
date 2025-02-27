import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

async function Authentication() {
  const user = await currentUser();

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <UserButton />
        </>
      ) : (
        <>
            <SignUpButton mode="modal">
                <Button variant="ghost"><p className="font-inter font-bold text-[16px] leading-[19.36px] tracking-[0]">Sign Up</p></Button>
            </SignUpButton>
            <SignInButton mode="modal">
                <Button variant="ghost"><p className="font-inter font-bold text-[16px] leading-[19.36px] tracking-[0]">Log In</p></Button>
            </SignInButton>
        </>
      )}
    </div>
  );
}
export default Authentication;