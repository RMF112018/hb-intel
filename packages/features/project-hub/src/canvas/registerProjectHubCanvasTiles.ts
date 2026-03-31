import { registerMany } from '@hbc/project-canvas';
import { projectHubCanvasTiles } from './projectHubCanvasTiles.js';

let registered = false;

export function registerProjectHubCanvasTiles(): void {
  if (registered) {
    return;
  }
  registerMany(projectHubCanvasTiles);
  registered = true;
}

export function _resetProjectHubCanvasRegistrationForTests(): void {
  registered = false;
}
