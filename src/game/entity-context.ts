import { Viewport } from 'pixi-viewport';

import { Entity } from './entity';

/**
 * Describes a context in which Entities can exist.
 */
export interface EntityContext {

  addEntity(e: Entity): void;

  getEntities: () => Entity[];

  getViewport(): Viewport;

}
