import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-supplier-information.ts';
import '@/ai/flows/suggest-suppliers-based-on-request.ts';
import '@/ai/flows/classify-new-suppliers.ts';
