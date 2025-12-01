// Provide legacy type aliases expected by @types/glob against minimatch@>=9.
import 'minimatch';

declare module 'minimatch' {
  export interface IOptions extends MinimatchOptions {}
  export interface IMinimatch extends Minimatch {}
}
