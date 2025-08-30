export default function LandingPage() {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Welcome to the Second Page!</h1>
        <p>This is a new route using the App Router.</p>
        <div className="min-h-screen text-white font-sans flex flex-col relative overflow-x-hidden overflow-y-auto">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
          >
            <source src="/video/vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }
  