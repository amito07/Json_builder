// Type definitions for the JSON Builder application

export type BlockType =
  | "textInput"
  | "dropdown"
  | "multipleChoice"
  | "contactNo"
  | "date"
  | "product"
  | "terms"
  | "otp"
  | "video"
  | "giveable"
  | "interactive_av"
  | "audio_start"
  | "audio_end"
  | "number"
  | "email"
  | "phone"
  | "textarea"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "audio"
  | "rating"
  | "range"
  | "color"
  | "time"
  | "datetime"
  | "url"
  | "password"
  | "search"
  | "hidden"
  | "submit"
  | "reset"
  | "button";

export type GroupType = "referring" | "numbervalidation";

export interface Question {
  slug: string;
  alias: string;
}

export interface ReferTo {
  id: number;
  group_no: number;
}

export interface Skip {
  id: number;
  group_no: number;
}

export interface Option {
  value: string;
  referTo?: ReferTo;
}

export interface Validations {
  regex?: string;
  prefix?: string;
  max?: number;
  min?: number;
  terms?: string[];
  bypass?: boolean;
  device?: boolean;
  server?: boolean;
  iris_track?: {
    status: boolean;
    capture_time: null | string;
    frame_capture: null | string;
  };
}

export interface Block {
  id: number;
  type: BlockType;
  question: Question;
  options?: Option[] | null;
  required?: string | boolean;
  validations?: Validations;
  referTo?: ReferTo;
  skip?: Skip;
}

export interface JumpingLogic {
  id: number;
  group_no: number;
  conditions: unknown[];
}

export interface Group {
  type: GroupType;
  group: number;
  title?: string;
  blocks: Block[];
  jumping_logic: JumpingLogic[];
}

// JSON Output format (matches the required structure)
export interface GroupJSON {
  type: GroupType;
  group: string;
  blocks: Block[];
  jumping_logic: JumpingLogic[];
}

// UI Form interfaces
export interface FormData {
  questionSlug: string;
  questionAlias: string;
  blockType: BlockType;
  groupId: number;
  required: boolean;
  options: string[];
  validationMin?: number;
  validationMax?: number;
  validationTerms?: string[];
  validationBypass?: boolean;
  validationDevice?: boolean;
  validationServer?: boolean;
  enableSkip: boolean;
  skipToId?: number;
  skipToGroup?: number;
  enableReferTo: boolean;
  referToId?: number;
  referToGroup?: number;
}

export interface GroupFormData {
  type: GroupType;
  title: string;
  enableJumpingLogic: boolean;
  jumpingLogicId?: number;
  jumpingLogicGroup?: number;
}

// Node editor types
export interface NodeData extends Block {
  groupId: number;
  groupType: GroupType;
  position: { x: number; y: number };
}

export interface GroupNodeData {
  id: number;
  type: GroupType;
  title: string;
  position: { x: number; y: number };
  blocks: Block[];
}

// Counter for generating numerical IDs
export interface IDCounters {
  blockId: number;
  groupId: number;
}

// Connection types for React Flow
export type ConnectionType = "referTo" | "skip";

export interface ConnectionData {
  type: ConnectionType;
  sourceBlockId: number;
  targetBlockId: number;
  sourceGroupId: number;
  targetGroupId: number;
}
