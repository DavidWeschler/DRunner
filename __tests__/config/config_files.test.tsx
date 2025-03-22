const path = require("path");

describe("Metro Configuration", () => {
  it("should load the default Metro config", () => {
    const metroConfigPath = path.resolve(__dirname, "../../metro.config.js");
    const metroConfig = require(metroConfigPath);

    expect(metroConfig).toBeDefined();
    expect(metroConfig).toHaveProperty("resolver");
    expect(metroConfig).toHaveProperty("transformer");
  });
});

describe("PostCSS Configuration", () => {
  it("should load the PostCSS config with Tailwind and Autoprefixer", () => {
    const postCssConfigPath = path.resolve(__dirname, "../../postcss.config.js");
    const postCssConfig = require(postCssConfigPath);

    expect(postCssConfig).toBeDefined();
    expect(postCssConfig).toHaveProperty("plugins");
    expect(postCssConfig.plugins).toHaveProperty("tailwindcss");
    expect(postCssConfig.plugins).toHaveProperty("autoprefixer");
  });
});

describe("Tailwind Configuration", () => {
  it("should load the Tailwind config with correct content paths", () => {
    const tailwindConfigPath = path.resolve(__dirname, "../../tailwind.config.js");
    const tailwindConfig = require(tailwindConfigPath);

    expect(tailwindConfig).toBeDefined();
    expect(tailwindConfig).toHaveProperty("content");
    expect(tailwindConfig.content).toEqual(["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]);
  });

  it("should have custom font families in theme", () => {
    const tailwindConfigPath = path.resolve(__dirname, "../../tailwind.config.js");
    const tailwindConfig = require(tailwindConfigPath);

    expect(tailwindConfig).toBeDefined();
    expect(tailwindConfig.theme).toHaveProperty("extend");
    expect(tailwindConfig.theme.extend).toHaveProperty("fontFamily");
    expect(tailwindConfig.theme.extend.fontFamily).toHaveProperty("Jakarta");
  });

  it("should have custom colors in theme", () => {
    const tailwindConfigPath = path.resolve(__dirname, "../../tailwind.config.js");
    const tailwindConfig = require(tailwindConfigPath);

    expect(tailwindConfig).toBeDefined();
    expect(tailwindConfig.theme).toHaveProperty("extend");
    expect(tailwindConfig.theme.extend).toHaveProperty("colors");

    // Example: Check for 'primary' color scale
    expect(tailwindConfig.theme.extend.colors).toHaveProperty("primary");
    expect(tailwindConfig.theme.extend.colors.primary).toHaveProperty("100");
    expect(tailwindConfig.theme.extend.colors.primary[100]).toBe("#F5F8FF");
  });
});
