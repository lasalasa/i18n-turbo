import React from 'react';
export const GreetingCard = ({
  name
}: {
  name: string;
}) => {
  return <div>
      <h1>Hello{name}!</h1>
      <p>Welcome to our platform.</p>
    </div>;
};