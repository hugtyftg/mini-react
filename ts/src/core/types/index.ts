import { TextNodeType } from './constants';
type VNodeType = string | TextNodeType;
interface VirtualDOM {
  type: VNodeType;
  props: {
    children: VirtualDOM[];
    style?: object;
    className?: string;
    [prop: string]: any;
  };
}
export type { VNodeType, VirtualDOM };
