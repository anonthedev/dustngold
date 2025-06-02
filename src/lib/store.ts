import { create } from "zustand";

export type ArtType = "music" | "book" | "movie" | "misc";

export interface Art {
  uuid: string;
  type: ArtType;
  name: string;
  url: string | null;
  votes: number;
  provider_id: string | null;
  description: string | null;
  image_url: string | null;
  submitted_by: string | null;
  tags: string[] | null;
  created_at: string;
  upvoted_by: string[] | null;
  artist?: string[] | null;
  published_on?: Date | null;
}

interface ArtsStore {
  arts: Art[];
  selectedType: ArtType | "all";
  setSelectedType: (type: ArtType | "all") => void;
  setArts: (arts: Art[]) => void;
  addArt: (art: Art) => void;
  upvoteArt: (updatedArt: Art) => void;
}

export const useArtsStore = create<ArtsStore>((set) => ({
  arts: [],
  selectedType: "all",
  setSelectedType: (type) => set({ selectedType: type }),
  setArts: (arts) => set({ arts }),
  addArt: (art) => set((state) => ({ arts: [...state.arts, art] })),
  upvoteArt: (updatedArt) =>
    set((state) => ({
      arts: state.arts.map((art) =>
        art.uuid === updatedArt.uuid ? updatedArt : art
      ),
    })),
}));
