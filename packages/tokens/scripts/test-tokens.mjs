import { readFileSync } from "node:fs";
import { themes, themeToCSSVars } from "../dist/index.js";
const css = readFileSync(new URL("../dist/css/index.css", import.meta.url), "utf8");
for (const theme of Object.values(themes)) for (const [name, value] of Object.entries(themeToCSSVars(theme))) if (!css.includes(`${name}: ${value};`)) throw new Error(`CSS token drift: ${theme.name} ${name}`);
const rgb = (hex) => [1,3,5].map((i)=>Number.parseInt(hex.slice(i,i+2),16)/255).map((v)=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
const luminance = (hex) => { const [r,g,b]=rgb(hex); return .2126*r+.7152*g+.0722*b; };
const contrast = (a,b) => { const values=[luminance(a),luminance(b)].sort((x,y)=>y-x); return (values[0]+.05)/(values[1]+.05); };
for (const [name,a,b] of [["light body",themes.light.ink.primary,themes.light.surface.canvas],["dark body",themes.dark.ink.primary,themes.dark.surface.canvas],["gold hover",themes.light.ink.primary,themes.light.brand.gold]]) if (contrast(a,b)<4.5) throw new Error(`${name} contrast fails`);
console.log("Token CSS parity and required contrast pairs pass.");
