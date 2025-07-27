
'use server';

import { generatePresentation } from '@/ai/flows/generate-presentation';
import type { GeneratePresentationInput } from '@/ai/flows/generate-presentation';
import type { Presentation, Slide } from '@/lib/types';

export async function createPresentationAction(
  values: GeneratePresentationInput
): Promise<Presentation | { error: string }> {
  try {
    const presentationData = await generatePresentation(values);
    
    if (!presentationData || !presentationData.slides) {
      throw new Error('AI failed to generate presentation content.');
    }

    const slidesWithIds: Slide[] = presentationData.slides.map(slide => ({
      ...slide,
      id: crypto.randomUUID(),
      imageUrl: '', 
      transition: 'none',
    }));

    const presentation: Presentation = {
      id: crypto.randomUUID(),
      title: values.title,
      template: values.designTemplate,
      theme: values.themeVariant,
      slides: slidesWithIds,
      transition: 'none',
    };

    return presentation;
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return { error: `Failed to create presentation: ${errorMessage}` };
  }
}
