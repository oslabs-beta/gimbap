import React from 'react';

import Typography from '@mui/material/Typography';

import CodeComment from './CodeComment';
import ApiTableOfContents from './ApiTableOfContents';

export default function ApiDoc() {
  return (<>
    <Typography variant='h4' component='h2'>
      API Documentation
    </Typography>

    <ApiTableOfContents />

    <Typography id='types' variant='h5' >
      Types
    </Typography>
    <CodeComment
      declaration='type Cluster = Route[]'
      explanation='A cluster is an array of Route objects. It represents a recommended clustering of server routes.'
    />
    <CodeComment
      declaration='export type LoadData = DataPoint[];'
      explanation='Array of [number, number] tuples specifying the x and y values respectively of a scatter plot.'
    />
    <CodeComment
      declaration='type Route = { method: string; endpoint: string; }'
      explanation='Defined a server endpoint as the combination of the HTTP method and the relative URL.'
      properties={[
        'method - HTTP method type',
        'endpoint - HTTP request relative endpoint',
      ]}
    />

    <Typography id='gimbap' variant='h5'>
      Gimbap
    </Typography>
    <CodeComment
      declaration={'function gimbap(app: Application, database: \'mongodb\' | \'postgresql\', dbURI: string): Promise<void>'}
      explanation={[
        'Mutates express app objects to inject route data logging.',
        'Note: Using PostgreSQL database is not currently supported.'
      ]}
      parameters={[
        '{Application} app - express application object. Usually created with `const app = express();`.',
        '{\'mongodb\' | \'postgresql\'} database - choose between using `mongodb` or `postgresql` database to send data to.',
      ]}
      returns='{Promise<void>} Promise<void> returns when connection to database has been established.'
    />

    <Typography id='setup' variant='h5'>
      Setup
    </Typography>
    <CodeComment
      declaration='async function connect(mongoURI: string): Promise<void>'
      explanation='Connect to MongoDB if a connection has not already been established. Used for lazy connecting.'
      parameters='{string} mongoURI - URI to connect to database.'
    />
    <CodeComment
      declaration='async function disconnect(): Promise<void>'
      explanation='Disconnect from MongoDB.'
    />

    <Typography id='endpointmodel' variant='h5'>
      EndpointModel
    </Typography>
    <CodeComment
      declaration='interface Endpoint { method: string, endpoint: string, callTime: number, _id?: number }'
      explanation='Interface defining a server response object type.'
      properties={[
        'method - HTTP method type',
        'endpoint - HTTP request relative endpoint',
        'callTime - UNIX timestamp of when the server received the request',
        ' _id - MongoDB unique id, will be a number for endpoints collection'
      ]}
    />
    <CodeComment
      declaration='async function getAllEndpoints(method?: string, endpoint?: string, afterId?: number): Promise<Endpoint[]>'
      explanation='Get a list of all server responses. If no method or endpoint is specified, it will return all endpoints in the database.'
      parameters={[
        '{string} method - (optional) HTTP method',
        '{string} endpoint - (optional) HTTP request relative endpoint',
        '{number} afterId - (optional) _id of EndpointModel used to filter result to include only _id greater than this value'
      ]}
      returns='Promise of array of endpoints'
    />

    <Typography id='endpointbucketsmodel' variant='h5'>
      EndpointBucketsModel
    </Typography>
    <CodeComment
      declaration='type EndpointBuckets = { method: string, endpoint: string, buckets: number[], lastEndpointId: number, oldestDate: number, newestDate: number }'
      explanation='Type defining a time-vectorized collection of server responses for a specific route.'
      properties={[
        'method - HTTP method type',
        'endpoint - HTTP request relative endpoint',
        'buckets - an array of numbers signifying the number of server responses that occurred in that time interval.',
        'lastEndpointId - the _id of the last endpoints document used in the buckets calculation',
        'oldestDate - UNIX timestamp of the oldest server response taken into account in buckets',
        'newestDate - UNIX timestamp of the newest server response taken into account in buckets'
      ]}
    />
    <CodeComment
      declaration='function calculateEndpointBuckets(endpoints: Endpoint[]): EndpointBuckets'
      explanation='Calculate endpoint buckets for an array of server response endpoints.'
      parameters='endpoints - Array of server response endpoints'
      returns='Calculate endpoint buckets for an array of server response endpoints.'
    />
    <CodeComment
      declaration='async function forceAllPendingUpdates(): Promise<void>'
      explanation='Forces all pending updates with timeout handle to complete.'
    />
    <CodeComment
      declaration='sync function getAllEndpointBuckets(): Promise<EndpointBuckets[]>'
      explanation='Get all EndpointBuckets in the database. This does not force a calculation update.'
    />
    <CodeComment
      declaration='async function getDistinctRoutes(): Promise<Route[]>'
      explanation='Get a distinct list of distinct routes.'
      returns='Promise of an array of Route objects'
    />
    <CodeComment
      declaration='async function getEndpointBuckets(method: string, endpoint: string): Promise<EndpointBuckets | null>'
      explanation='Get EndpointBuckets for a particular route from the database. Forces a calculation update if there are no endpoint buckets in the database.'
      parameters={[
        '{string} method - HTTP method type',
        '{string} endpoint - HTTP request relative endpoint',
        'EndpointBuckets for that route, or null if no data exists for that route'
      ]}
    />
    <CodeComment
      declaration='function startWatchingEndpointModel(): void'
      explanation='Initiate the ChangeStream watching EndpointModel.'
    />
    <CodeComment
      declaration='async function stopWatchingEndpointModel(): Promise<void>'
      explanation='Close the ChangeStream watching EndpointModel.'
    />

    <Typography id='clustermodel' variant='h5'>
      ClusterModel
    </Typography>
    <CodeComment
      declaration='async function forceUpdate(): Promise<void>'
      explanation='Forces cluster recalculation and update if new data is available.'
    />
    <CodeComment
      declaration='async function getClusters(): Promise<Cluster[] | null>'
      explanation='Get the current cluster model in the database. Note, this will only attempt a cluster calculation if there is no cluster model saved in the database, use `forceUpdate` before this call if a recalculation is needed.'
      returns='Cluster[] or null if no cluster model exists in the database.'
    />
    <CodeComment
      declaration='function startWatchingClusterModel(): void'
      explanation='Initiate the watching for new data to recalculate ClusterModel.'
    />
    <CodeComment
      declaration='function stopWatchingClusterModel(): void'
      explanation='Stop watching for new data.'
    />

    <Typography id='endpoints-utility' variant='h5'>
      Endpoints Utility
    </Typography>
    <CodeComment
      declaration='function determineClusters(allEndpointBuckets: EndpointBuckets[]): Cluster[]'
      explanation='Utilize OPTICS algorithm to cluster endpoints based on covariant time utilization. https://en.wikipedia.org/wiki/OPTICS_algorithm'
      parameters='{EndpointBuckets[]} allEndpointBuckets - Array of endpoint buckets to use for clustering calculation.'
      returns='{Cluster[]} Array of Cluster recommendations.'
    />
    <CodeComment
      declaration='function getLoadData(endpointBuckets: EndpointBuckets, granularity = 30): LoadData'
      explanation='Generate DataPoints for a load data graph for a pre-processed route buckets vector.'
      parameters={[
        '{EndpointBuckets} endpointBuckets - EndpointBuckets object for a particular route.',
        '{number} granularity - time interval in minutes between data points',
      ]}
      returns='{LoadData} Graph data to construct load graph scatter plot.'
    />
    <CodeComment
      declaration='function getClusterTreeNode(clusters: Cluster[]): TreeNode'
      explanation='Generate a D3 compatible nested node object for graphing tree graphs (dendrogram).'
      parameters='clusters - Array of Cluster recommendations.'
      returns='TreeNode representation of cluster to be used with D3 dendrogram graph'
    />
    <CodeComment
      declaration='function vectorizeEndpoints(endpoints: Endpoint[], granularity = 30): number[]'
      explanation='Create an array of buckets with the total number of endpoints that call into each bucket based on an interval size of granularity in minutes.'
      parameters={[
        'endpoints - Array of Endpoint',
        'granularity - time interval in minutes between data points'
      ]}
      returns='array of buckets with the total number of endpoints that call into each bucket'
    />

    <Typography id='data-generator' variant='h5'>
      Data Generator
    </Typography>
    <CodeComment
      declaration='type DistributionFunction = (x: number) => number;'
      explanation='A distribution function. A simple one-to-one mapping.'
      parameters='{number} x - the independent variable'
      returns='{number} - the probability, a value between 0 and 1'
    />
    <CodeComment
      declaration='type EndpointPDF = { method: string; endpoint: string; pdf: DistributionFunction; }'
      explanation='An object specifying a route and a probability distribution function.'
      properties={[
        '{string} method - HTTP method type',
        '{string} endpoint - HTTP request relative endpoint',
        '{DistributionFunction} pdf - A probability distribution function that should return the probability (a number between 0 and 1) at a particular independent value.',
      ]}
    />
    <CodeComment
      declaration='function simulateServerResponses(endpoints: EndpointPDF[], numCallsDist: DistributionFunction, numDays: number, granularity = 30): Endpoint[]'
      explanation='Simulate the server responding to client calls at the specified endpoints. The algorithm is probabilistic. You specify the probability distribution function (pdf) as a function for each endpoint in a 24 hour period as well as the overall server call distribution in a 24 hour period and calls are made randomly taking into account the pdf of each endpoint.'
      parameters={[
        '{EndpointPDF[]} endpoints - Array of EndpointPDF which include method, endpoint, and pdf.',
        '{DistributionFunction} numCallsDist - Distribution function of number of calls server received over a 24 hour period.',
        '{number} numDays - Number of days to run simulation for.',
        '{number} granularity - Granularity, in minutes, of internal calculation period. Defaults to 30 minutes. Smaller values mean approximation is closer to continuous pdf since the algorithm uses trapezoid rule numerical integration. Warning of using too small granularity: if the number of calls for a granularity interval sums to less than one, no calls will be made for the period.',
      ]}
      returns='Array of Endpoints that simulate how a real-life server would have responded given the endpoint bias in pdf.'
    />
  </>);
}
