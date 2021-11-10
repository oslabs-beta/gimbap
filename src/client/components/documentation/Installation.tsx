import React from 'react';

import Typography from '@mui/material/Typography';
import { CopyBlock, dracula, a11yLight } from 'react-code-blocks';


export default function Installation({
  useLightTheme
}: {
  useLightTheme: boolean;
}) {


  return (<>
    <Typography variant='h4' component='h2' id='installation' color='textPrimary' pt={3}>
      Installation
    </Typography>

    <Typography variant='h6' color='textPrimary'>
      Integrate Into Monolith
    </Typography>
    <Typography variant='body1' color='textPrimary'>
      The gimbap npm package is responsible for collecting server response data and sending that data to your MongoDB. This database must be set up before you launch your monolith using gimbap.
    </Typography>
    <Typography variant='body1' color='textPrimary'>
      Gimbap is a function that mutates express’ app object to inject route data logging.
    </Typography>
    <Typography variant='body1' color='textPrimary'>
      First, install gimbap as a dependency of your monolithic application:
    </Typography>

    <CopyBlock
      text={'npm install -g gimbap'}
      language={'bash'}
      showLineNumbers={true}
      startingLineNumber={1}
      theme={useLightTheme ? a11yLight : dracula}
    />

    <Typography variant='body1' color='textPrimary'>
      Next, import gimbap into your main server file and add call it before any other middleware function:
    </Typography>

    <CopyBlock
      text={`const app: Express = express(); 
gimbap(app, 'mongodb', MONGODB_URI);`}
      language={'bash'}
      showLineNumbers={true}
      startingLineNumber={1}
      theme={useLightTheme ? a11yLight : dracula}
    />

    <Typography variant='h6' color='textPrimary'>
      Visualization Backend
    </Typography>

    <Typography variant='body1' color='textPrimary'>
      To launch the visualization app, a React front-end with an Express backend, first fork and clone the gimbap git repository.
    </Typography>

    <Typography variant='body1' color='textPrimary'>
      Next, in the root directory, create a file called `secrets.json.` This JSON file must contain an object with a property called `MONGODB_URI` whose value is the URI string to connect to your MongoDB instance.
    </Typography>

    <Typography variant='body1' color='textPrimary'>
      Note, your MongoDB must be running as a replica set. Use these instructions to convert a local database into a replica set.
    </Typography>

    <Typography variant='body1' color='textPrimary'>
      Next, build and launch the backend:
    </Typography>

    <CopyBlock
      text={`npm run build 
npm run start-server`}
      language={'bash'}
      showLineNumbers={true}
      startingLineNumber={1}
      theme={useLightTheme ? a11yLight : dracula}
    />

    <Typography variant='body1' color='textPrimary'>
      You can access the backend at localhost:3000.
    </Typography>

    <Typography variant='body1' color='textPrimary'>
      Or, in development mode, to launch a Webpack dev server, simply run:
    </Typography>

    <CopyBlock
      text='npm run dev'
      language={'bash'}
      showLineNumbers={true}
      startingLineNumber={1}
      theme={useLightTheme ? a11yLight : dracula}
    />

    <Typography variant='body1' color='textPrimary'>
      You can access the backend at localhost:8080.
    </Typography>
  </>);
}
