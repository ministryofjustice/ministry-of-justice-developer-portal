declare module 'gray-matter' {
  export interface GrayMatterResult<T = any> {
    content: string;
    data: T;
    excerpt?: string;
  }

  export default function matter<T = any>(
    input: string,
  ): GrayMatterResult<T>;
}