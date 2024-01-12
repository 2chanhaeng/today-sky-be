import { NotFoundException } from '@nestjs/common';

export const onNotFoundUser = () => {
  throw new NotFoundException("Can't find user.");
};
