# gimbap
A monolithic architecture is the traditional application design where the whole product is conveniently compiled together and deployed in a single artifact. The approach is simple but becomes problematic as an application scales horizontally. Most successful applications tend to grow in size and complexity. At a high scale, this would result in difficulty in understanding and updating the application. In addition, the size could significantly slow down the start-up time of the application. Since all modules are compiled at once, the monolithic approach is unreliable as a bug in a single module may break the entire application. 

When it comes to working with largely scaled applications, the microservices architecture is more efficient. Splitting a complex application into a smaller set of interconnected services is incredibly impactful. This allows accessible and efficient continuous deployment as each service can be scaled independently. 

It can be laborious and challenging to know exactly how to break up an application effectively. If done incorrectly, the business may end up with high costs and loss of resources.

With Gimbap, developers simply need to install an NPM package and let the tool handle the rest. First, the Express application object will be modified to allow Gimbap to track endpoint performance. This data will be stored in a database, allowing developers to monitor individual endpoints and view microservice clustering recommendations based upon endpoints’ similar covariant scores. Lastly, the information is presented in easy-to-read dendrograms and line charts.


# Installation
## Integrate Into Monolith
The gimbap npm package is responsible for collecting server response data and sending that data to your MongoDB. This database must be set up before you launch your monolith using gimbap.

Gimbap is a function that mutates express’ app object to inject route data logging.

First, install gimbap as a dependency of your monolithic application:

```
npm install -g gimbap
```

Next, import gimbap into your main server file and add call it before any other middleware function:

```
const app: Express = express(); 
gimbap(app, 'mongodb', MONGODB_URI);
```
## Visualization Backend
To launch the visualization app, a React front-end with an Express backend, first fork and clone the gimbap git repository.

Next, in the root directory, create a file called `secrets.json.` This JSON file must contain an object with a property called `MONGODB_URI` whose value is the URI string to connect to your MongoDB instance. 

Note, your MongoDB must be running as a replica set. Use these instructions to convert a local database into a replica set.

Next, build and launch the backend:

```
npm run build
npm run start-server
```

You can access the backend at localhost:3000.

Or, in development mode, to launch a Webpack dev server, simply run:

```
npm run dev
```

You can access the backend at localhost:8080.

# Visualizing Your Data

## Cluster Tree
Data is processed through Gimbap’s clustering algorithm and a dendrogram is generated that visualizes endpoint clustering recommendations based on similar covariant scores.

## Load Graph
Dive into more in-depth metrics using Gimbap’s load graphs. Developers are able to analyze recommended clusters in addition to monitoring the call times of individual routes within their application. 

# Contributors
- [Angelynn Truong](https://github.com/vngelynn)
- [Khandker Islam](https://github.com/khandkerislam)
- [Miguel Hernandez](https://github.com/miguelh72)
- [Parker Hutcheson](https://github.com/Parker9706)
- [Sebastien Fauque](https://github.com/SebastienFauque)
