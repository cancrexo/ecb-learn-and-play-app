# Plan: Adaptación tablet portrait (pass CSS)

## Objetivo

Adaptar la app para tablet en vista portrait (768–834px ancho) sin cambiar estructura HTML: contenedor más ancho, fondos, tipografía y paneles escalados.

Landscape y desktop quedan para una fase posterior.

## Fondo wide (tablet + desktop)

Desde `768px` de ancho, fondo fijo a pantalla completa:

- Imagen: `frontend/public/img/backgrounds/back-ground-wide.jpg`
- Capa: `body::before` (`position: fixed`, `z-index: -1`)
- `.screen--bg-splash` / `.screen--bg-common` sin imagen propia (transparentes)
- Móvil (<768px): sigue usando `back-ground-splash.jpg` / `back-ground-common.jpg`

## Estado

- [x] Variables CSS `--panel-max-width`, `--panel-container-max-width`
- [x] Media query `@media (min-width: 768px) and (orientation: portrait)`
- [x] Ajustes en `styles.scss` (fondos, auth, splash, instructions, clusters, summary, game-over)
- [x] Ajustes en `quiz.scss`, `path-timeline.scss`, `game-header.scss`, `verify-email.scss`
- [ ] Prueba manual en DevTools (iPad portrait) y regresión móvil

## Breakpoint

```scss
@media (min-width: 768px) and (orientation: portrait) {
    :root {
        --max-width: 640px;
        --panel-max-width: 400px;
        --panel-container-max-width: 480px;
    }
}
```

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| [`frontend/src/styles.scss`](../frontend/src/styles.scss) | Variables, media query tablet, fondos, tipografía |
| [`frontend/src/app/features/quiz/quiz.scss`](../frontend/src/app/features/quiz/quiz.scss) | Timeline 48px, header, tipografía |
| [`frontend/src/app/features/quiz/path-timeline/path-timeline.scss`](../frontend/src/app/features/quiz/path-timeline/path-timeline.scss) | Dots y gaps |
| [`frontend/src/app/shared/game-header/game-header.scss`](../frontend/src/app/shared/game-header/game-header.scss) | Banner score |
| [`frontend/src/app/features/auth/verify-email/verify-email.scss`](../frontend/src/app/features/auth/verify-email/verify-email.scss) | Márgenes form |

## Validación manual

Dispositivos DevTools: iPad Mini (768×1024), iPad Air (820×1180).

Pantallas: splash, login, register, verify-email, instructions, clusters, quiz, summary, game-over.

Comprobar móvil (<768px): sin cambios visuales respecto a antes.

## Fase posterior (fuera de alcance)

- Landscape tablet + desktop (breakpoint wide unificado)
- Overlay bloqueo landscape
