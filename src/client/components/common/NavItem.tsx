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
	onClick,
}: {
	isActive: boolean;
	title: string;
	subLinks: string[];
	icon: FunctionComponent;
	onClick: () => void;
}) {
	return (
		<List onClick={onClick}>
			<ListItem button key={title}>
				<ListItemIcon>{React.createElement(icon)}</ListItemIcon>
				<ListItemText primary={title} />
			</ListItem>
			{isActive && subLinks.length > 0 &&
				<List>
					{subLinks.map((subLink: string) => {
						return (
							<ListItem button key={subLink} sx={{ pl: 5 }}>
								<ListItemText primary={subLink} />
							</ListItem>
						);
					})}
				</List>
			}
		</List>
	);
}
