import { Port } from '../models';
import { uniqueId } from '../util';

export class InputPort implements Port {
  public readonly id = uniqueId();

  constructor(public readonly parentId: string) {}
}
