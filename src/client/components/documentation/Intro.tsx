import React from 'react';

import Typography from '@mui/material/Typography';

export default function Intro() {
  return (<>
    <Typography variant='h4' component='h2' id='intro' color='textPrimary' pt={3}>Intro</Typography>

    <Typography variant='body1' id='intro-body' color='textPrimary'>
      A monolithic architecture is the traditional application design where the whole product is conveniently compiled together and deployed in a single artifact. The approach is simple but becomes problematic as an application scales horizontally. Most successful applications tend to grow in size and complexity. At a high scale, this would result in difficulty in understanding and updating the application. In addition, the size could significantly slow down the start-up time of the application. Since all modules are compiled at once, the monolithic approach is unreliable as a bug in a single module may break the entire application.
    </Typography>

    <Typography variant='body1' id='intro-body' color='textPrimary'>
      When it comes to working with largely scaled applications, the microservices architecture is more efficient. Splitting a complex application into a smaller set of interconnected services is incredibly impactful. This allows accessible and efficient continuous deployment as each service can be scaled independently.
    </Typography>

    <Typography variant='body1' id='intro-body' color='textPrimary'>
      It can be laborious and challenging to know exactly how to break up an application effectively. If done incorrectly, the business may end up with high costs and loss of resources.
    </Typography>

    <Typography variant='body1' id='intro-body' color='textPrimary'>
      With Gimbap, developers simply need to install an NPM package and let the tool handle the rest. First, the Express application object will be modified to allow Gimbap to track endpoint performance. This data will be stored in a database, allowing developers to monitor individual endpoints and view microservice clustering recommendations based upon endpoints’ similar covariant scores. Lastly, the information is presented in easy-to-read dendrograms and line charts.
    </Typography>
  </>);
}
