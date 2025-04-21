import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Authentication() {
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
                <Button variant="ghost" className="text-[#17488D] hover:text-[#376ab1] font-inter font-bold">Sign Up</Button>
            </SignUpButton>
            <SignInButton mode="modal">
                <Button variant="ghost" className="text-[#17488D] hover:text-[#376ab1] font-inter font-bold">Log In</Button>
            </SignInButton>
        </>
      )}
    </div>
  )
  
  // return (
  //   <div className="flex items-center space-x-4">
  //     <Link href="/login">
  //       <Button variant="ghost" className="text-[#17488D] hover:text-[#376ab1] font-inter">
  //         Login
  //       </Button>
  //     </Link>
  //     <Link href="/signup">
  //       <Button
  //         variant="outline"
  //         className="text-white border-white hover:bg-white hover:text-primary-foreground font-inter"
  //       >
  //         Sign Up
  //       </Button>
  //     </Link>
  //   </div>
  // )
}

