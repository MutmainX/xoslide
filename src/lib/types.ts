
import { type GeneratePresentationOutput } from '@/ai/flows/generate-presentation';

export type Slide = GeneratePresentationOutput['slides'][0] & { 
    id: string;
    imageUrl?: string; 
    transition?: string;
};

export type Presentation = {
  id: string;
  title: string;
  template: string;
  theme: string;
  slides: Slide[];
  transition?: string;
};
