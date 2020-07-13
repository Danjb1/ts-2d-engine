import * as PIXI from 'pixi.js';

import { Component } from '../component';
import { Assets } from '../assets';
import { HitboxComponent } from './hitbox.component';

// Utils
import { getHitboxFrom } from '../utils';

/**
 * A Sprite that tracks an Entity.
 *
 * The Sprite will be rendered at the centre of the parent Entity's Hitbox.
 */
export class SpriteComponent extends Component {

  public static readonly KEY = Symbol();

  protected sprite: PIXI.Sprite;
  protected hitbox: HitboxComponent;

  constructor(
    protected filename: string,
    protected spriteSettings?: any
  ) {
    super(SpriteComponent.KEY);

    this.sprite = this.createSprite();

    if (spriteSettings) {
      this.sprite = Object.assign(this.sprite, spriteSettings);
    }
  }

  protected createSprite(): PIXI.Sprite {
    const texture = Assets.texture(this.filename);
    return new PIXI.Sprite(texture);
  }

  public onSpawn(): void {

    // Register this Sprite with Pixi
    const viewport = this.entity.context.getViewport();
    viewport.addChild(this.sprite);
    viewport.sortChildren();

    // Retrieve the Hitbox from the Entity
    this.hitbox = getHitboxFrom(this.entity);

    this.snapToEntity();
  }

  public destroy(): void {
    this.entity.context.getViewport().removeChild(this.sprite);
  }

  public lateUpdate(delta: number): void {
    // Move the Sprite in `lateUpdate`, after collision handling, otherwise it
    // may be rendered at an outdated position
    this.snapToEntity();
  }

  private snapToEntity(): void {

    // Update the position of the Sprite based on the Entity position
    this.sprite.x = this.hitbox.x;
    this.sprite.y = this.hitbox.y;

    // Centre the sprite in the hitbox
    this.sprite.x -= (this.sprite.width - this.hitbox.width) / 2;
    this.sprite.y -= (this.sprite.height - this.hitbox.height) / 2;
  }

}
