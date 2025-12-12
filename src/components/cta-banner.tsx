
'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Section, SectionHeading, SectionTitle, SectionDescription } from "@/components/ui/section";
import { Mail, MapPin } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    email: z.string().email("Invalid email address."),
    message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const CtaBanner = () => {
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            firstName: "",
            email: "",
            message: "",
        }
    });

    const onSubmit = () => {
        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you shortly.",
        });
        form.reset();
    }
  return (
    <Section className="bg-primary text-primary-foreground">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
                <SectionHeading className="!text-left">
                    <SectionTitle className="!text-white">Secure Your Supply. Start Your Partnership.</SectionTitle>
                    <SectionDescription className="!text-slate-300 !text-left !mx-0">
                        Ready to secure a reliable, high-quality inventory and improve your profit margins? Contact us to request a wholesale price list and begin partner onboarding.
                    </SectionDescription>
                </SectionHeading>
                <div className="space-y-4 text-slate-300">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-secondary" />
                        </div>
                        <a href="mailto:bzion.ent@gmail.com" className="hover:text-white">bzion.ent@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-secondary" />
                        </div>
                        <span>Headquarters: 86 Lagos-Abeokuta Expy, Express, Ota 101232, Ogun State</span>
                    </div>
                </div>
            </div>
            <div>
                <div className="bg-primary-foreground/5 p-8 rounded-lg">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Your Name</FormLabel>
                                    <FormControl><Input placeholder="Enter your name" {...field} className="bg-primary-foreground/10 border-slate-600 text-white" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Your Email</FormLabel>
                                    <FormControl><Input placeholder="Enter your email" {...field} className="bg-primary-foreground/10 border-slate-600 text-white" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Your Message</FormLabel>
                                    <FormControl><Textarea rows={4} placeholder="How can we help you?" {...field} className="bg-primary-foreground/10 border-slate-600 text-white" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div>
                                <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    </Section>
  );
};

export default CtaBanner;
