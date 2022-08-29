import { FunctionComponent, MouseEventHandler } from 'react';

import { Wrapper } from './styles';

interface Props {
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  styleType?: 'background' | 'border';
  primaryColor?: string;
  secondaryColor?: string;
  borderBackgroundColor?: string;
  isDisabled?: boolean;
}

export const Button: FunctionComponent<Props> = props => {
  const {
    text,
    onClick,
    styleType = 'background',
    primaryColor = 'heliotrope',
    secondaryColor = 'cyan',
    borderBackgroundColor = 'blueCharcoal',
    isDisabled = false
  } = props;

  return (
    <Wrapper
      styleType={styleType}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      borderBackgroundColor={borderBackgroundColor}
      onClick={onClick}
      disabled={isDisabled}
    >
      {text}
    </Wrapper>
  );
};
