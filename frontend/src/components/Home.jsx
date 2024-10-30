import React from 'react';

function Home({ state, account }) {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>{account ? `Connected account: ${account}` : "Connect your wallet to get started!"}</p>
    </div>
  );
}

export default Home;
