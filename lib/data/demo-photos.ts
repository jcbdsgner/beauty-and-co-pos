/**
 * Démo : les seules vraies photos disponibles (ongles, `public/notation/`) servent partout où une
 * préférence attend une image — tuiles de « Noter la cliente » sans photo propre et photos de
 * référence des fiches (`Cliente.preferencePhotos`, des identifiants sans upload réel). À remplacer
 * par les vraies images quand elles arrivent.
 */

export const DEMO_PHOTOS = [
  "/notation/vernis-permanent.jpg",
  "/notation/capsules.jpg",
  "/notation/gel-x.jpg",
  "/notation/french.jpg",
  "/notation/decoration.jpg",
] as const;

/** A stable pick for a photo reference — the same ref always shows the same image. */
export function demoPhotoFor(ref: string): string {
  let h = 0;
  for (let i = 0; i < ref.length; i++) h = (h * 31 + ref.charCodeAt(i)) | 0;
  return DEMO_PHOTOS[Math.abs(h) % DEMO_PHOTOS.length];
}
