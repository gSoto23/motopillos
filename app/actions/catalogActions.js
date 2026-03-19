"use server";
import { prisma } from '@/lib/prisma';

export async function getComponentParts(slug, modelSlug) {
  try {
    const component = await prisma.componentAssembly.findFirst({
      where: { 
        slug: slug,
        model: {
          slug: modelSlug
        }
      }
    });
    
    if (!component) {
      return { component: null, parts: [] };
    }
    
    let parts = await prisma.part.findMany({
      where: { assemblyId: component.id },
      orderBy: { refNumber: 'asc' } // This provides an initial order, but we'll apply numerical sort
    });

    // Sort the parts numerically based on the refNumber string (e.g. "1", "2", "10")
    if (parts && parts.length > 0) {
      parts.sort((a, b) => {
        const numA = parseInt(a.refNumber.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.refNumber.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });
    }
    
    return { component, parts };
  } catch (error) {
    console.error('Error fetching component parts:', error);
    return { component: null, parts: [] }; // Return a consistent structure on error
  }
}
