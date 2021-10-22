export type Cluster = Route[];

export type Route = {
  method: string;
  endpoint: string;
};

export type LoadData = {
  x: number[];
  y: number[];
};

export type TreeNode = {
  name: string;
  children?: TreeNode[];
};

export type ClientError = {
  error: string;
}

