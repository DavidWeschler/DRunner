import { TextInputProps, TouchableOpacityProps } from "react-native";

type MapThemeType = "standard" | "dark" | "aubergine" | "night" | "retro" | "silver";

declare interface ApiMessage {
  role: string;
  content: string;
}

declare interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

declare interface AlertProps {
  visible: boolean;
  onClose: () => void;
  onSetStart: () => void;
  onSetEnd: () => void;
}

declare interface MapProps {
  destinationLatitude?: number;
  destinationLongitude?: number;
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void;
  selectedDriver?: number | null;
  onMapReady?: () => void;
}

declare interface Run {
  clerk_id: string;
  created_at: string;
  difficulty: string;
  directions: any;
  elevation_gain: number;
  is_deleted: boolean;
  is_saved: boolean;
  is_scheduled: string;
  length: number;
  route_id: number;
  route_title: string;
  address: string;
  waypoints: any;
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
  textClassName?: string;
  width?: string;
}

declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => void;
}

export interface GoogleTextInputs {
  label: string;
  placeholder: string;
  setAddress: (text: string) => void;
  setPointInput: (value: any) => void;
  setPoint: (text: string) => void;
}

declare interface HadasInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  placeholder?: string;
  handleString: ({ inp }: { inp: string }) => void;
  editable?: boolean;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

type MapThemeType = "standard" | "dark" | "aubergine" | "night" | "retro" | "silver";

declare interface MarkerData {
  latitude: number;
  longitude: number;
}

declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  mapTheme: MapThemeType | null;

  // algorithm inputs:
  length: number | null;
  startPoint: { latitude: number; longitude: number } | null;
  startAddress: string | null;
  endPoint: { latitude: number; longitude: number } | null;
  endAddress: string | null;
  difficulty: string | null;

  //hadas
  inp: string | null;

  //for the running phase /fix
  routeWayPoints: MarkerData[];
  routeDirections: string[];
  routeDetalis: any;

  mode: string;

  //algorithm inputs setters:
  setLengthInput: (length: number) => void;
  setStartPointInput: ({ latitude, longitude }: { latitude: number; longitude: number } | null) => void;
  setEndPointInput: ({ latitude, longitude }: { latitude: number; longitude: number } | null) => void;
  setDifficultyInput: (difficulty: string) => void;
  setEndAddress: (address: string) => void;
  setStartAddress: (address: string) => void;
  setHadasInp: (difficulty: string) => void;
  //-----------------

  setMapTheme: (theme: MapThemeType) => void;
  setUserLocation: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => void;
  setDestinationLocation: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => void;

  // setRouteWayPoints: (waypoints: MarkerData[]) => void;
  // setRouteDirections: (directions: string[]) => void;
  setRouteDetails: (details: any) => void;

  setMode: (mode: string) => void;
}

declare interface aiModel {
  name: string;
  host: string;
}

declare interface aiModelStore {
  model: aiModel;
  setAiModel: (m: aiModel) => void;
}

declare interface hadasStore {
  chatReset: boolean;
  setChatReset: (state: boolean) => void;
}
