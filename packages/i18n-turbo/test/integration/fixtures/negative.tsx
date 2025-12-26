import React from 'react';
import { someHelper } from './utils';

export const NegativeComponent = () => {
    // 1. Should ignore imports (checked by code structure above)
    
    // 2. Should ignore string literals in imports
    const x = require('some-lib');

    // 3. Should ignore short strings
    const a = "a"; 

    // 4. Should ignore strings without letters
    const symbols = "!!!";
    const numbers = "12345";

    // 5. Should ignore already translated strings
    const translated = t("already_translated");

    return (
        <div className="should-be-ignored-if-code-checked-it-but-it-doesnt">
           {/* It extracts JSX attributes unless filtered. Currently it extracts all attributes with letters > 1 char */}
            <span data-testid="ignore-me-maybe">Test</span>
        </div>
    );
};
