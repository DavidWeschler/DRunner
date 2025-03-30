// __tests__/store.test.ts
import { useLocationStore, useaiModelStore, useHadasStore } from "@/store";

// Helper function to reset the useLocationStore state to its initial values.
function resetLocationStore() {
  useLocationStore.setState({
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
    mode: "walking",
    routeDetalis: null,
    callReset: false,
    // The setter functions remain the same
    setCallReset: useLocationStore.getState().setCallReset,
    setRouteDetails: useLocationStore.getState().setRouteDetails,
    setMode: useLocationStore.getState().setMode,
    setUserLocation: useLocationStore.getState().setUserLocation,
    setDestinationLocation: useLocationStore.getState().setDestinationLocation,
    setMapTheme: useLocationStore.getState().setMapTheme,
    setLengthInput: useLocationStore.getState().setLengthInput,
    setStartPointInput: useLocationStore.getState().setStartPointInput,
    setStartAddress: useLocationStore.getState().setStartAddress,
    setEndPointInput: useLocationStore.getState().setEndPointInput,
    setEndAddress: useLocationStore.getState().setEndAddress,
    setDifficultyInput: useLocationStore.getState().setDifficultyInput,
    setHadasInp: useLocationStore.getState().setHadasInp,
  });
}

describe("useLocationStore", () => {
  beforeEach(() => {
    resetLocationStore();
  });

  it("should have the correct initial state", () => {
    const state = useLocationStore.getState();
    expect(state.userLatitude).toBeNull();
    expect(state.userLongitude).toBeNull();
    expect(state.userAddress).toBeNull();
    expect(state.destinationLatitude).toBeNull();
    expect(state.destinationLongitude).toBeNull();
    expect(state.destinationAddress).toBeNull();
    expect(state.mapTheme).toBe("standard");
    expect(state.length).toBeNull();
    expect(state.startPoint).toBeNull();
    expect(state.startAddress).toBeNull();
    expect(state.endPoint).toBeNull();
    expect(state.endAddress).toBeNull();
    expect(state.difficulty).toBeNull();
    expect(state.inp).toBeNull();
    expect(state.mode).toBe("walking");
    expect(state.routeDetalis).toBeNull();
    expect(state.callReset).toBe(false);
  });

  it("should update callReset with setCallReset", () => {
    useLocationStore.getState().setCallReset(true);
    expect(useLocationStore.getState().callReset).toBe(true);
  });

  it("should update routeDetalis with setRouteDetails", () => {
    const route = { dummy: "route" };
    useLocationStore.getState().setRouteDetails(route);
    expect(useLocationStore.getState().routeDetalis).toEqual(route);
  });

  it("should update mode with setMode", () => {
    useLocationStore.getState().setMode("driving");
    expect(useLocationStore.getState().mode).toBe("driving");
  });

  it("should update user location with setUserLocation", () => {
    useLocationStore.getState().setUserLocation({
      latitude: 12.34,
      longitude: 56.78,
      address: "123 Main St",
    });
    const state = useLocationStore.getState();
    expect(state.userLatitude).toBe(12.34);
    expect(state.userLongitude).toBe(56.78);
    expect(state.userAddress).toBe("123 Main St");
  });

  it("should update destination location with setDestinationLocation", () => {
    useLocationStore.getState().setDestinationLocation({
      latitude: 98.76,
      longitude: 54.32,
      address: "456 Another Ave",
    });
    const state = useLocationStore.getState();
    expect(state.destinationLatitude).toBe(98.76);
    expect(state.destinationLongitude).toBe(54.32);
    expect(state.destinationAddress).toBe("456 Another Ave");
  });

  it("should update mapTheme with setMapTheme", () => {
    // Change the theme from "standard" to another value (e.g., "dark")
    useLocationStore.getState().setMapTheme("dark");
    expect(useLocationStore.getState().mapTheme).toBe("dark");
  });

  it("should update length with setLengthInput", () => {
    useLocationStore.getState().setLengthInput(42);
    expect(useLocationStore.getState().length).toBe(42);
  });

  it("should update startPoint with setStartPointInput", () => {
    const point = { latitude: 1.23, longitude: 4.56 };
    useLocationStore.getState().setStartPointInput(point);
    expect(useLocationStore.getState().startPoint).toEqual(point);
    // test null value
    useLocationStore.getState().setStartPointInput(null);
    expect(useLocationStore.getState().startPoint).toBeNull();
  });

  it("should update startAddress with setStartAddress", () => {
    useLocationStore.getState().setStartAddress("Start Address");
    expect(useLocationStore.getState().startAddress).toBe("Start Address");
  });

  it("should update endPoint with setEndPointInput", () => {
    const point = { latitude: 7.89, longitude: 0.12 };
    useLocationStore.getState().setEndPointInput(point);
    expect(useLocationStore.getState().endPoint).toEqual(point);
    // test null value
    useLocationStore.getState().setEndPointInput(null);
    expect(useLocationStore.getState().endPoint).toBeNull();
  });

  it("should update endAddress with setEndAddress", () => {
    useLocationStore.getState().setEndAddress("End Address");
    expect(useLocationStore.getState().endAddress).toBe("End Address");
  });

  it("should update difficulty with setDifficultyInput", () => {
    useLocationStore.getState().setDifficultyInput("hard");
    expect(useLocationStore.getState().difficulty).toBe("hard");
  });

  it("should update inp with setHadasInp", () => {
    useLocationStore.getState().setHadasInp("input value");
    expect(useLocationStore.getState().inp).toBe("input value");
  });
});

describe("useaiModelStore", () => {
  it("should have the correct initial model", () => {
    const state = useaiModelStore.getState();
    expect(state.model).toEqual({
      name: "Google Gemma 3",
      host: "google/gemma-3-4b-it:free",
    });
  });

  it("should update model with setAiModel", () => {
    const newModel = { name: "New Model", host: "new/host" };
    useaiModelStore.getState().setAiModel(newModel);
    expect(useaiModelStore.getState().model).toEqual(newModel);
  });
});

describe("useHadasStore", () => {
  it("should have chatReset initially false", () => {
    expect(useHadasStore.getState().chatReset).toBe(false);
  });

  it("should update chatReset with setChatReset", () => {
    useHadasStore.getState().setChatReset(true);
    expect(useHadasStore.getState().chatReset).toBe(true);
  });
});
