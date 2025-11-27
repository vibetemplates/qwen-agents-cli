declare module 'cli-spinners' {
  export interface SpinnerDefinition {
    interval: number;
    frames: string[];
  }

  const spinners: Record<string, SpinnerDefinition>;

  export type SpinnerName = keyof typeof spinners;

  export default spinners;
}
