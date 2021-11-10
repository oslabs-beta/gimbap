/**
 * A cluster is an array of Route objects. It represents a recommended clustering of server routes.
 */
export type Cluster = Route[];

/**
 * Defined a server endpoint as the combination of the HTTP method and the relative URL.
 * 
 * @property method - HTTP method type
 * @property endpoint - HTTP request relative endpoint
 */
export type Route = {
  method: string;
  endpoint: string;
};

/**
 * Array of [number, number] tuples specifying the x and y values respectively of a scatter plot.
 */
export type LoadData = DataPoint[];

export type DataPoint = [number, number];

export type TreeNode = {
  name: string;
  children?: TreeNode[];
};

export type ClientError = {
  error: string;
}
