import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ connectWallet, account }) {
  return (
    <nav style={styles.navbar}>
      <div style={styles.linksContainer}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/editor" style={styles.link}>Editor</Link>
        <Link to="/marketplace" style={styles.link}>Marketplace</Link>
        <Link to="/discussion" style={styles.link}>Discussion</Link>
      </div>
      <div>
        <button onClick={connectWallet} style={styles.button}>
          {account
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: 'white',
  },
  linksContainer: {
    display: 'flex',
    gap: '15px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
  },
  button: {
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#333',
    backgroundColor: '#fff',
    border: '1px solid #fff',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  },
};

export default Navbar;
