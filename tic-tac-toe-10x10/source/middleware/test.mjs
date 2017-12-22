import { getError } from '../test/service';

export default function test(req, res, next) {
  next(getError());
}
