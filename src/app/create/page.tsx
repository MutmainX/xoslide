
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPresentationAction } from "../actions";
import { TEMPLATES, THEMES } from "@/lib/constants";
import Loader from "@/components/Loader";
import Image from "next/image";
import { SlideTemplate } from "@/components/templates/SlideTemplate";
import { type Slide } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100),
  topic: z.string().min(10, "Topic/description must be at least 10 characters.").max(500),
  rawText: z.string().optional(),
  designTemplate: z.string({
    required_error: "You need to select a design template.",
  }),
  themeVariant: z.string({
    required_error: "You need to select a theme.",
  }),
});

const sampleSlide: Slide = {
    id: 'sample',
    title: 'Template Preview',
    bulletPoints: ['Styled bullet point 1', 'Styled bullet point 2'],
};

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      topic: "",
      rawText: "",
      designTemplate: 'classic-clean',
      themeVariant: 'dark',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const result = await createPresentationAction(values);

      if ('error' in result) {
        throw new Error(result.error);
      }
      
      localStorage.setItem("presentation", JSON.stringify(result));
      router.push("/editor");

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {isGenerating ? (
        <Card className="flex flex-col items-center justify-center p-10">
            <Loader text="Forging your slides..." />
            <p className="mt-4 text-center text-muted-foreground">Our AI is hard at work crafting your presentation. Please wait.</p>
        </Card>
      ) : (
        <>
          <h1 className="text-4xl font-bold font-headline mb-2">Create New Presentation</h1>
          <p className="text-muted-foreground mb-8">Fill in the details below to generate your slides.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presentation Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., The Future of Renewable Energy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic / Short Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A presentation about the advancements in solar, wind, and geothermal energy sources and their global impact."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>This will be used by the AI to generate the slide content.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rawText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raw Text (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your full content here if you have it. The AI will structure it into slides."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                         <FormDescription>If you provide raw text, the AI will prioritize it over the topic description.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Design Template</CardTitle>
                   <p className="text-sm text-muted-foreground pt-1">Select a visual style for your presentation.</p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="designTemplate"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          >
                            {TEMPLATES.map((template) => (
                              <FormItem key={template.id}>
                                <FormControl>
                                  <RadioGroupItem value={template.id} className="sr-only" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <Card className={`cursor-pointer hover:border-primary transition-colors h-full ${field.value === template.id ? 'border-primary border-2' : ''}`}>
                                    <div className="p-4">
                                      <h3 className="font-semibold">{template.name}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                                    </div>
                                  </Card>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <p className="text-sm text-muted-foreground pt-1">Choose a light or dark theme variant.</p>
                </CardHeader>
                <CardContent>
                   <FormField
                      control={form.control}
                      name="themeVariant"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4"
                            >
                              {THEMES.map(theme => (
                                <FormItem key={theme.id} className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={theme.id} />
                                  </FormControl>
                                  <FormLabel className="font-normal text-base">{theme.name}</FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>


              <Button type="submit" size="lg" className="w-full">
                Generate Presentation
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
