'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Instagram, Linkedin, Facebook, Twitter, Music } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function FooterNewsletter() {
    const { toast } = useToast();

    const form = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
          email: '',
        }
    });

    const onSubmit = (data: NewsletterFormValues) => {
      console.log('Newsletter subscription:', data);
      toast({
        title: "Subscribed!",
        description: "Thanks for subscribing to our newsletter.",
      });
      form.reset();
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
                <h3 className="text-2xl font-semibold text-white">We have high standards for emails too.</h3>
            </div>
            <div>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex items-start bg-slate-100/10 rounded-md p-2 flex-col sm:flex-row sm:items-center">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="flex-grow w-full">
                                <FormControl>
                                    <Input
                                         type="email"
                                         placeholder="Enter your email"
                                         className="bg-transparent border-0 text-white placeholder:text-slate-300/70 focus-visible:ring-0 w-full"
                                         {...field}
                                    />
                                </FormControl>
                                <FormMessage className="absolute -bottom-6 text-xs text-secondary" />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="secondary" className="mt-2 sm:mt-0" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                    </form>
                </Form>
                 <div className="mt-4 flex justify-end items-center gap-4">
                    <a href="https://www.linkedin.com/company/bzion-shop" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white hover:text-secondary"><Linkedin size={20}/></a>
                    <a href="https://www.instagram.com/bzion.shop" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-secondary"><Instagram size={20}/></a>
                    <a href="https://www.facebook.com/share/1FDUZrAczB/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-secondary"><Facebook size={20}/></a>
                    <a href="https://twitter.com/bzion" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white hover:text-secondary"><Twitter size={20}/></a>
                    <a href="https://www.tiktok.com/@bzion.shop" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white hover:text-secondary"><Music size={20}/></a>
                </div>
            </div>
        </div>
    );
}
