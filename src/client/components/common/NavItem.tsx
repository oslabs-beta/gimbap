import React, { FunctionComponent } from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export default function NavItem({
	isActive,
	title,
	subLinks,
	icon,
}: {
    isActive: boolean;
	title: string;
	subLinks: string[];
	icon: FunctionComponent;
}) {
	return (
		<List>
			<ListItem button key={title}>
				<ListItemIcon>{React.createElement(icon)}</ListItemIcon>
				<ListItemText primary={title} />
			</ListItem>
			{isActive &&
				<List>
					{subLinks.map((subLink: string) => {
						return (
							<ListItem button key={subLink} sx={{ pl: 10 }}>
								<ListItemText primary={subLink} />
							</ListItem>
						);
					})}
				</List>
			}
		</List>
	);
}
