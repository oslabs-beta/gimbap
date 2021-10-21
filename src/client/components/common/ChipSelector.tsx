import React, { useCallback } from 'react';

import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

/**
 * Used to style chip menu item.
 * 
 * @param index - Index of current item in routes
 * @param selected - List of indices of selected items in routes
 * @param theme - MUI theme
 * 
 * @returns Typography theme settings
 * 
 * @private
 */
function getStyles(index: number, selected: number[], theme: Theme) {
  return {
    fontWeight: selected.indexOf(index) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

export default function ChipSelector({
  itemLabels,
  selected,
  setSelected,
}: {
  itemLabels: string[],
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>
}): JSX.Element {
  const theme = useTheme();

  const handleChange = useCallback((event: SelectChangeEvent<number[]>) => {
    const { target: { value } } = event;
    setSelected(
      // On autofill we get a stringified value
      typeof value === 'string' ? value.split(',').map(val => parseInt(val)) : value,
    );
  }, [setSelected]);

  return (
    <FormControl sx={{ m: 1, maxWidth: 500 }}>
      <InputLabel id="multiple-routes-label">Routes</InputLabel>
      <Select
        labelId="multiple-routes-label"
        id="multiple-routes"
        multiple
        value={selected}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-route" label="Route" />}
        renderValue={(selected: number[]) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((index: number) => {
              return (
                <Chip
                  key={index}
                  label={itemLabels[index]}
                />
              );
            })}
          </Box>
        )}
        MenuProps={
          {
            PaperProps: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
              },
            },
          }
        }
      >
        {itemLabels.map((label: string, i: number) => {
          return (
            <MenuItem
              key={label}
              value={i}
              style={getStyles(i, selected, theme)}
            >
              {label}
            </MenuItem>
          );
        })
        }
      </Select>
    </FormControl>
  );
}
