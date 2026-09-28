import React from 'react';
import { GlassButton, GlassButtonProps } from './GlassButton';

export interface ButtonProps extends GlassButtonProps {}

export const Button: React.FC<ButtonProps> = (props) => {
  return <GlassButton {...props} />;
};
