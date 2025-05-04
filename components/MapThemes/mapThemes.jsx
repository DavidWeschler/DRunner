/**
 * @description This file contains the map themes for the map component.
 * It imports the map themes from the JSON files and exports them as an object.
 */
const darkMap = require("./darkMap.json");
const aubergineMap = require("./aubergineMap.json");
const nightMap = require("./nightMap.json");
const retroMap = require("./retroMap.json");
const silverMap = require("./silverMap.json");
const standardMap = require("./standardMap.json");

const mapThemes = {
  dark: darkMap,
  aubergine: aubergineMap,
  night: nightMap,
  retro: retroMap,
  silver: silverMap,
  standard: standardMap,
};

export default mapThemes;
