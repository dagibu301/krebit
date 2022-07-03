import { useState } from 'react';
import Link from 'next/link';

import { Wrapper } from './styles';
import { Menu, Close, Logo } from 'components/Icons';
import { Button } from 'components/Button';

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpen = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  return (
    <Wrapper isMenuOpen={isMenuOpen}>
      <div className="header">
        <Link href="/">
          <div className="logo">
            <Logo />
          </div>
        </Link>
        <div className="menu" onClick={handleMenuOpen}>
          {isMenuOpen ? <Close /> : <Menu />}
        </div>
        <div className="menu-bar">
          <a
            className="menu-bar-item"
            href="https://discord.gg/y7sMYVjxrd"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
          <a className="menu-bar-item">Blog</a>
          <a className="menu-bar-item">Docs</a>
          <a className="menu-bar-item" href="#hire">Recruiters</a>
          <a className="menu-bar-item">Credential Issuers</a>
          <div className="menu-bar-button">
            <Button
              text="Try the Beta"
              primaryColor="cyan"
              secondaryColor="rose"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
      <div className="menu-content">
        <a
          className="menu-content-item"
          href="https://discord.gg/y7sMYVjxrd"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord
        </a>
        <a className="menu-content-item">Blog</a>
        <a className="menu-content-item">Docs</a>
        <a className="menu-content-item" href="#hire">Recruiters</a>
        <a className="menu-content-item">Credential Issuers</a>
        <div className="menu-content-button">
          <Button
            text="Connect wallet"
            primaryColor="rose"
            secondaryColor="blueRibbon"
            onClick={() => {}}
          />
        </div>
      </div>
    </Wrapper>
  );
};
