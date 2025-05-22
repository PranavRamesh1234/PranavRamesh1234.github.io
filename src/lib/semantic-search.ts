import { pipeline, env } from '@xenova/transformers';

// Configure the environment
env.localModelPath = '/models'; // This will store models in the public/models directory
env.allowLocalModels = true;
env.useBrowserCache = true;

let embedder: any = null;
let modelLoadingPromise: Promise<any> | null = null;

export async function initializeEmbedder() {
  if (embedder) {
    return embedder;
  }

  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }

  modelLoadingPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
    cache_dir: '/models',
    progress_callback: (progress: number) => {
      console.log(`Loading model: ${Math.round(progress * 100)}%`);
    }
  }).then(model => {
    embedder = model;
    return model;
  }).catch(error => {
    console.error('Error loading model:', error);
    modelLoadingPromise = null;
    throw error;
  });

  return modelLoadingPromise;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await initializeEmbedder();
    const result = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding. Please try again.');
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

interface SearchField {
  name: string;
  weight: number;
  getValue: (item: any) => string;
}

function preprocessQuery(query: string): string[] {
  // Split query into terms and clean them
  return query
    .toLowerCase()
    .split(/\s+/)
    .map(term => term.trim())
    .filter(term => term.length > 0);
}

export async function semanticSearch<T>(
  query: string,
  items: T[],
  fields: SearchField[],
  threshold: number = 0.5
): Promise<{ item: T; score: number }[]> {
  const queryTerms = preprocessQuery(query);
  
  // Generate embeddings for each query term
  const queryEmbeddings = await Promise.all(
    queryTerms.map(term => generateEmbedding(term))
  );

  // Generate embeddings for each item's fields
  const itemEmbeddings = await Promise.all(
    items.map(async (item) => {
      const fieldEmbeddings = await Promise.all(
        fields.map(async (field) => {
          const value = field.getValue(item) || '';
          const embedding = await generateEmbedding(value);
          return { field, embedding };
        })
      );
      return { item, fieldEmbeddings };
    })
  );

  // Calculate scores for each item
  const results = itemEmbeddings.map(({ item, fieldEmbeddings }) => {
    let totalScore = 0;
    let totalWeight = 0;

    // For each query term
    queryTerms.forEach((term, termIndex) => {
      const queryEmbedding = queryEmbeddings[termIndex];
      
      // For each field
      fieldEmbeddings.forEach(({ field, embedding }) => {
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        totalScore += similarity * field.weight;
        totalWeight += field.weight;
      });
    });

    // Normalize score by total weight
    const score = totalWeight > 0 ? totalScore / totalWeight : 0;
    return { item, score };
  });

  // Filter and sort results
  return results
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
} 