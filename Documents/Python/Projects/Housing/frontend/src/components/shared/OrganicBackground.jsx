const OrganicBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated blobs - Orange theme */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-400/40 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400/40 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/40 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Large gradient orbs with radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/20 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
    </div>
  );
};

export default OrganicBackground;

