import { cn } from "@/lib/utils";

const Loader = ({ className, text = "Loading..." }: { className?: string, text?: string }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-10", className)}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-lg font-medium text-primary">{text}</p>
    </div>
  );
};

export default Loader;
