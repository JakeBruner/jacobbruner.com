export interface Tone {
  id: number;
  node: OscillatorNode;
  isOrphan: boolean;
  wave?: string; // TODO custom type;
  // isOrphan: boolean;
}
