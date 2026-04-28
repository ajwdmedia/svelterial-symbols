import type { FactoryResult } from "./index.js";

import type { paths as outlined } from "./svg/bold/Outlined.js";
import type { paths as outlined_filled } from "./svg/bold/OutlinedFilled.js";
import type { paths as rounded } from "./svg/bold/Rounded.js";
import type { paths as rounded_filled } from "./svg/bold/RoundedFilled.js";
import type { paths as sharp } from "./svg/bold/Sharp.js";
import type { paths as sharp_filled } from "./svg/bold/SharpFilled.js";

export declare type Outlined = FactoryResult<typeof outlined>;
export declare type OutlinedFilled = FactoryResult<typeof outlined_filled>;
export declare type Rounded = FactoryResult<typeof rounded>;
export declare type RoundedFilled = FactoryResult<typeof rounded_filled>;
export declare type Sharp = FactoryResult<typeof sharp>;
export declare type SharpFilled = FactoryResult<typeof sharp_filled>;