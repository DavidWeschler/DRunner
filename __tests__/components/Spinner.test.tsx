import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Spinner from "../../components/Spinner"; // Adjust the import path as needed
import { Modal, ActivityIndicator } from "react-native";

describe("Spinner", () => {
  it("renders the ActivityIndicator when visible is true", () => {
    const { getByTestId } = render(<Spinner visible={true} />);

    // Check if the ActivityIndicator is rendered
    const activityIndicator = getByTestId("spinner");
    expect(activityIndicator).toBeTruthy();
  });

  it("does not render the Modal when visible is false", () => {
    const { queryByTestId } = render(<Spinner visible={false} />);

    // Verify Modal is not rendered
    const modal = queryByTestId("modal");
    expect(modal).toBeNull();

    // Verify ActivityIndicator is not rendered
    const activityIndicator = queryByTestId("activity-indicator");
    expect(activityIndicator).toBeNull();
  });
});
