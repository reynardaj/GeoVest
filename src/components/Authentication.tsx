import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Authentication() {
  const user = await currentUser();

  if (user) {
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    const lastSignInAt = user.lastSignInAt ? new Date(user.lastSignInAt) : null;

    const isFirstTimeSignIn = createdAt && lastSignInAt && createdAt.getTime() === lastSignInAt.getTime();

    if (isFirstTimeSignIn) {
      redirect("/form");
    } else {
      redirect("/dashboard");
    }
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
