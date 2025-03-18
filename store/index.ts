import { LocationStore, aiModelStore, MapThemeType, MarkerData, aiModel, hadasStore } from "@/types/type";
import { create } from "zustand";
import mapThemes from "../components/MapThemes/mapThemes";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  mapTheme: "standard",
  length: null,
  startPoint: null,
  startAddress: null,
  endPoint: null,
  endAddress: null,
  difficulty: null,
  inp: null,
  routeWayPoints: [], // might be depricated
  routeDirections: [], // might be depricated
  mode: "walking",
  routeDetalis: null,

  setRouteDetails: (route: any) => {
    set(() => ({
      routeDetalis: route,
    }));
  },

  setMode: (mode: string) => {
    set(() => ({
      mode,
    }));
  },

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

  setLengthInput: (length: number) => {
    set(() => ({
      length,
    }));
  },

  setStartPointInput: (point: { latitude: number; longitude: number } | null) => {
    set(() => ({
      startPoint: point ? { latitude: point.latitude, longitude: point.longitude } : null,
    }));
  },

  setStartAddress: (address: string) => {
    set(() => ({
      startAddress: address,
    }));
  },

  setEndPointInput: (point: { latitude: number; longitude: number } | null) => {
    set(() => ({
      endPoint: point ? { latitude: point.latitude, longitude: point.longitude } : null,
    }));
  },

  setEndAddress: (address: string) => {
    set(() => ({
      endAddress: address,
    }));
  },

  setDifficultyInput: (difficulty: string) => {
    set(() => ({
      difficulty,
    }));
  },

  setHadasInp: (inp: string) => {
    set(() => ({
      inp,
    }));
  },

  // setRouteWayPoints: (waypoints: MarkerData[]) => {
  //   set(() => ({
  //     routeWayPoints: waypoints,
  //   }));
  // },

  setRouteDirections: (directions: string[]) => {
    set(() => ({
      routeDirections: directions,
    }));
  },
}));

export const useaiModelStore = create<aiModelStore>((set) => ({
  model: { name: "Google Gemma 3", host: "google/gemma-3-4b-it:free" },
  setAiModel: (m: aiModel) => {
    set(() => ({
      model: m,
    }));
  },
}));

export const useHadasStore = create<hadasStore>((set) => ({
  chatReset: false,
  setChatReset: (state: boolean) => {
    set(() => ({
      chatReset: state,
    }));
  },
}));
