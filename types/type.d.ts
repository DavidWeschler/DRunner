import { TextInputProps, TouchableOpacityProps } from "react-native";

// declare interface Driver {
//   driver_id: number;
//   first_name: string;
//   last_name: string;
//   profile_image_url: string;
//   car_image_url: string;
//   car_seats: number;
//   rating: number;
// }

// declare interface MarkerData {
//   latitude: number;
//   longitude: number;
//   id: number;
//   title: string;
//   profile_image_url: string;
//   car_image_url: string;
//   car_seats: number;
//   rating: number;
//   first_name: string;
//   last_name: string;
//   time?: number;
//   price?: string;
// }

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

// declare interface PaymentProps {
//   fullName: string;
//   email: string;
//   amount: string;
//   driverId: number;
//   rideTime: number;
// }

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
}

// declare interface DriverStore {
//   drivers: MarkerData[];
//   selectedDriver: number | null;
//   setSelectedDriver: (driverId: number) => void;
//   setDrivers: (drivers: MarkerData[]) => void;
//   clearSelectedDriver: () => void;
// }

// declare interface DriverCardProps {
//   item: MarkerData;
//   selected: number;
//   setSelected: () => void;
// }
