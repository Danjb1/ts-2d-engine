import { Entity } from '../entity';
import { getHitboxDistance } from './geometry';
import { HitboxComponent } from '../components/hitbox.component';

/**
 * Extracts the HitboxComponent from an Entity, if it has one.
 */
export const getHitboxFrom = (entity: Entity): HitboxComponent => {
  return entity.getComponent<HitboxComponent>(HitboxComponent.KEY);
};

/**
 * Gets the straight-line distance from one Entity to another.
 */
export const getEntityDistance = (e1: Entity, e2: Entity): number => {
  return getHitboxDistance(getHitboxFrom(e1), getHitboxFrom(e2));
};
