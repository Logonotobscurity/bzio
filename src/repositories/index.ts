import * as brandDbRepo from './db/brandRepository';
import * as brandStaticRepo from './static/brandRepository';
import * as categoryDbRepo from './db/categoryRepository';
import * as categoryStaticRepo from './static/categoryRepository';
import * as companyDbRepo from './db/companyRepository';
import * as companyStaticRepo from './static/companyRepository';
import * as productDbRepo from './db/productRepository';
import * as productStaticRepo from './static/productRepository';

// Use database if DATABASE_URL is set and USE_DATABASE is true
const useDatabase = process.env.DATABASE_URL && process.env.USE_DATABASE === 'true';

export const brandRepository = useDatabase ? brandDbRepo : brandStaticRepo;
export const categoryRepository = useDatabase ? categoryStaticRepo : categoryDbRepo;
export const companyRepository = useDatabase ? companyStaticRepo : companyDbRepo;
export const productRepository = useDatabase ? productStaticRepo : productDbRepo;
