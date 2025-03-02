export interface Content {
  id: string;
  expiry: Date;
  isEnv: boolean;
  passwordHash: string;
}

export interface Fragment {
  sequence: number;
  contentId: string;
  value: string;
}
