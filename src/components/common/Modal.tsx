import React from 'react';
import { GlassModal, GlassModalProps } from './GlassModal';

export interface ModalProps extends GlassModalProps {}

export const Modal: React.FC<ModalProps> = (props) => {
  return <GlassModal {...props} />;
};
