'use server';

/**
 * @fileOverview A supplier classification AI agent.
 *
 * - classifyNewSupplier - A function that handles the supplier classification process.
 * - ClassifyNewSupplierInput - The input type for the classifyNewSupplier function.
 * - ClassifyNewSupplierOutput - The return type for the classifyNewSupplier function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyNewSupplierInputSchema = z.object({
  supplierInformation: z
    .string()
    .describe('Detailed information about the supplier, including their industry, products, services, and company size.'),
});
export type ClassifyNewSupplierInput = z.infer<typeof ClassifyNewSupplierInputSchema>;

const ClassifyNewSupplierOutputSchema = z.object({
  supplierCategory: z
    .string()
    .describe('The category the supplier belongs to (e.g., Retailer, Wholesaler, Manufacturer).'),
  supplierReliabilityScore: z
    .number()
    .describe('A numerical score (1-100) indicating the supplier reliability based on the provided information.'),
  supplierRiskFactors: z
    .string()
    .describe('Identified risk factors associated with the supplier, if any, such as financial instability or negative reviews.'),
});
export type ClassifyNewSupplierOutput = z.infer<typeof ClassifyNewSupplierOutputSchema>;

export async function classifyNewSupplier(
  input: ClassifyNewSupplierInput
): Promise<ClassifyNewSupplierOutput> {
  return classifyNewSupplierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyNewSupplierPrompt',
  input: {schema: ClassifyNewSupplierInputSchema},
  output: {schema: ClassifyNewSupplierOutputSchema},
  prompt: `You are an expert in classifying suppliers based on their provided information.

  Analyze the following supplier information and classify the supplier into a relevant category (e.g., Retailer, Wholesaler, Manufacturer).
  Also, determine a reliability score (1-100) based on the information provided. Identify any potential risk factors associated with the supplier.

  Supplier Information: {{{supplierInformation}}}

  Ensure that the output is structured according to the provided output schema, including a category, reliability score, and risk factors (if any).`,
});

const classifyNewSupplierFlow = ai.defineFlow(
  {
    name: 'classifyNewSupplierFlow',
    inputSchema: ClassifyNewSupplierInputSchema,
    outputSchema: ClassifyNewSupplierOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
