export interface Magazine {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  pages: string[];
  pdfUrl?: string; // Optional if we have a direct link
  description?: string;
}

export const MOCK_MAGAZINES: Magazine[] = Array.from({ length: 15 }, (_, i) => ({
  id: `mag-${i + 1}`,
  title: [
    'Sanskar Sinchan',
    'Akram Express',
    'Gnan Mandir',
    'Flashback',
    'Wellness Guide',
    'Leadership 101',
    'Sports Weekly',
    'Life Skills',
    'Education Today',
    'Creative Minds',
    'Future Leaders',
    'Healthy Living',
    'Youth Voice',
    'Inspiration',
    'Knowledge Base'
  ][i % 15],
  category: ['Sports', 'Education', 'Wellness', 'Leadership', 'Life Skills'][i % 5],
  coverUrl: `https://picsum.photos/seed/${i + 100}/600/800`,
  pages: Array.from({ length: 8 }, (_, j) => `https://picsum.photos/seed/${i * 100 + j + 200}/600/800`),
  description: `Experience the latest insights and stories in our ${i + 1}${(i + 1) === 1 ? 'st' : (i + 1) === 2 ? 'nd' : (i + 1) === 3 ? 'rd' : 'th'} edition.`
}));
