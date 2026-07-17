# Codex FPS Lab Architecture

This project is intentionally small, but its systems are separated so the prototype can grow without turning into a single-file game.

## Runtime Flow

```text
main.ts
  -> Game
    -> SceneBuilder
    -> PlayerController
    -> WeaponController
    -> TargetManager
    -> Shooting
      -> DamageSystem
      -> HitScanSystem
      -> WeaponEffects
    -> ScoreSystem
    -> Hud
```

## System Responsibilities

### Game

`src/game/Game.ts` is the composition root and game loop. It owns system creation, frame updates, resize handling, and the high-level shooting interaction.

Keep `Game.ts` thin. Add new gameplay rules to dedicated systems, then wire them here.

### SceneBuilder

`src/game/SceneBuilder.ts` creates the training range: lights, ground, walls, cover, containers, target bay, collision boxes, and player spawn.

It should describe the map, not own gameplay rules.

### PlayerController

`src/game/PlayerController.ts` owns first-person movement, pointer lock, mouse look, jump, crouch, walk speed, gravity, and simple collision.

It should not know about score, targets, weapons, or HUD.

### Combat

`src/game/combat/` contains weapon and hit-scan building blocks.

- `WeaponDefinition`: static weapon data.
- `WeaponController`: runtime fire cooldown and selected weapon state.
- `DamageSystem`: applies weapon damage and reports destruction.
- `HitScanSystem`: center-screen raycast logic.

Future combat work should add ammo, reload, recoil, spread, fire modes, weapon switching, armor, hit regions, and critical hits here or in adjacent combat modules.

### Targets

`src/game/targets/TargetManager.ts` owns target lookup, hit flash, hide, and respawn timing.

Future enemy or destructible systems should follow this pattern: manager owns lifecycle, other systems call into it.

### Effects

`src/game/effects/WeaponEffects.ts` owns tracer visuals for now.

Future muzzle flashes, hit sparks, audio hooks, and screen shake belong in effects systems instead of `Shooting.ts`.

### Shooting

`src/game/Shooting.ts` coordinates weapon firing, hit scan, target hit registration, and weapon effects.

It should remain a use-case coordinator, not the home for all combat state.

### State

`src/game/state/ScoreSystem.ts` owns score state.

Future game flow state, wave state, health, and match state should live under `state/` or more specific feature folders.

### UI

`src/ui/Hud.ts` owns DOM HUD rendering: score, cooldown, crosshair, hit/miss messages, and prompts.

HUD should display state passed to it. It should not own gameplay rules.

## Refactor Rules

- Add a new module when a concept has its own state or future variants.
- Keep `Game.ts` as composition and orchestration.
- Keep visual effects separate from hit and damage rules.
- Keep HUD display separate from gameplay state.
- Prefer behavior-preserving refactors before adding features.
- Run `npm run build` after structural changes.
