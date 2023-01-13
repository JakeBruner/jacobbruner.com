export interface Tone {
  id: number;
  oscNode: OscillatorNode;
  gainNode: GainNode;
  panNode: StereoPannerNode;
  isOrphan: boolean;
  wave?: string; // TODO custom type;
  // isOrphan: boolean;
}
