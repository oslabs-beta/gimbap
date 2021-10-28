export type Cluster = Route[];

export type Route = {
  method: string;
  endpoint: string;
};

export type LoadData = DataPoint[];

export type DataPoint = [number, number];

export type TreeNode = {
  name: string;
  children?: TreeNode[];
};

export type ClientError = {
  error: string;
}

