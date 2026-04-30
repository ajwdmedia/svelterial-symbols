import { iconFactory } from "./icon.ts";

import { paths as outlined } from "./svg/regular/Outlined.ts";
import { paths as outlined_filled } from "./svg/regular/OutlinedFilled.ts";
import { paths as rounded } from "./svg/regular/Rounded.ts";
import { paths as rounded_filled } from "./svg/regular/RoundedFilled.ts";
import { paths as sharp } from "./svg/regular/Sharp.ts";
import { paths as sharp_filled } from "./svg/regular/SharpFilled.ts";

export const Outlined = iconFactory(outlined);
export const OutlinedFilled = iconFactory(outlined_filled);
export const Rounded = iconFactory(rounded);
export const RoundedFilled = iconFactory(rounded_filled);
export const Sharp = iconFactory(sharp);
export const SharpFilled = iconFactory(sharp_filled);