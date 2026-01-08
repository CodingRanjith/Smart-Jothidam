const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-primary font-heading text-lg">Calculating your Josiyam...</p>
      <p className="text-gray-600 text-sm">Please wait while we analyze your birth details</p>
    </div>
  );
};

export default Loader;
