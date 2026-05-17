import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SilhouetteCorner {
  x: number; // grid coords (0..layout.width)
  y: number; // grid coords (0..layout.height)
}

interface LokEditorState {
  enabled: boolean;
  // Right-side corners only, top → bottom. Left side mirrors via (W - x).
  // null means "use auto-computed corners" — the editor will snapshot them on first enable.
  corners: SilhouetteCorner[] | null;

  imageUrl: string | null;
  imageOpacity: number; // 0..1
  imageX: number;       // grid coords — top-left of the image
  imageY: number;
  imageWidth: number;   // grid units; height keeps aspect ratio
  imageNaturalAspect: number; // natural width / height of uploaded image

  snapToGrid: boolean;

  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
  setCorners: (corners: SilhouetteCorner[]) => void;
  updateCorner: (i: number, pos: SilhouetteCorner) => void;
  addCornerAfter: (i: number) => void;
  removeCorner: (i: number) => void;
  resetCorners: () => void;

  setImage: (url: string | null, aspect?: number) => void;
  setImageOpacity: (opacity: number) => void;
  setImageTransform: (x: number, y: number, width: number) => void;

  toggleSnap: () => void;
}

export const useLokEditor = create<LokEditorState>()(
  persist(
    (set) => ({
      enabled: false,
      corners: null,
      imageUrl: null,
      imageOpacity: 0.45,
      imageX: 0,
      imageY: 0,
      imageWidth: 0,
      imageNaturalAspect: 1,
      snapToGrid: false,

      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (enabled) => set({ enabled }),
      setCorners: (corners) => set({ corners }),
      updateCorner: (i, pos) =>
        set((s) => {
          if (!s.corners) return {};
          const next = s.corners.slice();
          next[i] = pos;
          return { corners: next };
        }),
      addCornerAfter: (i) =>
        set((s) => {
          if (!s.corners) return {};
          const a = s.corners[i];
          const b = s.corners[i + 1] ?? a;
          const next = s.corners.slice();
          next.splice(i + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
          return { corners: next };
        }),
      removeCorner: (i) =>
        set((s) => {
          if (!s.corners || s.corners.length <= 2) return {};
          return { corners: s.corners.filter((_, idx) => idx !== i) };
        }),
      resetCorners: () => set({ corners: null }),

      setImage: (url, aspect) =>
        set((s) => ({
          imageUrl: url,
          imageNaturalAspect: aspect ?? s.imageNaturalAspect,
        })),
      setImageOpacity: (imageOpacity) => set({ imageOpacity }),
      setImageTransform: (imageX, imageY, imageWidth) =>
        set({ imageX, imageY, imageWidth }),

      toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
    }),
    {
      name: "lok-editor",
      partialize: (s) => ({
        corners: s.corners,
        imageUrl: s.imageUrl,
        imageOpacity: s.imageOpacity,
        imageX: s.imageX,
        imageY: s.imageY,
        imageWidth: s.imageWidth,
        imageNaturalAspect: s.imageNaturalAspect,
        snapToGrid: s.snapToGrid,
      }),
    },
  ),
);
