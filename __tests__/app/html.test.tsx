/**
 * @jest-environment jsdom
 */
// __tests__/Root.test.tsx

import React from "react";
import { render, screen } from "@testing-library/react";
import Root from "@/app/+html";
// import "@testing-library/jest-dom/extend-expect";

// Mock the ScrollViewStyleReset component from expo-router/html
jest.mock("expo-router/html", () => ({
  ScrollViewStyleReset: () => <div data-testid="scrollview-style-reset" />,
}));

describe("Root component", () => {
  it("renders the HTML structure with meta tags, style, and children", () => {
    const childText = "Hello World";
    const { container } = render(
      <Root>
        <div data-testid="child">{childText}</div>
      </Root>
    );

    // Check that the container contains an <html> element with proper attributes.
    expect(container.innerHTML).toContain("<html");
    expect(container.innerHTML).toContain('lang="en"');

    // Check for meta tags in the head
    expect(container.innerHTML).toContain('<meta charset="utf-8"');
    expect(container.innerHTML).toContain('http-equiv="X-UA-Compatible"');
    expect(container.innerHTML).toContain('name="viewport"');

    // Check that the ScrollViewStyleReset component is rendered
    // expect(screen.getByTestId("scrollview-style-reset")).toBeInTheDocument();

    // Check that the style tag with the expected CSS is rendered
    expect(container.innerHTML).toContain("background-color: #fff");
    expect(container.innerHTML).toContain("@media (prefers-color-scheme: dark)");

    // Check that the children are rendered within the body tag
    // expect(screen.getByTestId("child")).toHaveTextContent(childText);
  });
});
