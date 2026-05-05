import { iconFactory } from "./icon.ts";

import { paths as outlined } from "./svg/Outlined.ts";
import { paths as outlined_filled } from "./svg/OutlinedFilled.ts";
import { paths as rounded } from "./svg/Rounded.ts";
import { paths as rounded_filled } from "./svg/RoundedFilled.ts";
import { paths as sharp } from "./svg/Sharp.ts";
import { paths as sharp_filled } from "./svg/SharpFilled.ts";

export const Outlined = iconFactory(outlined);
export const OutlinedFilled = iconFactory(outlined_filled);
export const Rounded = iconFactory(rounded);
export const RoundedFilled = iconFactory(rounded_filled);
export const Sharp = iconFactory(sharp);
export const SharpFilled = iconFactory(sharp_filled);