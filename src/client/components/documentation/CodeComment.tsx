import React from 'react';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function CodeComment({
  declaration,
  explanation,
  properties,
  parameters,
  returns,
}: {
  declaration: string,
  explanation: string | string[],
  properties?: string | string[],
  parameters?: string | string[],
  returns?: string
}): React.ReactElement {
  if (typeof explanation === 'string') explanation = [explanation];
  if (typeof properties === 'string') properties = [properties];
  if (typeof parameters === 'string') parameters = [parameters];

  return (<Stack pb={4} spacing={1}>
    <Typography variant='body1' sx={{ fontFamily: 'monospace', fontSize: '1.2em', fontWeight: 'bold' }}>{declaration}</Typography>
    {explanation.map((paragraph, i) => <Typography variant='body1' pl={5} key={'paragraph-' + i}>{paragraph}</Typography>)}
    {properties && properties.map((property, i) => <Typography variant='body1' pl={5} key={'property-' + i} ><b>@property</b> {property}</Typography>)}
    {parameters && parameters.map((parameter, i) => <Typography variant='body1' pl={5} key={'parameter-' + i} ><b>@param</b> {parameter}</Typography>)}
    {returns && <Typography variant='body1' pl={5}><b>@returns</b> {returns}</Typography>}
  </Stack>);
}
