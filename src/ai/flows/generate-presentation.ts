// src/ai/flows/generate-presentation.ts
'use server';
/**
 * @fileOverview A flow to generate a presentation from a topic or raw text.
 *
 * - generatePresentation - A function that generates a presentation.
 * - GeneratePresentationInput - The input type for the generatePresentation function.
 * - GeneratePresentationOutput - The return type for the generatePresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePresentationInputSchema = z.object({
  title: z.string().describe('The title of the presentation.'),
  topic: z.string().describe('A short description or topic for the presentation.'),
  rawText: z.string().optional().describe('Full raw text content for the presentation (optional).'),
  designTemplate: z.string().describe('The design template to use for the presentation.'),
  themeVariant: z.string().describe('The theme variant to use (e.g., Dark, Light, Minimal).'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide.'),
  bulletPoints: z.array(z.string()).describe('3–5 bullet points per slide.'),
});

const GeneratePresentationOutputSchema = z.object({
  slides: z.array(SlideSchema).describe('An array of 5-10 slides for the presentation.'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const presentationPrompt = ai.definePrompt({
  name: 'presentationPrompt',
  input: {schema: GeneratePresentationInputSchema},
  output: {schema: GeneratePresentationOutputSchema},
  prompt: `You are a human presentation generator.

When I give you a topic, you create a full presentation that feels like it was made by a real person — not by AI. Your language should be simple, natural, and clear, just like how someone would talk in front of a class or team. Avoid robotic tone, overused phrases, or complex words.

The user has provided the following details:
Presentation Title: {{{title}}}
Topic: {{{topic}}}
Raw Text (use as primary source if provided): {{{rawText}}}
Design Template: {{{designTemplate}}}
Theme Variant: {{{themeVariant}}}


For the given topic, respond with:
Title Slide – A short, clear, human-sounding title for the first slide.

Slide-by-slide Content (5–10 slides):

Each slide should have a clear heading.
Add 3–5 bullet points per slide.
Keep bullet points short and easy to speak aloud.
No full paragraphs — just talking points.

Closing Slide – A natural wrap-up or summary in a personal tone.

Guidelines:
Use plain, human-friendly language.
No marketing phrases or clichés.
Keep it honest, natural, and easy to present.
Make it feel like it came from a real person, not a machine.
Follow the output schema exactly.
`,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async input => {
    const {output} = await presentationPrompt(input);
    return output!;
  }
);
