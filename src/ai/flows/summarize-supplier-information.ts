'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing supplier information.
 *
 * - summarizeSupplierInformation - A function that takes supplier details as input and returns a summarized assessment.
 * - SummarizeSupplierInformationInput - The input type for the summarizeSupplierInformation function.
 * - SummarizeSupplierInformationOutput - The return type for the summarizeSupplierInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSupplierInformationInputSchema = z.object({
  supplierDetails: z.string().describe('Detailed information about the supplier.'),
});
export type SummarizeSupplierInformationInput = z.infer<typeof SummarizeSupplierInformationInputSchema>;

const SummarizeSupplierInformationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the supplier, highlighting key strengths and weaknesses.'),
});
export type SummarizeSupplierInformationOutput = z.infer<typeof SummarizeSupplierInformationOutputSchema>;

export async function summarizeSupplierInformation(input: SummarizeSupplierInformationInput): Promise<SummarizeSupplierInformationOutput> {
  return summarizeSupplierInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSupplierInformationPrompt',
  input: {schema: SummarizeSupplierInformationInputSchema},
  output: {schema: SummarizeSupplierInformationOutputSchema},
  prompt: `You are an expert in supplier assessment. Summarize the following supplier information, highlighting key strengths and weaknesses, to help a user quickly assess their suitability:\n\nSupplier Details: {{{supplierDetails}}}`, 
});

const summarizeSupplierInformationFlow = ai.defineFlow(
  {
    name: 'summarizeSupplierInformationFlow',
    inputSchema: SummarizeSupplierInformationInputSchema,
    outputSchema: SummarizeSupplierInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
