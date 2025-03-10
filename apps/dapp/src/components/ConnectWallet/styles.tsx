import { css } from '@emotion/react';
import styled from '@emotion/styled';

interface WalletProps {
  status: string;
}

interface WalletButtonProps {
  textColor: string;
}

export const Wrapper = styled.div<WalletProps>`
  ${({ theme, status }) => css`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 30;
    width: 100vw;
    height: 100vh;
    background-color: ${theme.colors.white}0D;
    backdrop-filter: saturate(180%) blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;

    .wallet {
      background-color: ${theme.colors.bunting};
      width: 90%;
      border-radius: 15px;
      box-shadow: ${theme.shadows.smallest};
      padding: 36px 28px;

      @media (min-width: ${theme.screens.lg}) {
        width: 450px;
      }

      .wallet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 48px;

        .wallet-header-title {
          font-size: ${theme.fonts.lg};
          color: ${theme.colors.white};
          margin: 0;

          @media (min-width: ${theme.screens.lg}) {
            font-size: ${theme.fonts.xl};
          }
        }

        .wallet-header-close {
          cursor: pointer;

          & > svg {
            fill: ${theme.colors.white};
            width: 24px;
            height: 24px;
          }
        }
      }

      .wallet-buttons {
        display: grid;
        grid-template-rows: repeat(3, 56px);
        grid-gap: 16px;

        @media (min-width: ${theme.screens.lg}) {
          grid-template-rows: repeat(3, 69px);
        }
      }

      .wallet-remember-session {
        display: flex;
        margin-top: 26px;

        @media (min-width: ${theme.screens.lg}) {
          justify-content: center;
        }
      }

      .wallet-terms {
        margin-top: 10px;
        margin-bottom: 30px;
        display: flex;
        align-items: center;

        .wallet-terms-text {
          margin: 0;
          font-size: ${theme.fonts.base};
          color: ${theme.colors.white};

          .wallet-terms-text-link {
            text-decoration: underline;
            font-size: ${theme.fonts.base};
            color: ${theme.colors.white};
          }
        }
      }

      .wallet-read {
        display: block;
        text-decoration: underline;
        color: ${theme.colors.white};
        font-size: ${theme.fonts.base};
        text-align: center;
        cursor: pointer;

        @media (min-width: ${theme.screens.lg}) {
          font-size: ${theme.fonts.xl};
        }
      }
    }

    .loading-title {
      font-size: ${theme.fonts.lg};
      color: ${theme.colors.white};
      margin: 0;
      margin-bottom: 48px;
      text-align: center;

      @media (min-width: ${theme.screens.lg}) {
        font-size: ${theme.fonts.xl};
      }
    }

    .loading-view {
      display: grid;
      justify-content: center;

      .loading-view-container {
        margin: 0 auto;
        width: 60px;
        height: 60px;
      }

      .loading-view-text {
        font-size: ${theme.fonts.sm};
        color: ${theme.colors.white};
        margin: 0;
        margin-top: 20px;

        @media (min-width: ${theme.screens.lg}) {
          font-size: ${theme.fonts.sm};
        }
      }
    }
  `}
`;

export const WalletButton = styled.button<WalletButtonProps>`
  ${({ theme, textColor }) => css`
    width: 100%;
    height: 100%;
    border-radius: 15px;
    background-color: ${theme.colors.transparent};
    color: ${theme.colors[textColor]};
    border: 1px solid ${theme.colors[textColor]}B3;
    font-family: 'HelveticaNowDisplay-Medium';
    font-size: ${theme.fonts.base};
    display: flex;
    justify-content: center;
    align-items: center;
    grid-gap: 20px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }

    @media (min-width: ${theme.screens.lg}) {
      font-size: ${theme.fonts.xl};
    }

    & > img {
      width: 30px;
      height: 24px;
    }
  `}
`;
