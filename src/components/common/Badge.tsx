import React from 'react';
import { GlassBadge, GlassBadgeProps } from './GlassBadge';

export interface BadgeProps extends GlassBadgeProps {}

export const Badge: React.FC<BadgeProps> = (props) => {
  return <GlassBadge {...props} />;
};
