/**
 * Mantiene la forma del diccionario español pero abre el tipo de los strings:
 * `en` tiene que tener exactamente las mismas claves (si falta una, falla el typecheck).
 */
export type DictShape<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly (infer U)[]
      ? DictShape<U>[]
      : DictShape<T[K]>;
};

/** Bloque de texto de las páginas legales (info, cookies, privacidad, términos). */
export interface LegalBlock {
  type: "p" | "h2" | "ul" | "ol";
  text?: string;
  items?: string[];
}
