export type BlockKind = "trigger" | "condition" | "action";
export type PaletteBlock = {
  id: string;
  kind: BlockKind;
  label: string;

};
export type CanvasNode = {
  id: string;
  kind: BlockKind;
  label: string;
  data?: any;  
};
