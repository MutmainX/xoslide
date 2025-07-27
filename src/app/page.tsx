
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlideTemplate } from "@/components/templates/SlideTemplate";
import { ArrowRight, Clapperboard, Palette, PenSquare, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TEMPLATES } from "@/lib/constants";
import { type Slide } from "@/lib/types";

export default function Home() {
  const getTemplateSrc = (templateId: string) => {
    switch (templateId) {
      case 'dark-edge':
        return `https://storage.googleapis.com/fsm-aip-apps/assets/dark-edge.png`;
      case 'corporate-pitch':
        return `https://storage.googleapis.com/fsm-aip-apps/assets/corporate-pitch.png`;
      default:
        return `https://storage.googleapis.com/fsm-aip-apps/assets/classic-clean.png`;
    }
  }

  const classicCleanSlide: Slide = {
    id: "classic-clean-preview",
    title: "Dark Future of AI",
    bulletPoints: [
      "Rise of sentient machines",
      "Ethical dilemmas and choices",
      "Humanity's role in a new era",
    ],
  };

  const darkEdgeSlide: Slide = {
    id: "dark-edge-preview",
    title: "Why Mango tastes Good",
    bulletPoints: [
        "Sweet and juicy flavor profile",
        "Rich in vitamins and antioxidants",
    ],
  };

  const corporatePitchSlide: Slide = {
    id: "corporate-pitch-preview",
    title: "Influence of Marketing",
    bulletPoints: [
      "Building Brand Awareness",
      "Driving Customer Acquisition",
      "Measuring ROI and Success",
    ],
  };

  const visualFocusSlide: Slide = {
    id: "visual-focus-preview",
    title: "Journey to the Stars",
    bulletPoints: ["Galaxies Unveiled", "Nebulae in Motion"],
  };

  const techMinimalSlide: Slide = {
    id: "tech-minimal-preview",
    title: "Code Philosophy",
    bulletPoints: [
      "// Simplicity is key",
      "// Write clean code",
    ],
  };

  const hologramUiSlide: Slide = {
    id: "hologram-ui-preview",
    title: "Futuristic Hologram UI",
    bulletPoints: ["Glowing neon interface", "Tech-heavy design"],
  };

  const academicPaperSlide: Slide = {
    id: "academic-paper-preview",
    title: "Academic Paper Deck",
    bulletPoints: [
      "Clean and readable for lectures",
      "Supports complex data visualization",
    ],
  };

  const astralCoreSlide: Slide = {
    id: "astral-core-preview",
    title: "Astral Core",
    bulletPoints: ["Sci-fi theme with space visuals", "Deep purples and blues"],
  };

  const minimalWhiteboardSlide: Slide = {
    id: "minimal-whiteboard-preview",
    title: "Minimal Whiteboard",
    bulletPoints: ["Hand-drawn style", "Good for explainer slides"],
  };

  const slideMap: Record<string, Slide> = {
    'classic-clean': classicCleanSlide,
    'dark-edge': darkEdgeSlide,
    'corporate-pitch': corporatePitchSlide,
    'visual-focus': visualFocusSlide,
    'tech-minimal': techMinimalSlide,
    'hologram-ui': hologramUiSlide,
    'academic-paper': academicPaperSlide,
    'astral-core': astralCoreSlide,
    'minimal-whiteboard': minimalWhiteboardSlide,
  };


  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
          Xoslide
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl text-foreground/80">
          Transform your ideas into stunning presentations in seconds with our AI-powered tool. It's free and open source!
        </p>
        <Link href="/create" passHref>
          <Button size="lg" className="mt-8 text-lg font-semibold">
            Create Your Presentation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 font-headline">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <PenSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Provide a Prompt</h3>
              <p className="text-foreground/70">Start with a topic, paste your text, or just give us a rough idea.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-accent/10 p-4 rounded-full mb-4">
                <Palette className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Choose a Style</h3>
              <p className="text-foreground/70">Select from a variety of professional templates and themes.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Clapperboard className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Present & Wow</h3>
              <p className="text-foreground/70">Edit, preview, and share your AI-generated presentation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">Visually Stunning Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map((template) => (
              <Card key={template.id} className="overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full p-4 flex items-center justify-center bg-card">
                      <SlideTemplate
                        slide={slideMap[template.id]}
                        template={template.id as any}
                        theme="dark"
                        className="!p-4 text-[8px] leading-tight"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-headline">{template.name}</h3>
                    <p className="text-foreground/70 mt-2">{template.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-background/50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-headline mb-4">Contribute to Xoslide</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-8">
            Xoslide is an open-source project built with passion. We welcome developers to contribute, suggest features, or report issues. Let's build the future of presentations together.
          </p>
          <div className="flex justify-center items-center gap-4">
            <Link href="https://github.com/your-username/xoslide-repo" passHref>
              <Button variant="outline">
                <Github className="mr-2 h-5 w-5" />
                Star on GitHub
              </Button>
            </Link>
             <Link href="https://github.com/your-username" passHref>
              <Button variant="ghost" size="icon">
                <Github className="h-6 w-6" />
              </Button>
            </Link>
             <Link href="https://linkedin.com/in/your-username" passHref>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-6">
        <div className="container mx-auto text-center text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Xoslide. Free and Open Source.</p>
        </div>
      </footer>
    </div>
  );
}
