import { iconFactory } from "./index.ts";

import { paths as outlined } from "./svg/bold/Outlined.ts";
import { paths as outlined_filled } from "./svg/bold/OutlinedFilled.ts";
import { paths as rounded } from "./svg/bold/Rounded.ts";
import { paths as rounded_filled } from "./svg/bold/RoundedFilled.ts";
import { paths as sharp } from "./svg/bold/Sharp.ts";
import { paths as sharp_filled } from "./svg/bold/SharpFilled.ts";

export const Outlined = iconFactory(outlined);
export const OutlinedFilled = iconFactory(outlined_filled);
export const Rounded = iconFactory(rounded);
export const RoundedFilled = iconFactory(rounded_filled);
export const Sharp = iconFactory(sharp);
export const SharpFilled = iconFactory(sharp_filled);