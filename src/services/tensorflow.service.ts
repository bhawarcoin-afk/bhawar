import { Injectable, signal } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class TensorflowService {
  model = signal<tf.LayersModel | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  private labels: string[] = [];

  constructor() {
    this.loadModel();
  }

  async loadModel(): Promise<void> {
    if (this.model() || this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const loadedModel = await tf.loadLayersModel('assets/model/model.json');
      this.model.set(loadedModel);
      
      // Load class labels
      const response = await fetch('assets/model/class_labels.json');
      if (!response.ok) {
        throw new Error('Failed to load class labels.');
      }
      this.labels = await response.json();
      
    } catch (e) {
      console.error('Error loading TensorFlow model:', e);
      this.error.set('Could not load local scanner model. Identification will rely solely on the advanced AI.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async predict(imageData: HTMLImageElement): Promise<string | null> {
    const model = this.model();
    if (!model) {
      this.error.set('Prediction model is not loaded.');
      return null;
    }

    try {
      // Preprocess the image
      const tensor = tf.browser.fromPixels(imageData)
        .resizeNearestNeighbor([224, 224]) // Resize to model's expected input size
        .toFloat()
        .div(tf.scalar(255.0)) // Normalize
        .expandDims(); // Add batch dimension

      // Make prediction
      const prediction = model.predict(tensor) as tf.Tensor;
      const scores = await prediction.data() as Float32Array;
      
      // Find the index with the highest score
      const maxScoreIndex = scores.indexOf(Math.max(...scores));

      tf.dispose([tensor, prediction]);

      if (maxScoreIndex >= 0 && maxScoreIndex < this.labels.length) {
        return this.labels[maxScoreIndex];
      }
      return null;

    } catch (e) {
      console.error('Error during prediction:', e);
      this.error.set('An error occurred during local prediction.');
      return null;
    }
  }
}
