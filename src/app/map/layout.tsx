<<<<<<< HEAD
function layout() {
  return (
    <div>
      
    </div>
  )
}

export default layout
=======
function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row w-full h-screen">
      {children}
    </div>
  );
}

export default layout;
>>>>>>> origin/map-interactive-map
