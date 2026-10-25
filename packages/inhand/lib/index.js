/**
 * Host half of lumesync-mobile.
 *
 * The whole feature (drawer, zoom guard, viewport meta, safe-area, composer
 * stability) lives in the browser half, which ships via exports["./client"]
 * and is discovered through the package.json dsh.client declaration. This
 * half only needs to exist so the roster row resolves; it intentionally does
 * nothing at runtime (no server settings, no routes).
 */

export const inject = []

export function apply() {
  // Intentionally empty: this plugin is client-only.
}
