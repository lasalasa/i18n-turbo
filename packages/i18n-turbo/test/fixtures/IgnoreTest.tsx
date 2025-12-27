import React from 'react';
import { useTranslation } from 'i18n-turbo';

export const IgnoreTest = () => {
    const { t } = useTranslation();
    return (
        <div>
            {/* Standard extraction */}
            <h1>{t("should_be_extracted")}</h1>

            {/* Explicit ignore via data attribute */}
            <div data-i18n-ignore>
                <p>Should be ignored (data-attr)</p>
                <span>{t("ignored_hook_call")}</span>
            </div>

            {/* Explicit ignore via class */}
            <div className="notranslate">
                <p>Should be ignored (class)</p>
            </div>

            {/* Ignored tags */}
            <code>
                const x = "Should be ignored (code tag)";
            </code>
            <pre>
                Should be ignored (pre tag)
            </pre>
            <style>
                {`
                    .test { content: "Should be ignored (style tag)"; }
                `}
            </style>
        </div>
    );
};
