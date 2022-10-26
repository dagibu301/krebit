import {
  FunctionComponent,
  ReactNode,
  useContext,
  useRef,
  useState
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import {
  MenuContentMobile,
  MenuMobile,
  NavBarDesktop,
  NavBarMobile,
  NavBarOption,
  Wrapper
} from './styles';
import { Bell, Close, Explore, Menu, Send } from 'components/Icons';
import { InlineDropdown } from 'components/InlineDropdown';
import { Badge } from 'components/Badge';
import { GeneralContext } from 'context';
import { formatUrlImage } from 'utils';

interface IProps {
  children: ReactNode;
}

const MENU_OPTIONS = [
  {
    title: 'Explore',
    href: '/explore',
    icon: <Explore />,
    badgeText: 'New!'
  },
  {
    title: 'Inbox',
    href: '/messages',
    icon: <Send />
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: <Bell />
  }
];

export const Layout: FunctionComponent<IProps> = props => {
  const { children } = props;
  const [isFilterOpenInView, setIsFilterOpenInView] = useState<string>();
  const {
    auth,
    profileInformation: { profile }
  } = useContext(GeneralContext);
  const [isMenuContentMobileOpen, setIsMenuContentMobileOpen] = useState(false);
  const [navBarDesktopOptionHovered, setNavBarDesktopOptionHovered] =
    useState<string>();
  const parentDropdownMobileRef = useRef(null);
  const parentDropdownDesktopRef = useRef(null);
  const { push, asPath } = useRouter();

  const handlePushProfile = () => {
    if (!auth.isAuthenticated) return;

    handleFilterOpen(undefined);
    push(`/${profile.did}`);
  };

  const handleLogout = () => {
    if (!window) return;

    auth.logout();
    push(`/`);
  };

  const handleFilterOpen = (view: string | undefined) => {
    setIsFilterOpenInView(view);
  };

  const handleMenuContentMobileOpen = () => {
    setIsMenuContentMobileOpen(prevValue => !prevValue);
  };

  const handleNavBarDesktopOptionHovered = (value: string | undefined) => {
    setNavBarDesktopOptionHovered(value);
  };

  return (
    <Wrapper>
      <MenuMobile profilePicture={formatUrlImage(profile?.picture)}>
        <div className="icon" onClick={handleMenuContentMobileOpen}>
          {isMenuContentMobileOpen ? <Close /> : <Menu />}
        </div>
        {auth?.isAuthenticated && (
          <div className="profile-menu">
            <div
              className="profile-menu-image"
              onClick={() => handleFilterOpen('mobile')}
              ref={parentDropdownMobileRef}
            />
            {isFilterOpenInView === 'mobile' && (
              <div className="profile-menu-dropdown">
                <InlineDropdown
                  items={[
                    {
                      title: 'My profile',
                      onClick: handlePushProfile
                    },
                    {
                      title: 'Log out',
                      onClick: handleLogout
                    }
                  ]}
                  parentRef={parentDropdownMobileRef}
                  onClose={() => handleFilterOpen(undefined)}
                />
              </div>
            )}
          </div>
        )}
      </MenuMobile>
      {isMenuContentMobileOpen && (
        <>
          <style global jsx>{`
            html,
            body {
              overflow: hidden;
            }
          `}</style>
          <MenuContentMobile>
            <div className="menu-content-mobile">
              <Link
                href="https://discord.gg/y7sMYVjxrd"
                rel="noopener noreferrer"
              >
                <a
                  target="_blank"
                  className="menu-content-mobile-item"
                  onClick={handleMenuContentMobileOpen}
                >
                  Discord
                </a>
              </Link>
              <Link href="https://docs.krebit.id/" rel="noopener noreferrer">
                <a
                  target="_blank"
                  className="menu-content-mobile-item"
                  onClick={handleMenuContentMobileOpen}
                >
                  Docs
                </a>
              </Link>
              <Link
                href="https://d3x2s82dzfa.typeform.com/to/B63Gz2v0"
                rel="noopener noreferrer"
              >
                <a
                  target="_blank"
                  className="menu-content-mobile-item"
                  onClick={handleMenuContentMobileOpen}
                >
                  Recruiters
                </a>
              </Link>
              <Link
                href="https://d3x2s82dzfa.typeform.com/to/AvZMdnRp"
                rel="noopener noreferrer"
              >
                <a
                  target="_blank"
                  className="menu-content-mobile-item"
                  onClick={handleMenuContentMobileOpen}
                >
                  Credential Issuers
                </a>
              </Link>
            </div>
          </MenuContentMobile>
        </>
      )}
      {children}
      <NavBarMobile>
        {MENU_OPTIONS.map((content, index) => (
          <Link href={content.href} key={index}>
            <NavBarOption isActive={asPath.includes(content.href)}>
              <div className="option-icon">
                {content.badgeText ? (
                  <Badge
                    icon={content.icon}
                    iconColor={asPath.includes(content.href) ? 'cyan' : 'gray'}
                    text={content.badgeText}
                  />
                ) : (
                  content.icon
                )}
              </div>
            </NavBarOption>
          </Link>
        ))}
      </NavBarMobile>
      <NavBarDesktop profilePicture={formatUrlImage(profile?.picture)}>
        <div className="options">
          <div className="option-logo">
            <img src="/imgs/logos/Krebit.svg" width={40} height={40} />
          </div>
          {MENU_OPTIONS.map((content, index) => (
            <Link href={content.href} key={index}>
              <NavBarOption
                isActive={asPath.includes(content.href)}
                onMouseEnter={() =>
                  handleNavBarDesktopOptionHovered(content.title)
                }
                onMouseLeave={() => handleNavBarDesktopOptionHovered(undefined)}
              >
                <div className="option-icon">
                  {content.badgeText ? (
                    <Badge
                      icon={content.icon}
                      iconColor={
                        asPath.includes(content.href) ? 'cyan' : 'gray'
                      }
                      text={content.badgeText}
                      onClick={() => {}}
                    />
                  ) : (
                    content.icon
                  )}
                </div>
                {navBarDesktopOptionHovered === content.title && (
                  <p className="option-hover">{content.title}</p>
                )}
              </NavBarOption>
            </Link>
          ))}
        </div>
        {auth?.isAuthenticated && (
          <div className="option-profile-container">
            <div
              className="option-profile-image"
              onClick={() => handleFilterOpen('desktop')}
              ref={parentDropdownDesktopRef}
            />
            {isFilterOpenInView === 'desktop' && (
              <div className="option-profile-dropdown">
                <InlineDropdown
                  items={[
                    {
                      title: 'My profile',
                      onClick: handlePushProfile
                    },
                    {
                      title: 'Log out',
                      onClick: handleLogout
                    }
                  ]}
                  parentRef={parentDropdownDesktopRef}
                  onClose={() => handleFilterOpen(undefined)}
                />
              </div>
            )}
          </div>
        )}
      </NavBarDesktop>
    </Wrapper>
  );
};
