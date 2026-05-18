/**
 * Concatena un canal alpha (0..1) a un color hex de 6 dígitos.
 * Útil para derivar tints translúcidos de colores del tema sin hardcodear rgba.
 *
 * @example withAlpha('#6BA3FF', 0.16) → '#6BA3FF29'
 */
export function withAlpha(hex: string, alpha: number): string {
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
        .toString(16)
        .padStart(2, '0');
    return `${hex}${a}`;
}
