import { Kia } from "../deps.ts";

let kia: Kia | undefined;
export function logProgress(text: string): void {
  kia ??= new Kia();
  kia.start(text);
}

export function stopProgress(): void {
  kia?.stop();
  kia = undefined;
}
