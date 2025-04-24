import { Button } from "@/components/ui/button";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Authentication() {
  const { user, isLoaded } = useUser(); // Destructure `isLoaded` to check if the user session is ready

  if (!isLoaded) {
    return <div>Loading...</div>; // You can show a loading indicator while the user data is being fetched
  }

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <UserButton />
        </>
      ) : (
        <>
          <SignUpButton signInForceRedirectUrl="/form" mode="modal">
            <Button variant="ghost" className="text-current hover:text-gray-200 font-inter font-bold">Sign Up</Button>
          </SignUpButton>
          <SignInButton forceRedirectUrl="/dashboard" mode="modal">
            <Button variant="ghost" className="text-current hover:text-gray-200 font-inter font-bold">Log In</Button>
          </SignInButton>
        </>
      )}
    </div>
  );
}
