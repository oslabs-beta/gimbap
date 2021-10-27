import React from 'react';
import Box from '@mui/material/Box'; 
import InputLabel from '@mui/material/InputLabel'; 
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl'; 
import Select, { SelectChangeEvent } from '@mui/material/Select';

const controlStyles = { fontSize: 20 };

type Props = {
  layout: string;
  orientation: string;
  linkType: string;
  stepPercent: number;
  setLayout: (layout: string) => void;
  setOrientation: (orientation: string) => void;
  setLinkType: (linkType: string) => void;
  setStepPercent: (percent: number) => void;
};

export default function LinkControls({
  layout,
  orientation,
  linkType,
  stepPercent,
  setLayout,
  setOrientation,
  setLinkType,
  setStepPercent,
}: Props) {
  return (
    <Box sx={{ minWidth: 120, padding: "10px" }}>
      <FormControl>
        <InputLabel>layout:</InputLabel>
        <Select 
          value={layout}
          onClick={(e) => e.stopPropagation()}
          label="Layout"
          onChange={(e) => setLayout(e.target.value)}
        >
          <MenuItem value={'cartesian'}>cartesian</MenuItem>
          <MenuItem value={'polar'}>polar</MenuItem>
        </Select>
      </FormControl>
      &nbsp;&nbsp;
      <FormControl>
        <InputLabel>orientation:</InputLabel>
        <Select
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setOrientation(e.target.value)}
          value={orientation}
          disabled={layout === 'polar'}
          label="Orientation"
        >
          <MenuItem value="vertical">vertical</MenuItem>
          <MenuItem value="horizontal">horizontal</MenuItem>
        </Select>
      </FormControl>
      &nbsp;&nbsp;
      <FormControl>
        <InputLabel>link:</InputLabel>
        <Select
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setLinkType(e.target.value)}
          value={linkType}
          label="Link"
        >
          <MenuItem value="diagonal">diagonal</MenuItem>
          <MenuItem value="step">step</MenuItem>
          <MenuItem value="curve">curve</MenuItem>
          <MenuItem value="line">line</MenuItem>
        </Select>
      </FormControl>
      {linkType === 'step' && layout !== 'polar' && (
        <>
          <InputLabel>step:</InputLabel>&nbsp;
          <input
            onClick={(e) => e.stopPropagation()}
            type="range"
            min={0}
            max={1}
            step={0.1}
            onChange={(e) => setStepPercent(Number(e.target.value))}
            value={stepPercent}
            disabled={linkType !== 'step' || layout === 'polar'}
          />
        </>
      )}
    </Box>
  );
}
