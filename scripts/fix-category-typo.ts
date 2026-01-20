import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCategoryTypo() {
  try {
    // Check if the typo exists
    const badCategory = await prisma.categories.findFirst({
      where: { name: 'SSeasonings & Flavor' }
    });

    if (badCategory) {
      // Update the category name
      const updated = await prisma.categories.update({
        where: { id: badCategory.id },
        data: { name: 'Seasonings & Flavor' , updatedAt: new Date()}
      });
      console.log('Fixed category:', updated);
    } else {
      console.log('Category "SSeasonings & Flavor" not found in database.');
      
      // List all categories to see what we have
      const categories = await prisma.categories.findMany({
        select: { id: true, name: true, slug: true }
      });
      console.log('Current categories:', categories);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryTypo();
