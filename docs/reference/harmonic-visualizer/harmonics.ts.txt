import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { solve1DHelmholtz } from './fem';
import type { AcousticSolution } from './types';

interface Point2D {
  r: number;
  z: number;
}

const SPEED_OF_SOUND = 343.0;  // m/s
const AIR_DENSITY = 1.225;     // kg/m³
const MESH_SIZE = 64;          // Power of 2 for better GPU performance

/**
 * Creates a normalized mesh from the input points
 */
function createMesh(points: number[][]): { r: number[][]; z: number[][] } {
  const r = Array(MESH_SIZE).fill(0).map(() => Array(MESH_SIZE).fill(0));
  const z = Array(MESH_SIZE).fill(0).map(() => Array(MESH_SIZE).fill(0));
  
  // Create uniform grid
  for (let i = 0; i < MESH_SIZE; i++) {
    for (let j = 0; j < MESH_SIZE; j++) {
      r[i][j] = i / (MESH_SIZE - 1);
      z[i][j] = j / (MESH_SIZE - 1);
    }
  }
  
  return { r, z };
}

/**
 * Normalizes input points to [0,1] range
 */
function normalizePoints(points: number[][]): Point2D[] {
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));
  
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.max(width, height);
  
  return points.map(p => ({
    r: (p[0] - minX) / scale,
    z: (p[1] - minY) / scale
  }));
}

/**
 * Calculates the total length of the drawn shape
 */
function calculateShapeLength(points: number[][]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i-1][0];
    const dy = points[i][1] - points[i-1][1];
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

/**
 * Calculates amplitude based on harmonic number and shape complexity
 */
function calculateHarmonicAmplitude(points: number[][], harmonicNumber: number): number {
  const complexity = calculateShapeComplexity(points);
  // Slower decay for better visualization
  return Math.exp(-complexity * harmonicNumber * 0.5);
}

/**
 * Calculates shape complexity based on angle changes
 */
function calculateShapeComplexity(points: number[][]): number {
  if (points.length < 3) return 0;
  
  let totalAngleChange = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i-1];
    const curr = points[i];
    const next = points[i+1];
    
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    
    const angle1 = Math.atan2(dy1, dx1);
    const angle2 = Math.atan2(dy2, dx2);
    
    let angleChange = Math.abs(angle2 - angle1);
    if (angleChange > Math.PI) {
      angleChange = 2 * Math.PI - angleChange;
    }
    
    totalAngleChange += angleChange;
  }
  
  const avgAngleChange = totalAngleChange / (points.length - 2);
  return Math.min(avgAngleChange / Math.PI, 1);
}

/**
 * Converts FEM mode shape to 2D visualization
 */
function modeShapeTo2D(modeShape: number[], mesh: { r: number[][]; z: number[][] }): number[][] {
  return tf.tidy(() => {
    // Create a 2D interpolation of the 1D mode shape
    const mode = tf.tensor1d(modeShape).expandDims(1);  // Shape: [N, 1]
    const r = tf.tensor2d(mesh.r);  // Shape: [MESH_SIZE, MESH_SIZE]
    const z = tf.tensor2d(mesh.z);  // Shape: [MESH_SIZE, MESH_SIZE]
    
    // Reshape mode to broadcast properly
    const modeReshaped = mode.tile([1, MESH_SIZE]);  // Shape: [N, MESH_SIZE]
    
    // Use linear interpolation
    const result = modeReshaped.matMul(r.transpose());
    
    return result.arraySync() as number[][];
  });
}

/**
 * Main function to calculate harmonics using FEM
 */
export async function calculateHarmonics(points: number[][]): Promise<any[]> {
    if (points.length < 2) return [];

    try {
        // Solve the acoustic problem
        const result = await solve1DHelmholtz(points.map(([x, y]) => ({ r: Math.abs(x), z: y })));
        
        // Calculate harmonics
        return result.frequencies.map((frequency, i) => ({
            frequency,
            amplitude: 1.0 / (i + 1), // Amplitude decreases with higher modes
            phase: 0,
            nodes: points.map(([x, y]) => ({ r: Math.abs(x), z: y })),
            mode: result.modes[i]
        }));
    } catch (error) {
        console.error('Error calculating harmonics:', error);
        return [];
    }
}

/**
 * Calculate harmonics from acoustic solution
 */
export function calculateHarmonicsFromSolution(solution: AcousticSolution) {
    return solution.frequencies.map((frequency, i) => ({
        frequency,
        amplitude: 1.0 / (i + 1), // Amplitude decreases with higher modes
        phase: 0, // Initial phase
        nodes: solution.nodes,
        mode: solution.modes[i]
    }));
}

/**
 * Calculate the instantaneous value of a harmonic at a given time
 */
export function evaluateHarmonic(
    frequency: number,
    amplitude: number,
    phase: number,
    time: number
): number {
    return amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
}

/**
 * Calculate the mode shape at a given time
 */
export function evaluateModeShape(
    mode: number[],
    frequency: number,
    amplitude: number,
    phase: number,
    time: number
): number[] {
    const scalar = evaluateHarmonic(frequency, amplitude, phase, time);
    return mode.map(value => value * scalar);
}
