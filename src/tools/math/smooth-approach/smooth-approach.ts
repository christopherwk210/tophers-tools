import javascript from './javascript.txt';
import typescript from './typescript.txt';
import gml from './gml.txt';

export function smoothApproach(currentValue: number, targetValue: number, speed: number, threshold = 0.0005) {
	const difference = targetValue - currentValue;

  // If the difference is smaller than the threshold, just return the target
	if (Math.abs(difference) < threshold) return targetValue;

	return currentValue + Math.sign(difference) * Math.abs(difference) * speed;
}

export const smoothApproachLangs = { javascript, typescript, gml };