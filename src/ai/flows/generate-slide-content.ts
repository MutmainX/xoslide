'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating slide bullet points.
 *
 * - generateSlideBulletPoints - A function that generates bullet points for a slide based on the title.
 * - GenerateSlideBulletPointsInput - The input type for the generateSlideBulletPoints function.
 * - GenerateSlideBulletPointsOutput - The return type for the generateSlideBulletPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSlideBulletPointsInputSchema = z.object({
  title: z.string().describe('The title of the slide.'),
});

export type GenerateSlideBulletPointsInput = z.infer<typeof GenerateSlideBulletPointsInputSchema>;

const GenerateSlideBulletPointsOutputSchema = z.object({
  bulletPoints: z.array(z.string()).describe('An array of bullet points for the slide.'),
});

export type GenerateSlideBulletPointsOutput = z.infer<typeof GenerateSlideBulletPointsOutputSchema>;

export async function generateSlideBulletPoints(
  input: GenerateSlideBulletPointsInput
): Promise<GenerateSlideBulletPointsOutput> {
  return generateSlideBulletPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSlideBulletPointsPrompt',
  input: {schema: GenerateSlideBulletPointsInputSchema},
  output: {schema: GenerateSlideBulletPointsOutputSchema},
  prompt: `You are an AI assistant helping to generate content for presentation slides.

  Based on the slide title provided, generate 3-5 bullet points that would be relevant and informative for the slide.

  Slide Title: {{{title}}}

  Bullet Points:`,
});

const generateSlideBulletPointsFlow = ai.defineFlow(
  {
    name: 'generateSlideBulletPointsFlow',
    inputSchema: GenerateSlideBulletPointsInputSchema,
    outputSchema: GenerateSlideBulletPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
