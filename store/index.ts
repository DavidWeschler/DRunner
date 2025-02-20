import { LocationStore } from "@/types/type";
import { create } from "zustand";
import mapThemes from "../components/MapThemes/mapThemes";

type MapThemeType = "standard" | "dark" | "aubergine" | "night" | "retro" | "silver";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  mapTheme: null,

  setUserLocation: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));
  },

  setDestinationLocation: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },

  setMapTheme: (theme: MapThemeType) => {
    set(() => ({
      mapTheme: theme, // Store only the theme name
    }));
  },
}));
