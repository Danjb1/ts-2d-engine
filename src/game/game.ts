import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

import { Input } from './input';
import { EntityContext } from './entity-context';
import { Assets } from './assets';
import { Entity } from './entity';
import { getHitboxFrom } from './utils';

export class Game implements EntityContext {

  /*
   * Size of the game world.
   *
   * Entities positioned should be defined in 'world units' instead of pixels.
   * The viewport will adjust the display accordingly.
   *
   * If this is set to match the canvas size, then 1 world unit = 1 pixel.
   */
  public static readonly WORLD_WIDTH = 800;
  public static readonly WORLD_HEIGHT = 600;

  /*
   * Size of the image used internally by the canvas.
   *
   * If the canvas element is resized, this image will be stretched or squashed
   * to fit the element.
   */
  public static readonly CANVAS_WIDTH = 800;
  public static readonly CANVAS_HEIGHT = 600;

  /**
   * Our top-level Sprite container.
   */
  private viewport: Viewport;

  /**
   * Entities present in the game world.
   */
  private entities: Entity[] = [];

  /**
   * The next available Entity ID.
   */
  private nextEntityId: number = 1;

  constructor(private app: PIXI.Application) {}

  /**
   * Initialises the game.
   *
   * @param callbackFn Function to call when the game is loaded.
   */
  public load(callbackFn: any): void {

    // Load textures
    const p1 = new Promise<void>((resolve, reject) => {
      Assets.loadTextures(this.app.loader, () => {
        resolve();
      });
    });

    // Wait for everything to complete
    p1.then(() => {
      this.setup();
      callbackFn();
    });
  }

  /**
   * Called when our Textures have finished loading.
   */
  private setup(): void {
    this.initViewport();
    this.initEntities();
  }

  /**
   * Creates the Viewport.
   */
  private initViewport(): void {
    this.viewport = new Viewport({
      screenWidth: Game.CANVAS_WIDTH,
      screenHeight: Game.CANVAS_HEIGHT,
      worldWidth: Game.WORLD_WIDTH,
      worldHeight: Game.WORLD_HEIGHT
    }).fit();

    // Allow sorting Sprites by z-index
    this.viewport.sortableChildren = true;

    this.app.stage.addChild(this.viewport);
  }

  /**
   * Creates our initial Entities.
   */
  private initEntities(): void {
    // TODO
  }

  /**
   * Adds an Entity to the world.
   */
  public addEntity(e: Entity): void {
    e.spawn(this);
    e.entityId = this.nextEntityId;
    ++this.nextEntityId;
    this.entities.push(e);
  }

  /**
   * Gets all Entities in the world.
   */
  public getEntities(): Entity[] {
    return this.entities;
  }

  /**
   * Updates the game by one frame.
   *
   * The precise amount of time that has passed can be obtained from
   * `app.ticker`.
   *
   * Further reading:
   * https://gameprogrammingpatterns.com/update-method.html
   */
  public update(): void {

    // Update our Entities.
    // We make a copy of the array in case the list is changed during iteration.
    [...this.entities].forEach(e => {
      e.update(this.app.ticker.deltaMS);
    });

    // Destroy deleted Entities
    this.entities
      .filter(e => e.deleted)
      .forEach(e => e.destroy());

    // Remove deleted Entities
    this.entities = this.entities.filter(e => !e.deleted);

    // Allow Entities to collide with each other
    this.detectCollisions();

    // Update our Entities again!
    [...this.entities].forEach(e => {
      e.lateUpdate(this.app.ticker.deltaMS);
    });
  }

  /**
   * Checks for collisions between every pair of Entities.
   *
   * If a collision occurs, each Entity will get a `collidedWith` callback.
   */
  private detectCollisions(): void {

    const collidingEntities = [...this.entities];

    for (let i = 0; i < collidingEntities.length; i++) {

      const e1: Entity = collidingEntities[i];

      if (e1.deleted) {
        continue;
      }

      for (let j = i + 1; j < collidingEntities.length; j++) {

        const e2 = collidingEntities[j];

        if (e2.deleted) {
          continue;
        }

        const e1Hitbox = getHitboxFrom(e1);
        const e2Hitbox = getHitboxFrom(e2);

        if (e1Hitbox && e2Hitbox && e1Hitbox.intersects(e2Hitbox)) {
          e1Hitbox.collidedWith(e2Hitbox);
          e2Hitbox.collidedWith(e1Hitbox);
        }
      }
    }
  }

  public getViewport(): Viewport {
    return this.viewport;
  }

}
