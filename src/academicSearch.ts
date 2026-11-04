// src/academicSearch.ts

export interface Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  url: string;
  authors: { name: string }[];
  citationCount: number;
}

/**
 * Fetches academic papers from Semantic Scholar based on a research query.
 */
export async function searchAcademicPapers(query: string, limit = 5): Promise<Paper[]> {
  try {
    const fields = 'paperId,title,abstract,year,authors,url,citationCount';
    const endpoint = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Academic search failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching academic papers:', error);
    return [];
  }
}
