export interface Comment {
  type: 'BlockComment' | 'LineComment';
  raw: string;
  value: string;
  range: [number, number];
}

export default function extractComments(str: string): Comment[];
