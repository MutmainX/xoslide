
'use client';

import { type Slide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import { CheckSquare, BarChart, Quote, ImagePlus, Check, ChevronRight } from 'lucide-react';

const templateVariants = cva(
  "w-full h-full p-8 md:p-16 flex flex-col justify-center text-center transition-colors duration-300 relative",
  {
    variants: {
      template: {
        'classic-clean': 'bg-white text-gray-800 font-serif',
        'dark-edge': 'bg-gray-900 text-white font-sans',
        'corporate-pitch': 'bg-blue-50 text-gray-800 font-sans',
        'visual-focus': 'text-white',
        'tech-minimal': 'bg-gray-900 text-gray-300 font-mono',
        'hologram-ui': 'bg-[#0A0A1A] text-cyan-300 font-mono',
        'academic-paper': 'bg-[#FDFBF6] text-[#333333] font-serif',
        'astral-core': 'bg-gradient-to-br from-[#1E1B4A] to-[#4338CA] text-indigo-100',
        'minimal-whiteboard': 'bg-white text-gray-700 border border-gray-200 rounded-lg shadow-md',
      },
      theme: {
        light: '',
        dark: '',
      }
    },
    compoundVariants: [
      { template: 'classic-clean', theme: 'dark', className: 'bg-gray-800 text-gray-100' },
      { template: 'dark-edge', theme: 'light', className: 'bg-gray-200 text-gray-900' },
      { template: 'corporate-pitch', theme: 'dark', className: 'bg-blue-900 text-blue-100' },
      { template: 'visual-focus', theme: 'light', className: 'bg-gray-700' },
      { template: 'visual-focus', theme: 'dark', className: 'bg-gray-800' },
    ],
    defaultVariants: {
      template: "classic-clean",
    },
  }
);

const titleVariants = cva(
    "font-bold break-words",
    {
        variants: {
            template: {
                'classic-clean': 'text-5xl text-black',
                'dark-edge': 'text-6xl text-cyan-400',
                'corporate-pitch': 'text-5xl text-blue-800',
                'visual-focus': 'text-6xl drop-shadow-2xl',
                'tech-minimal': 'text-4xl text-green-400',
                'hologram-ui': 'text-5xl text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]',
                'academic-paper': 'text-4xl text-gray-800 border-b-2 border-red-800 pb-2 text-left',
                'astral-core': 'text-6xl font-bold text-white drop-shadow-2xl',
                'minimal-whiteboard': 'text-4xl text-gray-800 font-handwritten',
            },
            theme: {
              light: '',
              dark: '',
            }
        },
        compoundVariants: [
          { template: 'classic-clean', theme: 'dark', className: 'text-white' },
          { template: 'corporate-pitch', theme: 'dark', className: 'text-blue-200' },
        ],
    }
);

const contentVariants = cva(
    "mt-8 text-left max-w-4xl w-full mx-auto",
    {
        variants: {
            template: {
                'classic-clean': 'space-y-4',
                'dark-edge': 'space-y-3',
                'corporate-pitch': 'space-y-4',
                'visual-focus': 'space-y-4 text-2xl bg-black/50 p-6 rounded-lg',
                'tech-minimal': 'space-y-2 border-l-2 border-green-400 pl-4',
                'hologram-ui': 'space-y-3 text-lg',
                'academic-paper': 'space-y-3 text-lg mt-6',
                'astral-core': 'space-y-4 text-xl bg-black/30 p-6 rounded-lg',
                'minimal-whiteboard': 'space-y-3 text-2xl font-handwritten mt-6',
            }
        }
    }
);

const bulletPointVariants = cva(
    "flex items-start",
    {
        variants: {
            template: {
                'classic-clean': 'text-2xl',
                'dark-edge': 'text-xl text-gray-300',
                'corporate-pitch': 'text-xl',
                'visual-focus': 'text-2xl',
                'tech-minimal': 'text-lg',
                'hologram-ui': '',
                'academic-paper': '',
                'astral-core': '',
                'minimal-whiteboard': 'text-gray-600',
            }
        }
    }
)

export interface SlideTemplateProps extends VariantProps<typeof templateVariants> {
  slide: Slide;
  className?: string;
}

const BulletIcon = ({template, className, index}: {template: VariantProps<typeof templateVariants>['template'], className?: string, index?: number}) => {
    const iconProps = { className: cn("mr-4 mt-1 h-6 w-6 shrink-0", className) };
    switch(template) {
        case 'classic-clean': return <CheckSquare {...iconProps} className={`${iconProps.className} text-blue-600`} />;
        case 'dark-edge': return <span className="mr-4 mt-2 h-2 w-2 rounded-full bg-cyan-400" />;
        case 'corporate-pitch': return <BarChart {...iconProps} className={`${iconProps.className} text-blue-500`} />;
        case 'tech-minimal': return <span className="mr-4 mt-2 text-green-400">&gt;</span>;
        case 'visual-focus': return <CheckSquare {...iconProps} />;
        case 'hologram-ui': return <ChevronRight {...iconProps} className={`${iconProps.className} text-cyan-400`} />;
        case 'academic-paper': return <span className="mr-2 font-semibold text-red-800">{index! + 1}.</span>;
        case 'astral-core': return <span className="mr-4 mt-2 h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_6px_rgba(199,210,254,0.9)]" />;
        case 'minimal-whiteboard': return <Check {...iconProps} className={`${iconProps.className} text-green-500`} />;
        default: return <CheckSquare {...iconProps} />;
    }
}

export const SlideTemplate = ({ slide, template = 'classic-clean', theme, className }: SlideTemplateProps) => {
  const isVisualFocus = template === 'visual-focus';
  const hasImage = !!slide.imageUrl;

  const isLeftAligned = template === 'academic-paper' || template === 'minimal-whiteboard';

  return (
    <div className={cn(templateVariants({ template, theme }), className)}>
      {isVisualFocus && hasImage && (
         <Image
          src={slide.imageUrl!}
          alt={slide.title}
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
      )}
     
      <div className={cn("z-10 w-full h-full flex flex-col justify-center", isLeftAligned ? 'items-start text-left' : 'items-center')}>
        <h2 className={cn(titleVariants({ template, theme }))}>{slide.title}</h2>
        
        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <ul className={cn(contentVariants({ template }), isLeftAligned && 'mx-0')}>
            {slide.bulletPoints.map((point, i) => (
              <li key={i} className={cn(bulletPointVariants({ template }))}>
                <BulletIcon template={template} className="!h-2 !w-2 !mr-1" index={i} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {!isVisualFocus && hasImage && (
          <div className="mt-8 mx-auto p-2 bg-black/10 rounded-lg max-w-md w-full aspect-video flex items-center justify-center text-muted-foreground">
              <Image 
                  src={slide.imageUrl!} 
                  alt={slide.title}
                  width={400} 
                  height={225} 
                  className="rounded-md object-cover w-full h-full"
              />
           </div>
        )}
      </div>
    </div>
  );
};
