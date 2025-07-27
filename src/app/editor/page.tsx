
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createRoot } from 'react-dom/client';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import Loader from '@/components/Loader';
import { SlideTemplate } from '@/components/templates/SlideTemplate';
import { type Presentation, type Slide } from '@/lib/types';
import { TEMPLATES, THEMES, TRANSITIONS } from '@/lib/constants';
import { FilePlus, Trash2, Download, Share2, GripVertical, ChevronDown, ImagePlus, ChevronsUpDown, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, Plus, ArrowLeft, ArrowRight, Wand2, Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type SortableSlideItemProps = {
  slide: Slide;
  index: number;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
};

function SortableSlideItem({ slide, index, isActive, isCollapsed, onSelect }: SortableSlideItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative mb-2">
       <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              onClick={onSelect}
              className={cn(
                  "cursor-pointer transition-all",
                  isActive ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50',
                  isCollapsed && 'w-12 h-12 flex items-center justify-center p-0'
              )}
            >
              <CardContent className={cn("p-2 flex items-center space-x-2", isCollapsed && 'p-0 w-10 h-10')}>
                {!isCollapsed && <div className="font-medium text-muted-foreground">{index + 1}</div>}
                <div className={cn("bg-muted rounded-sm overflow-hidden flex-shrink-0 relative", isCollapsed ? 'w-full h-full' : 'w-28 h-16')}>
                  {slide.imageUrl ? (
                    <Image src={slide.imageUrl} alt={slide.title} width={isCollapsed ? 40 : 112} height={isCollapsed ? 40 : 63} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      <ImagePlus className={cn(isCollapsed ? "h-4 w-4" : "h-6 w-6")} />
                    </div>
                  )}
                  {slide.transition && slide.transition !== 'none' && !isCollapsed && (
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 py-0.5 rounded-sm flex items-center">
                        <Wand2 className="h-3 w-3 mr-1" />
                        {slide.transition}
                    </div>
                  )}
                </div>
                {!isCollapsed && <p className="text-xs line-clamp-2 flex-grow">{slide.title}</p>}
                {!isCollapsed && <div {...attributes} {...listeners} className="p-1 cursor-grab touch-none"><GripVertical className="h-5 w-5 text-muted-foreground" /></div>}
              </CardContent>
            </Card>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right"><p>{slide.title}</p></TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default function EditorPage() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Panel state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  const router = useRouter();
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const goToPreviousSlide = useCallback(() => {
    setActiveSlideIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToNextSlide = useCallback(() => {
    if (!presentation) return;
    setActiveSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1));
  }, [presentation]);

  // Load presentation and panel state from localStorage
  useEffect(() => {
    try {
      const savedPresentation = localStorage.getItem('presentation');
      if (savedPresentation) {
        const parsed = JSON.parse(savedPresentation);
        setPresentation(parsed);
        if (parsed.slides.length === 0) addSlide();
      } else {
        router.replace('/create');
      }

      const lpc = localStorage.getItem('leftPanelCollapsed');
      setLeftPanelCollapsed(lpc ? JSON.parse(lpc) : false);
      const rpc = localStorage.getItem('rightPanelCollapsed');
      setRightPanelCollapsed(rpc ? JSON.parse(rpc) : false);
      const lpw = localStorage.getItem('leftPanelWidth');
      setLeftPanelWidth(lpw ? parseInt(lpw) : 280);
      const rpw = localStorage.getItem('rightPanelWidth');
      setRightPanelWidth(rpw ? parseInt(rpw) : 320);

    } catch (error) {
      console.error("Failed to load from storage", error);
      router.replace('/create');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Save panel state to localStorage
  useEffect(() => {
    if (presentation) localStorage.setItem('presentation', JSON.stringify(presentation));
    localStorage.setItem('leftPanelCollapsed', JSON.stringify(leftPanelCollapsed));
    localStorage.setItem('rightPanelCollapsed', JSON.stringify(rightPanelCollapsed));
    localStorage.setItem('leftPanelWidth', String(leftPanelWidth));
    localStorage.setItem('rightPanelWidth', String(rightPanelWidth));
  }, [presentation, leftPanelCollapsed, rightPanelCollapsed, leftPanelWidth, rightPanelWidth]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (event.key === 'ArrowRight') {
        goToNextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousSlide, goToNextSlide]);


  const handleResize = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<number>>,
    isRightPanel = false
  ) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = isRightPanel ? rightPanelWidth : leftPanelWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = startWidth + (isRightPanel ? -delta : delta);
      if (newWidth > 150 && newWidth < 500) { // Min and max width constraints
        setter(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftPanelWidth, rightPanelWidth]);
  
  const handleUpdate = (updates: Partial<Presentation>) => {
    if (!presentation) return;
    setPresentation(p => p ? { ...p, ...updates } : null);
  };
  
  const handleSlideContentChange = (index: number, field: keyof Slide, value: any) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    (newSlides[index] as any)[field] = value;
    handleUpdate({ slides: newSlides });
  };
  
  const handleBulletPointChange = (slideIndex: number, bulletIndex: number, value: string) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    newSlides[slideIndex].bulletPoints[bulletIndex] = value;
    handleUpdate({ slides: newSlides });
  };

  const addBulletPoint = (slideIndex: number) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    newSlides[slideIndex].bulletPoints.push("New bullet point");
    handleUpdate({ slides: newSlides });
  };

  const removeBulletPoint = (slideIndex: number, bulletIndex: number) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    newSlides[slideIndex].bulletPoints.splice(bulletIndex, 1);
    handleUpdate({ slides: newSlides });
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      title: 'New Slide Title',
      bulletPoints: ['Your content here.'],
      imageUrl: '',
      transition: presentation?.transition || 'none'
    };
    const newSlides = presentation ? [...presentation.slides, newSlide] : [newSlide];
    handleUpdate({ slides: newSlides });
    setActiveSlideIndex(newSlides.length - 1);
  };

  const deleteSlide = (index: number) => {
    if (!presentation || presentation.slides.length <= 1) return;
    const newSlides = presentation.slides.filter((_, i) => i !== index);
    handleUpdate({ slides: newSlides });
    setActiveSlideIndex(prev => Math.max(0, Math.min(prev, newSlides.length - 1)));
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id && presentation) {
      const oldIndex = presentation.slides.findIndex(s => s.id === active.id);
      const newIndex = presentation.slides.findIndex(s => s.id === over!.id);
      const newSlides = arrayMove(presentation.slides, oldIndex, newIndex);
      handleUpdate({ slides: newSlides });
      setActiveSlideIndex(newIndex);
    }
  }

  const exportToPptx = async () => {
    if (!presentation) return;
    setIsExporting(true);

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    for (const slide of presentation.slides) {
        const pptxSlide = pptx.addSlide();

        const slideElement = document.createElement('div');
        slideElement.style.width = '1280px';
        slideElement.style.height = '720px';
        
        // Temporarily render slide to an offscreen div to capture it
        document.body.appendChild(slideElement);
        
        const tempRoot = createRoot(slideElement);
        await new Promise<void>((resolve) => {
            tempRoot.render(
                <SlideTemplate 
                    slide={slide} 
                    template={presentation.template as any}
                    theme={presentation.theme as any} 
                />
            );
            setTimeout(resolve, 500); // give it time to render
        });

        const canvas = await html2canvas(slideElement, {
            width: 1280,
            height: 720,
            scale: 1,
        });
        
        const imageData = canvas.toDataURL('image/png');
        pptxSlide.addImage({ data: imageData, x: 0, y: 0, w: '100%', h: '100%' });
        
        if (slide.transition && slide.transition !== 'none') {
            pptxSlide.addNotes(slide.transition); // As a fallback, let's keep this
            // @ts-ignore PptxGenJS has transition types but might not be fully typed
            if (TRANSITIONS.find(t => t.id === slide.transition)) {
                 pptxSlide.transition = { type: slide.transition };
            }
        }
        
        tempRoot.unmount();
        document.body.removeChild(slideElement);
    }

    try {
        await pptx.writeFile({ fileName: `${presentation.title}.pptx` });
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: e instanceof Error ? e.message : "Could not save the file.",
        });
    } finally {
        setIsExporting(false);
    }
  };
  
  const exportToPdf = async () => { /* ... existing code ... */ };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSlideContentChange(activeSlideIndex, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
    
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader text="Loading Editor..." /></div>;
  if (isExporting) return <div className="flex items-center justify-center h-screen"><Loader text="Exporting your presentation..." /></div>;
  if (!presentation) return null;

  const activeSlide = presentation.slides[activeSlideIndex];
  const isFirstSlide = activeSlideIndex === 0;
  const isLastSlide = activeSlideIndex === presentation.slides.length - 1;


  return (
    <div className="flex h-[calc(100vh-theme(height.14))] bg-muted/40 overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

      {/* Left Sidebar */}
      <aside
        style={{ width: leftPanelCollapsed ? 56 : leftPanelWidth, minWidth: leftPanelCollapsed ? 56 : 150, maxWidth: 500 }}
        className="bg-background border-r flex flex-col transition-all duration-300 ease-in-out relative"
      >
        <div className={cn("p-4 border-b flex items-center justify-between", leftPanelCollapsed && "p-2")}>
          {!leftPanelCollapsed && (
            <div>
              <h2 className="text-lg font-semibold truncate">{presentation.title}</h2>
              <p className="text-sm text-muted-foreground">{presentation.slides.length} slides</p>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)} className="h-8 w-8">
            {leftPanelCollapsed ? <PanelRightOpen /> : <PanelLeftClose />}
          </Button>
        </div>
        <ScrollArea className="flex-grow p-2">
           <DndContext sensors={[]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={presentation.slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {presentation.slides.map((slide, index) => (
                <SortableSlideItem
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={index === activeSlideIndex}
                  isCollapsed={leftPanelCollapsed}
                  onSelect={() => setActiveSlideIndex(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ScrollArea>
        <div className="p-4 border-t mt-auto">
          <Button onClick={addSlide} className="w-full" size={leftPanelCollapsed ? 'icon' : 'default'}>
            <FilePlus className={cn(!leftPanelCollapsed && 'mr-2')}/>
            {!leftPanelCollapsed && 'Add Slide'}
          </Button>
        </div>
      </aside>

      <div onMouseDown={e => handleResize(e, setLeftPanelWidth)} className={cn("w-1.5 cursor-col-resize bg-border/50 hover:bg-primary/50 transition-colors", leftPanelCollapsed && 'hidden')} />

      {/* Main Content: Editor & Preview */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="bg-background border-b p-2 flex items-center justify-between">
            {/* ... controls from original file ... */}
            <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Template</span>
               <Select value={presentation.template} onValueChange={value => handleUpdate({ template: value })}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
             <div>
              <span className="text-xs text-muted-foreground">Theme</span>
                <Select value={presentation.theme} onValueChange={value => handleUpdate({ theme: value })}>
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
             <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="mr-2 h-4 w-4" />
              {activeSlide?.imageUrl ? 'Change Image' : 'Add Image'}
            </Button>
            {activeSlide?.imageUrl && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleSlideContentChange(activeSlideIndex, 'imageUrl', '')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Image
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportToPdf().catch(console.error)}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPptx}>PPTX</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => router.push('/preview')} size="sm" className="bg-primary/90 text-primary-foreground hover:bg-primary">
              <Play className="mr-2 h-4 w-4" /> Play Slideshow
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto bg-muted/40 relative">
          <div ref={slideContainerRef} className="bg-background rounded-lg shadow-lg overflow-hidden mx-auto max-w-[1200px]">
            {activeSlide ? (
              <div className="w-full aspect-video">
                  <SlideTemplate slide={activeSlide} template={presentation.template as any} theme={presentation.theme as any}/>
              </div>
            ) : <div className="flex items-center justify-center h-full">Select a slide to edit</div>}
          </div>
          
          {/* Navigation Controls */}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={goToPreviousSlide} 
                      disabled={isFirstSlide}
                      className="bg-background/60 hover:bg-background/90 backdrop-blur-sm disabled:opacity-30"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous Slide (Left Arrow)</p>
                  </TooltipContent>
                </Tooltip>

                <span className="text-sm font-medium text-background-foreground bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  {activeSlideIndex + 1} / {presentation.slides.length}
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={goToNextSlide} 
                        disabled={isLastSlide}
                        className="bg-background/60 hover:bg-background/90 backdrop-blur-sm disabled:opacity-30"
                      >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Next Slide (Right Arrow)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
        </div>
      </main>

      <div onMouseDown={e => handleResize(e, setRightPanelWidth, true)} className={cn("w-1.5 cursor-col-resize bg-border/50 hover:bg-primary/50 transition-colors", rightPanelCollapsed && "hidden")} />
      
      {/* Right Sidebar */}
      <aside
         style={{ width: rightPanelCollapsed ? 56 : rightPanelWidth, minWidth: rightPanelCollapsed ? 56 : 150, maxWidth: 500 }}
         className="bg-background border-l flex flex-col transition-all duration-300 ease-in-out"
      >
        <div className={cn("p-4 border-b flex items-center", rightPanelCollapsed ? 'justify-center' : 'justify-between')}>
           {!rightPanelCollapsed && <h3 className="font-semibold text-lg">Edit Slide</h3>}
          <Button variant="ghost" size="icon" onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} className="h-8 w-8">
            {rightPanelCollapsed ? <PanelLeftOpen /> : <PanelRightClose />}
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          {activeSlide && !rightPanelCollapsed && (
            <div className="p-4 space-y-6">
              <div>
                <Label htmlFor="slideTitle" className="font-semibold">Slide Title</Label>
                <Textarea id="slideTitle" value={activeSlide.title} onChange={e => handleSlideContentChange(activeSlideIndex, 'title', e.target.value)} className="mt-1 text-lg font-bold" rows={2}/>
              </div>
               <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-2">
                    Transition
                    <ChevronsUpDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Select
                      value={activeSlide.transition || 'none'}
                      onValueChange={(value) => handleSlideContentChange(activeSlideIndex, 'transition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transition" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSITIONS.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CollapsibleContent>
                </Collapsible>
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-2">
                    Bullet Points
                    <ChevronsUpDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                {activeSlide.bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2">
                      <Textarea value={point} onChange={e => handleBulletPointChange(activeSlideIndex, i, e.target.value)} rows={2} className="flex-grow"/>
                      <Button variant="ghost" size="icon" onClick={() => removeBulletPoint(activeSlideIndex, i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addBulletPoint(activeSlideIndex)} className="mt-2">Add Point</Button>
                </CollapsibleContent>
              </Collapsible>
              <Button variant="destructive" onClick={() => deleteSlide(activeSlideIndex)} className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Delete Slide</Button>
            </div>
          )}
          {activeSlide && rightPanelCollapsed && (
             <div className="p-2 space-y-2">
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="outline" size="icon" onClick={() => addBulletPoint(activeSlideIndex)} className="w-full"><Plus /></Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Add Bullet Point</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="destructive" size="icon" onClick={() => deleteSlide(activeSlideIndex)} className="w-full"><Trash2 /></Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Delete Slide</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             </div>
          )}
        </ScrollArea>
      </aside>
    </div>
  );
}

    