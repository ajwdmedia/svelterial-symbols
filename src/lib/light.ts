import { iconFactory } from "./icon.ts";

import { paths as outlined } from "./svg/light/Outlined.ts";
import { paths as outlined_filled } from "./svg/light/OutlinedFilled.ts";
import { paths as rounded } from "./svg/light/Rounded.ts";
import { paths as rounded_filled } from "./svg/light/RoundedFilled.ts";
import { paths as sharp } from "./svg/light/Sharp.ts";
import { paths as sharp_filled } from "./svg/light/SharpFilled.ts";

export const Outlined = iconFactory(outlined);
export const OutlinedFilled = iconFactory(outlined_filled);
export const Rounded = iconFactory(rounded);
export const RoundedFilled = iconFactory(rounded_filled);
export const Sharp = iconFactory(sharp);
export const SharpFilled = iconFactory(sharp_filled);