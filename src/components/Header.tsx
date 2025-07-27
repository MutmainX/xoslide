import Link from "next/link";
import { Button } from "./ui/button";
import { Presentation, PlusCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Presentation className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">
              Xoslide
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/create" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
