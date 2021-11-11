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
	subLinks: { title: string, onClick: () => void }[];
	icon: FunctionComponent;
	onClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
	return (
		<List onClick={onClick}>
			<ListItem button key={title}>
				<ListItemIcon>{React.createElement(icon)}</ListItemIcon>
				<ListItemText primary={title} />
			</ListItem>
			{isActive && subLinks.length > 0 &&
				<List>
					{subLinks.map(({ title, onClick }): JSX.Element => {
						return (
							<ListItem button key={title} onClick={onClick} sx={{ pl: 5 }}>
								<ListItemText primary={title} />
							</ListItem>
						);
					})}
				</List>
			}
		</List>
	);
}
