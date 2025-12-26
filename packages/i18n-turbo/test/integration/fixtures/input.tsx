import React from 'react';

export const DemoComponent = () => {
    return (
        <div title="Container Title">
            <h1>Hello World</h1>
            <p>Welcome to the i18n-turbo demo.</p>
            <button aria-label="Submit Button">Click Me</button>
            <span>Short</span>
            <div>{`Template literal with variable`}</div>
            <div>Static string inside expression container</div>
        </div>
    );
};

export const helper = () => {
    const message = "This is a plain string literal";
    return message;
};
